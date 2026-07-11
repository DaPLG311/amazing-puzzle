/* ============================================================
   The Amazing Puzzle™ — GROWN-UP ZONE (screens 2.1–2.8)
   2.1 PIN gate (create-on-first-use, gentle shake, auto-relock)
   2.2 Grown-Up Hub · 2.3 Vocabulary & Photos editor (overlay,
   core/emergency guardrails, photo upload) · 2.5 Settings &
   Access (every control real) · 2.6 Usage Summary (descriptive
   only) · 2.7 Offline & Backup (honest: export/restore/word
   list) · 2.8 Profiles (multi-child + caregivers).
   Faithful to the Canva designs; honesty gates applied (no fake
   iCloud/FaceID/encryption claims). Everything on-device.
   ============================================================ */

const GZ = { unlocked:false, pinBuf:"", pinStage:"enter", pinFirst:"", after:null,
  pinMsg:"", fails:0, lastTouch:0 };

/* ---------- idle auto-relock (child grabs the tablet mid-edit) ---------- */
const GZ_IDLE_MS = 150000;   // 2.5 minutes of stillness closes the door
document.addEventListener("pointerdown", ()=>{ if(document.body.classList.contains("gz")) GZ.lastTouch = Date.now(); }, true);
setInterval(()=>{
  if(GZ.unlocked && document.body.classList.contains("gz") && Date.now()-GZ.lastTouch > GZ_IDLE_MS) gzExit();
}, 15000);
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden && GZ.unlocked) gzRelock();   // tablet sleeps / app switches → locked
});

/* ---------- settings switchboard (body[data-*]) ---------- */
function applySettings(){
  const s = settingsGet();
  const b = document.body;
  b.setAttribute("data-grid", String(s.grid||3));
  b.setAttribute("data-text", s.text||"standard");
  if(s.contrast) b.setAttribute("data-contrast","1"); else b.removeAttribute("data-contrast");
  if(s.motion) b.setAttribute("data-motion","1"); else b.removeAttribute("data-motion");
  if(s.calm) b.setAttribute("data-calm","1"); else b.removeAttribute("data-calm");
}

/* ---------- lock plumbing ---------- */
function gzRelock(){ GZ.unlocked = false; }
function gzEnter(){                       // called by the ⚙/Grown-Up buttons
  GZ.after = null; GZ.pinMsg = "";        // never inherit a stale target/message
  GZ.lastTouch = Date.now();
  if(GZ.unlocked) return gzGo("hub");
  GZ.pinStage = pinGet() ? "enter" : "create";
  GZ.pinBuf = ""; GZ.pinFirst = "";
  gzGo("pin");
}

/* ---------- tiny router inside the zone ---------- */
function gzGo(screen){
  document.body.classList.remove("onboarding");
  document.body.classList.add("gz");
  const map = { pin:gzPin, hub:gzHub, vocab:gzVocab, settings:gzSettings, usage:gzUsage, backup:gzBackup, profiles:gzProfiles };
  (map[screen]||gzHub)();
}
function gzExit(){                        // back to the child's world (auto-relock)
  gzRelock();
  document.body.classList.remove("gz");
  go("home");
}
function gzMount(html){ screenEl.innerHTML = `<div class="gz">${html}</div>`; }
function gzHead(title, sub){
  return `<button class="gz__back" id="gzBack">‹ Back</button>
    <div class="gz__title">${title}</div>${sub?`<div class="gz__sub">${sub}</div>`:""}`;
}
function gzWireBack(to){ const b=document.getElementById("gzBack"); if(b) b.onclick=()=>{ buzz(); to?gzGo(to):gzExit(); }; }

