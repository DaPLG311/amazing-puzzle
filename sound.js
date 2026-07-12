/* ============================================================
   The Amazing Puzzle™ — gentle sounds (Web Audio, no assets)
   SENSORY-SAFE BY DEFAULT: fun sounds are OPT-IN (settings.sounds,
   default off), soft, child-initiated, and Calm Mode silences them.
   The only sound is a warm little train horn on the engine — never
   ambient, never an alert. Synthesized live so it works offline.
   ============================================================ */

const SOUND = { ctx:null };

function soundsOn(){
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  return s.sounds === true && !s.calm;      // opt-in AND never in Calm Mode
}
function soundCtx(){
  if(!SOUND.ctx){
    try{ SOUND.ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
  return SOUND.ctx;
}

/* a warm, soft two-tone train horn — low volume, gentle attack & release */
function playHorn(){
  if(!soundsOn()) return;
  const ctx = soundCtx(); if(!ctx) return;
  try{ if(ctx.state === "suspended") ctx.resume(); }catch(e){}
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.13, now + 0.07);      // soft swell in
  master.gain.setValueAtTime(0.13, now + 0.45);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.95); // gentle fade out

  const lp = ctx.createBiquadFilter();                          // round off the edges
  lp.type = "lowpass"; lp.frequency.value = 1300; lp.Q.value = 0.6;
  master.connect(lp); lp.connect(ctx.destination);

  /* the classic warm horn chord (a soft major-ish blend, low register) */
  [{f:196,t:"triangle",g:0.5},{f:262,t:"sine",g:0.32},{f:330,t:"sine",g:0.22}].forEach(v=>{
    const o = ctx.createOscillator(); o.type = v.t; o.frequency.value = v.f;
    o.detune.value = 4;                                          // a hair of warmth
    const g = ctx.createGain(); g.gain.value = v.g;
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + 0.98);
  });
}
