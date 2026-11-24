/* Sprout Hollow — feature systems layered on core.js through window.SH.
   Everything new lives in S.x so older saves keep working. */
(function(){
'use strict';
const SAVE_VERSION=3;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=a=>a[Math.random()*a.length|0];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
let SH=null;const S=()=>SH.S;const x=()=>S().x;

/* ---------------- Data ---------------- */
const MATS={crystal:'Creek crystal',lily:'Water lily',wood:'Twig bundle',petal:'Wild petals',mush:'Glow mushroom',moon:'Moonstone',frost:'Frost crystal',feather:'Star feather'};
const SEASONS=[
 {id:'spring',name:'Spring',grow:1.1,tint:'#ffd9e4',fx:'petal',note:'Blossoms drift and crops grow a little faster.',bonus:'berry'},
 {id:'summer',name:'Summer',grow:1.15,tint:'#fff1b8',fx:'firefly',note:'Long sunny days. Sunflowers love it.',bonus:'sunflower'},
 {id:'autumn',name:'Autumn',grow:1,tint:'#ffd2b0',fx:'leaf',note:'Harvest season. Pumpkins grow faster.',bonus:'pumpkin'},
 {id:'winter',name:'Winter',grow:.85,tint:'#dfe9ff',fx:'snow',note:'Quiet and snowy. Frost crystals appear in Whisperwood.',bonus:'turnip'}];
const season=()=>SEASONS[Math.floor((S().day-1)/7)%4];
const seasonDay=()=>((S().day-1)%7)+1;

const NPCS={
 pip:{name:'Grandma Pip',col:'#e8b4c8',likes:'berry',who:'Grandma Pip',role:'Retired adventurer who tends the village lantern.',
  lines:[["Oh, a new face! The soil here remembers kind hands.","Mind the Grumpy Mole. He's all bluster."],["My knees creak, but my stories don't.","When I was young, the woods glowed every night."],["You remind me of myself, dear. Brave and a little muddy.","The old shrine in the woods... I left something there once."]]},
 lou:{name:'Baker Lou',col:'#f6c89a',likes:'pumpkin',who:'Baker Lou',role:'Cheerful baker who never stops humming.',
  lines:[["Smell that? Fresh bread! Well, it was fresh this morning.","Bring me good crops and I'll bake you something lovely."],["Pumpkin season is my favorite season. Every season is pumpkin season.","Flour on my nose? Again? Ha!"],["You're my favorite customer. Don't tell the Mayor.","I'm planning a festival pie. Biggest one yet!"]]},
 fern:{name:'Little Fern',col:'#bfe3b4',likes:'sunflower',who:'Little Fern',role:'Curious kid who collects bugs and secrets.',
  lines:[["Did you know beetles can be shiny AND grumpy?","I found a feather that glows. Want to see? ...I lost it."],["I'm making a map of every secret in Whisperwood!","Fuzzles sneeze when they're happy."],["You're the best explorer ever. Second best. After me.","Let's be secret-finding partners!"]]},
 bun:{name:'Mayor Bun',col:'#d8cdf2',likes:'corn',who:'Mayor Bun',role:'Fluffy, formal, secretly very soft-hearted.',
  lines:[["Ahem. Welcome to Sprout Hollow, population: delightful.","Please keep your crops tidy. And your hats straight."],["The village feels livelier since you arrived.","I've drafted a proclamation about pie. It's very serious."],["Between us, I nap in the town hall. Don't tell anyone.","You've done wonders for our little hollow. Thank you."]]},
 mochi:{name:'Mochi the cat',col:'#f2d6a8',likes:'turnip',who:'Mochi the cat',role:'A cat of few words. Mostly "mrrp".',
  lines:[["Mrrp.","*sniffs your boots suspiciously*"],["Mrrrp? *headbutts your hand*","*rolls over in a sunbeam*"],["*purrs loudly and follows you everywhere*","Mrrp mrrp! (You are clearly family now.)"]]}
};
const COMPANIONS={
 fluffkin:{name:'Fluffkin',desc:'A tiny fluffy forest spirit that drifts on warm breezes.',rarity:'Common',personality:'Gentle and sleepy',food:'turnip',perk:'Sales pay a little more',found:'woods'},
 mossbun:{name:'Mossbun',desc:'A round moss-covered bunny with a flower on its head.',rarity:'Common',personality:'Shy, then very cuddly',food:'berry',perk:'Finds extra twigs in the woods',found:'woods'},
 pippin:{name:'Pippin',desc:'A little woodland fox who loves to dig.',rarity:'Uncommon',personality:'Cheeky and curious',food:'corn',perk:'Crops grow 5% faster',found:'woods'},
 mushling:{name:'Mushling',desc:'A tiny mushroom creature who hums in the rain.',rarity:'Uncommon',personality:'Cheerful and a bit clumsy',food:'pumpkin',perk:'Finds more glow mushrooms',found:'woods'},
 lumi:{name:'Lumi',desc:'A glowing firefly who lights the way home.',rarity:'Rare',personality:'Bright, brave and loyal',food:'sunflower',perk:'Finds star feathers',found:'secret'},
 bumble:{name:'Bumble',desc:'A round, fuzzy bee who hums while she works.',rarity:'Uncommon',personality:'Busy, buzzy and endlessly kind',food:'sunflower',perk:'Flowers sell for more',found:'story'},
 emberkin:{name:'Emberkin',desc:'A baby magical dragon, warm as a teacup.',rarity:'Legendary',personality:'Proud, playful and secretly soft',food:'starfruit',perk:'Crops grow 5% faster',found:'legend'}
};
const FISH={
 minnow:{name:'Minnow Puff',rarity:'Common',sell:15,w:40,col:'#b8d9e8',desc:'Round as a dumpling, quick as a giggle.'},
 trout:{name:'Pebble Trout',rarity:'Common',sell:25,w:30,col:'#a8c3a0',desc:'Speckled like creek stones.'},
 koi:{name:'Blossom Koi',rarity:'Uncommon',sell:60,w:14,col:'#f4bfa7',seasons:['spring','summer'],desc:'Its fins look like cherry petals.'},
 carp:{name:'Moon Carp',rarity:'Rare',sell:120,w:6,col:'#c9b9e8',weather:2,desc:'Only rises on rainy days.'},
 eel:{name:'Crystal Eel',rarity:'Rare',sell:140,w:6,col:'#9fe6f6',seasons:['winter'],desc:'Glitters like frozen starlight.'},
 lantern:{name:'Lantern Fish',rarity:'Legendary',sell:400,w:1.5,col:'#ffd98a',desc:'A warm glow in the deep. Rainbow days bring it closer.'}};
const SKINS=['Classic','Blossom ribbon','Starlit sparkle'];
const OLD_COMP={fuzzle:'fluffkin',moss:'mossbun',pip:'pippin',lumi:'lumi',moth:'mushling',frog:'mossbun'};
const SECRETS=[
 {id:'glade',name:'Moonlit Glade',desc:'Silver grass that hums when the wind blows.',reward:{moon:2}},
 {id:'ring',name:'Fairy Ring',desc:'A circle of mushrooms. Stepping inside makes you giggle.',reward:{mush:4}},
 {id:'shrine',name:'Old Shrine',desc:'A mossy stone shrine. Someone left a ribbon here long ago.',reward:{feather:1,coins:80}},
 {id:'willow',name:'Whispering Willow',desc:'The willow tells you a secret, then pretends it didn\'t.',reward:{petal:4}},
 {id:'spring',name:'Crystal Spring',desc:'Water so clear you can see tiny fish waving.',reward:{gems:2}},
 {id:'golem',name:'Sleeping Stone Golem',desc:'A gentle giant covered in flowers, snoring softly.',reward:{wood:5,moon:1}},
 {id:'hollow',name:'Lantern Hollow',desc:'Old lanterns hang in the trees, waiting to be lit.',reward:{coins:150}},
 {id:'nest',name:'Cloud Nest',desc:'A nest of clouds tangled in the tallest tree.',reward:{feather:2}}];
const RECIPES={
 lantern:{name:'Glow Lantern',need:{wood:2,moon:1},kind:'decor',slot:'wall',desc:'Warm light for the cottage.'},
 jam:{name:'Berry Jam',need:{c_berry:3},kind:'sell',sell:120,desc:'Sweet, sticky, sells well.'},
 pie:{name:'Pumpkin Pie',need:{c_pumpkin:1,c_berry:2},kind:'sell',sell:300,desc:'Baker Lou would approve.'},
 tonic:{name:'Sprout Tonic',need:{mush:2,petal:1},kind:'use',desc:'All growing crops jump ahead.'},
 crown:{name:'Flower Crown',need:{petal:3,c_sunflower:1},kind:'decor',slot:'shelf',desc:'A crown for a cozy shelf.'},
 stool:{name:'Twig Stool',need:{wood:4},kind:'decor',slot:'floor',desc:'Rustic and surprisingly comfy.'},
 mlamp:{name:'Mushroom Lamp',need:{mush:3,wood:1},kind:'decor',slot:'floor',desc:'Glows a soft teal.'},
 rug:{name:'Petal Rug',need:{petal:5},kind:'decor',slot:'rug',desc:'Soft as a spring morning.'},
 chime:{name:'Moon Chime',need:{moon:2,feather:1},kind:'decor',slot:'window',desc:'Sings in the breeze.'},
 clamp:{name:'Crystal Lamp',need:{crystal:2,wood:1},kind:'decor',slot:'floor',desc:'Glows like the creek at dusk.'},
 tea:{name:'Lily Tea',need:{lily:2,petal:1},kind:'sell',sell:90,desc:'Fragrant and calming.'},
 snowglobe:{name:'Snow Globe',need:{frost:2,wood:1},kind:'decor',slot:'shelf',desc:'A tiny winter inside glass.'}};
const DECOR={
 lantern:{name:'Glow Lantern',slot:'wall'},crown:{name:'Flower Crown',slot:'shelf'},stool:{name:'Twig Stool',slot:'floor'},
 mlamp:{name:'Mushroom Lamp',slot:'floor'},rug:{name:'Petal Rug',slot:'rug'},chime:{name:'Moon Chime',slot:'window'},snowglobe:{name:'Snow Globe',slot:'shelf'},
 plant:{name:'Potted Fern',slot:'floor',cost:60},frame:{name:'Meadow Painting',slot:'wall',cost:90},curtain:{name:'Gingham Curtains',slot:'window',cost:70},
 teapot:{name:'Teapot',slot:'shelf',cost:50},quilt:{name:'Patchwork Quilt',slot:'rug',cost:120},
 clamp:{name:'Crystal Lamp',slot:'floor'},
 garland:{name:'Blossom Garland',slot:'window',fest:1},lantstring:{name:'Lantern String',slot:'wall',fest:1},scarecrow:{name:'Fair Scarecrow',slot:'floor',fest:1},snowman:{name:'Tiny Snowman',slot:'floor',fest:1},chandelier:{name:'Keeper Chandelier',slot:'wall'},
 sakura:{name:'Sakura Branch',slot:'wall',season:'spring'},fan:{name:'Paper Fan',slot:'wall',season:'summer'},acorn:{name:'Acorn Garland',slot:'window',season:'autumn'},mitten:{name:'Mitten Bunting',slot:'window',season:'winter'}};
const SLOTS=[['wall','Wall'],['window','Window'],['shelf','Shelf'],['floor','Floor'],['rug','Rug']];
const QUESTLINES=[
 {id:'lantern',npc:'pip',name:'The Lost Lantern',stages:[
  {t:'Harvest 3 crops to show Grandma Pip your green thumb',done:s=>s.x.c.harvest>=3},
  {t:'Explore 5 tiles in Whisperwood',done:s=>s.x.c.explore>=5},
  {t:'Find the Old Shrine or any secret place',done:s=>Object.keys(s.x.secrets).length>=1},
  {t:'Craft a Glow Lantern',done:s=>(s.x.c.crafted.lantern||0)>=1}],reward:{coins:250,gems:3,decor:'frame'}},
 {id:'pie',npc:'lou',name:'The Festival Pie',stages:[
  {t:'Grow a pumpkin',done:s=>(s.x.c.grown.pumpkin||0)>=1},
  {t:'Bake a Pumpkin Pie',done:s=>(s.x.c.crafted.pie||0)>=1},
  {t:'Fill 3 village orders',done:s=>s.x.c.orders>=3}],reward:{coins:300,decor:'teapot'}},
 {id:'map',npc:'fern',name:'Fern\'s Secret Map',stages:[
  {t:'Befriend a companion in Whisperwood',done:s=>Object.keys(s.x.comp).length>=3},
  {t:'Discover 3 secret places',done:s=>Object.keys(s.x.secrets).length>=3},
  {t:'Reach 5 hearts with Little Fern',done:s=>(s.x.npc.fern||0)>=5}],reward:{gems:6,decor:'plant'}},
 {id:'mayor',npc:'bun',name:'A Proper Proclamation',stages:[
  {t:'Talk with every villager',done:s=>Object.keys(NPCS).every(k=>(s.x.npc[k]||0)>=1)},
  {t:'Decorate 3 cottage spots',done:s=>Object.values(s.x.cottage).filter(Boolean).length>=3},
  {t:'Reach level 4',done:s=>SH.lvl()>=4}],reward:{coins:400,gems:4,decor:'quilt'}}];
const ACHIEVE=[
 {id:'first',name:'First Harvest',t:'Harvest your first crop',v:s=>s.x.c.harvest,n:1},
 {id:'thumb',name:'Green Thumb',t:'Harvest 50 crops',v:s=>s.x.c.harvest,n:50},
 {id:'explorer',name:'Trailblazer',t:'Explore 30 Whisperwood tiles',v:s=>s.x.c.explore,n:30},
 {id:'secret',name:'Secret Seeker',t:'Discover 4 secret places',v:s=>Object.keys(s.x.secrets).length,n:4},
 {id:'friend',name:'Beloved Neighbor',t:'Reach 5 hearts with a villager',v:s=>Math.max(0,...Object.values(s.x.npc)),n:5},
 {id:'crafter',name:'Handy Crafter',t:'Craft 10 items',v:s=>Object.values(s.x.c.crafted).reduce((a,b)=>a+b,0),n:10},
 {id:'decor',name:'Home Sweet Home',t:'Fill every cottage spot',v:s=>Object.values(s.x.cottage).filter(Boolean).length,n:5},
 {id:'companions',name:'Forest Family',t:'Collect 4 companions',v:s=>Object.keys(s.x.comp).length,n:4},
 {id:'seasons',name:'Four Seasons',t:'Reach day 29',v:s=>s.day,n:29},
 {id:'angler',name:'Gone Fishing',t:'Catch 10 fish',v:s=>Object.values(s.x.fish.caught).reduce((a,b)=>a+b,0),n:10},
 {id:'stories',name:'Storyteller',t:'Finish 2 questlines',v:s=>Object.values(s.x.ql).filter(q=>q.done).length,n:2}];
const COLLECTIONS=[
 {id:'crops',name:'Every crop grown',items:()=>Object.keys(SH.CROPS),have:s=>k=>(s.x.c.grown[k]||0)>0,label:k=>SH.CROPS[k].name,reward:{gems:5}},
 {id:'comp',name:'Forest companions',items:()=>Object.keys(COMPANIONS),have:s=>k=>!!s.x.comp[k],label:k=>COMPANIONS[k].name,reward:{gems:8,decor:'sakura'}},
 {id:'fish',name:'Creek fish',items:()=>Object.keys(FISH),have:s=>k=>!!s.x.fish.caught[k],label:k=>FISH[k].name,reward:{gems:6,decor:'clamp'}},
 {id:'secrets',name:'Secret places',items:()=>SECRETS.map(q=>q.id),have:s=>k=>!!s.x.secrets[k],label:k=>SECRETS.find(q=>q.id===k).name,reward:{gems:10,coins:500}}];
const MARKET=[
 {id:'pack_sakura',name:'Sakura Cottage Pack',kind:'Decoration pack',desc:'Blossom wallpaper, a cherry-wood bed and petal lanterns.',price:'$1.99'},
 {id:'pack_lantern',name:'Lantern Festival Collection',kind:'Seasonal collection',desc:'Floating lanterns, festival stalls and a paper-moon window.',price:'$2.99'},
 {id:'skin_scarves',name:'Cozy Scarf Skins',kind:'Companion skins',desc:'Knitted scarves for Pip, Fuzzle and Lumi.',price:'$0.99'},
 {id:'cottage_loft',name:'Cottage Loft Upgrade',kind:'Cottage customization',desc:'A cozy upstairs loft with a round window.',price:'$2.49'},
 {id:'patron',name:'Sprout Patron',kind:'Supporter membership',desc:'Support development. Monthly cosmetic gift and a patron badge. No gameplay advantage.',price:'$2.99 / month'}];

/* ---------------- State ---------------- */
function defaults(){return{v:SAVE_VERSION,tut:0,daily:{last:'',visits:0},mats:{},items:{},decor:{},cottage:{wall:null,window:null,shelf:null,floor:null,rug:null},
 npc:{},talked:{},comp:{fluffkin:{aff:0,skin:0}},fed:{},petted:{},secrets:{},ql:{},dq:{date:'',list:[]},ach:{},coll:{},
 c:{harvest:0,explore:0,orders:0,grown:{},crafted:{},talk:0,pet:0,crystals:0,flowers:0,bfly:0},player:{hat:'#e98aa4',name:'',farm:'',shirt:'#9fc6a0',hats:[]},fish:{caught:{},bag:{}},creek:{date:'',crystals:[0,0,0],lilies:[0,0,0]},story:{started:0,ch:0,f:{},done:{}},meadow:{date:'',patch:[]},mail:{date:''},egg:null,promise:null,fest:{day:0,base:0,claimed:false},daily2:{},myGifts:[],gifts:{},bond:{},home:{wall:0,floor:0},flowers:{},bfly:{},lastLvl:0,lastSeason:-1,journalTab:'disc',slot:null,dlg:null}}
function migrate(){const s=S();
  if(!s.x||typeof s.x!=='object')s.x={};
  const old=s.x.v||0;
  const d=defaults();for(const k in d){if(s.x[k]===undefined)s.x[k]=d[k]}
  for(const k in d.c)if(s.x.c[k]===undefined)s.x.c[k]=d.c[k];
  for(const k in d.cottage)if(!(k in s.x.cottage))s.x.cottage[k]=null;
  // carry over progress from v2 saves
  if(old<3){s.x.c.harvest=Math.max(s.x.c.harvest,(s.st&&s.st.harvest)||0);s.x.c.explore=Math.max(s.x.c.explore,(s.st&&s.st.explored)||0);s.x.c.orders=Math.max(s.x.c.orders,(s.st&&s.st.orders)||0);if(s.friends>0)s.x.comp.fuzzle=s.x.comp.fuzzle||{aff:0};if(s.xp>0)s.x.tut=99}
  if(!s.x.fed)s.x.fed={};const pd={hat:'#e98aa4',name:'',farm:'',shirt:'#9fc6a0',hats:[]};for(const k in pd)if(s.x.player[k]===undefined)s.x.player[k]=pd[k];if(s.x.player.name==='Farmer')s.x.player.name='';if(!s.x.fish)s.x.fish={caught:{},bag:{}};if(!s.x.creek)s.x.creek={date:'',crystals:[0,0,0],lilies:[0,0,0]};
  for(const k of Object.keys(s.x.comp)){if(!COMPANIONS[k]){const n=OLD_COMP[k]||'fluffkin';const o=s.x.comp[k];delete s.x.comp[k];if(!s.x.comp[n])s.x.comp[n]={aff:o.aff||0,skin:0};else s.x.comp[n].aff=Math.max(s.x.comp[n].aff,o.aff||0)}else if(s.x.comp[k].skin===undefined)s.x.comp[k].skin=0}
  if(!Object.keys(s.x.comp).length)s.x.comp.fluffkin={aff:0,skin:0};
  s.x.v=SAVE_VERSION;s.x.dlg=null}
const add=(bag,k,n)=>{bag[k]=(bag[k]||0)+n};
function give(r,why){const s=S(),out=[];if(!r)return'';
  if(r.coins){s.coins+=r.coins;out.push(r.coins+' coins')}
  if(r.gems){s.gems+=r.gems;out.push(r.gems+' gems')}
  for(const k in MATS)if(r[k]){add(s.x.mats,k,r[k]);out.push(r[k]+' '+MATS[k])}
  if(r.decor){add(s.x.decor,r.decor,1);out.push(DECOR[r.decor].name)}
  return out.join(', ')}
const haveNeed=need=>Object.entries(need).every(([k,n])=>k.startsWith('c_')?(S().basket[k.slice(2)]||0)>=n:(S().x.mats[k]||0)>=n);
const needText=need=>Object.entries(need).map(([k,n])=>`${n} ${k.startsWith('c_')?SH.CROPS[k.slice(2)].name:MATS[k]}`).join(' · ');

/* ---------------- Art ---------------- */
const face=(cx,cy,s=1)=>`<circle cx="${cx-6*s}" cy="${cy}" r="${2.4*s}" fill="#4a3628"/><circle cx="${cx+6*s}" cy="${cy}" r="${2.4*s}" fill="#4a3628"/><path d="M${cx-3*s} ${cy+5*s} q${3*s} ${3*s} ${6*s} 0" stroke="#4a3628" stroke-width="${1.8*s}" fill="none" stroke-linecap="round"/><ellipse cx="${cx-11*s}" cy="${cy+4*s}" rx="${3.4*s}" ry="${2*s}" fill="#ffadbd" opacity=".8"/><ellipse cx="${cx+11*s}" cy="${cy+4*s}" rx="${3.4*s}" ry="${2*s}" fill="#ffadbd" opacity=".8"/>`;
function farmerSVG(walk){const h=x().player.hat;return `<svg viewBox="0 0 60 70" class="farmer ${walk?'walk':''}"><ellipse cx="30" cy="66" rx="13" ry="3" fill="#0003"/><g class="fbody"><rect x="21" y="40" width="18" height="18" rx="7" fill="${x().player.shirt||'#9fc6a0'}"/><rect x="24" y="54" width="5" height="9" rx="2.5" fill="#6b5040" class="lg1"/><rect x="31" y="54" width="5" height="9" rx="2.5" fill="#6b5040" class="lg2"/><circle cx="30" cy="30" r="14" fill="#ffe8d4"/>${face(30,32,.8)}<ellipse cx="30" cy="20" rx="22" ry="6" fill="${h}"/><path d="M19 20 q11 -16 22 0z" fill="${h}"/><rect x="19" y="17" width="22" height="3" fill="#fff8" rx="1.5"/></g></svg>`}
function npcSVG(k){const n=NPCS[k],c=n.col;
 const ears={pip:`<path d="M14 26 q-2 -14 10 -12 M46 26 q2 -14 -10 -12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="30" cy="12" r="7" fill="#f4f0ea"/>`,
  lou:`<ellipse cx="30" cy="9" rx="13" ry="7" fill="#fff"/><rect x="20" y="10" width="20" height="7" fill="#fff"/>`,
  fern:`<path d="M30 12 q-8 -10 -2 -14 q6 6 2 14 q8 -10 12 -6 q-4 8 -12 6" fill="#7fc35e"/>`,
  bun:`<ellipse cx="20" cy="8" rx="5" ry="12" fill="${c}"/><ellipse cx="40" cy="8" rx="5" ry="12" fill="${c}"/><rect x="22" y="10" width="16" height="6" rx="2" fill="#5b4a7a"/>`,
  mochi:`<path d="M14 22 l4 -14 l9 8z M46 22 l-4 -14 l-9 8z" fill="${c}"/>`}[k];
 return `<svg viewBox="0 0 60 60"><circle cx="30" cy="34" r="22" fill="${c}"/>${ears}<circle cx="30" cy="36" r="17" fill="#fff6ec"/>${face(30,36,.9)}${k==='mochi'?'<path d="M20 41 h-8 M20 44 h-7 M40 41 h8 M40 44 h7" stroke="#4a3628" stroke-width="1"/>':''}</svg>`}
function compSVG(k){const sk=(S()&&S().x&&S().x.comp[k]&&S().x.comp[k].skin)||0;try{return window.SHScenes.creature(k,sk)}catch(e){return''}}
const hearts=(n,max=10)=>`<span class="hearts" aria-label="${n} of ${max} hearts">${Array.from({length:max},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
function decorSVG(k){const m={
 lantern:'<rect x="22" y="14" width="16" height="24" rx="5" fill="#ffd98a"/><rect x="24" y="8" width="12" height="6" fill="#8a6a5a"/><circle cx="30" cy="26" r="5" fill="#fff6b0"/>',
 crown:'<ellipse cx="30" cy="32" rx="16" ry="6" fill="none" stroke="#7fc35e" stroke-width="3"/>'+[14,22,30,38,46].map((x,i)=>`<circle cx="${x}" cy="${30-(i%2)*3}" r="4" fill="${['#ffadbd','#fff3b0','#d8cdf2','#ffc6a8','#ffadbd'][i]}"/>`).join(''),
 stool:'<ellipse cx="30" cy="26" rx="16" ry="5" fill="#c08a5a"/><path d="M18 28 l-3 18 M42 28 l3 18 M30 30 v16" stroke="#8a5a30" stroke-width="3"/>',
 mlamp:'<path d="M14 28 q16 -22 32 0z" fill="#8fd8cf"/><circle cx="22" cy="22" r="2" fill="#fff"/><circle cx="36" cy="20" r="2" fill="#fff"/><rect x="26" y="28" width="8" height="18" rx="3" fill="#fff8ee"/>',
 rug:'<ellipse cx="30" cy="30" rx="26" ry="10" fill="#ffc6d2"/><ellipse cx="30" cy="30" rx="18" ry="6" fill="#ffe0e8"/>',
 chime:'<path d="M18 10 h24" stroke="#8a6a5a" stroke-width="2"/>'+[20,26,32,38].map((x,i)=>`<path d="M${x} 10 v${14+i*3}" stroke="#bbb"/><rect x="${x-2}" y="${24+i*3}" width="4" height="9" rx="2" fill="#cfe3ff"/>`).join('')+'<path d="M40 8 a6 6 0 1 0 4 8 a5 5 0 1 1 -4 -8z" fill="#fff3b0"/>',
 snowglobe:'<circle cx="30" cy="26" r="13" fill="#dfefff" stroke="#fff" stroke-width="2"/><path d="M22 30 l8 -10 l8 10z" fill="#7fc35e"/><rect x="20" y="38" width="20" height="7" rx="2" fill="#a86c3d"/>',
 plant:'<path d="M30 30 q-14 -10 -12 -22 q8 8 12 22 q2 -16 10 -22 q2 12 -10 22" fill="#7fc35e"/><path d="M20 30 h20 l-3 16 h-14z" fill="#e0916e"/>',
 frame:'<rect x="12" y="10" width="36" height="28" rx="2" fill="#c08a5a"/><rect x="15" y="13" width="30" height="22" fill="#cfe7f5"/><path d="M15 30 q10 -10 18 -2 q6 -6 12 0 v7 h-30z" fill="#9ccf86"/>',
 curtain:'<rect x="8" y="8" width="44" height="4" fill="#a86c3d"/><path d="M10 12 q6 18 0 32 h12 q-4 -16 0 -32z M50 12 q-6 18 0 32 h-12 q4 -16 0 -32z" fill="#ffb8c8"/>',
 teapot:'<ellipse cx="30" cy="32" rx="13" ry="10" fill="#b8d8f0"/><path d="M43 30 q8 -2 8 -8" stroke="#b8d8f0" stroke-width="4" fill="none"/><path d="M17 28 q-6 4 0 10" stroke="#b8d8f0" stroke-width="3" fill="none"/><circle cx="30" cy="21" r="3" fill="#8aaed0"/>',
 quilt:'<rect x="6" y="22" width="48" height="18" rx="4" fill="#ffd9b0"/>'+[0,1,2,3,4,5].map(i=>`<rect x="${8+i*8}" y="${i%2?24:31}" width="7" height="7" fill="${['#ffadbd','#b8e0b0','#d8cdf2'][i%3]}"/>`).join(''),
 sakura:'<path d="M8 16 q20 4 44 -4" stroke="#8a5a40" stroke-width="3" fill="none"/>'+[[16,16],[28,14],[40,10],[22,22],[46,16]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#ffc6d2"/>`).join(''),
 fan:'<path d="M30 40 l-18 -22 a24 24 0 0 1 36 0z" fill="#fff3b0" stroke="#e0a060"/><path d="M30 40 v8" stroke="#8a5a40" stroke-width="3"/>',
 acorn:'<path d="M8 12 q22 14 44 0" stroke="#8a5a40" stroke-width="2" fill="none"/>'+[14,24,34,44].map((x,i)=>`<ellipse cx="${x}" cy="${18+(i%2)*2}" rx="4" ry="5" fill="#c08a5a"/><path d="M${x-4} ${15+(i%2)*2} h8" stroke="#6b4a2a" stroke-width="3"/>`).join(''),
 clamp:'<path d="M22 44 h16 l-3 -8 h-10z" fill="#a87a52"/><path d="M24 36 l3 -22 l6 10 l5 -14 l3 26z" fill="#c9b9e8" stroke="#fff"/><circle cx="31" cy="26" r="14" fill="#9fe6f6" opacity=".35"/>',
 garland:'<path d="M6 10 q24 18 48 0" stroke="#7fae6a" stroke-width="2" fill="none"/>'+[12,22,32,42,50].map((x,i)=>`<circle cx="${x}" cy="${14+(i%2)*3}" r="4" fill="${['#f6a6c4','#fff','#f9bcd3'][i%3]}"/>`).join(''),
 lantstring:'<path d="M4 8 q26 12 52 0" stroke="#6b4440" stroke-width="1.5" fill="none"/>'+[10,22,34,46].map(x=>`<rect x="${x-3}" y="12" width="7" height="10" rx="3" fill="#ffd98a" stroke="#a8743a"/>`).join(''),
 scarecrow:'<path d="M30 14 v32 M16 24 h28" stroke="#a87a52" stroke-width="3"/><circle cx="30" cy="12" r="7" fill="#f4dcae" stroke="#a87a52"/><path d="M20 8 h20 l-4 -6 h-12z" fill="#e98aa4"/><rect x="22" y="22" width="16" height="14" rx="3" fill="#b8d9e8"/>',
 snowman:'<circle cx="30" cy="36" r="11" fill="#fff" stroke="#c9d4e0"/><circle cx="30" cy="20" r="8" fill="#fff" stroke="#c9d4e0"/><path d="M30 20 l7 2 -7 1z" fill="#f2a93b"/><rect x="22" y="9" width="16" height="4" fill="#e98aa4"/>',
 chandelier:'<path d="M30 2 v10" stroke="#a8743a" stroke-width="2"/><path d="M12 18 q18 14 36 0" stroke="#a8743a" stroke-width="3" fill="none"/>'+[12,22,30,38,48].map(x=>`<circle cx="${x}" cy="${x===30?28:22}" r="4" fill="#fff3b0"/><circle cx="${x}" cy="${x===30?28:22}" r="9" fill="#fff3b0" opacity=".3"/>`).join(''),
 mitten:'<path d="M8 10 q22 12 44 0" stroke="#bbb" stroke-width="2" fill="none"/>'+[14,26,38,48].map((x,i)=>`<rect x="${x-4}" y="${14+(i%2)*2}" width="8" height="11" rx="4" fill="${['#ffadbd','#b8d8f0','#d8cdf2','#b8e0b0'][i]}"/>`).join('')};
 return `<svg viewBox="0 0 60 50">${m[k]||''}</svg>`}
