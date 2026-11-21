{
const APP_URL='https://sprouthollow.github.io/';
const CROPS={
 turnip:{name:'Turnip',cost:5,sell:12,time:20,lv:1,c:'#f4e6f0',l:'#8fd16a',acc:'#c77dbb'},
 berry:{name:'Strawberry',cost:12,sell:28,time:40,lv:1,c:'#ff5f7e',l:'#6cc15a',acc:'#ffe27a'},
 corn:{name:'Corn',cost:20,sell:48,time:70,lv:2,c:'#ffd84a',l:'#7fc35e',acc:'#f2a93b'},
 pumpkin:{name:'Pumpkin',cost:35,sell:90,time:110,lv:3,c:'#ff9a3c',l:'#5fae55',acc:'#e0731f'},
 sunflower:{name:'Sunflower',cost:50,sell:140,time:150,lv:4,c:'#ffcf33',l:'#6bb85a',acc:'#7a4a2a'},
 moonmelon:{name:'Moonmelon',cost:0,sell:260,time:120,lv:1,rare:1,c:'#b9a7ff',l:'#5fae9a',acc:'#6f5ad6'},
 starfruit:{name:'Starfruit',cost:0,sell:420,time:160,lv:1,rare:1,c:'#ffe867',l:'#6bb85a',acc:'#ff9f1c'}
};
const WEATHER=[['Sunny','#ffd84a'],['Sunny','#ffd84a'],['Rain','#6fb7e8'],['Rainbow','#ff5f7e'],['Breezy','#9be36b']];
const QUESTS=[
 {id:'h10',t:'Harvest 10 crops',goal:s=>s.st.harvest,n:10,r:{coins:60}},
 {id:'gold',t:'Find a golden crop',goal:s=>s.st.gold,n:1,r:{gems:3}},
 {id:'ex8',t:'Explore 8 Whisperwood tiles',goal:s=>s.st.explored,n:8,r:{coins:120}},
 {id:'mole',t:'Defeat the Grumpy Mole',goal:s=>s.st.mole,n:1,r:{gems:5}},
 {id:'ord5',t:'Fill 5 village orders',goal:s=>s.st.orders,n:5,r:{coins:150}},
 {id:'rare',t:'Grow a rare seed',goal:s=>s.st.rare,n:1,r:{gems:4}},
 {id:'combo',t:'Hit a 5x harvest combo',goal:s=>s.st.combo,n:5,r:{coins:100}}
];
const KEY='sprout-hollow-v2';const X=()=>window.SHX;
const blankMap=()=>{const m=[];for(let i=0;i<25;i++){const r=Math.random();m.push({open:i===12,e:i===12?'camp':i===0||i===4||i===20||i===24?'chest':r<.12?'mole':r<.3?'seed':r<.5?'coins':r<.62?'gem':r<.72?'friend':'grass'})}return X()?X().mapGen(m):m};
let S={coins:30,gems:0,xp:0,day:1,wx:0,energy:5,pos:12,plots:Array(16).fill(null),basket:{},rare:{},orders:[],map:blankMap(),tool:'seed',seed:'turnip',tab:'farm',combo:0,lastH:0,st:{harvest:0,gold:0,explored:0,mole:0,orders:0,rare:0,combo:0},claimed:{},friends:0};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s)S=Object.assign(S,s)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const lvl=()=>1+Math.floor(Math.sqrt(S.xp/30));
const $=id=>document.getElementById(id);
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1800)};
const modal=h=>{$('box').innerHTML=h;$('modal').classList.add('on')};
const close=()=>$('modal').classList.remove('on');
/* ---------- Audio: original procedural music + sfx ---------- */
const AU={ctx:null,master:null,mus:null,sfx:null,on:true,sfxOn:true,timer:null,step:0};
try{const a=JSON.parse(localStorage.getItem('sh-audio'));if(a){AU.on=a.on;AU.sfxOn=a.sfxOn}}catch(e){}
function auInit(){if(AU.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=AU.ctx=new C();AU.master=c.createGain();AU.master.gain.value=.8;
  const rev=c.createConvolver(),len=c.sampleRate*2.6,b=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4)}
  rev.buffer=b;const wet=c.createGain();wet.gain.value=.35;rev.connect(wet).connect(c.destination);
  AU.master.connect(c.destination);AU.master.connect(rev);
  AU.mus=c.createGain();AU.mus.gain.value=AU.on?.32:0;AU.mus.connect(AU.master);
  AU.sfx=c.createGain();AU.sfx.gain.value=AU.sfxOn?.5:0;AU.sfx.connect(AU.master)}
