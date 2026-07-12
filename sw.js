/* ============================================================
   The Amazing Puzzle™ — service worker
   Offline is a promise, not luck: the app shell precaches on
   install, and the optional voice-engine CDN files are cached
   as they're first fetched — so "works offline" stays true even
   if the browser would otherwise evict its HTTP cache.
   Bump VERSION on every deploy to roll the cache forward.
   ============================================================ */
const VERSION = "ap-v1.4.0";
const SHELL = [
  "./", "./index.html",
  "./styles.css", "./onboarding.css", "./grownup.css", "./teach.css",
  "./friends.css", "./kidmagic.css", "./funnel.css",
  "./store.js", "./idb.js", "./data.js", "./voices.js", "./sound.js",
  "./onboarding.js", "./grownup.js", "./teach.js", "./funnel.js", "./app.js",
  "./manifest.json", "./icon-192.png", "./icon-512.png",
];
const RUNTIME_HOSTS = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com"];   // piper engine files

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.startsWith("ap-v") && k!==VERSION).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  if(e.request.method !== "GET") return;

  if(url.origin === location.origin){
    /* HTML/navigations: NETWORK-FIRST so every deploy's fixes reach the tablet
       immediately; fall back to cache only when actually offline. */
    if(e.request.mode === "navigate" || e.request.destination === "document"){
      e.respondWith(
        fetch(e.request).then(res=>{
          if(res && res.ok) caches.open(VERSION).then(c=>c.put(e.request, res.clone()));
          return res;
        }).catch(()=> caches.match(e.request).then(hit=> hit || caches.match("./index.html")))
      );
      return;
    }
    /* static assets (css/js/icons): cache-first + background refresh.
       VERSION bumps roll the whole shell forward atomically on activate. */
    e.respondWith(
      caches.match(e.request).then(hit=>{
        const refresh = fetch(e.request).then(res=>{
          if(res && res.ok) caches.open(VERSION).then(c=>c.put(e.request, res.clone()));
          return res;
        }).catch(()=>hit);
        return hit || refresh;   // uncached+offline → undefined (no same-origin runtime fetches exist)
      })
    );
    return;
  }
  /* voice-engine CDN files: cache-as-you-go so the natural voice
     survives HTTP-cache eviction and offline restarts */
  if(RUNTIME_HOSTS.includes(url.hostname)){
    e.respondWith(
      caches.open(VERSION+"-cdn").then(c=>
        c.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
          if(res && res.ok) c.put(e.request, res.clone());
          return res;
        }))
      )
    );
  }
  /* everything else (e.g. the one-time HuggingFace model download the
     Piper library manages in its own Cache Storage): untouched */
});