const matIcon=k=>({crystal:'<path d="M22 42 L28 14 L34 42z M32 42 L40 20 L46 42z" fill="#c9b9e8" stroke="#fff"/>',lily:'<ellipse cx="30" cy="34" rx="18" ry="7" fill="#7fbf7a"/><circle cx="30" cy="28" r="7" fill="#f9bcd3"/><circle cx="30" cy="28" r="3" fill="#fff3a0"/>',wood:'<path d="M14 34 l32 -10 M16 28 l30 -8 M18 40 l26 -8" stroke="#a86c3d" stroke-width="5" stroke-linecap="round"/>',petal:'<g fill="#ffb8c8"><ellipse cx="24" cy="26" rx="7" ry="11" transform="rotate(-30 24 26)"/><ellipse cx="36" cy="28" rx="7" ry="11" transform="rotate(30 36 28)"/></g>',mush:'<path d="M14 30 q16 -22 32 0z" fill="#8fd8cf"/><rect x="26" y="30" width="8" height="12" rx="3" fill="#fff8ee"/>',moon:'<path d="M26 10 a14 14 0 1 0 14 22 a11 11 0 1 1 -14 -22z" fill="#d8cdf2"/>',frost:'<path d="M30 8 v34 M14 17 l32 16 M46 17 l-32 16" stroke="#9ec8f0" stroke-width="4" stroke-linecap="round"/>',feather:'<path d="M18 44 q4 -30 26 -36 q-2 24 -26 36z" fill="#fff3b0" stroke="#e8c060"/>'}[k]);

/* ---------------- Map generation & exploration ---------------- */
function mapGen(m){
  const open=m.map((t,i)=>i).filter(i=>m[i].e==='grass'&&i!==12);
  for(let n=0;n<3&&open.length;n++){const i=open.splice(Math.random()*open.length|0,1)[0];m[i].e='mat'}
  if(open.length){const i=open.splice(Math.random()*open.length|0,1)[0];m[i].e='secret'}
  if(open.length&&Math.random()<.35){const i=open.splice(Math.random()*open.length|0,1)[0];m[i].e='comp'}
  return m}
