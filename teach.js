/* ============================================================
   The Amazing Puzzle™ — TEACH MODE ("play a word game")
   A companion models a word from the child's OWN board (real
   family photos included), then invites a try. Constitution:
   - EVERY tap is honored as communication (it speaks, always)
   - nothing is ever "wrong" — no buzzers, no blocking, no score
   - one gentle re-model at most, then the round moves on
   - 3 rounds → the puzzle assembles → back to talking
   - Calm Mode: visuals only, no auto speech
   - never logged to usage (the dashboard stays communication-only)
   Hosts by specialty (Hola Pollito casting):
     Pollito models core words · Ana asks "find it!" · Benji goes
     slow & patient · Coco plays "can you copy me?".
   ============================================================ */

const TEACH = { cat:"favorites", round:0, total:3, target:null, options:[], state:"idle",
  remodeled:false, from:"talk" };

/* host lines by character — each in their own voice */
/* Every line stays communication-framed, never correctness-framed:
   cheer = "you SAID a word", other = the child's word is honored first,
   accept = any second word is welcomed and the game simply flows on. */
const TEACH_STYLE = {
  pollito: {
    intro: w=>`Let's talk together! This word is “${w}.”`,
    invite: w=>`Your turn! Can you find “${w}”?`,
    cheer: w=>`You said “${w}”! You did it!`,
    other: w=>`Nice talking! And here is “${w}.”`,
    accept: w=>`Two words! Great talking. Let's find a new one.`,
    finish: ()=>`We played with words! Let's talk more!`,
    voice:"pollito",
  },
  ana: {
    intro: w=>`Let's go! What do you see? This is “${w}!”`,
    invite: w=>`Can you find “${w}”?`,
    cheer: w=>`You said “${w}”! What a word!`,
    other: w=>`I hear you! And here is “${w}.”`,
    accept: w=>`So many words on this adventure! Onward!`,
    finish: ()=>`What an adventure! Let's explore more words!`,
    voice:"ana",
  },
  benji: {
    intro: w=>`Let's try together. This word is “${w}.”`,
    invite: w=>`Take your time. Where is “${w}”?`,
    cheer: w=>`“${w}.” It's okay to feel proud.`,
    other: w=>`That's a good word too. Here is “${w}.”`,
    accept: w=>`That's a good word too. Let's see another.`,
    finish: ()=>`We did it, nice and slow. I'll be here.`,
    voice:"benji",
  },
  coco: {
    intro: w=>`Let's sing it! “${w}, ${w}!” Sing it with me!`,
    invite: w=>`Your turn! Tap “${w}”!`,
    cheer: w=>`“${w}!” That sounds amazing!`,
    other: w=>`Ooh, I like that one! Now — “${w}!”`,
    accept: w=>`What a song of words! Here comes another!`,
    finish: ()=>`You're a word-music maker! Let's play again soon!`,
    voice:"coco",
  },
};

function teachHost(){
  const cat = CATEGORIES[TEACH.cat] || CATEGORIES.favorites;
  return CAST[cat.host || "pollito"] ? (cat.host || "pollito") : "pollito";
}
/* guarded scheduler: a beat only fires if the game is still on screen AND the
   I Need panel is closed — the host never talks over an urgent-words moment,
   and leaving mid-round can never clobber the talking board with stale DOM */
function tmLater(fn, ms){
  if(TEACH._timer) clearTimeout(TEACH._timer);
  TEACH._timer = setTimeout(()=>{
    TEACH._timer = null;
    const needOpen = !document.getElementById("needOverlay").hidden;
    if(document.body.classList.contains("teach") && !needOpen) fn();
  }, ms);
}
function teachSay(text){
  const bubble = document.getElementById("tmSay");
  if(bubble) bubble.textContent = text;
  if(calmOK()) speak(text, TEACH_STYLE[teachHost()].voice);   // Calm Mode: text only
}
function teachPick(){
  /* sample 3 cards from the child's live category (their real board),
     deduped by SPOKEN identity so two "Mom" cards can't both appear */
  const cards = (CATEGORIES[TEACH.cat] || CATEGORIES.favorites).cards.slice();
  for(let i=cards.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [cards[i],cards[j]]=[cards[j],cards[i]]; }
  const seen = new Set();
  const uniq = cards.filter(c=>{
    const k = (c.speak||c.label||"").toLowerCase();
    if(seen.has(k)) return false; seen.add(k); return true;
  });
  TEACH.options = uniq.slice(0,3);
  if(TEACH.options.length<2){ return false; }                 // tiny category → no game
  TEACH.target = TEACH.options[Math.floor(Math.random()*TEACH.options.length)];
  return true;
}