/* ============ 2.1 PIN GATE ============ */
function gzPin(){
  const stage = GZ.pinStage;
  const titles = { enter:"Grown-Up Zone", create:"Create a grown-up PIN", confirm:"Type it once more" };
  const subs = {
    enter:"This keeps setup out of little hands.",
    create:"Pick 4 digits only grown-ups know.",
    confirm:"Just to make sure.",
  };
  gzMount(`
    <div class="gz pin" style="position:static;padding:0" data-shake="0" id="pinWrap">
      <button class="pin__cancel" id="pinCancel" aria-label="Cancel and go back">✕</button>
      <div class="pin__lock" aria-hidden="true">🔒</div>
      <div class="pin__title">${titles[stage]}</div>
      <div class="pin__sub">${subs[stage]}</div>
      <div class="pin__dots" id="pinDots" role="img" aria-label="PIN: 0 of 4 digits">${[0,1,2,3].map(()=>"<i></i>").join("")}</div>
      <div class="pin__pad" id="pinPad"></div>
      <div class="pin__hint" id="pinHint" aria-live="polite">${esc(GZ.pinMsg||"")}</div>
      <div class="pin__face">Face ID arrives with the app-store build</div>
      ${stage==="enter" && GZ.fails>=5 ? `<button class="pin__forgot" id="pinForgot">Forgot the PIN? Press and hold here to reset it.</button>` : ""}
      <div class="pin__chick"><span class="c" aria-hidden="true">🐤</span>Setup time!</div>
    </div>`);
  GZ.pinMsg = "";
  const pad = document.getElementById("pinPad");
  ["1","2","3","4","5","6","7","8","9","",  "0","⌫"].forEach(k=>{
    const b = document.createElement("button");
    b.className = "pin__key" + (k===""?" pin__key--ghost":"") + (k==="⌫"?" pin__key--del":"");
    b.textContent = k; if(k==="⌫") b.setAttribute("aria-label","Delete digit");
    if(k!=="") b.onclick = ()=> pinKey(k);
    pad.appendChild(b);
  });
  document.getElementById("pinCancel").onclick = ()=>{
    buzz(); GZ.pinBuf = "";
    if(GZ.unlocked){ const t = GZ.after || "hub"; GZ.after = null; gzGo(t); }   // e.g. cancel Change PIN → back to Settings
    else { GZ.after = null; gzExit(); }
  };
  /* Forgot-PIN recovery: deliberate 3-second hold. Resets ONLY the PIN —
     every word, photo, and setting stays exactly as it was. */
  const forgot = document.getElementById("pinForgot");
  if(forgot){
    let hold = null;
    const start = ()=>{ forgot.classList.add("holding");
      hold = setTimeout(()=>{
        pinSet(""); localStorage.removeItem("ap.pin");
        GZ.fails = 0; GZ.pinStage = "create"; GZ.pinBuf = ""; GZ.pinFirst = "";
        GZ.pinMsg = "PIN reset. Pick a new one — words and photos are untouched.";
        gzGo("pin");
      }, 3000); };
    const stop = ()=>{ forgot.classList.remove("holding"); if(hold){ clearTimeout(hold); hold = null; } };
    forgot.addEventListener("pointerdown", start);
    ["pointerup","pointerleave","pointercancel"].forEach(ev=> forgot.addEventListener(ev, stop));
  }
  pinDotsDraw();
}
function pinDotsDraw(){
  const wrap = document.getElementById("pinDots");
  if(!wrap) return;
  wrap.setAttribute("aria-label", `PIN: ${GZ.pinBuf.length} of 4 digits`);
  wrap.querySelectorAll("i").forEach((d,i)=> d.classList.toggle("on", i < GZ.pinBuf.length));
}
function pinHint(msg){
  const h = document.getElementById("pinHint");
  if(h) h.textContent = msg;    // aria-live announces it — feedback survives Reduce Motion
}
function pinKey(k){
  buzz();
  if(k==="⌫") GZ.pinBuf = GZ.pinBuf.slice(0,-1);
  else if(GZ.pinBuf.length<4) GZ.pinBuf += k;
  pinDotsDraw();
  if(GZ.pinBuf.length===4) setTimeout(pinCheck, 120);
}
function pinCheck(){
  const buf = GZ.pinBuf;
  if(GZ.pinStage==="create"){
    GZ.pinFirst = buf; GZ.pinBuf=""; GZ.pinStage="confirm"; gzGo("pin"); return;
  }
  if(GZ.pinStage==="confirm"){
    if(buf===GZ.pinFirst){ pinSet(buf); GZ.unlocked = true; GZ.pinBuf=""; GZ.fails = 0; const t = GZ.after||"hub"; GZ.after=null; gzGo(t); }
    else { GZ.pinBuf=""; GZ.pinStage="create"; GZ.pinMsg = "Those didn't match — let's try again."; pinShake(); setTimeout(()=>gzGo("pin"), 350); }
    return;
  }
  // enter
  if(buf===pinGet()){ GZ.unlocked = true; GZ.pinBuf=""; GZ.fails = 0; GZ.lastTouch = Date.now(); const t = GZ.after||"hub"; GZ.after=null; gzGo(t); }
  else {
    GZ.pinBuf=""; GZ.fails++;
    pinShake(); pinDotsDraw();
    pinHint("That's not it — try again.");
    if(GZ.fails===5) gzGo("pin");        // re-render so the forgot-PIN row appears
  }
}
function pinShake(){
  const w = document.getElementById("pinWrap");
  if(w){ w.setAttribute("data-shake","1"); setTimeout(()=>w.setAttribute("data-shake","0"), 350); }
}

/* ============ 2.2 GROWN-UP HUB ============ */
function gzHub(){
  const p = profileGet() || {name:"your child", avatar:"🧒"};
  gzMount(`
    <div class="hub__child">
      <div class="hub__avatar">${esc(p.avatar||"🧒")}</div>
      <div class="hub__who">
        <div class="hub__name">${esc(p.name)}</div>
        <div class="hub__meta">Active child</div>
      </div>
      <button class="hub__switch" id="hubSwitch">Switch</button>
    </div>
    <div class="gz__title" style="margin:0 0 18px">Grown-Up Hub</div>
    <div class="hub__menu">
      <button class="hubcard" style="--edge:#6CCBFF" data-to="vocab">
        <span class="hubcard__icon" aria-hidden="true">🖼️</span>
        <span><span class="hubcard__t">Vocabulary &amp; Photos</span><br>
        <span class="hubcard__s">Add words, upload family photos, arrange the board</span></span>
      </button>
      <button class="hubcard" style="--edge:#70E1C8" data-to="settings">
        <span class="hubcard__icon" aria-hidden="true">⚙️</span>
        <span><span class="hubcard__t">Settings &amp; Access</span><br>
        <span class="hubcard__s">Voice, text size, contrast, grid, PIN, privacy</span></span>
      </button>
      <button class="hubcard" style="--edge:#BFA9FF" data-to="usage">
        <span class="hubcard__icon" aria-hidden="true">📊</span>
        <span><span class="hubcard__t">Usage Summary</span><br>
        <span class="hubcard__s">See which words get used — gentle patterns only</span></span>
      </button>
      <button class="hubcard" style="--edge:#FFD966" data-to="backup">
        <span class="hubcard__icon" aria-hidden="true">💾</span>
        <span><span class="hubcard__t">Offline &amp; Backup</span><br>
        <span class="hubcard__s">Save or restore everything on this device</span></span>
      </button>
    </div>
    <div class="hub__foot">Returning to the board re-locks the Grown-Up Zone automatically.</div>
    <button class="gzpill gzpill--soft" id="hubDone" style="margin-top:16px">Done — back to ${esc(p.name)}</button>
    <div class="hub__chick"><span class="c" aria-hidden="true">🐤</span></div>`);
  document.querySelectorAll(".hubcard").forEach(c=> c.onclick = ()=>{ buzz(); gzGo(c.dataset.to); });
  document.getElementById("hubSwitch").onclick = ()=>{ buzz(); gzGo("profiles"); };
  document.getElementById("hubDone").onclick = ()=>{ buzz(); gzExit(); };
}

