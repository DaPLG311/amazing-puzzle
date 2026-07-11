/* ============================================================
   The Amazing Puzzle™ — data (vocabulary, cast, voices, train)
   Grafted from the Canva design set (26 screens). Emoji today;
   real photos/3D drop into the same slots later.
   ============================================================ */

/* ---- The Hola Pollito cast (each has a JOB, never random) ---- */
const CAST = {
  pollito: { name:"Pollito", emoji:"🐤", color:"#EF4444", soft:"#FDE7E7", job:"greeter + board coach" },
  ana:     { name:"Ana",     emoji:"🦊", color:"#F97316", soft:"#FFEEDC", job:"discovery host" },
  benji:   { name:"Benji",   emoji:"🐻", color:"#60A5FA", soft:"#E5F0FE", job:"calm anchor" },
  coco:    { name:"Coco",    emoji:"🐱", color:"#FACC15", soft:"#FEF6D6", job:"feelings + music + voice" },
  freddy:  { name:"Freddy",  emoji:"🐸", color:"#34D399", soft:"#DDF7EE", job:"train conductor" },
};

/* ---- The TRAIN: bottom navigation as train cars on a track ---- */
/* Freddy drives the engine; each car is a destination. */
const TRAIN = [
  { id:"home",  label:"Home",  emoji:"🏠", color:"#FCE9E4" },
  { id:"talk",  label:"Talk",  emoji:"💬", color:"#E7F2FB" },
  { id:"stars", label:"Stars", emoji:"⭐", color:"#FBF3DA" },
  { id:"world", label:"World", emoji:"🧩", color:"#E6F6EE" },
];

/* ---- Voices (from screen 3.5). Mapped onto free on-device Web Speech.
   Piper / parent-recorded / per-character voices slot in later. ---- */
const VOICES = {
  sunny: { name:"Sunny", tag:"Bright & cheerful", rate:1.0, pitch:1.25, match:["samantha","zira","google us","jenny","female"] },
  river: { name:"River", tag:"Calm & gentle",     rate:0.85, pitch:1.0, match:["daniel","alex","google uk","aria","male"] },
  spark: { name:"Spark", tag:"Energetic & clear", rate:1.12, pitch:1.15, match:["karen","fred","google","nicky"] },
};

/* ---- Pastel tile palette (matches the design) ---- */
const PASTEL = ["#FCE9E4","#E7F2FB","#E6F6EE","#FBF3DA","#EFEAFB","#FDECEC","#E8F7F1","#F3ECFF"];

/* ---- Favorites row on Home ---- */
const FAVORITES = [
  { emoji:"🍕", label:"Pizza", speak:"pizza" },
  { emoji:"🐶", label:"Dog",   speak:"dog" },
  { emoji:"❤️", label:"Love",  speak:"love" },
  { emoji:"🏠", label:"Home",  speak:"home" },
];