function pickMat(){const s=season().id;const pool=['wood','wood','petal','mush','petal','wood','mush'];if(s==='winter')pool.push('frost','frost');if(x().comp.mossbun)pool.push('wood');if(x().comp.lumi)pool.push('feather');if(x().comp.mushling)pool.push('mush');if(Math.random()<.08)return'moon';return rnd(pool)}
function explore(e,t){const s=S();
  if(e==='mat'){const k=pickMat(),n=1+(Math.random()*2|0);add(s.x.mats,k,n);t.e='done';SH.sfx('friend');SH.toast(`Found ${n} ${MATS[k]}!`);countExplore();return true}
  if(e==='secret'){const left=SECRETS.filter(q=>!s.x.secrets[q.id]);const q=left.length?rnd(left):rnd(SECRETS);const first=!s.x.secrets[q.id];s.x.secrets[q.id]=s.x.secrets[q.id]||{day:s.day};t.e='done';
    const r=first?q.reward:{coins:40};const got=give(r);SH.sfx('fanfare');if(first){confetti();setTimeout(()=>react('secret'),400)}
    let extra='';if(q.id==='glade'&&!s.x.comp.lumi){s.x.comp.lumi={aff:0,skin:0};extra=`<p><b>Lumi</b>, a glowing firefly, decides to light your way home!</p>`}if(q.id==='hollow'&&!s.x.comp.emberkin&&Object.keys(s.x.secrets).length>=3){s.x.comp.emberkin={aff:0,skin:0};extra=`<p>A sleepy <b>Emberkin</b> hatches from a warm lantern and nuzzles you. Legendary!</p>`}
    SH.modal(`<div class="secret-art">${secretSVG(q.id)}</div><h2>${first?'Secret discovered!':'You return to a secret place'}</h2><h3>${q.name}</h3><p>${q.desc}</p>${extra}<p class="note">${first?'Added to your journal. ':''}You found ${got}.</p><button class="btn big" data-a="close">How magical</button>`);countExplore();return true}
  if(e==='comp'){const pool=Object.keys(COMPANIONS).filter(k=>!s.x.comp[k]&&COMPANIONS[k].found==='woods');
    t.e='done';countExplore();
    if(!pool.length){add(s.x.mats,'petal',2);SH.toast('A shy creature left you 2 wild petals');return true}
    const k=rnd(pool);s.x.comp[k]={aff:0,skin:0};SH.sfx('friend');SH.modal(`${compSVG(k)}<h2>${COMPANIONS[k].name} wants to join you!</h2><p>${COMPANIONS[k].desc}</p><p class="note">Visit them in your Cottage to pet and feed them.</p><button class="btn big" data-a="close">Welcome home</button>`);return true}
  if(e==='friend'){countExplore();if(!s.x.comp.fluffkin){s.x.comp.fluffkin={aff:0,skin:0}}return false}
  if(e==='grass'){if(Math.random()<.35){const k=pickMat();add(s.x.mats,k,1);t.e='done';SH.toast('Rustling in the grass... 1 '+MATS[k]);countExplore();return true}}
  countExplore();return false}
function countExplore(){x().c.explore++;bumpDaily('explore')}
function secretSVG(id){const pal={glade:['#2f4a6a','#cfe3ff'],ring:['#4f7a4a','#ff9ab0'],shrine:['#5a6a4a','#d0c0a0'],willow:['#3e6a50','#b8e0b0'],spring:['#3a6a8a','#bfefff'],golem:['#5a6a5a','#ffc6d2'],hollow:['#3a3a5a','#ffd98a'],nest:['#7fb0d8','#fff']}[id]||['#4a6a5a','#fff'];
 return `<svg viewBox="0 0 200 110"><rect width="200" height="110" rx="14" fill="${pal[0]}"/><circle cx="160" cy="26" r="12" fill="#fff6c0" opacity=".9"/><path d="M0 80 q50 -30 100 -6 t100 -4 v40 h-200z" fill="#0003"/><g fill="${pal[1]}">${Array.from({length:14},(_,i)=>`<circle cx="${10+i*14}" cy="${30+((i*37)%40)}" r="${1+(i%3)}" opacity=".8"/>`).join('')}</g><ellipse cx="100" cy="80" rx="40" ry="10" fill="${pal[1]}" opacity=".5"/></svg>`}

/* ---------------- Daily systems ---------------- */
const DQ_POOL=[{k:'harvest',t:n=>`Harvest ${n} crops`,n:[4,6,8]},{k:'explore',t:n=>`Explore ${n} Whisperwood tiles`,n:[3,4,5]},{k:'talk',t:n=>`Chat with ${n} villagers`,n:[2,3]},{k:'pet',t:n=>`Pet ${n} companions`,n:[1,2]},{k:'craft',t:n=>`Craft ${n} item${n>1?'s':''}`,n:[1,2]},{k:'order',t:n=>`Fill ${n} village order${n>1?'s':''}`,n:[1,2]},{k:'fish',t:n=>`Catch ${n} fish at Crystal Creek`,n:[2,3]}];
function ensureDaily(){const d=x().dq;if(d.date===today())return;const pool=[...DQ_POOL].sort(()=>Math.random()-.5).slice(0,3);d.date=today();x().fed={};d.list=pool.map(p=>{const n=rnd(p.n);return{k:p.k,n,v:0,t:p.t(n),claimed:false,r:{coins:30+n*10,[rnd(['wood','petal','mush'])]:2}}});x().talked={};x().petted={}}
function bumpDaily(k){ensureDaily();x().dq.list.forEach(q=>{if(q.k===k&&q.v<q.n)q.v++})}
const DAILY_GIFTS=[{coins:40},{wood:3,petal:2},{coins:60},{mush:3},{coins:80,petal:3},{moon:1,wood:2},{gems:3,coins:100}];
function dailyCheck(){const d=x().daily;if(d.last===today()||x().tut<99)return;d.visits++;d.last=today();const r=DAILY_GIFTS[(d.visits-1)%7];const got=give(r);SH.save();
  setTimeout(()=>qmodal(`<div class="gift">${giftSVG()}</div><h2>Daily discovery</h2><p>A little parcel was waiting on your doorstep.</p><p><b>${got}</b></p><p class="note">Visit ${d.visits} · Every 7th visit holds something extra special. There's no penalty for missing a day.</p><button class="btn big" data-a="close">Lovely!</button>`),400)}
const giftSVG=()=>`<svg viewBox="0 0 100 90"><rect x="18" y="38" width="64" height="44" rx="6" fill="#ffc6d2"/><rect x="14" y="28" width="72" height="14" rx="5" fill="#ffadbd"/><rect x="45" y="28" width="10" height="54" fill="#fff3b0"/><path d="M50 28 q-18 -22 -22 -6 q4 8 22 6 q18 2 22 -6 q-4 -16 -22 6" fill="#fff3b0"/></svg>`;

/* ---------------- Seasons ---------------- */
function seasonCheck(){const i=Math.floor((S().day-1)/7)%4;document.body.dataset.season=SEASONS[i].id;
  if(x().lastSeason!==i){const first=x().lastSeason===-1;x().lastSeason=i;const s=SEASONS[i];const gift={spring:'sakura',summer:'fan',autumn:'acorn',winter:'mitten'}[s.id];
    if(!first||S().day>1){add(x().decor,gift,1);setTimeout(()=>qmodal(`<h2>${s.name} has arrived!</h2><p>${s.note}</p><p>A seasonal gift: <b>${DECOR[gift].name}</b> for your cottage.</p><button class="btn big" data-a="close">Hello, ${s.name.toLowerCase()}</button>`),300)}}}
function seasonFX(){const box=document.querySelector('.scene');if(!box)return;let fx=box.querySelector('.fx');if(!fx){fx=document.createElement('div');fx.className='fx';box.appendChild(fx)}
  const s=season().fx;if(fx.dataset.s===s)return;fx.dataset.s=s;fx.innerHTML=Array.from({length:14},(_,i)=>`<i style="left:${(i*7.3)%100}%;animation-delay:${(i*.9)%8}s;animation-duration:${7+(i%5)}s"></i>`).join('')}

/* ---------------- Tutorial ---------------- */
const TUT=[
 ['Welcome to Sprout Hollow!','I\'m Fluffkin! This little hollow is yours to grow. Let me show you around. It only takes a moment.'],
 ['Plant seeds','Choose a seed from the Seed tray, then tap an empty plot. Turnips are quick and cheap to start with.'],
 ['Water and wait','Watering makes crops grow twice as fast. Rainy days water them for you!'],
 ['Harvest and sell','Tap a glowing crop to harvest it. Sell from your basket, or fill village orders for extra coins.'],
 ['Explore Whisperwood','The forest hides materials, companions, treasure and secret places. Every step reveals something.'],
 ['Your journal','The Journal keeps your discoveries, achievements and collections. Villagers in the Village have stories to share.'],
 ['That\'s everything!','There are no timers to stress about here. Play at your own pace. Happy farming!']];
function tutorial(){const t=x().tut;if(t>=TUT.length){if(x().tut<99){x().tut=99;SH.save();startStory();dailyCheck()}return}
  const [h,b]=TUT[t];SH.modal(`<div class="tut-art">${compSVG('fluffkin')}</div><p class="step">${t+1} of ${TUT.length}</p><h2>${h}</h2><p>${b}</p><div class="tools center"><button class="btn" data-x="tut-skip">Skip tour</button><button class="btn big" data-x="tut-next">${t===TUT.length-1?'Start playing':'Next'}</button></div>`)}

/* ---------------- Checks: achievements, questlines, collections ---------------- */
function checkAll(){const s=S();
  Object.keys(s.x.comp).forEach(k=>{if(s.x.comp[k].aff>=10&&!s.x.bond[k]&&COMPANIONS[k]){s.x.bond[k]=s.day;setTimeout(()=>{confetti();qmodal(`${compSVG(k)}<p class="step">Best friends</p><h2>A special moment with ${COMPANIONS[k].name}</h2><p>${BONDS[k]||''}</p><button class="btn big" data-a="close">I love you too</button>`)},300)}});
  ACHIEVE.forEach(a=>{if(!s.x.ach[a.id]&&a.v(s)>=a.n){s.x.ach[a.id]=s.day;SH.toast('Achievement: '+a.name+'!');SH.sfx('fanfare')}});
  QUESTLINES.forEach(q=>{const st=s.x.ql[q.id]||(s.x.ql[q.id]={stage:0,done:false});if(st.done||!st.started)return;
    while(st.stage<q.stages.length&&q.stages[st.stage].done(s)){st.stage++;if(st.stage<q.stages.length)SH.toast(q.name+': next step!')}
    if(st.stage>=q.stages.length&&!st.ready){st.ready=true;SH.toast(q.name+' complete! Visit '+NPCS[q.npc].name)}})}

/* ---------------- Views ---------------- */
const TABS=['village','cottage','collection','journal','market','creek','meadow'];
function boardView(tab){const s=S();
  if(tab==='village')return `<div class="village">${Object.keys(NPCS).map(k=>{const n=NPCS[k],h=s.x.npc[k]||0;return `<button class="npc" data-x="talk" data-k="${k}" aria-label="Talk to ${n.name}"><span class="por">${npcSVG(k)}</span><b>${n.name}</b>${hearts(Math.min(h,10))}<small>${s.x.talked[k]?'Chatted today':'Tap to chat'}</small></button>`}).join('')}</div>${s.x.dlg?dialogView():''}`;
  if(tab==='cottage')return cottageView();
  if(tab==='journal')return journalView();
  if(tab==='collection')return collectionView();
  if(tab==='creek')return creekView();
  if(tab==='meadow')return meadowView();
  if(tab==='market')return marketView();
  return''}
function dialogView(){const d=x().dlg,n=NPCS[d.k],h=x().npc[d.k]||0;const ql=QUESTLINES.find(q=>q.npc===d.k);const st=ql&&x().ql[ql.id];
  let questBtn='';if(ql){if(!st||!st.started)questBtn=`<button class="btn" data-x="ql-start" data-k="${ql.id}">Ask about "${ql.name}"</button>`;else if(st.ready&&!st.done)questBtn=`<button class="btn big" data-x="ql-claim" data-k="${ql.id}">Finish "${ql.name}"</button>`}
  const crops=Object.entries(S().basket).filter(e=>e[1]>0);
  return `<div class="dialog"><span class="por">${npcSVG(d.k)}</span><div class="bubble"><b>${n.name}</b> <small>${n.role}</small><p>${esc(d.line)}</p>${hearts(Math.min(h,10))}<p class="note">Favorite gift: ${SH.CROPS[n.likes].name}</p><div class="tools">${questBtn}${crops.map(([k,c])=>`<button class="btn small" data-x="gift" data-k="${d.k}" data-c="${k}">Give ${SH.CROPS[k].name}</button>`).join('')}<button class="btn small" data-x="dlg-close">Bye!</button></div></div></div>`}