function tone(f,t,d,{type='sine',vol=.3,out,att=.01,harm=0}={}){const c=AU.ctx;
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(out||AU.sfx);
  const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(g);o.start(t);o.stop(t+d+.05);
  if(harm){const o2=c.createOscillator(),g2=c.createGain();g2.gain.value=harm;o2.frequency.value=f*2;o2.connect(g2).connect(g);o2.start(t);o2.stop(t+d+.05)}}
const N=m=>440*Math.pow(2,(m-69)/12);
/* gentle 3/4 waltz in F major: original melody, piano + music box + soft pad */
const CH=[[53,57,60],[50,57,62],[58,62,65],[48,55,60],[53,57,60],[46,58,62],[48,52,55],[53,57,60]];
const MEL=[72,null,74,76,null,79,77,null,76,74,null,72,
           70,null,72,74,null,77,76,null,74,72,null,null,
           72,null,74,76,null,81,79,null,77,76,null,74,
           74,null,76,77,null,76,74,null,72,72,null,null];
function musTick(){if(!AU.ctx)return;const c=AU.ctx,t=c.currentTime+.05,beat=.42,s=AU.step;
  const bar=Math.floor(s/3)%8,ch=CH[bar],bi=s%3;
  if(bi===0){tone(N(ch[0]-12),t,beat*3,{type:'triangle',vol:.16,out:AU.mus,att:.02});
    ch.forEach(n=>tone(N(n),t,beat*3.2,{type:'sine',vol:.035,out:AU.mus,att:.5}))}
  else tone(N(ch[bi]),t,beat*1.4,{type:'triangle',vol:.06,out:AU.mus});
  const m=MEL[(s*2)%MEL.length],m2=MEL[(s*2+1)%MEL.length];
  if(m)tone(N(m),t,beat*2.2,{type:'sine',vol:.11,out:AU.mus,harm:.25});
  if(m2)tone(N(m2),t+beat/2,beat*1.8,{type:'sine',vol:.08,out:AU.mus,harm:.25});
  if(s%24===23)tone(N(84),t+beat/2,beat*3,{type:'sine',vol:.05,out:AU.mus});
  AU.step++}
function musStart(){if(AU.timer)return;AU.timer=setInterval(musTick,420)}
const SFX={
 plant:()=>{const t=AU.ctx.currentTime;tone(520,t,.12,{type:'sine',vol:.3});tone(780,t+.06,.15,{vol:.2})},
 water:()=>{const t=AU.ctx.currentTime;for(let i=0;i<5;i++)tone(900+Math.random()*700,t+i*.04,.08,{vol:.12})},
 harvest:()=>{const t=AU.ctx.currentTime;[72,76,79].forEach((n,i)=>tone(N(n),t+i*.07,.35,{type:'triangle',vol:.22,harm:.2}))},
 gold:()=>{const t=AU.ctx.currentTime;[72,76,79,84,88].forEach((n,i)=>tone(N(n),t+i*.06,.6,{vol:.2,harm:.3}))},
 coin:()=>{const t=AU.ctx.currentTime;tone(N(88),t,.1,{type:'square',vol:.06});tone(N(93),t+.07,.25,{type:'square',vol:.06})},
 step:()=>{const t=AU.ctx.currentTime;tone(300,t,.08,{type:'triangle',vol:.15})},
 bonk:()=>{const t=AU.ctx.currentTime;const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(90,t+.12);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g).connect(AU.sfx);o.start(t);o.stop(t+.2)},
 fanfare:()=>{const t=AU.ctx.currentTime;[[67,0],[72,.12],[76,.24],[79,.36],[84,.55]].forEach(([n,d])=>tone(N(n),t+d,.5,{type:'triangle',vol:.22,harm:.3}))},
 friend:()=>{const t=AU.ctx.currentTime;[79,84,88].forEach((n,i)=>tone(N(n),t+i*.1,.5,{vol:.15}))},
 tap:()=>{const t=AU.ctx.currentTime;tone(660,t,.05,{vol:.08})},
 no:()=>{const t=AU.ctx.currentTime;tone(220,t,.15,{type:'triangle',vol:.15});tone(196,t+.1,.2,{type:'triangle',vol:.15})}
};
const sfx=k=>{if(AU.ctx&&AU.sfxOn&&SFX[k])try{SFX[k]()}catch(e){}};
function auSave(){try{localStorage.setItem('sh-audio',JSON.stringify({on:AU.on,sfxOn:AU.sfxOn}))}catch(e){}}
function auUI(){const m=$('mbtn'),s=$('sbtn');if(m){m.textContent=AU.on?'Music on':'Music off';m.setAttribute('aria-pressed',AU.on)}if(s){s.textContent=AU.sfxOn?'Sounds on':'Sounds off';s.setAttribute('aria-pressed',AU.sfxOn)}}
document.addEventListener('pointerdown',()=>{auInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();musStart()},{capture:true});
document.addEventListener('click',e=>{const b=e.target.closest('#mbtn,#sbtn');if(!b)return;auInit();
  if(b.id==='mbtn'){AU.on=!AU.on;AU.mus&&AU.mus.gain.setTargetAtTime(AU.on?.32:0,AU.ctx.currentTime,.3)}
  else{AU.sfxOn=!AU.sfxOn;AU.sfx&&(AU.sfx.gain.value=AU.sfxOn?.5:0)}auSave();auUI()});
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;(document.hidden||(X()&&X().paused()))?AU.ctx.suspend():AU.ctx.resume()});


