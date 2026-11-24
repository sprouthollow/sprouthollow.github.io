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
function meadow(){seed=21;return `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">${DEFS}
<linearGradient id="msk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb8ee"/><stop offset=".55" stop-color="#f6d6e6"/><stop offset="1" stop-color="#fff1e2"/></linearGradient>
<rect width="800" height="300" fill="url(#msk)"/>
<circle cx="640" cy="70" r="34" fill="#fff6d6" opacity=".9"/><circle cx="640" cy="70" r="60" fill="url(#lg)" class="flick"/>
<g class="cloud" filter="url(#wcx)"><ellipse cx="200" cy="60" rx="70" ry="20" fill="#fff" opacity=".9"/><ellipse cx="236" cy="48" rx="38" ry="18" fill="#fff" opacity=".9"/></g>
<path d="M0 170 Q160 120 330 160 T640 150 T800 160 V300 H0z" fill="#b9d8a6" filter="url(#wcx)"/>
<path d="M0 210 Q200 180 420 205 T800 200 V300 H0z" fill="#a3cc8e"/>
${Array.from({length:220},()=>{const x=ri(0,800)|0,y=ri(175,298)|0,c=['#f6a6c4','#fff3a0','#c9b9e8','#ffffff','#b8d9e8','#f4bfa7'][Math.floor(r()*6)];return `<path d="M${x} ${y} v-${ri(4,10)|0}" stroke="#7fae6a" stroke-width="1.5"/><circle cx="${x}" cy="${y-ri(5,11)|0}" r="${ri(2,4)}" fill="${c}"/>`}).join('')}
<g filter="url(#wcx)"><path d="M120 300 C130 240 118 190 140 150 L160 150 C150 190 160 240 172 300z" fill="url(#trunk)"/>${blossoms(150,120,50,12,false)}${blossoms(150,110,40,8,true)}</g>
<g><ellipse cx="190" cy="165" rx="14" ry="18" fill="#f2c45a" stroke="#a8743a" stroke-width="2"/><path d="M178 158h24M177 166h26M179 174h22" stroke="#d29a3a" stroke-width="2"/><ellipse cx="190" cy="178" rx="4" ry="3" fill="#6b4a2a"/></g>
<g filter="url(#wcx)"><path d="M560 230 L560 180 Q600 150 640 180 L640 230" fill="#fff5e9" stroke="#c9b9e8" stroke-width="4"/><path d="M548 184 Q600 132 652 184z" fill="#e8b6c5"/>${blossoms(600,150,30,6,true)}</g>
<path d="M330 300 C360 260 420 250 470 236 C520 224 560 230 600 232" stroke="#f6e2cc" stroke-width="18" fill="none" stroke-linecap="round" filter="url(#wcx)"/>
${Array.from({length:7},(_,i)=>`<g class="bfly" style="animation-delay:${(i*1.3).toFixed(1)}s;--bx:${ri(-60,60)|0}px;--by:${ri(-30,10)|0}px"><g transform="translate(${ri(220,760)|0} ${ri(110,230)|0})"><ellipse cx="-4" cy="0" rx="5" ry="7" fill="${['#f6a6c4','#b8d9e8','#fff3a0','#c9b9e8'][i%4]}" class="wing"/><ellipse cx="4" cy="0" rx="5" ry="7" fill="${['#f6a6c4','#b8d9e8','#fff3a0','#c9b9e8'][i%4]}" class="wing"/><rect x="-1" y="-5" width="2" height="10" rx="1" fill="#6b5048"/></g></g>`).join('')}
<g class="ffwrap">${flies(12)}</g></svg>`}
function tree(cx,cy,r,pal){let o=`<ellipse cx="${cx}" cy="${cy+r*1.05}" rx="${r*1.1}" ry="${r*.22}" fill="#3e5a3a" opacity=".25"/><path d="M${cx-r*.12} ${cy+r} q${r*.05} -${r*.6} -${r*.02} -${r*.9} l${r*.3} 0 q-${r*.06} ${r*.4} ${r*.04} ${r*.9}z" fill="#6b4440"/>`;
  const L=[[pal[0],0,.18,1],[pal[1],-.08,0,.82],[pal[2],-.2,-.18,.55]];for(const [c,dx,dy,k] of L){for(let i=0;i<7;i++){const a=i/7*6.28+dx*3,d=r*.5*k;o+=`<circle cx="${(cx+Math.cos(a)*d+dx*r)|0}" cy="${(cy-r*.3+Math.sin(a)*d*.75+dy*r)|0}" r="${(r*.42*k+3)|0}" fill="${c}"/>`}}return o}