/* ---- Categories (the board worlds). Each hosted by a cast member. ---- */
const CATEGORIES = {
  favorites: {
    label:"Favorites", emoji:"⭐", host:"pollito",
    cards:[
      {emoji:"🍕",label:"Pizza"}, {emoji:"🥤",label:"Drink",speak:"drink"}, {emoji:"🍎",label:"Apple"},
      {emoji:"😊",label:"Happy"}, {emoji:"😢",label:"Sad"}, {emoji:"🤗",label:"Hug"},
      {emoji:"🐶",label:"Dog"}, {emoji:"🐱",label:"Cat"}, {emoji:"🦋",label:"Butterfly"},
      {emoji:"🏠",label:"Home"}, {emoji:"🚗",label:"Car"}, {emoji:"⚽",label:"Ball"},
    ],
  },
  people: {
    label:"People", emoji:"👨‍👩‍👧", host:"pollito",
    /* Real family photos from onboarding land on these cards (img face). */
    cards:[
      {emoji:"👩",label:"Mom"}, {emoji:"👨",label:"Dad"},
      {emoji:"👵",label:"Grandma"}, {emoji:"👩‍🏫",label:"Teacher"},
      {emoji:"🙋",label:"Me"}, {emoji:"🧑‍🤝‍🧑",label:"Friend"},
    ],
  },
  food: {
    label:"Food", emoji:"🍔", host:"pollito",
    cards:[
      {emoji:"🍕",label:"Pizza"}, {emoji:"🍎",label:"Apple"}, {emoji:"🥤",label:"Juice",speak:"juice"},
      {emoji:"🍌",label:"Banana"}, {emoji:"🍪",label:"Cookie"}, {emoji:"🥛",label:"Milk"},
      {emoji:"🍞",label:"Bread"}, {emoji:"🧀",label:"Cheese"}, {emoji:"🍇",label:"Grapes"},
      {emoji:"🥕",label:"Carrot"}, {emoji:"🍦",label:"Ice cream",speak:"ice cream"}, {emoji:"🥪",label:"Sandwich"},
    ],
  },
  feelings: {
    label:"Feelings", emoji:"💙", host:"coco",
    cards:[
      {emoji:"😊",label:"Happy"}, {emoji:"😢",label:"Sad"}, {emoji:"😠",label:"Angry"},
      {emoji:"😨",label:"Scared"}, {emoji:"❤️",label:"Love"}, {emoji:"😴",label:"Tired"},
      {emoji:"🥴",label:"Sick"}, {emoji:"😖",label:"Frustrated"}, {emoji:"🤩",label:"Excited"},
      {emoji:"😜",label:"Silly"}, {emoji:"😐",label:"Bored"}, {emoji:"🥰",label:"Calm"},
    ],
  },
  animals: {
    label:"Animals", emoji:"🐶", host:"ana",
    cards:[
      {emoji:"🐶",label:"Dog"}, {emoji:"🐱",label:"Cat"}, {emoji:"🐰",label:"Rabbit"},
      {emoji:"🐠",label:"Fish"}, {emoji:"🐦",label:"Bird"}, {emoji:"🐴",label:"Horse"},
      {emoji:"🦋",label:"Butterfly"}, {emoji:"🐸",label:"Frog"}, {emoji:"🐻",label:"Bear"},
    ],
  },
  places: {
    label:"Places", emoji:"🏠", host:"ana",
    cards:[
      {emoji:"🏠",label:"Home"}, {emoji:"🏫",label:"School"}, {emoji:"🛝",label:"Park"},
      {emoji:"🏪",label:"Store"}, {emoji:"🚗",label:"Car"}, {emoji:"🌳",label:"Outside",speak:"outside"},
      {emoji:"🚻",label:"Bathroom"},
    ],
  },
  play: {
    label:"Play", emoji:"🧩", host:"coco",
    cards:[
      {emoji:"🧩",label:"Puzzle"}, {emoji:"⚽",label:"Ball"}, {emoji:"🧸",label:"Teddy"},
      {emoji:"🎨",label:"Paint"}, {emoji:"🚂",label:"Train"}, {emoji:"🫧",label:"Bubbles"},
      {emoji:"🎮",label:"Game"}, {emoji:"📚",label:"Book"},
    ],
  },
};

/* ---- "I Need" / Emergency (calm, always reachable, Benji present) ----
   Every card is core:true — editable wording/picture, never removable/movable. */
const NEEDS = [
  {emoji:"🆘",label:"Help",speak:"I need help",bg:"#FDECEC",core:true},
  {emoji:"🛑",label:"Stop",bg:"#FDE7E7",core:true},
  {emoji:"🚻",label:"Bathroom",speak:"I need the bathroom",bg:"#E7F2FB",core:true},
  {emoji:"⏸️",label:"Break",speak:"I need a break",bg:"#E6F6EE",core:true},
  {emoji:"🤕",label:"Hurt",speak:"I am hurt",bg:"#FBF3DA",core:true},
  {emoji:"👍",label:"Yes",bg:"#E8F7F1",core:true},
  {emoji:"👎",label:"No",bg:"#EFEAFB",core:true},
  {emoji:"👩",label:"Mom",bg:"#FDECEC",core:true},
  {emoji:"👨",label:"Dad",bg:"#E7F2FB",core:true},
];

/* child profile (from the design: "Hi Jacob!") */
const CHILD = { name:"Jacob", avatar:"🧒" };