/* ============ 2.3 VOCABULARY & PHOTOS ============ */
const VED = { cat:"favorites" };
/* Protection is an explicit flag — a parent adding an ordinary word that happens
   to be called "Stop" or "Mom" must NOT get a locked row (the emergency panel
   always carries the protected copies). */
function vocabIsProtected(card){ return !!(card && card.core); }
/* live cards → the editable overlay (WYSIWYG). NOTE: profileGet() parses a
   FRESH copy each call, so the caller fetches the profile ONCE and passes it
   here — materialize + edit + commit must all touch the same object. */
function vocabOverlayCards(p, catId){
  if(!p) return null;
  p.vocab = p.vocab || {cats:{}, needs:null};
  p.vocab.cats = p.vocab.cats || {};
  if(!p.vocab.cats[catId]) p.vocab.cats[catId] = (CATEGORIES[catId].cards||[]).map(c=>({...c}));
  return p.vocab.cats[catId];
}
function vocabCommit(p){
  const ok = profileSave(p);
  applyProfile();                           // the child board reflects the edit immediately
  return ok;
}
function gzVocab(){
  /* THE editor rule (QA blocker fix): the rows you see ARE the overlay array.
     Materialize it from the live board on first view, persist, and re-apply —
     display index and edit index can never drift apart again. */
  const pv = profileGet();
  let list = [];
  if(pv){
    const fresh = !(pv.vocab && pv.vocab.cats && pv.vocab.cats[VED.cat]);
    list = vocabOverlayCards(pv, VED.cat);
    if(fresh){ profileSave(pv); applyProfile(); }
  }
  const cat = CATEGORIES[VED.cat] || CATEGORIES.favorites;
  gzMount(`
    ${gzHead("Vocabulary & Photos","Add words, upload family photos, arrange the board")}
    <div class="ved__chips" id="vedChips"></div>
    <div id="vedRows"></div>
    <button class="ved__add" id="vedAdd">+ Add a word or photo</button>
    <div class="gzcard ved__emg">
      <div class="gzrow" style="border:none; flex-direction:column; align-items:flex-start;">
        <div class="ved__emgtitle">🔒 Emergency Words <span style="color:var(--muted);font-weight:600">(always on, fixed position)</span></div>
        <div class="ved__emglist" style="font-size:12.5px">You can update their pictures and wording — they can never be removed or moved.</div>
      </div>
      <div id="vedNeeds"></div>
    </div>`);
  gzWireBack("hub");
  const chips = document.getElementById("vedChips");
  Object.entries(CATEGORIES).forEach(([id,c])=>{
    const b = document.createElement("button");
    b.className = "ved__chip" + (id===VED.cat?" on":"");
    b.textContent = c.label;
    b.onclick = ()=>{ buzz(); VED.cat = id; gzVocab(); };
    chips.appendChild(b);
  });
  const rows = document.getElementById("vedRows");
  list.forEach((card, idx)=>{
    const prot = vocabIsProtected(card);
    const row = document.createElement("div");
    row.className = "vrow";
    row.innerHTML = `
      <span class="vrow__lead" aria-hidden="true">${prot?"🔒":"⭐"}</span>
      <span class="vrow__face">${mediaURL(card.img)?`<img src="${esc(mediaURL(card.img))}" alt="">`:esc(card.emoji||"🖼️")}</span>
      <span class="vrow__body">
        <span class="vrow__label">${esc(card.label)}</span>
        ${prot?`<div class="vrow__core">🔒 Core word — always available</div>`:""}
      </span>
      <button class="vrow__edit" aria-label="Edit ${esc(card.label)}">Edit</button>
      <span class="vrow__move">
        <button ${prot||idx===0?"disabled":""} aria-label="Move ${esc(card.label)} up">▲</button>
        <button ${prot||idx===list.length-1?"disabled":""} aria-label="Move ${esc(card.label)} down">▼</button>
      </span>`;
    row.querySelector(".vrow__edit").onclick = ()=>{ buzz(); vedSheet(card, idx, false); };
    const [up,down] = row.querySelectorAll(".vrow__move button");
    up.onclick = ()=> vedMove(idx,-1);
    down.onclick = ()=> vedMove(idx,1);
    rows.appendChild(row);
  });
  document.getElementById("vedAdd").onclick = ()=>{ buzz(); vedSheet(null, -1, false); };
  /* the nine emergency words — content-editable (picture/wording), never removable/movable */
  const needsWrap = document.getElementById("vedNeeds");
  NEEDS.forEach((n, i)=>{
    const row = document.createElement("div");
    row.className = "vrow"; row.style.cssText = "border:none;box-shadow:none;margin:0;padding:8px 0;";
    row.innerHTML = `
      <span class="vrow__lead" aria-hidden="true">🔒</span>
      <span class="vrow__face">${n.img?`<img src="${n.img}" alt="">`:(n.emoji||"🆘")}</span>
      <span class="vrow__body"><span class="vrow__label">${esc(n.label)}</span></span>
      <button class="vrow__edit" aria-label="Edit emergency word ${esc(n.label)}">Edit</button>`;
    row.querySelector(".vrow__edit").onclick = ()=>{ buzz(); vedSheet(n, i, true); };
    needsWrap.appendChild(row);
  });
}
function vedMove(idx, dir){
  buzz();
  const p = profileGet(); const list = vocabOverlayCards(p, VED.cat);
  const j = idx+dir;
  if(j<0 || j>=list.length) return;
  if(vocabIsProtected(list[idx]) || vocabIsProtected(list[j])) return;   // core words stay put
  [list[idx], list[j]] = [list[j], list[idx]];
  vocabCommit(p); gzVocab();
}
/* --- the add/edit sheet (in-app, calm — no native dialogs) --- */
function vedSheet(card, idx, isNeed){
  const editing = !!card;
  const prot = editing && vocabIsProtected(card);
  const d = { label:card?card.label:"", speak:card?(card.speak||""):"", emoji:card?(card.emoji||"⭐"):"⭐", img:card?card.img||null:null };
  const sheet = document.createElement("div");
  sheet.className = "vsheet";
  sheet.innerHTML = `
    <div class="vsheet__panel" role="dialog" aria-modal="true" aria-label="${editing?"Edit word":"Add a word"}">
      <div class="vsheet__title">${editing?(prot?"Edit core word":"Edit word"):"Add a word"}</div>
      ${prot?`<div class="vsheet__sub">This word stays in place and can't be removed — you can change its picture and wording.</div>`:""}
      <div class="vsheet__preview" id="vsPrev"></div>
      <input class="vsheet__field" id="vsLabel" placeholder="Word on the button (e.g. Grandma)" aria-label="Word" maxlength="24" value="${esc(d.label)}">
      <input class="vsheet__field" id="vsSpeak" placeholder="Spoken words (blank = say the word)" aria-label="Spoken words" maxlength="80" value="${esc(d.speak)}">
      <input class="vsheet__field" id="vsEmoji" placeholder="Emoji (e.g. ⭐)" aria-label="Emoji" maxlength="4" value="${esc(d.emoji)}">
      <div class="vsheet__mediarow">
        <button class="vsheet__media" id="vsPhoto">📷 ${d.img?"Change photo":"Add photo"}</button>
        ${""}<button class="vsheet__media" id="vsClear" ${d.img?"":"hidden"}>Use emoji instead</button>
      </div>
      <input type="file" accept="image/*" hidden id="vsFile">
      <div class="vsheet__status" id="vsStatus"></div>
      <div class="vsheet__actions">
        <button class="vsheet__btn vsheet__btn--cancel" id="vsCancel">Cancel</button>
        <button class="vsheet__btn vsheet__btn--save" id="vsSave">${editing?"Save":"Add word"}</button>
      </div>
      ${editing && !prot ? `<button class="vsheet__remove" id="vsRemove">Remove from the board</button>` : ""}
      <div class="vsheet__note">Photos are re-saved on this device with location data removed. Nothing is uploaded.</div>
    </div>`;
  document.body.appendChild(sheet);
  setTimeout(()=>{ try{ sheet.querySelector("#vsLabel").focus(); }catch(e){} }, 60);
  const prev = sheet.querySelector("#vsPrev");
  function drawPrev(){ const src = (typeof mediaURL==="function")?mediaURL(d.img):d.img;
    prev.innerHTML = src ? `<img src="${esc(src)}" alt="">` : esc(d.emoji||"⭐"); }
  drawPrev();
  sheet.querySelector("#vsLabel").oninput = e=>{ d.label = e.target.value; };
  sheet.querySelector("#vsSpeak").oninput = e=>{ d.speak = e.target.value; };
  sheet.querySelector("#vsEmoji").oninput = e=>{ d.emoji = e.target.value; drawPrev(); };
  const file = sheet.querySelector("#vsFile");
  sheet.querySelector("#vsPhoto").onclick = ()=>{ buzz(); file.value = ""; file.click(); };  // same file twice still fires
  const clearBtn = sheet.querySelector("#vsClear");
  clearBtn.onclick = ()=>{ buzz(); d.img = null; clearBtn.hidden = true; drawPrev(); };
  file.onchange = ()=>{
    sheet.querySelector("#vsStatus").textContent = "Processing photo…";
    obProcessPhoto(file.files[0], (dataURL, err)=>{
      const st = sheet.querySelector("#vsStatus");
      if(err){ st.textContent = err; return; }
      d.img = dataURL; clearBtn.hidden = false; st.textContent = "Photo added ✓"; drawPrev();
    });
  };
  function close(){ sheet.remove(); }
  sheet.querySelector("#vsCancel").onclick = ()=>{ buzz(); close(); };
  sheet.onclick = e=>{ if(e.target===sheet) close(); };
  sheet.querySelector("#vsSave").onclick = async ()=>{
    buzz();
    const label = (d.label||"").trim();
    if(!label && !d.img){ sheet.querySelector("#vsStatus").textContent = "Give the button a word or a picture."; return; }
    if(typeof mediaStore==="function" && typeof d.img==="string" && d.img.startsWith("data:")){
      d.img = await mediaStore(d.img, "card");            // big pixels live in IndexedDB
    }
    const p = profileGet();
    if(isNeed){
      p.vocab = p.vocab || {cats:{},needs:null};
      if(!p.vocab.needs) p.vocab.needs = NEEDS.map(n=>({...n}));
      const t = p.vocab.needs[idx];
      t.label = label || t.label; t.speak = (d.speak||"").trim(); t.emoji = d.emoji; if(d.img) t.img = d.img; else delete t.img;
    } else {
      const list = vocabOverlayCards(p, VED.cat);
      const item = { label: label || "(picture)", emoji: d.emoji || "⭐" };
      if((d.speak||"").trim()) item.speak = d.speak.trim();
      if(d.img) item.img = d.img;
      if(editing){
        if(card.core) item.core = true;
        list[idx] = Object.assign({}, list[idx], item);
        if(!d.img) delete list[idx].img;
        if(!(d.speak||"").trim()) delete list[idx].speak;   // clearing "spoken words" sticks
      }
      else list.push(item);
    }
    const ok = vocabCommit(p);
    close(); gzVocab();
    if(!ok) gzToastQuota();
  };
  const rm = sheet.querySelector("#vsRemove");
  if(rm) rm.onclick = ()=>{
    buzz();
    if(rm.dataset.arm!=="1"){ rm.dataset.arm="1"; rm.textContent = "Tap again to remove"; return; }
    const p2 = profileGet(); const list = vocabOverlayCards(p2, VED.cat);
    list.splice(idx,1); vocabCommit(p2); close(); gzVocab();
  };
}
function gzToastQuota(){
  const n = document.createElement("div");
  n.className = "gznote gznote--warn";
  n.style.cssText = "position:fixed;left:20px;right:20px;bottom:24px;z-index:60";
  n.textContent = "Couldn't save — this device is out of space. Try removing a photo or two.";
  document.body.appendChild(n); setTimeout(()=>n.remove(), 4200);
}

/* ============ 2.5 SETTINGS & ACCESS ============ */
const GZ_CYCLES = {
  rate:   { order:["slower","normal","faster"], label:{slower:"Slower", normal:"Normal", faster:"Faster"} },
  mode:   { order:["single","phrase"], label:{single:"Single word", phrase:"Build a phrase"} },
  grid:   { order:[2,3,4], label:{2:"2 across",3:"3 across",4:"4 across"} },
  text:   { order:["standard","large","xlarge"], label:{standard:"Standard", large:"Large", xlarge:"Extra large"} },
};
function gzSettings(){
  const s = settingsGet();
  const CYC_NAMES = { rate:"Speed", mode:"Sentence mode", grid:"Button grid size", text:"Text size" };
  const cyc = (key)=>`<button class="gzcycle" data-cyc="${key}" aria-label="${CYC_NAMES[key]}: ${GZ_CYCLES[key].label[s[key]]} — tap to change">${GZ_CYCLES[key].label[s[key]]}</button>`;
  const sw  = (key,human,on)=>`<label class="gzswitch"><input type="checkbox" data-sw="${key}" ${on?"checked":""} aria-label="${human}"><span class="tr"><span class="th"></span></span></label>`;
  gzMount(`
    ${gzHead("Settings & Access")}
    <div class="gzsection">🔊 Voice</div>
    <div class="gzcard">
      <div class="gzrow"><span class="k">Child's voice</span><button class="gzcycle" id="setChildVoice"></button></div>
      <div class="gzrow"><span class="k">Speed</span>${cyc("rate")}</div>
      <div class="gzrow"><span class="k">Speak on tap</span>${sw("speakOnTap","Speak on tap",s.speakOnTap)}</div>
      <button class="gzrow" id="setHear"><span class="k">Hear the voice</span><span class="v">Preview →</span></button>
      <button class="gzrow" id="setPiper"><span class="k">Natural voice</span><span class="v" id="piperVal"></span></button>
    </div>
    <div class="gznote" id="piperNote" style="display:none"></div>
    <div class="gzsection">💬 Sentence Level</div>
    <div class="gzcard">
      <div class="gzrow"><span class="k">Mode</span>${cyc("mode")}</div>
    </div>
    <div class="gzsection">🖥️ Display &amp; Access</div>
    <div class="gzcard">
      <div class="gzrow"><span class="k">Button grid size</span>${cyc("grid")}</div>
      <div class="gzrow"><span class="k">Text size</span>${cyc("text")}</div>
      <div class="gzrow"><span class="k">High contrast</span>${sw("contrast","High contrast",s.contrast)}</div>
      <div class="gzrow"><span class="k">Reduce motion</span>${sw("motion","Reduce motion",s.motion)}</div>
      <div class="gzrow"><span class="k">Vibration on tap</span>${sw("vibration","Vibration on tap",s.vibration)}</div>
      <div class="gzrow"><span class="k">Calm Mode</span>${sw("calm","Calm Mode",s.calm)}</div>
      <div class="gzrow"><span class="k">Word games with friends</span>${sw("games","Word games with friends",s.games)}</div>
    </div>
    <div class="gzsection">🔐 Caregiver Access</div>
    <div class="gzcard">
      <button class="gzrow" id="setPin"><span class="k">Change PIN</span><span class="v">→</span></button>
    </div>
    <div class="gzsection">🛡️ Privacy</div>
    <div class="gznote">All data stays on this device. Nothing is uploaded. No accounts, no tracking, no diagnosis.</div>`);
  gzWireBack("hub");
  document.querySelectorAll("[data-cyc]").forEach(b=>{
    b.onclick = ()=>{
      buzz();
      const key = b.dataset.cyc, c = GZ_CYCLES[key], cur = settingsGet()[key];
      const next = c.order[(c.order.indexOf(cur)+1) % c.order.length];
      settingsSet({ [key]: next });
      b.textContent = c.label[next];
      b.setAttribute("aria-label", `${CYC_NAMES[key]}: ${c.label[next]} — tap to change`);
    };
  });
  document.querySelectorAll("[data-sw]").forEach(i=>{
    i.onchange = ()=>{ buzz(); settingsSet({ [i.dataset.sw]: i.checked }); };
  });
  document.getElementById("setHear").onclick = ()=>{
    buzz();
    const p = profileGet();
    speak(`Hola ${p&&p.name?p.name:"friend"}! This is my voice.`, p?p.voice:"sunny");
  };

  /* ---- Child's voice (Sunny/River/Spark — the voice that represents them) ---- */
  const CV = { order:["sunny","river","spark"], label:{sunny:"Sunny · bright", river:"River · calm", spark:"Spark · energetic"} };
  const cvBtn = document.getElementById("setChildVoice");
  function cvDraw(){
    const p = profileGet();
    const v = (p && p.voice) || "sunny";
    cvBtn.textContent = CV.label[v] || v;
    cvBtn.setAttribute("aria-label", `Child's voice: ${CV.label[v]} — tap to change`);
  }
  cvDraw();
  cvBtn.onclick = ()=>{
    buzz();
    const p = profileGet(); if(!p) return;
    const next = CV.order[(CV.order.indexOf(p.voice||"sunny")+1) % CV.order.length];
    p.voice = next; profileSave(p); applyProfile();
    cvDraw();
    speak(`Hi! I'm ${VOICES[next].name}.`, next);
  };

  /* ---- Natural voice (Piper) — one-time caregiver install ----
     Live node lookups everywhere: install continues across screen re-entries. */
  function pEls(){ return { row:document.getElementById("setPiper"), val:document.getElementById("piperVal"), note:document.getElementById("piperNote") }; }
  function pDraw(){
    const {row,val,note} = pEls(); if(!row) return;
    if(typeof PIPER === "undefined"){ row.style.display="none"; return; }
    note.style.display = "block";
    if(PIPER.status==="installing"){
      val.textContent = `Installing ${PIPER.progress||0}%`;
      note.textContent = "Downloading once (about 20 MB). The words your child taps are never sent anywhere — the voice is made on this device.";
    } else if(piperInstalled() && PIPER.status==="ready"){
      val.textContent = "Ready ✓";
      note.textContent = "The natural voice lives on this device. Words the child sees are warmed up quietly; anything else uses the built-in voice instantly — talking never waits.";
    } else if(piperInstalled() && PIPER.status==="stale"){
      val.textContent = "Needs re-download →";
      note.textContent = "The device cleared the downloaded voice to free space. Tap to download it again (about 20 MB) — the built-in voice is doing the talking meanwhile.";
    } else if(piperInstalled()){   // error / couldn't wake
      val.textContent = "Couldn't wake";
      note.textContent = "The natural voice couldn't start this time (it may need the internet to wake up). The built-in voice is doing the talking — nothing is lost.";
    } else {
      val.textContent = "Not installed →";
      note.textContent = "A warmer, more natural voice for your child. One-time download (about 20 MB, needs internet once). Talking never depends on it.";
    }
  }
  pDraw();
  pEls().row.onclick = ()=>{
    buzz();
    if(typeof PIPER === "undefined") return;
    if(PIPER.status==="installing") return;
    const {row,val,note} = pEls();
    if(piperInstalled() && PIPER.status==="ready"){
      if(row.dataset.arm!=="1"){ row.dataset.arm="1"; val.textContent = "Tap again to remove"; return; }
      row.dataset.arm=""; piperRemove(); pDraw(); return;
    }
    /* fresh install OR stale re-download — a deliberate caregiver action */
    piperInstall(pct=>{ const e=pEls(); if(e.val) e.val.textContent = `Installing ${pct}%`; })
      .then(async ok=>{
        pDraw();
        if(ok){
          /* prove it with the ACTUAL neural voice, not webspeech */
          const e=pEls(); if(e.val) e.val.textContent = "Warming up…";
          try{
            const url = await piperSynth("Hola! I am the natural voice.");
            AUDIO.src = url; await AUDIO.play();
          }catch(err){ speak("The natural voice is ready.", "sunny"); }
          pDraw();
        } else {
          const e=pEls(); if(e.note){ e.note.style.display="block"; e.note.textContent = PIPER.error || "That didn't work — nothing changed."; }
        }
      });
    pDraw();
  };
  document.getElementById("setPin").onclick = ()=>{
    buzz();
    GZ.pinStage = "create"; GZ.pinBuf=""; GZ.pinFirst=""; GZ.after = "settings";
    gzGo("pin");
  };
}