function cottageView(){const s=S(),c=s.x.cottage,sel=s.x.slot;
  const spot=(slot,x0,y0,w,h)=>`<g class="spot ${sel===slot?'sel':''}" data-x="slot" data-k="${slot}" role="button" tabindex="0" aria-label="${slot} spot"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="10" fill="${c[slot]?'transparent':'#fff6'}" stroke="${sel===slot?'#e98aa4':'#a86c3d55'}" stroke-dasharray="6 5" stroke-width="2.5"/>${c[slot]?`<svg x="${x0}" y="${y0}" width="${w}" height="${h}" viewBox="0 0 60 50">${decorSVG(c[slot]).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>`:`<text x="${x0+w/2}" y="${y0+h/2+5}" text-anchor="middle" font-size="13" fill="#a86c3d">+ ${slot}</text>`}</g>`;
  const comps=Object.keys(s.x.comp);
  return `<div class="cottage"><svg viewBox="0 0 400 171" class="room"><image href="art/home.webp" width="400" height="171" preserveAspectRatio="xMidYMid slice"/><rect width="400" height="171" fill="${HOME_STYLES.wall[s.x.home.wall||0][0]}" opacity="${s.x.home.wall?0.18:0}" style="mix-blend-mode:multiply"/>
   ${spot('wall',16,18,42,34)}${spot('window',96,44,48,26)}${spot('shelf',178,40,44,30)}${spot('floor',292,104,48,40)}${spot('rug',172,140,92,24)}</svg>
   <div class="pals">${comps.map(k=>`<button class="pal" data-x="pet" data-k="${k}" aria-label="Pet ${COMPANIONS[k].name}">${compSVG(k)}<b>${COMPANIONS[k].name}</b>${hearts(Math.min(10,Math.floor(s.x.comp[k].aff/2)),5)}<small>${s.x.petted[k]?'Happy today':'Tap to pet'}</small></button>`).join('')}</div></div>`}
function journalView(){const s=S(),t=s.x.journalTab;
  const tabs=[['disc','Discoveries'],['ach','Achievements'],['coll','Collections'],['save','Save']].map(([k,l])=>`<button class="btn tape ${t===k?'on':''}" data-x="jtab" data-k="${k}">${l}</button>`).join('');
  let body='';
  if(t==='disc'){body=`<h3>Secret places</h3><div class="grid">${SECRETS.map(q=>s.x.secrets[q.id]?`<div class="card found">${secretSVG(q.id)}<b>${q.name}</b><small>${q.desc}</small></div>`:`<div class="card locked"><b>???</b><small>Somewhere in Whisperwood</small></div>`).join('')}</div>
   <h3>Companions</h3><div class="grid">${Object.keys(COMPANIONS).map(k=>s.x.comp[k]?`<div class="card found">${compSVG(k)}<b>${COMPANIONS[k].name}</b><small>${COMPANIONS[k].perk}</small></div>`:`<div class="card locked"><b>???</b><small>${{woods:'Wanders Whisperwood',secret:'Glows near a moonlit place',legend:'Sleeps where old lanterns hang'}[COMPANIONS[k].found]}</small></div>`).join('')}</div>
   <h3>Creek fish</h3><div class="grid">${Object.keys(FISH).map(k=>s.x.fish.caught[k]?`<div class="card found">${fishSVG(k)}<b>${FISH[k].name}</b><small>${FISH[k].rarity} · ${s.x.fish.caught[k]} caught</small></div>`:`<div class="card locked"><b>???</b><small>${FISH[k].rarity}</small></div>`).join('')}</div>
   <h3>Crops grown</h3><div class="grid">${Object.keys(SH.CROPS).map(k=>{const n=s.x.c.grown[k]||0;return `<div class="card ${n?'found':'locked'}">${n?SH.cropSVG({k,gold:false},3):''}<b>${n?SH.CROPS[k].name:'???'}</b><small>${n?n+' grown':'Not grown yet'}</small></div>`}).join('')}</div>`}
  if(t==='ach')body=ACHIEVE.map(a=>{const v=Math.min(a.n,a.v(s));return `<div class="row ach ${s.x.ach[a.id]?'got':''}"><span><b>${a.name}</b><br><small>${a.t}</small></span><span>${s.x.ach[a.id]?'Earned':v+' / '+a.n}</span></div><div class="meter"><i style="width:${v/a.n*100}%"></i></div>`}).join('');
  if(t==='coll')body=COLLECTIONS.map(c=>{const it=c.items(),h=c.have(s),n=it.filter(h).length,done=n===it.length,cl=s.x.coll[c.id];return `<div class="panel inner"><div class="row"><span><b>${c.name}</b> · ${n}/${it.length}</span><button class="btn" data-x="coll" data-k="${c.id}" ${done&&!cl?'':'disabled'}>${cl?'Claimed':'Reward: '+rewardText(c.reward)}</button></div><p class="chips">${it.map(k=>`<span class="chip ${h(k)?'on':''}">${h(k)?c.label(k):'???'}</span>`).join('')}</p></div>`}).join('');
  if(t==='save')body=`<p>Your farm saves automatically on this device. To move it to another device, copy your save code and paste it there.</p><div class="tools"><button class="btn" data-x="export">Copy save code</button></div><label for="imp">Paste a save code</label><textarea id="imp" rows="3"></textarea><div class="tools"><button class="btn" data-x="import">Load save code</button><button class="btn" data-x="restore">Restore yesterday's backup</button></div><p class="note">A backup is kept automatically once a day.</p>
   <h3>Your farmer</h3><label for="pname2">Name</label><input id="pname2" maxlength="18" value="${esc(x().player.name||'')}"><label for="fname2">Farm name</label><input id="fname2" maxlength="24" value="${esc(x().player.farm||'')}"><div class="tools"><button class="btn" data-x="savename">Save names</button></div><p>Outfit colour</p><div class="tools">${['#9fc6a0','#f4bfa7','#c9b9e8','#b8d9e8','#e8b6c5'].map(c=>`<button class="swatch ${x().player.shirt===c?'on':''}" style="background:${c}" data-x="shirt" data-k="${c}" aria-label="Outfit colour"></button>`).join('')}</div><p>Hat colour</p><div class="tools">${['#e98aa4','#9fc6e8','#b8d8a0','#c8b4e8','#f2c48a',...(x().player.hats||[])].map(c=>`<button class="swatch ${x().player.hat===c?'on':''}" style="background:${c}" data-x="hat" data-k="${c}" aria-label="Hat colour ${c}"></button>`).join('')}</div><div class="tools"><button class="btn" data-x="tut-replay">Replay the tour</button></div>`;
  return `<div class="journal"><div class="jtabs">${tabs}</div>${body}</div>`}
const rewardText=r=>Object.entries(r).map(([k,v])=>k==='decor'?DECOR[v].name:k==='coins'?v+' coins':k==='gems'?v+' gems':v+' '+MATS[k]).join(' + ');
function collectionView(){const s=S();const own=Object.keys(COMPANIONS);
  return `<div class="coll"><div class="grid wide">${own.map(k=>{const c=COMPANIONS[k],o=s.x.comp[k];
   if(!o)return `<div class="card locked creature"><b>???</b><span class="rar r-${c.rarity.toLowerCase()}">${c.rarity}</span><small>${{woods:'Wanders Whisperwood',secret:'Glows near a moonlit place',legend:'Sleeps where old lanterns hang'}[c.found]}</small></div>`;
   const lvl=Math.floor(o.aff/2),fav=SH.CROPS[c.food];
   return `<div class="card found creature"><span class="rar r-${c.rarity.toLowerCase()}">${c.rarity}</span>${compSVG(k)}<b>${c.name}</b>${hearts(Math.min(5,lvl),5)}<small>${c.desc}</small><small><b>Mood:</b> ${mood(k)}<br><b>Personality:</b> ${c.personality}<br><b>Favorite food:</b> ${fav?fav.name:'?'}<br><b>Gift:</b> ${c.perk}</small>
   <div class="tools center"><button class="btn small" data-x="pet" data-k="${k}">${s.x.petted[k]?'Petted today':'Pet'}</button><button class="btn small" data-x="feed" data-k="${k}" ${s.x.fed[k]||!Object.values(s.basket).some(n=>n>0)?'disabled':''}>${s.x.fed[k]?'Fed today':'Feed'}</button></div>
   <div class="tools center">${SKINS.map((nm,i)=>`<button class="chipbtn ${o.skin===i?'on':''}" data-x="skin" data-k="${k}" data-c="${i}" ${o.aff>=i*5?'':'disabled'} title="${o.aff>=i*5?nm:'Unlocks at '+(i*5)+' affection'}">${o.aff>=i*5?nm:'Locked'}</button>`).join('')}</div></div>`}).join('')}</div></div>`}
/* ---------------- Crystal Creek & fishing ---------------- */
const creekOpen=()=>SH.lvl()>=2||x().c.explore>=8;
let F={st:'idle',msg:'Cast your line into the creek.',fish:null,t:0};
function fishSVG(k){const c=FISH[k].col;return `<svg viewBox="0 0 80 50"><path d="M58 25 l16 -12 v24z" fill="${c}" stroke="#6b5048" stroke-width="2"/><ellipse cx="36" cy="25" rx="26" ry="16" fill="${c}" stroke="#6b5048" stroke-width="2"/><ellipse cx="30" cy="20" rx="10" ry="5" fill="#fff" opacity=".5"/><circle cx="20" cy="22" r="3" fill="#3b2a24"/><circle cx="19" cy="21" r="1" fill="#fff"/><ellipse cx="16" cy="29" rx="4" ry="2" fill="#ffadbd" opacity=".8"/><path d="M30 34 q6 6 12 0" stroke="#6b5048" stroke-width="1.5" fill="none"/>${k==='lantern'?'<circle cx="36" cy="25" r="24" fill="#fff3b0" opacity=".35"/>':''}</svg>`}
function rollFish(){const sea=season().id,wx=SH.S.wx;const pool=Object.entries(FISH).filter(([k,f])=>(!f.seasons||f.seasons.includes(sea))&&(f.weather===undefined||f.weather===wx));
  let tot=0;const w=pool.map(([k,f])=>{let v=f.w;if(k==='lantern'&&wx===3)v*=6;if(x().comp.lumi&&k==='lantern')v*=2;tot+=v;return[k,v]});let r=Math.random()*tot;for(const [k,v] of w){if((r-=v)<=0)return k}return'minnow'}
function creekDaily(){const c=x().creek;if(c.date!==today()){c.date=today();c.crystals=[0,0,0];c.lilies=[0,0,0]}}
function cast(){if(F.st==='wait'||F.st==='bite')return;const id=Date.now();F={st:'wait',msg:'Waiting for a nibble...',fish:null,t:id};SH.sfx('water');
  const bite=()=>{if(F.t!==id||F.st!=='wait')return;if(PAUSED)return setTimeout(bite,500);F.st='bite';F.fish=rollFish();F.msg='Something is tugging! Reel in!';SH.sfx('coin');SH.render();
    setTimeout(()=>{if(F.t===id&&F.st==='bite'){F={st:'done',msg:'It slipped away. Try again!',fish:null,t:0};SH.render()}},1500)};
  setTimeout(bite,1800+Math.random()*3200);SH.render()}
function reel(){if(F.st==='wait'){F={st:'done',msg:'Too early! Wait for the bobber to dip and the "!" to appear.',fish:null,t:0};SH.sfx('no');SH.render();return}
  if(F.st!=='bite')return;const k=F.fish,s=S();add(s.x.fish.caught,k,1);add(s.x.fish.bag,k,1);bumpDaily('fish');const fsh=FISH[k];F={st:'done',msg:'Nice catch! Cast again whenever you like.',fish:null,t:0};
  SH.sfx(fsh.rarity==='Common'?'harvest':'gold');if(fsh.rarity!=='Common'&&fsh.rarity!=='Uncommon')confetti();react('fish');SH.modal(`<div class="fishpic">${fishSVG(k)}</div><h2>You caught a ${fsh.name}!</h2><p><span class="rar r-${fsh.rarity.toLowerCase()}">${fsh.rarity}</span></p><p>${fsh.desc}</p><button class="btn big" data-a="close">Hooray!</button>`);checkAll();SH.save();SH.render()}
function creekView(){creekDaily();const c=x().creek;
  if(!creekOpen())return `<div class="lockmsg"><h3>Crystal Creek</h3><p>The path to the creek is overgrown. Explore 8 Whisperwood tiles or reach level 2 to clear it.</p><p class="note">Explored so far: ${x().c.explore}/8</p></div>`;
  const st=F.st,bob=st==='bite'?'bite':st==='wait'?'float':'';
  const spot=(arr,i,kind,x0,y0,svg)=>arr[i]?'':`<g class="pick" data-x="${kind}" data-k="${i}" role="button" aria-label="Collect ${kind==='crystal'?'crystal':'water lily'}" transform="translate(${x0} ${y0})">${svg}</g>`;
  const crys='<circle r="22" fill="url(#cgx)"/><path d="M-10 10 L-5 -16 L0 10z M-2 10 L5 -22 L12 10z" fill="#c9b9e8" stroke="#fff" stroke-width="1.5"/>';
  const lily='<ellipse rx="18" ry="7" fill="#7fbf7a" stroke="#5f9a5a"/><circle cy="-4" r="6" fill="#f9bcd3"/><circle cy="-4" r="2.5" fill="#fff3a0"/>';
  const fm=farmerSVG(false).replace('<svg viewBox="0 0 60 70"','<svg x="-22" y="-60" width="44" height="52" viewBox="0 0 60 70"');
  return `<div class="creek"><svg viewBox="0 0 400 240" class="pond" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdcef"/><stop offset="1" stop-color="#5fb3d6"/></linearGradient><radialGradient id="cgx"><stop offset="0" stop-color="#e8fbff" stop-opacity=".9"/><stop offset="1" stop-color="#9fe6f6" stop-opacity="0"/></radialGradient></defs>
   <rect width="400" height="240" fill="#b6d6a4"/><path d="M0 60 Q100 30 200 50 T400 40 V240 H0z" fill="url(#pw)"/>
   ${[0,1,2,3,4,5].map(i=>`<path class="shim" d="M${30+i*60} ${90+(i%3)*40}h${24+(i%2)*10}" stroke="#e6f7ff" stroke-width="3" stroke-linecap="round" style="animation-delay:${i*.4}s"/>`).join('')}
   <path d="M0 200 Q120 180 220 200 T400 196 V240 H0z" fill="#9cc98a"/><rect x="250" y="160" width="150" height="16" rx="4" fill="#a87a52"/>${[262,300,338,376].map(x=>`<rect x="${x}" y="176" width="6" height="40" fill="#8a5e3e"/>`).join('')}
   <g transform="translate(330 160)">${fm}</g>
   <path d="M346 110 Q260 30 ${st==='wait'||st==='bite'?'170 120':'300 150'}" stroke="#6b5048" stroke-width="2" fill="none"/>
   ${st==='wait'||st==='bite'?`<g transform="translate(170 120)"><g class="bobber ${bob}"><circle r="8" fill="#fff"/><path d="M-8 0 a8 8 0 0 0 16 0z" fill="#e98aa4"/></g>${st==='bite'?'<circle r="16" fill="none" stroke="#fff" stroke-width="2" class="ripple"/><text y="-18" text-anchor="middle" font-size="22" font-weight="700" fill="#e06a8a">!</text>':''}</g>`:''}
   ${spot(c.crystals,0,'crystal',40,205,crys)}${spot(c.crystals,1,'crystal',120,214,crys)}${spot(c.crystals,2,'crystal',210,206,crys)}
   ${spot(c.lilies,0,'lily',70,110,lily)}${spot(c.lilies,1,'lily',250,90,lily)}${spot(c.lilies,2,'lily',110,165,lily)}</svg>
   <p class="hand fishmsg" role="status">${esc(F.msg)}</p>
   <div class="tools center"><button class="btn big" data-x="${st==='wait'||st==='bite'?'reel':'cast'}">${st==='wait'||st==='bite'?'Reel in!':'Cast line'}</button></div></div>`}

function marketView(){const ent=window.SHEnt;
  return `<div class="market"><div class="banner"><h3>The Wandering Market</h3><p>Optional cosmetics that support Sprout Hollow. Everything that affects gameplay stays free, forever.</p></div><div class="grid wide">${MARKET.map(m=>`<div class="card offer ${ent&&ent.has(m.id)?'owned':''}"><span class="tag">${m.kind}</span><b>${m.name}</b><small>${m.desc}</small><button class="btn" disabled>${ent&&ent.has(m.id)?'Owned':'Coming soon · '+m.price}</button></div>`).join('')}</div><p class="note">Purchases aren't open yet. When they are, ownership will be checked by our server, never decided by the app on your device.</p></div>`}
function sideView(tab,side){const s=S();ensureDaily();
  const today=`<div class="panel journal-card"><h2>Today</h2><p class="season">${season().name}, day ${seasonDay()} of 7 · ${season().note}</p>${festPanel()}${s.x.story.started&&s.x.story.ch<STORY.length?`<p class="note">Story: <b>${STORY[s.x.story.ch].name}</b> (see Quests)</p>`:''}${s.x.dq.list.map((q,i)=>`<div class="row"><span>${q.t}<br><small>${q.v}/${q.n} · ${rewardText(q.r)}</small></span><button class="btn small" data-x="dq" data-k="${i}" ${q.v>=q.n&&!q.claimed?'':'disabled'}>${q.claimed?'Done':'Claim'}</button></div>`).join('')}</div>`;
  const mats=Object.entries(s.x.mats).filter(e=>e[1]>0);
  const bag=`<div class="panel"><h2>Materials</h2>${mats.length?`<div class="mats">${mats.map(([k,n])=>`<span class="mat"><svg viewBox="0 0 60 50">${matIcon(k)}</svg>${MATS[k]} × ${n}</span>`).join('')}</div>`:'<p>Explore Whisperwood to gather materials.</p>'}</div>`;
  if(tab==='farm'||tab==='woods')return today+side+bag;
  if(tab==='quests')return storyPanel()+questlinePanel()+today+side;
  if(tab==='share')return side+socialPanels();
  if(tab==='meadow'){const fl=Object.entries(s.x.flowers).filter(e=>e[1]>0);return `<div class="panel"><h2>Flower basket</h2>${fl.length?fl.map(([k,n])=>`<div class="row"><span>${FLOWERS[k].name} × ${n}<br><small>${FLOWERS[k].rarity}</small></span><button class="btn small" data-x="sellflower" data-k="${k}">Sell ${FLOWERS[k].sell+(s.x.comp.bumble?5:0)}</button></div>`).join(''):'<p>Pick some flowers!</p>'}</div><div class="panel"><h2>Butterflies</h2><div class="grid">${Object.keys(BUTTERFLIES).map(k=>s.x.bfly[k]?`<div class="card found">${bflySVG(k)}<b>${BUTTERFLIES[k].name}</b><small>${BUTTERFLIES[k].rarity} · ${s.x.bfly[k]} caught</small></div>`:`<div class="card locked"><b>???</b><small>${BUTTERFLIES[k].rarity}</small></div>`).join('')}</div></div>`+today}
  if(tab==='village')return questlinePanel()+bag;
  if(tab==='cottage'){const sel=s.x.slot;const hp=homePanels(),sp=stylePanel();const own=Object.entries(s.x.decor).filter(([k,n])=>n>0);
    const craft=`<div class="panel"><h2>Workbench</h2>${Object.entries(RECIPES).map(([k,r])=>`<div class="row"><span><b>${r.name}</b><br><small>${needText(r.need)} · ${r.desc}</small></span><button class="btn small" data-x="craft" data-k="${k}" ${haveNeed(r.need)?'':'disabled'}>Craft</button></div>`).join('')}</div>`;
    const inv=`<div class="panel"><h2>${sel?'Place on the '+sel:'Decorations'}</h2>${sel?'':'<p class="note">Tap a dashed spot in your cottage, then choose something to place.</p>'}<div class="seeds">${own.filter(([k])=>!sel||DECOR[k].slot===sel).map(([k,n])=>`<button class="btn seed" data-x="place" data-k="${k}" ${sel?'':'disabled'}><span>${DECOR[k].name}</span><small>${DECOR[k].slot} · × ${n}</small></button>`).join('')||'<p>Nothing for this spot yet.</p>'}${sel&&s.x.cottage[sel]?`<button class="btn seed" data-x="unplace"><span>Clear spot</span><small>Return to storage</small></button>`:''}</div></div>`;
    const shop=`<div class="panel"><h2>Furniture shop</h2>${Object.entries(DECOR).filter(([k,d])=>d.cost).map(([k,d])=>`<div class="row"><span>${d.name}<br><small>${d.slot}</small></span><button class="btn small" data-x="buy" data-k="${k}" ${s.coins>=d.cost?'':'disabled'}>${d.cost} coins</button></div>`).join('')}</div>`;
    const items=Object.entries(s.x.items).filter(e=>e[1]>0);
    const pantry=items.length?`<div class="panel"><h2>Pantry</h2>${items.map(([k,n])=>`<div class="row"><span>${RECIPES[k].name} × ${n}</span>${RECIPES[k].kind==='sell'?`<button class="btn small" data-x="sellitem" data-k="${k}">Sell ${RECIPES[k].sell}</button>`:`<button class="btn small" data-x="use" data-k="${k}">Use</button>`}</div>`).join('')}</div>`:'';
    return hp+inv+craft+pantry+shop+sp+bag}
  if(tab==='journal')return today+bag;
  if(tab==='creek'){const bag=Object.entries(S().x.fish.bag).filter(e=>e[1]>0);const caught=Object.keys(S().x.fish.caught).length;
    return `<div class="panel"><h2>Fish basket</h2>${bag.length?bag.map(([k,n])=>`<div class="row"><span>${FISH[k].name} × ${n}<br><small>${FISH[k].rarity}</small></span><button class="btn small" data-x="sellfish" data-k="${k}">Sell ${FISH[k].sell}</button></div>`).join(''):'<p>Nothing caught yet. Cast your line!</p>'}</div><div class="panel"><h2>Creek guide</h2><p class="note">Tap Cast, wait for the bobber to dip and the "!" to appear, then Reel in. Rare fish appear in certain seasons and weather. Tap glowing crystals and lily pads to collect them; they regrow every day.</p><p>Species found: ${caught}/${Object.keys(FISH).length}</p></div>`+bag2()}
  if(tab==='collection')return `<div class="panel"><h2>Companion care</h2><p class="note">Pet each friend once a day and feed them their favorite food for extra affection. Higher affection unlocks free cosmetic styles. Rare friends can never be bought; they are only found through adventure.</p></div>`+bag;
  if(tab==='market')return `<div class="panel"><h2>Our promise</h2><p>No pay-to-win, no energy you have to buy, no pressure timers. Cosmetics only.</p></div>`;
  return side}
function bag2(){const mats=Object.entries(S().x.mats).filter(e=>e[1]>0);return `<div class="panel"><h2>Materials</h2>${mats.length?`<div class="mats">${mats.map(([k,n])=>`<span class="mat"><svg viewBox="0 0 60 50">${matIcon(k)}</svg>${MATS[k]} × ${n}</span>`).join('')}</div>`:'<p>Nothing gathered yet.</p>'}</div>`}
function questlinePanel(){const s=S();return `<div class="panel journal-card"><h2>Story quests</h2>${QUESTLINES.map(q=>{const st=s.x.ql[q.id];const n=NPCS[q.npc].name;
  if(!st||!st.started)return `<div class="row"><span><b>${q.name}</b><br><small>Talk to ${n} in the Village to begin</small></span></div>`;
  if(st.done)return `<div class="row"><span><b>${q.name}</b><br><small>Complete</small></span></div>`;
  return `<div class="row"><span><b>${q.name}</b> · ${Math.min(st.stage,q.stages.length)}/${q.stages.length}<br><small>${st.ready?'Return to '+n+' for your reward':q.stages[st.stage].t}</small></span></div><div class="meter"><i style="width:${Math.min(st.stage,q.stages.length)/q.stages.length*100}%"></i></div>`}).join('')}</div>`}
function after(tab){const s=S();
  const ext=$('ext');if(ext&&TABS.includes(tab)){const html=boardView(tab);if(ext._h!==html){ext.innerHTML=html;ext._h=html}}
  if(TABS.includes(tab))$('tools').innerHTML='';
  if(tab==='woods'||tab==='creek'||tab==='meadow'){const tl=$('tools');const chips=`<span class="regions"><button class="chipbtn ${tab==='woods'?'on':''}" data-x="region" data-k="woods">Whisperwood</button><button class="chipbtn ${tab==='creek'?'on':''}" data-x="region" data-k="creek">${creekOpen()?'':'Locked: '}Crystal Creek</button><button class="chipbtn ${tab==='meadow'?'on':''}" data-x="region" data-k="meadow">${meadowOpen()?'':'Locked: '}Moonpetal Meadow</button></span>`;if(tl&&!tl.querySelector('.regions'))tl.insertAdjacentHTML('afterbegin',chips)}
  if(tab==='woods'){const h=document.querySelector('.tile.here');if(h&&!h.querySelector('.farmer'))h.insertAdjacentHTML('beforeend',`<span class="on-tile">${farmerSVG(false)}</span>`)}
  const sc=document.querySelector('.scene');if(sc){let f=sc.querySelector('.walker');if(!f){f=document.createElement('div');f.className='walker';sc.appendChild(f)}const want=x().player.hat;if(f.dataset.h!==want){f.dataset.h=want;f.innerHTML=farmerSVG(true)}}
  seasonFX();sheets(tab);pixelWorld(tab)}
function pixelWorld(tab){const P=window.SHScenes;if(!P)return;
  P.set({woods:'forest',quests:'forest',creek:'creek',meadow:'meadow'}[tab]||'country');document.body.dataset.view=tab;
  const walkable=['farm','woods','creek','meadow'].includes(tab);if(!walkable)WALK.on=false;document.body.classList.toggle('walkmode',WALK.on);
  const sec=document.querySelector('.main>section');if(sec){let wb=$('walkbtn');if(!wb){sec.insertAdjacentHTML('beforeend','<button class="btn walkbtn" id="walkbtn" data-x="walk">Back to board</button><button class="btn pan l" id="panl" data-x="pan" data-k="-1" aria-label="Walk left">&lsaquo;</button><button class="btn pan r" id="panr" data-x="pan" data-k="1" aria-label="Walk right">&rsaquo;</button>');wb=$('walkbtn')}[wb,$('panl'),$('panr')].forEach(q=>q.hidden=!WALK.on)}
  const tl=$('tools');if(walkable&&tl&&!WALK.on&&!tl.querySelector('#walkgo'))tl.insertAdjacentHTML('afterbegin','<button class="btn big" id="walkgo" data-x="walk" aria-label="Walk around">Walk</button>');
  walkLayer();
  const s=S(),f=s.x.story.f;if(WALK.on&&tab==='woods'&&!f.walkWoods){f.walkWoods=1;document.body.classList.remove('hint-explore')}if(tab==='woods')document.body.classList.remove('hint-explore');
  if(tab==='creek'&&creekOpen())f.creek=1;if(tab==='meadow'&&meadowOpen())f.meadow=1;
  const lv=SH.lvl();if(s.x.lastLvl&&lv>s.x.lastLvl){confetti();SH.sfx('fanfare');qmodal(`<h2>Level up! You're now level ${lv}</h2><p>${lv===2?'Corn seeds unlocked, and the path to Crystal Creek clears.':lv===3?'Pumpkin seeds unlocked!':lv===4?'Sunflower seeds unlocked!':'Your farm grows ever more wonderful.'}</p><button class="btn big" data-a="close">Hooray!</button>`)}s.x.lastLvl=lv;
  eggCheck();festCheck();
  const cr=$('critters');if(cr&&cr.dataset.pix!==Object.keys(x().comp).join()){cr.dataset.pix=Object.keys(x().comp).join();cr.innerHTML=Object.keys(x().comp).slice(0,3).map((k,i)=>`<div class="critter" id="cr${i}" style="left:${10+i*35}%;top:70%">${compSVG(k)}</div>`).join('')}}

/* ---------------- Events ---------------- */
function emit(ev,arg){const s=S();try{
  if(ev==='harvest'){s.x.c.harvest++;add(s.x.c.grown,arg.k,1);bumpDaily('harvest');try{burst(LP[0],LP[1],arg.gold?['#ffd98a','#fff3b0','#fff']:['#a8c3a0','#f6a6c4','#fff3a0']);floatText(LP[0],LP[1]-20,(arg.gold?'+5 ':'+1 ')+SH.CROPS[arg.k].name);if(Math.random()<.5)react('harvest')}catch(e){}}
  if(ev==='order'){s.x.c.orders++;bumpDaily('order')}
  if(ev==='day'){seasonCheck()}
  checkAll()}catch(e){console.error(e)}}
function growMul(p){let m=season().grow;if(season().bonus===p.k)m*=1.2;if(x().comp.pippin)m*=1.05;if(x().comp.emberkin)m*=1.05;return m}
document.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||!SH)return;const s=S(),k=b.dataset.k,a=b.dataset.x;
 try{
  if(a==='pausebtn'){setPause(!PAUSED);return}
  if(a==='resume'){setPause(false);return}
  if(a==='sheet'){SHEET[S().tab]=+k;SH.sfx('tap');sheets(S().tab);const v=document.querySelector('#side>.panel:not([hidden])');if(v)v.scrollTop=0;return}
  if(a==='tut-next'){s.x.tut++;SH.close();SH.save();setTimeout(tutorial,120);return}
  if(a==='tut-skip'){s.x.tut=TUT.length;SH.close();tutorial();return}
  if(a==='tut-replay'){s.x.tut=0;SH.save();tutorial();return}
  if(a==='talk'){const n=NPCS[k],h=s.x.npc[k]||0;const tier=h>=7?2:h>=3?1:0;const line=rnd(n.lines[tier]);s.x.dlg={k,line};if(!s.x.talked[k]){s.x.talked[k]=1;s.x.npc[k]=h+1;s.x.c.talk++;bumpDaily('talk');const pr=s.x.promise;if(pr&&pr.k===k&&pr.date!==today()){const got=give(rnd([{coins:80},{gems:2},{moon:1,petal:2},{mush:2,wood:2}]));s.x.promise=null;s.x.dlg={k,line:'Here, I saved this for you, just like I promised!'};SH.sfx('gold');setTimeout(()=>SH.toast('Promise kept: '+got),200)}else if(!pr&&Math.random()<.3){s.x.promise={k,date:today()};s.x.dlg={k,line:s.x.dlg.line+' Oh! Come back tomorrow, I\'ll have something for you.'}}}SH.sfx('tap')}
  else if(a==='dlg-close')s.x.dlg=null;
  else if(a==='gift'){const c=b.dataset.c;if((s.basket[c]||0)<1)return;s.basket[c]--;const liked=NPCS[k].likes===c;s.x.npc[k]=Math.min(10,(s.x.npc[k]||0)+(liked?3:1));s.x.dlg={k,line:liked?'Oh! This is my favorite! Thank you so much!':'How thoughtful of you. Thank you!'};SH.sfx(liked?'gold':'harvest');heartGifts(k)}
  else if(a==='ql-start'){s.x.ql[k]=Object.assign(s.x.ql[k]||{},{started:true,stage:0,done:false});const q=QUESTLINES.find(q=>q.id===k);s.x.dlg={k:q.npc,line:`I have a little favor to ask... "${q.name}". First: ${q.stages[0].t.toLowerCase()}.`};SH.sfx('friend')}
  else if(a==='ql-claim'){const q=QUESTLINES.find(q=>q.id===k),st=s.x.ql[k];st.done=true;const got=give(q.reward);s.x.npc[q.npc]=Math.min(10,(s.x.npc[q.npc]||0)+2);s.x.dlg=null;SH.sfx('fanfare');SH.modal(`<span class="por big">${npcSVG(q.npc)}</span><h2>${q.name}: complete!</h2><p>${NPCS[q.npc].name} beams at you. You received ${got}.</p><button class="btn big" data-a="close">Wonderful</button>`)}
  else if(a==='slot'){s.x.slot=s.x.slot===k?null:k;SH.sfx('tap')}
  else if(a==='place'){const sl=s.x.slot;if(!sl||!(s.x.decor[k]>0))return;if(s.x.cottage[sl])add(s.x.decor,s.x.cottage[sl],1);s.x.cottage[sl]=k;s.x.decor[k]--;s.x.slot=null;SH.sfx('plant')}
  else if(a==='unplace'){const sl=s.x.slot;if(sl&&s.x.cottage[sl]){add(s.x.decor,s.x.cottage[sl],1);s.x.cottage[sl]=null}}
  else if(a==='buy'){const d=DECOR[k];if(!d.cost||s.coins<d.cost)return;s.coins-=d.cost;add(s.x.decor,k,1);SH.sfx('coin');SH.toast(d.name+' added to storage')}
  else if(a==='craft'){const r=RECIPES[k];if(!haveNeed(r.need))return SH.sfx('no');for(const [m,n] of Object.entries(r.need)){if(m.startsWith('c_'))s.basket[m.slice(2)]-=n;else s.x.mats[m]-=n}add(s.x.c.crafted,k,1);if(r.kind==='decor')add(s.x.decor,k,1);else add(s.x.items,k,1);bumpDaily('craft');SH.sfx('fanfare');SH.toast('Crafted '+r.name+'!')}
  else if(a==='sellitem'){if(!(s.x.items[k]>0))return;s.x.items[k]--;s.coins+=RECIPES[k].sell;SH.sfx('coin')}
  else if(a==='use'){if(!(s.x.items[k]>0))return;s.x.items[k]--;if(k==='tonic'){s.plots.forEach(p=>{if(p)p.g+=SH.CROPS[p.k].time*.5});SH.toast('Your crops sparkle and stretch!')}SH.sfx('gold')}
  else if(a==='pet'){const c=s.x.comp[k];if(!s.x.petted[k]){s.x.petted[k]=1;c.aff=Math.min(10,c.aff+1);s.x.c.pet++;bumpDaily('pet');SH.toast(COMPANIONS[k].name+' wiggles happily!')}else SH.toast(COMPANIONS[k].name+' is already content today');SH.sfx('friend');b.classList.add('boing');setTimeout(()=>b.classList.remove('boing'),500);checkAll();SH.save();return}
  else if(a==='walk'){WALK.on=!WALK.on;SH.sfx('tap')}
  else if(a==='pan'){const sc=document.querySelector('.scene'),svg=sc.querySelector('svg'),nm=sc.dataset.paint||'country',W=+svg.dataset.vw,H=+svg.dataset.vh,p=WALK.pos[nm]||[W/2,H*.9];walkTo(p[0]+(+k)*W*.28,p[1]);return}
  else if(a==='walkto'){const svg=b.ownerSVGElement||b.closest('svg');const pt=svgPoint(svg,e.clientX,e.clientY);walkTo(pt.x,pt.y);return}
  else if(a==='hot'){const nm=(document.querySelector('.scene').dataset.paint)||'country';const h=(HOT[nm]||[]).find(q=>q.id===k);if(!h)return;walkTo(h.x+(h.x>400?-26:26),h.y+8,()=>{hotspot(k);checkAll();SH.save();SH.render();walkLayer()});return}
  else if(a==='story-claim'){storyClaim()}
  else if(a==='story-intro'){const st=x().story;if(st.ch<STORY.length)SH.modal(`${chapterArt(STORY[st.ch])}<h2>${STORY[st.ch].name}</h2><p>${STORY[st.ch].intro}</p><button class="btn big" data-a="close">Got it</button>`);return}
  else if(a==='story-next'){SH.close();if(x().story.ch<STORY.length)storyIntro(x().story.ch);else setTimeout(()=>SH.modal(`<h2>Thank you, Lantern Keeper</h2><p>You've finished every chapter so far. New stories are on their way!</p><button class="btn big" data-a="close">Can't wait</button>`),300)}
  else if(a==='pick'){meadowDaily();const m=s.x.meadow,fk=m.patch[+k];if(!fk)return;m.patch[+k]=null;add(s.x.flowers,fk,1);s.x.c.flowers=(s.x.c.flowers||0)+1;add(s.x.mats,'petal',1);burst(LP[0],LP[1],[FLOWERS[fk].col,'#fff']);SH.sfx(FLOWERS[fk].rarity==='Rare'?'gold':'plant');SH.toast('Picked a '+FLOWERS[fk].name+(FLOWERS[fk].rarity==='Rare'?'! So rare!':''))}
  else if(a==='bfly'){const i=BF.findIndex(q=>q.id===k);if(i<0)return;const bk=BF[i].k;BF.splice(i,1);add(s.x.bfly,bk,1);s.x.c.bfly=(s.x.c.bfly||0)+1;burst(LP[0],LP[1],[BUTTERFLIES[bk].col,'#fff']);SH.sfx('friend');react('bfly');if(['Rare','Legendary'].includes(BUTTERFLIES[bk].rarity))confetti();SH.toast('Caught a '+BUTTERFLIES[bk].name+'!')}
  else if(a==='sellflower'){if(!(s.x.flowers[k]>0))return;s.x.flowers[k]--;s.coins+=FLOWERS[k].sell+(s.x.comp.bumble?5:0);SH.sfx('coin')}
  else if(a==='mail'){openMail();return}
  else if(a==='fest'){const fd=festToday();if(!fd||s.x.fest.claimed)return;s.x.fest.claimed=true;add(s.x.decor,fd.decor,1);confetti();SH.sfx('fanfare');SH.modal(`<h2>${fd.name} reward!</h2><p>You received the exclusive <b>${DECOR[fd.decor].name}</b>. Place it in your cottage!</p><button class="btn big" data-a="close">Yay!</button>`)}
  else if(a==='postcard'){postcard();return}
  else if(a==='copyvisit'){const u=visitLink();(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>SH.toast('Visit link copied. Send it to a friend!'),()=>SH.modal(`<h2>Your visit link</h2><textarea rows="3" readonly>${u}</textarea><button class="btn big" data-a="close">Done</button>`));return}
  else if(a==='makegift'){makeGift();return}
  else if(a==='copygift'){const t=$('giftcode');if(t){t.select();(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>SH.toast('Gift code copied'),()=>SH.toast('Select the code and copy it'))}return}
  else if(a==='redeem'){redeem();return}
  else if(a==='whats'){s.x.player.hat=k;document.querySelectorAll('[data-x=whats]').forEach(q=>q.classList.toggle('on',q===b));return}
  else if(a==='welcome-go'){s.x.player.name=(($('pname')||{}).value||'').trim().slice(0,18)||'Farmer';s.x.player.farm=(($('fname')||{}).value||'').trim().slice(0,24)||'Sprout Hollow Farm';SH.close();SH.save();setTimeout(tutorial,200);return}
  else if(a==='hstyle'){s.x.home[k]=+b.dataset.c;SH.sfx('tap')}
  else if(a==='shirt'){s.x.player.shirt=k}
  else if(a==='savename'){s.x.player.name=(($('pname2')||{}).value||'').trim().slice(0,18)||s.x.player.name;s.x.player.farm=(($('fname2')||{}).value||'').trim().slice(0,24)||s.x.player.farm;SH.toast('Saved!')}
  else if(a==='cast'){cast();return}
  else if(a==='reel'){reel();return}
  else if(a==='crystal'||a==='lily'){creekDaily();const arr=a==='crystal'?s.x.creek.crystals:s.x.creek.lilies;if(arr[+k])return;arr[+k]=1;add(s.x.mats,a,1);if(a==='crystal')s.x.c.crystals=(s.x.c.crystals||0)+1;burst(LP[0],LP[1],a==='crystal'?['#c9b9e8','#9fe6f6','#fff']:['#7fbf7a','#f9bcd3']);SH.sfx('friend');SH.toast('+1 '+MATS[a])}
  else if(a==='sellfish'){if(!(s.x.fish.bag[k]>0))return;s.x.fish.bag[k]--;s.coins+=FISH[k].sell;SH.sfx('coin')}
  else if(a==='region'){if(k==='creek'&&!creekOpen()){SH.toast('Explore 8 Whisperwood tiles or reach level 2 first');return}if(k==='meadow'&&!meadowOpen()){SH.toast('Finish story Chapter 2, or reach level 6');return}s.tab=k;SH.sfx('tap')}
  else if(a==='feed'){const c=COMPANIONS[k],o=s.x.comp[k];if(!o||s.x.fed[k])return;let crop=(s.basket[c.food]||0)>0?c.food:Object.keys(s.basket).find(q=>s.basket[q]>0);if(!crop)return SH.toast('Harvest some crops to feed your friends');s.basket[crop]--;const fav=crop===c.food;o.aff=Math.min(10,o.aff+(fav?3:1));s.x.fed[k]=1;SH.sfx(fav?'gold':'harvest');SH.toast(fav?c.name+' LOVES it!':c.name+' munches happily')}
  else if(a==='skin'){const o=s.x.comp[k],i=+b.dataset.c;if(o&&o.aff>=i*5)o.skin=i;SH.sfx('tap')}
  else if(a==='dq'){const q=s.x.dq.list[+k];if(!q||q.claimed||q.v<q.n)return;q.claimed=true;SH.toast('Reward: '+give(q.r));SH.sfx('coin')}
  else if(a==='coll'){const c=COLLECTIONS.find(c=>c.id===k);if(s.x.coll[k])return;const it=c.items(),h=c.have(s);if(!it.every(h))return;s.x.coll[k]=1;SH.sfx('fanfare');SH.modal(`<h2>Collection complete!</h2><p>${c.name}</p><p>You received ${give(c.reward)}.</p><button class="btn big" data-a="close">Hooray</button>`)}
  else if(a==='jtab')s.x.journalTab=k;
  else if(a==='hat')s.x.player.hat=k;
  else if(a==='export'){const code=btoa(unescape(encodeURIComponent(JSON.stringify(s))));const ta=$('imp');if(ta){ta.value=code;ta.select()}(navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>SH.toast('Save code copied'),()=>SH.toast('Save code shown below. Copy it from the box'));return}
  else if(a==='import'){const v=($('imp')||{}).value||'';try{const d=JSON.parse(decodeURIComponent(escape(atob(v.trim()))));if(!d||typeof d!=='object'||!Array.isArray(d.plots))throw 0;backup(true);SH.S=Object.assign(SH.S,d);migrate();SH.save();SH.toast('Save loaded!')}catch(err){SH.toast('That save code didn\'t work. Check it was copied fully')}}
  else if(a==='restore'){try{const d=JSON.parse(localStorage.getItem('sprout-hollow-backup'));if(!d||!d.s)throw 0;SH.S=Object.assign(SH.S,d.s);migrate();SH.save();SH.toast('Backup from '+d.date+' restored')}catch(err){SH.toast('No backup found yet')}}
  else return;
  checkAll();SH.save();SH.render()}catch(err){console.error(err);SH.toast('Oops, something went wrong. Your save is safe')}
});
function heartGifts(k){const h=S().x.npc[k];const key='hg_'+k;const got=S().x.ach[key]||0;
  const tiers=[[3,{coins:50}],[5,{gems:2}],[8,{moon:2,gems:2}],[10,{gems:5}]];const next=tiers.find(t=>h>=t[0]&&t[0]>got);
  if(next){S().x.ach[key]=next[0];setTimeout(()=>SH.modal(`<span class="por big">${npcSVG(k)}</span><h2>${NPCS[k].name} has a gift for you</h2><p>"You've become such a dear friend." You received ${give(next[1])}.</p><button class="btn big" data-a="close">Thank you!</button>`),200)}}