function village(){seed=33;const g=['#5f8f4f','#7fae5e','#a6cf7a'],pk=['#d9779c','#f4a3c2','#ffd0e2'];return `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">${DEFS}
<linearGradient id="vsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec3e6"/><stop offset=".55" stop-color="#d8edf3"/><stop offset="1" stop-color="#fff0d8"/></linearGradient>
<linearGradient id="vh1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d79f"/><stop offset="1" stop-color="#8fbf78"/></linearGradient>
<linearGradient id="vh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bcb7e"/><stop offset="1" stop-color="#6fa85e"/></linearGradient>
<linearGradient id="thatch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79a62"/><stop offset="1" stop-color="#9a6e42"/></linearGradient>
<linearGradient id="wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3df"/><stop offset="1" stop-color="#ead6b8"/></linearGradient>
<rect width="800" height="300" fill="url(#vsk)"/>
<circle cx="660" cy="62" r="34" fill="#fff8de"/><circle cx="660" cy="62" r="90" fill="url(#lg)" opacity=".7"/>
<g class="cloud" filter="url(#wcx)"><ellipse cx="170" cy="62" rx="74" ry="22" fill="#fff"/><ellipse cx="205" cy="46" rx="44" ry="24" fill="#fff"/><ellipse cx="170" cy="74" rx="70" ry="10" fill="#e3ecf6"/></g>
<g class="cloud b" filter="url(#wcx)" opacity=".9"><ellipse cx="470" cy="44" rx="58" ry="17" fill="#fff"/><ellipse cx="490" cy="34" rx="30" ry="15" fill="#fff"/><ellipse cx="470" cy="54" rx="54" ry="8" fill="#e3ecf6"/></g>
<path d="M0 150 L70 104 L130 132 L210 90 L300 136 L380 100 L470 140 L560 96 L650 132 L740 98 L800 124 V200 H0z" fill="#b9c6e0" opacity=".85" filter="url(#wcx)"/>
<path d="M0 150 L70 104 L90 116 M210 90 L232 104 M380 100 L400 112 M560 96 L582 110 M740 98 L760 110" stroke="#e9eef8" stroke-width="5" fill="none" opacity=".8"/>
<path d="M0 176 Q120 136 260 162 T540 152 T800 160 V300 H0z" fill="url(#vh1)" filter="url(#wcx)"/>
<g transform="translate(712 118)"><path d="M-6 50 L-3 0 L3 0 L6 50z" fill="#efe2cc" stroke="#a8957f" stroke-width="1.5"/><path d="M-7 2 L0 -8 L7 2z" fill="#c4614a"/><g class="spin" style="transform-origin:0px 0px"><path d="M0 0 L0 -30 L6 -30 L4 0z M0 0 L30 0 L30 6 L0 4z M0 0 L0 30 L-6 30 L-4 0z M0 0 L-30 0 L-30 -6 L0 -4z" fill="#fff8ee" stroke="#a8957f" stroke-width="1"/></g><circle r="2.5" fill="#6b4440"/></g>
${[[400,150,'#f4bfa7'],[440,146,'#c9b9e8'],[480,152,'#b8d9e8'],[520,148,'#f4bfa7']].map(([x,y,c])=>`<rect x="${x-10}" y="${y}" width="20" height="14" fill="#fff5e9"/><path d="M${x-13} ${y} L${x} ${y-11} L${x+13} ${y}z" fill="${c}"/><rect x="${x-3}" y="${y+5}" width="5" height="5" fill="#ffd98a"/>`).join('')}
<path d="M0 210 Q180 178 380 198 T800 192 V300 H0z" fill="url(#vh2)"/>
${tree(640,168,46,g)}${tree(760,180,30,g)}${tree(66,182,40,pk)}${tree(342,184,22,g)}
<path d="M226 218 C230 246 300 256 400 262 C520 270 640 262 800 270 L800 300 L120 300 C170 276 214 252 210 218z" fill="#f4dcae" filter="url(#wcx)"/>
<path d="M226 218 C232 246 300 254 400 260" stroke="#fff1d0" stroke-width="3" fill="none" opacity=".8"/>
<g filter="url(#wcx)">
<rect x="136" y="164" width="164" height="56" fill="url(#wall)"/>
<rect x="136" y="206" width="164" height="16" fill="#b7aa98"/>${Array.from({length:10},(_,i)=>`<rect x="${138+i*16}" y="${208+(i%2)*4}" width="13" height="5" rx="2" fill="#cfc4b4"/>`).join('')}
<path d="M120 170 L218 104 L316 170z" fill="url(#thatch)"/><path d="M120 170 L218 104 L316 170" stroke="#7a5432" stroke-width="4" fill="none"/>
${Array.from({length:22},(_,i)=>`<path d="M${132+i*8.5} ${168-Math.max(0,(i<11?i:21-i))*5.8} v10" stroke="#a87a4a" stroke-width="2" opacity=".7"/>`).join('')}
<rect x="262" y="112" width="18" height="38" fill="#a89a8c"/><rect x="259" y="108" width="24" height="7" fill="#8f8378"/>
</g>
<g class="smoke">${[0,1,2].map(i=>`<circle cx="271" cy="${98-i*14}" r="${7+i*3}" fill="#fff" opacity="${.6-i*.15}" style="animation-delay:${i*.8}s"/>`).join('')}</g>
<rect x="212" y="182" width="26" height="38" rx="12" fill="#6b4440"/><rect x="215" y="185" width="20" height="35" rx="10" fill="#e98aa4"/><circle cx="231" cy="204" r="1.8" fill="#ffd98a"/>
${[[156,180],[260,180]].map(([x,y])=>`<rect x="${x-14}" y="${y-12}" width="28" height="22" rx="4" fill="#6b4440"/><rect x="${x-11}" y="${y-9}" width="22" height="16" rx="3" fill="#ffe7a8"/><path d="M${x} ${y-9}v16M${x-11} ${y-1}h22" stroke="#c98a3a" stroke-width="1.5"/><circle cx="${x}" cy="${y-1}" r="22" fill="url(#lg)" opacity=".5"/><rect x="${x-16}" y="${y+10}" width="32" height="6" rx="2" fill="#96745B"/>${[-10,-3,4,11].map((d,i)=>`<circle cx="${x+d}" cy="${y+9}" r="3.5" fill="${['#f48fb8','#fff3a0','#c9b9e8','#f48fb8'][i]}"/>`).join('')}`).join('')}
${Array.from({length:16},(_,i)=>`<circle cx="${140+i*10}" cy="${226+(i%2)*3}" r="4" fill="${['#f48fb8','#fff3a0','#c9b9e8','#ffffff'][i%4]}"/><path d="M${140+i*10} ${230} v6" stroke="#5f8f4f" stroke-width="2"/>`).join('')}
${Array.from({length:14},(_,i)=>`<rect x="${312+i*18}" y="216" width="4" height="20" rx="2" fill="#96745B"/>`).join('')}<path d="M312 222 H568 M312 230 H568" stroke="#b08a6a" stroke-width="3"/>
<g transform="translate(420 214)"><ellipse cx="0" cy="12" rx="22" ry="6" fill="#3e5a3a" opacity=".25"/><rect x="-16" y="-4" width="32" height="16" rx="4" fill="#b9b0a4"/>${[-12,-4,4].map(d=>`<rect x="${d}" y="-2" width="7" height="5" rx="2" fill="#d4ccc0"/>`).join('')}<ellipse cx="0" cy="-4" rx="16" ry="4" fill="#5f9fc0"/><path d="M-18 -6 V-30 M18 -6 V-30" stroke="#8a5e3e" stroke-width="4"/><path d="M-24 -28 L0 -44 L24 -28z" fill="#c4614a"/></g>
<g transform="translate(300 222)"><rect x="-2" y="-4" width="4" height="18" fill="#8a5e3e"/><rect x="-10" y="-16" width="20" height="13" rx="6" fill="#e98aa4" stroke="#6b4440" stroke-width="1.5"/><rect x="6" y="-22" width="2.5" height="9" fill="#e06a6a"/></g>
<g transform="translate(520 206)"><rect x="-2" y="-14" width="4" height="30" fill="#5a4a5a"/><rect x="-7" y="-24" width="14" height="12" rx="3" fill="#fff3b0" stroke="#5a4a5a" stroke-width="2"/><circle cy="-18" r="20" fill="url(#lg)" class="flick"/></g>
<g transform="translate(700 262)"><ellipse rx="56" ry="15" fill="#5fa8c8"/><ellipse rx="52" ry="12" fill="#8fd0e8"/><ellipse cx="-16" cy="-3" rx="16" ry="3" fill="#e6f7ff" opacity=".8"/>${[[-30,2],[20,-2],[34,4]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="#7fbf7a"/><circle cx="${x+3}" cy="${y-1}" r="2" fill="#f9bcd3"/>`).join('')}</g>
${Array.from({length:120},()=>{const x=ri(0,800)|0,y=ri(236,298)|0;return `<path d="M${x} ${y} q1 -6 3 -9" stroke="${['#5f8f4f','#7fae5e'][Math.floor(r()*2)]}" stroke-width="1.5" fill="none"/>`}).join('')}
${Array.from({length:4},(_,i)=>`<g class="bfly" style="animation-delay:${i*1.7}s;--bx:${(i%2?-50:50)}px;--by:-20px"><g transform="translate(${360+i*90} ${200+(i%2)*20})"><ellipse cx="-3" cy="0" rx="4" ry="5" fill="${['#f6a6c4','#fff3a0','#b8d9e8','#c9b9e8'][i]}" class="wing"/><ellipse cx="3" cy="0" rx="4" ry="5" fill="${['#f6a6c4','#fff3a0','#b8d9e8','#c9b9e8'][i]}" class="wing"/></g></g>`).join('')}
<g class="ffwrap">${flies(6)}</g></svg>`}
const SC={forest,creek,meadow,village};const cache={};
let GRAIN='';function grain(){if(GRAIN)return GRAIN;try{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),d=x.createImageData(96,96);for(let i=0;i<d.data.length;i+=4){const v=120+Math.random()*100;d.data[i]=v;d.data[i+1]=v*.92;d.data[i+2]=v*.8;d.data[i+3]=Math.random()*26}x.putImageData(d,0,0);GRAIN=c.toDataURL()}catch(e){}return GRAIN}
function finish(svg){const vb=(svg.match(/viewBox="0 0 (\d+) (\d+)"/)||[0,800,300]);const W=vb[1],H=vb[2];const g=grain();
  const layer=`<defs><radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2a40" stop-opacity=".28"/></radialGradient><linearGradient id="ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8de" stop-opacity=".35"/><stop offset="1" stop-color="#fff8de" stop-opacity="0"/></linearGradient>${g?`<pattern id="grn" width="96" height="96" patternUnits="userSpaceOnUse"><image href="${g}" width="96" height="96"/></pattern>`:''}</defs>
  <g pointer-events="none" class="paint"><path d="M${W*.8} 0 L${W*.98} 0 L${W*.55} ${H} L${W*.38} ${H}z" fill="url(#ray)" class="rays"/><path d="M${W*.66} 0 L${W*.72} 0 L${W*.3} ${H} L${W*.24} ${H}z" fill="url(#ray)" class="rays" style="animation-delay:2s"/>${g?`<rect width="${W}" height="${H}" fill="url(#grn)" style="mix-blend-mode:multiply"/>`:''}<rect width="${W}" height="${H}" fill="url(#vig)"/></g>`;
  return svg.replace(/<\/svg>$/,layer+'</svg>')}
function set(name){const sc=document.querySelector('.scene');if(!sc)return;if(!sc._orig){const sv=sc.querySelector('svg');sc._orig=sv?sv.outerHTML:''}
  if(sc.dataset.paint===name)return;sc.dataset.paint=name;const key=name==='country'?'village':name;const html=cache[key]||(cache[key]=finish(SC[key]()));
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
 bumble:()=>`<ellipse cx="34" cy="34" rx="14" ry="10" fill="#e6f4ff" opacity=".9" ${OL}/><ellipse cx="66" cy="34" rx="14" ry="10" fill="#e6f4ff" opacity=".9" ${OL}/><ellipse cx="50" cy="58" rx="26" ry="23" fill="#ffd96a" ${OL}/><path d="M28 52 q22 6 44 0 M27 66 q23 6 46 0" stroke="#6b5048" stroke-width="5" fill="none" opacity=".75"/><path d="M42 36 q-3 -10 -8 -12 M58 36 q3 -10 8 -12" stroke="#6b5048" stroke-width="2" fill="none"/><circle cx="34" cy="23" r="3" fill="#6b5048"/><circle cx="66" cy="23" r="3" fill="#6b5048"/>${face(50,54,.85)}`,
 emberkin:()=>`<path d="M74 70 q18 2 16 -14 q-6 6 -14 4" fill="#f6b89a" ${OL}/><path d="M88 56 l5 -6 l1 8z" fill="#ffcf6a"/><path d="M22 46 q-14 -14 -4 -26 q8 12 16 14z M78 46 q14 -14 4 -26 q-8 12 -16 14z" fill="#d8cdf2" ${OL}/><path d="M40 26 l-3 -10 l8 6z M60 26 l3 -10 l-8 6z" fill="#fff4e4" ${OL}/><ellipse cx="50" cy="58" rx="27" ry="25" fill="#f6b89a" ${OL}/><ellipse cx="50" cy="68" rx="16" ry="12" fill="#ffe6d8"/>${face(50,56,.95)}`};
const SKIN=[()=>'',()=>`<path d="M44 20 q-10 -8 -12 2 q4 6 12 -2z M56 20 q10 -8 12 2 q-4 6 -12 -2z" fill="#f48fb8" ${OL}/><circle cx="50" cy="20" r="4" fill="#f48fb8" ${OL}/>`,()=>`<g fill="#fff3a0">${[[20,20],[82,26],[16,74],[86,80]].map(([x,y])=>`<path d="M${x} ${y-6}l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8z"/>`).join('')}</g>`];
function creature(k,skin){const f=CR[k];if(!f)return'';return `<svg viewBox="0 0 100 100" class="cre"><defs><radialGradient id="lumig"><stop offset="0" stop-color="#fff6b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></radialGradient></defs><ellipse cx="50" cy="92" rx="24" ry="5" fill="#0002"/><g class="bob">${f()}<ellipse cx="40" cy="46" rx="11" ry="6" fill="#fff" opacity=".45" transform="rotate(-20 40 46)"/><ellipse cx="36" cy="43" rx="3.5" ry="2" fill="#fff" opacity=".8"/><path d="M28 74 q22 12 44 0" stroke="#6b4440" stroke-width="5" fill="none" opacity=".1" stroke-linecap="round"/>${(SKIN[skin||0]||SKIN[0])()}</g></svg>`}
window.SHScenes={set,creature,list:Object.keys(CR)};
})();