/* ============ 2.6 USAGE SUMMARY ============ */
function gzUsage(){
  /* "from this week" means it: patterns are computed over the last 7 days only */
  const fullLog = usageAll();
  const log = fullLog.filter(e=> e.t > Date.now() - 7*86400000);
  const byLabel = {}, byCat = {};
  log.forEach(e=>{ byLabel[e.label]=(byLabel[e.label]||0)+1; if(e.cat) byCat[e.cat]=(byCat[e.cat]||0)+1; });
  const topWords = Object.entries(byLabel).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const topCats = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,4)
    .map(([id,n])=>({ id, n, label:(CATEGORIES[id]||{}).label||id, emoji:(CATEGORIES[id]||{}).emoji||"⭐" }));
  const maxW = topWords.length? topWords[0][1] : 1;
  /* last 7 days, oldest → today */
  const days = []; const now = new Date();
  for(let i=6;i>=0;i--){ const d0=new Date(now); d0.setDate(now.getDate()-i); d0.setHours(0,0,0,0);
    days.push({ label:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d0.getDay()], from:d0.getTime(), to:d0.getTime()+86400000, n:0 }); }
  log.forEach(e=>{ const d = days.find(x=>e.t>=x.from && e.t<x.to); if(d) d.n++; });
  const maxD = Math.max(1, ...days.map(d=>d.n));
  const recent = log.slice(-3).reverse();
  const rel = t=>{ const m = Math.round((Date.now()-t)/60000);
    if(m<1) return "just now"; if(m<60) return m+" min ago"; const h=Math.round(m/60);
    if(h<24) return h+(h>1?" hours":" hour")+" ago"; const dd=Math.round(h/24); return dd+(dd>1?" days":" day")+" ago"; };
  gzMount(`
    <div class="gznote gznote--warn">This is a usage summary, not a diagnosis or a measure of ability.</div>
    ${gzHead("Usage Summary","Gentle patterns from this week")}
    ${log.length===0 ? `<div class="gzcard"><div class="use__empty">Nothing to show yet. Once the board is used, you'll see gentle patterns here — the words that come up most and the places they live.</div></div>` : `
    <div class="gzsection">Words used most</div>
    <div class="gzcard" style="padding:14px 18px">
      ${topWords.map(([w,n])=>`<div class="use__bar"><span class="w">${esc(w)}</span><span class="track"><span class="fill" style="width:${Math.round(n/maxW*100)}%"></span></span><span class="n">${n}</span></div>`).join("")}
    </div>
    ${topCats.length?`<div class="gzsection">Favorite categories</div>
    <div class="gzcard"><div class="use__cats">
      ${topCats.map(c=>`<span class="use__cat"><span class="e" aria-hidden="true">${c.emoji}</span>${esc(c.label)}</span>`).join("")}
    </div></div>`:""}
    <div class="gzsection">Words this week</div>
    <div class="gzcard"><div class="use__week">
      ${days.map(d=>`<span class="use__day"><span class="bar" style="height:${Math.round(d.n/maxD*100)}%"></span><span class="d">${d.label}</span></span>`).join("")}
    </div></div>
    <div class="gzsection">Recent activity</div>
    <div class="gzcard" style="padding:12px 18px">
      ${recent.map(e=>`<div class="use__recent"><span class="t">${rel(e.t)}</span> — “${esc(e.label)}”</div>`).join("")}
    </div>
    <button class="gzpill gzpill--soft" id="useClear">Clear history</button>`}
    <div class="gznote">Stored only on this device, to help you notice what ${esc((profileGet()||{}).name||"your child")} reaches for — nothing more.</div>`);
  gzWireBack("hub");
  const clr = document.getElementById("useClear");
  if(clr) clr.onclick = ()=>{
    buzz();
    if(clr.dataset.arm!=="1"){ clr.dataset.arm="1"; clr.textContent="Tap again to confirm — words and photos are kept"; return; }
    usageClear(); gzUsage();
  };
}