function backup(force){try{const b=JSON.parse(localStorage.getItem('sprout-hollow-backup')||'null');if(force||!b||b.date!==today())localStorage.setItem('sprout-hollow-backup',JSON.stringify({date:today(),s:SH.S}))}catch(e){}}

/* ================= v4: living world, story, meadow, polish, festivals, social ================= */
const FLOWERS={daisy:{name:'Meadow Daisy',rarity:'Common',sell:10,w:40,col:'#ffffff',mid:'#fff3a0'},tulip:{name:'Peach Tulip',rarity:'Common',sell:14,w:30,col:'#f4bfa7',mid:'#f08a7a'},bluebell:{name:'Bluebell',rarity:'Uncommon',sell:30,w:14,col:'#b8d9e8',mid:'#7aa8d8'},sunpetal:{name:'Sunpetal',rarity:'Uncommon',sell:35,w:12,col:'#ffe27a',mid:'#f2a93b'},moonpetal:{name:'Moonpetal',rarity:'Rare',sell:90,w:4,col:'#c9b9e8',mid:'#fff6d6'}};
const BUTTERFLIES={petal:{name:'Petal Wing',rarity:'Common',col:'#f6a6c4',w:40},sky:{name:'Sky Flutter',rarity:'Common',col:'#b8d9e8',w:35},lemon:{name:'Lemon Drop',rarity:'Uncommon',col:'#fff3a0',w:15},lilac:{name:'Lilac Dream',rarity:'Rare',col:'#c9b9e8',w:7},star:{name:'Starlit Swallowtail',rarity:'Legendary',col:'#ffd98a',w:1.5}};
const FESTIVALS={spring:{name:'Blossom Picnic',desc:'Petals rain over the village and everyone brings a basket.',task:'harvest',n:6,label:'Harvest 6 crops today',decor:'garland'},summer:{name:'Lantern Festival',desc:'Paper lanterns float over the creek at dusk.',task:'explore',n:4,label:'Explore 4 Whisperwood tiles today',decor:'lantstring'},autumn:{name:'Harvest Fair',desc:'Stalls, ribbons and the grand pumpkin contest.',task:'orders',n:3,label:'Fill 3 village orders today',decor:'scarecrow'},winter:{name:'Snow Day',desc:'Snowball fights, cocoa and a snowman for every porch.',task:'fish',n:2,label:'Catch 2 fish today',decor:'snowman'}};
const COMP_LINES={harvest:['Yummy!','So fresh!','Again, again!','*happy wiggle*'],fish:['A fishy!','Wow, big one!','Splash!'],bfly:['So pretty!','Flutter flutter!'],secret:['Ooooh!','Magic!','Look, look!'],pet:['*purrs*','Hehe!','More pats!']};
const BONDS={fluffkin:'Fluffkin curls up in your hat and hums a lullaby only the wind knows.',mossbun:'Mossbun plants a tiny flower by your door. It blooms in your favorite colour.',pippin:'Pippin digs up an old acorn locket and drops it proudly at your feet.',mushling:'Mushling dances in the rain just for you, spores sparkling like confetti.',lumi:'Lumi glows brighter than ever and writes your name in light across the night sky.',emberkin:'Emberkin breathes a tiny warm flame and lights your hearth. You are family now.',bumble:'Bumble brings you the first drop of golden honey from the hive.'};
const STORY=[
 {id:'ch1',name:'Whispers in the Dark',where:'Whisperwood',pal:['#3d3f86','#ffd27a'],intro:'Long ago, the Lantern Keepers lit the paths of Sprout Hollow. Last night, every lantern in Whisperwood went dark. Grandma Pip says only a kind-hearted farmer can wake them again.',
  steps:[{t:'Walk into Whisperwood (tap Explore, then Walk around)',done:s=>!!s.x.story.f.walkWoods},{t:'Relight the 3 dark lanterns. Each needs 1 Glow mushroom',done:s=>(s.x.story.f.lit||0)>=3}],reward:{coins:150,egg:1},outro:'The lanterns flicker awake. Deep in the trees, something warm stirs. You found a mysterious egg!'},
 {id:'ch2',name:'The Singing Creek',where:'Crystal Creek',pal:['#3a6a8a','#bfefff'],intro:'With the forest lit, you can hear it: a faint song coming from the creek. The old waterfall shrine wants an offering of crystals and a story from the water.',
  steps:[{t:'Visit Crystal Creek',done:s=>!!s.x.story.f.creek},{t:'Collect 3 creek crystals',done:s=>(s.x.c.crystals||0)>=3},{t:'Catch 2 fish',done:s=>Object.values(s.x.fish.caught).reduce((a,b)=>a+b,0)>=2},{t:'Make an offering at the waterfall shrine (walk around the creek)',done:s=>!!s.x.story.f.offered}],reward:{gems:3},outro:'The waterfall parts like a curtain and reveals a path of moonlit petals. Moonpetal Meadow is open!'},
 {id:'ch3',name:'Moonpetal Dreams',where:'Moonpetal Meadow',pal:['#7a5aa8','#ffd0e6'],intro:'The meadow is full of sleepy flowers that only open for gentle hands, and butterflies that remember the old Keepers.',
  steps:[{t:'Visit Moonpetal Meadow',done:s=>!!s.x.story.f.meadow},{t:'Pick 5 flowers',done:s=>(s.x.c.flowers||0)>=5},{t:'Catch 3 butterflies',done:s=>(s.x.c.bfly||0)>=3},{t:'Meet the bee at the old beehive (walk around the meadow)',done:s=>!!s.x.comp.bumble}],reward:{coins:300,decor:'garland'},outro:'Bumble buzzes a happy loop. The flowers hum a tune: the last lantern must be lit in the heart of the village.'},
 {id:'ch4',name:'The Festival of Lights',where:'Sprout Hollow',pal:['#5a3d78','#fff3b0'],intro:'Every Keeper before you lit the great lantern in the village square. The villagers are gathering. It is your turn.',
  steps:[{t:'Craft 2 Glow Lanterns',done:s=>(s.x.c.crafted.lantern||0)>=2},{t:'Reach 5 hearts with a villager',done:s=>Math.max(0,...Object.values(s.x.npc))>=5},{t:'Light the great lantern in the village square (walk around the farm)',done:s=>!!s.x.story.f.villageLit}],reward:{gems:10,decor:'chandelier',hat:'#f2c94c'},outro:'The whole hollow glows. Grandma Pip hands you a golden Keeper hat. "Welcome, Lantern Keeper." To be continued...'}];
