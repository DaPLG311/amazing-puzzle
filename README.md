# 🧩 The Amazing Puzzle™ — LIVE UI (Milestone 1)

The Canva design, **brought to life**. Grafted directly onto your 26-screen design set
(`/design/*.svg`) — now interactive, speaking, animated, and teachable.

## How to run
Just open **`index.html`** in any modern browser (Chrome/Safari/Edge). No install, no build,
works offline. Best viewed in a phone-shaped window; on desktop it shows a device frame.
*(Speech uses the browser's built-in voices — the first tap may need a click to unlock audio.)*

## What's alive in this build
- **🚂 The train** (bottom nav) — Freddy the frog drives the locomotive (smoke + spinning wheels,
  chugging in place); the four cars **Home · Talk · Stars · World** navigate, and bounce when tapped.
- **Everything is clickable & teachable** — every tile, favorite, and word speaks the instant it's
  tapped (one tap = hear the word). Tap the buddy to hear them talk.
- **It speaks** — free on-device **Web Speech** voices, mapped to your three named voices
  **Sunny / River / Spark** (see "Voices" below).
- **The cast has jobs (never random):**
  | Character | Role in the app |
  |---|---|
  | 🐤 Pollito | Greets on Home ("Hola, Jacob!") and coaches the board ("One more word!") |
  | 🦊 Ana | Hosts the World map & discovery categories ("Where to next?") |
  | 🐻 Benji | The calm anchor in the **I Need** panel ("It's okay. I'll wait.") |
  | 🐱 Coco | Hosts Feelings & Play ("How do you feel today?") |
  | 🐸 Freddy | **Drives the train** (the nav conductor) |
- **Screens live now:** Home · Talk (communication board) · World (category map) · category boards
  (Food, Feelings, Animals, Places, Play) · **I Need** (emergency) · Stars (encouragement) ·
  Grown-Up (placeholder).
- **Sentence strip** — tap words to build a phrase, 🔊 to speak the whole line, ⌫ to undo.

## Voices (free voice library — you picked all four paths)
- **Now:** Web Speech API (on-device, free, offline). `data.js → VOICES` maps Sunny/River/Spark to
  system voices with tuned rate/pitch. Swap the picker in `app.js → pickVoice()` to prefer specific
  installed voices.
- **Next:** Piper neural voices (bundle .onnx models for higher-quality offline speech) · parent-
  recorded words (from your 3.5 screen) · a distinct voice per character. The engine is already
  isolated in `speak()` so these drop in without touching the screens.

## Files
```
index.html    shell + train + I Need overlay
styles.css    the whole look + the train animation
data.js       vocabulary, categories, the CAST, the VOICES, the TRAIN stops
app.js        speech engine, router, board/strip, cast-by-role, train wiring
design/       your original 26 Canva SVG screens (visual source of truth)
```

## ✅ Milestone 2 — the Onboarding Wizard (screens 3.1–3.6) — SHIPPED
The magical ~10-minute setup, faithful to the Canva designs and adversarially QA'd (3-lens audit):
- **3.1 Warm Welcome** — cast introduces itself (Pollito speaks the greeting).
- **3.2 Create Child Profile** — name, age (digits-only), 5 avatars. Typed text survives Back/Next.
- **3.3 Add Important People** — Mom/Dad/Grandma/Teacher + unlimited custom people (✕ removable).
  **Real photo upload:** re-encoded through canvas → EXIF/GPS stripped, stays on-device.
- **3.4 Add Favorites** — Ana hosts; multi-select of the design's nine.
- **3.5 Choose the Voice** — Coco hosts; Sunny/River/Spark preview + **record a familiar voice**
  (per-word MediaRecorder; recordings play instead of TTS, with automatic TTS fallback so a
  tile is never silent; mic can never be left live — generation-token guarded).
- **3.6 Ready to Talk!** — cast finale → **the payoff:** greeting by name, avatar, favorites on
  Home, real faces on the People world AND the emergency Mom/Dad tiles, chosen voice everywhere.
- First run boots into the wizard; after that, straight to Home. **Run setup again** (Grown-Up)
  re-opens it **prefilled** with a ✕ Cancel that keeps everything untouched.
- Hardened: input escaping (stored-XSS safe), 44px tap floor, aria-pressed/labels, double-tap
  debounce, quota-failure keeps the session's profile in memory + warns visibly.

## ✅ Milestone 3 — the Grown-Up Zone (screens 2.1–2.8) — SHIPPED
Faithful to the Canva designs, adversarially QA'd, honest (no fake iCloud/FaceID/encryption):
- **2.1 PIN gate** — create-your-own-PIN on first use (enter → confirm, gentle shake + plain
  feedback on mismatch), then enter-to-unlock. **Auto-relocks** the moment any child screen opens.
- **2.2 Grown-Up Hub** — active-child header + Switch, the four color-edged tool cards.
- **2.3 Vocabulary & Photos** — per-child **copy-on-write overlay**: add/edit/remove words,
  real photo upload (EXIF-stripped), spoken-wording overrides, reorder ▲▼. Core/emergency
  words are content-editable but can never be removed or moved (🔒 "always available").
  Edits appear on the child's board instantly.
- **2.5 Settings & Access** — every control is real: voice speed, speak-on-tap, sentence mode
  (build vs momentary single-word), grid 2/3/4-across, text size, high contrast, reduce motion
  (stills the train too), vibration, **Calm Mode** (companions hush), change PIN. Per-child.
- **2.6 Usage Summary** — descriptive only, permanent "not a diagnosis" banner: top words,
  favorite categories, words-this-week chart, recent activity, two-tap clear.
- **2.7 Offline & Backup** — honest status, one-file JSON export/restore (the **PIN is never
  exported**), printable word list for therapists (print → PDF).
- **2.8 Profiles** — multiple children with fully **isolated** worlds (own vocab/photos/settings/
  usage), add-another-child runs the wizard fresh, switch anytime; caregivers list + add.
- Store v2 (`store.js`): multi-profile, migrates v1 automatically.

## ✅ Milestone 4 — TEACH MODE (companion word games) — SHIPPED
The Hola Pollito cast finally *teaches* — modeled on AAC ethics, adversarially QA'd:
- **Model → Invite → any tap wins.** The category's host companion shows a word from the
  child's OWN board (real family photos included), speaks it, then offers three big cards.
  **Every tap speaks** — tapping a different word gets *affirmed* ("Nice talking!") plus one
  gentle re-model; never a buzzer, never "wrong," never blocked. 3 rounds → the puzzle
  assembles → back to talking.
- **Hosts by specialty:** Pollito models core words · Ana plays "find it!" · Benji goes slow
  and patient (longer beats) · Coco plays "can you copy me?" — each in their own voice.
- **Entries are quiet & ignorable:** a 🎲 Play pill in the companion nook + a card on the
  Stars screen. A "Word games with friends" switch in Settings hides them entirely.
- **Safety:** urgent words stay one tap away *inside* the game (its own I Need button);
  guarded beat-scheduler (leaving mid-round can't corrupt the board); one-answer-per-round
  (mashing can't skip or strand rounds); Calm Mode = text-only companions (tapped words
  always still speak); Reduce Motion honored; teach taps are **not** logged to usage — the
  dashboard stays a record of real communication only.

## ✅ Milestone 5 — THE VOICE ENGINE — SHIPPED
Three engines, one rule: **a tile is never silent.**
- **Recorded family clips** (highest trust) → **Piper neural voice** (optional) → **Web Speech**
  (always available). Routing is automatic and instant.
- **🎙️ Natural voice (Piper)** — real neural TTS running *in the browser* (WASM). A caregiver
  installs it once from Settings (~20 MB, needs internet that one time); the model then lives in
  the browser's storage. **Latency-safe by design:** only already-synthesized words play neural
  (instant); anything new speaks through Web Speech *now* while Piper warms it in the background
  — and the words on the child's current board pre-warm quietly (idle-polite, never janks).
  Removal is two taps. Talking never depends on any of this.
- **Per-character voices** — Pollito bright & quick, Ana energetic, Benji low & slow, Coco high
  & melodic, Freddy the steady conductor. The cast speak in their own voices everywhere (teach
  games, greetings, onboarding); the **child's voice** (Sunny/River/Spark) stays separate and is
  now switchable in Settings → Voice.
- Voice-choosing screens (onboarding 3.5, Settings) intentionally suppress Piper so parents hear
  the real personas they're choosing between.
- *Prototype note:* the Piper engine JS/WASM load from a CDN and ride the browser's HTTP cache;
  the production app bundles them. The **model** itself is cached on-device. Words never leave
  the device — synthesis is 100% local.

## ✅ Milestone 6 — V1 FINISH LINE — SHIPPED & LIVE
**https://amazing-puzzle.vercel.app** · repo `DaPLG311/amazing-puzzle` · autodeploys on push to main.
- **PWA**: installable (manifest + icons), offline via `sw.js` — HTML network-first so every
  deploy's fixes reach devices on next open; assets cache-first; bump `VERSION` per deploy.
- **IndexedDB media store** (`idb.js`): photos/recordings live in IDB as `idb:` tokens;
  localStorage stays tiny; hydrated per child at boot/switch; backups re-inline for portability.
- Splash (1.1 pieces assemble) + empty-category child state (4.1).

## ✅ Milestone 7 — BUILD-OUT: vocabulary depth + the cast alive — SHIPPED
- **16 worlds, ~252 words, core-words-first**, protected core words, AAC-legible emoji
  (adversarially reviewed — no duplicate/misleading referents).
- **Friends** train car: Pollito/Ana/Benji/Coco/Freddy greet in their OWN voices, each
  hosting their words + a game. Freddy conducts (no drill).

## ✅ Milestone 8 — KID-MAGIC PASS — SHIPPED
- **Living tiles**: 3D-gloss press physics, pop+glow on speak, the tapped word FLIES into
  the strip (state updates synchronously — Speak can never drop a word).
- **Sentence Train**: strip chips are coupled cars; Speak reads word-by-word (karaoke).
- **World moods** per category; **train moves-on-use, calm at rest** (sensory-safe) with a
  soft opt-in horn (`settings.sounds`, default off, Calm silences, throttled).

## ✅ Milestone 9 — THE TALK FUNNEL (research-built) + slidable companion — SHIPPED
Start Talking = **2 taps to a spoken sentence**. Built from a 4-lens research pass —
full evidence-graded directive set in **`docs/RESEARCH-SENTENCE-FUNNEL.md`** (cite it):
- **7 fixed starters** incl. the rejection starter **"I don't want…"** (refusal is a right —
  ASHA Communication Bill of Rights). Starters never re-rank.
- Child's strip stays **telegraphic, never corrected**; the **voice models complete grammar**
  ("Let's go **to the** park" / "Let's go home" / "I see Mom" / "I see **a** dog") and reads
  word-by-word through the train (`state.sentenceModel`).
- Completing tap speaks the word, then the sentence (`settings.autoSpeak` toggle for
  child-triggered speak). Step-2 tiles neutral white (Thistle & Wilkinson); board colors
  frozen per word (`tileBg` hash — Thistle 2018); **"something else →"** escape tile in every
  grid; **"All my words"** never gated.
- **Jito is slidable**: drag the companion anywhere — snaps to a side, remembers the spot
  per child (`settings.buddyPos`); drag never talks, tap still does.

## What's next (Milestone 10+)
- Real-device touch pass (iPad/Android Safari): speech unlock, drag feel, install flow
- More game shapes (routine sequencing with Benji, feelings matching with Coco)
- Bundle the Piper engine locally for true zero-network operation
- Funnel validation via usage data (funnel→board migration over time; C-directives)
- 8th "question" starter when usage shows the set is exhausted (research C5)
