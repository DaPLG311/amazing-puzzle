/* ============================================================
   The Amazing Puzzle™ — VOICE ENGINE
   Three engines, one rule: A TILE IS NEVER SILENT.
     1. recorded   — the family's own clips (highest trust)
     2. piper      — natural neural voice, optional one-time
                     caregiver install (~20–60 MB); offline forever
                     after; instant fallback if it ever fails
     3. webspeech  — built-in system voices (always available)
   Talking NEVER depends on the internet — Piper's download is a
   caregiver "update" action in the Grown-Up Zone, nothing more.

   Per-character voices (the vault: the cast are companions with
   their OWN voices, separate from the child's chosen voice):
     🐤 Pollito bright & quick · 🦊 Ana energetic · 🐻 Benji low &
     slow · 🐱 Coco high & melodic · 🐸 Freddy steady conductor.
   ============================================================ */

/* ---- character voice profiles (extend the child's Sunny/River/Spark) ---- */
/* pitches stay inside a sensory-safe envelope (~0.8–1.25) — distinctness
   comes from rate + voice matching, never from shrillness */
if (typeof VOICES === "object") Object.assign(VOICES, {
  pollito: { name:"Pollito", rate:1.06, pitch:1.20, match:["samantha","zira","google us","female"] },
  ana:     { name:"Ana",     rate:1.16, pitch:1.14, match:["karen","google","nicky","female"] },
  benji:   { name:"Benji",   rate:0.82, pitch:0.84, match:["daniel","alex","google uk","male"] },
  coco:    { name:"Coco",    rate:1.00, pitch:1.24, match:["samantha","victoria","google us","female"] },
  freddy:  { name:"Freddy",  rate:0.98, pitch:0.92, match:["fred","alex","daniel","male"] },
});

/* ============================================================
   PIPER — natural voice (optional, installed by a caregiver)
   State persisted at ap.piper = { voiceId } once installed.
   ============================================================ */
const PIPER = {
  CDN: "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm",
  DEFAULT_VOICE: "en_US-lessac-low",            // proven in-app; ~20 MB one time
  mod: null,                 // the dynamically imported module (only after install)
  status: "none",            // none | installing | ready | error
  progress: 0,
  error: null,
  cache: new Map(),          // text|voice → objectURL (board words repeat constantly)
  CACHE_MAX: 60,
};
function piperVoiceId(){ return (STORE.read("ap.piper", null)||{}).voiceId || PIPER.DEFAULT_VOICE; }
function piperInstalled(){ return !!STORE.read("ap.piper", null); }

/* boot: if a caregiver installed Piper earlier, warm it silently — from the
   browser's local model cache, no network needed. Failure is quiet: webspeech
   simply keeps doing the talking. */
function piperBoot(){
  if(!piperInstalled()) return;
  piperLoad().catch(()=>{ PIPER.status = "error"; });
}
async function piperLoad(){
  if(PIPER.mod && PIPER.status==="ready") return PIPER.mod;
  const mod = await import(PIPER.CDN);
  PIPER.mod = mod;
  /* BLOCKER GUARD: the browser can evict Cache Storage while keeping our
     localStorage flag. Verify the MODEL is really on-device before going
     ready — otherwise a child's tap could trigger a silent 20MB download.
     Missing model → status "stale": Settings offers a caregiver re-download;
     the child keeps talking through webspeech, nothing fetches. */
  try{
    const stored = await mod.stored();
    if(piperInstalled() && !(stored||[]).includes(piperVoiceId())){
      PIPER.status = "stale";
      return mod;
    }
  }catch(e){ /* can't verify → stay safe */ PIPER.status = "stale"; return mod; }
  PIPER.status = "ready";
  /* if the child is already looking at a board, warm those words now —
     otherwise the first prewarm waits for the next navigation */
  try{
    if(typeof state!=="undefined" && (state.screen==="talk"||state.screen==="category")){
      const cat = CATEGORIES[state.cat] || CATEGORIES.favorites;
      piperPrewarm(cat.cards.map(c=>c.speak||c.label));
    }
  }catch(e){}
  return mod;
}

