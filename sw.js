const C='sprout-hollow-v15';
const FILES=['./','index.html','css/style.css','js/core.js','js/features.js','js/entitlements.js','js/scenes.js','art/village.webp','art/forest.webp','art/creek.webp','art/meadow.webp','art/home.webp','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  const page=r.mode==='navigate'||/\.(html|js|css)$/.test(new URL(r.url).pathname);
  if(page&&new URL(r.url).origin===location.origin){ // network first for app code, so updates arrive on next launch
    e.respondWith(fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(n=>{const cp=n.clone();if(n.ok)caches.open(C).then(c=>c.put(r,cp));return n}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{const cp=n.clone();caches.open(C).then(c=>c.put(r,cp));return n})))});
