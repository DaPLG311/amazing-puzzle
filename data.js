/* ============================================================
   The Amazing Puzzle™ — data (vocabulary, cast, voices, train)
   Emoji today; real photos / 3D drop into the same slots later.
   V1.1 build-out: a real, usable AAC board — core words first,
   ~15 worlds, ~250 words — and the Hola Pollito cast given life
   (each friend hosts a set of words + speaks in their own voice).
   ============================================================ */

/* ---- The Hola Pollito cast — each a real character with a JOB ---- */
const CAST = {
  pollito: {
    name:"Pollito", emoji:"🐤", color:"#EF4444", soft:"#FDE7E7",
    job:"greeter + word coach", voice:"pollito", home:"core",
    loves:"saying hola and finding new words",
    hello:"Hola, friend! Let's talk together!",
    line:"One word at a time. You can do it!",
  },
  ana: {
    name:"Ana", emoji:"🦊", color:"#F97316", soft:"#FFEEDC",
    job:"explorer", voice:"ana", home:"actions",
    loves:"adventures and figuring things out",
    hello:"Let's go exploring! What do you see?",
    line:"Ooh, what's next? Let's find it!",
  },
  benji: {
    name:"Benji", emoji:"🐻", color:"#60A5FA", soft:"#E5F0FE",
    job:"calm friend", voice:"benji", home:"body",
    loves:"quiet games and taking our time",
    hello:"Hi. It's okay. We can go slow.",
    line:"Take your time. I'll wait right here.",
  },
  coco: {
    name:"Coco", emoji:"🐱", color:"#FACC15", soft:"#FEF6D6",
    job:"feelings + music", voice:"coco", home:"feelings",
    loves:"singing, colors, and big feelings",
    hello:"Let's sing! How do you feel today?",
    line:"That sounds amazing! Your turn!",
  },
  freddy: {
    name:"Freddy", emoji:"🐸", color:"#34D399", soft:"#DDF7EE",
    job:"train conductor", voice:"freddy", home:"world",
    loves:"driving the train to every world",
    hello:"All aboard! Where should we go?",
    line:"Choo choo! Pick a place to explore!",
  },
};

/* ---- The TRAIN: bottom navigation as train cars. Freddy drives. ---- */
const TRAIN = [
  { id:"home",    label:"Home",    emoji:"🏠", color:"#FCE9E4" },
  { id:"talk",    label:"Talk",    emoji:"💬", color:"#E7F2FB" },
  { id:"world",   label:"Worlds",  emoji:"🧩", color:"#E6F6EE" },
  { id:"friends", label:"Friends", emoji:"🫂", color:"#FEF6D6" },
  { id:"stars",   label:"Stars",   emoji:"⭐", color:"#FBF3DA" },
];

/* ---- Voices → free on-device Web Speech (Piper/recordings layer over) ---- */
const VOICES = {
  sunny: { name:"Sunny", tag:"Bright & cheerful", rate:1.0,  pitch:1.24, match:["samantha","zira","google us","jenny","female"] },
  river: { name:"River", tag:"Calm & gentle",     rate:0.85, pitch:1.0,  match:["daniel","alex","google uk","aria","male"] },
  spark: { name:"Spark", tag:"Energetic & clear", rate:1.12, pitch:1.15, match:["karen","fred","google","nicky"] },
};

const PASTEL = ["#FCE9E4","#E7F2FB","#E6F6EE","#FBF3DA","#EFEAFB","#FDECEC","#E8F7F1","#F3ECFF"];

/* ---- Favorites row on Home (personalized in onboarding) ---- */
const FAVORITES = [
  { emoji:"🍕", label:"Pizza", speak:"pizza" },
  { emoji:"🐶", label:"Dog",   speak:"dog" },
  { emoji:"❤️", label:"Love",  speak:"love" },
  { emoji:"🏠", label:"Home",  speak:"home" },
];

/* ---- Categories (the board "worlds"). Each hosted by a cast member.
   core:true = protected (never moved/removed; picture/wording editable). ---- */