const HOME_STYLES={wall:[['#fbe9d0','#f2cfd6','Peach dots'],['#e3f0d8','#c9e2bc','Sage meadow'],['#ece4fb','#d8cdf2','Lavender dream'],['#dff0f8','#bfe0f2','Sky stripes']],floor:[['#d9a77a','#c08a5a','Honey oak'],['#c9b9a6','#a8957f','Stone'],['#e8c9a8','#d0aa84','Birch']]};
const sumFish=s=>Object.values(s.x.fish.caught).reduce((a,b)=>a+b,0);

/* ---------- juice ---------- */
let LP=[innerWidth/2,innerHeight/2];
document.addEventListener('pointerdown',e=>{LP=[e.clientX,e.clientY]},true);
function burst(x0,y0,cols){const box=document.body;for(let i=0;i<12;i++){const d=document.createElement('i');d.className='fxp';const a=Math.random()*6.28,r=30+Math.random()*40;d.style.cssText=`left:${x0}px;top:${y0}px;background:${cols[i%cols.length]};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r-20}px`;box.appendChild(d);setTimeout(()=>d.remove(),800)}}
function floatText(x0,y0,t){const d=document.createElement('div');d.className='fxt';d.textContent=t;d.style.cssText=`left:${x0}px;top:${y0}px`;document.body.appendChild(d);setTimeout(()=>d.remove(),1100)}
function coinFly(x0,y0){const t=$('coins');if(!t)return;const r=t.getBoundingClientRect();for(let i=0;i<5;i++){const d=document.createElement('i');d.className='fxc';d.style.cssText=`left:${x0}px;top:${y0}px;--tx:${r.left+r.width/2-x0}px;--ty:${r.top+r.height/2-y0}px;animation-delay:${i*60}ms`;document.body.appendChild(d);setTimeout(()=>d.remove(),900+i*60)}setTimeout(()=>{t.classList.add('pop');setTimeout(()=>t.classList.remove('pop'),300)},700)}
function confetti(){for(let i=0;i<40;i++){const d=document.createElement('i');d.className='fxf';d.style.cssText=`left:${Math.random()*100}vw;background:${['#f6a6c4','#fff3a0','#c9b9e8','#b8d9e8','#a8c3a0','#f4bfa7'][i%6]};animation-delay:${Math.random()*.6}s;animation-duration:${1.6+Math.random()}s`;document.body.appendChild(d);setTimeout(()=>d.remove(),3000)}}
document.addEventListener('click',e=>{if(e.target.closest('[data-sell],[data-o],[data-x=sellfish],[data-x=sellitem],[data-x=sellflower]'))coinFly(LP[0],LP[1])},true);
function react(type){const own=Object.keys(x().comp);if(!own.length)return;const k=rnd(own);
  const el=document.querySelector(`#walk [data-comp="${k}"]`)||[...document.querySelectorAll('.critter')].find(c=>c.innerHTML.includes(COMPANIONS[k].name))||document.querySelector('.critter');
  document.querySelectorAll('.critter,#walk .wcomp').forEach(c=>{c.classList.remove('hop');void c.offsetWidth;c.classList.add('hop')});
  if(el&&Math.random()<.6){const r=el.getBoundingClientRect();if(r.width){const b=document.createElement('div');b.className='cbub';b.textContent=rnd(COMP_LINES[type]||COMP_LINES.harvest);b.style.cssText=`left:${r.left+r.width/2}px;top:${r.top-6}px`;document.body.appendChild(b);setTimeout(()=>b.remove(),1600)}}}
function mood(k){const s=S();if(s.x.fed[k]&&s.x.petted[k])return'Overjoyed';if(s.x.fed[k])return'Full and cozy';if(s.x.petted[k])return'Happy';const h=new Date().getHours();return h>=21||h<6?'Sleepy':'Hungry for attention'}

/* ---------- walking world ---------- */
const WALK={on:false,pos:{}};
const HOT={
 country:[{id:'door',x:222,y:206,l:'Cottage',ic:'none'},{id:'mail',x:290,y:212,l:'Mailbox',ic:'none'},{id:'well',x:380,y:196,l:'Well',ic:'none'},{id:'tree',x:48,y:250,l:'Old oak',ic:'none'},{id:'square',x:600,y:150,l:'Village square',ic:'none'},{id:'toWoods',x:772,y:322,l:'To Whisperwood',ic:'sign'}],
 forest:[{id:'lan1',x:330,y:176,l:'Dark lantern',ic:'lan'},{id:'lan2',x:395,y:128,l:'Dark lantern',ic:'lan'},{id:'lan3',x:500,y:182,l:'Dark lantern',ic:'lan'},{id:'knock',x:612,y:236,l:'Treehouse',ic:'none'},{id:'ring',x:120,y:262,l:'Mushroom ring',ic:'none'},{id:'toCreek',x:772,y:322,l:'To Crystal Creek',ic:'sign'}],
 creek:[{id:'shrine',x:150,y:226,l:'Waterfall shrine',ic:'none'},{id:'dock',x:370,y:232,l:'Fishing spot',ic:'none'},{id:'bridge',x:640,y:166,l:'Old bridge',ic:'none'},{id:'toMeadow',x:772,y:322,l:'To Moonpetal Meadow',ic:'sign'}],
 meadow:[{id:'hive',x:182,y:140,l:'Old beehive',ic:'none'},{id:'gazebo',x:676,y:200,l:'Gazebo',ic:'none'},{id:'patch',x:320,y:296,l:'Flower patch',ic:'none'},{id:'toFarm',x:30,y:322,l:'Home to the farm',ic:'sign'}]};