/* ---------------- entry ---------------- */
function startTeach(catId, from){
  const s = (typeof settingsGet==="function") ? settingsGet() : {};
  if(s.games===false) return;                                  // caregiver switched games off
  TEACH.cat = CATEGORIES[catId] ? catId : "favorites";
  TEACH.from = from || "talk";
  TEACH.round = 0; TEACH.remodeled = false;
  if(!teachPick()){ go(TEACH.from); return; }
  document.body.classList.add("teach");
  teachRound("model");
}
function endTeach(){
  document.body.classList.remove("teach");
  /* return to the exact place the child left — sameness is safety */
  if(TEACH.from === "stars") go("stars");
  else if(TEACH.from === "category") go("category", TEACH.cat);
  else go("talk", TEACH.cat!=="favorites" ? TEACH.cat : undefined);
}
/* entry points only render when a real game is possible */
function teachPlayable(catId){
  const cards = (CATEGORIES[catId] || CATEGORIES.favorites).cards || [];
  const seen = new Set();
  cards.forEach(c=>seen.add((c.speak||c.label||"").toLowerCase()));
  return seen.size >= 2;
}

/* ---------------- a round ---------------- */
function teachFace(card, big){
  return card.img
    ? `<span class="ph"><img src="${esc(card.img)}" alt=""></span>`
    : `<span class="e">${esc(card.emoji||"⭐")}</span>`;
}
function teachMount(inner){
  const host = CAST[teachHost()];
  screenEl.innerHTML = `
    <div class="tm">
      <button class="tm__leave" id="tmLeave" aria-label="Leave the game and go back to talking">‹ All done</button>
      <button class="need-btn tm__need" id="tmNeed" aria-label="I need words"><span class="sos">SOS</span> I Need</button>
      <div class="tm__pieces" aria-label="Round ${Math.min(TEACH.round+1,TEACH.total)} of ${TEACH.total}" role="img">
        ${Array.from({length:TEACH.total},(_,i)=>`<i class="${i<TEACH.round?"on":""}">🧩</i>`).join("")}
      </div>
      <div class="tm__host" style="background:${host.color}" aria-hidden="true">${host.emoji}</div>
      <div class="tm__say" id="tmSay" aria-live="polite"></div>
      ${inner}
    </div>`;
  document.getElementById("tmLeave").onclick = ()=>{ buzz(); endTeach(); };
  document.getElementById("tmNeed").onclick = ()=>{
    buzz();
    /* freeze the game — the host goes silent while urgent words are up */
    if(TEACH._timer){ clearTimeout(TEACH._timer); TEACH._timer = null; }
    try{ speechSynthesis && speechSynthesis.cancel(); }catch(e){}
    openNeeds();
  };
}
/* resume cleanly after the I Need panel closes: re-model the current word */
function teachResume(){
  if(!document.body.classList.contains("teach")) return;
  if(TEACH.round >= TEACH.total){ teachDone(); return; }
  teachRound("model");
}
function teachRound(stage){
  const style = TEACH_STYLE[teachHost()];
  const t = TEACH.target;
  const word = t.speak || t.label;

  if(stage==="model"){
    teachMount(`
      <button class="tm__model pulse" id="tmModel" aria-label="Hear “${esc(t.label)}” again">
        ${teachFace(t)}<span class="l">${esc(t.label)}</span>
      </button>`);
    document.getElementById("tmModel").onclick = ()=>{ buzz(); speak(word, style.voice); };
    teachSay(style.intro(t.label));
    /* modeling beat: say it, let it land, then invite (longer under Benji's patience) */
    const beat = teachHost()==="benji" ? 3400 : 2600;
    tmLater(()=> teachRound("invite"), beat);
    return;
  }

  if(stage==="invite"){
    TEACH.state = "inviting";                                  // answers open
    teachMount(`<div class="tm__choices" id="tmChoices"></div>`);
    const wrap = document.getElementById("tmChoices");
    wrap.style.gridTemplateColumns = `repeat(${TEACH.options.length},1fr)`;   // 2 cards = 2 columns, centered
    TEACH.options.forEach(card=>{
      const b = document.createElement("button");
      b.className = "tile";
      b.style.background = PASTEL[(TEACH.options.indexOf(card)+TEACH.round) % PASTEL.length];
      b.setAttribute("aria-label", card.label);
      b.innerHTML = teachFace(card) + `<span class="l">${esc(card.label)}</span>`;
      b.onclick = ()=> teachAnswer(card, b);
      wrap.appendChild(b);
    });
    teachSay(style.invite(t.label));
    return;
  }
}
function teachAnswer(card, el){
  buzz();
  el.classList.remove("speaking"); void el.offsetWidth; el.classList.add("speaking");
  const style = TEACH_STYLE[teachHost()];
  const t = TEACH.target;
  const tapped = card.speak || card.label;
  speak(tapped, style.voice);                                  // EVERY tap is real communication
  /* one answer per round: a fast second tap still SPEAKS (above — always),
     but can't cancel the pending beat or double-advance the round */
  if(TEACH.state === "answered") return;
  TEACH.state = "answered";

  if(card===t){
    TEACH.round++; TEACH.remodeled = false;
    tmLater(()=>{
      if(TEACH.round >= TEACH.total) return teachDone();
      if(calmOK()) speak(style.cheer(t.label), style.voice);
      const bubble = document.getElementById("tmSay"); if(bubble) bubble.textContent = style.cheer(t.label);
      tmLater(()=>{ teachPick(); teachRound("model"); }, 1700);
    }, 700);
    return;
  }
  /* a different word: honor it, re-model ONCE, then accept anything and move on */
  if(!TEACH.remodeled){
    TEACH.remodeled = true;
    tmLater(()=>{
      const bubble = document.getElementById("tmSay"); if(bubble) bubble.textContent = style.other(t.label);
      if(calmOK()) speak(style.other(t.label), style.voice);
      tmLater(()=> teachRound("model"), 1900);
    }, 800);
  } else {
    TEACH.round++; TEACH.remodeled = false;                    // never a wall — the game flows on
    tmLater(()=>{
      /* the second word is WELCOMED too — no rung of the ladder is silence */
      const bubble = document.getElementById("tmSay"); if(bubble) bubble.textContent = style.accept(t.label);
      if(calmOK()) speak(style.accept(t.label), style.voice);
      tmLater(()=>{
        if(TEACH.round >= TEACH.total) return teachDone();
        teachPick(); teachRound("model");
      }, 1800);
    }, 800);
  }
}
function teachDone(){
  const style = TEACH_STYLE[teachHost()];
  const host = CAST[teachHost()];
  TEACH.round = TEACH.total;
  teachMount(`
    <div class="tm__finish" aria-hidden="true">🧩✨</div>
    <div class="tm__big">We played with words!</div>
    <div class="tm__sub">${esc(style.finish())}</div>
    <button class="tm__again" id="tmAgain">🎲 Play again</button>
    <button class="tm__done" id="tmDone">All done — back to talking</button>`);
  teachSay(style.finish());
  document.getElementById("tmAgain").onclick = ()=>{ buzz(); TEACH.round=0; TEACH.remodeled=false; teachPick() ? teachRound("model") : endTeach(); };
  document.getElementById("tmDone").onclick = ()=>{ buzz(); endTeach(); };
}
