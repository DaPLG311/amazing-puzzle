/* ============================================================
   The Amazing Puzzle™ — Onboarding Wizard (screens 3.1–3.6)
   The magical ~10-minute setup, faithful to the Canva design.
   3.1 Warm Welcome → 3.2 Create Child Profile → 3.3 Add Important
   People (real photos, EXIF-stripped) → 3.4 Add Favorites →
   3.5 Choose the Voice (preview + record a familiar voice) →
   3.6 Ready to Talk!  Persists to localStorage as ap.profile.
   Cast: Pollito guides; Ana hosts favorites; Coco hosts voice.
   Hardened per adversarial QA: esc() everywhere user text meets
   markup; mic generation-token (no orphaned live mic); recordings
   keyed lowercase; re-run prefills + cancellable; save-failure
   keeps the built profile in memory and warns visibly.
   ============================================================ */

/* profile store lives in store.js (multi-profile v2) */

/* escape user-supplied text before it touches innerHTML/attributes */
function esc(s){ return String(s==null?"":s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

/* ---------------- wizard state ---------------- */
const OB = { step:0, data:null, force:false };
function obFresh(){
  return {
    name:"", age:"", avatar:"🧒",
    people:[
      { id:"mom",     label:"Mom",     emoji:"👩",   img:null },
      { id:"dad",     label:"Dad",     emoji:"👨",   img:null },
      { id:"grandma", label:"Grandma", emoji:"👵",   img:null },
      { id:"teacher", label:"Teacher", emoji:"👩‍🏫", img:null },
    ],
    favorites:[], voice:"sunny", useFamiliar:false, recordings:{},
    createdAt:new Date().toISOString(),
  };
}

/* Fav library for step 3.4 (exactly the design's nine) */
const OB_FAVS = [
  {emoji:"🧸",label:"Teddy",bg:"#FCE9E4"},{emoji:"🚗",label:"Car",bg:"#E7F2FB"},{emoji:"🐶",label:"Dog",bg:"#E6F6EE"},
  {emoji:"🎵",label:"Music",bg:"#EFEAFB"},{emoji:"⚽",label:"Ball",bg:"#FBF3DA"},{emoji:"📺",label:"TV",bg:"#E7F2FB"},
  {emoji:"🦕",label:"Dino",bg:"#E6F6EE"},{emoji:"🎨",label:"Art",bg:"#FCE9E4"},{emoji:"🧊",label:"Ice",bg:"#E7F2FB"},
];

const OB_AVATARS = [
  {e:"🧒",n:"child",bg:"#BFDCFB"},{e:"👧",n:"girl",bg:"#F9D2CB"},{e:"👦",n:"boy",bg:"#BDE8D2"},
  {e:"🧒🏽",n:"child, medium skin",bg:"#D9CBF6"},{e:"👶",n:"baby",bg:"#F8DE8D"},
];

/* ---------------- photo pipeline (EXIF/GPS stripped) ---------------- */
function obProcessPhoto(file, cb){
  if(!file || !/^image\//.test(file.type)) return cb(null, "Please choose a photo.");
  const rd = new FileReader();
  rd.onerror = ()=> cb(null, "Could not read that photo.");
  rd.onload = ()=>{
    const img = new Image();
    img.onerror = ()=> cb(null, "That photo could not be opened.");
    img.onload = ()=>{
      try{
        const MAX = 640;
        const k = Math.min(1, MAX/Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width*k); c.height = Math.round(img.height*k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/jpeg", .82), null);   // re-encode = metadata gone
      }catch(e){ cb(null, "That photo could not be processed."); }
    };
    img.src = rd.result;
  };
  rd.readAsDataURL(file);
}

/* ---------------- voice recorder (MediaRecorder, on-device) ----------------
   Generation token kills the getUserMedia race: if the parent navigates while
   the permission prompt is up, the late stream is stopped immediately —
   the mic is NEVER left live off-screen. Chunks are closure-local (no races). */
const OB_REC = { media:null, gen:0, pending:false };
function obRecSupported(){ return !!(navigator.mediaDevices && window.MediaRecorder); }
function obRecStart(word, onDone, onFail){
  if(!obRecSupported()) return onFail("Recording isn't available on this device.");
  if(OB_REC.pending) return;                       // permission prompt already up — ignore mashing
  OB_REC.pending = true;
  const myGen = ++OB_REC.gen;
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    OB_REC.pending = false;
    if(myGen !== OB_REC.gen){ stream.getTracks().forEach(t=>t.stop()); return; }  // navigated away
    const chunks = [];
    const mr = new MediaRecorder(stream);
    OB_REC.media = mr;
    mr.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
    mr.onstop = ()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(myGen !== OB_REC.gen && !chunks.length) return;
      const blob = new Blob(chunks, {type: mr.mimeType || "audio/webm"});
      const rd = new FileReader();
      rd.onload = ()=> onDone(rd.result);
      rd.readAsDataURL(blob);
    };
    mr.start();
  }).catch(()=>{ OB_REC.pending = false; onFail("Microphone permission was not given."); });
}
function obRecStop(){
  OB_REC.gen++;   // invalidate any pending permission prompt
  try{ OB_REC.media && OB_REC.media.state!=="inactive" && OB_REC.media.stop(); }catch(e){}
}
function obPlayClip(dataURL){ try{ new Audio(dataURL).play().catch(()=>{}); }catch(e){} }

/* ---------------- scaffolding helpers ---------------- */
function obDots(active, bottom){
  return `<div class="ob__dots ${bottom?"ob__dots--bottom":""}" role="img" aria-label="Step ${active+1} of 6">` +
    [0,1,2,3,4,5].map(i=>`<i class="${i===active?"on":""}"></i>`).join("") + `</div>`;
}
function obHost(castKey, quote){
  const c = CAST[castKey];
  return `<div class="ob__host" style="background:${c.color}" aria-hidden="true">${c.emoji}</div>
          <div class="ob__quote" style="color:${c.color}">&ldquo;${quote}&rdquo;</div>`;
}
function obSay(castKey, text){
  speak(text, VOICES[castKey] ? castKey : "sunny");   // the cast speak in their own voices
}
function obMount(html){
  document.body.classList.add("onboarding");
  screenEl.innerHTML = `<div class="ob">${html}</div>`;
}
function obNextBtn(label){ return `<button class="ob__next" id="obNext">${label||"Next"}</button>`; }
function obBackBtn(){
  const back = OB.step>0 ? `<button class="ob__back" id="obBack">‹ Back</button>` : "";
  const cancel = OB.force ? `<button class="ob__cancel" id="obCancel" aria-label="Cancel setup and keep everything as it was">✕</button>` : "";
  return back + cancel;
}
let OB_NAV_AT = 0;   // debounce: a fast double-tap must never skip a step
function obWireNav(onNext){
  const guard = fn=>()=>{ const now=Date.now(); if(now-OB_NAV_AT<400) return; OB_NAV_AT=now; buzz(); fn(); };
  const nx = document.getElementById("obNext");
  if(nx) nx.onclick = guard(()=> onNext ? onNext() : obGo(OB.step+1));
  const bk = document.getElementById("obBack");
  if(bk) bk.onclick = guard(()=> obGo(OB.step-1));
  const cx = document.getElementById("obCancel");
  if(cx) cx.onclick = guard(()=>{      // keep the child's world exactly as it was
    obRecStop();
    document.body.classList.remove("onboarding");
    applyProfile(); go("home");
  });
}

/* ---------------- router ---------------- */
function startOnboarding(force, asNew){
  const existing = profileGet();
  if(!force && existing){ go("home"); return; }
  OB.step = 0; OB.force = !!force; OB.asNew = !!asNew;
  /* Re-running setup EDITS what's there — never blanks a child's world.
     asNew = a brand-new sibling profile (from 2.8 "+ Add another child"). */
  OB.data = (existing && !asNew) ? Object.assign(obFresh(), JSON.parse(JSON.stringify(existing))) : obFresh();
  obGo(0);
}
function obGo(step){
  obRecStop();
  OB.step = Math.max(0, Math.min(5, step));
  [obWelcome, obProfile, obPeople, obFavorites, obVoice, obReady][OB.step]();
}

/* ============ 3.1 Warm Welcome ============ */
function obWelcome(){
  obMount(`
    ${obBackBtn()}
    <div class="ob__logo" aria-hidden="true">🧩</div>
    <div class="ob__title">Welcome to<br>The Amazing Puzzle</div>
    <div class="ob__sub">Let's give your child their voice.<br>It only takes a few minutes.</div>
    <div class="ob__castrow">${Object.values(CAST).filter(c=>c.name!=="Freddy").map(c=>
      `<div class="castface"><div class="castface__c" style="background:${c.color}" aria-hidden="true">${c.emoji}</div>${c.name}</div>`).join("")}
    </div>
    <div class="ob__quote" style="color:${CAST.pollito.color}">&ldquo;Hola! We're going to help your child talk.&rdquo;</div>
    ${obNextBtn("Let's get started")}
    ${obDots(0, true)}
  `);
  obWireNav();
  setTimeout(()=> obSay("pollito","Hola! We're going to help your child talk."), 300);
}

/* ============ 3.2 Create Child Profile ============ */
function obProfile(){
  const d = OB.data;
  obMount(`
    ${obBackBtn()}
    ${obDots(1)}
    ${obHost("pollito","What's your friend's name?")}
    <div class="ob__title">Create Child Profile</div>
    <input class="ob__field" id="obName" placeholder="Child's name" aria-label="Child's name" maxlength="24" value="${esc(d.name)}" autocomplete="off">
    <input class="ob__field" id="obAge" placeholder="Age (optional)" aria-label="Age, optional" maxlength="2" inputmode="numeric" value="${esc(d.age)}" autocomplete="off">
    <div class="ob__label">Choose an avatar</div>
    <div class="avatars" id="obAvatars"></div>
    ${obNextBtn()}
    ${OB.asNew ? `<div class="ob__foot">Each child gets their own fresh board — customize it any time in the Grown-Up Zone.</div>` : ""}
  `);
  const wrap = document.getElementById("obAvatars");
  OB_AVATARS.forEach(a=>{
    const b = document.createElement("button");
    b.className = "avatar" + (d.avatar===a.e ? " on":"");
    b.style.background = a.bg;
    b.textContent = a.e;
    b.setAttribute("aria-label", "Avatar: "+a.n);
    b.setAttribute("aria-pressed", d.avatar===a.e ? "true":"false");
    b.onclick = ()=>{ buzz(); d.avatar = a.e;
      wrap.querySelectorAll(".avatar").forEach(x=>{ x.classList.remove("on"); x.setAttribute("aria-pressed","false"); });
      b.classList.add("on"); b.setAttribute("aria-pressed","true"); };
    wrap.appendChild(b);
  });
  /* capture as they type — Back/Next never lose the name */
  document.getElementById("obName").oninput = e=>{ d.name = e.target.value.trim(); };
  document.getElementById("obAge").oninput  = e=>{
    e.target.value = e.target.value.replace(/\D/g,"");   // digits only
    d.age = e.target.value;
  };
  obWireNav(()=> obGo(2));
  setTimeout(()=> obSay("pollito","What's your friend's name?"), 300);
}

/* ============ 3.3 Add Important People ============ */
function obPeople(){
  const d = OB.data;
  obMount(`
    ${obBackBtn()}
    ${obDots(2)}
    ${obHost("pollito","Let's add the people you love.")}
    <div class="ob__title">Add Important People</div>
    <div class="ob__sub">Who does your child talk to most?</div>
    <div class="people" id="obPeople"></div>
    <button class="ob__another" id="obAnother">+ Add another person</button>
    ${obNextBtn()}
    <div class="ob__foot">Photos stay on this device. Location data is removed automatically.</div>
  `);
  const wrap = document.getElementById("obPeople");

  function renderPeople(){
    wrap.innerHTML = "";
    d.people.forEach((p)=>{
      const card = document.createElement("div");
      card.className = "person";
      card.innerHTML = `
        ${p.custom ? `<button class="person__remove" aria-label="Remove this person">✕</button>` : ""}
        <div class="person__face">${p.img ? `<img src="${p.img}" alt="${esc(p.label)}">` : `<span aria-hidden="true">${p.emoji}</span>`}</div>
        <div class="person__name">${p.custom
          ? `<input value="${esc(p.label)}" placeholder="Name" maxlength="14" aria-label="Person's name">`
          : esc(p.label)}</div>
        <button class="person__add">${p.img ? "Change photo" : "+ Add photo"}</button>
        <input type="file" accept="image/*" hidden aria-hidden="true">`;
      const rm = card.querySelector(".person__remove");
      if(rm) rm.onclick = ()=>{ buzz(); d.people = d.people.filter(x=>x!==p); renderPeople(); };
      const file = card.querySelector("input[type=file]");
      const addBtn = card.querySelector(".person__add");
      addBtn.setAttribute("aria-label", (p.img?"Change":"Add")+" photo for "+p.label);
      addBtn.onclick = ()=>{ buzz(); file.value = ""; file.click(); };   // same file twice still fires
      file.onchange = ()=>{
        obProcessPhoto(file.files[0], (dataURL, err)=>{
          if(err){ addBtn.textContent = err; return; }
          p.img = dataURL; renderPeople();
        });
      };
      const nameInput = card.querySelector(".person__name input");
      if(nameInput) nameInput.oninput = ()=>{ p.label = nameInput.value; };
      wrap.appendChild(card);
    });
  }
  renderPeople();

  document.getElementById("obAnother").onclick = ()=>{
    buzz();
    d.people.push({ id:"p"+Date.now(), label:"", emoji:"🙂", img:null, custom:true });
    renderPeople();
    const inputs = wrap.querySelectorAll(".person__name input");
    const last = inputs[inputs.length-1]; if(last){ last.placeholder = "Name"; last.focus(); }
  };
  obWireNav(()=> obGo(3));
  setTimeout(()=> obSay("pollito","Let's add the people you love."), 300);
}

/* ============ 3.4 Add Favorites (host: Ana) ============ */
function obFavorites(){
  const d = OB.data;
  obMount(`
    ${obBackBtn()}
    ${obDots(3)}
    ${obHost("ana","What do you love? Let's find it!")}
    <div class="ob__title">Add Favorites</div>
    <div class="ob__sub">What does your child love most?</div>
    <div class="favgrid" id="obFavs"></div>
    ${obNextBtn()}
  `);
  const wrap = document.getElementById("obFavs");
  OB_FAVS.forEach(f=>{
    const on = d.favorites.includes(f.label);
    const b = document.createElement("button");
    b.className = "favtile" + (on ? " on":"");
    b.style.background = f.bg;
    b.setAttribute("aria-pressed", on ? "true":"false");
    b.innerHTML = `<span class="e" aria-hidden="true">${f.emoji}</span><span class="l">${f.label}</span>`;
    b.onclick = ()=>{
      buzz(); speak(f.label, "sunny");
      const i = d.favorites.indexOf(f.label);
      if(i>=0) d.favorites.splice(i,1); else d.favorites.push(f.label);
      const now = b.classList.toggle("on");
      b.setAttribute("aria-pressed", now ? "true":"false");
    };
    wrap.appendChild(b);
  });
  obWireNav(()=> obGo(4));
  setTimeout(()=> obSay("ana","What do you love? Let's find it!"), 300);
}

/* ============ 3.5 Choose the Voice (host: Coco) ============ */
function obVoice(){
  const d = OB.data;
  const cards = [
    {key:"sunny", e:"☀️", n:"Sunny", t:"Bright & cheerful", bg:"#FBF3DA"},
    {key:"river", e:"🌊", n:"River", t:"Calm & gentle",     bg:"#E0EFFB"},
    {key:"spark", e:"⚡", n:"Spark", t:"Energetic & clear", bg:"#FBE4E4"},
  ];
  obMount(`
    ${obBackBtn()}
    ${obDots(4)}
    ${obHost("coco","Let's find your voice! Can you copy me?")}
    <div class="ob__title">Choose the Voice</div>
    <div class="ob__sub">Pick the voice that sounds most like your child.</div>
    <div class="voices" id="obVoices"></div>
    <button class="ob__preview" id="obPreview">🔊 Preview voice</button>
    <button class="ob__reclink" id="obRecLink" aria-expanded="false">Or record a familiar voice</button>
    <div class="recorder" id="obRecorder" hidden>
      <div class="recorder__hint">🎙️ Record Mom, Dad, or a sibling saying the words</div>
      <div id="obRecRows"></div>
      <div class="recorder__note" id="obRecNote">Recordings stay on this device.</div>
      <label class="usefam" id="obUseFam" hidden>
        <input type="checkbox" id="obUseFamChk"> Use the recorded voice when it can
      </label>
    </div>
    ${obNextBtn()}
  `);

  const wrap = document.getElementById("obVoices");
  cards.forEach(c=>{
    const b = document.createElement("button");
    b.className = "voicecard" + (d.voice===c.key ? " on":"");
    b.style.background = c.bg;
    b.setAttribute("aria-pressed", d.voice===c.key ? "true":"false");
    b.innerHTML = `<span class="e" aria-hidden="true">${c.e}</span><span class="n">${c.n}</span><span class="t">${c.t}</span>`;
    b.onclick = ()=>{
      buzz(); d.voice = c.key;
      wrap.querySelectorAll(".voicecard").forEach(x=>{ x.classList.remove("on"); x.setAttribute("aria-pressed","false"); });
      b.classList.add("on"); b.setAttribute("aria-pressed","true");
      speak(`Hi! I'm ${c.n}.`, c.key);
    };
    wrap.appendChild(b);
  });
  document.getElementById("obPreview").onclick = ()=>{
    buzz();
    speak(`Hola ${d.name || "friend"}! Let's talk together!`, d.voice);
  };

  /* --- the familiar-voice recorder: per-word, on-device, keys lowercase --- */
  const recWords = ["Hola!", ...(d.favorites.length ? d.favorites : ["More","All done"])].slice(0,6);
  const recPanel = document.getElementById("obRecorder");
  const rowsEl = document.getElementById("obRecRows");
  const note = document.getElementById("obRecNote");
  const useFam = document.getElementById("obUseFam");
  const useFamChk = document.getElementById("obUseFamChk");
  const recLink = document.getElementById("obRecLink");

  recLink.onclick = ()=>{
    buzz(); recPanel.hidden = !recPanel.hidden;
    recLink.setAttribute("aria-expanded", String(!recPanel.hidden));
    if(!recPanel.hidden && !obRecSupported()) note.textContent = "Recording isn't available in this browser — the named voices above will do the talking.";
  };
  function refreshFam(){
    const has = Object.keys(d.recordings).length > 0;
    useFam.hidden = !has;
    useFamChk.checked = !!d.useFamiliar;
  }
  useFamChk && (useFamChk.onchange = ()=>{ d.useFamiliar = useFamChk.checked; });

  function renderRows(){
    if(!document.body.contains(rowsEl)) return;   // screen was left mid-recording
    rowsEl.innerHTML = "";
    recWords.forEach(word=>{
      const key = word.toLowerCase();
      const row = document.createElement("div");
      row.className = "recrow";
      const has = !!d.recordings[key];
      row.innerHTML = `
        <span class="w">${esc(word)}</span>
        <button class="recbtn ${has?"has":""}" data-act="rec" aria-label="Record ${esc(word)}">${has?"↻":"🎙️"}</button>
        <button class="recbtn" data-act="play" aria-label="Play ${esc(word)}" ${has?"":"disabled style='opacity:.35'"}>▶</button>`;
      const recBtn = row.querySelector("[data-act=rec]");
      const playBtn = row.querySelector("[data-act=play]");
      recBtn.onclick = ()=>{
        buzz();
        if(OB_REC.media && OB_REC.media.state==="recording"){
          obRecStop(); recBtn.classList.remove("rec"); recBtn.textContent = "…";
          recBtn.setAttribute("aria-label", "Record "+word);
          return;
        }
        obRecStop();
        recBtn.classList.add("rec"); recBtn.textContent = "■";
        recBtn.setAttribute("aria-label", "Stop recording "+word);
        note.textContent = `Recording “${word}” — tap ■ to stop.`;
        obRecStart(word, dataURL=>{
          d.recordings[key] = dataURL;
          d.useFamiliar = true;
          if(document.body.contains(note)) note.textContent = `Saved “${word}”! Tap ▶ to hear it.`;
          renderRows(); refreshFam();
        }, err=>{
          if(document.body.contains(note)) note.textContent = err;
          renderRows();
        });
      };
      playBtn.onclick = ()=>{ buzz(); if(d.recordings[key]) obPlayClip(d.recordings[key]); };
      rowsEl.appendChild(row);
    });
    refreshFam();
  }
  renderRows();

  obWireNav(()=>{ obRecStop(); obGo(5); });
  setTimeout(()=> obSay("coco","Let's find your voice! Can you copy me?"), 300);
}

/* ============ 3.6 Ready to Talk! ============ */
function obReady(){
  obMount(`
    ${obBackBtn()}
    ${obDots(5)}
    <div class="ob__stars" aria-hidden="true">
      <i style="top:12%;left:12%">⭐</i><i style="top:8%;right:16%;animation-delay:.8s">✨</i>
      <i style="top:30%;right:8%;animation-delay:1.4s">⭐</i><i style="top:26%;left:6%;animation-delay:2s">✨</i>
    </div>
    <div class="ob__party" aria-hidden="true">🎉</div>
    <div class="ob__title">Ready to Talk!</div>
    <div class="ob__sub">Everything is set up. Your child's voice is ready.</div>
    <div class="ob__castrow">${Object.values(CAST).filter(c=>c.name!=="Freddy").map(c=>
      `<div class="castface"><div class="castface__c" style="background:${c.color}" aria-hidden="true">${c.emoji}</div>${c.name}</div>`).join("")}
    </div>
    <div class="ob__quote" style="color:${CAST.pollito.color}">&ldquo;You did it! Let's talk together!&rdquo;</div>
    ${obNextBtn("Start Talking!")}
    <div class="ob__foot">You can always change settings later in the Grown-Up Zone.</div>
  `);
  obWireNav(()=> finishOnboarding());
  setTimeout(()=> obSay("pollito","You did it! Let's talk together!"), 350);
}

/* ---------------- finish: persist + flow into the app ----------------
   The session ALWAYS reflects what the parent just built (in-memory apply),
   even if localStorage is full — then we warn visibly, not silently. */
function finishOnboarding(){
  obRecStop();                           // belt-and-braces: mic can never leave the wizard live
  const d = OB.data;
  if(!d.name) d.name = "Friend";
  if(OB.asNew) delete d.id;              // a brand-new sibling gets its own profile
  const ok = profileSave(d);             // assigns d.id when new
  if(ok && d.id) profileSwitch(d.id);    // the child we just set up becomes active
  document.body.classList.remove("onboarding");
  applyProfile(d);                       // in-memory: never lose the parent's work
  if(typeof applySettings === "function") applySettings();
  go("home");
  if(!ok){
    setTimeout(()=>{
      showBuddy("benji", "I couldn't save — this device is out of space. Try fewer photos in the Grown-Up Zone.", "river");
      speak("Heads up. This device could not save the setup, so it may not survive a restart.", "river");
    }, 1100);
  }
}
