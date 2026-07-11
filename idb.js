/* ============================================================
   The Amazing Puzzle™ — MEDIA STORE (IndexedDB)
   Photos and recorded words are big; localStorage is ~5MB.
   Large media lives in IndexedDB; the profile JSON keeps only a
   token ("idb:<id>"). At boot / profile-switch the active
   profile's media hydrates into an in-memory map so every render
   stays synchronous. If IndexedDB is unavailable, everything
   falls back to inline dataURLs — the app never breaks.
   Backups stay portable: export re-inlines media into the file;
   restore writes it back into IndexedDB.
   ============================================================ */

const MEDIA = {
  map: new Map(),            // token → dataURL (render-ready)
  db: null,
  ok: typeof indexedDB !== "undefined",
};

function idbOpen(){
  return new Promise((res, rej)=>{
    if(!MEDIA.ok) return rej(new Error("no idb"));
    if(MEDIA.db) return res(MEDIA.db);
    const rq = indexedDB.open("ap-media", 1);
    rq.onupgradeneeded = ()=> rq.result.createObjectStore("media");
    rq.onsuccess = ()=>{ MEDIA.db = rq.result; res(MEDIA.db); };
    rq.onerror = ()=> rej(rq.error);
  });
}
function idbPut(id, value){
  return idbOpen().then(db=> new Promise((res, rej)=>{
    const tx = db.transaction("media","readwrite");
    tx.objectStore("media").put(value, id);
    tx.oncomplete = ()=>res(true); tx.onerror = ()=>rej(tx.error);
  }));
}
function idbGet(id){
  return idbOpen().then(db=> new Promise((res, rej)=>{
    const rq = db.transaction("media").objectStore("media").get(id);
    rq.onsuccess = ()=>res(rq.result); rq.onerror = ()=>rej(rq.error);
  }));
}
function idbDel(id){
  return idbOpen().then(db=> new Promise((res)=>{
    const tx = db.transaction("media","readwrite");
    tx.objectStore("media").delete(id);
    tx.oncomplete = ()=>res(true); tx.onerror = ()=>res(false);
  })).catch(()=>false);
}

/* ---- the app-facing API ---- */
const MEDIA_MIN = 2048;      // only offload payloads worth offloading

/* store a dataURL → token (or the dataURL itself when IDB is unavailable) */
async function mediaStore(dataURL, hint){
  if(!MEDIA.ok || typeof dataURL !== "string" || !dataURL.startsWith("data:") || dataURL.length < MEDIA_MIN)
    return dataURL;
  const id = (hint||"m") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  try{
    await idbPut(id, dataURL);
    const token = "idb:" + id;
    MEDIA.map.set(token, dataURL);        // render-ready immediately
    return token;
  }catch(e){ return dataURL; }            // graceful: keep it inline
}
/* resolve a stored value → something an <img>/<audio> can use, synchronously */
function mediaURL(v){
  if(typeof v !== "string") return v;
  if(v.startsWith("idb:")) return MEDIA.map.get(v) || "";
  return v;
}
/* collect every media token referenced by a profile */
function mediaTokensOf(p){
  const t = [];
  const grab = v => { if(typeof v==="string" && v.startsWith("idb:")) t.push(v); };
  (p.people||[]).forEach(x=>grab(x.img));
  Object.values((p.vocab&&p.vocab.cats)||{}).forEach(cards=>(cards||[]).forEach(c=>grab(c.img)));
  ((p.vocab&&p.vocab.needs)||[]).forEach(c=>grab(c.img));
  Object.values(p.recordings||{}).forEach(grab);
  return t;
}
/* hydrate the ACTIVE profile's media into memory (await before first render) */
async function mediaHydrate(p){
  if(!p || !MEDIA.ok) return;
  const tokens = mediaTokensOf(p).filter(t=>!MEDIA.map.has(t));
  await Promise.all(tokens.map(async t=>{
    try{ const v = await idbGet(t.slice(4)); if(v) MEDIA.map.set(t, v); }catch(e){}
  }));
}
/* migrate inline dataURLs (legacy profiles) out of localStorage into IDB */
async function mediaMigrate(){
  if(!MEDIA.ok) return;
  const all = profilesAll(); let dirty = false;
  for(const p of all){
    const move = async (obj, field, hint)=>{
      const v = obj[field];
      if(typeof v==="string" && v.startsWith("data:") && v.length>=MEDIA_MIN){
        obj[field] = await mediaStore(v, hint); dirty = true;
      }
    };
    for(const x of (p.people||[])) await move(x,"img","ppl");
    for(const cards of Object.values((p.vocab&&p.vocab.cats)||{})) for(const c of (cards||[])) await move(c,"img","card");
    for(const c of ((p.vocab&&p.vocab.needs)||[])) await move(c,"img","need");
    for(const k of Object.keys(p.recordings||{})){
      const v = p.recordings[k];
      if(typeof v==="string" && v.startsWith("data:") && v.length>=MEDIA_MIN){
        p.recordings[k] = await mediaStore(v,"rec"); dirty = true;
      }
    }
  }
  if(dirty) STORE.write("ap.profiles", all);
}
/* delete a removed profile's media (called by profileRemove) */
function mediaPurgeProfile(p){
  if(!p) return;
  mediaTokensOf(p).forEach(t=>{ idbDel(t.slice(4)); MEDIA.map.delete(t); });
}
/* re-inline media for a portable backup file */
async function mediaInlineForBackup(profiles){
  for(const p of profiles){
    const inline = async (obj, field)=>{
      const v = obj[field];
      if(typeof v==="string" && v.startsWith("idb:")){
        const data = MEDIA.map.get(v) || await idbGet(v.slice(4)).catch(()=>null);
        if(data) obj[field] = data;
      }
    };
    for(const x of (p.people||[])) await inline(x,"img");
    for(const cards of Object.values((p.vocab&&p.vocab.cats)||{})) for(const c of (cards||[])) await inline(c,"img");
    for(const c of ((p.vocab&&p.vocab.needs)||[])) await inline(c,"img");
    for(const k of Object.keys(p.recordings||{})){
      const v = p.recordings[k];
      if(typeof v==="string" && v.startsWith("idb:")){
        const data = MEDIA.map.get(v) || await idbGet(v.slice(4)).catch(()=>null);
        if(data) p.recordings[k] = data;
      }
    }
  }
  return profiles;
}
