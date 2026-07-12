/* ============================================================
   The Amazing Puzzle™ — THE TALK FUNNEL (Start Talking v2)
   Evidence-built per docs/RESEARCH-SENTENCE-FUNNEL.md:
   A1  2-tap starter→word→spoken sentence (PECS-IV / PODD lineage)
   A2  "All my words" never gated — one tap away, always
   A4  child output stays telegraphic, never corrected
   B1  rejection starter ("I don't want") — refusal is a right
   B2  positions & colors frozen by WORD IDENTITY (Thistle 2018)
   B3  SPOKEN model is grammatically complete ("Let's go to the
       park") while strip chips stay as tapped; read word-by-word
   B4  completing tap speaks the word, then the sentence
   B5  step-2 tiles are neutral — the symbol carries the color
   B7  "something else →" escape tile in every step-2 grid
   C2  auto-speak default, caregiver toggle for child-triggered
   ============================================================ */

const FUNNEL = { starter:null, source:null, done:false };

function funnelReset(){ FUNNEL.starter = null; FUNNEL.source = null; FUNNEL.done = false; }

/* words for the chosen starter: explicit items, or LIVE source categories
   (caregiver photos & custom words flow in; order/color stay stable — B2) */
function funnelWords(){
  const st = FUNNEL.starter;
  if(!st) return [];
  if(st.items) return st.items;
  const src = FUNNEL.source || st.sources[0];
  return (CATEGORIES[src] ? CATEGORIES[src].cards : []);
}

/* funnel sentences speak the LABEL (lowercased), never card.speak —
   card speak-overrides are full sentences ("I'm okay") and would double up */
function funnelWordText(card){
  const l = String(card.label);
  return /^[A-Z]/.test(l) && ["Mom","Dad","Grandma","Grandpa","Me"].includes(l) ? l : l.toLowerCase();
}

/* B3: the spoken MODEL for the completing word — grammatically complete,
   while the strip keeps the child's telegraphic token untouched */
function funnelModelFragment(card){
  const st = FUNNEL.starter;
  const w = funnelWordText(card);
  if(!st || !st.template) return w;
  if(st.exceptions && st.exceptions[w] !== undefined) return st.exceptions[w];
  if(st.noArticle && st.noArticle.includes(FUNNEL.source)) return w;
  if(/^[A-Z]/.test(w)) return w;                     // names never take an article
  /* "a" → "an" before a vowel sound so the model never says "a elephant" */
  return st.template.replace("{word}", w).replace(/\ba (?=[aeiou])/i, "an ");
}

function renderTalk(){ funnelStep(); }

/* ---------- step renderers ---------- */
function funnelStep(){
  /* a deferred step (from funnelPick) must never paint the funnel over a screen
     the child has since navigated away to */
  if(state.screen !== "talk") return;
  const st = FUNNEL.starter;
  screenEl.style.background = st ? `linear-gradient(180deg, ${st.color} 0%, #ffffff 58%)` : "";
  screenEl.innerHTML = `
    <div class="head">
      <div class="head__title">💬 Talk</div>
      <button class="need-btn" id="needBtn"><span class="sos">SOS</span> I Need</button>
    </div>
    ${stripHTML()}
    <div class="funnel" id="funnel"></div>`;
  wireStrip();
  $("#needBtn").onclick = openNeeds;

  const box = $("#funnel");
  if(!st) funnelStarters(box);
  else if(!FUNNEL.done) funnelObjects(box);
  else funnelDone(box);
}

/* STEP 1 — how do you want to start? (7 fixed doors — B2: never re-ranked) */
function funnelStarters(box){
  box.innerHTML = `
    <div class="funnel__hint">How do you want to start?</div>
    <div class="funnel__starters" id="fStarters"></div>
    <button class="funnel__explore" id="fExplore">
      <span class="e" aria-hidden="true">🧩</span>
      <span><b>All my words</b><br><small>Explore every world</small></span>
    </button>`;
  const grid = $("#fStarters");
  STARTERS.forEach(st=>{
    const b = document.createElement("button");
    b.className = "starter";
    b.style.background = st.color;
    b.setAttribute("aria-label", `Start a sentence: ${st.label}`);
    b.innerHTML = `<span class="e" aria-hidden="true">${st.emoji}</span><span class="l">${esc(st.label)}…</span>`;
    b.onclick = ()=>{
      buzz();
      FUNNEL.starter = st; FUNNEL.source = st.sources ? st.sources[0] : null; FUNNEL.done = false;
      /* a starter begins a NEW sentence — its chips become train cars */
      state.sentence = st.chips.map(c=>({...c}));
      state.sentenceModel = null;
      state.cat = FUNNEL.source || "favorites";
      const s = (typeof settingsGet==="function") ? settingsGet() : {};
      if(s.speakOnTap!==false) speak(st.label);
      funnelStep();
    };
    grid.appendChild(b);
  });
  $("#fExplore").onclick = ()=>{ buzz(); go("world"); };
  showBuddy("pollito","Tap how you want to start!");
}

/* STEP 2 — only words that fit (one tap finishes). Neutral tiles (B5),
   stable order from the live category arrays (B2), escape hatch last (B7). */
