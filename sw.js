// RF Cascade Simulator service worker: works offline, picks up new versions on the next launch.
const CACHE='rf-cascade-v6.3.1';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  // the page itself: network first so updates arrive, cache as offline fallback
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{   // always revalidate the page with GitHub
const c=r.clone();caches.open(CACHE).then(k=>k.put('index.html',c));return r;})
      .catch(()=>caches.match('index.html')));return;}
  // everything else (icons, Google Fonts): cache first, fill the cache on first use
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
    if(r.ok&&(url.origin===location.origin||url.hostname.endsWith('gstatic.com')||url.hostname.endsWith('googleapis.com'))){
      const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}
    return r;})));
});
