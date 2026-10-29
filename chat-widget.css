/* ==========================================================================
   星轨观测局 · 公频实时群聊组件
   作用域：.sh-live-chat（不会影响宿主页面其他模块）
   配色：深色夜空 + 蓝色 / 浅青星光
   ========================================================================== */
.sh-live-chat,
.sh-live-chat *{box-sizing:border-box}
.sh-live-chat [hidden]{display:none!important}
.sh-live-chat{
  --slc-bg:#040c16;
  --slc-panel:rgba(7,20,33,.84);
  --slc-panel-2:rgba(4,13,23,.70);
  --slc-line:rgba(132,190,214,.16);
  --slc-line-strong:rgba(132,190,214,.30);
  --slc-ink:#e9f7fb;
  --slc-soft:#c4d9e2;
  --slc-muted:#8399a9;
  --slc-dim:#566c7d;
  --slc-cyan:#7ee3e0;
  --slc-blue:#7faaff;
  --slc-danger:#ff9b9b;
  --slc-display:"Bahnschrift SemiLight","Bahnschrift","DIN Alternate","PingFang SC","Microsoft YaHei",sans-serif;
  --slc-sans:"Segoe UI Variable Text","Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  --slc-mono:"Cascadia Mono","SFMono-Regular","Consolas",monospace;
  position:relative;
  width:100%;
  color:var(--slc-ink);
  font-family:var(--slc-sans);
  font-size:12px;
  line-height:1.65;
  border:1px solid var(--slc-line);
  border-radius:14px;
  background:
    radial-gradient(ellipse 60% 80% at 100% 0%, rgba(126,227,224,.055), transparent 60%),
    linear-gradient(145deg, rgba(10,27,42,.88), rgba(3,10,18,.94));
  box-shadow:0 20px 60px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.025);
  overflow:hidden;
}
.sh-live-chat::before{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background-image:
    radial-gradient(circle at 11% 14%, rgba(185,238,255,.55) 0 1px, transparent 1.5px),
    radial-gradient(circle at 72% 26%, rgba(126,227,224,.36) 0 1px, transparent 1.5px),
    radial-gradient(circle at 91% 63%, rgba(127,170,255,.35) 0 1px, transparent 1.5px),
    radial-gradient(circle at 38% 84%, rgba(185,238,255,.26) 0 1px, transparent 1.5px);
  background-size:270px 230px, 360px 300px, 430px 360px, 310px 280px;
  opacity:.45;
}
.sh-live-chat::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(139,188,216,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,188,216,.035) 1px, transparent 1px);
  background-size:78px 78px;
  -webkit-mask-image:radial-gradient(ellipse 70% 60% at 55% 25%, #000 4%, transparent 76%);
          mask-image:radial-gradient(ellipse 70% 60% at 55% 25%, #000 4%, transparent 76%);
  opacity:.6;
}
.sh-live-chat > *{position:relative;z-index:1}
/* ------------------------------- 顶部 ------------------------------- */
.slc-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  padding:16px 17px 13px;
  border-bottom:1px solid var(--slc-line);
  background:linear-gradient(180deg, rgba(8,23,36,.52), rgba(4,13,23,.08));
}
.slc-kicker{
  margin:0;
  font-family:var(--slc-mono);
  font-size:7px;
  letter-spacing:.15em;
  color:var(--slc-dim);
}
.slc-title{
  margin:4px 0 0;
  font-family:var(--slc-display);
  font-size:21px;
  font-weight:300;
  letter-spacing:.06em;
  line-height:1.25;
  color:var(--slc-ink);
}
.slc-sub{
  margin:5px 0 0;
  font-size:9px;
  color:var(--slc-muted);
}
.slc-status{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:25px;
  flex:0 0 auto;
  padding:0 9px;
  border:1px solid var(--slc-line);
  border-radius:99px;
  background:rgba(2,9,16,.52);
  color:var(--slc-muted);
  font-family:var(--slc-mono);
  font-size:7px;
  letter-spacing:.05em;
  white-space:nowrap;
}
.slc-status i{
  width:5px;height:5px;
  flex:0 0 auto;
  border-radius:50%;
  background:var(--slc-dim);
  box-shadow:0 0 0 transparent;
}
.slc-status.is-online{color:#a9f0df;border-color:rgba(126,227,224,.24)}
.slc-status.is-online i{background:var(--slc-cyan);box-shadow:0 0 9px rgba(126,227,224,.8)}
.slc-status.is-connecting{color:#c8dbff;border-color:rgba(127,170,255,.22)}
.slc-status.is-connecting i{background:var(--slc-blue);animation:slc-pulse 1.2s ease-in-out infinite}
.slc-status.is-offline{color:#ffd0a0;border-color:rgba(255,196,118,.2)}
.slc-status.is-offline i{background:#ffc66e}
.slc-status.is-error{color:#ffbab8;border-color:rgba(255,155,155,.22)}
.slc-status.is-error i{background:var(--slc-danger)}
.slc-status.is-idle{color:var(--slc-dim)}
@keyframes slc-pulse{0%,100%{opacity:.38}50%{opacity:1}}
/* ---------------------------- 连接工具条 ---------------------------- */
.slc-toolbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:7px 17px;
  border-bottom:1px solid rgba(168,206,226,.07);
  background:rgba(2,8,14,.20);
}
.slc-toolbar-note{
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-family:var(--slc-mono);
  font-size:6.5px;
  letter-spacing:.07em;
  color:var(--slc-dim);
}
.slc-toolbar-note::before{
  content:"";
  width:4px;height:4px;
  border-radius:50%;
  background:var(--slc-cyan);
  opacity:.65;
}
.slc-reconnect{
  min-height:25px;
  padding:0 8px;
  border:1px solid var(--slc-line);
  border-radius:5px;
  background:rgba(168,206,226,.035);
  color:var(--slc-muted);
  font-family:var(--slc-sans);
  font-size:8px;
  transition:background .2s,border-color .2s,color .2s;
}
.slc-reconnect:hover:not(:disabled){border-color:var(--slc-line-strong);background:rgba(126,227,224,.06);color:var(--slc-ink)}
.slc-reconnect:disabled{opacity:.35;cursor:not-allowed}
/* ------------------------------- 消息区 ------------------------------- */
.slc-log{
  height:350px;
  overflow-y:auto;
  overscroll-behavior:contain;
  padding:12px 14px;
  scrollbar-color:rgba(126,227,224,.22) transparent;
}
.slc-log::-webkit-scrollbar{width:5px}
.slc-log::-webkit-scrollbar-thumb{background:rgba(126,227,224,.17);border-radius:6px}
.slc-empty{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:5px;
  height:100%;
  min-height:160px;
  text-align:center;
  color:var(--slc-dim);
  font-size:9px;
  line-height:1.8;
}
.slc-empty::before{
  content:"✦";
  display:grid;place-items:center;
  width:30px;height:30px;
  border:1px solid var(--slc-line);
  border-radius:50%;
  color:rgba(126,227,224,.50);
  font-size:12px;
}
.slc-msg{
  margin:0 0 9px;
  padding:10px 11px;
  border:1px solid rgba(132,190,214,.11);
  border-radius:9px;
  background:rgba(6,19,31,.58);
}
.slc-msg:last-child{margin-bottom:0}
.slc-msg.is-own{
  border-color:rgba(126,227,224,.19);
  background:linear-gradient(120deg, rgba(126,227,224,.06), rgba(6,19,31,.60));
}
.slc-msg.is-system{
  padding:6px 9px;
  border:0;
  background:transparent;
  text-align:center;
  color:var(--slc-dim);
  font-size:8.5px;
  line-height:1.7;
}
.slc-msg.is-system.is-warn{color:#ffb6b4}
.slc-msg-head{display:flex;align-items:center;gap:7px;min-width:0}
.slc-avatar{
  width:24px;height:24px;
  flex:0 0 auto;
  display:grid;place-items:center;
  border:1px solid rgba(126,227,224,.17);
  border-radius:50%;
  background:rgba(126,227,224,.055);
  color:var(--slc-cyan);
  font-family:var(--slc-display);
  font-size:10px;
}
.slc-who{display:flex;align-items:baseline;gap:7px;min-width:0}
.slc-who strong{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:10px;
  font-weight:400;
  color:var(--slc-soft);
}
.slc-who time{
  flex:0 0 auto;
  font-family:var(--slc-mono);
  font-size:6.5px;
  color:var(--slc-dim);
  white-space:nowrap;
}
.slc-who time::before{content:"服务器 ";opacity:.72}
.slc-badge{
  margin-left:auto;
  flex:0 0 auto;
  padding:1px 5px;
  border:1px solid rgba(126,227,224,.12);
  border-radius:4px;
  font-family:var(--slc-mono);
  font-size:5.5px;
  letter-spacing:.05em;
  color:rgba(126,227,224,.62);
}
.slc-text{
  margin:7px 0 0 31px;
  color:var(--slc-soft);
  font-size:11.5px;
  line-height:1.8;
  white-space:pre-wrap;
  word-break:break-word;
}
.slc-system-text{white-space:pre-wrap;word-break:break-word}
.slc-inline-time{
  font-family:var(--slc-mono);
  font-size:6.5px;
  color:var(--slc-dim);
  white-space:nowrap;
}
/* ------------------------------- 输入区 ------------------------------- */
.slc-composer{
  display:grid;
  gap:7px;
  padding:11px 13px 13px;
  border-top:1px solid var(--slc-line);
  background:rgba(2,9,16,.40);
}
.slc-name-row{display:flex;align-items:center;gap:8px;min-width:0}
.slc-name-row label{
  flex:0 0 auto;
  font-family:var(--slc-mono);
  font-size:6.5px;
  letter-spacing:.08em;
  color:var(--slc-dim);
}
.slc-input,.slc-textarea{
  width:100%;
  border:1px solid var(--slc-line);
  border-radius:6px;
  background:rgba(2,9,16,.58);
  color:var(--slc-ink);
  font-family:var(--slc-sans);
  font-size:11px;
  line-height:1.6;
  outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.slc-input{height:29px;padding:0 8px}
.slc-textarea{min-height:56px;padding:7px 8px;resize:vertical}
.slc-input::placeholder,.slc-textarea::placeholder{color:rgba(83,105,124,.82)}
.slc-input:focus,.slc-textarea:focus{border-color:rgba(126,227,224,.44);box-shadow:0 0 0 3px rgba(126,227,224,.05);background:rgba(5,17,27,.76)}
.slc-input:disabled,.slc-textarea:disabled{opacity:.48;cursor:not-allowed}
.slc-foot{display:flex;align-items:center;justify-content:space-between;gap:10px}
.slc-count{font-family:var(--slc-mono);font-size:6.5px;color:var(--slc-dim)}
.slc-send{
  min-width:72px;
  min-height:30px;
  padding:0 13px;
  border:1px solid rgba(126,227,224,.28);
  border-radius:6px;
  background:linear-gradient(100deg,rgba(126,227,224,.16),rgba(126,227,224,.045));
  color:#efffff;
  font-family:var(--slc-sans);
  font-size:9px;
  letter-spacing:.04em;
  transition:background .2s,border-color .2s,transform .2s,opacity .2s;
}
.slc-send:hover:not(:disabled){border-color:rgba(126,227,224,.55);background:rgba(126,227,224,.14);transform:translateY(-1px)}
.slc-send:disabled{opacity:.38;cursor:not-allowed;transform:none}
.slc-hint{
  margin:0;
  font-size:8px;
  line-height:1.7;
  color:var(--slc-dim);
}
/* ------------------------------- 移动端 ------------------------------- */
@media (max-width:640px){
  .slc-head{padding:14px 13px 11px;gap:10px}
  .slc-title{font-size:18px}
  .slc-sub{font-size:8px}
  .slc-toolbar{padding:7px 13px}
  .slc-log{height:300px;padding:10px 10px}
  .slc-composer{padding:10px}
  .slc-text{margin-left:0;font-size:11px}
  .slc-badge{display:none}
  .slc-status{font-size:6px;padding:0 7px}
}
@media (prefers-reduced-motion:reduce){
  .sh-live-chat *,.sh-live-chat *::before,.sh-live-chat *::after{transition-duration:.01ms!important;animation-duration:.01ms!important}
}