function funnelObjects(box){
  const st = FUNNEL.starter;
  const multi = st.sources && st.sources.length > 1;
  box.innerHTML = `
    <div class="funnel__crumb">
      <button class="funnel__backpill" id="fBack" aria-label="Start over">‹ ${esc(st.label)}…</button>
      <span class="funnel__crumbhint">pick one!</span>
    </div>
    ${multi ? `<div class="funnel__chips" id="fChips"></div>` : ""}
    <div class="grid funnel__grid" id="fGrid"></div>`;
  $("#fBack").onclick = ()=>{ buzz(); funnelReset(); state.sentence = []; state.sentenceModel = null; renderStrip(); funnelStep(); };

  if(multi){
    const chips = $("#fChips");
    st.sources.forEach(srcId=>{
      const c = CATEGORIES[srcId]; if(!c) return;
      const b = document.createElement("button");
      b.className = "fchip" + ((FUNNEL.source===srcId) ? " on" : "");
      b.innerHTML = `${c.emoji} ${esc(c.label)}`;
      b.onclick = ()=>{ buzz(); FUNNEL.source = srcId; state.cat = srcId; funnelStep(); };
      chips.appendChild(b);
    });
  }

  const grid = $("#fGrid");
  funnelWords().forEach(card=>{
    const t = tileEl(card, "#FFFFFF");            // B5: neutral — the symbol carries the color
    t.onclick = ()=> funnelPick(card, t);
    grid.appendChild(t);
  });
  /* B7: the funnel's only dead-end, closed — always the LAST slot */
  const esc2 = document.createElement("button");
  esc2.className = "tile funnel__else";
  esc2.innerHTML = `<span class="e" aria-hidden="true">🧩</span><span class="l">something else</span>`;
  esc2.setAttribute("aria-label","Something else — see all my words");
  esc2.onclick = ()=>{ buzz(); go("world"); };    // sentence stays on the strip; board taps continue it
  grid.appendChild(esc2);

  if(typeof piperPrewarm==="function") piperPrewarm(funnelWords().map(c=>c.label));
  showBuddy(CATEGORIES[FUNNEL.source] ? (CATEGORIES[FUNNEL.source].host||"pollito") : "pollito", "Pick one!");
}

/* the finishing tap (B4 + B3): word speaks, then the complete modeled
   sentence reads word-by-word through the train — always (it IS the
   communication), unless the caregiver chose child-triggered speak (C2). */
function funnelPick(card, el){
  if(FUNNEL.done) return;   /* a mashing child can't append runaway words or stack reads */
  buzz();
  el.classList.remove("speaking"); void el.offsetWidth; el.classList.add("speaking");
  state.sentence.push({ emoji:card.emoji, label:funnelWordText(card), img:card.img });
  /* the karaoke reader speaks these instead of raw chip labels (B3) */
  state.sentenceModel = state.sentence.map((c,i)=>
    i === state.sentence.length-1 ? funnelModelFragment(card) : c.label);
  renderStrip();
  if(typeof flyWord==="function") flyWord(card, el);
  FUNNEL.done = true;
  try{ usageLog(card.label, "sentence"); }catch(e){}
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  if(s.speakOnTap!==false) speak(funnelWordText(card));         // B4: the word first…
  /* tracked timers so navigating away (go()) cancels a pending read/step —
     never speak or paint the funnel over another screen */
  if(s.autoSpeak!==false){
    FUNNEL._speakT = setTimeout(()=> speakSentenceTrain(), s.speakOnTap!==false ? 750 : 150);  // …then the sentence
  }
  FUNNEL._stepT = setTimeout(funnelStep, reducedMotion() ? 80 : 560);
}

/* STEP 3 — you said it! */
function funnelDone(box){
  const text = state.sentence.map(c=>c.label).join(" ");
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  box.innerHTML = `
    <div class="funnel__saidwrap">
      <div class="funnel__said">
        <div class="funnel__saidmark" aria-hidden="true">💬</div>
        <div class="funnel__saidtext">&ldquo;${esc(text)}&rdquo;</div>
      </div>
      <div class="funnel__acts">
        <button class="funnel__act funnel__act--again" id="fAgain">🔊 ${s.autoSpeak===false ? "Say it!" : "Say it again"}</button>
        <button class="funnel__act" id="fPlease">🙏 please</button>
        <button class="funnel__act funnel__act--new" id="fNew">✨ New sentence</button>
      </div>
    </div>`;
  $("#fAgain").onclick = ()=>{ buzz(); speakSentenceTrain(); };
  $("#fPlease").onclick = ()=>{
    buzz();
    if(!state.sentence.some(c=>c.label==="please")){
      state.sentence.push({emoji:"🙏",label:"please"});
      if(state.sentenceModel) state.sentenceModel.push("please");
      renderStrip();
    }
    speakSentenceTrain();
    funnelStep();
  };
  $("#fNew").onclick = ()=>{ buzz(); funnelReset(); state.sentence = []; state.sentenceModel = null; renderStrip(); funnelStep(); };
  encourage();                                 // gentle, calm-gated
}
