/* ============================================================
   The Amazing Puzzle™ — app logic
   - Web Speech voices (Sunny/River/Spark) + recorded familiar voice
   - Animated TRAIN bottom nav (Freddy drives)
   - Cast placed by ROLE (never random)
   - Profile-aware: onboarding (3.1–3.6) feeds name/avatar/photos/
     favorites/voice into every screen. Photos = real family faces.
   ============================================================ */
const $ = (s,r=document)=>r.querySelector(s);
const screenEl = $("#screen");

const state = { screen:"home", cat:"favorites", sentence:[], voice:"sunny" };
let PROFILE = null;   // set by applyProfile()

/* ---------------- Speech engine (free, on-device) ---------------- */
let VOICE_POOL = [];
function loadVoices(){ VOICE_POOL = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
if (window.speechSynthesis){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice(key){
  const v = VOICES[key] || VOICES.sunny;
  for (const m of v.match){
    const hit = VOICE_POOL.find(x => (x.name+" "+x.lang).toLowerCase().includes(m));
    if (hit) return hit;
  }
  return VOICE_POOL.find(x=>x.lang && x.lang.startsWith("en")) || VOICE_POOL[0] || null;
}
/* One shared Audio element: recordings never stack, and BOTH channels
   (recorded + TTS) are silenced before anything new speaks. */
const AUDIO = new Audio();
let SPEAK_SEQ = 0;   // rapid taps: only the NEWEST utterance may fall back
function speakTTS(text, voiceKey){
  if(!window.speechSynthesis) return;
  const cfg = VOICES[voiceKey || state.voice] || VOICES.sunny;
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  const mult = s.rate==="slower" ? 0.78 : s.rate==="faster" ? 1.18 : 1;   // Settings → Voice → Speed
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(voiceKey || state.voice); if(v) u.voice = v;
  u.rate = cfg.rate * mult;
  /* Calm Mode pulls every voice gently toward neutral pitch */
  u.pitch = s.calm ? 1 + (cfg.pitch - 1) * 0.5 : cfg.pitch;
  u.lang = "en-US";
  speechSynthesis.speak(u);
}
function speak(text, voiceKey){
  if(!text) return;
  const seq = ++SPEAK_SEQ;
  const fallback = ()=>{ if(seq === SPEAK_SEQ) speakTTS(text, voiceKey); };   // stale rejections stay silent
  try{ speechSynthesis && speechSynthesis.cancel(); }catch(e){}
  try{ AUDIO.pause(); AUDIO.currentTime = 0; }catch(e){}
  /* Familiar voice: if the family recorded this word, play THEM (lowercase
     keys). Any playback failure falls back to TTS — a tile is NEVER silent.
     Skipped inside the wizard so voice previews use the named voices. */
  const key = String(text).toLowerCase();
  const canFam = PROFILE && PROFILE.useFamiliar && PROFILE.recordings && PROFILE.recordings[key]
    && !document.body.classList.contains("onboarding");
  if(canFam){
    try{
      AUDIO.src = (typeof mediaURL==="function") ? mediaURL(PROFILE.recordings[key]) : PROFILE.recordings[key];
      AUDIO.play().catch(fallback);
      return;
    }catch(e){ /* fall through */ }
  }
  /* natural voice (Piper) = the CHILD'S voice upgrade: cached words play
     instantly; uncached speak NOW via webspeech while Piper warms them.
     Cast characters always keep their own webspeech personas. */
  if(typeof piperSpeak==="function" && piperSpeak(text, fallback, voiceKey)) return;
  speakTTS(text, voiceKey);
}
function buzz(){
  try{
    if(typeof settingsGet==="function" && settingsGet().vibration===false) return;
    navigator.vibrate && navigator.vibrate(8);
  }catch(e){}
}

/* ---------------- Profile → app (the onboarding payoff) ---------------- */
/* Full seed snapshots so applyProfile is IDEMPOTENT — switching children or
   re-running setup must never leave stale photos/words behind. The vocab
   editor writes a per-child overlay (profile.vocab); the seed is pristine. */
const SEED = {
  favRow: FAVORITES.map(f=>({...f})),
  cats: Object.fromEntries(Object.entries(CATEGORIES).map(([id,c])=>[id, c.cards.map(x=>({...x}))])),
  needs: NEEDS.map(n=>({...n})),
  child: { ...CHILD },
};
function applyProfile(p){
  PROFILE = p || profileGet();
  // restore pristine seeds first (or the child's own vocab overlay)
  const ov = (PROFILE && PROFILE.vocab) || {cats:{}, needs:null};
  Object.keys(CATEGORIES).forEach(id=>{
    const src = (ov.cats && ov.cats[id]) ? ov.cats[id] : SEED.cats[id];
    CATEGORIES[id].cards = (src||[]).map(c=>({...c}));
  });
  NEEDS.length = 0;
  ((ov.needs && ov.needs.length) ? ov.needs : SEED.needs).forEach(n=>NEEDS.push({...n}));
  FAVORITES.length = 0; SEED.favRow.forEach(f=>FAVORITES.push({...f}));
  CHILD.name = SEED.child.name; CHILD.avatar = SEED.child.avatar;
  if(!PROFILE) return;
  // name + avatar + voice
  CHILD.name = PROFILE.name || CHILD.name;
  if(PROFILE.avatar) CHILD.avatar = PROFILE.avatar;
  if(PROFILE.voice) state.voice = PROFILE.voice;
  // A MATERIALIZED category (edited in the Vocabulary editor) is authoritative:
  // derived layering below only applies to categories still on the pristine seed.
  // Otherwise editor indexes drift from the live board and edits corrupt words.
  const matPeople = !!(ov.cats && ov.cats.people);
  const matFavs   = !!(ov.cats && ov.cats.favorites);
  // People world gets the real faces (seed-only — the editor owns it after that)
  if(!matPeople && Array.isArray(PROFILE.people)){
    PROFILE.people.forEach(p=>{
      const label = String(p.label||"").trim();
      let card = CATEGORIES.people.cards.find(c=>c.label.toLowerCase()===label.toLowerCase());
      if(!card && p.custom && label && label!=="Name"){   // skip never-renamed placeholders
        card = { emoji:p.emoji||"🙂", label };
        CATEGORIES.people.cards.push(card);
      }
      if(card && p.img) card.img = p.img;
    });
  }
  // Emergency Mom/Dad get the real faces too (a face reads fastest in a hard
  // moment) — unless the caregiver set a custom picture in the emergency editor.
  NEEDS.forEach(n=>{
    if(n.img) return;
    const match = (PROFILE.people||[]).find(p=>String(p.label||"").toLowerCase()===n.label.toLowerCase());
    if(match && match.img) n.img = match.img;
  });
  // favorites: home row + front of the Favorites world
  if(PROFILE.favorites && PROFILE.favorites.length){
    const lib = (typeof OB_FAVS!=="undefined") ? OB_FAVS : [];
    const picked = PROFILE.favorites
      .map(lbl=> lib.find(f=>f.label===lbl) || {emoji:"⭐",label:lbl})
      .map(f=>({emoji:f.emoji,label:f.label,speak:f.label.toLowerCase()}));
    FAVORITES.length = 0;
    picked.slice(0,4).forEach(f=>FAVORITES.push(f));
    // prepend to the Favorites world only while it's un-edited seed (see matFavs)
    if(!matFavs){
      const favCat = CATEGORIES.favorites;
      picked.slice().reverse().forEach(f=>{
        if(!favCat.cards.some(c=>c.label.toLowerCase()===f.label.toLowerCase()))
          favCat.cards.unshift({emoji:f.emoji,label:f.label});
      });
    }
  }
}
/* Calm Mode helper — every celebration/auto-speech path checks this. */
function calmOK(){ return !(typeof settingsGet==="function" && settingsGet().calm); }

/* ---------------- Buddy (a cast member, by role) ---------------- */
const buddyEl = $("#buddy"), buddyChip = $("#buddyChip"), buddyBubble = $("#buddyBubble");
function showBuddy(castKey, line, voice){
  const c = CAST[castKey]; if(!c){ buddyEl.hidden = true; return; }
  buddyEl.hidden = false;
  buddyChip.textContent = c.emoji;
  buddyChip.style.background = c.soft;
  buddyBubble.textContent = line || "";
  buddyChip.onclick = ()=>{ buzz(); const l = line || "Hola!"; buddyBubble.textContent = l;
    speak(l.replace(/[—-].*$/,""), voice || (VOICES[castKey] ? castKey : "sunny")); };   // each friend speaks in their OWN voice
  /* quiet, ignorable Play pill on talking screens (never interrupts) */
  const old = buddyEl.querySelector(".buddy__play"); if(old) old.remove();
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  if(s.games!==false && (state.screen==="talk" || state.screen==="category") && typeof startTeach==="function"
     && typeof teachPlayable==="function" && teachPlayable(state.cat)){
    const play = document.createElement("button");
    play.className = "buddy__play";
    play.innerHTML = `🎲 Play`;
    play.setAttribute("aria-label", "Play a word game with "+c.name);
    play.onclick = ()=>{ buzz(); startTeach(state.cat, state.screen); };
    buddyEl.appendChild(play);
  }
}
function hideBuddy(){ buddyEl.hidden = true; }

/* ---------------- 🚂 The TRAIN (bottom nav) ---------------- */
function renderTrain(){
  const wrap = $("#trainCars"); wrap.innerHTML = "";
  TRAIN.forEach(stop=>{
    const car = document.createElement("button");
    car.className = "car" + (state.screen===stop.id ? " is-active":"");
    car.style.background = stop.color;
    car.innerHTML = `<span class="e">${stop.emoji}</span><span class="l">${stop.label}</span>
      <span class="car__wheels"><i></i><i></i></span>`;
    car.onclick = ()=>{
      buzz();
      car.classList.remove("bounce"); void car.offsetWidth; car.classList.add("bounce");
      go(stop.id);
    };
    wrap.appendChild(car);
  });
}
$("#loco").onclick = ()=>{ buzz(); showBuddy("freddy","All aboard! 🚂"); speak("All aboard!","freddy"); };

/* ---------------- Router ---------------- */
function go(screen, cat){
  state.screen = screen; if(cat) state.cat = cat;
  document.body.classList.remove("onboarding");
  /* leaving a teach game mid-round must never strand a timer or the class */
  document.body.classList.remove("teach");
  if(typeof TEACH!=="undefined" && TEACH._timer){ clearTimeout(TEACH._timer); TEACH._timer = null; }
  if(screen!=="grownup"){
    /* landing anywhere in the child's world closes the grown-up door */
    document.body.classList.remove("gz");
    if(typeof gzRelock==="function") gzRelock();
  }
  renderTrain();
  const map = { home:renderHome, talk:renderBoard, category:renderBoard, world:renderWorld, stars:renderStars,
    grownup:(typeof gzEnter==="function"? gzEnter : renderHome) };
  (map[screen]||renderHome)();
}

/* ---------------- Shared: a speaking, teachable tile ---------------- */
function tileEl(card, bg){
  const t = document.createElement("button");
  t.className = "tile";
  t.style.background = bg;
  const imgSrc = (typeof mediaURL==="function") ? mediaURL(card.img) : card.img;
  t.innerHTML = imgSrc
    ? `<span class="ph"><img src="${esc(imgSrc)}" alt="${esc(card.label)}"></span><span class="l">${esc(card.label)}</span>`
    : `<span class="e">${esc(card.emoji)}</span><span class="l">${esc(card.label)}</span>`;
  t.onclick = ()=> onTile(card, t);
  return t;
}
function onTile(card, el){
  buzz();
  el.classList.remove("speaking"); void el.offsetWidth; el.classList.add("speaking");
  const word = card.speak || card.label;
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  if(s.speakOnTap!==false) speak(word);     // teachable: one tap = hear the word
  try{ usageLog(card.label, state.cat); }catch(e){}   // descriptive only — never a score
  addToSentence(card);
}

/* ---------------- Sentence strip ---------------- */
function stripHTML(){
  return `<div class="strip" id="strip">
      <div class="strip__cards" id="stripCards"></div>
      <button class="strip__btn strip__btn--del" id="sDel" aria-label="Undo">⌫</button>
      <button class="strip__btn strip__btn--speak" id="sSpeak" aria-label="Speak">🔊</button>
    </div>`;
}
function wireStrip(){
  renderStrip();
  $("#sSpeak").onclick = ()=>{ if(!state.sentence.length) return; buzz();
    speak(state.sentence.map(c=>c.speak||c.label).join(" "));
    encourage();
  };
  $("#sDel").onclick = ()=>{ buzz(); state.sentence.pop(); renderStrip(); };
}
function renderStrip(){
  const el = $("#stripCards"); if(!el) return; el.innerHTML="";
  state.sentence.forEach((c,i)=>{
    const p = document.createElement("span"); p.className="pill";
    p.style.background = PASTEL[i % PASTEL.length];
    p.innerHTML = `<span class="e">${esc(c.emoji||"🗣")}</span>${esc(c.label.toLowerCase())}`;
    el.appendChild(p);
  });
  el.scrollLeft = el.scrollWidth;
}
let momentaryTimer = null;
function addToSentence(card){
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  if(s.mode==="single"){
    /* Single-word mode: the strip is a momentary echo, then clears itself. */
    if(momentaryTimer) clearTimeout(momentaryTimer);
    state.sentence = [card]; renderStrip();
    momentaryTimer = setTimeout(()=>{ state.sentence = []; renderStrip(); momentaryTimer = null; }, 1600);
    return;
  }
  state.sentence.push(card); renderStrip();
  if(state.sentence.length===1) buddyBubble.textContent = "One more word!";
  else if(state.sentence.length>=2) buddyBubble.textContent = "Press 🔊 to say it!";
}
function encourage(){ showBuddy("pollito","You did it! 🎉"); }

/* ---------------- HOME ---------------- */
function renderHome(){
  hideBuddy();
  screenEl.innerHTML = `
    <div class="home">
      <button class="home__grown" id="grownBtn">🔒 Grown-Up</button>
      <div class="home__hi">Hi ${esc(CHILD.name)}! <span class="wave">👋</span></div>
      <div class="home__avatar">${esc(CHILD.avatar)}</div>
      <div class="home__sub">Ready to talk today?</div>
      <button class="start" id="startBtn">Start Talking <span class="start__bubble">💬</span></button>
      <div class="home__favtitle">Your Favorites</div>
      <div class="favrow" id="favRow"></div>
    </div>`;
  const row = $("#favRow");
  FAVORITES.forEach((f)=>{
    const b = document.createElement("button"); b.className="fav";
    b.innerHTML = `<span class="e">${esc(f.emoji)}</span><span class="l">${esc(f.label)}</span>`;
    b.onclick = ()=>{ buzz(); speak(f.speak||f.label); };
    row.appendChild(b);
  });
  $("#startBtn").onclick = ()=>{ buzz(); go("talk"); };
  $("#grownBtn").onclick = ()=> go("grownup");
  setTimeout(()=>{
    showBuddy("pollito", `Hola, ${CHILD.name}!`);
    /* Calm Mode: companions stay quiet (chip visible, no auto speech) */
    const s = (typeof settingsGet==="function") ? settingsGet() : {};
    if(s.calm) return;
    /* the family's recorded "Hola!" greets the child when it exists */
    if(PROFILE && PROFILE.useFamiliar && PROFILE.recordings && PROFILE.recordings["hola!"]) speak("hola!");
    else speak(`Hola, ${CHILD.name}!`,"pollito");
  }, 250);
}

/* ---------------- BOARD / CATEGORY ---------------- */
function renderBoard(){
  const cat = CATEGORIES[state.cat] || CATEGORIES.favorites;
  const isSub = state.screen==="category";
  screenEl.innerHTML = `
    <div class="head">
      ${isSub? `<button class="head__back" id="back">‹ Back</button>`:""}
      <div class="head__title">${isSub? cat.emoji+" "+cat.label : "💬 Talk"}</div>
      <button class="need-btn" id="needBtn"><span class="sos">SOS</span> I Need</button>
    </div>
    ${isSub? `<div class="head__sub">Tap to speak. Build a sentence!</div>`:""}
    ${stripHTML()}
    <div class="grid" id="grid"></div>`;
  const grid = $("#grid");
  if(!cat.cards.length){
    /* 4.1 empty state — a warm hand-off, never a blank wall */
    grid.innerHTML = `<div class="stub" style="grid-column:1/-1; min-height:40vh">
      <div class="stub__big" aria-hidden="true">🧩</div>
      <h2>Nothing here yet!</h2>
      <p>A grown-up can add words for you in the Grown-Up Zone.</p>
    </div>`;
  } else {
    cat.cards.forEach((card,i)=> grid.appendChild(tileEl(card, PASTEL[i % PASTEL.length])));
  }
  /* natural voice: quietly pre-warm the words the child can see right now */
  if(typeof piperPrewarm==="function") piperPrewarm(cat.cards.map(c=>c.speak||c.label));
  wireStrip();
  $("#needBtn").onclick = openNeeds;
  if(isSub) $("#back").onclick = ()=> go("world");
  const host = cat.host || "pollito";
  const lines = { pollito:"Let's talk together!", ana:"What do you see?", benji:"Take your time.", coco:"How do you feel today?" };
  showBuddy(host, lines[host] || "Nice talking!");
}

/* ---------------- WORLD (category map) ---------------- */
function renderWorld(){
  screenEl.innerHTML = `
    <div class="head"><div class="head__title">🧩 World</div></div>
    <div class="head__sub">Pick a place to explore and talk.</div>
    <div class="worldmap" id="worldmap"></div>`;
  const map = $("#worldmap");
  Object.entries(CATEGORIES).forEach(([id,c],i)=>{
    const t = document.createElement("button"); t.className="worldtile";
    t.style.background = PASTEL[i % PASTEL.length];
    t.innerHTML = `<span class="e">${c.emoji}</span><span class="l">${c.label}</span>`;
    t.onclick = ()=>{ buzz(); go("category", id); };
    map.appendChild(t);
  });
  showBuddy("ana","Where to next? Let's explore!");
}

/* ---------------- STARS (gentle, descriptive — never a score) ---------------- */
function renderStars(){
  const words = state.sentence.map(c=>esc(c.label.toLowerCase()));
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  const host = CAST[(CATEGORIES[state.cat]||{}).host || "pollito"] || CAST.pollito;
  screenEl.innerHTML = `
    <div class="stub">
      <div class="stub__big">⭐</div>
      <h2>Nice talking!</h2>
      <p>${words.length
        ? "Words in your line right now: <b>"+words.join(", ")+"</b>."
        : "Your words will gently show up here as you talk."}</p>
      ${s.games!==false && typeof startTeach==="function" && typeof teachPlayable==="function" && teachPlayable(state.cat) ? `
      <button class="stars__play" id="starsPlay">
        <span class="c" style="background:${host.color}" aria-hidden="true">${host.emoji}</span>
        <span><span class="t">Play a word game</span><br>
        <span class="s">${esc(host.name)} shows a word — you find it. No wrong answers.</span></span>
      </button>`:""}
    </div>`;
  const sp = $("#starsPlay");
  if(sp) sp.onclick = ()=>{ buzz(); startTeach(state.cat, "stars"); };
  showBuddy("pollito","You were heard!");
  if(calmOK()) speak("You were heard!","pollito");   // Calm Mode: companions hush everywhere
}

/* Grown-Up Zone lives in grownup.js (gzEnter → PIN gate → hub). */

/* ---------------- I NEED overlay ---------------- */
function openNeeds(){
  buzz();
  const grid = $("#needGrid"); grid.innerHTML="";
  NEEDS.forEach(card=>{
    const t = tileEl(card, card.bg);
    t.onclick = ()=>{ buzz(); t.classList.add("speaking"); speak(card.speak||card.label); };
    grid.appendChild(t);
  });
  $("#needFoot").innerHTML = `${CAST.benji.emoji} It's okay. I'll wait. — Benji`;
  $("#needOverlay").hidden = false;
}
function closeNeeds(){
  $("#needOverlay").hidden = true;
  /* if a teach game was paused under the panel, resume it gently */
  if(document.body.classList.contains("teach") && typeof teachResume==="function") teachResume();
}
$("#needClose").onclick = closeNeeds;
$("#needOverlay").onclick = (e)=>{ if(e.target.id==="needOverlay") closeNeeds(); };

/* ---------------- boot ----------------
   The splash (pure CSS, already animating) covers hydration:
   1. migrate any legacy inline photos/recordings → IndexedDB
   2. hydrate the active child's media into memory
   3. wake the natural voice from local cache (no network)
   4. reveal the app — never earlier than the pieces snapping in */
(async function boot(){
  const t0 = Date.now();
  renderTrain();
  try{ if(typeof mediaMigrate==="function") await mediaMigrate(); }catch(e){}
  try{ if(typeof mediaHydrate==="function") await mediaHydrate(profileGet()); }catch(e){}
  if(typeof piperBoot==="function") piperBoot();
  if(profileGet()){ applyProfile(); applySettings(); go("home"); }
  else { startOnboarding(); }
  /* dismiss the splash gently (min 1.4s so the assembly reads; instant-ish under reduced motion) */
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  const minShow = (s.motion || matchMedia("(prefers-reduced-motion: reduce)").matches) ? 250 : 1400;
  const wait = Math.max(0, minShow - (Date.now()-t0));
  setTimeout(()=>{
    const sp = document.getElementById("splash");
    if(sp){ sp.classList.add("done"); setTimeout(()=>sp.remove(), 600); }
  }, wait);
  /* the offline promise: register the service worker (https/localhost only) */
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
})();