/* ============ 2.7 OFFLINE & BACKUP ============ */
function gzBackup(){
  const last = STORE.read("ap.lastBackup", null);
  const profiles = profilesAll();
  let size = 0;
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i);
    if(k&&k.startsWith("ap.")) size += (localStorage.getItem(k)||"").length; }
  const human = size>1048576 ? (size/1048576).toFixed(1)+" MB" : Math.max(1,Math.round(size/1024))+" KB";
  gzMount(`
    ${gzHead("Offline & Backup")}
    <div class="gznote" style="display:flex;align-items:center;gap:10px;text-align:left">
      <span style="font-size:20px">✅</span>
      <span><b>Everything works offline.</b><br>All words, photos, and settings are stored on this device
      (${profiles.length} ${profiles.length===1?"child profile":"child profiles"} · about ${human}).</span>
      <span style="margin-left:auto;font-size:22px">🐤</span>
    </div>
    <div class="gzsection">💾 Backup</div>
    <div class="gzcard">
      <div class="gzrow"><span class="k">Last backup</span><span class="v">${last? new Date(last).toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}) : "Not yet"}</span></div>
      <div class="gzrow"><span class="k">Auto-backup</span><span class="v">Manual for now</span></div>
      <div class="gzrow"><span class="k">Backup location</span><span class="v">This device</span></div>
    </div>
    <button class="gzpill" id="bakNow">Back up now</button>
    <div class="gzsection">🔄 Restore</div>
    <div class="gzcard">
      <button class="gzrow" id="bakRestore"><span class="k">Restore from backup</span><span class="v">→</span></button>
      <button class="gzrow" id="bakTransfer"><span class="k">Transfer to new device</span><span class="v">→</span></button>
    </div>
    <input type="file" accept="application/json,.json" hidden id="bakFile">
    <div class="gzsection">📤 Export</div>
    <div class="gzcard">
      <button class="gzrow" id="bakWords"><span class="k">Export word list (print / PDF)</span><span class="v">→</span></button>
      <button class="gzrow" id="bakShare"><span class="k">Share with a therapist</span><span class="v">→</span></button>
    </div>
    <div class="vsheet__status" id="bakStatus"></div>
    <div class="gznote">Backups stay in your hands — only the people you give the file to can open it.</div>`);
  gzWireBack("hub");
  const status = document.getElementById("bakStatus");
  document.getElementById("bakNow").onclick = async ()=>{
    buzz();
    try{
      const bk = backupBuild();
      /* portability: photos & recordings live in IndexedDB — re-inline them so
         the backup is ONE file that restores anywhere */
      if(typeof mediaInlineForBackup==="function" && bk.data["ap.profiles"]){
        const profs = await mediaInlineForBackup(JSON.parse(bk.data["ap.profiles"]));
        bk.data["ap.profiles"] = JSON.stringify(profs);
      }
      const blob = new Blob([JSON.stringify(bk, null, 1)], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "amazing-puzzle-backup-" + new Date().toISOString().slice(0,10) + ".json";
      a.click(); URL.revokeObjectURL(a.href);
      STORE.write("ap.lastBackup", new Date().toISOString());
      gzBackup();
    }catch(e){ status.textContent = "Could not create the backup file on this device."; }
  };
  const file = document.getElementById("bakFile");
  document.getElementById("bakRestore").onclick = ()=>{ buzz(); file.value = ""; file.click(); };
  document.getElementById("bakTransfer").onclick = ()=>{
    buzz(); status.textContent = "Export a backup here, then restore it from this screen on the new device.";
  };
  file.onchange = ()=>{
    status.textContent = "Reading backup…";
    const rd = new FileReader();
    rd.onerror = ()=> status.textContent = "Could not read that file.";
    rd.onload = ()=>{
      let obj = null;
      try{ obj = JSON.parse(rd.result); }catch(e){ status.textContent = "That file isn't a valid backup."; return; }
      const err = backupRestore(obj);
      if(err){ status.textContent = err; return; }
      status.textContent = "Restored! Getting things ready…";
      setTimeout(()=>{ location.reload(); }, 700);
    };
    rd.readAsText(file.files[0]);
  };
  function wordList(){
    const p = profileGet()||{};
    /* every label/emoji is caregiver- or backup-supplied — escape all of it */
    const rows = Object.values(CATEGORIES).map(c=>
      `<h3>${esc(c.emoji)} ${esc(c.label)}</h3><p>${(c.cards||[]).map(x=>esc(x.label)).join(" · ")}</p>`).join("");
    const w = window.open("", "_blank");
    if(!w){ status.textContent = "Pop-ups are blocked — allow them to print the word list."; return; }
    w.document.write(`<html><head><title>${esc(p.name||"Child")} — word list</title>
      <style>body{font-family:-apple-system,system-ui,sans-serif;padding:30px;color:#222}h1{font-size:22px}h3{margin:18px 0 4px}p{margin:0;color:#444;line-height:1.7}</style>
      </head><body><h1>🧩 The Amazing Puzzle — ${esc(p.name||"Child")}'s words</h1>
      <p style="color:#777">Emergency words (always on): ${NEEDS.map(n=>esc(n.label)).join(" · ")}</p>${rows}
      <script>window.print()</` + `script></body></html>`);
    w.document.close();
  }
  document.getElementById("bakWords").onclick = ()=>{ buzz(); wordList(); };
  document.getElementById("bakShare").onclick = ()=>{ buzz(); wordList(); status.textContent = "Print or save as PDF, then share it with the therapist."; };
}

