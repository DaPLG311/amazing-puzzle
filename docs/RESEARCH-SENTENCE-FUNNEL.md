# RESEARCH: The Talk Funnel (Sentence Starters) — Design Directive Set

**Status:** Evidence-graded design directives, synthesized 2026-07-11 from a 4-lens research sweep
(scaffolds & carrier phrases · board organization & color · interaction & motor evidence · commercial/clinical field practice).
**Feature under review:** the "Start Talking" 2-tap funnel prototyped in `funnel.js` + `STARTERS` in `data.js`:
6 sentence starters → contextually filtered words → auto-spoken full sentence, with "All my words" ungated one tap away.

**Evidence-grade legend**

| Grade | Meaning |
|---|---|
| **STRONG** | Peer-reviewed experimental/meta-analytic support |
| **MODERATE** | Peer-reviewed but indirect/analogical, or mixed populations |
| **CLINICAL CONSENSUS** | Converging SLP/practitioner guidance, not controlled trials |
| **VENDOR PRACTICE** | What shipping AAC systems (Proloquo2Go, TD Snap, PODD, WordPower…) actually do |
| **NO EVIDENCE** | Literature silent — founder's inference stands by default |

---

## Executive verdict

The funnel is **evidence-defensible as a bridge, not a destination**. Its exact mechanic
(starter → contextually pruned words → partner-read full sentence) is PECS Phase IV + PODD pragmatic
branches + Proloquo2Go Sentence Development Links — three of the most established patterns in the field.
The field's one loud, unanimous warning is *getting stuck there*: requesting-only, script-reliant,
non-generalizing output. Our two existing constitution rules ("All my words" never gated; telegraphic
child output never corrected) are precisely the field's mitigations. The evidence demands **three real
changes**: add a **rejection/protest starter**, make **word colors/positions stable by identity** (not by
render index), and speak **grammatically complete models** with word-by-word highlighting. Everything
else keeps or stands.

---

## A. KEEP — current design confirmed by evidence

