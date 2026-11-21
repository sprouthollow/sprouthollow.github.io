/* Sprout Hollow painted scenes — soft watercolor SVG art (the original storybook look).
   Scenes swap per tab inside .scene; companions are round, blushing, hand-drawn style. */
(function(){
'use strict';
let seed=1;const r=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};const ri=(a,b)=>a+r()*(b-a);
const DEFS=`<defs>
<filter id="wcx"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
<filter id="soft"><feGaussianBlur stdDeviation="3"/></filter><filter id="softer"><feGaussianBlur stdDeviation="8"/></filter>
<radialGradient id="lg"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<radialGradient id="cg"><stop offset="0" stop-color="#e8fbff" stop-opacity=".9"/><stop offset="1" stop-color="#9fe6f6" stop-opacity="0"/></radialGradient>
<linearGradient id="trunk" x1="0" x2="1"><stop offset="0" stop-color="#6b4440"/><stop offset=".55" stop-color="#8c5c52"/><stop offset="1" stop-color="#5e3a38"/></linearGradient>
</defs>`;
const blossoms=(cx,cy,rad,n,pink)=>{let s='';for(let i=0;i<n;i++){const a=r()*6.28,d=r()*rad,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.65,rr=ri(9,18);
  const c=pink?['#f6a6c4','#f9bcd3','#ef8fb4'][i%3]:['#7fae6a','#93c27a','#6e9e5e'][i%3];s+=`<circle cx="${x|0}" cy="${y|0}" r="${rr|0}" fill="${c}"/><circle cx="${(x-rr/3)|0}" cy="${(y-rr/3)|0}" r="${(rr/2.6)|0}" fill="${pink?'#ffdbe8':'#b6dc96'}" opacity=".8"/>`}return s};
const flies=n=>{let s='';for(let i=0;i<n;i++)s+=`<circle class="ffly" cx="${ri(20,780)|0}" cy="${ri(60,280)|0}" r="${ri(1.6,3)}" fill="#fff6b0" style="animation-delay:${(r()*6).toFixed(1)}s;animation-duration:${(4+r()*4).toFixed(1)}s"/>`;return s};
function forest(){seed=11;let s=`<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">${DEFS}
<linearGradient id="fsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f9de0"/><stop offset=".55" stop-color="#c7cdf2"/><stop offset="1" stop-color="#fbe6ea"/></linearGradient>
<rect width="800" height="300" fill="url(#fsk)"/>
<g filter="url(#softer)" opacity=".7">${Array.from({length:14},(_,i)=>`<ellipse cx="${60+i*55}" cy="${150+(i%3)*12}" rx="${40+(i%4)*10}" ry="${50+(i%3)*12}" fill="${i%2?'#a7b0e2':'#b8bfea'}"/>`).join('')}</g>
<g opacity=".55" filter="url(#soft)">${Array.from({length:9},(_,i)=>`<rect x="${90+i*75}" y="120" width="6" height="110" fill="#9aa2d8"/>`).join('')}</g>
<rect y="196" width="800" height="12" fill="#fff" opacity=".35" filter="url(#soft)"/>
<path d="M0 215 Q200 198 400 210 T800 205 V300 H0z" fill="#8fbf8a" filter="url(#wcx)"/>
<path d="M0 240 Q220 222 420 238 T800 232 V300 H0z" fill="#79ad78"/>
<path d="M600 214 C560 240 470 250 430 300 L330 300 C380 250 520 236 580 214z" fill="#f2c7bf" filter="url(#wcx)"/>
<path d="M596 216 C556 242 476 252 440 300" stroke="#fde2da" stroke-width="5" fill="none" opacity=".8"/>
<g filter="url(#wcx)">
<path d="M70 300 C80 230 70 150 100 60 L130 60 C110 150 130 230 150 300z" fill="url(#trunk)"/>
<path d="M40 300 C70 285 90 280 100 270 M170 300 C150 290 130 282 125 270" stroke="#6b4440" stroke-width="16" fill="none" stroke-linecap="round"/>
<path d="M110 80 C190 -10 330 10 420 50" stroke="#6b4440" stroke-width="24" fill="none" stroke-linecap="round"/>
<path d="M112 120 C170 100 210 110 250 130" stroke="#6b4440" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M720 300 C700 230 720 150 690 50 L660 50 C680 150 660 230 640 300z" fill="url(#trunk)"/>
<path d="M760 300 C730 285 715 280 705 270 M620 300 C640 290 660 282 668 270" stroke="#6b4440" stroke-width="16" fill="none" stroke-linecap="round"/>
<path d="M680 70 C600 -10 470 10 400 52" stroke="#6b4440" stroke-width="24" fill="none" stroke-linecap="round"/>
</g>
<rect x="88" y="160" width="20" height="24" rx="8" fill="#5a3634"/><rect x="91" y="163" width="14" height="18" rx="6" fill="#ffd27a"/><circle cx="98" cy="172" r="26" fill="url(#lg)" class="flick"/>
<g filter="url(#wcx)">${blossoms(160,40,70,16,false)}${blossoms(300,20,80,18,false)}${blossoms(500,24,80,18,false)}${blossoms(650,40,70,16,false)}
${blossoms(220,50,60,12,true)}${blossoms(390,40,60,12,true)}${blossoms(560,46,60,12,true)}${blossoms(110,70,40,8,true)}${blossoms(700,80,40,8,true)}${blossoms(250,120,30,6,true)}</g>`;
const lan=[[180,58,40],[260,38,34],[340,36,48],[430,52,30],[520,40,44],[600,50,36],[120,110,30],[690,96,34]];
s+=lan.map(([x,y,l],i)=>`<g class="sway" style="transform-origin:${x}px ${y}px;animation-delay:${i*.3}s"><path d="M${x} ${y}v${l}" stroke="#6b4440" stroke-width="1.5"/><circle cx="${x}" cy="${y+l+9}" r="22" fill="url(#lg)" class="flick" style="animation-delay:${i*.4}s"/><rect x="${x-6}" y="${y+l}" width="12" height="15" rx="4" fill="#ffd98a" stroke="#a8743a" stroke-width="1.5"/><rect x="${x-4}" y="${y+l-2}" width="8" height="3" rx="1" fill="#8a5a3a"/></g>`).join('');
s+=`<g filter="url(#wcx)"><rect x="520" y="140" width="130" height="76" rx="10" fill="#b0705a"/>${[150,162,174,186,198].map(y=>`<path d="M522 ${y}h126" stroke="#9a5e4c" stroke-width="2"/>`).join('')}
<path d="M500 146 Q585 86 670 146z" fill="#8a72b8"/><path d="M506 146 Q585 96 664 146" stroke="#a892d2" stroke-width="6" fill="none"/></g>
<rect x="540" y="160" width="34" height="28" rx="8" fill="#5a3634"/><rect x="543" y="163" width="28" height="22" rx="6" fill="#ffd27a"/><path d="M557 163v22M543 174h28" stroke="#c98a3a" stroke-width="2"/>
<path d="M596 216v-42a16 16 0 0 1 32 0v42z" fill="#5a3634"/><path d="M599 216v-40a13 13 0 0 1 26 0v40z" fill="#ffb86a"/><circle cx="620" cy="198" r="2" fill="#8a5a2a"/>
<circle cx="557" cy="174" r="46" fill="url(#lg)" class="flick"/><circle cx="612" cy="196" r="44" fill="url(#lg)" class="flick" style="animation-delay:.8s"/>
${[[516,206],[648,206]].map(([x,y])=>`<rect x="${x}" y="${y}" width="14" height="12" rx="3" fill="#d58a64"/>${blossoms(x+7,y-4,8,3,true)}`).join('')}
${[[190,250,'#8fe0f0'],[214,262,'#f6a6c4'],[680,256,'#8fe0f0'],[300,236,'#f6a6c4'],[470,272,'#8fe0f0']].map(([x,y,c])=>`<rect x="${x-2}" y="${y}" width="5" height="10" rx="2" fill="#fff4e4"/><ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="${c}"/><circle cx="${x}" cy="${y}" r="16" fill="url(#cg)" class="flick"/>`).join('')}
${Array.from({length:40},()=>`<circle cx="${ri(0,800)|0}" cy="${ri(222,298)|0}" r="${ri(1.5,3)}" fill="${['#ffd0e6','#fff3a0','#d8cdf2','#fff'][Math.floor(r()*4)]}"/>`).join('')}
<g class="ffwrap">${flies(26)}</g></svg>`;return s}
function creek(){seed=5;return `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">${DEFS}
<linearGradient id="csk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6ee"/><stop offset=".7" stop-color="#e7f3f4"/><stop offset="1" stop-color="#fdeedd"/></linearGradient>
<linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ea"/><stop offset="1" stop-color="#5fb3d6"/></linearGradient>
<rect width="800" height="300" fill="url(#csk)"/>
<g class="cloud" filter="url(#wcx)"><ellipse cx="160" cy="60" rx="70" ry="22" fill="#fff"/><ellipse cx="190" cy="46" rx="40" ry="22" fill="#fff"/></g>
<g class="cloud b" filter="url(#wcx)" opacity=".85"><ellipse cx="520" cy="44" rx="56" ry="16" fill="#fff"/></g>
<path d="M0 150 Q120 90 260 130 T540 120 T800 140 V300 H0z" fill="#b6d6a4" filter="url(#wcx)"/>
<path d="M0 120 L40 40 L120 30 L170 120 L190 300 L0 300z" fill="#a4a8b8" filter="url(#wcx)"/><path d="M50 50 L110 40 L150 110" stroke="#c4c8d6" stroke-width="5" fill="none"/>
<g class="falls"><rect x="96" y="44" width="34" height="160" rx="12" fill="#e6f7ff"/>${[0,1,2,3].map(i=>`<rect x="${100+i*7}" y="44" width="3" height="160" rx="2" fill="#bfe8f8" class="fall" style="animation-delay:${i*.2}s"/>`).join('')}</g>
<ellipse cx="114" cy="206" rx="50" ry="12" fill="#fff" opacity=".7" filter="url(#soft)"/>
<path d="M60 200 C200 190 300 230 420 222 S640 196 800 214 V300 H0 V214z" fill="url(#wat)" filter="url(#wcx)"/>
${Array.from({length:14},(_,i)=>`<path class="shim" d="M${40+i*55} ${230+(i%3)*14}h${20+(i%2)*14}" stroke="#e6f7ff" stroke-width="2.5" stroke-linecap="round" style="animation-delay:${i*.3}s"/>`).join('')}
<path d="M0 262 Q200 250 380 268 T800 262 V300 H0z" fill="#9cc98a"/>
<g filter="url(#wcx)"><path d="M440 214 Q520 160 600 214" stroke="#a87a52" stroke-width="12" fill="none"/>${[450,470,490,510,530,550,570,590].map(x=>`<path d="M${x} ${214-Math.sin((x-440)/160*Math.PI)*52}v20" stroke="#8a5e3e" stroke-width="4"/>`).join('')}<path d="M440 206 Q520 152 600 206" stroke="#c99a6e" stroke-width="3" fill="none"/></g>
${[[280,238],[330,248],[700,236],[740,250]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="16" ry="6" fill="#7fbf7a"/><circle cx="${x+6}" cy="${y-3}" r="4" fill="#f9bcd3"/>`).join('')}
${[[220,190,'#c9b9e8'],[660,182,'#9fe6f6'],[380,196,'#c9b9e8'],[740,176,'#f9bcd3']].map(([x,y,c],i)=>`<circle cx="${x}" cy="${y-10}" r="30" fill="url(#cg)" class="flick" style="animation-delay:${i*.5}s"/><path d="M${x-12} ${y} L${x-6} ${y-30} L${x} ${y} z M${x-2} ${y} L${x+6} ${y-40} L${x+14} ${y} z" fill="${c}" stroke="#fff" stroke-width="1.5"/>`).join('')}
${Array.from({length:12},(_,i)=>`<path d="M${150+i*48} 262 q-3 -20 2 -32" stroke="#6f9a6a" stroke-width="3" fill="none"/>`).join('')}
<g class="ffwrap">${flies(10)}</g></svg>`}
const SC={forest,creek};const cache={};
function set(name){const sc=document.querySelector('.scene');if(!sc)return;if(!sc._orig){const sv=sc.querySelector('svg');sc._orig=sv?sv.outerHTML:''}
  if(sc.dataset.paint===name)return;sc.dataset.paint=name;const html=name==='country'?sc._orig:(cache[name]||(cache[name]=SC[name]()));
  const old=sc.querySelector('svg');if(old)old.remove();sc.insertAdjacentHTML('afterbegin',html)}

/* ---------- companions: round, blushing, storybook style ---------- */
const face=(cx,cy,s=1)=>`<ellipse cx="${cx-7*s}" cy="${cy}" rx="${2.6*s}" ry="${3.2*s}" fill="#3b2a24"/><ellipse cx="${cx+7*s}" cy="${cy}" rx="${2.6*s}" ry="${3.2*s}" fill="#3b2a24"/><circle cx="${cx-6.2*s}" cy="${cy-1.2*s}" r="${.9*s}" fill="#fff"/><circle cx="${cx+7.8*s}" cy="${cy-1.2*s}" r="${.9*s}" fill="#fff"/><path d="M${cx-3*s} ${cy+5*s} q${1.5*s} ${2*s} ${3*s} 0 q${1.5*s} ${2*s} ${3*s} 0" stroke="#3b2a24" stroke-width="${1.5*s}" fill="none" stroke-linecap="round"/><ellipse cx="${cx-13*s}" cy="${cy+5*s}" rx="${4*s}" ry="${2.4*s}" fill="#ffadbd" opacity=".75"/><ellipse cx="${cx+13*s}" cy="${cy+5*s}" rx="${4*s}" ry="${2.4*s}" fill="#ffadbd" opacity=".75"/>`;
const OL='stroke="#6b5048" stroke-width="2"';
const CR={
 fluffkin:()=>`${[[-18,4],[18,4],[0,-16],[-14,-10],[14,-10],[-12,16],[12,16]].map(([x,y])=>`<circle cx="${50+x}" cy="${56+y}" r="11" fill="#fbf8ff" ${OL}/>`).join('')}<circle cx="50" cy="56" r="22" fill="#fbf8ff"/>${face(50,56)}`,
 mossbun:()=>`<ellipse cx="38" cy="24" rx="7" ry="18" fill="#a9cf8e" ${OL}/><ellipse cx="62" cy="24" rx="7" ry="18" fill="#a9cf8e" ${OL}/><ellipse cx="38" cy="26" rx="3" ry="11" fill="#ffd0da"/><ellipse cx="62" cy="26" rx="3" ry="11" fill="#ffd0da"/><ellipse cx="50" cy="60" rx="28" ry="25" fill="#c6e2ac" ${OL}/><path d="M28 52 q6 -10 14 -4 q4 -8 12 -2" fill="#8fbf74"/><circle cx="62" cy="38" r="5" fill="#f9bcd3"/><circle cx="62" cy="38" r="2" fill="#fff3a0"/>${face(50,62,.95)}`,
 pippin:()=>`<path d="M74 70 q22 -4 18 -26 q-10 8 -20 10z" fill="#f4a36a" ${OL}/><path d="M86 46 q6 -2 6 -6 q-8 2 -8 4z" fill="#fff"/><path d="M28 40 L34 14 L48 34z M72 40 L66 14 L52 34z" fill="#f4a36a" ${OL}/><path d="M32 34 L35 20 L42 32z M68 34 L65 20 L58 32z" fill="#fff0e4"/><ellipse cx="50" cy="58" rx="26" ry="24" fill="#f4a36a" ${OL}/><ellipse cx="50" cy="66" rx="16" ry="12" fill="#fff6ee"/><circle cx="50" cy="61" r="2.4" fill="#3b2a24"/>${face(50,56,.95)}`,
 mushling:()=>`<rect x="32" y="52" width="36" height="32" rx="14" fill="#fff4e4" ${OL}/><path d="M18 56 Q50 8 82 56 Q50 64 18 56z" fill="#f08a96" ${OL}/>${[[34,40,5],[52,28,6],[66,44,4],[46,48,3]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff8f0"/>`).join('')}${face(50,68,.8)}`,
 lumi:()=>`<circle cx="50" cy="58" r="38" fill="url(#lumig)"/><ellipse cx="32" cy="40" rx="14" ry="10" fill="#e6f4ff" opacity=".9" ${OL}/><ellipse cx="68" cy="40" rx="14" ry="10" fill="#e6f4ff" opacity=".9" ${OL}/><path d="M42 26 q-4 -10 -10 -12 M58 26 q4 -10 10 -12" stroke="#6b5048" stroke-width="2" fill="none"/><circle cx="32" cy="14" r="3" fill="#fff3a0"/><circle cx="68" cy="14" r="3" fill="#fff3a0"/><ellipse cx="50" cy="56" rx="22" ry="22" fill="#fff0a0" ${OL}/><ellipse cx="50" cy="72" rx="14" ry="8" fill="#fffbe0"/>${face(50,54,.9)}`,
 emberkin:()=>`<path d="M74 70 q18 2 16 -14 q-6 6 -14 4" fill="#f6b89a" ${OL}/><path d="M88 56 l5 -6 l1 8z" fill="#ffcf6a"/><path d="M22 46 q-14 -14 -4 -26 q8 12 16 14z M78 46 q14 -14 4 -26 q-8 12 -16 14z" fill="#d8cdf2" ${OL}/><path d="M40 26 l-3 -10 l8 6z M60 26 l3 -10 l-8 6z" fill="#fff4e4" ${OL}/><ellipse cx="50" cy="58" rx="27" ry="25" fill="#f6b89a" ${OL}/><ellipse cx="50" cy="68" rx="16" ry="12" fill="#ffe6d8"/>${face(50,56,.95)}`};
const SKIN=[()=>'',()=>`<path d="M44 20 q-10 -8 -12 2 q4 6 12 -2z M56 20 q10 -8 12 2 q-4 6 -12 -2z" fill="#f48fb8" ${OL}/><circle cx="50" cy="20" r="4" fill="#f48fb8" ${OL}/>`,()=>`<g fill="#fff3a0">${[[20,20],[82,26],[16,74],[86,80]].map(([x,y])=>`<path d="M${x} ${y-6}l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8z"/>`).join('')}</g>`];
function creature(k,skin){const f=CR[k];if(!f)return'';return `<svg viewBox="0 0 100 100" class="cre"><defs><radialGradient id="lumig"><stop offset="0" stop-color="#fff6b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></radialGradient></defs><ellipse cx="50" cy="92" rx="24" ry="5" fill="#0002"/><g class="bob">${f()}${(SKIN[skin||0]||SKIN[0])()}</g></svg>`}
window.SHScenes={set,creature,list:Object.keys(CR)};
})();