const face=(x,y)=>`<circle cx="${x-6}" cy="${y}" r="2.6" fill="#3b2a1e"/><circle cx="${x+6}" cy="${y}" r="2.6" fill="#3b2a1e"/><path d="M${x-4} ${y+5} q4 4 8 0" stroke="#3b2a1e" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="${x-11}" cy="${y+4}" r="3" fill="#ff8fa6" opacity=".7"/><circle cx="${x+11}" cy="${y+4}" r="3" fill="#ff8fa6" opacity=".7"/>`;
function cropBody(k){const c=CROPS[k];
  if(k==='turnip')return `<path d="M50 40 l-10-18 M50 40 l0-20 M50 40 l10-18" stroke="${c.l}" stroke-width="7" stroke-linecap="round"/><path d="M28 58 a22 22 0 0 1 44 0 q0 18 -22 26 q-22 -8 -22 -26z" fill="${c.c}"/><path d="M28 56 a22 22 0 0 1 44 0z" fill="${c.acc}"/>${face(50,62)}`;
  if(k==='berry')return `<path d="M30 40 q20 -14 40 0 q-10 8 -20 4 q-10 4 -20 -4z" fill="${c.l}"/><path d="M28 44 q22 -6 44 0 q0 28 -22 42 q-22 -14 -22 -42z" fill="${c.c}"/>${[[38,52],[60,52],[44,70],[56,68]].map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="1.6" ry="2.4" fill="${c.acc}"/>`).join('')}${face(50,60)}`;
  if(k==='corn')return `<path d="M30 86 q-4 -40 20 -60 q-6 40 0 60z" fill="${c.l}"/><path d="M70 86 q4 -40 -20 -60 q6 40 0 60z" fill="${c.l}"/><rect x="38" y="24" width="24" height="56" rx="12" fill="${c.c}"/>${face(50,50)}`;
  if(k==='pumpkin')return `<path d="M50 30 q2 -10 8 -12" stroke="#6b4a2a" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="36" cy="60" rx="16" ry="22" fill="${c.acc}"/><ellipse cx="64" cy="60" rx="16" ry="22" fill="${c.acc}"/><ellipse cx="50" cy="60" rx="18" ry="24" fill="${c.c}"/>${face(50,60)}`;
  if(k==='sunflower')return `<path d="M50 92 V54" stroke="${c.l}" stroke-width="6"/>${Array.from({length:12},(_,i)=>`<ellipse cx="50" cy="22" rx="7" ry="13" fill="${c.c}" transform="rotate(${i*30} 50 40)"/>`).join('')}<circle cx="50" cy="40" r="15" fill="${c.acc}"/>${face(50,39)}`;
  if(k==='moonmelon')return `<circle cx="50" cy="58" r="26" fill="${c.c}"/><path d="M30 50 q20 10 40 0 M28 62 q22 10 44 0" stroke="${c.acc}" stroke-width="3" fill="none"/><path d="M62 26 a10 10 0 1 0 8 14 a8 8 0 1 1 -8 -14z" fill="#fff6b0"/>${face(50,58)}`;
  return `<path d="M50 18 l9 20 22 2 -17 14 6 22 -20 -12 -20 12 6 -22 -17 -14 22 -2z" fill="${c.c}" stroke="${c.acc}" stroke-width="3" stroke-linejoin="round"/>${face(50,50)}`;
}
function cropSVG(p,stage){const c=CROPS[p.k];
  if(stage===0)return `<svg viewBox="0 0 100 100"><circle cx="44" cy="62" r="3" fill="#f3d9a4"/><circle cx="54" cy="64" r="3" fill="#f3d9a4"/><circle cx="50" cy="59" r="3" fill="#f3d9a4"/></svg>`;
  if(stage===1)return `<svg viewBox="0 0 100 100"><g class="sway"><path d="M50 72 V52" stroke="${c.l}" stroke-width="5" stroke-linecap="round"/><ellipse cx="40" cy="50" rx="11" ry="6" fill="${c.l}" transform="rotate(-25 40 50)"/><ellipse cx="60" cy="50" rx="11" ry="6" fill="${c.l}" transform="rotate(25 60 50)"/></g></svg>`;
  const sm=stage===2?.7:1;
  return `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="88" rx="24" ry="5" fill="#0003"/><g class="${stage===3?'':'sway'}" transform="translate(${50-50*sm} ${100-100*sm}) scale(${sm})">${cropBody(p.k)}</g>${p.gold&&stage===3?'<path d="M20 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z M80 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff6b0"/>':''}</svg>`;
}
const prog=p=>Math.min(1,p.g/CROPS[p.k].time);
const stageOf=p=>{if(!p)return -1;const pr=prog(p);return pr>=1?3:pr>.6?2:pr>.2?1:0};

const ICON={
 chest:`<svg viewBox="0 0 100 100"><rect x="22" y="44" width="56" height="34" rx="6" fill="#c07a3e"/><path d="M22 50 q28 -30 56 0z" fill="#d9924d"/><rect x="22" y="48" width="56" height="6" fill="#ffd84a"/><rect x="45" y="50" width="10" height="14" rx="2" fill="#ffd84a"/></svg>`,
 mole:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="80" rx="30" ry="8" fill="#5e3a26"/><path d="M28 80 q0 -44 22 -44 q22 0 22 44z" fill="#8a6a5a"/><ellipse cx="50" cy="58" rx="8" ry="6" fill="#ff8fa6"/><path d="M38 46 l8 3 M62 46 l-8 3" stroke="#3b2a1e" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="50" r="2.5" fill="#3b2a1e"/><circle cx="58" cy="50" r="2.5" fill="#3b2a1e"/></svg>`,
 seed:`<svg viewBox="0 0 100 100"><path d="M30 40 h40 l-6 40 h-28z" fill="#e8c99a"/><path d="M30 40 q20 -12 40 0" stroke="#a86c3d" stroke-width="4" fill="none"/><circle cx="50" cy="60" r="8" fill="#b9a7ff"/></svg>`,
 coins:`<svg viewBox="0 0 100 100"><ellipse cx="44" cy="66" rx="16" ry="8" fill="#e0a92b"/><ellipse cx="44" cy="60" rx="16" ry="8" fill="#ffd84a"/><ellipse cx="60" cy="52" rx="16" ry="8" fill="#ffd84a" stroke="#e0a92b" stroke-width="3"/></svg>`,
 gem:`<svg viewBox="0 0 100 100"><path d="M30 42 l10 -14 h20 l10 14 -20 32z" fill="#7fe0e8"/><path d="M30 42 h40 M40 28 l10 46 10 -46" stroke="#3fb0c0" stroke-width="2" fill="none"/></svg>`,
 friend:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="62" rx="22" ry="18" fill="#fff"/><path d="M34 46 q-6 -24 4 -24 q4 0 6 22 M66 46 q6 -24 -4 -24 q-4 0 -6 22" fill="#fff"/><path d="M38 28 q2 10 4 16 M62 28 q-2 10 -4 16" stroke="#ffb8c8" stroke-width="4"/>${face(50,60)}</svg>`,
 grass:`<svg viewBox="0 0 100 100"><path d="M30 70 q4 -20 6 0 M46 70 q4 -26 8 0 M62 70 q4 -18 6 0" stroke="#9be36b" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
 camp:`<svg viewBox="0 0 100 100"><path d="M20 76 l30 -46 30 46z" fill="#ff5f7e"/><path d="M50 30 l-8 46 h16z" fill="#c23a57"/><circle cx="76" cy="30" r="6" fill="#ffd84a"/></svg>`,
 fog:`<svg viewBox="0 0 100 100"><text x="50" y="60" font-size="30" text-anchor="middle" fill="#6a8a78" font-family="Fredoka">?</text></svg>`
};
const near=i=>{const a=Math.floor(i/5),b=i%5,c=Math.floor(S.pos/5),d=S.pos%5;return Math.abs(a-c)+Math.abs(b-d)===1};

