export const WIDGET_URI = "ui://agentic-travel/trip-v1.html";

export const widgetHtml = String.raw`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { color-scheme: light dark; --ink:#17201d; --muted:#65706b; --line:#dce3df; --paper:#fff; --soft:#f4f7f5; --brand:#126b4e; --brand2:#d9f5e8; --warn:#a44e00; --danger:#a62b2b; }
    * { box-sizing:border-box; }
    body { margin:0; padding:12px; background:transparent; color:var(--ink); font:14px/1.5 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .shell { max-width:760px; margin:auto; background:var(--paper); border:1px solid var(--line); border-radius:18px; overflow:hidden; box-shadow:0 12px 38px rgba(18,45,35,.08); }
    header { padding:18px 20px; display:flex; gap:12px; align-items:center; border-bottom:1px solid var(--line); }
    .mark { width:34px; height:34px; border-radius:11px; display:grid; place-items:center; background:var(--brand); color:white; font-weight:800; }
    h1,h2,h3,p { margin:0; }
    h1 { font-size:15px; } h2 { font-size:20px; line-height:1.3; } h3 { font-size:15px; }
    .sub,.muted { color:var(--muted); font-size:12px; }
    .badges { margin-left:auto; display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }
    .badge { padding:4px 8px; border-radius:999px; background:var(--soft); color:var(--muted); font:700 10px/1.2 ui-monospace,monospace; letter-spacing:.04em; }
    main { padding:20px; display:grid; gap:16px; }
    .hero { display:grid; gap:6px; }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .card { border:1px solid var(--line); border-radius:14px; padding:14px; display:grid; gap:12px; background:var(--paper); }
    .card.selected { border:2px solid var(--brand); }
    .row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .amount { font-size:20px; font-weight:800; white-space:nowrap; }
    .item { display:grid; grid-template-columns:1fr auto; gap:2px 12px; padding:9px 0; border-top:1px solid var(--line); }
    .item small { color:var(--muted); }
    .policy { background:var(--soft); border-radius:12px; padding:12px; display:grid; gap:8px; }
    .policy .row { padding-bottom:7px; border-bottom:1px solid var(--line); }
    .policy .row:last-child { border:0; padding:0; }
    .reason { border-left:3px solid #e18a2b; padding-left:10px; }
    .danger { border-color:#edb1b1; background:#fff7f7; }
    .success { border-color:#94d5bd; background:#f3fcf8; }
    .timeline { display:grid; gap:10px; }
    .event { display:grid; grid-template-columns:11px 1fr; gap:10px; }
    .dot { width:9px; height:9px; margin-top:6px; border-radius:50%; background:var(--brand); box-shadow:0 0 0 3px var(--brand2); }
    button { appearance:none; border:0; border-radius:11px; padding:11px 14px; background:var(--brand); color:#fff; font-weight:750; cursor:pointer; }
    button.secondary { color:var(--ink); background:var(--soft); border:1px solid var(--line); }
    button:disabled { opacity:.55; cursor:wait; }
    .actions { display:flex; flex-wrap:wrap; gap:8px; }
    .home { text-align:center; padding:24px 10px; display:grid; gap:16px; }
    .home .actions { justify-content:center; }
    .loading { opacity:.6; pointer-events:none; }
    @media (max-width:620px) { .grid { grid-template-columns:1fr; } header { align-items:flex-start; } .badges { display:none; } }
    @media (prefers-color-scheme:dark) { :root { --ink:#edf5f1; --muted:#a7b2ad; --line:#35423c; --paper:#18201d; --soft:#222d29; --brand:#43b68a; --brand2:#1d4b3b; } .danger{background:#321f1f}.success{background:#183127} }
  </style>
</head>
<body>
  <section class="shell">
    <header>
      <div class="mark">K</div>
      <div><h1>Agentic Travel Commerce</h1><div class="sub">Delegated payment UX by Komlock Lab</div></div>
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
      return '<div class="home"><div class="hero"><h2>AIに、どこまで支払いを任せますか？</h2><p class="muted">ブラウザ単体でも3つのデモを試せます。ChatGPTでは自然文から同じフローが始まります。</p></div>'+buttons(
        '<button data-start="happy">正常系を試す</button><button class="secondary" data-start="price_change">価格変更</button><button class="secondary" data-start="denied">拒否</button>'
      )+'</div>';
    }
    function renderMandate() {
      return '<div class="hero"><div class="sub">京都旅行の支払い委任</div><h2>この範囲なら、AIが予約まで進めます</h2></div><div class="policy">'+
        row('旅行','京都・2名・10/12〜10/14')+row('総予算',yen(data.trip.budget))+row('自動決済',yen(data.trip.autoPayLimit)+'以下 ＋ 変更可能')+row('必ず確認','取消不可・上限超過・価格5%以上上昇')+row('決済手段','登録済みカード（Sandbox）')+
        '</div>'+buttons('<button data-action="search">この条件で探す</button><button class="secondary" data-action="home">条件を変更</button>');
    }
    function row(label,value){return '<div class="row"><span class="muted">'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';}
    function renderOptions() {
      const cards = data.options.map(option => '<article class="card"><div class="row"><div><h3>'+esc(option.title)+'</h3><div class="muted">'+esc(option.subtitle)+'</div></div><div class="amount">'+yen(option.total)+'</div></div>'+option.items.map(item => '<div class="item"><strong>'+esc(item.name)+'</strong><strong>'+yen(item.price)+'</strong><small>'+esc(item.reason)+'</small><small>'+(item.cancellable?'変更可能':'取消不可')+'</small></div>').join('')+'<div class="row"><span class="muted">残予算 '+yen(data.trip.budget-option.total)+'</span><button data-option="'+esc(option.id)+'">この案で進める</button></div></article>').join('');
      return '<div class="hero"><div class="sub">成立する旅程を2件に絞りました</div><h2>価格だけでなく、変更条件まで比較</h2></div><div class="grid">'+cards+'</div>';
    }
    function renderApproval() {
      const auto = data.selected.items.filter(i => i.price <= data.trip.autoPayLimit && i.cancellable);
      const manual = data.selected.items.filter(i => !auto.includes(i));
      return '<div class="hero"><div class="sub">'+esc(data.selected.title)+'</div><h2>2点だけ確認してください</h2><p class="muted">AIが判断したのではなく、設定済みルールが承認を要求しています。</p></div><div class="card">'+manual.map(item => '<div class="reason"><div class="row"><strong>'+esc(item.name)+'</strong><strong>'+yen(item.price)+'</strong></div><div class="muted">'+(item.price>data.trip.autoPayLimit?'自動決済上限を超過':'取消不可')+'</div></div>').join('')+'</div><div class="policy">'+row('自動確定',auto.map(i=>i.name+' '+yen(i.price)).join('、')||'なし')+row('今回の合計',yen(data.selected.total))+row('決済','カードSandbox')+'</div>'+buttons('<button data-action="execute">確認してSandbox決済</button><button class="secondary" data-action="options">別案に戻る</button>');
    }
    function renderException() {
      return '<div class="hero"><div class="sub">PAYMENT PAUSED</div><h2>価格が7.8%上がったため停止しました</h2><p class="muted">承認後に条件が変わったので、AIは勝手に決済しません。</p></div><div class="card danger">'+row('Hotel Sora Kyoto','¥64,000 → ¥69,000')+row('旅行合計',yen(data.selected.total))+row('予算内残額',yen(data.trip.budget-data.selected.total))+'</div>'+buttons('<button data-action="reapprove">69,000円で再承認</button><button class="secondary" data-action="alternative">65,500円の代替ホテル</button>');
    }
    function renderAudit() {
      const denied = data.status === 'denied';
      return '<div class="hero"><div class="sub">'+(denied?'PAYMENT DENIED':'TRIP CONFIRMED')+'</div><h2>'+(denied?'ルール外のため、資金移動前に拒否しました':'予約とSandbox決済が完了しました')+'</h2></div><div class="card '+(denied?'danger':'success')+'">'+row('支払額',yen(data.paidAmount))+row('残予算',yen(data.remainingBudget))+row('Payment ID',data.paymentId||'発行なし')+row('Funds moved',denied?'¥0':'Sandbox only')+'</div><div class="timeline">'+data.audit.map(event => '<div class="event"><span class="dot"></span><div><strong>'+esc(event.label)+'</strong><div class="muted">'+esc(event.detail)+'</div></div></div>').join('')+'</div>'+buttons('<button class="secondary" data-action="home">別シナリオを試す</button>');
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