const ICN={door:'<rect x="-9" y="-16" width="18" height="18" rx="9" fill="#ffb86a" stroke="#6b4440" stroke-width="2"/>',mail:'<rect x="-2" y="-4" width="4" height="12" fill="#96745B"/><rect x="-9" y="-16" width="18" height="12" rx="5" fill="#e98aa4" stroke="#6b4440" stroke-width="2"/><rect x="5" y="-20" width="2" height="8" fill="#e06a6a"/>',well:'<rect x="-12" y="-6" width="24" height="12" rx="3" fill="#b9b0a4" stroke="#6b4440" stroke-width="2"/><path d="M-14 -8 L0 -20 L14 -8z" fill="#a86c3d"/>',tree:'<circle r="12" cy="-12" fill="#f6a6c4" stroke="#6b4440" stroke-width="2"/><rect x="-2" y="-2" width="4" height="8" fill="#6b4440"/>',lamp:'<rect x="-2" y="-18" width="4" height="22" fill="#6b4440"/><rect x="-7" y="-26" width="14" height="10" rx="3" fill="#ffd98a" stroke="#6b4440" stroke-width="2"/>',sign:'<rect x="-2" y="-6" width="4" height="12" fill="#6b4440"/><path d="M-14 -20 h22 l6 6 l-6 6 h-22z" fill="#f4dcae" stroke="#6b4440" stroke-width="2"/>',lan:'<path d="M0 -34 v10" stroke="#6b4440" stroke-width="2"/><rect x="-8" y="-24" width="16" height="20" rx="5" fill="LANFILL" stroke="#6b4440" stroke-width="2"/>',mush:'<path d="M-12 -4 q12 -18 24 0z" fill="#8fe0f0" stroke="#6b4440" stroke-width="2"/><rect x="-3" y="-4" width="6" height="8" fill="#fff4e4"/>',shrine:'<rect x="-12" y="-14" width="24" height="18" rx="4" fill="#c9c4d8" stroke="#6b4440" stroke-width="2"/><path d="M-16 -14 h32 l-4 -6 h-24z" fill="#8a72b8"/>',rod:'<path d="M-10 4 L10 -20" stroke="#6b4440" stroke-width="3"/><circle cx="10" cy="-2" r="4" fill="#e98aa4"/>',star:'<path d="M0 -20 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#fff3a0" stroke="#6b4440" stroke-width="1.5"/>',hive:'<ellipse cy="-10" rx="11" ry="13" fill="#f2c45a" stroke="#6b4440" stroke-width="2"/><path d="M-9 -14h18M-10 -8h20" stroke="#c98a3a" stroke-width="2"/>',flower:'<circle cy="-10" r="6" fill="#f6a6c4"/><circle cx="-7" cy="-6" r="5" fill="#fff3a0"/><circle cx="7" cy="-6" r="5" fill="#c9b9e8"/><circle cy="-8" r="3" fill="#fff"/>'};
const sceneOf=tab=>({woods:'forest',creek:'creek',meadow:'meadow'}[tab]||'country');
function walkLayer(){const sc=document.querySelector('.scene');const svg=sc&&sc.querySelector('svg');if(!svg)return;let g=svg.querySelector('#walk');
  if(!WALK.on){if(g)g.remove();camReset(svg);svg.setAttribute('preserveAspectRatio','xMidYMid slice');return}
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');const name=sc.dataset.paint||'country';if(!svg.dataset.vw){svg.dataset.vw=svg.viewBox.baseVal.width;svg.dataset.vh=svg.viewBox.baseVal.height}const W=+svg.dataset.vw,H=+svg.dataset.vh;
  if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='walk';svg.appendChild(g)}
  const p=WALK.pos[name]||(WALK.pos[name]=[name==='country'?300:W*.5,H*.88]);const f=x().story.f;
  const hs=(HOT[name==='country'?'country':name]||[]).map(h=>{let ic=h.ic==='none'?'<circle class="ring" r="13" cy="-6" fill="#fff8" stroke="#fff" stroke-width="2"/><circle r="3" cy="-6" fill="#fff"/>':(ICN[h.ic]||ICN.star);let lit=false;
    if(h.ic==='lan'){lit=!!(f['lan_'+h.id]);ic=ic.replace('LANFILL',lit?'#ffd98a':'#5a5470')}
    if(h.id==='square'&&f.villageLit)lit=true;
    return `<g class="hot ${lit?'lit':''}" data-x="hot" data-k="${h.id}" role="button" tabindex="0" aria-label="${h.l}" transform="translate(${h.x} ${h.y})">${lit?'<circle r="26" cy="-14" fill="url(#lg)" class="flick"/>':''}<circle r="22" cy="-10" fill="#fff" opacity=".001"/>${ic}<text y="${h.y>H*.85?-34:16}" text-anchor="middle" class="hotl">${h.l}</text></g>`}).join('');
  const comps=Object.keys(x().comp).slice(0,2);const fm=farmerSVG(true).replace('<svg viewBox="0 0 60 70"','<svg x="-18" y="-48" width="36" height="44" viewBox="0 0 60 70"');
  const sz=H>320?1.6:H>200?1:.7;
  g.innerHTML=`<rect width="${W}" height="${H}" fill="transparent" data-x="walkto"/>${hs}${comps.map((k,i)=>`<g class="wcomp" data-comp="${k}" style="transform:translate(${p[0]-30-i*26}px,${p[1]+2}px) scale(${sz});transition-duration:${.9+i*.3}s"><svg x="-14" y="-28" width="28" height="28" viewBox="0 0 100 100">${compSVG(k).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg></g>`).join('')}<g id="wfarm" style="transform:translate(${p[0]}px,${p[1]}px) scale(${sz})">${fm}</g>`;CAM.x=-1;camFit(svg,name,true)}
const CAM={x:0,raf:0};
function camFit(svg,name,instant){const sc=svg.parentElement,r=sc.getBoundingClientRect();if(!r.width||!r.height)return;const W=+svg.dataset.vw||svg.viewBox.baseVal.width,H=+svg.dataset.vh||svg.viewBox.baseVal.height;if(!svg.dataset.vw){svg.dataset.vw=W;svg.dataset.vh=H}
  const vw=Math.min(W,H*r.width/r.height);const p=WALK.pos[name]||[W/2,H*.9];const tx=Math.max(0,Math.min(W-vw,p[0]-vw/2));
  const set=v=>svg.setAttribute('viewBox',`${v.toFixed(1)} 0 ${vw.toFixed(1)} ${H}`);cancelAnimationFrame(CAM.raf);
  if(instant||Math.abs(tx-CAM.x)<1){CAM.x=tx;set(tx);return}const x0=CAM.x,t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/700),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;CAM.x=x0+(tx-x0)*e;set(CAM.x);if(k<1)CAM.raf=requestAnimationFrame(step)};CAM.raf=requestAnimationFrame(step)}
function camReset(svg){if(svg&&svg.dataset.vw){svg.setAttribute('viewBox',`0 0 ${svg.dataset.vw} ${svg.dataset.vh}`)}}
function walkTo(px,py,then){const sc=document.querySelector('.scene');const svg=sc&&sc.querySelector('svg');if(!svg)return;const name=sc.dataset.paint||'country',H=+svg.dataset.vh||svg.viewBox.baseVal.height,W=+svg.dataset.vw||svg.viewBox.baseVal.width;
  py=Math.max(H*.7,Math.min(H*.97,py));px=Math.max(20,Math.min(W-20,px));const old=WALK.pos[name]||[W/2,H*.9];WALK.pos[name]=[px,py];
  const sz=H>320?1.6:H>200?1:.7,fl=px<old[0]?-1:1;const fm=svg.querySelector('#wfarm');if(fm)fm.style.transform=`translate(${px}px,${py}px) scale(${sz*fl},${sz})`;
  svg.querySelectorAll('.wcomp').forEach((c,i)=>c.style.transform=`translate(${px-fl*(30+i*26)}px,${py+2}px) scale(${sz})`);
  camFit(svg,name);SH.sfx('step');if(then)setTimeout(then,700)}
function svgPoint(svg,cx,cy){const pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;const m=svg.getScreenCTM();return m?pt.matrixTransform(m.inverse()):{x:0,y:0}}
function hotspot(id){const s=S(),f=s.x.story.f,ch=storyCh();creekDaily();
  const go=t=>{WALK.on=false;s.tab=t;SH.render()};
  const msg=(t)=>SH.toast(t);
  if(id==='door')return go('cottage');
  if(id==='toWoods'){s.tab='woods';SH.render();return}
  if(id==='toCreek'){if(!creekOpen())return msg('The creek path is still overgrown. Explore 8 tiles or reach level 2');s.tab='creek';SH.render();return}
  if(id==='toMeadow'){if(!meadowOpen())return msg('A curtain of water blocks the way. The waterfall shrine may know why');s.tab='meadow';SH.render();return}
  if(id==='toFarm'){s.tab='farm';SH.render();return}
  if(id==='mail')return openMail();
  if(id==='well'){let n=0;s.plots.forEach(p=>{if(p&&SH.CROPS[p.k]&&p.g<SH.CROPS[p.k].time){p.w=30;n++}});SH.sfx('water');msg(n?`You water ${n} crops from the well`:'Nothing needs water right now');return}
  if(id==='tree'){if(s.x.daily2.tree===today())return msg('The petals will grow back tomorrow');s.x.daily2.tree=today();add(s.x.mats,'petal',2);burst(LP[0],LP[1],['#f6a6c4','#ffd0e6','#fff']);SH.sfx('friend');return msg('You shake the tree. 2 Wild petals flutter down!')}
  if(id==='square'){if(f.villageLit)return msg('The great lantern glows over the hollow');if(ch!==3||!STORY[3].steps[0].done(s)||!STORY[3].steps[1].done(s))return msg('An old unlit lantern stands here. Its time will come');f.villageLit=1;confetti();SH.sfx('fanfare');return SH.modal(`<h2>The great lantern blazes to life!</h2><p>Villagers cheer as warm light spreads across Sprout Hollow.</p><button class="btn big" data-a="close">Wonderful</button>`)}
  if(id.startsWith('lan')){if(f['lan_'+id])return msg('This lantern glows warmly');if(!s.x.story.started)return msg('A cold, dark lantern');if((s.x.mats.mush||0)<1)return msg('You need a Glow mushroom to relight it. Explore Whisperwood or check the mushroom ring');s.x.mats.mush--;f['lan_'+id]=1;f.lit=(f.lit||0)+1;burst(LP[0],LP[1],['#fff3b0','#ffd27a','#fff']);SH.sfx('gold');msg(`The lantern flickers awake! (${f.lit}/3)`);return}
  if(id==='knock'){if(s.x.daily2.knock===today())return msg('"Come back tomorrow, dear!" calls a voice inside');s.x.daily2.knock=today();const r=rnd([{coins:30},{mush:1},{petal:2},{wood:2}]);SH.sfx('friend');return msg('Knock knock! Someone leaves you '+give(r))}
  if(id==='ring'){if(s.x.daily2.ring===today())return msg('The mushrooms are resting until tomorrow');s.x.daily2.ring=today();add(s.x.mats,'mush',1);SH.sfx('friend');return msg('You find 1 Glow mushroom in the ring')}
  if(id==='shrine'){if(f.offered)return msg('The shrine hums a quiet song');const st=STORY[1].steps;if(ch===1&&st[0].done(s)&&st[1].done(s)&&st[2].done(s)){f.offered=1;confetti();SH.sfx('fanfare');return SH.modal(`<h2>The shrine sings!</h2><p>Your crystals chime together and the waterfall parts like a curtain.</p><button class="btn big" data-a="close">So beautiful</button>`)}return msg('The shrine wants 3 crystals and a story from the water (2 fish)')}
  if(id==='dock')return go('creek');
  if(id==='bridge'){if(f.bridge)return msg('Just you and the sound of water');f.bridge=1;add(s.x.mats,'feather',1);SH.sfx('gold');return msg('Tucked under a plank: a Star feather!')}
  if(id==='patch')return go('meadow');
  if(id==='gazebo'){if(s.x.daily2.gazebo===today())return msg('You already had a lovely rest here today');s.x.daily2.gazebo=today();Object.keys(s.x.comp).forEach(k=>s.x.comp[k].aff=Math.min(10,s.x.comp[k].aff+1));SH.sfx('friend');react('pet');return msg('You rest in the gazebo with your companions. Everyone feels closer (+1 affection)')}
  if(id==='hive'){if(s.x.comp.bumble)return msg('Bumble buzzes hello');if(ch<2||!STORY[2].steps[2].done(s))return msg('A sleepy buzzing comes from inside. Maybe later...');s.x.comp.bumble={aff:0,skin:0};SH.sfx('friend');confetti();return SH.modal(`${compSVG('bumble')}<h2>Bumble wants to join you!</h2><p>${COMPANIONS.bumble.desc}</p><button class="btn big" data-a="close">Welcome home</button>`)}}

/* ---------- story ---------- */
const storyCh=()=>{const st=x().story;return st.started?st.ch:-1};
const meadowOpen=()=>(x().story.ch>1)||(x().story.ch===1&&x().story.f.offered)||SH.lvl()>=6;
function chapterArt(c){const [a,b]=c.pal;return `<svg viewBox="0 0 240 110" class="chart"><defs><radialGradient id="cha"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient></defs><rect width="240" height="110" rx="14" fill="${a}"/><circle cx="120" cy="50" r="46" fill="url(#cha)" class="flick"/><path d="M0 84 q60 -26 120 -4 t120 -6 v36 h-240z" fill="#0003"/><rect x="112" y="34" width="16" height="22" rx="5" fill="${b}" stroke="#6b4440" stroke-width="2"/><path d="M120 22 v12" stroke="#6b4440" stroke-width="2"/>${Array.from({length:14},(_,i)=>`<circle cx="${10+i*17}" cy="${18+((i*31)%50)}" r="${1+(i%3)}" fill="#fff" opacity=".8"/>`).join('')}</svg>`}
function startStory(){const st=x().story;if(st.started)return;st.started=1;st.ch=0;SH.save();storyIntro(0);document.body.classList.add('hint-explore')}
function storyIntro(i){const c=STORY[i];if(!c)return;setTimeout(()=>qmodal(`${chapterArt(c)}<p class="step">Chapter ${i+1} · ${c.where}</p><h2>${c.name}</h2><p>${c.intro}</p><button class="btn big" data-a="close">Let's go</button>`),300)}
function storyPanel(){const st=x().story;if(!st.started)return '';if(st.ch>=STORY.length)return `<div class="panel journal-card"><h2>Main story</h2><p>You are the Lantern Keeper of Sprout Hollow. New chapters are coming soon!</p></div>`;
  const c=STORY[st.ch],s=S();const all=c.steps.every(q=>q.done(s));
  return `<div class="panel journal-card story"><h2>Chapter ${st.ch+1}: ${c.name}</h2>${c.steps.map(q=>{const d=q.done(s);return `<div class="row"><span class="${d?'done':''}">${d?'✓ ':'○ '}${q.t}</span></div>`}).join('')}<div class="tools"><button class="btn ${all?'big':''}" data-x="story-claim" ${all?'':'disabled'}>${all?'Complete chapter':'In progress'}</button><button class="btn small" data-x="story-intro">Read intro</button></div></div>`}
function storyClaim(){const st=x().story,c=STORY[st.ch],s=S();if(!c||!c.steps.every(q=>q.done(s)))return;const r=Object.assign({},c.reward);let extra='';
  if(r.egg){delete r.egg;if(!s.x.egg)s.x.egg={at:Date.now()};extra=' and a mysterious egg'}
  if(r.hat){s.x.player.hats=s.x.player.hats||[];if(!s.x.player.hats.includes(r.hat))s.x.player.hats.push(r.hat);s.x.player.hat=r.hat;delete r.hat;extra+=' and the golden Keeper hat'}
  const got=give(r);st.done[c.id]=1;st.ch++;confetti();SH.sfx('fanfare');
  SH.modal(`${chapterArt(c)}<h2>Chapter complete!</h2><p>${c.outro}</p><p class="note">You received ${got}${extra}.</p><button class="btn big" data-x="story-next">Continue</button>`)}

/* ---------- meadow ---------- */
let BF=[],lastSpawn=0;
const flowerSVG=k=>{const f=FLOWERS[k];return `<svg viewBox="0 0 40 40"><path d="M20 38 v-14" stroke="#6f9a6a" stroke-width="3"/><ellipse cx="14" cy="30" rx="5" ry="2.5" fill="#7fae6a"/>${[0,72,144,216,288].map(a=>`<ellipse cx="20" cy="10" rx="5" ry="8" fill="${f.col}" stroke="#6b5048" stroke-width="1" transform="rotate(${a} 20 17)"/>`).join('')}<circle cx="20" cy="17" r="4.5" fill="${f.mid}"/>${k==='moonpetal'?'<circle cx="20" cy="17" r="16" fill="#fff6d6" opacity=".3"/>':''}</svg>`};
const bflySVG=k=>{const c=BUTTERFLIES[k].col;return `<svg viewBox="0 0 40 30"><g class="wing"><ellipse cx="12" cy="11" rx="10" ry="9" fill="${c}" stroke="#6b5048" stroke-width="1.2"/><ellipse cx="13" cy="22" rx="7" ry="6" fill="${c}" stroke="#6b5048" stroke-width="1.2"/></g><g class="wing r"><ellipse cx="28" cy="11" rx="10" ry="9" fill="${c}" stroke="#6b5048" stroke-width="1.2"/><ellipse cx="27" cy="22" rx="7" ry="6" fill="${c}" stroke="#6b5048" stroke-width="1.2"/></g><rect x="18.5" y="6" width="3" height="20" rx="1.5" fill="#6b5048"/>${k==='star'?'<circle cx="20" cy="15" r="14" fill="#fff3b0" opacity=".35"/>':''}</svg>`};
function wpick(tbl){let tot=0;const e=Object.entries(tbl);e.forEach(([k,v])=>tot+=v.w);let r=Math.random()*tot;for(const [k,v] of e){if((r-=v.w)<=0)return k}return e[0][0]}
function meadowDaily(){const m=x().meadow;if(m.date!==today()){m.date=today();m.patch=Array.from({length:8},()=>wpick(FLOWERS))}}
function spawnBF(){if(BF.length>=3||Date.now()-lastSpawn<5000)return;lastSpawn=Date.now();BF.push({id:Math.random().toString(36).slice(2,7),k:wpick(BUTTERFLIES),x:10+Math.random()*75,y:8+Math.random()*45,d:(Math.random()*3).toFixed(1)})}
function meadowView(){if(!meadowOpen())return `<div class="lockmsg"><h3>Moonpetal Meadow</h3><p>A shimmering curtain of water blocks the way. Finish Chapter 2 of the story, or reach level 6.</p></div>`;
  meadowDaily();spawnBF();const m=x().meadow;
  return `<div class="meadow"><div class="field2">${m.patch.map((k,i)=>k?`<button class="flower" data-x="pick" data-k="${i}" aria-label="Pick ${FLOWERS[k].name}">${flowerSVG(k)}</button>`:`<span class="flower gone"></span>`).join('')}${BF.map(b=>`<button class="bfly2" data-x="bfly" data-k="${b.id}" style="left:${b.x}%;top:${b.y}%;animation-delay:${b.d}s" aria-label="Catch ${BUTTERFLIES[b.k].name}">${bflySVG(b.k)}</button>`).join('')}</div><p class="hand fishmsg">Tap flowers to pick them and butterflies to catch them. Flowers regrow every day.</p></div>`}