function renderStats(){$('coins').textContent='Coins '+S.coins;$('gems').textContent='Gems '+S.gems;$('lvl').textContent='Lv '+lvl();$('day').textContent='Day '+S.day;const w=WEATHER[S.wx];$('wx').textContent=w[0];$('wx').style.borderColor=w[1];document.body.classList.toggle('rain',w[0]==='Rain')}
function render(){
  const L=lvl();renderStats();
  document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',S.tab===b.dataset.tab));
  const woods=S.tab==='woods',ext=!!(X()&&X().tabs.includes(S.tab));$('board').classList.toggle('woods',woods);$('board').classList.toggle('extb',ext);$('field').hidden=woods||ext;$('map').hidden=!woods;$('critters').hidden=woods||ext;$('ext').hidden=!ext;
  $('field').innerHTML=S.plots.map((p,i)=>{const st=stageOf(p);return `<button class="plot ${p&&p.w>0?'wet':''} ${st===3?'ready':''} ${p&&p.gold&&st===3?'gold':''}" data-i="${i}" aria-label="${p?CROPS[p.k].name+(st===3?' ready':' growing'):'Empty plot'}">${p?cropSVG(p,st):''}${p&&st<3?`<span class="bar"><i style="width:${prog(p)*100}%"></i></span>`:''}</button>`}).join('');
  $('map').innerHTML=S.map.map((t,i)=>`<button class="tile ${t.open?(t.e==='done'?'done':''):'fog'} ${!t.open&&near(i)?'near':''} ${i===S.pos?'here':''}" data-m="${i}" aria-label="${t.open?t.e:'Unexplored'}">${t.open?(ICON[t.e]||ICON.grass):ICON.fog}</button>`).join('');
  $('tools').innerHTML=woods?`<span class="pill">Energy ${S.energy}/10</span><button class="btn" data-a="rest">Rest at camp (refill, ends day)</button>`:
   [['seed','Plant'],['water','Water'],['harvest','Harvest']].map(t=>`<button class="btn" data-t="${t[0]}" aria-pressed="${S.tool===t[0]}">${t[1]}</button>`).join('')+`<button class="btn" data-t="all">Water all</button>${S.combo>1?`<span class="pill">Combo x${S.combo}</span>`:''}`;
  let side='';
  if(S.tab==='farm'||S.tab==='woods'){
    side+=`<div class="panel"><h2>Seed tray</h2><div class="seeds">${Object.entries(CROPS).filter(([k,c])=>!c.rare||S.rare[k]).map(([k,c])=>`<button class="btn seed" data-s="${k}" aria-pressed="${S.seed===k&&S.tool==='seed'}" ${L<c.lv?'disabled':''}><span>${c.name}${c.rare?' ✦':''}</span><small>${L<c.lv?'Unlocks at Lv '+c.lv:c.rare?'Rare · x'+S.rare[k]+' · sells '+c.sell:c.cost+' coins · '+c.time+'s'}</small></button>`).join('')}</div></div>`;
    side+=`<div class="panel"><h2>Village orders</h2>${S.orders.map((o,i)=>`<div class="row"><span><b>${o.who}</b> wants ${o.n} ${CROPS[o.k].name}</span><button class="btn" data-o="${i}" ${(S.basket[o.k]||0)>=o.n?'':'disabled'}>${o.pay}</button></div>`).join('')||'<p>New orders arrive each morning.</p>'}</div>`;
    const b=Object.entries(S.basket).filter(e=>e[1]>0);
    side+=`<div class="panel"><h2>Basket</h2><div class="seeds">${b.map(([k,n])=>`<button class="btn seed" data-sell="${k}"><span>${CROPS[k].name} × ${n}</span><small>Sell one for ${CROPS[k].sell}</small></button>`).join('')||'<p>Empty — go harvest!</p>'}</div></div>`;
  }
  if(S.tab==='quests'){
    side=`<div class="panel"><h2>Quests</h2>${QUESTS.map(q=>{const v=Math.min(q.n,q.goal(S)),ok=v>=q.n,c=S.claimed[q.id];return `<div><div class="row"><span>${q.t}</span><button class="btn" data-q="${q.id}" ${ok&&!c?'':'disabled'}>${c?'Done':(q.r.coins?q.r.coins+' coins':q.r.gems+' gems')}</button></div><div class="meter"><i style="width:${v/q.n*100}%"></i></div></div>`}).join('')}</div>
    <div class="panel"><h2>Gem shop</h2><div class="row"><span>Moonmelon seed</span><button class="btn" data-buy="moonmelon" ${S.gems>=3?'':'disabled'}>3 gems</button></div><div class="row"><span>Starfruit seed</span><button class="btn" data-buy="starfruit" ${S.gems>=5?'':'disabled'}>5 gems</button></div><div class="row"><span>Sprinkler (auto-water today)</span><button class="btn" data-buy="sprinkler" ${S.gems>=2?'':'disabled'}>2 gems</button></div></div>
    <div class="panel"><h2>Forest friends</h2><p>${S.friends?`You've befriended ${S.friends} Fuzzle${S.friends>1?'s':''}. Each one adds +5% to sale prices.`:'Find Fuzzles in Whisperwood to befriend them.'}</p></div>`;
  }
  if(S.tab==='share'){
    side=`<div class="panel"><h2>Scan to play</h2><p>Point any phone camera here. It opens the game, then use "Add to Home Screen" (iPhone) or "Install app" (Android, Windows, Mac).</p><div id="qr"></div><label for="url">Game link</label><input id="url" value="${APP_URL}"><div class="tools"><button class="btn" data-a="copy">Copy link</button><button class="btn" data-a="regen">Update QR</button></div><p class="note">Free forever. No ads, no sign-up. Saves on each device.</p></div>`;
  }
  if(X()){try{side=X().side(S.tab,side)}catch(e){console.error(e)}}$('side').innerHTML=side;if(X()){try{X().after(S.tab)}catch(e){console.error(e)}}
  if(S.tab==='share')drawQR($('url').value);
}
function drawQR(u){const el=$('qr');if(!el)return;el.innerHTML='';try{new QRCode(el,{text:u,width:220,height:220,colorDark:'#3b2a1e',colorLight:'#ffffff'})}catch(e){el.textContent='QR library could not load. Link: '+u}}