/* caregiver-initiated install (Grown-Up Zone → Settings → Voice) */
async function piperInstall(onProgress){
  PIPER.status = "installing"; PIPER.progress = 0; PIPER.error = null;
  try{
    const mod = PIPER.mod || await import(PIPER.CDN);
    PIPER.mod = mod;
    await mod.download(piperVoiceId(), p=>{
      PIPER.progress = p && p.total ? Math.round((p.loaded/p.total)*100) : 0;
      if(onProgress) onProgress(PIPER.progress);
    });
    STORE.write("ap.piper", { voiceId: piperVoiceId(), installedAt:new Date().toISOString() });
    PIPER.status = "ready";
    return true;
  }catch(e){
    PIPER.status = "error";
    PIPER.error = /fetch|network|Failed to/i.test(String(e))
      ? "Couldn't download — check the internet connection and try again."
      : "The natural voice couldn't be set up on this device.";
    return false;
  }
}
function piperRemove(){
  try{ PIPER.mod && PIPER.mod.remove && PIPER.mod.remove(piperVoiceId()); }catch(e){}
  /* module never woke? best-effort direct cleanup so 20MB never orphans */
  if(!PIPER.mod && window.caches){
    caches.keys().then(keys=>keys.forEach(k=>{ if(/piper|tts/i.test(k)) caches.delete(k); })).catch(()=>{});
  }
  STORE.remove("ap.piper");
  PIPER.status = "none";
  PIPER.cache.forEach(url=>{ if(typeof AUDIO==="undefined" || AUDIO.src!==url) URL.revokeObjectURL(url); });
  PIPER.cache.clear();
}

/* synth one utterance → objectURL (LRU-cached; repeats are instant) */
async function piperSynth(text){
  const key = text.toLowerCase() + "|" + piperVoiceId();
  if(PIPER.cache.has(key)){
    const url = PIPER.cache.get(key);
    PIPER.cache.delete(key); PIPER.cache.set(key, url);       // LRU bump
    return url;
  }
  const wav = await PIPER.mod.predict({ text, voiceId: piperVoiceId() });
  const url = URL.createObjectURL(wav);
  PIPER.cache.set(key, url);
  if(PIPER.cache.size > PIPER.CACHE_MAX){
    const oldest = PIPER.cache.keys().next().value;
    const oldURL = PIPER.cache.get(oldest);
    PIPER.cache.delete(oldest);
    /* never revoke the clip that's playing right now */
    if(typeof AUDIO === "undefined" || AUDIO.src !== oldURL) URL.revokeObjectURL(oldURL);
  }
  return url;
}

/* speak via Piper ONLY when the clip is already cached — a tap must speak
   within ~100ms, and neural synth takes ~1.5s cold. Uncached words speak
   instantly through webspeech while Piper warms them for the NEXT tap.
   Returns true if Piper took the utterance. */
function piperSpeak(text, fallback, voiceKey){
  if(PIPER.status !== "ready" || !piperInstalled()) return false;
  /* the natural voice is the CHILD'S voice upgrade — the cast keep their own
     distinct personas (Benji stays low & slow, Coco stays melodic) */
  if(voiceKey && typeof CAST !== "undefined" && CAST[voiceKey]) return false;
  /* voice-choosing contexts (onboarding 3.5, Grown-Up settings) must hear the
     REAL webspeech personas — the neural voice would make them all identical */
  const b = document.body.classList;
  if(b.contains("onboarding") || b.contains("gz")) return false;
  const key = String(text).toLowerCase() + "|" + piperVoiceId();
  if(PIPER.cache.has(key)){
    const url = PIPER.cache.get(key);
    PIPER.cache.delete(key); PIPER.cache.set(key, url);   // LRU bump
    try{
      AUDIO.src = url;
      AUDIO.play().catch(()=> fallback());
      return true;
    }catch(e){ return false; }
  }
  piperSynth(text).catch(()=>{});               // warm quietly for next time
  return false;                                  // this tap speaks right now via webspeech
}

/* pre-warm the words the child can currently see (bounded, background, silent,
   idle-polite so a low-end tablet never janks while the child is tapping) */
PIPER._warmTimers = [];
function piperPrewarm(labels){
  if(PIPER.status !== "ready" || !piperInstalled()) return;
  /* a child flicking through categories must not stack warm batches */
  PIPER._warmTimers.forEach(clearTimeout); PIPER._warmTimers = [];
  const todo = (labels||[]).map(String)
    .filter(t=> !PIPER.cache.has(t.toLowerCase()+"|"+piperVoiceId()))
    .slice(0,12);
  todo.forEach((t,i)=> PIPER._warmTimers.push(setTimeout(()=>{
    const run = ()=> piperSynth(t).catch(()=>{});
    if(typeof requestIdleCallback === "function") requestIdleCallback(run, {timeout:3000});
    else run();
  }, 500*i)));
}