const CATEGORIES = {
  favorites: {
    label:"Favorites", emoji:"⭐", host:"pollito", mood:"#FFF3E0",
    cards:[
      {emoji:"🍕",label:"Pizza"}, {emoji:"🥤",label:"Drink",speak:"drink"}, {emoji:"🍎",label:"Apple"},
      {emoji:"😊",label:"Happy"}, {emoji:"🤗",label:"Hug"}, {emoji:"🐶",label:"Dog"},
      {emoji:"🏠",label:"Home"}, {emoji:"🚗",label:"Car"}, {emoji:"⚽",label:"Ball"},
      {emoji:"🧸",label:"Teddy"}, {emoji:"📺",label:"TV"}, {emoji:"🎵",label:"Music"},
    ],
  },

  /* THE core-word powerhouse — small, high-frequency, always leads the board */
  core: {
    label:"Core Words", emoji:"💬", host:"pollito", mood:"#EAF3FE",
    cards:[
      {emoji:"🙋",label:"I",speak:"I"}, {emoji:"👉",label:"you",speak:"you"},
      {emoji:"🙌",label:"want",speak:"want",core:true}, {emoji:"➕",label:"more",speak:"more",core:true},
      {emoji:"🛑",label:"stop",speak:"stop",core:true}, {emoji:"🚶",label:"go",speak:"go",core:true},
      {emoji:"🤲",label:"help",speak:"help",core:true}, {emoji:"👍",label:"yes",speak:"yes",core:true},
      {emoji:"👎",label:"no",speak:"no",core:true}, {emoji:"❤️",label:"like",speak:"I like it"},
      {emoji:"👀",label:"look",speak:"look"}, {emoji:"🔁",label:"again",speak:"again"},
      {emoji:"🔄",label:"my turn",speak:"my turn",core:true}, {emoji:"👋",label:"all done",speak:"all done",core:true},
      {emoji:"🙏",label:"please",speak:"please"}, {emoji:"💛",label:"thank you",speak:"thank you"},
      {emoji:"👆",label:"this one",speak:"this one"}, {emoji:"🆚",label:"different",speak:"different one"},
      {emoji:"🤔",label:"I don't know",speak:"I don't know"}, {emoji:"🫵",label:"your turn",speak:"your turn"},
    ],
  },

  people: {
    label:"People", emoji:"👨‍👩‍👧", host:"pollito", mood:"#FDECEC",
    /* real family photos from onboarding land on these cards (img face) */
    cards:[
      {emoji:"👩",label:"Mom"}, {emoji:"👨",label:"Dad"}, {emoji:"🙋",label:"Me"},
      {emoji:"👵",label:"Grandma"}, {emoji:"👴",label:"Grandpa"}, {emoji:"👧",label:"Sister"},
      {emoji:"👦",label:"Brother"}, {emoji:"👶",label:"Baby"}, {emoji:"🧑‍🤝‍🧑",label:"Friend"},
      {emoji:"👩‍🏫",label:"Teacher"}, {emoji:"🧑‍⚕️",label:"Doctor"}, {emoji:"👨‍👩‍👧",label:"Family"},
    ],
  },

  actions: {
    label:"Actions", emoji:"🏃", host:"ana", mood:"#FFEEDC",
    cards:[
      {emoji:"🚶",label:"go",speak:"go",core:true}, {emoji:"🛑",label:"stop",speak:"stop",core:true},
      {emoji:"🍽️",label:"eat",speak:"eat",core:true}, {emoji:"🥤",label:"drink",speak:"drink",core:true},
      {emoji:"🎮",label:"play",speak:"play"}, {emoji:"👀",label:"look",speak:"look"},
      {emoji:"👂",label:"listen"}, {emoji:"🤲",label:"help",speak:"help",core:true},
      {emoji:"🙌",label:"want",speak:"want",core:true}, {emoji:"🫴",label:"give"},
      {emoji:"🚪",label:"open"}, {emoji:"🔒",label:"close"}, {emoji:"🧼",label:"wash"},
      {emoji:"🏃",label:"run"}, {emoji:"🦘",label:"jump"}, {emoji:"🪑",label:"sit"},
      {emoji:"🧍",label:"stand"}, {emoji:"😴",label:"sleep"}, {emoji:"📖",label:"read"},
      {emoji:"🎤",label:"sing"}, {emoji:"💃",label:"dance"}, {emoji:"⏳",label:"wait"},
    ],
  },

  food: {
    label:"Food", emoji:"🍔", host:"pollito", mood:"#FFF1E0",
    cards:[
      {emoji:"🍽️",label:"eat",speak:"eat",core:true}, {emoji:"🍕",label:"Pizza"}, {emoji:"🍎",label:"Apple"},
      {emoji:"🍌",label:"Banana"}, {emoji:"🍪",label:"Cookie"}, {emoji:"🍞",label:"Bread"},
      {emoji:"🧀",label:"Cheese"}, {emoji:"🍇",label:"Grapes"}, {emoji:"🥕",label:"Carrot"},
      {emoji:"🍦",label:"Ice cream",speak:"ice cream"}, {emoji:"🥪",label:"Sandwich"}, {emoji:"🥚",label:"Egg"},
      {emoji:"🍚",label:"Rice"}, {emoji:"🍝",label:"Pasta"}, {emoji:"🍗",label:"Chicken"},
      {emoji:"🥣",label:"Cereal"}, {emoji:"🍓",label:"Strawberry"}, {emoji:"🍊",label:"Orange"},
      {emoji:"🥨",label:"Snack"}, {emoji:"🍰",label:"Cake"}, {emoji:"🍲",label:"Soup"},
    ],
  },

  drinks: {
    label:"Drinks", emoji:"🥤", host:"pollito", mood:"#E7F2FB",
    cards:[
      {emoji:"🥤",label:"drink",speak:"drink",core:true}, {emoji:"💧",label:"Water"}, {emoji:"🥛",label:"Milk"},
      {emoji:"🧃",label:"Juice"}, {emoji:"🍫",label:"Hot chocolate",speak:"hot chocolate"}, {emoji:"🫖",label:"Tea"},
      {emoji:"🧋",label:"Soda"}, {emoji:"🍹",label:"Smoothie"}, {emoji:"🍋",label:"Lemonade"},
    ],
  },

  feelings: {
    label:"Feelings", emoji:"💙", host:"coco", mood:"#F3ECFF",
    cards:[
      {emoji:"😊",label:"Happy"}, {emoji:"😢",label:"Sad"}, {emoji:"😠",label:"Angry"},
      {emoji:"😨",label:"Scared"}, {emoji:"❤️",label:"Love"}, {emoji:"😴",label:"Tired"},
      {emoji:"🥴",label:"Sick"}, {emoji:"😖",label:"Frustrated"}, {emoji:"🤩",label:"Excited"},
      {emoji:"😜",label:"Silly"}, {emoji:"😐",label:"Bored"}, {emoji:"🥰",label:"Calm"},
      {emoji:"😋",label:"Hungry"}, {emoji:"😰",label:"Worried"}, {emoji:"😌",label:"Okay",speak:"I'm okay"},
      {emoji:"🥲",label:"Proud"}, {emoji:"🙈",label:"Shy"}, {emoji:"😲",label:"Surprised"},
    ],
  },

  body: {
    label:"Body", emoji:"🖐️", host:"benji", mood:"#E5F0FE",
    cards:[
      {emoji:"🤕",label:"hurt",speak:"it hurts"}, {emoji:"😋",label:"hungry",speak:"I'm hungry"},
      {emoji:"😛",label:"thirsty",speak:"I'm thirsty"}, {emoji:"🥵",label:"hot"}, {emoji:"🥶",label:"cold"},
      {emoji:"😴",label:"tired"}, {emoji:"🙂",label:"Head"}, {emoji:"🦱",label:"Hair"},
      {emoji:"👁️",label:"Eyes"}, {emoji:"👂",label:"Ears"}, {emoji:"👃",label:"Nose"},
      {emoji:"👄",label:"Mouth"}, {emoji:"🦷",label:"Teeth"}, {emoji:"✋",label:"Hand"},
      {emoji:"💪",label:"Arm"}, {emoji:"🦵",label:"Leg"}, {emoji:"🦶",label:"Foot"},
      {emoji:"🖐️",label:"Fingers"}, {emoji:"😣",label:"Itchy"},
    ],
  },

  animals: {
    label:"Animals", emoji:"🐶", host:"ana", mood:"#E6F6EE",
    cards:[
      {emoji:"🐶",label:"Dog"}, {emoji:"🐱",label:"Cat"}, {emoji:"🐰",label:"Rabbit"},
      {emoji:"🐠",label:"Fish"}, {emoji:"🐦",label:"Bird"}, {emoji:"🐴",label:"Horse"},
      {emoji:"🦋",label:"Butterfly"}, {emoji:"🐸",label:"Frog"}, {emoji:"🐻",label:"Bear"},
      {emoji:"🐮",label:"Cow"}, {emoji:"🐷",label:"Pig"}, {emoji:"🦆",label:"Duck"},
      {emoji:"🐑",label:"Sheep"}, {emoji:"🦁",label:"Lion"}, {emoji:"🐘",label:"Elephant"},
      {emoji:"🐵",label:"Monkey"}, {emoji:"🐢",label:"Turtle"}, {emoji:"🐝",label:"Bee"},
      {emoji:"🦖",label:"Dinosaur"}, {emoji:"🐙",label:"Octopus"},
    ],
  },

  places: {
    label:"Places", emoji:"🏠", host:"ana", mood:"#EAF6FF",
    cards:[
      {emoji:"🏠",label:"Home"}, {emoji:"🏫",label:"School"}, {emoji:"🛝",label:"Park"},
      {emoji:"🏪",label:"Store"}, {emoji:"🚗",label:"Car"}, {emoji:"🌳",label:"Outside",speak:"outside"},
      {emoji:"🚻",label:"Bathroom"}, {emoji:"🛏️",label:"Bedroom"}, {emoji:"🍳",label:"Kitchen"},
      {emoji:"🏥",label:"Doctor"}, {emoji:"🎠",label:"Playground"}, {emoji:"📚",label:"Library"},
      {emoji:"🏖️",label:"Beach"}, {emoji:"🦁",label:"Zoo"}, {emoji:"🍽️",label:"Restaurant"},
      {emoji:"🏊",label:"Pool"},
    ],
  },

  play: {
    label:"Play", emoji:"🧩", host:"coco", mood:"#FEF6D6",
    cards:[
      {emoji:"🧩",label:"Puzzle"}, {emoji:"⚽",label:"Ball"}, {emoji:"🧸",label:"Teddy"},
      {emoji:"🎨",label:"Paint"}, {emoji:"🚂",label:"Train"}, {emoji:"🫧",label:"Bubbles"},
      {emoji:"🎮",label:"Game"}, {emoji:"📚",label:"Book"}, {emoji:"🧱",label:"Blocks"},
      {emoji:"🚗",label:"Cars"}, {emoji:"🪁",label:"Kite"}, {emoji:"🛝",label:"Slide"},
      {emoji:"🤸",label:"Swing"}, {emoji:"✏️",label:"Draw"}, {emoji:"🎵",label:"Music"},
      {emoji:"💃",label:"Dance"}, {emoji:"🙈",label:"Hide and seek",speak:"hide and seek"}, {emoji:"🪀",label:"Toy"},
    ],
  },

  colors: {
    label:"Colors", emoji:"🌈", host:"coco", mood:"#FBEAF4",
    cards:[
      {emoji:"🔴",label:"Red"}, {emoji:"🟠",label:"Orange"}, {emoji:"🟡",label:"Yellow"},
      {emoji:"🟢",label:"Green"}, {emoji:"🔵",label:"Blue"}, {emoji:"🟣",label:"Purple"},
      {emoji:"🌸",label:"Pink"}, {emoji:"🟤",label:"Brown"}, {emoji:"⚫",label:"Black"},
      {emoji:"⚪",label:"White"}, {emoji:"🌈",label:"Rainbow"},
    ],
  },

  numbers: {
    label:"Numbers", emoji:"🔢", host:"benji", mood:"#E9F0FB",
    cards:[
      {emoji:"1️⃣",label:"One",speak:"one"}, {emoji:"2️⃣",label:"Two",speak:"two"}, {emoji:"3️⃣",label:"Three",speak:"three"},
      {emoji:"4️⃣",label:"Four",speak:"four"}, {emoji:"5️⃣",label:"Five",speak:"five"}, {emoji:"6️⃣",label:"Six",speak:"six"},
      {emoji:"7️⃣",label:"Seven",speak:"seven"}, {emoji:"8️⃣",label:"Eight",speak:"eight"}, {emoji:"9️⃣",label:"Nine",speak:"nine"},
      {emoji:"🔟",label:"Ten",speak:"ten"}, {emoji:"➕",label:"more",speak:"more"}, {emoji:"➖",label:"less",speak:"less"},
    ],
  },

  clothes: {
    label:"Clothes", emoji:"👕", host:"benji", mood:"#EFEAFB",
    cards:[
      {emoji:"👕",label:"Shirt"}, {emoji:"👖",label:"Pants"}, {emoji:"👟",label:"Shoes"},
      {emoji:"🧦",label:"Socks"}, {emoji:"🧢",label:"Hat"}, {emoji:"🧥",label:"Coat"},
      {emoji:"👗",label:"Dress"}, {emoji:"🩳",label:"Shorts"}, {emoji:"🧤",label:"Gloves"},
      {emoji:"🥾",label:"Boots"}, {emoji:"🩲",label:"Underwear"}, {emoji:"🛌",label:"Pajamas"},
    ],
  },

  weather: {
    label:"Weather", emoji:"🌦️", host:"ana", mood:"#E7F4FB",
    cards:[
      {emoji:"☀️",label:"Sunny"}, {emoji:"🌧️",label:"Rainy"}, {emoji:"☁️",label:"Cloudy"},
      {emoji:"❄️",label:"Snowy"}, {emoji:"🌬️",label:"Windy"}, {emoji:"🥵",label:"Hot"},
      {emoji:"🥶",label:"Cold"}, {emoji:"⛈️",label:"Storm"}, {emoji:"🌈",label:"Rainbow"},
      {emoji:"🌫️",label:"Foggy"},
    ],
  },

  describing: {
    label:"Describing", emoji:"🔤", host:"benji", mood:"#EEF2F6",
    cards:[
      {emoji:"➕",label:"more",speak:"more",core:true}, {emoji:"👋",label:"all done",speak:"all done",core:true},
      {emoji:"🐘",label:"big"}, {emoji:"🐭",label:"little"}, {emoji:"🥵",label:"hot"}, {emoji:"🥶",label:"cold"},
      {emoji:"🏎️",label:"fast"}, {emoji:"🐢",label:"slow"}, {emoji:"📢",label:"loud"}, {emoji:"🤫",label:"quiet"},
      {emoji:"☁️",label:"soft"}, {emoji:"🧱",label:"hard"}, {emoji:"✨",label:"clean"}, {emoji:"🟤",label:"dirty"},
      {emoji:"💧",label:"wet"}, {emoji:"🌵",label:"dry"}, {emoji:"🆕",label:"new"}, {emoji:"🕰️",label:"old"},
      {emoji:"👍",label:"good"}, {emoji:"👎",label:"bad"},
    ],
  },
};