const WHO=['Mochi the cat','Grandma Pip','Baker Lou','Little Fern','Mayor Bun'];
function newOrders(){const L=lvl(),ks=Object.keys(CROPS).filter(k=>!CROPS[k].rare&&CROPS[k].lv<=L);S.orders=Array.from({length:3},()=>{const k=ks[Math.random()*ks.length|0],n=1+(Math.random()*3|0);return{k,n,who:WHO[Math.random()*WHO.length|0],pay:Math.round(CROPS[k].sell*n*1.6)}})}
if(!S.orders.length)newOrders();
const price=k=>Math.round(CROPS[k].sell*(1+S.friends*.05));
function newDay(){S.day++;X()&&X().emit('day');S.wx=Math.random()*WEATHER.length|0;S.energy=10;newOrders();if(S.day%5===0)S.map=blankMap(),S.pos=12,toast('The woods shifted... new paths await!');else toast('Day '+S.day+' — '+WEATHER[S.wx][0]+'!')}

function explore(i){const t=S.map[i];
  if(t.open){if(near(i)||i===S.pos)S.pos=i;return}
  if(!near(i))return toast('Explore next to where you stand');
  if(S.energy<1)return toast('Too tired — rest at camp');
  S.energy--;sfx('step');t.open=true;S.pos=i;S.st.explored++;
  const e=t.e;
  if(X()&&X().explore(e,t,i))return;
  if(e==='coins'){const n=15+(Math.random()*30|0);S.coins+=n;toast('Found '+n+' coins under a mushroom!');t.e='done'}
  else if(e==='gem'){S.gems++;toast('A sparkly gem!');t.e='done'}
  else if(e==='seed'){const k=Math.random()<.7?'moonmelon':'starfruit';S.rare[k]=(S.rare[k]||0)+1;toast('Rare seed: '+CROPS[k].name+'!');t.e='done'}
  else if(e==='chest'){const n=60+(Math.random()*80|0);S.coins+=n;S.gems+=2;sfx('fanfare');modal(`${ICON.chest}<h2>Treasure chest!</h2><p>${n} coins and 2 gems inside.</p><button class="btn big" data-a="close">Yay!</button>`);t.e='done'}
  else if(e==='friend'){S.friends++;sfx('friend');modal(`${ICON.friend}<h2>Fuzzle joins you!</h2><p>Your forest friends make villagers pay 5% more each.</p><button class="btn big" data-a="close">Welcome, buddy</button>`);t.e='done'}
  else if(e==='mole')moleFight(t);
  else toast('Just soft grass and birdsong.');
}
let mole=null;
function moleFight(t){mole={hp:12,t,left:6};modal(`<div class="wob" data-a="hit" style="cursor:pointer">${ICON.mole}</div><h2>Grumpy Mole blocks the path!</h2><p>Tap him 12 times in 6 seconds to shoo him away.</p><p id="mhp">HP 12 · 6s</p><button class="btn big" data-a="hit">Bonk!</button>`);
  mole.timer=setInterval(()=>{if(!mole)return;mole.left--;$('mhp').textContent='HP '+mole.hp+' · '+mole.left+'s';if(mole.left<=0){clearInterval(mole.timer);mole=null;modal(`${ICON.mole}<h2>He stole 20 coins!</h2><p>He's still there. Try again with more energy.</p><button class="btn" data-a="close">Grr</button>`);t.open=false;S.coins=Math.max(0,S.coins-20);save();render()}},1000)}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-tab],[data-t],[data-s],[data-i],[data-o],[data-sell],[data-m],[data-q],[data-buy],[data-a]');if(!t)return;
  const d=t.dataset;
  if(d.tab){S.tab=d.tab;sfx('tap')}
  else if(d.a==='close')close();
  else if(d.a==='hit'&&mole){mole.hp--;sfx('bonk');$('mhp').textContent='HP '+mole.hp+' · '+mole.left+'s';if(mole.hp<=0){clearInterval(mole.timer);S.st.mole++;X()&&X().emit('mole');S.gems+=3;S.coins+=50;mole.t.e='done';mole=null;modal(`${ICON.gem}<h2>Mole defeated!</h2><p>He dropped 3 gems and 50 coins as he scurried off.</p><button class="btn big" data-a="close">Victory!</button>`)}}
  else if(d.a==='rest'){newDay()}
  else if(d.a==='copy'){const u=$('url').value;navigator.clipboard?.writeText(u).then(()=>toast('Link copied'),()=>toast('Copy blocked — select the link'))}
  else if(d.a==='regen'){drawQR($('url').value);toast('QR updated');return}
  else if(d.t){if(d.t==='all'){let n=0;S.plots.forEach(p=>{if(p&&stageOf(p)<3){p.w=30;n++}});sfx(n?'water':'no');toast(n?'Splish splash!':'Nothing to water')}else S.tool=d.t}
  else if(d.s){S.seed=d.s;S.tool='seed'}
  else if(d.i!=null){const i=+d.i,p=S.plots[i];
    if(p&&stageOf(p)===3){const now=Date.now();S.combo=now-S.lastH<2500?S.combo+1:1;S.lastH=now;S.st.combo=Math.max(S.st.combo,S.combo);
      const n=p.gold?5:1;S.basket[p.k]=(S.basket[p.k]||0)+n;S.st.harvest++;X()&&X().emit('harvest',p);if(p.gold)S.st.gold++;if(CROPS[p.k].rare)S.st.rare++;
      const bonus=S.combo>=3?S.combo*2:0;S.coins+=bonus;S.xp+=CROPS[p.k].time/5;S.plots[i]=null;
      sfx(p.gold?'gold':'harvest');toast((p.gold?'GOLDEN! +5 ':'+1 ')+CROPS[p.k].name+(bonus?' · combo +'+bonus:''))}
    else if(!p&&S.tool!=='water'){const k=S.seed,c=CROPS[k];
      if(c.rare){if(!S.rare[k])return toast('No '+c.name+' seeds left');S.rare[k]--;if(!S.rare[k])S.seed='turnip'}
      else if(S.coins<c.cost)return (sfx('no'),toast('Need '+c.cost+' coins'));else S.coins-=c.cost;
      const gc=WEATHER[S.wx][0]==='Rainbow'?.25:.08;S.plots[i]={k,g:0,w:0,gold:Math.random()<gc};X()&&X().emit('plant',k);sfx('plant')}
    else if(p){p.w=30;sfx('water');toast('Watered')}}
  else if(d.o!=null){const o=S.orders[+d.o];S.basket[o.k]-=o.n;S.coins+=o.pay;S.xp+=10;S.st.orders++;S.orders.splice(+d.o,1);X()&&X().emit('order',o);sfx('coin');toast(o.who+' says thank you! +'+o.pay)}
  else if(d.sell){S.basket[d.sell]--;S.coins+=price(d.sell);sfx('coin')}
  else if(d.m!=null)explore(+d.m);
  else if(d.q){const q=QUESTS.find(x=>x.id===d.q);S.claimed[q.id]=1;sfx('fanfare');S.coins+=q.r.coins||0;S.gems+=q.r.gems||0;modal(`${ICON.chest}<h2>Quest complete!</h2><p>${q.t}</p><button class="btn big" data-a="close">Collect</button>`)}
  else if(d.buy){const cost={moonmelon:3,starfruit:5,sprinkler:2}[d.buy];S.gems-=cost;if(d.buy==='sprinkler'){S.sprink=S.day;toast('Sprinkler on for today')}else{S.rare[d.buy]=(S.rare[d.buy]||0)+1;toast('Got a '+CROPS[d.buy].name+' seed')}}
  save();render();
});
$('modal').addEventListener('click',e=>{if(e.target.id==='modal'&&!mole)close()});