/* ============ 2.8 PROFILES ============ */
function gzProfiles(){
  const all = profilesAll();
  const activeId = (profileGet()||{}).id;
  const wordsOf = p=>{
    let n = NEEDS.length;
    Object.entries(SEED.cats||{}).forEach(([id,cards])=>{
      n += (p.vocab && p.vocab.cats && p.vocab.cats[id]) ? p.vocab.cats[id].length : cards.length;
    });
    return n;
  };
  gzMount(`
    ${gzHead("Profiles")}
    <div id="profList"></div>
    <button class="prof__addcard" id="profAdd">+ Add another child</button>
    <div class="gzsection">👥 Caregivers</div>
    <div class="gzcard" id="profCare"></div>
    <button class="gzpill" id="profInvite">Invite caregiver</button>
    <div class="gznote">Each profile is separate. The caregiver list is a note on this device for now — sharing arrives with cloud sync.</div>`);
  gzWireBack("hub");
  const list = document.getElementById("profList");
  all.forEach(p=>{
    const active = p.id===activeId;
    const card = document.createElement("div");
    card.className = "prof" + (active?" active":"");
    card.innerHTML = `
      ${active?`<span class="prof__badge">Active</span>`:""}
      <span class="prof__avatar">${esc(p.avatar||"🧒")}</span>
      <span class="prof__body">
        <div class="prof__name">${esc(p.name||"Child")}</div>
        <div class="prof__meta">${p.age?("Age "+esc(p.age)+" · "):""}${wordsOf(p)} words · ${active?"Active":"Inactive"}</div>
        <button class="prof__link">${active ? "Edit profile →" : "Switch to "+esc(p.name||"this child")+" →"}</button>
        ${!active && all.length>1 ? `<button class="prof__link prof__link--danger" data-rm>Remove this profile</button>` : ""}
      </span>`;
    card.querySelector(".prof__link").onclick = ()=>{
      buzz();
      if(active){ document.body.classList.remove("gz"); startOnboarding(true); }
      else { profileSwitch(p.id); applyProfile(); applySettings(); gzProfiles(); }
    };
    const rm = card.querySelector("[data-rm]");
    if(rm) rm.onclick = ()=>{
      buzz();
      if(rm.dataset.arm!=="1"){ rm.dataset.arm="1"; rm.textContent = "Tap again — removes "+ (p.name||"this child") +"'s words, photos & history"; return; }
      profileRemove(p.id); applyProfile(); applySettings(); gzProfiles();
    };
    list.appendChild(card);
  });
  document.getElementById("profAdd").onclick = ()=>{
    buzz(); document.body.classList.remove("gz"); startOnboarding(true, true);   // NEW child
  };
  const care = document.getElementById("profCare");
  const p = profileGet();
  function drawCare(){
    care.innerHTML = "";
    ((p&&p.caregivers)||[]).forEach(c=>{
      const r = document.createElement("div");
      r.className = "gzrow";
      r.innerHTML = `<span class="k">${esc(c.name)}</span><span class="v" style="color:${c.role==="Owner"?"#4A7DE2":"#8A97A6"}">${esc(c.role)}</span>`;
      care.appendChild(r);
    });
  }
  drawCare();
  document.getElementById("profInvite").onclick = ()=>{
    buzz();
    const sheet = document.createElement("div");
    sheet.className = "vsheet";
    sheet.innerHTML = `<div class="vsheet__panel">
      <div class="vsheet__title">Add a caregiver</div>
      <div class="vsheet__sub">Saved on this device for now — real invites arrive with cloud sync.</div>
      <input class="vsheet__field" id="cgName" placeholder="Name (e.g. Ms. Rivera, therapist)" aria-label="Caregiver name" maxlength="30">
      <div class="gzrow" style="border:none"><span class="k">Role</span><button class="gzcycle" id="cgRole">Editor</button></div>
      <div class="vsheet__actions">
        <button class="vsheet__btn vsheet__btn--cancel" id="cgCancel">Cancel</button>
        <button class="vsheet__btn vsheet__btn--save" id="cgSave">Add</button>
      </div></div>`;
    document.body.appendChild(sheet);
    let role = "Editor";
    sheet.querySelector("#cgRole").onclick = e=>{ role = role==="Editor"?"Viewer":"Editor"; e.target.textContent = role; };
    sheet.querySelector("#cgCancel").onclick = ()=> sheet.remove();
    sheet.onclick = e=>{ if(e.target===sheet) sheet.remove(); };
    sheet.querySelector("#cgSave").onclick = ()=>{
      const name = (sheet.querySelector("#cgName").value||"").trim();
      if(!name) return;
      p.caregivers = p.caregivers||[]; p.caregivers.push({name, role});
      const ok = profileSave(p);
      if(!ok){ p.caregivers.pop(); gzToastQuota(); }
      sheet.remove(); drawCare();
    };
  };
}