/* ---- "I Need" / Emergency (calm, always reachable) — all core:true ---- */
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

const CHILD = { name:"Jacob", avatar:"🧒" };

/* ---- SENTENCE STARTERS (the Talk funnel: 2 taps → a sentence) ----
   Each starter fuses subject+action; its sources are the ONLY word sets
   shown next, so the choice space stays small and obvious. Telegraphic
   joins are correct AAC ("Let's go park") — never grammar-corrected. */
const STARTERS = [
  { id:"want", label:"I want",   emoji:"🙌", color:"#FCE9E4",
    chips:[{emoji:"🙋",label:"I"},{emoji:"🙌",label:"want"}],
    sources:["favorites","food","drinks","play"] },
  { id:"feel", label:"I feel",   emoji:"💙", color:"#F3ECFF",
    chips:[{emoji:"🙋",label:"I"},{emoji:"💙",label:"feel"}],
    sources:["feelings"] },
  { id:"see",  label:"I see",    emoji:"👀", color:"#E6F6EE",
    chips:[{emoji:"🙋",label:"I"},{emoji:"👀",label:"see"}],
    template:"a {word}", noArticle:["colors"],   /* "I see a dog" / "I see red" / "I see Mom" */
    sources:["animals","people","colors"] },
  { id:"go",   label:"Let's go", emoji:"🚗", color:"#E7F2FB",
    chips:[{emoji:"🚗",label:"Let's go"}],
    template:"to the {word}", exceptions:{ "home":"home", "outside":"outside", "school":"to school" },
    sources:["places"] },
  { id:"dontwant", label:"I don't want", emoji:"🙅", color:"#FDE7E7",
    chips:[{emoji:"🙋",label:"I"},{emoji:"🙅",label:"don't want"}],
    sources:["favorites","food","drinks","play","places"] },
  { id:"need", label:"I need",   emoji:"🆘", color:"#FDECEC",
    chips:[{emoji:"🙋",label:"I"},{emoji:"🆘",label:"need"}],
    items:[
      {emoji:"🤲",label:"help"},{emoji:"⏸️",label:"a break"},{emoji:"🚻",label:"the bathroom"},
      {emoji:"🤗",label:"a hug"},{emoji:"💧",label:"water"},{emoji:"🍽️",label:"food"},
      {emoji:"🤫",label:"quiet"},{emoji:"👩",label:"Mom"},{emoji:"👨",label:"Dad"},
    ] },
  { id:"like", label:"I like",   emoji:"❤️", color:"#FBF3DA",
    chips:[{emoji:"🙋",label:"I"},{emoji:"❤️",label:"like"}],
    sources:["favorites","animals","play","colors"] },
];
