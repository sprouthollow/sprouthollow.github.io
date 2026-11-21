/* Sprout Hollow pixel world renderer.
   Draws handcrafted-looking pixel scenes procedurally on a low-resolution canvas,
   scaled up crisply. Static scenery is cached; only lights, creatures and the player animate. */
(function(){
'use strict';
const H=144;                       // logical pixel height; width follows the container's aspect ratio
const P={cream:'#FFF5E9',sage:'#A8C3A0',peach:'#F4BFA7',lav:'#C9B9E8',sky:'#B8D9E8',brown:'#96745B',pink:'#E8B6C5',ink:'#3a2a2a'};
let cv,ctx,bg,bgx,W=256,scene='',key='',t=0,last=0,raf=0,seed=1;
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let x=Math.imul(s^s>>>15,1|s);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296};
let R1=rng(7);
const ri=(a,b)=>a+Math.floor(R1()*(b-a+1));

/* ---------- primitives (work on whichever context is passed) ---------- */
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function disc(c,cx,cy,r,col){c.fillStyle=col;cx=Math.round(cx);cy=Math.round(cy);for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*.6));c.fillRect(cx-w,cy+dy,w*2+1,1)}}
function oval(c,cx,cy,rx,ry,col){c.fillStyle=col;for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry+.01))));c.fillRect(Math.round(cx-w),Math.round(cy+dy),w*2+1,1)}}
function blob(c,cx,cy,r,lo,mid,hi){disc(c,cx+1,cy+1,r,lo);disc(c,cx,cy,r,mid);disc(c,cx-Math.ceil(r/3),cy-Math.ceil(r/3),Math.max(1,Math.floor(r/2)),hi)}
function cluster(c,cx,cy,rad,n,lo,mid,hi,dot){for(let i=0;i<n;i++){const a=R1()*6.28,d=R1()*rad;blob(c,cx+Math.cos(a)*d,cy+Math.sin(a)*d*.7,ri(3,6),lo,mid,hi)}if(dot)for(let i=0;i<n*2;i++)R(c,cx+ri(-rad,rad),cy+ri(-rad*.7,rad*.7),1,1,dot)}
function bez(c,p0,p1,p2,r0,r1,col,steps=60){for(let i=0;i<=steps;i++){const s=i/steps,x=(1-s)*(1-s)*p0[0]+2*(1-s)*s*p1[0]+s*s*p2[0],y=(1-s)*(1-s)*p0[1]+2*(1-s)*s*p1[1]+s*s*p2[1];disc(c,x,y,Math.round(r0+(r1-r0)*s),col)}}
function bezPts(p0,p1,p2,n){const o=[];for(let i=0;i<=n;i++){const s=i/n;o.push([(1-s)*(1-s)*p0[0]+2*(1-s)*s*p1[0]+s*s*p2[0],(1-s)*(1-s)*p0[1]+2*(1-s)*s*p1[1]+s*s*p2[1]])}return o}
function glow(c,x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.globalAlpha=1}
function grad(c,y0,y1,stops,band=4){for(let y=y0;y<y1;y+=band){const s=(y-y0)/(y1-y0);let i=0;while(i<stops.length-2&&s>stops[i+1][0])i++;const a=stops[i],b=stops[i+1],k=(s-a[0])/(b[0]-a[0]||1);R(c,0,y,W,band,mix(a[1],b[1],Math.min(1,Math.max(0,k))))}}
function mix(a,b,k){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')}

/* ---------- seasons ---------- */
function season(){try{return document.body.dataset.season||'spring'}catch(e){return'spring'}}
function leaf(){return{spring:['#3f6a35','#5f8f3f','#8fbf55'],summer:['#2f6a3a','#4f9a45','#7fcf5a'],autumn:['#8a4a22','#c9762e','#f0a948'],winter:['#5a6f7a','#8fa6b0','#dfeef5']}[season()]}
function grass(){return{spring:['#8fdcaa','#7ccf9a','#a6ecbc'],summer:['#7fd49a','#68c286','#9be6b0'],autumn:['#c9d98a','#b3c676','#dfe9a2'],winter:['#e8f2f6','#d2e2ea','#ffffff']}[season()]}

/* ---------- sprites ---------- */
function player(c,x,y,f,hat){x=Math.round(x);y=Math.round(y);const o='#4a3228';
  R(c,x-4,y+13,9,2,'rgba(0,0,0,.18)');
  const leg=f%2;R(c,x-3,y+10,2,3-leg,'#7a5a46');R(c,x+1,y+10,2,2+leg,'#7a5a46');
  R(c,x-4,y+6,9,5,o);R(c,x-3,y+6,7,4,'#a8c3a0');R(c,x-3,y+9,7,1,'#8fae88');R(c,x-5,y+7,1,3,'#ffe0c8');R(c,x+5,y+7,1,3,'#ffe0c8');
  R(c,x-3,y+1,7,5,o);R(c,x-2,y+1,5,5,'#ffe0c8');R(c,x-1,y+3,1,1,'#2a1a1a');R(c,x+2,y+3,1,1,'#2a1a1a');R(c,x-2,y+4,1,1,'#f7a8bf');R(c,x+3,y+4,1,1,'#f7a8bf');
  R(c,x-3,y+1,1,3,'#6a4030');R(c,x+4,y+1,1,3,'#6a4030');
  R(c,x-5,y,11,2,hat);R(c,x-3,y-2,7,2,hat);R(c,x-2,y-3,5,1,hat);R(c,x-3,y-1,7,1,'rgba(255,255,255,.35)')}
const CREATURE={
 fluffkin(c,x,y,b){for(const [dx,dy] of [[-4,0],[4,0],[0,-4],[-3,-3],[3,-3],[-3,3],[3,3],[0,3]])disc(c,x+dx,y+dy+b,2,'#e9e4f4');disc(c,x,y+b,4,'#ffffff');eyes(c,x,y+b)},
 mossbun(c,x,y,b){R(c,x-3,y-9+b,2,5,'#7fae5a');R(c,x+2,y-9+b,2,5,'#7fae5a');R(c,x-3,y-8+b,1,3,'#ffc6d2');R(c,x+3,y-8+b,1,3,'#ffc6d2');disc(c,x,y+b,5,'#7fae5a');disc(c,x,y+b,4,'#9cc96e');R(c,x-2,y-4+b,1,1,'#5a8a45');R(c,x+3,y+2+b,1,1,'#5a8a45');R(c,x+1,y-6+b,2,2,'#ffadbd');eyes(c,x,y+b)},
 lumi(c,x,y,b){glow(c,x,y+b,12,'rgba(255,240,140,.9)',.45+.25*Math.sin(t*.25));oval(c,x-4,y-2+b,3,2,'#cfeaff');oval(c,x+4,y-2+b,3,2,'#cfeaff');oval(c,x,y+b,3,4,'#ffe86a');R(c,x-1,y+2+b,3,2,'#fff8c0');R(c,x-2,y-6+b,1,2,'#5a4a3a');R(c,x+2,y-6+b,1,2,'#5a4a3a');R(c,x-1,y-1+b,1,1,'#2a1a1a');R(c,x+1,y-1+b,1,1,'#2a1a1a')},
 pippin(c,x,y,b){disc(c,x+6,y+2+b,3,'#f08a3c');R(c,x+7,y+1+b,2,2,'#fff');R(c,x-5,y-7+b,3,3,'#f08a3c');R(c,x+3,y-7+b,3,3,'#f08a3c');R(c,x-4,y-6+b,1,1,'#3a2a2a');R(c,x+4,y-6+b,1,1,'#3a2a2a');disc(c,x,y+b,5,'#f08a3c');disc(c,x,y+2+b,3,'#fff4e8');eyes(c,x,y+b)},
 mushling(c,x,y,b){R(c,x-3,y-1+b,7,6,'#fff1dc');R(c,x-3,y+4+b,7,1,'#e8d2b4');for(let i=0;i<6;i++)R(c,x-6+i,y-2-Math.min(i,5-i)*1+b,13-i*2,1,'#e35a6a');oval(c,x,y-4+b,6,3,'#e35a6a');R(c,x-3,y-5+b,2,1,'#fff');R(c,x+2,y-4+b,2,1,'#fff');R(c,x-1,y+1+b,1,1,'#2a1a1a');R(c,x+1,y+1+b,1,1,'#2a1a1a');R(c,x-3,y+2+b,1,1,'#f7a8bf');R(c,x+3,y+2+b,1,1,'#f7a8bf')},
 emberkin(c,x,y,b){glow(c,x,y+b,10,'rgba(255,160,90,.8)',.25+.15*Math.sin(t*.3));oval(c,x-6,y-2+b,3,3,'#c9b9e8');oval(c,x+6,y-2+b,3,3,'#c9b9e8');R(c,x+4,y+3+b,4,2,'#f4a98a');R(c,x+7,y+2+b,2,1,'#ffcf6a');disc(c,x,y+b,5,'#f4a98a');disc(c,x,y+2+b,3,'#ffe0c8');R(c,x-3,y-6+b,1,2,'#fff1dc');R(c,x+3,y-6+b,1,2,'#fff1dc');eyes(c,x,y+b)}};
function eyes(c,x,y){R(c,x-2,y-1,1,2,'#2a1a1a');R(c,x+2,y-1,1,2,'#2a1a1a');R(c,x-2,y-1,1,1,'#5a4a5a');R(c,x-3,y+1,1,1,'#f7a8bf');R(c,x+3,y+1,1,1,'#f7a8bf')}
function creature(c,k,x,y,b,skin){if(!CREATURE[k])return;R(c,x-4,y+6,9,1,'rgba(0,0,0,.18)');CREATURE[k](c,Math.round(x),Math.round(y),Math.round(b||0));
  if(skin===1){R(c,x-1,y-6,3,1,'#e86a9a');R(c,x-2,y-7,1,3,'#e86a9a');R(c,x+2,y-7,1,3,'#e86a9a')}
  if(skin===2){c.globalAlpha=.5;for(let i=0;i<3;i++)R(c,x-5+((t+i*7)%11),y-8+((t*2+i*5)%6),1,1,'#fff8c0');c.globalAlpha=1}}
function spriteURL(k,skin){const c=document.createElement('canvas');c.width=24;c.height=24;const x=c.getContext('2d');creature(x,k,12,13,0,skin||0);
  const o=document.createElement('canvas');o.width=96;o.height=96;const y=o.getContext('2d');y.imageSmoothingEnabled=false;y.drawImage(c,0,0,96,96);return o.toDataURL()}

/* ---------- scenes: static layers ---------- */
let L={};   // layout points shared between static and animated layers
function forestStatic(c){R1=rng(11);const lv=leaf();
  grad(c,0,H,[[0,'#3d3f86'],[.35,'#6b7fcf'],[.62,'#b9c4ee'],[.75,'#c9d4f0']],3);
  for(let i=0;i<9;i++){const x=ri(10,W-10),h=ri(30,60);R(c,x,H*.7-h,2,h,'#8b94d0')}
  for(let i=0;i<16;i++)blob(c,ri(0,W),ri(H*.38,H*.56),ri(7,13),'#7f88c8','#939ddc','#a8b1e6');
  for(let i=0;i<7;i++){const x=ri(0,W);R(c,x,H*.5,3,H*.3,'#6f78b8')}
  for(let i=0;i<14;i++)blob(c,ri(0,W),ri(H*.5,H*.64),ri(6,11),'#5d669f','#6f78b8','#838cc8');
  c.globalAlpha=.35;R(c,0,H*.6,W,10,'#e8ecff');c.globalAlpha=.2;R(c,0,H*.56,W,6,'#ffffff');c.globalAlpha=1;
  const g0=H*.68;grad(c,g0,H,[[0,'#3f7a5a'],[1,'#2f5f48']],2);
  for(let i=0;i<220;i++){const x=ri(0,W),y=ri(g0,H);R(c,x,y,1,ri(1,2),R1()<.5?'#5a9a68':'#2a5440')}
  // path to the treehouse door
  const door=[W*.72,H*.66];L.door=door;
  for(let y=Math.round(door[1]);y<H;y++){const s=(y-door[1])/(H-door[1]);const cx=door[0]+(W*.46-door[0])*Math.pow(s,.8)+Math.sin(s*5)*6,hw=4+s*30;R(c,cx-hw,y,hw*2,1,'#d99a88');if(y%3===0){R(c,cx-hw-1,y,2,1,'#b07068');R(c,cx+hw-1,y,2,1,'#b07068')}}
  for(let i=0;i<40;i++){const y=ri(door[1]+4,H-1),s=(y-door[1])/(H-door[1]),cx=door[0]+(W*.46-door[0])*Math.pow(s,.8)+Math.sin(s*5)*6;R(c,cx+ri(-20,20)*s,y,2,1,'#f0c0b0')}
  // left giant tree
  const lx=W*.13,rx=W*.86;
  bez(c,[lx-10,H],[lx-6,H*.6],[lx,H*.15],15,9,'#5a3236');bez(c,[lx-12,H],[lx-8,H*.6],[lx-2,H*.15],12,7,'#6e3e40');bez(c,[lx-4,H],[lx-2,H*.6],[lx+3,H*.2],5,3,'#8a5450');
  for(const d of[-1,1])bez(c,[lx-6,H-6],[lx+d*14,H-6],[lx+d*28,H],5,2,'#5a3236');
  bez(c,[lx,H*.25],[W*.3,-8],[W*.55,H*.14],7,3,'#5a3236');bez(c,[lx+2,H*.24],[W*.3,-6],[W*.55,H*.13],4,2,'#7a4846');
  bez(c,[lx-2,H*.3],[lx-20,H*.1],[lx-36,H*.06],5,2,'#5a3236');
  bez(c,[lx+4,H*.45],[W*.26,H*.32],[W*.36,H*.36],4,2,'#5a3236');
  // right giant tree
  bez(c,[rx+12,H],[rx+6,H*.6],[rx,H*.12],18,10,'#5a3236');bez(c,[rx+8,H],[rx+4,H*.6],[rx-2,H*.12],13,7,'#6e3e40');bez(c,[rx+2,H],[rx,H*.6],[rx-3,H*.2],5,3,'#8a5450');
  for(const d of[-1,1])bez(c,[rx+6,H-6],[rx+d*16,H-6],[rx+d*30,H],5,2,'#5a3236');
  bez(c,[rx,H*.22],[W*.68,-10],[W*.48,H*.12],7,3,'#5a3236');bez(c,[rx-2,H*.21],[W*.68,-8],[W*.48,H*.11],4,2,'#7a4846');
  bez(c,[rx+2,H*.3],[rx+20,H*.1],[rx+40,H*.05],5,2,'#5a3236');
  // little glowing window in the left trunk
  R(c,lx-8,H*.52,8,10,'#3a2226');R(c,lx-7,H*.52+1,6,8,'#ffcf6a');R(c,lx-4,H*.52+1,1,8,'#c98a3a');R(c,lx-7,H*.52+5,6,1,'#c98a3a');L.twin=[lx-4,H*.52+5];
  // canopy: green clusters + pink blossom clusters along both branches
  const arcL=bezPts([lx,H*.25],[W*.3,-8],[W*.55,H*.14],10),arcR=bezPts([rx,H*.22],[W*.68,-10],[W*.48,H*.12],10);
  [...arcL,...arcR].forEach((p,i)=>{cluster(c,p[0],p[1]-2,12,4,lv[0],lv[1],lv[2],null);if(i%2===0)cluster(c,p[0]+ri(-6,6),p[1]+ri(-4,6),9,3,'#a8326a','#d94f8f','#ff8fc4','#ffd0e6')});
  cluster(c,lx-30,H*.06,10,4,lv[0],lv[1],lv[2]);cluster(c,rx+36,H*.06,10,4,lv[0],lv[1],lv[2]);cluster(c,lx-22,H*.12,8,3,'#a8326a','#d94f8f','#ff8fc4','#ffd0e6');cluster(c,rx+24,H*.14,8,3,'#a8326a','#d94f8f','#ff8fc4','#ffd0e6');
  cluster(c,W*.34,H*.34,8,3,'#a8326a','#d94f8f','#ff8fc4','#ffd0e6');
  for(let i=0;i<10;i++){const p=(i<5?arcL:arcR)[ri(2,8)];R(c,p[0],p[1]+4,1,ri(6,14),'#3f6a35')}
  L.lanterns=[...[2,4,6,8].map(i=>arcL[i]),...[2,4,6,8].map(i=>arcR[i]),[lx-26,H*.12],[rx+28,H*.12]].map((p,i)=>[p[0]+ri(-2,2),p[1]+6,ri(8,20)]);
  // treehouse at the base of the right tree
  const hx=W*.64,hy=H*.42,hw=W*.17,hh=H*.24;L.house=[hx,hy,hw,hh];
  R(c,hx-2,hy+hh,hw+4,3,'#5a3a2e');
  R(c,hx,hy,hw,hh,'#8a4a3a');for(let y=hy+3;y<hy+hh;y+=4)R(c,hx,y,hw,1,'#723a2e');
  for(let i=0;i<11;i++){const ins=i*(hw/2+6)/11;R(c,hx-6+ins,hy-1-i*2,hw+12-2*ins,2,i%2?'#5a3d78':'#6d4c90')}
  R(c,hx-6,hy-1,hw+12,2,'#7a5a9a');
  R(c,hx+hw*.12,hy+hh*.3,hw*.3,hh*.32,'#3a2226');R(c,hx+hw*.12+1,hy+hh*.3+1,hw*.3-2,hh*.32-2,'#ffcf6a');R(c,hx+hw*.27,hy+hh*.3+1,1,hh*.32-2,'#c98a3a');
  R(c,hx+hw*.55,hy+hh*.35,hw*.28,hh*.65,'#3a2226');R(c,hx+hw*.55+1,hy+hh*.35+1,hw*.28-2,hh*.65-1,'#ffb04a');R(c,hx+hw*.55+hw*.2,hy+hh*.65,1,1,'#7a4a1a');
  L.win=[hx+hw*.27,hy+hh*.46];L.doorGlow=[hx+hw*.69,hy+hh*.7];
  for(const fx of[hx-4,hx+hw-2]){R(c,fx,hy+hh-5,6,5,'#c9764e');cluster(c,fx+3,hy+hh-7,3,2,'#a8326a','#e86a9a','#ffb0d0')}
  R(c,hx+hw*.5,hy+hh,hw*.4,3,'#a87058');
  // mushrooms, rocks and flowers
  for(const m of[[lx+18,H*.82],[lx+28,H*.9],[rx-30,H*.86],[W*.3,H*.76],[W*.58,H*.92]]){R(c,m[0],m[1],2,4,'#fff1dc');oval(c,m[0]+1,m[1]-1,4,2,R1()<.5?'#8fe0f0':'#e86aa0')}
  L.shrooms=[[lx+19,H*.8],[lx+29,H*.88],[rx-29,H*.84],[W*.3+1,H*.74],[W*.58+1,H*.9]];
  for(let i=0;i<60;i++){const x=ri(0,W),y=ri(g0+2,H-2);R(c,x,y,1,1,['#ffd0e6','#fff3a0','#c9b9e8','#ffffff'][i%4])}
  for(const r of[[W*.22,H*.94],[W*.82,H*.95],[W*.4,H*.98]]){oval(c,r[0],r[1],5,3,'#7a7f9a');oval(c,r[0]-1,r[1]-1,3,2,'#9aa0ba')}}

function farmStatic(c){R1=rng(5);const g=grass(),lv=leaf();
  R(c,0,0,W,H,g[0]);for(let i=0;i<500;i++)R(c,ri(0,W),ri(0,H),1,1,R1()<.5?g[1]:g[2]);
  for(let i=0;i<60;i++){const x=ri(0,W),y=ri(0,H);R(c,x,y,1,2,g[1]);R(c,x+1,y+1,1,1,g[1])}
  // paths
  const px=Math.max(8,W*.2-37)+Math.min(W*.3,74)*.5,py=H*.5;R(c,px-6,py,12,H*.62-py+10,'#f4dcae');R(c,0,H*.62,W,10,'#f4dcae');R(c,px-7,py,1,H*.62-py,'#e2c28e');R(c,0,H*.62-1,W,1,'#e2c28e');R(c,0,H*.62+10,W,1,'#e2c28e');
  for(let i=0;i<40;i++)R(c,ri(0,W),H*.62+ri(1,8),1,1,'#e9cc96');
  // cottage
  const cw=Math.min(W*.3,74),ch=H*.36,cx=Math.max(8,W*.2-cw/2),cy=H*.12;L.cott=[cx,cy,cw,ch];
  R(c,cx,cy+ch*.45,cw,ch*.55,'#bdb3a4');for(let y=cy+ch*.5;y<cy+ch;y+=4)for(let x=cx+((y/4)%2)*4;x<cx+cw;x+=8)R(c,x,y,7,3,'#cfc6b8');
  for(let i=0;i<14;i++)R(c,cx-6+i*(cw/28),cy+i*ch*.034,cw+12-i*(cw/14),ch*.04,i%2?'#8f8378':'#a39789');
  R(c,cx-6,cy+ch*.44,cw+12,3,'#7a6e64');R(c,cx+cw*.72,cy-4,6,12,'#9a8a80');R(c,cx+cw*.72,cy-5,6,2,'#b0a096');
  R(c,cx+cw*.42,cy+ch*.62,cw*.17,ch*.38,'#6a3a3a');R(c,cx+cw*.42+1,cy+ch*.62+1,cw*.17-2,ch*.38-1,'#e86a8a');R(c,cx+cw*.42+cw*.12,cy+ch*.82,1,1,'#ffd96a');
  for(const wx of[cx+cw*.1,cx+cw*.68]){R(c,wx,cy+ch*.6,cw*.2,ch*.18,'#6a5a4a');R(c,wx+1,cy+ch*.6+1,cw*.2-2,ch*.18-2,'#9fd8f0');R(c,wx,cy+ch*.78,cw*.2,3,'#96745B');for(let i=0;i<4;i++)R(c,wx+1+i*3,cy+ch*.76,2,2,['#e86a9a','#fff3a0','#c9b9e8','#e86a9a'][i])}
  L.door=[cx+cw*.5,cy+ch];
  // well
  const wx=px+46,wy=H*.18;R(c,wx-6,wy+8,13,8,'#a9a29a');R(c,wx-5,wy+9,11,2,'#4a6a8a');R(c,wx-7,wy,2,10,'#96745B');R(c,wx+6,wy,2,10,'#96745B');for(let i=0;i<5;i++)R(c,wx-9+i,wy-1-i,19-i*2,1,'#8a5a3a');
  // mailbox
  R(c,px+10,py-2,2,8,'#96745B');R(c,px+8,py-6,7,5,'#e86a8a');
  const FW=Math.min(W*.42,96),FH=H*.27,FX=Math.max(6,px-FW*.5),FY=H*.71;
  // fences
  for(let x=W*.4;x<W;x+=8){R(c,x,H*.56,2,7,'#96745B');R(c,x,H*.58,8,1,'#b08a6a')}
  for(let y=H*.7;y<H;y+=8){R(c,FX+FW+6,y,2,7,'#96745B');R(c,FX+FW+6,y+2,1,8,'#b08a6a')}
  // village extras on the right: a mushroom house, a pond with a little bridge, and a flower field
  const mx=Math.min(W-40,px+120),my=H*.2;R(c,mx-6,my+10,14,16,'#fff1dc');R(c,mx-2,my+16,5,10,'#96745B');R(c,mx+4,my+13,3,3,'#9fd8f0');oval(c,mx+1,my+8,16,8,'#e35a6a');for(const d of[[-8,6],[2,3],[9,8],[-2,10]])oval(c,mx+d[0],my+d[1],2,1,'#fff');
  const ox=Math.min(W-30,px+90),oy=H*.86;oval(c,ox,oy,22,9,'#5aa8c8');oval(c,ox,oy-1,20,7,'#8fd0e8');oval(c,ox-6,oy-3,5,2,'#d0f0ff');R(c,ox-4,oy-10,8,20,'#b08a6a');for(let y=oy-10;y<oy+10;y+=3)R(c,ox-4,y,8,1,'#8a6a4a');
  for(let i=0;i<70;i++){const x=ri(px+130,W-4),y=ri(H*.66,H-4);if(x>0){R(c,x,y,1,2,'#6fa85a');R(c,x,y-1,1,1,['#f48fb8','#fff3a0','#c9b9e8','#ffffff'][i%4])}}
  // crop field (plots drawn live)
  const fw=FW,fh=FH,fx=FX,fy=FY;L.field=[fx,fy,fw,fh];R(c,fx-2,fy-2,fw+4,fh+4,'#b07a52');R(c,fx,fy,fw,fh,'#c99a6a');
  for(let y=fy+2;y<fy+fh;y+=3)R(c,fx,y,fw,1,'#b8885a');
  // trees
  const tree=(x,y,r,pink)=>{R(c,x-2,y+r-2,4,r*.8,'#7a4a2e');pink?cluster(c,x,y,r*.7,6,'#c2507e','#f48fb8','#ffd0e2','#fff'):cluster(c,x,y,r*.7,6,lv[0],lv[1],lv[2]);};
  tree(Math.min(W-20,px+170),H*.3,16,true);tree(px+75,H*.12,11);tree(W-12,H*.08,9);tree(W*.98,H*.5,10,true);tree(W-20,H*.86,12);tree(6,H*.06,8);for(let x=px+200;x<W-30;x+=46)tree(x,H*.1+((x/46)%2)*10,10,((x/46)|0)%3===0);
  for(let i=0;i<30;i++){const x=ri(W*.55,W),y=ri(H*.66,H);R(c,x,y,1,1,['#ffadbd','#fff3a0','#c9b9e8'][i%3])}
  for(const r of[[W*.4,H*.44],[W*.58,H*.42],[W*.78,H*.95]]){oval(c,r[0],r[1],4,3,'#9a9a9a');oval(c,r[0]-1,r[1]-1,2,1,'#c0c0c0')}
  // flowers along the path
  for(let y=py+2;y<H*.6;y+=5){R(c,px-9,y,2,2,'#f48fb8');R(c,px+8,y+2,2,2,'#fff3a0')}}

function homeStatic(c){R1=rng(3);
  R(c,0,0,W,H,'#4a2e26');R(c,4,4,W-8,H-8,'#5e3a2e');
  const wallH=H*.34;R(c,8,8,W-16,wallH,'#f4e2cc');for(let x=12;x<W-8;x+=10)R(c,x,8,1,wallH,'#ead4b8');R(c,8,8+wallH-3,W-16,3,'#96745B');
  for(let i=0;i<4;i++){const ax=W*(.16+i*.22);R(c,ax-10,16,20,wallH-18,'#7a5040');R(c,ax-8,20,16,wallH-24,'#b8d9e8');oval(c,ax,20,8,5,'#b8d9e8');R(c,ax-1,16,1,wallH-20,'#7a5040');R(c,ax-11,15,6,wallH-16,'#f4bfa7');R(c,ax+5,15,6,wallH-16,'#f4bfa7')}
  // herringbone floor
  const fy=8+wallH;for(let y=fy;y<H-8;y+=4)for(let x=8;x<W-8;x+=8){const o=((y-fy)/4)%2*4;R(c,x+o,y,7,3,((x+y)/4)%3<1?'#8a5a3e':'#9e6a48');R(c,x+o,y+3,7,1,'#6e4430')}
  oval(c,W*.3,H*.68,W*.14,H*.12,'#5f8f6a');oval(c,W*.3,H*.68,W*.11,H*.09,'#7aa884');oval(c,W*.3,H*.68,W*.06,H*.05,'#e8b6c5');
  oval(c,W*.72,H*.8,W*.12,H*.1,'#c9b9e8');oval(c,W*.72,H*.8,W*.09,H*.07,'#e0d6f4');
  // bed
  R(c,W*.06,fy+4,W*.16,H*.3,'#7a4a36');R(c,W*.06+2,fy+6,W*.16-4,H*.3-4,'#a8c3a0');for(let y=fy+14;y<fy+H*.3;y+=4)R(c,W*.06+2,y,W*.16-4,1,'#8fae88');R(c,W*.08,fy+7,W*.12,6,'#fff5e9');
  // table + chairs
  oval(c,W*.72,H*.62,14,8,'#8a5a3e');oval(c,W*.72,H*.61,13,7,'#fff5e9');R(c,W*.72-2,H*.6,4,3,'#e86a8a');for(const d of[-20,20])R(c,W*.72+d-3,H*.6,6,8,'#a8c3a0');
  // bookshelf + stove + sofa
  R(c,W*.4,fy-14,22,26,'#6e4430');for(let i=0;i<3;i++){R(c,W*.4+2,fy-12+i*8,18,6,'#4a2e26');for(let j=0;j<6;j++)R(c,W*.4+3+j*3,fy-11+i*8,2,5,['#e86a8a','#a8c3a0','#c9b9e8','#f4bfa7','#b8d9e8','#fff3a0'][(i+j)%6])}
  R(c,W*.88,fy-16,14,26,'#3a3a44');R(c,W*.88+2,fy-6,10,8,'#2a2a30');R(c,W*.88+4,fy-4,6,4,'#ff9a4a');R(c,W*.88+5,fy-26,4,10,'#3a3a44');L.stove=[W*.88+7,fy-2];
  R(c,W*.42,H*.86,W*.2,10,'#e8c060');R(c,W*.42,H*.86-4,W*.2,5,'#d0a848');
  for(const p of[[W*.36,fy+2],[W*.62,fy+2],[W*.94,H*.82],[W*.04,H*.86]]){R(c,p[0]-3,p[1]+4,6,5,'#c9764e');cluster(c,p[0],p[1],4,3,'#3f6a35','#5f8f3f','#8fbf55')}
  L.lamps=[[W*.25,fy+2],[W*.56,H*.84]];for(const l of L.lamps){R(c,l[0]-1,l[1],2,8,'#96745B');R(c,l[0]-3,l[1]-4,6,4,'#ffe7a0')}}

function gladeStatic(c){R1=rng(9);
  R(c,0,0,W,H,'#5fcf6a');for(let i=0;i<500;i++)R(c,ri(0,W),ri(0,H),1,ri(1,2),R1()<.5?'#4fb85c':'#7fe07f');
  for(let i=0;i<14;i++){const x=W*.2+i*W*.045,y=H*.8+Math.sin(i*.9)*8;oval(c,x,y,6,3,'#e8dcc0');oval(c,x-1,y-1,4,2,'#f6ecd6')}
  const tx=W*.5,ty=H*.3;L.crystal=[tx,ty];
  oval(c,tx,H*.62,W*.12,H*.08,'#3fa0b8');oval(c,tx,H*.61,W*.11,H*.07,'#7fe0f0');oval(c,tx-6,H*.6,W*.05,H*.03,'#c8f6ff');
  bez(c,[tx-4,H*.62],[tx-14,H*.4],[tx,ty],6,4,'#5a4a98');bez(c,[tx+4,H*.62],[tx+14,H*.42],[tx,ty],5,3,'#7a6ac8');bez(c,[tx,H*.55],[tx+2,H*.4],[tx-2,ty+4],2,1,'#a898e8');
  for(const d of[-1,1])bez(c,[tx,ty+4],[tx+d*24,ty-20],[tx+d*44,ty-8],3,1,'#6a5aa8');
  for(let i=0;i<18;i++){const a=R1()*6.28,d=R1()*34;cluster(c,tx+Math.cos(a)*d*1.3,ty-10+Math.sin(a)*d*.6,6,2,'#7a6ac8',i%2?'#b8a8f0':'#9fe6f6',i%2?'#e6deff':'#e0fbff')}
  L.shrooms=[];for(let i=0;i<14;i++){const x=ri(10,W-10),y=ri(H*.45,H-8);if(Math.abs(x-tx)<30&&y<H*.7)continue;R(c,x,y,2,4,'#e6f4ff');oval(c,x+1,y-1,4,2,R1()<.5?'#5fd8f0':'#7a9af0');L.shrooms.push([x+1,y-1])}
  for(let i=0;i<10;i++){const x=ri(0,W),y=ri(H*.4,H);R(c,x,y-4,2,5,'#b8a8f0');R(c,x+1,y-6,1,2,'#e6deff')}
  for(let i=0;i<40;i++)R(c,ri(0,W),ri(H*.45,H),1,1,['#fff','#ffd0e6','#fff3a0'][i%3])}

const SCENES={forest:forestStatic,farm:farmStatic,home:homeStatic,glade:gladeStatic};

/* ---------- animated layer ---------- */
let flies=[];
function animate(){const c=ctx,S=window.SH&&SH.S,X=S&&S.x;c.drawImage(bg,0,0);
  const comps=X?Object.keys(X.comp||{}).filter(k=>CREATURE[k]):[];const hat=X&&X.player?X.player.hat:'#e98aa4';
  if(scene==='forest'){
    for(const l of L.lanterns){const sw=Math.sin(t*.12+l[0])*1.2,x=l[0]+sw,y=l[1]+l[2];R(c,l[0],l[1],1,l[2],'#4a3228');glow(c,x+1,y+2,9,'rgba(255,214,110,1)',.35+.12*Math.sin(t*.4+l[0]));R(c,x-1,y-1,5,1,'#6a4a2a');R(c,x-1,y,5,5,'#8a5a2a');R(c,x,y+1,3,3,'#ffd96a');R(c,x,y+5,3,1,'#6a4a2a')}
    glow(c,L.win[0],L.win[1],16,'rgba(255,200,100,1)',.35);glow(c,L.doorGlow[0],L.doorGlow[1],18,'rgba(255,170,80,1)',.35);glow(c,L.twin[0],L.twin[1],12,'rgba(255,200,100,1)',.3);
    for(const m of L.shrooms)glow(c,m[0],m[1],6,'rgba(140,230,255,1)',.3+.1*Math.sin(t*.3+m[0]));
    const wx=W*.46+Math.sin(t*.05)*W*.08,wy=H*.86;player(c,wx,wy-14,Math.floor(t/3),hat);comps.slice(0,3).forEach((k,i)=>creature(c,k,wx-14-i*14,wy-2+(i%2)*3,Math.round(Math.sin(t*.3+i)*1.2),(X.comp[k].skin)||0));
    creature(c,'fluffkin',W*.3,H*.78,Math.round(Math.sin(t*.25)),0)}
  if(scene==='farm'){
    const [fx,fy,fw,fh]=L.field,pw=fw/4,ph=fh/4;for(let i=0;i<16;i++){const x=fx+(i%4)*pw+2,y=fy+Math.floor(i/4)*ph+2;R(c,x,y,pw-4,ph-4,'#b8885a')}(S?S.plots:[]).forEach((p,i)=>{if(!p)return;const x=fx+(i%4)*pw+pw/2,y=fy+Math.floor(i/4)*ph+ph/2,cr=SH.CROPS[p.k],pr=Math.min(1,p.g/cr.time);
      if(p.w>0)oval(c,x,y+2,pw*.35,ph*.25,'#a87a4e');
      if(pr<.2){R(c,x-2,y,1,1,'#f3d9a4');R(c,x+1,y+1,1,1,'#f3d9a4')}else if(pr<.6){R(c,x,y-2,1,3,cr.l);R(c,x-2,y-2,2,1,cr.l);R(c,x+1,y-3,2,1,cr.l)}
      else{const r=pr<1?3:4;R(c,x,y-4,1,3,cr.l);R(c,x-2,y-4,2,1,cr.l);R(c,x+1,y-5,2,1,cr.l);disc(c,x,y+1,r,cr.c);R(c,x-1,y,1,1,'rgba(255,255,255,.6)');if(pr>=1){if(p.gold)glow(c,x,y,8,'rgba(255,220,90,1)',.6);if(t%12<6)R(c,x+3,y-5,1,1,'#fff8c0')}}});
    const cx0=Math.min(W*.66,L.door[0]+90),cow=[cx0+Math.sin(t*.02)*20,H*.42],pig=[cx0+40+Math.cos(t*.025)*16,H*.5];
    oval(c,cow[0],cow[1],7,4,'#fff');R(c,cow[0]-3,cow[1]-2,3,3,'#3a3a3a');R(c,cow[0]+2,cow[1],3,2,'#3a3a3a');oval(c,cow[0]+7,cow[1]-2,3,3,'#fff');R(c,cow[0]+8,cow[1]-1,3,2,'#f4bfa7');for(const d of[-5,-2,3,5])R(c,cow[0]+d,cow[1]+3,1,3,'#3a3a3a');
    oval(c,pig[0],pig[1],5,3,'#f6b8c8');oval(c,pig[0]-5,pig[1]-1,3,3,'#f6b8c8');R(c,pig[0]-7,pig[1]-1,2,2,'#e890a8');for(const d of[-3,2])R(c,pig[0]+d,pig[1]+3,1,2,'#d88098');
    const d=L.door,wx=d[0]+Math.sin(t*.04)*30,wy=d[1]+8;player(c,wx,wy,Math.floor(t/3),hat);comps.slice(0,2).forEach((k,i)=>creature(c,k,wx+12+i*12,wy+8,Math.round(Math.sin(t*.3+i)),(X.comp[k].skin)||0));
    for(let i=0;i<3;i++){const bx=W*(.6+i*.12)+Math.sin(t*.07+i)*10,by=H*(.7+i*.06)+Math.cos(t*.09+i)*5;R(c,bx,by,1,1,'#3a2a2a');R(c,bx-1+(t%4<2?0:1),by-1,1,1,['#fff','#ffd0e6','#c9b9e8'][i]);R(c,bx+1-(t%4<2?0:1),by-1,1,1,['#fff','#ffd0e6','#c9b9e8'][i])}}
  if(scene==='home'){glow(c,L.stove[0],L.stove[1],14,'rgba(255,150,70,1)',.3+.1*Math.sin(t*.5));for(const l of L.lamps)glow(c,l[0],l[1]-2,14,'rgba(255,230,150,1)',.35);
    const x=W*.5+Math.sin(t*.03)*W*.08,y=H*.6;player(c,x,y,Math.floor(t/3),hat);comps.forEach((k,i)=>creature(c,k,W*(.18+i*.13),H*.9-((i%2)*6),Math.round(Math.sin(t*.25+i)),(X.comp[k].skin)||0))}
  if(scene==='glade'){const [tx]=L.crystal;glow(c,tx,H*.6,30,'rgba(140,240,255,1)',.25+.08*Math.sin(t*.2));for(const m of L.shrooms)glow(c,m[0],m[1],7,'rgba(120,220,255,1)',.35+.1*Math.sin(t*.3+m[0]));
    if(!comps.length)creature(c,'fluffkin',W*.36,H*.82,Math.round(Math.sin(t*.25)),0);
    comps.forEach((k,i)=>{const n=comps.length,x=W*.5+(i-(n-1)/2)*Math.min(30,W*.8/n),y=H*.82+((i%2)*6);creature(c,k,x,y,Math.round(Math.sin(t*.25+i*1.3)*1.5),(X.comp[k].skin)||0)})}
  // fireflies everywhere except indoors
  if(scene!=='home'){for(const f of flies){f.x+=Math.cos(f.a)*.4;f.y+=Math.sin(f.a)*.25;f.a+=(Math.random()-.5)*.4;if(f.x<0)f.x=W;if(f.x>W)f.x=0;if(f.y<H*.2)f.y=H*.9;if(f.y>H)f.y=H*.3;const on=Math.sin(t*.2+f.p)>0;if(on){glow(c,f.x,f.y,4,'rgba(255,245,160,1)',scene==='forest'?.7:.4);R(c,f.x,f.y,1,1,'#fffbd0')}}}
  if(season()==='winter'&&scene!=='home'){c.globalAlpha=.8;for(let i=0;i<40;i++){R(c,(i*37+t*.6*(1+i%3))%W,(i*53+t*(.8+i%2))%H,1,1,'#fff')}c.globalAlpha=1}
  if(season()==='spring'&&scene!=='home'){for(let i=0;i<10;i++)R(c,(i*61+t*.7)%W,(i*29+t*.5)%H,2,1,'#ffc6d8')}
  if(season()==='autumn'&&scene!=='home'){for(let i=0;i<10;i++)R(c,(i*61+t*.6)%W,(i*29+t*.6)%H,2,2,i%2?'#e9944a':'#c9662e')}}

/* ---------- lifecycle ---------- */
function rebuild(){const box=cv.parentElement,r=box.getBoundingClientRect();if(!r.width||!r.height)return;
  W=Math.max(180,Math.min(480,Math.round(H*r.width/r.height)));cv.width=W;cv.height=H;bg.width=W;bg.height=H;bgx.imageSmoothingEnabled=false;ctx.imageSmoothingEnabled=false;
  L={};try{SCENES[scene](bgx)}catch(e){console.error('scene',e)}
  flies=Array.from({length:scene==='forest'?22:10},(_,i)=>({x:Math.random()*W,y:H*(.3+Math.random()*.6),a:Math.random()*6,p:i}))}
function frame(now){raf=requestAnimationFrame(frame);if(document.hidden)return;if(now-last<83)return;last=now;
  const paused=window.SHX&&SHX.paused&&SHX.paused();if(!paused)t++;
  const k=scene+'|'+season()+'|'+cv.parentElement.clientWidth+'x'+cv.parentElement.clientHeight;if(k!==key){key=k;rebuild()}
  try{animate()}catch(e){console.error('pixel',e)}}
function setScene(s){if(!SCENES[s])s='farm';if(s===scene)return;scene=s;key=''}
function mount(box){if(!box||cv)return;cv=document.createElement('canvas');cv.className='pixel';cv.setAttribute('aria-hidden','true');box.prepend(cv);ctx=cv.getContext('2d');bg=document.createElement('canvas');bgx=bg.getContext('2d');box.classList.add('pixelated');raf=requestAnimationFrame(frame)}
window.SHPix={mount,setScene,spriteURL,creatures:Object.keys(CREATURE)};
})();
