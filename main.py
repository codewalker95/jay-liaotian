"""星轨观测局 · 公频群聊 WebSocket 后端。

Render 启动命令：
    uvicorn main:app --host 0.0.0.0 --port $PORT

本地启动：
    uvicorn main:app --reload

说明：
- 无数据库；连接和消息只保存在当前进程内存中，服务重启/休眠后会丢失。
- 仅使用 WebSocket 广播；所有在线客户端都会收到每条消息和服务器时间。
- WebSocket 握手不经过 CORS，因此除 CORSMiddleware 外，额外校验 Origin。
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("star-hall-chat")

MAX_USER_LENGTH = 16
MAX_MESSAGE_LENGTH = 300
MAX_FRAME_LENGTH = 4096

# 允许的页面来源。用户本次要求 jay-sysbureaua.asia；
# 同时保留上一版使用的 jay-sysbureau.asia，避免域名笔误导致无法连接。
# 可通过环境变量 ALLOWED_ORIGINS（逗号分隔）整体覆盖。
DEFAULT_ALLOWED_ORIGINS = [
    "https://jay-sysbureaua.asia",
    "https://www.jay-sysbureaua.asia",
    "https://jay-sysbureau.asia",
    "https://www.jay-sysbureau.asia",
    # 本地调试用；生产可删。
    "http://localhost:3000",
    "http://localhost:5500",
    "http://localhost:8000",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
]


def load_allowed_origins() -> set[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    origins = raw.split(",") if raw else DEFAULT_ALLOWED_ORIGINS
    return {origin.strip().rstrip("/") for origin in origins if origin.strip()}


ALLOWED_ORIGINS = load_allowed_origins()

app = FastAPI(title="Star Hall Live Chat", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(ALLOWED_ORIGINS),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def utc_now() -> str:
    """服务器 UTC 时间，ISO 8601，例如 2026-10-29T13:33:22.123Z。"""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def is_allowed_origin(origin: str | None) -> bool:
    # 浏览器一定带 Origin；非浏览器客户端可能不带，允许其连接。
    if not origin:
        return True
    return origin.rstrip("/") in ALLOWED_ORIGINS


class ConnectionManager:
    """进程内连接池：无数据库、无历史记录。"""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    @property
    def count(self) -> int:
        return len(self._connections)

    async def add(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.add(websocket)

    async def remove(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)

    async def send(self, websocket: WebSocket, payload: dict[str, Any]) -> None:
        """串行发送，避免同一连接被广播和错误回执同时写入。"""
        async with self._lock:
            await websocket.send_json(payload)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        async with self._lock:
            dead: list[WebSocket] = []
            for websocket in list(self._connections):
                try:
                    await websocket.send_json(payload)
                except Exception:
                    dead.append(websocket)
            for websocket in dead:
                self._connections.discard(websocket)


manager = ConnectionManager()


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "service": "star-hall-live-chat",
        "status": "ok",
        "websocket": "/ws",
        "server_time": utc_now(),
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"status": "ok", "connections": manager.count, "server_time": utc_now()}


def error_payload(message: str) -> dict[str, Any]:
    return {"type": "error", "message": message, "server_time": utc_now()}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    origin = websocket.headers.get("origin")
    if not is_allowed_origin(origin):
        logger.warning("Rejected websocket origin: %s", origin)
        await websocket.close(code=1008)
        return

    await websocket.accept()

    # 先发送欢迎帧，再加入广播池，避免握手阶段同一连接被并发写入。
    await websocket.send_json(
        {
            "type": "system",
            "text": "已连接星轨公频，消息将广播给所有在线观测者。",
            "server_time": utc_now(),
        }
    )
    await manager.add(websocket)

    try:
        while True:
            raw = await websocket.receive_text()

            if len(raw) > MAX_FRAME_LENGTH:
                await manager.send(websocket, error_payload("消息数据过长。"))
                continue

            try:
                data = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                await manager.send(websocket, error_payload("消息格式必须是 JSON。"))
                continue

            if not isinstance(data, dict):
                await manager.send(websocket, error_payload("消息格式不正确。"))
                continue

            user = str(data.get("user", "")).strip()
            text = str(data.get("text", "")).strip()

            if not user:
                await manager.send(websocket, error_payload("观测代号不能为空。"))
                continue
            if len(user) > MAX_USER_LENGTH:
                await manager.send(websocket, error_payload(f"观测代号不能超过 {MAX_USER_LENGTH} 个字符。"))
                continue
            if not text:
                await manager.send(websocket, error_payload("消息不能为空。"))
                continue
            if len(text) > MAX_MESSAGE_LENGTH:
                await manager.send(websocket, error_payload(f"消息不能超过 {MAX_MESSAGE_LENGTH} 个字符。"))
                continue

            await manager.broadcast(
                {
                    "type": "message",
                    "id": uuid.uuid4().hex,
                    "user": user,
                    "text": text,
                    "server_time": utc_now(),
                }
            )

    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("WebSocket connection error")
    finally:
        await manager.remove(websocket)
        logger.info("WebSocket disconnected; %s active", manager.count)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )
