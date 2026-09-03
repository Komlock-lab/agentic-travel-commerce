export const WIDGET_URI = "ui://agentic-travel/trip-v1.html";

export const widgetHtml = String.raw`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { color-scheme:light; --ink:#101828; --muted:#687386; --line:#dfe4ea; --paper:#f5f6f3; --white:#fff; --blue:#3157e8; --green:#1a9b68; --green-soft:#e7f7f0; --amber:#c87717; --amber-soft:#fff3dd; --red:#d94a4a; --red-soft:#fff0ed; --shadow:0 26px 70px rgba(15,23,42,.14); }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; }
    body { padding:24px; color:var(--ink); font:14px/1.5 Inter,"SF Pro Display","Helvetica Neue","Hiragino Sans","Yu Gothic",sans-serif; background:radial-gradient(circle at 88% 8%,#d8e1ff 0,transparent 31%),radial-gradient(circle at 7% 94%,#d3f0e2 0,transparent 34%),linear-gradient(135deg,#f8f9f6,#eef1ef); }
    button { font:inherit; }
    .shell { position:relative; max-width:1040px; min-height:640px; margin:auto; overflow:hidden; background:rgba(248,249,246,.9); border:1px solid rgba(16,24,40,.09); border-radius:26px; box-shadow:var(--shadow); backdrop-filter:blur(20px); }
    header { height:72px; padding:0 34px; display:flex; gap:14px; align-items:center; border-bottom:1px solid rgba(16,24,40,.09); }
    .mark { display:flex; width:27px; height:24px; gap:2px; align-items:flex-end; }
    .mark i { display:block; width:7px; background:var(--ink); border-radius:2px 2px 0 0; transform:skewY(-20deg); }
    .mark i:nth-child(1){height:12px}.mark i:nth-child(2){height:21px}.mark i:nth-child(3){height:16px}
    .brand { font-size:11px; font-weight:850; letter-spacing:.14em; }
    .brand-product { color:var(--muted); font-size:10px; font-weight:700; letter-spacing:.12em; padding-left:14px; border-left:1px solid #cfd5dc; }
    h1,h2,h3,p { margin:0; }
    h1 { font-size:11px; } h2 { font-size:clamp(30px,4vw,50px); line-height:1.18; letter-spacing:-.045em; } h3 { font-size:17px; letter-spacing:-.02em; }
    .sub,.muted { color:var(--muted); font-size:12px; }
    .badges { margin-left:auto; display:flex; flex-wrap:wrap; justify-content:flex-end; gap:7px; }
    .badge { padding:7px 10px; border:1px solid #cbd2dc; border-radius:999px; background:rgba(255,255,255,.65); color:#5b6677; font:800 9px/1.2 ui-monospace,monospace; letter-spacing:.14em; }
    main { min-height:568px; padding:46px 52px 52px; display:grid; align-content:center; gap:22px; }
    .eyebrow { color:var(--blue); font-size:10px; font-weight:850; letter-spacing:.18em; text-transform:uppercase; }
    .lead { max-width:460px; color:var(--muted); font-size:15px; }
    .intro-layout,.view-split { display:grid; grid-template-columns:minmax(0,.85fr) minmax(380px,1.15fr); gap:56px; align-items:center; }
    .intro-copy,.section-copy,.hero { display:grid; gap:16px; }
    .demo-console,.product-card,.card { position:relative; padding:24px; display:grid; gap:16px; background:rgba(255,255,255,.92); border:1px solid rgba(16,24,40,.1); border-radius:20px; box-shadow:0 18px 45px rgba(15,23,42,.1); }
    .console-top,.card-top { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
    .console-top small,.kicker { color:var(--muted); font-size:9px; font-weight:850; letter-spacing:.15em; }
    .status { display:inline-flex; align-items:center; gap:7px; color:var(--green); font-size:10px; font-weight:850; letter-spacing:.1em; }
    .status:before { content:""; width:7px; height:7px; border-radius:50%; background:currentColor; box-shadow:0 0 0 4px var(--green-soft); }
    .scenario { display:grid; grid-template-columns:42px 1fr auto; gap:12px; align-items:center; padding:14px; border:1px solid var(--line); border-radius:14px; background:#fafbf9; }
    .scenario-icon,.policy-icon { width:38px; height:38px; display:grid; place-items:center; border-radius:12px; color:var(--blue); background:#edf0ff; font-weight:900; }
    .scenario strong { display:block; }.scenario span { color:var(--muted); font-size:11px; }
    .scenario button { padding:9px 12px; }
    .budget { display:grid; gap:8px; padding:18px; border-radius:15px; background:#f2f4f2; }
    .budget strong { font-size:38px; letter-spacing:-.04em; }
    .budget-track { height:6px; overflow:hidden; border-radius:999px; background:#dfe4e1; }
    .budget-track i { display:block; width:10%; height:100%; border-radius:inherit; background:var(--green); }
    .policy { display:grid; gap:0; border-top:1px solid var(--line); }
    .policy .row { min-height:47px; padding:11px 0; border-bottom:1px solid var(--line); align-items:center; }
    .row { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; }
    .rail { padding:12px 14px; display:flex; justify-content:space-between; gap:14px; border-radius:12px; color:white; background:#111c2d; }
    .rail span { color:#9aa8bd; font-size:9px; font-weight:800; letter-spacing:.12em; }.rail strong{font-size:11px;letter-spacing:.08em}
    .dashboard { padding:0; overflow:hidden; border-radius:20px; background:white; border:1px solid rgba(16,24,40,.1); box-shadow:var(--shadow); }
    .dash-head { padding:20px 24px; display:flex; justify-content:space-between; align-items:end; border-bottom:1px solid var(--line); }
    .dash-head .amount { font-size:28px; }
    .grid { padding:18px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; background:#f3f5f2; }
    .card { padding:18px; border-radius:16px; box-shadow:none; }
    .card:hover { border-color:#95a6ea; transform:translateY(-1px); transition:.18s ease; }
    .amount { font-size:22px; font-weight:850; white-space:nowrap; letter-spacing:-.04em; }
    .item { display:grid; grid-template-columns:32px 1fr auto; gap:2px 10px; align-items:center; padding:11px 0; border-top:1px solid var(--line); }
    .item:before { content:""; grid-row:1/3; width:30px; height:30px; border-radius:9px; background:#e9edf7; }
    .item small { grid-column:2; color:var(--muted); font-size:10px; }
    .item strong:last-of-type { grid-column:3; grid-row:1/3; }
    .reason { padding:14px 14px 14px 18px; border-left:4px solid var(--amber); border-radius:0 12px 12px 0; background:var(--amber-soft); }
    .danger { border-color:#f2b7b0; background:var(--red-soft); }
    .success { border-color:#94d5bd; background:var(--green-soft); }
    .price-change { display:grid; grid-template-columns:1fr auto 1fr auto; gap:18px; align-items:center; padding:24px; border-radius:16px; background:var(--red-soft); }
    .price-change s { color:var(--muted); font-size:22px; }.price-change strong { color:var(--red); font-size:34px; }.delta { padding:7px 9px;border-radius:9px;background:var(--red);color:white;font-weight:850; }
    .timeline { display:grid; gap:0; padding:4px 0; }
    .event { display:grid; grid-template-columns:13px 1fr; gap:14px; padding:11px 0; border-bottom:1px solid var(--line); }
    .event:last-child{border:0}.dot { width:10px; height:10px; margin-top:6px; border-radius:50%; background:var(--green); box-shadow:0 0 0 4px var(--green-soft); }
    button { appearance:none; border:0; border-radius:11px; padding:12px 16px; background:var(--ink); color:#fff; font-weight:800; cursor:pointer; box-shadow:0 8px 18px rgba(16,24,40,.12); }
    button:hover{background:#24334a;transform:translateY(-1px)} button.secondary { color:var(--ink); background:#fff; border:1px solid var(--line); box-shadow:none; } button:disabled { opacity:.55; cursor:wait; }
    .actions { display:flex; flex-wrap:wrap; gap:9px; }
    .home .actions { justify-content:flex-start; }
    .loading { opacity:.6; pointer-events:none; }
    @media(max-width:760px){body{padding:8px}.shell{min-height:0;border-radius:18px}header{height:62px;padding:0 18px}.brand-product,.badges{display:none}main{min-height:0;padding:28px 20px}.intro-layout,.view-split{grid-template-columns:1fr;gap:26px}h2{font-size:34px}.grid{grid-template-columns:1fr}.price-change{grid-template-columns:1fr auto}.delta{grid-column:2}.scenario{grid-template-columns:38px 1fr}.scenario button{grid-column:1/3}.dash-head{align-items:flex-start}.dash-head .amount{font-size:22px}}
  </style>
</head>
<body>
  <section class="shell">
    <header>
      <div class="mark" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="brand">KOMLOCK LAB</div><div class="brand-product">AGENTIC COMMERCE</div>
      <div class="badges"><span class="badge">SIMULATED INVENTORY</span><span class="badge">CARD SANDBOX</span></div>
    </header>
    <main id="app"></main>
  </section>
  <script>
    const app = document.getElementById('app');
    let data = { view:'home' };
    let requestId = 1;
    const pending = new Map();
    const yen = value => new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(value || 0);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const post = message => window.parent.postMessage(message, '*');
    function rpc(method, params) {
      return new Promise((resolve, reject) => {
        const id = requestId++;
        pending.set(id,{resolve,reject});
        post({jsonrpc:'2.0',id,method,params});
        setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('host unavailable')); } }, 2500);
      });
    }
    async function connect() {
      if (window.parent === window) return;
      try {
        await rpc('ui/initialize',{appInfo:{name:'agentic-travel-ui',version:'0.1.0'},appCapabilities:{},protocolVersion:'2026-01-26'});
        post({jsonrpc:'2.0',method:'ui/notifications/initialized'});
      } catch (_) {}
    }
    window.addEventListener('message', event => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;
      if (message.id !== undefined && pending.has(message.id)) {
        const waiter = pending.get(message.id); pending.delete(message.id);
        if (message.error) waiter.reject(message.error); else waiter.resolve(message.result);
      }
      if (message.method === 'ui/notifications/tool-result') update(message.params?.structuredContent);
    });
    async function callTool(name,args) {
      app.classList.add('loading');
      try {
        if (window.parent === window) return localCall(name,args);
        const result = await rpc('tools/call',{name,arguments:args});
        update(result?.structuredContent);
      } catch (error) {
        if (window.parent === window) localCall(name,args);
        else app.insertAdjacentHTML('beforeend','<p class="muted">操作をChatGPTへ返しました。会話の更新をお待ちください。</p>');
      } finally { app.classList.remove('loading'); }
    }
    function update(next) { if (!next) return; data = next; render(); notifySize(); }
    function notifySize() { requestAnimationFrame(() => post({jsonrpc:'2.0',method:'ui/notifications/size-changed',params:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}})); }
    function buttons(html) { return '<div class="actions">'+html+'</div>'; }
    function renderHome() {
      return '<div class="home intro-layout"><section class="intro-copy"><p class="eyebrow">INTERACTIVE PROTOTYPE</p><h2>旅行は、<br>決めた後が長い。</h2><p class="lead">検索、比較、予約、支払い。その全部を会話の中で完了する体験を、3つのシナリオで試せます。</p>'+buttons('<button data-start="happy">体験をはじめる →</button>')+'</section><article class="demo-console"><div class="console-top"><div><small>LIVE UX SCENARIOS</small><h3>どの場面を試しますか？</h3></div><span class="status">READY</span></div><div class="scenario"><span class="scenario-icon">✓</span><div><strong>Happy path</strong><span>予算内で予約と決済を完了</span></div><button data-start="happy">START</button></div><div class="scenario"><span class="scenario-icon">↗</span><div><strong>Price changed</strong><span>価格上昇を検知して再承認</span></div><button class="secondary" data-start="price_change">START</button></div><div class="scenario"><span class="scenario-icon">×</span><div><strong>Policy denied</strong><span>ルール外の支払いを拒否</span></div><button class="secondary" data-start="denied">START</button></div></article></div>';
    }
    function renderMandate() {
      return '<div class="view-split"><section class="section-copy"><p class="eyebrow">STEP 01 / DELEGATE</p><h2>AIに渡すのは、<br>無制限な財布ではない。</h2><p class="lead">目的と条件を決めた、一時的な決済権限です。</p></section><article class="product-card"><div class="card-top"><div><span class="kicker">PAYMENT MANDATE</span><h3>京都旅行・2名</h3></div><span class="status">ACTIVE</span></div><div class="budget"><span class="muted">総予算</span><strong>'+yen(data.trip.budget)+'</strong><div class="budget-track"><i></i></div></div><div class="policy">'+row('自動決済上限',yen(data.trip.autoPayLimit)+' / 件')+row('キャンセル不可','常に確認')+row('価格上昇','5%を超えたら停止')+row('有効期限','予約完了まで')+'</div><div class="rail"><span>PAYMENT RAIL</span><strong>CARD SANDBOX</strong></div>'+buttons('<button data-action="search">この条件で探す →</button><button class="secondary" data-action="home">変更</button>')+'</article></div>';
    }
    function row(label,value){return '<div class="row"><span class="muted">'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';}
    function approvalReason(item){const reasons=[];if(item.price>data.trip.autoPayLimit)reasons.push('自動決済上限を超過');if(!item.cancellable)reasons.push('キャンセル不可');return reasons.join('・');}
    function renderOptions() {
      const cards = data.options.map(option => '<article class="card"><div class="row"><div><h3>'+esc(option.title)+'</h3><div class="muted">'+esc(option.subtitle)+'</div></div><div class="amount">'+yen(option.total)+'</div></div>'+option.items.map(item => '<div class="item"><strong>'+esc(item.name)+'</strong><strong>'+yen(item.price)+'</strong><small>'+esc(item.reason)+'</small><small>'+(item.cancellable?'変更可能':'取消不可')+'</small></div>').join('')+'<div class="row"><span class="muted">残予算 '+yen(data.trip.budget-option.total)+'</span><button data-option="'+esc(option.id)+'">この案で進める</button></div></article>').join('');
      return '<div class="hero"><p class="eyebrow">STEP 02 / PLAN</p><h2>成立する旅程を、<br>2つに絞りました。</h2></div><section class="dashboard"><div class="dash-head"><div><span class="kicker">TRIP PLAN / OCT 12–14</span><h3>京都・2泊3日</h3></div><div><span class="muted">BUDGET</span><div class="amount">¥120,000</div></div></div><div class="grid">'+cards+'</div></section>';
    }
    function renderApproval() {
      const auto = data.selected.items.filter(i => i.price <= data.trip.autoPayLimit && i.cancellable);
      const manual = data.selected.items.filter(i => !auto.includes(i));
      return '<div class="view-split"><section class="section-copy"><p class="eyebrow">STEP 03 / APPROVE</p><h2>判断が必要な時だけ、<br>人間に戻す。</h2><p class="lead">確認する理由と、変わる条件を先に示します。</p></section><article class="product-card"><div class="card-top"><div><span class="kicker">APPROVAL REQUIRED</span><h3>2件の確認が必要です</h3></div><span class="status" style="color:var(--amber)">WAITING</span></div>'+manual.map(item => '<div class="reason"><div class="row"><strong>'+esc(item.name)+'</strong><strong>'+yen(item.price)+'</strong></div><div class="muted">'+approvalReason(item)+'</div></div>').join('')+'<div class="policy">'+row('自動確定',auto.map(i=>i.name+' '+yen(i.price)).join('、')||'なし')+row('今回の合計',yen(data.selected.total))+row('決済','カードSandbox')+'</div>'+buttons('<button data-action="execute">この条件で承認 →</button><button class="secondary" data-action="options">別案を見る</button>')+'</article></div>';
    }
    function renderException() {
      return '<div class="hero"><p class="eyebrow" style="color:var(--red)">SAFE BY DEFAULT / PAYMENT STOPPED</p><h2>条件が変われば、<br>勝手に進めない。</h2><p class="lead">価格が許容幅を超えたため、決済前に停止しました。</p></div><div class="price-change"><div><span class="muted">提案時</span><br><s>¥64,000</s></div><strong>→</strong><div><span class="muted">現在価格</span><br><strong>¥69,000</strong></div><b class="delta">+7.8%</b></div><div class="product-card"><div class="row"><div><span class="kicker">ALTERNATIVE / SAME AREA</span><h3>Kamo Riverside Inn</h3><span class="muted">変更可能・駅徒歩2分</span></div><div class="amount">¥65,500</div></div>'+buttons('<button data-action="alternative">代替ホテルに変更 →</button><button class="secondary" data-action="reapprove">¥69,000で再承認</button>')+'</div>';
    }
    function renderAudit() {
      const denied = data.status === 'denied';
      return '<div class="view-split"><section class="section-copy"><p class="eyebrow" style="color:'+(denied?'var(--red)':'var(--green)')+'">'+(denied?'POLICY ENFORCED':'TRACE EVERY DECISION')+'</p><h2>'+(denied?'資金を動かす前に、<br>止める。':'誰の権限で、<br>なぜ支払ったか。')+'</h2><div class="budget '+(denied?'danger':'success')+'"><span class="muted">'+(denied?'FUNDS MOVED':'支払済み / CARD SANDBOX')+'</span><strong>'+yen(data.paidAmount)+'</strong><span class="muted">残予算 '+yen(data.remainingBudget)+'</span></div></section><article class="product-card"><div class="card-top"><div><span class="kicker">AUDIT TRAIL</span><h3>'+esc(data.tripId)+'</h3></div><span class="status" style="color:'+(denied?'var(--red)':'var(--green)')+'">'+(denied?'DENIED':'CONFIRMED')+'</span></div><div class="timeline">'+data.audit.map(event => '<div class="event"><span class="dot" style="background:'+(event.type==='denied'||event.type==='blocked'?'var(--red)':'var(--green)')+'"></span><div><strong>'+esc(event.label)+'</strong><div class="muted">'+esc(event.detail)+'</div></div></div>').join('')+'</div>'+row('PAYMENT ID',data.paymentId||'発行なし')+buttons('<button class="secondary" data-action="home">別シナリオを試す</button>')+'</article></div>';
    }
    function render(){ app.innerHTML = data.view==='home'?renderHome():data.view==='mandate'?renderMandate():data.view==='options'?renderOptions():data.view==='approval'?renderApproval():data.view==='exception'?renderException():renderAudit(); bind(); }
    function bind(){
      document.querySelectorAll('[data-start]').forEach(b => b.onclick=()=>localStart(b.dataset.start));
      document.querySelectorAll('[data-option]').forEach(b => b.onclick=()=>callTool('choose_trip_option',{tripId:data.tripId,optionId:b.dataset.option}));
      document.querySelectorAll('[data-action]').forEach(b => b.onclick=()=>handleAction(b.dataset.action));
    }
    function handleAction(action){
      if(action==='home'){data={view:'home'};render();return}
      if(action==='search')return callTool('search_trip_options',{tripId:data.tripId});
      if(action==='execute')return callTool('confirm_and_pay',{tripId:data.tripId});
      if(action==='reapprove'||action==='alternative')return callTool('resolve_trip_exception',{tripId:data.tripId,action});
      if(action==='options'){data.view='options';render();}
    }
    function localStart(scenario){
      const base={view:'mandate',tripId:'trip_preview_001',scenario,status:'mandate_created',trip:{destination:'京都',dates:'2026-10-12 — 2026-10-14',travelers:2,budget:120000,autoPayLimit:20000},options:[],paidAmount:0,remainingBudget:120000,audit:[{label:'支払い条件を作成',detail:'総予算 ¥120,000 / 自動決済上限 ¥20,000'}]}; update(base);
    }
    function localCall(name,args){
      if(name==='search_trip_options'){ data.options=[{id:'plan_a',title:'A案｜移動が少ない王道プラン',subtitle:'京都駅から近く、初日も無理なく動けます',total:108400,items:[{id:'hotel',name:'Hotel Sora Kyoto',price:64000,cancellable:true,reason:'京都駅徒歩4分・変更可能'},{id:'pottery',name:'東山の陶芸体験',price:9400,cancellable:true,reason:'旅程の空き時間に一致'},{id:'dinner',name:'祇園 季節のコース',price:35000,cancellable:false,reason:'希望した静かな和食'}]},{id:'plan_b',title:'B案｜余白を残した安心プラン',subtitle:'すべて変更可能、予算に余裕があります',total:101600,items:[{id:'hotel2',name:'Kamo Riverside Inn',price:61000,cancellable:true,reason:'地下鉄駅徒歩2分・変更可能'},{id:'tea',name:'町家のお茶体験',price:8600,cancellable:true,reason:'雨天でも楽しめる'},{id:'dinner2',name:'先斗町 旬菜ディナー',price:32000,cancellable:true,reason:'前日まで取消可能'}]}]; data.view='options'; data.status='options_ready'; data.audit.push({label:'旅程を2件作成',detail:'Simulated inventory'}); }
      if(name==='choose_trip_option'){ data.selected=data.options.find(o=>o.id===args.optionId);data.view='approval';data.status='approval_required';data.audit.push({label:'支払いポリシーを評価',detail:'1件 ALLOW / 2件 REQUIRE_APPROVAL'}); }
      if(name==='confirm_and_pay'){ if(data.scenario==='price_change'){data.selected.items[0].price=69000;data.selected.total=113400;data.view='exception';data.status='reapproval_required';data.audit.push({label:'価格変更で自動停止',detail:'¥64,000 → ¥69,000 (+7.8%)'});}else if(data.scenario==='denied'){data.view='audit';data.status='denied';data.paidAmount=0;data.audit.push({label:'決済を拒否',detail:'Merchant not allowed. Funds moved: ¥0'});}else completeLocal(); }
      if(name==='resolve_trip_exception'){ if(args.action==='alternative'){data.selected.items[0].name='Kamo Riverside Inn';data.selected.items[0].price=65500;data.selected.total=109900;data.audit.push({label:'代替ホテルを選択',detail:'Hotel Sora Kyotoから変更'});} completeLocal(); }
      render();notifySize();return Promise.resolve({structuredContent:data});
    }
    function completeLocal(){data.view='audit';data.status='completed';data.paidAmount=data.selected.total;data.remainingBudget=data.trip.budget-data.paidAmount;data.paymentId='pay_demo_001_001';data.audit.push({label:'Sandbox決済完了',detail:data.paymentId+' / '+yen(data.paidAmount)},{label:'予約を確定',detail:'3件の予約番号を発行'});}
    render(); connect(); notifySize();
  </script>
</body>
</html>`;