/* ---------- mail, promises, egg ---------- */
const LETTERS={pip:['The forest has been humming since you arrived. I think it likes you.','Remember to rest, dear. Even lanterns need oil.'],lou:['Tried a new pie today. It exploded. Delicious, though!','If you find any extra pumpkins, you know where to find me.'],fern:['I found a beetle shaped like a heart! It ran away.','There is a secret under the old bridge. Probably. Maybe.'],bun:['By official proclamation: you are doing wonderfully.','The town hall cat sends her regards.'],mochi:['Mrrp. (Translation: thank you for the sunny windowsill.)','*a paw print, slightly muddy*']};
function mailCheck(){const m=x().mail;if(m.date!==today()){const k=rnd(Object.keys(NPCS));m.date=today();m.from=k;m.text=rnd(LETTERS[k]);m.gift=Math.random()<.6?rnd([{coins:40},{petal:2},{mush:1},{wood:3},{gems:1}]):null;m.read=false}}
function openMail(){mailCheck();const m=x().mail,s=S();if(m.read)return SH.toast('No new mail. A new letter arrives tomorrow');m.read=true;const got=m.gift?give(m.gift):'';SH.sfx('friend');SH.modal(`<span class="por big">${npcSVG(m.from)}</span><h2>A letter from ${NPCS[m.from].name}</h2><p class="hand letter">"${esc(m.text)}"</p>${got?`<p class="note">Tucked inside: ${got}</p>`:''}<button class="btn big" data-a="close">Lovely</button>`);SH.save()}
const EGG_MS=20*3600e3;
function eggCheck(){const e=x().egg;if(!e||e.hatched)return;if(Date.now()-e.at<EGG_MS)return;const pool=['mossbun','pippin','mushling','lumi','fluffkin'].filter(k=>!x().comp[k]);x().egg=null;
  if(!pool.length){give({gems:5});return SH.modal(`<h2>The egg hatched!</h2><p>A shower of sparkles. You found 5 gems inside!</p><button class="btn big" data-a="close">Yay</button>`)}const k=rnd(pool);x().comp[k]={aff:2,skin:0};confetti();SH.sfx('fanfare');qmodal(`${compSVG(k)}<h2>The egg hatched!</h2><p>Out tumbles a sleepy <b>${COMPANIONS[k].name}</b>, who decides you are its favorite person.</p><button class="btn big" data-a="close">Hello, little one</button>`);SH.save()}
const eggLeft=()=>{const e=x().egg;if(!e)return'';const ms=Math.max(0,EGG_MS-(Date.now()-e.at));const h=Math.floor(ms/3600e3),mi=Math.floor(ms%3600e3/60e3);return h?`${h}h ${mi}m`:`${mi}m`};

/* ---------- festivals ---------- */
function festToday(){return seasonDay()===4?FESTIVALS[season().id]:null}
function festCount(s,task){return task==='harvest'?s.x.c.harvest:task==='explore'?s.x.c.explore:task==='orders'?s.x.c.orders:sumFish(s)}
function festCheck(){const f=festToday(),s=S(),st=s.x.fest;if(!f){return}if(st.day!==s.day){st.day=s.day;st.base=festCount(s,f.task);st.claimed=false;setTimeout(()=>qmodal(`<h2>Festival day: ${f.name}!</h2><p>${f.desc}</p><p>Festival task: <b>${f.label}</b> to earn an exclusive <b>${DECOR[f.decor].name}</b>.</p><button class="btn big" data-a="close">Let's celebrate</button>`),500)}}
function festPanel(){const f=festToday(),s=S();if(!f){const left=(4-seasonDay()+7)%7||7;const next=FESTIVALS[seasonDay()<4?season().id:SEASONS[(SEASONS.indexOf(season())+1)%4].id];return `<p class="note">Next festival: <b>${next.name}</b> in ${left} day${left>1?'s':''}.</p>`}
  const v=Math.min(f.n,festCount(s,f.task)-(s.x.fest.base||0));return `<div class="fest"><b>Festival: ${f.name}</b><br><small>${f.label} · ${Math.max(0,v)}/${f.n}</small><button class="btn small" data-x="fest" ${v>=f.n&&!s.x.fest.claimed?'':'disabled'}>${s.x.fest.claimed?'Claimed':'Claim '+DECOR[f.decor].name}</button></div>`}

/* ---------- social: postcard, visit links, gift codes ---------- */
const APP_LINK='https://sprouthollow.github.io/';
function farmCard(d){return `<div class="visit"><h3>${esc(d.f||'A cozy farm')}</h3><p>Tended by <b>${esc(d.n||'a farmer')}</b> · Level ${d.l|0} · Day ${d.d|0}</p><div class="pals">${(d.c||[]).filter(k=>COMPANIONS[k]).map(k=>`<div class="pal">${window.SHScenes.creature(k,0)}<b>${COMPANIONS[k].name}</b></div>`).join('')}</div><p class="chips"><span class="chip on">${d.g|0} crops grown</span><span class="chip on">${d.fi|0} fish species</span><span class="chip on">${d.se|0} secrets</span><span class="chip on">Story chapter ${Math.min(4,(d.ch|0)+1)}</span></p></div>`}
function snapshot(){const s=S();return{n:s.x.player.name,f:s.x.player.farm,l:SH.lvl(),d:s.day,c:Object.keys(s.x.comp),g:Object.values(s.x.c.grown).reduce((a,b)=>a+b,0),fi:Object.keys(s.x.fish.caught).length,se:Object.keys(s.x.secrets).length,ch:s.x.story.ch||0}}
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/,'');
const dec=t=>JSON.parse(decodeURIComponent(escape(atob(t))));
function visitLink(){return APP_LINK+'#visit-'+enc(snapshot())}
function checkVisit(){const h=location.hash;if(!h.startsWith('#visit-'))return;try{const d=dec(h.slice(7));setTimeout(()=>SH.modal(`<p class="step">Visiting a friend's farm</p>${farmCard(d)}<p class="note">This is a snapshot they shared. Share your own from the Share tab!</p><button class="btn big" data-a="close">Back to my farm</button>`),900)}catch(e){}try{history.replaceState(null,'',location.pathname)}catch(e){}}
async function postcard(){const d=snapshot();const comps=d.c.slice(0,4).map((k,i)=>`<g transform="translate(${60+i*130} 200)">${window.SHScenes.creature(k,0).replace('<svg viewBox="0 0 100 100" class="cre">','<svg width="110" height="110" viewBox="0 0 100 100">')}</g>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8d9e8"/><stop offset="1" stop-color="#fff5e9"/></linearGradient></defs><rect width="600" height="400" rx="24" fill="url(#g)"/><path d="M0 300 Q150 250 300 290 T600 280 V400 H0z" fill="#a8c3a0"/><rect x="14" y="14" width="572" height="372" rx="18" fill="none" stroke="#96745B" stroke-width="3" stroke-dasharray="10 6"/><text x="300" y="70" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-size="34" font-weight="700" fill="#5b7a52">${esc(d.f||'My Sprout Hollow farm')}</text><text x="300" y="104" text-anchor="middle" font-family="Nunito,sans-serif" font-size="18" fill="#6b5048">by ${esc(d.n||'a farmer')} · Level ${d.l} · Day ${d.d}</text><text x="300" y="138" text-anchor="middle" font-family="Nunito,sans-serif" font-size="16" fill="#6b5048">${d.g} crops grown · ${d.fi} fish species · ${d.se} secrets found</text>${comps}<text x="300" y="378" text-anchor="middle" font-family="Nunito,sans-serif" font-size="15" fill="#6b5048">Come play: sprouthollow.github.io</text></svg>`;
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode().catch(()=>{});const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const c=cv.getContext('2d');c.drawImage(img,0,0,1200,800);
  const blob=await new Promise(r=>cv.toBlob(r,'image/png'));const url=URL.createObjectURL(blob);const file=new File([blob],'sprout-hollow-farm.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'My Sprout Hollow farm',text:'Come visit my farm! '+visitLink()});return}catch(e){}}
  SH.modal(`<h2>Your farm postcard</h2><img class="postcard" src="${url}" alt="Postcard of your farm"><div class="tools center"><a class="btn big" href="${url}" download="sprout-hollow-farm.png">Save image</a><button class="btn" data-a="close">Close</button></div>`)}
function makeGift(){const s=S();if(s.x.daily2.gift===today())return SH.toast('You can make one gift code per day');const k=Math.random()<.75?'moonmelon':'starfruit';const id=Math.random().toString(36).slice(2,10);s.x.myGifts.push(id);s.x.daily2.gift=today();const code='SPROUT-'+enc({k,id,f:s.x.player.name||'a friend'});SH.save();
  SH.modal(`<h2>A gift for a friend</h2><p>Send this code to a friend. They redeem it in their Share tab for a <b>${SH.CROPS[k].name}</b> seed.</p><textarea id="giftcode" rows="3" readonly>${code}</textarea><div class="tools center"><button class="btn big" data-x="copygift">Copy code</button><button class="btn" data-a="close">Done</button></div>`)}
function redeem(){const v=(($('redeem')||{}).value||'').trim(),s=S();try{if(!v.startsWith('SPROUT-'))throw 0;const d=dec(v.slice(7));if(!d.id||!SH.CROPS[d.k]||!SH.CROPS[d.k].rare)throw 0;if(s.x.myGifts.includes(d.id))return SH.toast("That's your own gift code. Send it to a friend!");if(s.x.gifts[d.id])return SH.toast('You already redeemed this gift');s.x.gifts[d.id]=1;SH.S.rare[d.k]=(SH.S.rare[d.k]||0)+1;confetti();SH.sfx('gold');SH.modal(`<h2>A gift from ${esc(d.f||'a friend')}!</h2><p>You received a <b>${SH.CROPS[d.k].name}</b> seed.</p><button class="btn big" data-a="close">Thank you!</button>`);SH.save()}catch(e){SH.toast("That gift code didn't work. Check it was copied fully")}}
function socialPanels(){return `<div class="panel"><h2>Share your farm</h2><p>Make a postcard of your farm, or send a link so friends can peek at it.</p><div class="tools"><button class="btn big" data-x="postcard">Make postcard</button><button class="btn" data-x="copyvisit">Copy visit link</button></div></div>
 <div class="panel"><h2>Gifts</h2><p>Make one gift code a day with a rare seed for a friend, or redeem one you received.</p><div class="tools"><button class="btn" data-x="makegift">Make gift code</button></div><label for="redeem">Redeem a gift code</label><input id="redeem" placeholder="SPROUT-..."><div class="tools"><button class="btn" data-x="redeem">Redeem</button></div></div>`}

/* ---------- onboarding ---------- */
function welcome(){SH.modal(`<div class="tut-art">${compSVG('fluffkin')}</div><h2>Welcome to Sprout Hollow!</h2><p>A little home. A big adventure. Who's moving in?</p><label for="pname">Your name</label><input id="pname" maxlength="18" placeholder="e.g. Nae"><label for="fname">Your farm's name</label><input id="fname" maxlength="24" placeholder="e.g. Honeydew Hollow"><p>Pick a hat</p><div class="tools center">${['#e98aa4','#9fc6e8','#b8d8a0','#c8b4e8','#f2c48a'].map((c,i)=>`<button class="swatch ${i===0?'on':''}" style="background:${c}" data-x="whats" data-k="${c}" aria-label="Hat colour"></button>`).join('')}</div><button class="btn big" data-x="welcome-go">Move in</button>`)}

/* ---------- customization helpers ---------- */
function stylePanel(){const h=x().home;return `<div class="panel"><h2>Cottage style</h2><p>Walls</p><div class="tools">${HOME_STYLES.wall.map((w,i)=>`<button class="swatch ${h.wall===i?'on':''}" style="background:linear-gradient(135deg,${w[0]} 50%,${w[1]} 50%)" data-x="hstyle" data-k="wall" data-c="${i}" title="${w[2]}" aria-label="${w[2]} walls"></button>`).join('')}</div><p>Floor</p><div class="tools">${HOME_STYLES.floor.map((w,i)=>`<button class="swatch ${h.floor===i?'on':''}" style="background:linear-gradient(135deg,${w[0]} 50%,${w[1]} 50%)" data-x="hstyle" data-k="floor" data-c="${i}" title="${w[2]}" aria-label="${w[2]} floor"></button>`).join('')}</div></div>`}
function homePanels(){const s=S();mailCheck();const m=s.x.mail;const e=s.x.egg;
  return `<div class="panel journal-card"><h2>Home</h2><div class="row"><span><b>Mailbox</b><br><small>${m.read?'No new mail. Next letter tomorrow':'A new letter from '+NPCS[m.from].name}</small></span><button class="btn small ${m.read?'':'big'}" data-x="mail" ${m.read?'disabled':''}>${m.read?'Read':'Open'}</button></div>${e?`<div class="row"><span><b>Companion egg</b><br><small>Hatches in ${eggLeft()}. Check back soon!</small></span><span class="egg">${eggSVG()}</span></div>`:''}${s.x.promise&&s.x.promise.date!==today()?`<div class="row"><span><b>${NPCS[s.x.promise.k].name}</b> has something for you in the Village!</span></div>`:''}</div>`}
const eggSVG=()=>'<svg viewBox="0 0 40 46" width="34" height="40" class="wob2"><ellipse cx="20" cy="26" rx="15" ry="18" fill="#fff5e9" stroke="#96745B" stroke-width="2"/><circle cx="14" cy="20" r="3" fill="#f6a6c4"/><circle cx="24" cy="30" r="4" fill="#c9b9e8"/><circle cx="26" cy="16" r="2" fill="#b8d9e8"/></svg>';

const MQ=[];function qmodal(h){if(document.getElementById('modal').classList.contains('on'))MQ.push(h);else SH.modal(h)}
document.addEventListener('click',e=>{if(e.target.closest('[data-a=close]')||e.target.id==='modal')setTimeout(()=>{if(MQ.length&&!document.getElementById('modal').classList.contains('on'))SH.modal(MQ.shift())},250)});
/* ---------------- Pause ---------------- */
let PAUSED=false;
function setPause(on){PAUSED=on;const A=SH.AU;try{if(A&&A.ctx)on?A.ctx.suspend():A.ctx.resume()}catch(e){}
  document.body.classList.toggle('paused',on);const b=$('pbtn');if(b){b.textContent=on?'Resume':'Pause';b.setAttribute('aria-pressed',on)}
  if(on)SH.modal(`<h2>Paused</h2><p>Your crops are resting and time has stopped. Nothing will grow or change until you come back.</p><button class="btn big" data-x="resume">Resume</button>`);else SH.close()}
document.addEventListener('keydown',e=>{if(e.key==='p'||e.key==='P'){if(!/input|textarea/i.test(document.activeElement.tagName))setPause(!PAUSED)}if(e.key==='Escape'&&PAUSED)setPause(false)});

/* ---------------- Sheets: side panels as one-at-a-time cards (no page scrolling) ---------------- */
const SHEET={};
function sheets(tab){const side=$('side');if(!side)return;side.querySelectorAll('.sheetbar').forEach(n=>n.remove());const ps=[...side.children].filter(n=>n.classList.contains('panel'));if(ps.length<2){side.classList.remove('sheeted');return}
  side.classList.add('sheeted');const names=ps.map(p=>{const h=p.querySelector('h2');return h?h.textContent:'More'});
  let i=SHEET[tab]||0;if(i>=ps.length)i=0;
  ps.forEach((p,j)=>p.hidden=j!==i);
  if(side._keep){const vis=ps[i];if(vis)vis.scrollTop=side._keep;side._keep=0}
  const bar=document.createElement('div');bar.className='sheetbar';bar.setAttribute('role','tablist');
  bar.innerHTML=names.map((n,j)=>`<button class="chipbtn ${j===i?'on':''}" role="tab" aria-selected="${j===i}" data-x="sheet" data-k="${j}">${esc(n)}</button>`).join('');
  side.prepend(bar)}

/* ---------------- Init ---------------- */
function init(){SH=window.SH;
  const st=document.querySelector('.stats');if(st&&!$('pbtn'))st.insertAdjacentHTML('beforeend','<button class="btn hb" id="pbtn" data-x="pausebtn" aria-pressed="false">Pause</button>');
  const scn=document.querySelector('.scene'),sec=document.querySelector('.main>section');if(scn&&sec&&scn.parentElement!==sec){sec.prepend(scn);document.body.classList.add('stage')}
  const hd=document.querySelector('header');if(hd&&!hd.querySelector('.hctl')){const c=document.createElement('div');c.className='hctl';['mbtn','sbtn','pbtn'].forEach(id=>{const b=$(id);if(b)c.appendChild(b)});hd.appendChild(c)}try{migrate();ensureDaily();seasonCheck();backup(false);SH.save()}catch(e){console.error('features init',e)}
  setTimeout(()=>{try{if(x().tut<TUT.length){(!x().player.name&&x().tut===0)?welcome():tutorial()}else{dailyCheck();if(!x().story.started)startStory()}checkVisit()}catch(e){console.error(e)}},600);
  if(window.SHEnt)window.SHEnt.refresh().catch(()=>{})}
window.SHX={walk:WALK,paused:()=>PAUSED,tabs:TABS,init,side:sideView,after,emit,explore,mapGen,growMul};
})();
