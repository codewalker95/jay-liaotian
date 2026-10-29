/* ==========================================================================
   星轨观测局 · 公频实时群聊组件
   --------------------------------------------------------------------------
   使用：页面中放置
       <div id="starHallLiveChat" data-ws-url="wss://你的服务.onrender.com/ws"></div>
   然后引入 chat-widget.css 与本文件。
   说明：所有消息以服务器广播为准，前端不做乐观追加，避免重复。
   ========================================================================== */
(() => {
  'use strict';
  const MAX_USER = 16;
  const MAX_TEXT = 300;
  const RECONNECT_MAX_MS = 30000;
  const CONNECT_TIMEOUT_MS = 45000;
  function init() {
    const mount = document.getElementById('starHallLiveChat')
      || document.querySelector('[data-star-hall-live-chat]');
    if (!mount || mount.dataset.slcReady === '1') return;
    mount.dataset.slcReady = '1';
    const rawUrl = String(
      mount.dataset.wsUrl
      || window.STAR_HALL_WS_URL
      || ''
    ).trim();
    const wsUrl = rawUrl.replace(/\/+$/, '');
    const configured = /^wss?:\/\//i.test(wsUrl) && !/YOUR-SERVICE/i.test(wsUrl);
    // 若宿主页面使用星轨观测大厅的本地存档，自动带入当前观测代号。
    let savedUser = '';
    try {
      const hall = JSON.parse(window.localStorage.getItem('star-hall:v1') || 'null');
      if (hall && typeof hall.currentUser === 'string') savedUser = hall.currentUser;
    } catch (error) {
      // localStorage 被禁用时保持空值即可。
    }
    const presetUser = String(mount.dataset.user || savedUser || '').trim().slice(0, MAX_USER);
    mount.innerHTML = `
      <section class="sh-live-chat" aria-label="星轨公频实时群聊">
        <header class="slc-head">
          <div>
            <p class="slc-kicker">STARLANE PUBLIC CHANNEL</p>
            <h3 class="slc-title">星轨公频 · 实时群聊</h3>
            <p class="slc-sub">全员广播 · 每条消息附带服务器时间</p>
          </div>
          <span class="slc-status is-idle" data-slc-status>
            <i aria-hidden="true"></i><b>待连接</b>
          </span>
        </header>
        <div class="slc-toolbar">
          <span class="slc-toolbar-note">LIVE BROADCAST / 无历史记录</span>
          <button class="slc-reconnect" type="button" data-slc-reconnect>重新连接</button>
        </div>
        <div class="slc-log" data-slc-log aria-live="polite">
          <div class="slc-empty">
            尚未接入公频。<br>
            连接后，所有在线观测者的消息都会出现在这里。
          </div>
        </div>
        <form class="slc-composer" data-slc-form>
          <div class="slc-name-row">
            <label for="slcNameInput">观测代号</label>
            <input class="slc-input" id="slcNameInput" data-slc-name type="text"
              maxlength="${MAX_USER}" placeholder="输入你的观测代号" autocomplete="off" spellcheck="false">
          </div>
          <textarea class="slc-textarea" data-slc-message maxlength="${MAX_TEXT}" rows="2"
            placeholder="向全频道广播一条观测消息……"></textarea>
          <div class="slc-foot">
            <span class="slc-count" data-slc-count>0 / ${MAX_TEXT}</span>
            <button class="slc-send" type="submit" data-slc-send disabled>发送广播</button>
          </div>
          <p class="slc-hint">消息会广播给所有在线观测者；Render 免费实例休眠时，首连需等待冷启动。</p>
        </form>
      </section>
    `;
    const refs = {
      status: mount.querySelector('[data-slc-status]'),
      statusText: mount.querySelector('[data-slc-status] b'),
      log: mount.querySelector('[data-slc-log]'),
      reconnect: mount.querySelector('[data-slc-reconnect]'),
      form: mount.querySelector('[data-slc-form]'),
      name: mount.querySelector('[data-slc-name]'),
      message: mount.querySelector('[data-slc-message]'),
      count: mount.querySelector('[data-slc-count]'),
      send: mount.querySelector('[data-slc-send]')
    };
    refs.name.value = presetUser;
    const state = {
      ws: null,
      reconnectTimer: null,
      connectTimer: null,
      attempt: 0,
      generation: 0,
      closing: false
    };
    function setStatus(kind, label) {
      refs.status.classList.remove(
        'is-idle', 'is-online', 'is-connecting', 'is-offline', 'is-error'
      );
      refs.status.classList.add(`is-${kind}`);
      refs.statusText.textContent = label;
    }
    function setComposerEnabled(enabled) {
      refs.send.disabled = !enabled;
    }
    function formatServerTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '--:--:--';
      try {
        return new Intl.DateTimeFormat('zh-CN', {
          timeZone: 'Asia/Shanghai',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(date);
      } catch (error) {
        return date.toLocaleTimeString('zh-CN', { hour12: false });
      }
    }
    function scrollLogToBottom() {
      window.requestAnimationFrame(() => {
        refs.log.scrollTop = refs.log.scrollHeight;
      });
    }
    function clearEmptyState() {
      const empty = refs.log.querySelector('.slc-empty');
      if (empty) empty.remove();
    }
    function appendSystemMessage(text, serverTime, isWarning = false) {
      if (!text) return;
      clearEmptyState();
      const article = document.createElement('article');
      article.className = `slc-msg is-system${isWarning ? ' is-warn' : ''}`;
      const content = document.createElement('span');
      content.className = 'slc-system-text';
      content.textContent = text;
      article.appendChild(content);
      if (serverTime) {
        const time = document.createElement('span');
        time.className = 'slc-inline-time';
        time.textContent = ` · 服务器 ${formatServerTime(serverTime)}`;
        time.title = String(serverTime);
        article.appendChild(time);
      }
      refs.log.appendChild(article);
      scrollLogToBottom();
    }
    function appendBroadcast(data) {
      if (!data || typeof data.user !== 'string' || typeof data.text !== 'string') return;
      clearEmptyState();
      const name = data.user.slice(0, MAX_USER);
      const isOwn = refs.name.value.trim() === name;
      const article = document.createElement('article');
      article.className = `slc-msg${isOwn ? ' is-own' : ''}`;
      const head = document.createElement('div');
      head.className = 'slc-msg-head';
      const avatar = document.createElement('span');
      avatar.className = 'slc-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = Array.from(name)[0] || '?';
      const who = document.createElement('div');
      who.className = 'slc-who';
      const strong = document.createElement('strong');
      strong.textContent = name;
      const time = document.createElement('time');
      time.dateTime = data.server_time || '';
      time.title = data.server_time ? `服务器时间：${data.server_time}` : '';
      time.textContent = formatServerTime(data.server_time);
      const badge = document.createElement('span');
      badge.className = 'slc-badge';
      badge.textContent = isOwn ? '我' : '广播';
      who.appendChild(strong);
      who.appendChild(time);
      head.appendChild(avatar);
      head.appendChild(who);
      head.appendChild(badge);
      const body = document.createElement('p');
      body.className = 'slc-text';
      body.textContent = data.text;
      article.appendChild(head);
      article.appendChild(body);
      refs.log.appendChild(article);
      scrollLogToBottom();
    }
    function updateCount() {
      refs.count.textContent = `${refs.message.value.length} / ${MAX_TEXT}`;
    }
    function clearReconnectTimer() {
      if (state.reconnectTimer) {
        window.clearTimeout(state.reconnectTimer);
        state.reconnectTimer = null;
      }
    }
    function clearConnectTimer() {
      if (state.connectTimer) {
        window.clearTimeout(state.connectTimer);
        state.connectTimer = null;
      }
    }
    function scheduleReconnect() {
      if (state.closing || !configured || state.reconnectTimer) return;
      const delay = Math.min(RECONNECT_MAX_MS, 1500 * (2 ** Math.min(state.attempt, 5)));
      state.attempt += 1;
      setStatus('offline', `已断开 · ${Math.ceil(delay / 1000)}s 后重连`);
      setComposerEnabled(false);
      state.reconnectTimer = window.setTimeout(() => {
        state.reconnectTimer = null;
        connect();
      }, delay);
    }
    function connect() {
      if (!configured || state.closing) return;
      clearReconnectTimer();
      if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) {
        return;
      }
      const generation = ++state.generation;
      let socket;
      try {
        socket = new WebSocket(wsUrl);
      } catch (error) {
        setStatus('error', '地址无效');
        appendSystemMessage('WebSocket 地址格式不正确，请检查 data-ws-url。', null, true);
        scheduleReconnect();
        return;
      }
      state.ws = socket;
      setStatus('connecting', '连接中');
      setComposerEnabled(false);
      clearConnectTimer();
      state.connectTimer = window.setTimeout(() => {
        if (generation === state.generation && socket.readyState === WebSocket.CONNECTING) {
          try { socket.close(); } catch (error) { /* 关闭失败由 onclose 处理。 */ }
        }
      }, CONNECT_TIMEOUT_MS);
      socket.onopen = () => {
        if (generation !== state.generation) return;
        clearConnectTimer();
        state.attempt = 0;
        setStatus('online', '在线');
        setComposerEnabled(true);
        scrollLogToBottom();
      };
      socket.onmessage = (event) => {
        if (generation !== state.generation) return;
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          return;
        }
        if (!data || typeof data !== 'object') return;
        if (data.type === 'message') {
          appendBroadcast(data);
        } else if (data.type === 'system') {
          appendSystemMessage(data.text, data.server_time);
        } else if (data.type === 'error') {
          appendSystemMessage(data.message, data.server_time, true);
        }
      };
      socket.onerror = () => {
        if (generation !== state.generation) return;
        setStatus('error', '连接异常');
      };
      socket.onclose = (event) => {
        if (generation !== state.generation) return;
        clearConnectTimer();
        state.ws = null;
        setComposerEnabled(false);
        if (state.closing) return;
        if (event.code === 1008) {
          setStatus('error', '来源未授权');
          appendSystemMessage(
            'WebSocket 来源校验失败。请检查后端 ALLOWED_ORIGINS 是否包含当前页面域名。',
            null,
            true
          );
          return;
        }
        setStatus('offline', '已断开');
        scheduleReconnect();
      };
    }
    function reconnectNow() {
      if (!configured) {
        appendSystemMessage('尚未配置 WebSocket 地址，请填写 data-ws-url。', null, true);
        return;
      }
      clearReconnectTimer();
      state.attempt = 0;
      state.generation += 1;
      if (state.ws) {
        const old = state.ws;
        state.ws = null;
        old.onopen = null;
        old.onmessage = null;
        old.onerror = null;
        old.onclose = null;
        try { old.close(); } catch (error) { /* 已关闭。 */ }
      }
      connect();
    }
    function sendMessage() {
      if (!configured) {
        appendSystemMessage('尚未配置 WebSocket 地址，请填写 data-ws-url。', null, true);
        return;
      }
      if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
        setStatus('offline', '未连接');
        appendSystemMessage('当前未连接服务器，消息没有发送。', null, true);
        return;
      }
      const user = refs.name.value.trim().slice(0, MAX_USER);
      const text = refs.message.value.trim();
      if (!user) {
        refs.name.focus();
        appendSystemMessage('请先填写观测代号。', null, true);
        return;
      }
      if (!text) {
        refs.message.focus();
        appendSystemMessage('消息不能为空。', null, true);
        return;
      }
      if (text.length > MAX_TEXT) {
        appendSystemMessage(`消息不能超过 ${MAX_TEXT} 个字符。`, null, true);
        return;
      }
      try {
        state.ws.send(JSON.stringify({ user, text }));
        refs.message.value = '';
        updateCount();
        refs.message.focus();
      } catch (error) {
        appendSystemMessage('消息发送失败，请重试。', null, true);
      }
    }
    refs.form.addEventListener('submit', (event) => {
      event.preventDefault();
      sendMessage();
    });
    refs.message.addEventListener('input', updateCount);
    refs.message.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });
    refs.reconnect.addEventListener('click', reconnectNow);
    window.addEventListener('beforeunload', () => {
      state.closing = true;
      clearReconnectTimer();
      clearConnectTimer();
      if (state.ws) {
        state.ws.onclose = null;
        try { state.ws.close(); } catch (error) { /* 页面卸载。 */ }
      }
    });
    updateCount();
    if (!configured) {
      setStatus('idle', '待配置');
      appendSystemMessage(
        '请将挂载元素的 data-ws-url 改为 Render 提供的 wss://…/ws 地址后再刷新。',
        null,
        true
      );
      return;
    }
    connect();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
