/* ============================================================
   The Amazing Puzzle™ — store v2 (multi-profile, on-device)
   Keys:
     ap.profiles   [ {id, name, age, avatar, people, favorites,
                      voice, useFamiliar, recordings, settings,
                      vocab, caregivers, createdAt} ]
     ap.active     id of the active child
     ap.pin        caregiver PIN (set on first Grown-Up entry)
     ap.usage.<id> rolling tap log per child (descriptive only)
     ap.lastBackup ISO timestamp of the last export
   Migrates v1 (single "ap.profile") automatically.
   Everything stays on this device. Nothing is uploaded.
   ============================================================ */

const STORE = {
  read(key, fallback){ try{ const v = JSON.parse(localStorage.getItem(key)||"null"); return v==null?fallback:v; }catch(e){ return fallback; } },
  write(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); return true; }catch(e){ return false; } },
  remove(key){ try{ localStorage.removeItem(key); }catch(e){} },
};

const DEFAULT_SETTINGS = {
  rate:"normal",        // slower | normal | faster
  speakOnTap:true,
  mode:"phrase",        // phrase | single
  grid:3,               // 2 | 3 | 4 across
  text:"standard",      // standard | large | xlarge
  contrast:false,
  motion:false,         // true = reduce motion
  vibration:true,
  calm:false,           // Calm Mode: companions hush, celebrations quiet
  games:true,           // word games with the companions (quiet entry points only)
};

function newProfileId(){ return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

/* ---- migration: v1 single profile → v2 array ---- */
function storeMigrate(){
  if(STORE.read("ap.profiles", null)) return;
  const v1 = STORE.read("ap.profile", null);
  if(v1){
    v1.id = v1.id || newProfileId();
    v1.settings = Object.assign({}, DEFAULT_SETTINGS, v1.settings||{});
    v1.vocab = v1.vocab || { cats:{}, needs:null };
    v1.caregivers = v1.caregivers || [{name:"Mom (you)", role:"Owner"}];
    STORE.write("ap.profiles", [v1]);
    STORE.write("ap.active", v1.id);
    STORE.remove("ap.profile");
  }
}

/* ---- profiles ---- */
function profilesAll(){ return STORE.read("ap.profiles", []); }
function profileActiveId(){ return STORE.read("ap.active", null); }
function profileGet(id){
  const all = profilesAll();
  if(!all.length) return null;
  const want = id || profileActiveId();
  return all.find(p=>p.id===want) || all[0];
}
function profileSave(p){
  if(!p) return false;
  p.id = p.id || newProfileId();
  p.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings||{});
  p.vocab = p.vocab || { cats:{}, needs:null };
  p.caregivers = p.caregivers || [{name:"Mom (you)", role:"Owner"}];
  const all = profilesAll();
  const i = all.findIndex(x=>x.id===p.id);
  if(i>=0) all[i] = p; else all.push(p);
  const ok = STORE.write("ap.profiles", all);
  if(ok && !profileActiveId()) STORE.write("ap.active", p.id);
  return ok;
}
function profileSwitch(id){
  if(!profilesAll().some(p=>p.id===id)) return false;
  return STORE.write("ap.active", id);
}
function profileRemove(id){
  const gone = profilesAll().find(p=>p.id===id);
  const all = profilesAll().filter(p=>p.id!==id);
  STORE.write("ap.profiles", all);
  STORE.remove("ap.usage."+id);
  if(profileActiveId()===id) STORE.write("ap.active", all[0] ? all[0].id : null);
  try{ if(typeof mediaPurgeProfile==="function") mediaPurgeProfile(gone); }catch(e){}
}
function settingsGet(){
  const p = profileGet();
  return Object.assign({}, DEFAULT_SETTINGS, (p && p.settings)||{});
}
function settingsSet(patch){
  const p = profileGet(); if(!p) return false;
  p.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings||{}, patch);
  const ok = profileSave(p);
  if(typeof applySettings === "function") applySettings();
  return ok;
}

/* ---- caregiver PIN ---- */
function pinGet(){ return STORE.read("ap.pin", null); }
function pinSet(pin){ return STORE.write("ap.pin", String(pin)); }

/* ---- usage log (descriptive only — never a score) ---- */
function usageLog(label, cat){
  const p = profileGet(); if(!p) return;
  const key = "ap.usage."+p.id;
  const log = STORE.read(key, []);
  log.push({ t:Date.now(), label:String(label), cat:String(cat||"") });
  while(log.length>800) log.shift();
  STORE.write(key, log);
}
function usageAll(){
  const p = profileGet(); if(!p) return [];
  return STORE.read("ap.usage."+p.id, []);
}
function usageClear(){
  const p = profileGet(); if(!p) return;
  STORE.remove("ap.usage."+p.id);
}

/* ---- backup (export / restore — the parent owns the file) ---- */
function backupBuild(){
  const data = {};
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith("ap.") && k!=="ap.pin") data[k] = localStorage.getItem(k);  // PIN never leaves the device
  }
  return { app:"The Amazing Puzzle", kind:"ap-backup", version:2, exportedAt:new Date().toISOString(), data };
}
function backupRestore(obj){
  if(!obj || obj.kind!=="ap-backup" || !obj.data || typeof obj.data!=="object")
    return "That doesn't look like an Amazing Puzzle backup file.";
  /* validate BEFORE touching anything: profiles must parse as an array */
  try{
    if(obj.data["ap.profiles"] != null){
      const arr = JSON.parse(obj.data["ap.profiles"]);
      if(!Array.isArray(arr)) throw 0;
    }
  }catch(e){ return "That backup file looks damaged — nothing was changed."; }
  /* snapshot the current data so a mid-write failure rolls back cleanly */
  const snapshot = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith("ap.") && k!=="ap.pin") snapshot.push([k, localStorage.getItem(k)]);
  }
  try{
    snapshot.forEach(([k])=>localStorage.removeItem(k));
    Object.entries(obj.data).forEach(([k,v])=>{
      if(k.startsWith("ap.") && k!=="ap.pin") localStorage.setItem(k, String(v));
    });
    return null;
  }catch(e){
    /* roll back — the child's current world is never lost to a bad restore */
    try{
      for(let i=localStorage.length-1;i>=0;i--){
        const k = localStorage.key(i);
        if(k && k.startsWith("ap.") && k!=="ap.pin") localStorage.removeItem(k);
      }
      snapshot.forEach(([k,v])=>localStorage.setItem(k,v));
    }catch(e2){}
    return "Restore failed — the device storage may be full. Your current setup was kept.";
  }
}

storeMigrate();