const CRIT=[
 /* Pip: acorn-capped seedling kid */
 `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="56" rx="14" ry="3" fill="#0003"/><g class="bob"><ellipse cx="30" cy="38" rx="17" ry="16" fill="#fff8ee"/><path d="M12 30 q18 -22 36 0 q-18 6 -36 0z" fill="#b07a45"/><path d="M14 29 q16 4 32 0" stroke="#8a5a30" stroke-width="2" fill="none"/><path d="M30 10 q4 -6 9 -4 q-3 5 -9 4z" fill="#7fc35e"/><circle cx="24" cy="40" r="2.2" fill="#3b2a1e"/><circle cx="36" cy="40" r="2.2" fill="#3b2a1e"/><path d="M28 45 q2 2 4 0" stroke="#3b2a1e" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="19" cy="45" rx="3.4" ry="2" fill="#ffb1bf"/><ellipse cx="41" cy="45" rx="3.4" ry="2" fill="#ffb1bf"/></g></svg>`,
 /* Fuzzle: dandelion-puff spirit with leaf feet */
 `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="56" rx="13" ry="3" fill="#0003"/><g class="bob">${Array.from({length:14},(_,i)=>`<circle cx="${30+18*Math.cos(i/14*6.283)}" cy="${32+16*Math.sin(i/14*6.283)}" r="7" fill="#fffbe6"/>`).join('')}<circle cx="30" cy="32" r="16" fill="#fffbe6"/><path d="M20 50 q-6 2 -6 6 q6 0 8 -4z M40 50 q6 2 6 6 q-6 0 -8 -4z" fill="#8fd16a"/><circle cx="25" cy="32" r="2" fill="#3b2a1e"/><circle cx="35" cy="32" r="2" fill="#3b2a1e"/><path d="M28 37 q2 2 4 0" stroke="#3b2a1e" stroke-width="1.5" fill="none"/><ellipse cx="21" cy="37" rx="3" ry="1.8" fill="#ffc6a8"/><ellipse cx="39" cy="37" rx="3" ry="1.8" fill="#ffc6a8"/></g></svg>`,
 /* Lumi: cloud lamb with a sprout tail */
 `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="56" rx="15" ry="3" fill="#0003"/><g class="bob"><g fill="#f3f6fb"><circle cx="20" cy="36" r="10"/><circle cx="30" cy="30" r="12"/><circle cx="40" cy="36" r="10"/><rect x="14" y="34" width="32" height="14" rx="7"/></g><rect x="20" y="46" width="4" height="7" rx="2" fill="#9bb0c4"/><rect x="36" y="46" width="4" height="7" rx="2" fill="#9bb0c4"/><path d="M50 36 q6 -4 4 -10 q-5 3 -4 10z" fill="#8fd16a"/><circle cx="26" cy="36" r="2" fill="#3b2a1e"/><circle cx="34" cy="36" r="2" fill="#3b2a1e"/><ellipse cx="22" cy="40" rx="2.8" ry="1.6" fill="#ffb1bf"/><ellipse cx="38" cy="40" rx="2.8" ry="1.6" fill="#ffb1bf"/></g></svg>`
];
$('critters').innerHTML=CRIT.map((c,i)=>`<div class="critter" id="cr${i}" style="left:${10+i*35}%;top:70%">${c}</div>`).join('');
setInterval(()=>CRIT.forEach((_,i)=>{const e=$('cr'+i);if(!e)return;e.style.left=(Math.random()*80)+'%';e.style.top=(Math.random()*80)+'%'}),4000);

let ticks=0;
setInterval(()=>{
  if(X()&&X().paused())return;
  const wet=WEATHER[S.wx][0]==='Rain'||S.sprink===S.day,breezy=WEATHER[S.wx][0]==='Breezy';
  S.plots.forEach(p=>{if(p&&prog(p)<1){if(wet)p.w=Math.max(p.w,1);p.g+=(p.w>0?2:1)*(breezy?1.25:1)*(X()?X().growMul(p):1);if(p.w>0&&!wet)p.w--}});
  if(++ticks%120===0)newDay();
  save();
  if(!$('modal').classList.contains('on')||!mole){if(S.tab==='share')renderStats();else render()}
},1000);
window.SH={get S(){return S},set S(v){S=v},save,render,toast,modal,close,sfx,CROPS,ICON,lvl,newDay,KEY,cropSVG,price,AU};
X()&&X().init();
render();auUI();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