### A1. The 2-tap starter→word→spoken-sentence funnel itself — KEEP
- **Grade: STRONG (as entry point).** It replicates PECS Phase IV ("I want" symbol + item symbol → partner reads full strip), an NSP/Autism-Speaks-recognized evidence-based practice ([pecsusa.com](https://pecsusa.com); [Autism Speaks EBP](https://docs.autismspeaks.org/evidence-based-practices/pecs)). Flippin, Reszka & Watson 2010 (AJSLP meta-analysis) found solid requesting/communication gains.
- Minimal navigation depth is independently supported: Drager et al. 2004 (JSLHR 47) — 3-year-olds struggle with ALL dynamic-display navigation; Light & Drager 2007 (AAC) — reduce learning demands; Petroi, Koul & Corwin 2014 — fewer levels + small arrays beat deep trees (adult aphasia, directional only). A single predictable hop is a lower load than our 16-category tree for the youngest users.
- Speed has social payoff: Todman & Rzepecka 2003 (AAC journal) — competence ratings rise linearly as pre-utterance pause shortens toward ~2s. A 2-tap sentence puts the child inside the window where partners rate them as competent communicators.

### A2. "All my words" ungated, one tap away, always — KEEP (constitutional, non-negotiable)
- **Grade: STRONG + CLINICAL CONSENSUS.** This is THE mechanism that keeps us inside field norms. No major vendor ships a starter funnel as the only path (Lens 4: Proloquo2Go Crescendo, TD Snap Core First, Super Core, CoughDrop, Avaz are all word-first). Bedrosian/Hoag/McCoy relevance-vs-speed studies (AAC 2003; McCoy et al. 2007): listeners value message *relevance* over speed — a fast-but-wrong prestored sentence is worse than a slower right one. The escape hatch is what keeps relevance intact.
- Masking/progressive-reveal practice (AssistiveWare "Progressive Language"; TalkLink) endorses filtered views **only as a temporary measure** with the full set always reachable.

### A3. Function-balanced starter set (want/feel/see/go/need/like), not requesting-only — KEEP the breadth
- **Grade: MODERATE.** Light & McNaughton 2014 communicative-competence framework: systems built only for needs/wants fail information transfer, social closeness, etiquette. Spencer, Tönsing & Dada 2025 (AAC, 14 single-case studies): commenting is teachable and neglected. Our "I see"/"I feel"/"I like" starters are ahead of common practice (PECS is requesting-only). See B1 for the gap this set still has.

### A4. Telegraphic child output accepted, never grammar-corrected — KEEP verbatim
- **Grade: CLINICAL CONSENSUS.** The model-and-recast literature (Binger et al. 2010 JSLHR; Sennott, Light & McNaughton 2016) never uses correction; the telegraphic-input warnings (Bredin-Oja & Fey 2014 AJSLP; Venker et al. 2019) apply to ADULT/SYSTEM input, not child output. No source penalizes child telegraphic production. PrAACtical AAC's recommended response to single-word output is adult expansion, never "say the whole sentence."
- **Constitution wording to encode:** *telegraphic CHILD output = always accepted; telegraphic SYSTEM output (what the app speaks) = avoided* (see B3).

### A5. Auto-speaking the completed sentence in full — KEEP (with B3 refinement)
- **Grade: MODERATE.** Millar, Light & Schlosser 2006 (JSLHR): speech output doesn't hinder, may help natural speech. Schlosser & Koul 2015: speech-output tech effective in ASD. The full spoken sentence is itself an aided model/recast of the child's 2-tap telegraphic act — arguably the funnel's best feature. (No study directly compares auto-speak vs child-triggered speak — see C2.)

### A6. Starters rendered as decomposed word chips ("I" + "want" as two train cars) — KEEP; already implemented
- **Grade: CLINICAL CONSENSUS.** `STARTERS[].chips` in `data.js` already splits "I want" into two tokens on the sentence strip. This is exactly the anti-gestalt guard SLPs prescribe (Rachel Madel "Stuck using I want?"; Meaningful Speech on gestalt processors; AssistiveWare word-based-core guidance): components stay visible and learnable, never one welded chip. Exception to fix: the "Let's go" starter is a single chip — acceptable for now ("let's" is not a target word for this band), but revisit when grammar scaffolds arrive.

### A7. Filtered word sets stay generous, sourced live from the same category cards as the board — KEEP
- **Grade: MODERATE.** `funnelWords()` pulls LIVE category cards (caregiver photos/custom words flow in) rather than a frozen curated list — this respects the LAMP-community critique of "a prestored phrase someone else predicted," and multi-source starters (want → favorites/food/drinks/play) avoid over-predicting what "fits." Contextual narrowing itself is supported by Drager et al. 2003/2004 (contextual layouts beat grids for 2.5–3yo after first exposure) and just-in-time vocabulary research (Holyfield/Light/Drager; Patenaude, McNaughton & Liang 2025).

### A8. Follow-up actions (Say it again / add "please" / New sentence) — KEEP
- **Grade: MODERATE/CONSENSUS.** "Say it again" = repetition on child's initiative (agency); "please" = the social-etiquette function from Light & McNaughton 2014; "New sentence" = clean reset. Zangari (PrAACtical AAC 2015): prestored/assisted sentences have legitimate uses when they don't dominate. No change needed.

---

## B. CHANGE — evidence says do it differently (implementable specs)

### B1. ⚠️ Add a REJECTION/PROTEST starter — the highest-priority change
- **Grade: CLINICAL CONSENSUS (unanimous across all four lenses).** All six current starters are affirmative. Refusal is a right, not a feature: ASHA/NJC Communication Bill of Rights, 3rd ed. — the right "to refuse… objects, actions, events" ([asha.org/njc](https://www.asha.org/njc/communication-bill-of-rights)). PODD pairs "I like this" with "I DON'T like this" for young children (Porter). Project Core's Universal Core starts beginners with GO, LIKE, **NOT**. Rachel Madel lists "No" among her top alternatives to carrier phrases specifically to empower refusal.
- **Spec (data.js):** add a 7th starter:
  ```js
  { id:"dontwant", label:"I don't want", emoji:"🙅", color:"#FDE7E7",
    chips:[{emoji:"🙋",label:"I"},{emoji:"🙅",label:"don't want"}],
    sources:["favorites","food","drinks","play","places"] }
  ```
  Same 2-tap economics; sources mirror "I want" plus places (refusing outings is real). Visually distinct color (soft red family, matching the Stop/No tiles kids already know from the I Need panel).
- **Verified in code:** instant single-word protest already exists outside the funnel — `NEEDS` panel has Stop/No `core:true`, and stop/no/all-done are protected core on the board (`data.js` lines 93–97, 269–275). Keep it: protest can't wait two taps, so the funnel starter is *additive*, never the only protest path.

### B2. Freeze positions & colors by WORD IDENTITY, not render index
- **Grade: STRONG.** Thistle, Holmes, Horn & Reum 2018 (AJSLP; [PubMed 29860450](https://pubmed.ncbi.nlm.nih.gov/29860450/)): consistent-location preschoolers went 6.0s → 3.3s response time by session 5; variable-location peers stayed at 6.0s. Dukhovny & Gahl 2014 (J Comm Disorders): motor-plan similarity affects lexical recall on SGDs. AssistiveWare practice: hide, don't move.
- **Current violation:** `funnelObjects()` assigns tile color `PASTEL[i % PASTEL.length]` — color (and slot) shifts whenever the underlying card list changes (caregiver adds a word, category edits). That silently forfeits the automaticity gain.
- **Spec (funnel.js + shared tile system):**
  1. Tile color derives from a stable hash of `card.label` (or a persisted per-card color), not array index — a word keeps its color everywhere, forever.
  2. New caregiver words append into the NEXT empty slot / end of grid; existing tiles never reflow (AssistiveWare hide-don't-shrink pattern).
  3. The 7 starters occupy permanently fixed positions; never re-rank by frequency/recency — anywhere in the funnel.
  4. Words appearing under multiple starters (e.g. "Mom" under want/see/like) keep the same relative slot in each — they already do because sources share category card arrays; preserve this invariant when refactoring.
  5. "All my words" and the Back pill keep fixed screen positions across all funnel states (already true; make it a stated invariant).

### B3. Speak GRAMMATICALLY COMPLETE models; highlight word-by-word
- **Grade: MODERATE→STRONG.** Bredin-Oja & Fey 2014 (AJSLP): grammatical models beat telegraphic models for imitation of morphemes; Venker et al. 2019 + van Kleeck et al.: field consensus favors complete spoken input. Binger & Light 2007: aided models + grammatically complete spoken models taught 4/5 preschoolers multi-symbol messages.
- **Current violation:** `funnelSentenceText()` speaks `starter.label + " " + word` — fine for "I want pizza" / "I feel happy", but produces telegraphic SYSTEM output for "Let's go park" and "I need a hug"-style items are inconsistent.
- **Spec (data.js + funnel.js):**
  1. Add optional `speakTemplate` per starter: `go: "Let's go to the {word}"`, `see: "I see a {word}"` (with an article-exempt list for names/mass nouns: Mom, Dad, water, quiet…). Default template = `"{starter} {word}"`.
  2. The sentence STRIP keeps the child's telegraphic tokens exactly as tapped ("Let's go" + "park") — child output is never edited (A4); only the spoken model is complete.
  3. At completion, speak via the word-by-word-highlighted train reader (`speakSentenceTrain()` — already used by "Say it again") instead of flat `speak()`, so components stay visibly learnable as they're heard (anti-gestalt guard; Madel; Meaningful Speech).

### B4. Speak the completing WORD on tap, then the sentence
- **Grade: MODERATE (vendor practice + feedback studies).** Proloquo2Go speaks buttons on tap by default; Speak For Yourself argues per-word output supports segmentation; Schlosser & Blischak 2004 (JSLHR) + Schlosser et al. 1998 (JADD): speech-output feedback made learning more efficient than visual-only.
- **Current state:** starter tap speaks ("I want") when `speakOnTap !== false`; the completing tap jumps straight to the full sentence.
- **Spec (funnel.js `funnelPick`):** when `speakOnTap` is on, speak the word ("pizza"), brief beat (~300ms), then the full modeled sentence. Keep the existing caregiver toggle (`speakOnTap`) governing per-tap speech; full-sentence auto-speak is NOT behind the toggle (it IS the communication). Add a separate caregiver setting for child-triggered final speak (see C2).

### B5. Drop coded/pastel backgrounds as pedagogy; let the symbol carry the color
- **Grade: STRONG (for our 2–8 band).** Thistle & Wilkinson 2009 (AJSLP): FOREGROUND symbol color speeds preschool search more than background color. Thistle & Wilkinson 2017 (AAC 33(3); [PubMed 28617614](https://pubmed.ncbi.nlm.nih.gov/28617614/), correction [28670934](https://pubmed.ncbi.nlm.nih.gov/28670934/)) + the 2019 state-of-science review ([PMC6436972](https://pmc.ncbi.nlm.nih.gov/articles/PMC6436972/)): for arrays under ~24 symbols, background color does NOT facilitate search for young children and may disrupt it; hypothesized benefit depends on metalinguistic skills emerging ~5–7yo.
- **Spec:** word tiles in step 2 default to white/near-white neutral backgrounds so the symbol/photo pops (a red apple on white beats any coded background). If any color remains, it follows B2's stable-identity rule and stays very low-saturation. Do NOT introduce Fitzgerald-Key background coding for this age band; if we ever want transition-familiarity with Proloquo2Go/TouchChat, use thin word-class BORDERS as opt-in caregiver polish, not pedagogy.
- **What DOES help:** the same 2017 study found arrangement **by word-class category** sped responses — see B6.

### B6. Keep/formalize left-to-right word-class arrangement inside step 2
- **Grade: MODERATE.** Thistle & Wilkinson 2017: symbol arrangement by word-class category produced significantly faster responses than no arrangement (background color did not). The ubiquitous SVO left-to-right convention itself has no systematic evaluation — but grouped arrangement does.
- **Spec:** within a filtered word page, group words by kind in stable bands (e.g. people first row, foods next, descriptors last) rather than interleaving; keep the grouping identical across sessions (B2). This is a data-ordering convention in `CATEGORIES[].cards`, no new UI.

### B7. Add a "something else →" escape tile INSIDE step 2
- **Grade: CLINICAL CONSENSUS (relevance-over-speed).** Bedrosian/Hoag/McCoy trade-off program: partners judge relevance above speed; the LAMP critique warns against over-predicting what "fits." Our escape hatch currently lives only on the starter screen.
- **Spec (funnel.js `funnelObjects`):** final tile in every filtered grid = `🧩 something else` → opens the full category board ("world") with the started sentence PRESERVED on the strip, so "I want" + [board word] still completes and speaks. Fixed position: always the last slot. This closes the funnel's only dead-end: wanting a word the filter didn't predict.

---

## C. FOUNDER-INFERENCE STANDS — evidence silent or mixed; keep the design, flag for validation

### C1. The funnel as the DEFAULT entry ("Start Talking") for the youngest users
- **Gap:** No controlled study of a starter-funnel-as-default UI exists — vendors ship word-first homes (Lens 4), but the under-6 developmental evidence (Fallon, Light & Achilles 2003 — event schemas beat taxonomies before ~6–7; Drager 2003/2004 — contextual beats grid) points our way for the 2–5 band. **Founder default stands**; validate with usage data: track funnel-vs-board entry, and whether children migrate to the board over time (they should — the funnel is a bridge).

### C2. Auto-speak on completion vs child-triggered speak
- **Gap:** No study compares them. PECS's power partly comes from the child physically initiating the exchange (agency). **Auto-speak stands as default** (speed → Todman & Rzepecka pause window), with a caregiver setting "child taps to speak the sentence" for teams running PECS-style initiation goals.

### C3. Exactly 6–7 starters; ~8–16 words per step-2 screen
- **Gap:** **NO EVIDENCE** on optimal array size for 2–8yo. The 2019 state-of-science review found no pediatric recommendation; child studies used 12–16 symbol arrays; the 4-symbol advantage is adult-aphasia data (Petroi et al.); AssistiveWare sizes grids by vision/touch, erring larger. **Founder's 6 (now 7) big starters stand**; keep step-2 pages at roughly 8–16 tiles sized for the child's touch accuracy, with stable paging (fixed second page, never deeper nesting) beyond that.

### C4. Auto-advance after selection (starter tap → immediately show words)
- **Gap:** No direct experimental literature; vendor practice treats auto-navigation as legitimate, load-reducing, and preference-dependent. **Stands as default**; if a caregiver reports mis-taps, an "confirm before advancing" toggle is the escape valve — don't build it until asked.

### C5. A question starter ("Where…?" / "What's that?")
- **Gap/mixed:** PODD includes an asking branch ("I'm asking a question") and questioning is a core function (Light & McNaughton 2014), but all evidence for OUR mechanic is declarative. Seven starters is already at the top of the comfortable set. **Defer** — parked as the 8th starter for a later milestone, behind usage evidence that children exhaust the current set.

### C6. Gestalt language processors (GLPs)
- **Gap:** Meaningful Speech and allied practitioners warn sentence strips/carrier phrases can become hard-to-break gestalts for GLPs; there is no controlled evidence either way for a funnel like ours. Our mitigations (decomposed chips A6, word-by-word highlight B3, never-required funnel A2/A4) are the consensus guards. **Stands**; add a caregiver-facing note in Grownup mode that children echoing whole starters verbatim may benefit from board-first use.

---

## Recommended STARTER SET (final)

Fixed positions, never re-ranked. All starters render as decomposed chips on the strip.

| # | Starter | Function served | Sources / items | Spoken model template |
|---|---|---|---|---|
| 1 | **I want…** 🙌 | Requesting | favorites, food, drinks, play | "I want {word}" |
| 2 | **I don't want…** 🙅 **(NEW — B1)** | Rejection/protest | favorites, food, drinks, play, places | "I don't want {word}" |
| 3 | **I need…** 🆘 | Urgent requesting | curated items (help, break, bathroom, hug…) | "I need {word}" |
| 4 | **I feel…** 💙 | Emotion/self-report | feelings | "I feel {word}" |
| 5 | **I see…** 👀 | Commenting/joint attention | animals, people, colors | "I see a {word}" (article-exempt list) |
| 6 | **I like…** ❤️ | Social closeness/commenting | favorites, animals, play, colors | "I like {word}" |
| 7 | **Let's go…** 🚗 | Social invitation/transition | places | "Let's go to the {word}" (article-exempt list) |

Rationale: spans requesting, **protest**, urgent need, emotion, commenting, affiliation, and social invitation — the function balance Light & McNaughton 2014 demands and PECS lacks. Instant protest (Stop/No/All done) additionally remains one tap on the protected core + I Need panel, because refusal can't wait two taps.

## Color-coding recommendation (summary of B2+B5)
- Step-2 word tiles: neutral/white backgrounds; symbol/photo is the color carrier.
- Any residual tile color: stable per-word (hash of label), never per-render-index.
- Starter tiles: keep their 7 distinct pastel identities (few, huge, fixed — color-as-landmark is fine at n=7 and never moves).
- No Fitzgerald-Key background pedagogy for 2–8yo; optional thin word-class borders later as transition polish only.
- Word-class GROUPING (not coloring) inside pages is the evidence-backed arrangement cue.

## Speech-feedback behavior spec (summary of A5+B3+B4)
1. Starter tap → speak starter label (governed by `speakOnTap`, default ON).
2. Completing word tap → speak the word, ~300ms beat, then the full **grammatically complete** modeled sentence via word-by-word-highlighted train reading.
3. Full-sentence speak is always-on (it IS the communication); optional caregiver setting flips it to child-triggered (C2).
4. Strip always shows the child's actual telegraphic tokens; only the VOICE upgrades to the complete model. Never display-correct, never prompt "say the whole sentence."
5. "Say it again" replays with the same highlighting.

## What we deliberately did NOT do — honest trade-offs

- **LAMP-style motor-plan purism.** LAMP would reject any context-dependent word surfacing: one unique, byte-identical motor path per word, forever. We adopted the *principle* where it's independently evidenced (fixed positions, stable colors, no re-ranking — Thistle 2018; Dukhovny & Gahl 2014) but not the program: LAMP's own outcome evidence is weak (Bedwani et al. 2015 is n=8 uncontrolled; EBSCO notes little rigorous support), every dynamic-display system including PODD changes pages, and the under-6 navigation evidence favors contextual pruning. Trade-off owned: a word reached via funnel has a different path than via board. Mitigation: same relative slot + same color everywhere.
- **Word-first home page (the Proloquo2Go/TD Snap convention).** We invert it for the youngest users because the developmental-organization evidence (Fallon 2003; Drager 2003/2004) favors schematic/contextual entry under ~6 — but only because the word board stays one ungated tap away. If the escape hatch ever weakens, we become an outlier against every serious system.
- **Fitzgerald color coding.** Decades of convention, zero benefit (possible harm) for our band per the controlled studies. We chose interop-neutrality over tradition.
- **A question starter and grammar expansion (morphology, tense).** Real needs of the 6–8 band; deferred to keep the beginner funnel at 7 choices. The board and future scaffolds carry that growth path.
- **Requiring the funnel or auto-prompting fuller sentences.** The single most-documented harm pattern (requesting-trap, script reliance). The funnel is an offer, never a gate.

---

## Source list

**Peer-reviewed**
- Flippin, Reszka & Watson 2010, AJSLP — PECS meta-analysis
- Binger & Light 2007 & 2008; Binger et al. 2010 — aided modeling, telegraphic output, recasts
- Sutton, Soto & Blockberger 2002, AAC — graphic-symbol syntax
- Light & McNaughton 2014, AAC — communicative competence framework
- Spencer, Tönsing & Dada 2025, AAC — commenting review
- Light & Drager 2007, AAC; Drager et al. 2003 & 2004, JSLHR — young-child display/navigation learning
- Fallon, Light & Achilles 2003, AAC — event-schema organization
- Thistle & Wilkinson 2009 AJSLP; 2017 AAC ([PubMed 28617614](https://pubmed.ncbi.nlm.nih.gov/28617614/), correction [28670934](https://pubmed.ncbi.nlm.nih.gov/28670934/)); [PMC4599784](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4599784/) — background color & arrangement
- Light et al. 2019 state-of-science review, [PMC6436972](https://pmc.ncbi.nlm.nih.gov/articles/PMC6436972/)
- Thistle, Holmes, Horn & Reum 2018, AJSLP, [PubMed 29860450](https://pubmed.ncbi.nlm.nih.gov/29860450/) — consistent symbol location (verified 2026-07-11)
- Dukhovny & Gahl 2014, J Communication Disorders — motor plans & lexical recall
- Petroi, Koul & Corwin 2014 — navigation depth/array size (aphasia)
- Millar, Light & Schlosser 2006, JSLHR; Schlosser & Koul 2015 — speech output
- Schlosser & Blischak 2004, JSLHR; Schlosser et al. 1998, JADD — feedback modality
- Bredin-Oja & Fey 2014, AJSLP; Venker et al. 2019 — telegraphic vs grammatical input
- Sennott, Light & McNaughton 2016 — aided AAC modeling review
- Banajee, DiCarlo & Stricklin 2003, AAC — toddler core vocabulary
- Todman & Rzepecka 2003, AAC — pre-utterance pause & perceived competence; Todman TALK studies
- Bedrosian, Hoag & McCoy 2003, AAC; McCoy et al. 2007 — relevance vs speed trade-offs
- Higginbotham 1995, AJSLP + keystroke-savings literature — rate enhancement
- Bedwani, Bruck & Costley 2015, Cogent Education — LAMP evaluation (n=8, uncontrolled)
- Frontiers in Education 2024 PECS implementation review

**Clinical guidance / field practice**
- ASHA/NJC [Communication Bill of Rights](https://www.asha.org/njc/communication-bill-of-rights); ASHA AAC Practice Portal
- Porter & Cafiero — PODD pragmatic branch starters; PrAACtical AAC PODD write-ups
- Project Core Universal Core (GO, LIKE, NOT) — [project-core.com](http://www.project-core.com/communication-systems)
- AssistiveWare: Progressive Language, Communication Functions, Crescendo, Sentence Development Links
- Tobii Dynavox TD Snap Core First; Smartbox Super Core; CoughDrop Quick Core; Avaz; WordPower (Inman)
- Rachel Madel — "Stuck using I want?"; Mary Barbera — carrier-phrase critique; Meaningful Speech — GLP guidance; Carole Zangari (PrAACtical AAC) — on full sentences; Pyramid/PECS USA Phase IV materials
