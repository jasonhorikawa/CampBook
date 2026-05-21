import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
async function signUp() {
  const email = prompt("Enter email");
  if (!email) return;

  const password = prompt("Create password");
  if (!password) return;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Account created!");
  }
}
async function signIn() {
  const email = prompt("Enter email");
  if (!email) return;

  const password = prompt("Enter password");
  if (!password) return;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Signed in!");
    const trips = await loadTripsFromSupabase();

if (trips.length > 0) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...loadData(),
      entries: trips
        .map((t) => ({ ...t.trip_data, supabase_id: t.id }))
        .filter(Boolean),
    })
  );
}

window.location.reload();
  }
}
async function loadTripsFromSupabase() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    alert("Load failed: " + error.message);
    return [];
  }

  return data;
}
function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}
async function uploadTripPhoto(file) {
  file = await compressImage(file);
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("trip-photos")
    .upload(fileName, file);

  if (error) {
    alert("Upload failed: " + error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("trip-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
async function saveTripToSupabase() {
  const title = prompt("Campground name?");
  if (!title) return;

  const location = prompt("Location?") || "";
const {
  data: { user },
} = await supabase.auth.getUser();
  const { error } = await supabase.from("trips").insert([
    {
      title,
      location,
      user_id: user.id,
    },
  ]);

  if (error) {
    alert("Save failed: " + error.message);
  } else {
    alert("Trip saved to Supabase!");
  }
}
const P = {
  bg: "#F2EDE3",
  card: "#FDFAF4",
  forest: "#1E3A1E",
  pine: "#3A6645",
  earth: "#7A5530",
  amber: "#C8790A",
  cream: "#E8D8B8",
  text: "#18100A",
  muted: "#7A6A55",
  border: "#CCB898",
  water: "#2A5C7A",
  red: "#A83030",
  gold: "#D4A017",
  teal: "#2A7A6A",
};
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const STORAGE_KEY = "campbook_v10";

// ── Storage ───────────────────────────────────────────────
function loadData() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (r) return JSON.parse(r);
  } catch (e) {}
  return {
    entries: [],
    pins: SAMPLE_PINS,
    profiles: [
      { id: "p1", name: "Me", emoji: "👤", color: P.pine },
      { id: "p2", name: "Family", emoji: "👨‍👩‍👧", color: P.amber },
    ],
    friends: INITIAL_FRIENDS,
    favorites: [],
    bucketList: [],
    darkMode: false,
  };
}
function saveData(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (e) {}
}

// ── Mock data ─────────────────────────────────────────────
const INITIAL_FRIENDS = [
  {
    id: "f1",
    name: "Mike R.",
    avatar: "🧔",
    color: "#2A5C7A",
    status: "friend",
    lastActive: "2 days ago",
  },
  {
    id: "f2",
    name: "Sarah K.",
    avatar: "👩",
    color: "#7A5530",
    status: "friend",
    lastActive: "1 week ago",
  },
  {
    id: "f3",
    name: "The Johnsons",
    avatar: "👨‍👩‍👦",
    color: "#5A7A5A",
    status: "friend",
    lastActive: "yesterday",
  },
  {
    id: "f4",
    name: "Dave T.",
    avatar: "🧑‍🦱",
    color: "#A83030",
    status: "pending",
    lastActive: null,
  },
];
const FEED = [
  {
    id: "fd1",
    userId: "f1",
    userName: "Mike R.",
    userAvatar: "🧔",
    userColor: "#2A5C7A",
    campground: "Sherwin Creek Campground",
    location: "Mammoth Lakes, CA",
    dates: "Apr 26 – May 2",
    nights: 6,
    site: "14",
    emoji: "🏔️",
    rating: 5,
    returnWorthy: true,
    weather: "☀️ Hot & Sunny",
    notes:
      "Best trip of the year. Site 14 backs right up to the creek with morning shade. Kids caught 8 trout on day 2.",
    photos: ["🏔️", "🎣", "🔥"],
    wishlist: [{ site: "22", note: "Looked even more private" }],
    likes: 4,
    comments: 2,
    timeAgo: "3 hours ago",
  },
  {
    id: "fd2",
    userId: "f3",
    userName: "The Johnsons",
    userAvatar: "👨‍👩‍👦",
    userColor: "#5A7A5A",
    campground: "Lake Cachuma Recreation Area",
    location: "Santa Barbara, CA",
    dates: "May 10 – May 12",
    nights: 2,
    site: "78",
    emoji: "🏞️",
    rating: 4,
    returnWorthy: true,
    weather: "🌤 Warm & Clear",
    notes:
      "Perfect family weekend. Bass fishing was incredible off the dock at site 78. Kids want to go back every month.",
    photos: ["🏞️", "🚣", "🌅"],
    wishlist: [],
    likes: 7,
    comments: 3,
    timeAgo: "2 days ago",
  },
  {
    id: "fd3",
    userId: "f2",
    userName: "Sarah K.",
    userAvatar: "👩",
    userColor: "#7A5530",
    campground: "Kirk Creek Campground",
    location: "Big Sur, CA",
    dates: "Apr 18 – Apr 20",
    nights: 2,
    site: "9",
    emoji: "🌊",
    rating: 5,
    returnWorthy: true,
    weather: "⛅ Partly Cloudy",
    notes:
      "Site 9 has the most insane ocean view. Fog rolling over the cliffs at dawn. Absolute dream.",
    photos: ["🌊", "🌅", "🏕️"],
    wishlist: [{ site: "4", note: "Right on the cliff edge" }],
    likes: 12,
    comments: 5,
    timeAgo: "4 days ago",
  },
];

// ── Campground DB ─────────────────────────────────────────
const DB = [
  {
    id: 1,
    name: "Lake Cachuma Recreation Area",
    location: "Santa Barbara, CA",
    elevation: "750 ft",
    description:
      "A gorgeous reservoir campground in the Santa Ynez Valley, popular for bass and catfish fishing. Oak-shaded sites line the water's edge with stunning views of the Santa Ynez Mountains.",
    activities: [
      "Fishing",
      "Kayaking",
      "Swimming",
      "Hiking",
      "Wildlife Viewing",
      "Boating",
    ],
    amenities: [
      "Flush Toilets",
      "Hot Showers",
      "Boat Launch",
      "Full Hookups",
      "Camp Store",
    ],
    sites: 400,
    rating: 4.6,
    reviews: 812,
    emoji: "🏞️",
    tags: ["lake", "cachuma", "santa barbara", "california", "fishing", "bass"],
  },
  {
    id: 2,
    name: "Sherwin Creek Campground",
    location: "Mammoth Lakes, CA",
    elevation: "7,600 ft",
    description:
      "Nestled along Sherwin Creek in the Eastern Sierra, world-class trout fishing and stunning mountain views. Tall pines provide excellent shade and a creek-side soundtrack all night.",
    activities: [
      "Trout Fishing",
      "Hiking",
      "Wildlife Viewing",
      "Mountain Biking",
      "Photography",
    ],
    amenities: ["Vault Toilets", "Fire Rings", "Picnic Tables", "Bear Boxes"],
    sites: 87,
    rating: 4.8,
    reviews: 342,
    emoji: "🏔️",
    tags: ["sherwin", "mammoth", "eastern sierra", "trout", "fishing", "creek"],
  },
  {
    id: 3,
    name: "Tuolumne Meadows",
    location: "Yosemite NP, CA",
    elevation: "8,600 ft",
    description:
      "High-altitude subalpine meadow camping in the heart of Yosemite. Gateway to Half Dome and Cathedral Lakes.",
    activities: [
      "Backpacking",
      "Rock Climbing",
      "Star Gazing",
      "Fly Fishing",
      "Hiking",
    ],
    amenities: ["Flush Toilets", "Bear Boxes", "Ranger Station", "Fire Rings"],
    sites: 304,
    rating: 4.7,
    reviews: 891,
    emoji: "⛰️",
    tags: [
      "yosemite",
      "tuolumne",
      "meadows",
      "sierra",
      "national park",
      "california",
    ],
  },
  {
    id: 4,
    name: "Kirk Creek Campground",
    location: "Big Sur, CA",
    elevation: "100 ft",
    description:
      "Perched on a cliff above the Pacific with unobstructed ocean views. Fall asleep to crashing waves.",
    activities: [
      "Coastal Hiking",
      "Tidepooling",
      "Whale Watching",
      "Photography",
      "Surfing",
    ],
    amenities: ["Vault Toilets", "Fire Rings", "Picnic Tables"],
    sites: 33,
    rating: 4.9,
    reviews: 621,
    emoji: "🌊",
    tags: ["big sur", "ocean", "coastal", "pacific", "california", "cliffs"],
  },
  {
    id: 5,
    name: "Jenny Lake Campground",
    location: "Grand Teton NP, WY",
    elevation: "6,800 ft",
    description:
      "Steps from stunning Jenny Lake with jagged Tetons as backdrop. Tent-only sites keep it peaceful.",
    activities: [
      "Hiking",
      "Rock Climbing",
      "Kayaking",
      "Wildlife Viewing",
      "Photography",
    ],
    amenities: ["Flush Toilets", "Bear Boxes", "Ranger Talks", "Fire Rings"],
    sites: 49,
    rating: 4.9,
    reviews: 743,
    emoji: "🏔️",
    tags: [
      "jenny lake",
      "grand teton",
      "wyoming",
      "national park",
      "mountains",
      "hiking",
    ],
  },
  {
    id: 6,
    name: "Zion South Campground",
    location: "Springdale, UT",
    elevation: "3,900 ft",
    description:
      "Sleep right inside Zion Canyon, steps from the Virgin River and iconic red sandstone walls.",
    activities: [
      "Hiking",
      "Canyoneering",
      "Swimming",
      "Rock Climbing",
      "Stargazing",
    ],
    amenities: [
      "Flush Toilets",
      "Fire Rings",
      "Amphitheater",
      "Shuttle Access",
    ],
    sites: 126,
    rating: 4.8,
    reviews: 892,
    emoji: "🏜️",
    tags: ["zion", "utah", "national park", "canyon", "red rocks", "desert"],
  },
  {
    id: 7,
    name: "Crater Lake Mazama",
    location: "Crater Lake NP, OR",
    elevation: "6,000 ft",
    description:
      "Camp inside the caldera rim of the world's deepest lake. Milky Way views are extraordinary.",
    activities: [
      "Stargazing",
      "Hiking",
      "Photography",
      "Scenic Drives",
      "Swimming",
    ],
    amenities: [
      "Flush Toilets",
      "Hot Showers",
      "Camp Store",
      "Fire Rings",
      "Hookups",
    ],
    sites: 214,
    rating: 4.7,
    reviews: 589,
    emoji: "🌋",
    tags: ["crater lake", "oregon", "national park", "blue lake", "volcanic"],
  },
  {
    id: 8,
    name: "Cottonwood Campground",
    location: "Joshua Tree NP, CA",
    elevation: "3,000 ft",
    description:
      "Desert camping surrounded by cholla cactus gardens and sweeping Colorado Desert views.",
    activities: [
      "Rock Climbing",
      "Stargazing",
      "Hiking",
      "Photography",
      "Desert Exploration",
    ],
    amenities: ["Flush Toilets", "Fire Rings", "Picnic Tables", "Bear Boxes"],
    sites: 62,
    rating: 4.5,
    reviews: 367,
    emoji: "🌵",
    tags: [
      "joshua tree",
      "desert",
      "california",
      "national park",
      "cactus",
      "rocks",
    ],
  },
  {
    id: 9,
    name: "Moraine Park — Rocky Mountain NP",
    location: "Estes Park, CO",
    elevation: "8,160 ft",
    description:
      "Camp in a glacially carved valley surrounded by 12,000-foot peaks. Elk graze through camp at dawn and dusk.",
    activities: [
      "Hiking",
      "Wildlife Viewing",
      "Fishing",
      "Stargazing",
      "Photography",
    ],
    amenities: [
      "Flush Toilets",
      "Hot Showers",
      "Amphitheater",
      "Fire Rings",
      "Bear Boxes",
    ],
    sites: 245,
    rating: 4.7,
    reviews: 763,
    emoji: "🦌",
    tags: [
      "rocky mountain",
      "colorado",
      "national park",
      "elk",
      "mountains",
      "estes park",
    ],
  },
  {
    id: 10,
    name: "Boundary Waters Entry 30",
    location: "Ely, MN",
    elevation: "1,350 ft",
    description:
      "Gateway to the legendary BWCA — a million-acre network of lakes and portages where motorboats are banned.",
    activities: [
      "Canoeing",
      "Fishing",
      "Portaging",
      "Wildlife Viewing",
      "Kayaking",
    ],
    amenities: ["Vault Toilets", "Canoe Launch", "Bear Boxes"],
    sites: 24,
    rating: 4.9,
    reviews: 287,
    emoji: "🛶",
    tags: [
      "boundary waters",
      "minnesota",
      "canoe",
      "wilderness",
      "bwca",
      "fishing",
      "lakes",
    ],
  },
  {
    id: 11,
    name: "Bryce Canyon North",
    location: "Bryce Canyon NP, UT",
    elevation: "8,000 ft",
    description:
      "Camp among the hoodoos at the canyon rim. Sunrises are legendary — orange spires light up at dawn.",
    activities: [
      "Hiking",
      "Stargazing",
      "Photography",
      "Snowshoeing",
      "Wildlife Viewing",
    ],
    amenities: ["Flush Toilets", "Camp Store", "Shuttle Access", "Fire Rings"],
    sites: 99,
    rating: 4.8,
    reviews: 643,
    emoji: "🏜️",
    tags: [
      "bryce canyon",
      "utah",
      "hoodoos",
      "stargazing",
      "national park",
      "red rocks",
    ],
  },
  {
    id: 12,
    name: "Pismo State Beach",
    location: "Pismo Beach, CA",
    elevation: "50 ft",
    description:
      "Drive onto the sand and camp right on the beach — one of the few places in California you can do so.",
    activities: [
      "Beach Camping",
      "Clamming",
      "OHV Riding",
      "Surfing",
      "Whale Watching",
    ],
    amenities: ["Flush Toilets", "Hot Showers", "Hookups", "Camp Store"],
    sites: 103,
    rating: 4.4,
    reviews: 521,
    emoji: "🏖️",
    tags: ["pismo", "beach", "california", "ocean", "dunes", "coastal"],
  },
  {
    id: 13,
    name: "Great Smoky Elkmont",
    location: "Gatlinburg, TN",
    elevation: "2,150 ft",
    description:
      "The Little River runs through offering excellent swimming holes and brown trout fishing. Fireflies in June.",
    activities: [
      "Fishing",
      "Hiking",
      "Swimming",
      "Wildlife Viewing",
      "Waterfall Tours",
    ],
    amenities: ["Flush Toilets", "Fire Rings", "Amphitheater", "Picnic Tables"],
    sites: 220,
    rating: 4.6,
    reviews: 1123,
    emoji: "🌿",
    tags: [
      "smoky mountains",
      "tennessee",
      "national park",
      "fireflies",
      "fishing",
      "hiking",
    ],
  },
  {
    id: 14,
    name: "Sequoia Lodgepole",
    location: "Three Rivers, CA",
    elevation: "6,700 ft",
    description:
      "Camp among the largest trees on Earth. The General Sherman Tree is a short walk away.",
    activities: [
      "Hiking",
      "Photography",
      "Wildlife Viewing",
      "Fishing",
      "Rock Climbing",
    ],
    amenities: [
      "Flush Toilets",
      "Hot Showers",
      "Camp Store",
      "Amphitheater",
      "Bear Boxes",
    ],
    sites: 214,
    rating: 4.7,
    reviews: 621,
    emoji: "🌲",
    tags: [
      "sequoia",
      "california",
      "national park",
      "giant trees",
      "hiking",
      "kings canyon",
    ],
  },
  {
    id: 15,
    name: "Assateague Island Seashore",
    location: "Berlin, MD",
    elevation: "10 ft",
    description:
      "Camp on a barrier island with wild ponies roaming freely. Atlantic on one side, bay on the other.",
    activities: [
      "Beach Camping",
      "Wildlife Viewing",
      "Surfing",
      "Crabbing",
      "Kayaking",
    ],
    amenities: ["Flush Toilets", "Cold Showers", "Fire Rings", "Boat Launch"],
    sites: 154,
    rating: 4.7,
    reviews: 521,
    emoji: "🐴",
    tags: [
      "assateague",
      "maryland",
      "wild ponies",
      "beach",
      "atlantic",
      "east coast",
      "ocean",
    ],
  },
  {
    id: 16,
    name: "Colorado River — Moab",
    location: "Moab, UT",
    elevation: "4,000 ft",
    description:
      "Camp along the Colorado River just outside Moab, gateway to Arches and Canyonlands.",
    activities: [
      "Mountain Biking",
      "Rafting",
      "Hiking",
      "Photography",
      "Rock Climbing",
    ],
    amenities: ["Vault Toilets", "Fire Rings", "Picnic Tables"],
    sites: 56,
    rating: 4.6,
    reviews: 412,
    emoji: "🏜️",
    tags: [
      "moab",
      "utah",
      "colorado river",
      "red rocks",
      "arches",
      "canyonlands",
      "biking",
    ],
  },
  {
    id: 17,
    name: "Lake Wenatchee State Park",
    location: "Leavenworth, WA",
    elevation: "1,900 ft",
    description:
      "Crystal-clear glacial lake camping with sandy beach in the North Cascades. Perfect for families.",
    activities: ["Swimming", "Kayaking", "Fishing", "Hiking", "Volleyball"],
    amenities: [
      "Flush Toilets",
      "Hot Showers",
      "Boat Launch",
      "Playground",
      "Fire Rings",
    ],
    sites: 197,
    rating: 4.6,
    reviews: 428,
    emoji: "🏕️",
    tags: ["wenatchee", "lake", "washington", "cascades", "family", "swimming"],
  },
  {
    id: 18,
    name: "Padre Island Seashore",
    location: "Corpus Christi, TX",
    elevation: "5 ft",
    description:
      "The longest undeveloped barrier island in the world. Sea turtle nesting season runs spring through summer.",
    activities: [
      "Beach Camping",
      "Surf Fishing",
      "OHV Driving",
      "Wildlife Viewing",
      "Kiteboarding",
    ],
    amenities: ["Flush Toilets", "Cold Showers", "Fire Rings"],
    sites: 48,
    rating: 4.5,
    reviews: 312,
    emoji: "🐢",
    tags: [
      "padre island",
      "texas",
      "beach",
      "gulf coast",
      "sea turtles",
      "barrier island",
    ],
  },
  {
    id: 19,
    name: "Acadia Blackwoods",
    location: "Bar Harbor, ME",
    elevation: "100 ft",
    description:
      "A short pedal from carriage roads and rocky coastline. Thick spruce and fir forest provides shade.",
    activities: [
      "Cycling",
      "Coastal Hiking",
      "Kayaking",
      "Whale Watching",
      "Tidepooling",
    ],
    amenities: ["Flush Toilets", "Hot Showers", "Fire Rings", "Amphitheater"],
    sites: 281,
    rating: 4.6,
    reviews: 632,
    emoji: "🌲",
    tags: [
      "acadia",
      "maine",
      "national park",
      "coastal",
      "east coast",
      "atlantic",
    ],
  },
  {
    id: 20,
    name: "Morro Bay State Park",
    location: "Morro Bay, CA",
    elevation: "20 ft",
    description:
      "Camp in the shadow of Morro Rock. Great for kayaking the estuary, clamming, and watching otters.",
    activities: ["Kayaking", "Fishing", "Birdwatching", "Clamming", "Hiking"],
    amenities: [
      "Flush Toilets",
      "Hot Showers",
      "Hookups",
      "Fire Rings",
      "Boat Launch",
    ],
    sites: 135,
    rating: 4.5,
    reviews: 387,
    emoji: "🪨",
    tags: ["morro bay", "california", "coastal", "ocean", "estuary", "birds"],
  },
];

function searchDB(q) {
  if (!q.trim()) return [];
  const query = q.toLowerCase().trim();
  const words = query.split(/\s+/);
  const scored = DB.map((c) => {
    const hay = [
      c.name,
      c.location,
      c.description,
      ...c.activities,
      ...(c.tags || []),
    ]
      .join(" ")
      .toLowerCase();
    let s = 0;
    if (c.name.toLowerCase().includes(query)) s += 100;
    words.forEach((w) => {
      if (hay.includes(w)) s += 10;
      if (c.name.toLowerCase().includes(w)) s += 20;
      if (c.location.toLowerCase().includes(w)) s += 15;
      if ((c.tags || []).some((t) => t.includes(w))) s += 12;
    });
    return { camp: c, score: s };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.camp);
}

// ── Packing ───────────────────────────────────────────────
const PACK = {
  fishing: [
    "Fishing rods & reels",
    "Tackle box",
    "Fishing license",
    "Bait / lures",
    "Net & pliers",
    "Cooler for catch",
    "Waders",
    "Polarized sunglasses",
  ],
  hiking: [
    "Hiking boots",
    "Trekking poles",
    "Daypack",
    "Trail map / GPS",
    "Headlamp",
    "First aid kit",
    "Sun hat",
    "Sunscreen",
  ],
  swimming: [
    "Swimsuits",
    "Beach towels",
    "Sunscreen",
    "Water shoes",
    "Inflatable tubes",
    "Life jackets (kids)",
    "Dry bags",
  ],
  kayaking: [
    "Kayak / canoe",
    "Paddles",
    "Life jackets",
    "Dry bags",
    "Water shoes",
    "Bilge pump",
    "Rope",
  ],
  base: [
    "Tent & stakes",
    "Sleeping bags",
    "Sleeping pads",
    "Camp chairs",
    "Lantern",
    "Matches / lighter",
    "Firewood",
    "Trash bags",
    "Toilet paper",
    "Hand sanitizer",
    "First aid kit",
    "Water filter",
    "Food & cooler",
    "Camp stove & fuel",
    "Cooking utensils",
    "Plates & cups",
    "Knife",
    "Phone charger",
    "Bug spray",
    "Rain gear",
  ],
};
function buildPacking(acts = []) {
  const list = new Set(PACK.base);
  acts.forEach((a) => {
    const k = a.toLowerCase();
    if (k.includes("fish")) PACK.fishing.forEach((i) => list.add(i));
    if (k.includes("hik")) PACK.hiking.forEach((i) => list.add(i));
    if (k.includes("swim")) PACK.swimming.forEach((i) => list.add(i));
    if (k.includes("kayak") || k.includes("canoe"))
      PACK.kayaking.forEach((i) => list.add(i));
  });
  return [...list].map((item) => ({
    item,
    checked: false,
    id: Math.random().toString(36).slice(2),
  }));
}

// ── Pin types ─────────────────────────────────────────────
const PIN_TYPES = [
  {
    id: "fishing",
    icon: "🎣",
    label: "Fishing Spot",
    color: "#2A5C7A",
    desc: "Best spots, what you caught",
  },
  {
    id: "trail",
    icon: "🥾",
    label: "Trail / Hike",
    color: "#3A6645",
    desc: "Trails, distances, difficulty",
  },
  {
    id: "swimming",
    icon: "🏊",
    label: "Swimming Hole",
    color: "#1A7A8A",
    desc: "Hidden pools, safe spots",
  },
  {
    id: "view",
    icon: "🌄",
    label: "Scenic View",
    color: "#7A5530",
    desc: "Sunsets, overlooks, photo spots",
  },
  {
    id: "wildlife",
    icon: "🦌",
    label: "Wildlife Spot",
    color: "#5A7A2A",
    desc: "Where you saw animals",
  },
  {
    id: "camp",
    icon: "🏕️",
    label: "Camp Feature",
    color: "#C8790A",
    desc: "Fire rings, water sources",
  },
  {
    id: "danger",
    icon: "⚠️",
    label: "Hazard / Avoid",
    color: "#A83030",
    desc: "Rough roads, dangerous areas",
  },
  {
    id: "hidden",
    icon: "💎",
    label: "Hidden Gem",
    color: "#6A3A8A",
    desc: "Secret spots worth remembering",
  },
];
const getPinType = (id) => PIN_TYPES.find((p) => p.id === id) || PIN_TYPES[0];

const SAMPLE_PINS = [
  {
    id: "sp1",
    campName: "Sherwin Creek Campground",
    type: "fishing",
    title: "Rush Creek Bend",
    desc: "Best trout spot — cast upstream from the fallen log. Morning only. Caught 6 here on Aug 12.",
    distance: "0.4mi from Site 42",
    rating: 5,
    date: "2024-08-12",
  },
  {
    id: "sp2",
    campName: "Sherwin Creek Campground",
    type: "view",
    title: "Sunrise Ridge",
    desc: "Follow trail behind site 30 for 10 min. Best sunrise view in the campground, 180° of Sierra peaks.",
    distance: "0.3mi from camp",
    rating: 5,
    date: "2024-08-11",
  },
  {
    id: "sp3",
    campName: "Sherwin Creek Campground",
    type: "swimming",
    title: "Deep Pool at the Bend",
    desc: "About half a mile downstream. Crystal clear, waist deep, perfect for kids. Flat rocks for sunbathing.",
    distance: "0.5mi downstream",
    rating: 4,
    date: "2024-08-13",
  },
  {
    id: "sp4",
    campName: "Lake Cachuma Recreation Area",
    type: "fishing",
    title: "Oak Point Dock",
    desc: "Bass were hitting surface lures at dawn. Walk past site 78 to the oak grove, dock is at the end.",
    distance: "Near Site 78",
    rating: 5,
    date: "2024-07-04",
  },
  {
    id: "sp5",
    campName: "Lake Cachuma Recreation Area",
    type: "wildlife",
    title: "Eagle Nest Tree",
    desc: "Two bald eagles nesting in the dead ponderosa near the boat ramp. Best viewing around 7am.",
    distance: "Near boat ramp",
    rating: 5,
    date: "2024-07-05",
  },
];

// ── UI helpers ────────────────────────────────────────────
const Tag = ({ label, color = P.pine, small }) => (
  <span
    style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: small ? "1px 8px" : "2px 10px",
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
    }}
  >
    {label}
  </span>
);
const Stars = ({ n, onRate, size = 15 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        onClick={() => onRate?.(s)}
        style={{
          fontSize: size,
          cursor: onRate ? "pointer" : "default",
          color: s <= n ? P.amber : P.border,
        }}
      >
        ★
      </span>
    ))}
  </div>
);
const Btn = ({
  children,
  onClick,
  color = P.forest,
  outline,
  full,
  small,
  sx,
}) => (
  <button
    onClick={onClick}
    style={{
      background: outline ? "transparent" : color,
      color: outline ? color : "#F4EFE6",
      border: outline ? `1.5px solid ${color}` : "none",
      borderRadius: 10,
      padding: small ? "6px 14px" : "10px 18px",
      fontSize: small ? 12 : 14,
      fontFamily: "'Lora',Georgia,serif",
      fontWeight: 700,
      cursor: "pointer",
      width: full ? "100%" : undefined,
      ...sx,
    }}
  >
    {children}
  </button>
);
const SLabel = ({ children, mt }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: P.muted,
      marginBottom: 8,
      marginTop: mt || 16,
      paddingBottom: 5,
      borderBottom: `1px solid ${P.border}`,
    }}
  >
    {children}
  </div>
);
const Inp = ({ value, onChange, placeholder, type }) => (
  <input
    type={type || "text"}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%",
      padding: "10px 12px",
      background: "#fff",
      border: `1.5px solid ${P.border}`,
      borderRadius: 10,
      fontSize: 15,
      fontFamily: "'Lora',Georgia,serif",
      color: P.text,
      outline: "none",
      boxSizing: "border-box",
      marginBottom: 10,
    }}
  />
);
const Avatar = ({ emoji, color, size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color + "22",
      border: `2px solid ${color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
    }}
  >
    {emoji}
  </div>
);
const Check = ({ label, checked, onChange, icon }) => (
  <button
    onClick={onChange}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      background: "none",
      border: "none",
      padding: "8px 0",
      cursor: "pointer",
      textAlign: "left",
      borderBottom: `1px solid ${P.border + "88"}`,
    }}
  >
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: `2px solid ${checked ? P.pine : P.border}`,
        background: checked ? P.pine : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {checked && (
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>
      )}
    </div>
    <span
      style={{
        fontSize: 14,
        fontFamily: "'Lora',Georgia,serif",
        color: checked ? P.forest : P.text,
        fontWeight: checked ? 700 : 400,
      }}
    >
      {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
      {label}
    </span>
  </button>
);
const Chip = ({ label, selected, onChange, color = P.pine }) => (
  <button
    onClick={onChange}
    style={{
      padding: "6px 13px",
      borderRadius: 20,
      border: `1.5px solid ${selected ? color : P.border}`,
      background: selected ? color + "22" : "transparent",
      color: selected ? color : P.muted,
      fontFamily: "'Lora',Georgia,serif",
      fontSize: 13,
      cursor: "pointer",
      fontWeight: selected ? 700 : 400,
      marginBottom: 6,
    }}
  >
    {label}
  </button>
);

const S = {
  app: {
    minHeight: "100vh",
    background: P.bg,
    fontFamily: "'Lora',Georgia,serif",
    color: P.text,
    maxWidth: 440,
    margin: "0 auto",
  },
  hdr: {
    background: P.forest,
    padding: "16px 16px 0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 20px #00000030",
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#F4EFE6",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  nav: {
    display: "flex",
    justifyContent: "space-around",
    border: "1px solid #ffffff22",
    overflowX: "hidden",
    position: "fixed",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 20px)",
    maxWidth: 420,
    background: P.forest,
    zIndex: 200,
    boxShadow: "0 -4px 18px #00000033",
    borderRadius: 18,
  },
  navBtn: (a) => ({
    flex: 1,
    background: "none",
    border: "none",
    color: a ? "#F4EFE6" : "#ffffff66",
    padding: "10px 4px",
    fontSize: 10,
    fontFamily: "'Lora',Georgia,serif",
    fontWeight: a ? 700 : 400,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    borderBottom: a ? `3px solid ${P.amber}` : "3px solid transparent",
    whiteSpace: "nowrap",
  }),
  scroll: { padding: "14px 14px 110px" },
  card: {
    background: P.card,
    borderRadius: 14,
    border: `1px solid ${P.border}`,
    marginBottom: 12,
    overflow: "hidden",
    boxShadow: "0 2px 10px #00000010",
  },
  hdrCard: (c1 = P.forest, c2 = P.pine) => ({
    background: `linear-gradient(135deg,${c1},${c2})`,
    padding: "14px 16px",
  }),
  back: {
    background: "none",
    border: "none",
    color: "#F4EFE6",
    fontSize: 20,
    cursor: "pointer",
    marginRight: 4,
    padding: 0,
  },
};

// ── Date Picker ───────────────────────────────────────────
function DatePicker({ startDate, endDate, onChange }) {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("start");
  const parse = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-");
    return new Date(+y, +m - 1, +d);
  };
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const nice = (s) => {
    if (!s) return null;
    const d = parse(s);
    return `${MONTHS[d.getMonth()].slice(
      0,
      3
    )} ${d.getDate()}, ${d.getFullYear()}`;
  };
  const click = (day) => {
    const str = fmt(new Date(yr, mo, day));
    if (step === "start" || (startDate && endDate)) {
      onChange({ startDate: str, endDate: null });
      setStep("end");
    } else {
      const s = parse(startDate),
        e = new Date(yr, mo, day);
      if (e < s) {
        onChange({ startDate: str, endDate: null });
        setStep("end");
      } else {
        onChange({ startDate, endDate: str });
        setStep("start");
        setOpen(false);
      }
    }
  };
  const isSt = (day) => startDate === fmt(new Date(yr, mo, day));
  const isEn = (day) => endDate === fmt(new Date(yr, mo, day));
  const inR = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(yr, mo, day);
    return d > parse(startDate) && d < parse(endDate);
  };
  const nights =
    startDate && endDate
      ? Math.round((parse(endDate) - parse(startDate)) / 864e5)
      : 0;
  const label = startDate
    ? endDate
      ? `${nice(startDate)} → ${nice(endDate)}`
      : `${nice(startDate)} → pick end`
    : "Select trip dates";
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setStep(startDate && !endDate ? "end" : "start");
        }}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "#fff",
          border: `1.5px solid ${open ? P.pine : P.border}`,
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "'Lora',Georgia,serif",
          color: startDate ? P.text : P.muted,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>🗓</span>
        <span style={{ flex: 1 }}>{label}</span>
        {(startDate || endDate) && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange({ startDate: null, endDate: null });
            }}
            style={{ color: P.muted, fontSize: 18 }}
          >
            ×
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 14,
            marginTop: 6,
            padding: 14,
            boxShadow: "0 8px 24px #00000018",
            position: "relative",
            zIndex: 50,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: P.muted,
              marginBottom: 10,
              fontStyle: "italic",
            }}
          >
            {step === "start" ? "Tap arrival date" : "Tap departure date"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => {
                if (mo === 0) {
                  setMo(11);
                  setYr((y) => y - 1);
                } else setMo((m) => m - 1);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: P.forest,
                padding: "0 10px",
              }}
            >
              ‹
            </button>
            <span style={{ fontWeight: 700, fontSize: 15, color: P.forest }}>
              {MONTHS[mo]} {yr}
            </span>
            <button
              onClick={() => {
                if (mo === 11) {
                  setMo(0);
                  setYr((y) => y + 1);
                } else setMo((m) => m + 1);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: P.forest,
                padding: "0 10px",
              }}
            >
              ›
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              marginBottom: 4,
            }}
          >
            {DAYS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: P.muted,
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 2,
            }}
          >
            {Array(new Date(yr, mo, 1).getDay())
              .fill(null)
              .map((_, i) => (
                <div key={"e" + i} />
              ))}
            {Array(new Date(yr, mo + 1, 0).getDate())
              .fill(null)
              .map((_, i) => {
                const day = i + 1,
                  st = isSt(day),
                  en = isEn(day),
                  rng = inR(day);
                return (
                  <button
                    key={day}
                    onClick={() => click(day)}
                    style={{
                      padding: "7px 2px",
                      border: "none",
                      borderRadius: 8,
                      background:
                        st || en ? P.pine : rng ? P.pine + "33" : "transparent",
                      color: st || en ? "#fff" : rng ? P.pine : P.text,
                      fontFamily: "'Lora',Georgia,serif",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: st || en ? 700 : 400,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
          </div>
          {nights > 0 && (
            <div
              style={{
                marginTop: 10,
                background: P.cream,
                borderRadius: 8,
                padding: "8px 12px",
                textAlign: "center",
                fontSize: 13,
                color: P.forest,
                fontWeight: 700,
              }}
            >
              {nights} night{nights !== 1 ? "s" : ""} 🏕️
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Photo Uploader ────────────────────────────────────────
const PhotoUploader = ({ photos, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const ref = useRef();
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    onChange((prev) => [...prev]);
    
    let done = 0;
    const batch = [];
    files.forEach(async (file) => {
  const url = await uploadTripPhoto(file);

  if (!url) return;

  batch.push({
    id: Date.now() + Math.random(),
    url,
    name: file.name,
  });

  done++;

  if (done === files.length) {
    onChange((p) => [...p, ...batch]);
    setUploading(false);
  }
});
    e.target.value = "";
  };
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFiles}
      />
      {uploading && (
  <div
    style={{
      textAlign: "center",
      padding: 10,
      color: P.muted,
      fontSize: 12,
    }}
  >
    Uploading photos...
  </div>
)}
      {photos.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 5,
              marginBottom: 6,
            }}
          >
            {photos.map((p) => (
              <div
                key={p.id}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <img
  src={p.url}
  alt=""
  onClick={() => {
  setViewerPhotos(photos.map((x) => x.url));
  setViewerIndex(photos.findIndex((x) => x.id === p.id));
}}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    cursor: "pointer",
  }}
/>
                <button
                  onClick={() =>
                    onChange((prev) => prev.filter((x) => x.id !== p.id))
                  }
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    background: P.red,
                    border: "none",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => ref.current.click()}
              style={{
                aspectRatio: "1",
                borderRadius: 8,
                border: `2px dashed ${P.border}`,
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: P.muted,
              }}
            >
              <span style={{ fontSize: 22 }}>+</span>
              <span
                style={{ fontSize: 10, fontFamily: "'Lora',Georgia,serif" }}
              >
                More
              </span>
            </button>
          </div>
          <div
            style={{
              fontSize: 12,
              color: P.muted,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
      {photos.length === 0 && (
        <button
          onClick={() => ref.current.click()}
          style={{
            width: "100%",
            padding: 14,
            background: "transparent",
            border: `2px dashed ${P.border}`,
            borderRadius: 10,
            color: P.muted,
            fontSize: 13,
            fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 28 }}>📷</span>
          <span style={{ fontWeight: 600 }}>Tap to add photos — no limit</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>JPG, PNG, HEIC</span>
        </button>
      )}
    </div>
  );
};

// ── Site Details Tab ──────────────────────────────────────
const NEARBY_ACTIVITIES = [
  "Fishing",
  "Hiking",
  "Swimming",
  "Kayaking / Canoeing",
  "Mountain Biking",
  "Rock Climbing",
  "Stargazing",
  "Wildlife Viewing",
  "OHV / ATV Trails",
  "Boating",
  "Surfing",
  "Birdwatching",
  "Photography",
  "Backpacking",
  "Horseback Riding",
];
function SiteDetailsTab({ form, set }) {
  const sd = form.siteDetails || {};
  const upd = (k, v) => set("siteDetails", { ...sd, [k]: v });
  const toggleCheck = (group, val) => {
    const cur = sd[group] || [];
    upd(
      group,
      cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]
    );
  };
  const isChecked = (group, val) => (sd[group] || []).includes(val);
  return (
    <div>
      <SLabel mt={0}>🚻 Restrooms</SLabel>
      <Check
        label="Clean restrooms"
        checked={sd.cleanRestrooms}
        onChange={() => upd("cleanRestrooms", !sd.cleanRestrooms)}
      />
      <div
        style={{
          marginTop: 8,
          marginBottom: 4,
          fontSize: 12,
          color: P.muted,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Bathroom Type
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {["Men's & Women's", "Unisex / All-Gender", "Single Stall"].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.bathroomType === o}
            onChange={() =>
              upd("bathroomType", sd.bathroomType === o ? null : o)
            }
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 4,
          marginBottom: 4,
          fontSize: 12,
          color: P.muted,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Toilet Type
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
      >
        {["Flush Toilet", "Vault Toilet", "Porta-John", "None"].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.toiletType === o}
            onChange={() => upd("toiletType", sd.toiletType === o ? null : o)}
          />
        ))}
      </div>
      <SLabel>💧 Water</SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {["Running Water", "Well Water", "No Water"].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.waterType === o}
            onChange={() => upd("waterType", sd.waterType === o ? null : o)}
          />
        ))}
      </div>
      <SLabel>🏕️ Site Amenities</SLabel>
      {[
        ["Fire Pit", "🔥"],
        ["Picnic Bench", "🪑"],
        ["Bear Box", "🐻"],
        ["Electrical Hookup", "⚡"],
        ["Water Hookup", "💧"],
        ["Sewer Hookup", "🔧"],
      ].map(([label, icon]) => (
        <Check
          key={label}
          label={label}
          icon={icon}
          checked={isChecked("amenities", label)}
          onChange={() => toggleCheck("amenities", label)}
        />
      ))}
      <SLabel>🌄 View from Site</SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {[
          "Mountain View",
          "Ocean View",
          "Lake View",
          "River / Creek View",
          "Forest",
          "Desert",
          "Meadow",
          "No Notable View",
        ].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={isChecked("views", o)}
            onChange={() => toggleCheck("views", o)}
          />
        ))}
      </div>
      <SLabel>🏞️ Proximity to Water</SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {[
          "On the water",
          "< 100 ft",
          "100–500 ft",
          "500 ft – ¼ mile",
          "No water nearby",
        ].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.waterProximity === o}
            onChange={() =>
              upd("waterProximity", sd.waterProximity === o ? null : o)
            }
          />
        ))}
      </div>
      <SLabel>🌳 Shade & Tree Coverage</SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {[
          "Full Shade",
          "Morning Shade",
          "Afternoon Shade",
          "Partial Shade",
          "Full Sun",
        ].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.shade === o}
            onChange={() => upd("shade", sd.shade === o ? null : o)}
          />
        ))}
      </div>
      <SLabel>🚗 Site Access</SLabel>
      <div
        style={{
          marginBottom: 4,
          fontSize: 12,
          color: P.muted,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Driveway Size
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}
      >
        {[
          "Compact Car",
          "Standard",
          "Large Truck / SUV",
          "RV Friendly",
          "Pull-Through",
        ].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.drivewaySize === o}
            onChange={() =>
              upd("drivewaySize", sd.drivewaySize === o ? null : o)
            }
          />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: P.muted, marginBottom: 4 }}>
            Max Vehicles
          </div>
          <input
            type="number"
            value={sd.maxVehicles || ""}
            onChange={(e) => upd("maxVehicles", e.target.value)}
            placeholder="e.g. 2"
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "#fff",
              border: `1.5px solid ${P.border}`,
              borderRadius: 10,
              fontSize: 15,
              fontFamily: "'Lora',Georgia,serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: P.muted, marginBottom: 4 }}>
            Max People
          </div>
          <input
            type="number"
            value={sd.maxPeople || ""}
            onChange={(e) => upd("maxPeople", e.target.value)}
            placeholder="e.g. 8"
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "#fff",
              border: `1.5px solid ${P.border}`,
              borderRadius: 10,
              fontSize: 15,
              fontFamily: "'Lora',Georgia,serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
      <SLabel>🐾 Pets</SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {["Pets Allowed", "Pets Not Allowed", "Dogs on Leash Only"].map((o) => (
          <Chip
            key={o}
            label={o}
            selected={sd.pets === o}
            onChange={() => upd("pets", sd.pets === o ? null : o)}
          />
        ))}
      </div>
      <SLabel>🥾 Activities Nearby</SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
      >
        {NEARBY_ACTIVITIES.map((o) => (
          <Chip
            key={o}
            label={o}
            selected={isChecked("nearbyActivities", o)}
            onChange={() => toggleCheck("nearbyActivities", o)}
          />
        ))}
      </div>
      <SLabel>📸 Shared Photo Album Name</SLabel>
      <input
        value={sd.albumName || ""}
        onChange={(e) => upd("albumName", e.target.value)}
        placeholder="e.g. Cachuma Aug 2025 — Family Trip"
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "#fff",
          border: `1.5px solid ${P.border}`,
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "'Lora',Georgia,serif",
          color: P.text,
          outline: "none",
          boxSizing: "border-box",
          marginBottom: 4,
        }}
      />
      <div style={{ fontSize: 11, color: P.muted, marginBottom: 10 }}>
        Name a shared Google Photos or iCloud album your group can contribute to
      </div>
    </div>
  );
}

// ── Fish Species Search / Identifier ─────────────────────
const FISH_SPECIES = [
  {
    name: "Rainbow Trout",
    family: "Trout",
    water: "Cold creeks, lakes",
    tips: "Pink/red side stripe, black spots, often silvery.",
  },
  {
    name: "Brown Trout",
    family: "Trout",
    water: "Cold rivers, lakes",
    tips: "Golden-brown body, black and red/orange spots with pale halos.",
  },
  {
    name: "Brook Trout",
    family: "Trout",
    water: "Cold streams",
    tips: "Worm-like markings on back, red spots with blue halos, white fin edges.",
  },
  {
    name: "Golden Trout",
    family: "Trout",
    water: "High Sierra lakes/creeks",
    tips: "Bright golden sides, red/orange belly and lateral stripe.",
  },
  {
    name: "Cutthroat Trout",
    family: "Trout",
    water: "Cold western waters",
    tips: "Red/orange slash marks under lower jaw.",
  },
  {
    name: "Largemouth Bass",
    family: "Bass",
    water: "Warm lakes/ponds",
    tips: "Large mouth extends past eye, dark horizontal stripe.",
  },
  {
    name: "Smallmouth Bass",
    family: "Bass",
    water: "Clear rocky lakes/rivers",
    tips: "Bronze body, vertical bars, mouth usually does not pass eye.",
  },
  {
    name: "Striped Bass",
    family: "Bass",
    water: "Reservoirs/coastal",
    tips: "Long silver body with dark horizontal stripes.",
  },
  {
    name: "Bluegill",
    family: "Panfish",
    water: "Warm ponds/lakes",
    tips: "Blue/black gill flap, round body.",
  },
  {
    name: "Crappie",
    family: "Panfish",
    water: "Lakes/reservoirs",
    tips: "Speckled body, paper-thin mouth.",
  },
  {
    name: "Channel Catfish",
    family: "Catfish",
    water: "Lakes/rivers",
    tips: "Whiskers, forked tail, smooth scaleless body.",
  },
  {
    name: "Carp",
    family: "Carp",
    water: "Warm lakes/rivers",
    tips: "Large scales, downturned mouth, barbels.",
  },
  {
    name: "Kokanee Salmon",
    family: "Salmon",
    water: "Cold lakes",
    tips: "Landlocked sockeye, silver most of year, red during spawn.",
  },
  {
    name: "Dungeness Crab",
    family: "Crab",
    water: "Pacific coast",
    tips: "Wide oval shell, white-tipped claws.",
  },
];
function fishMatches(q) {
  const t = (q || "").toLowerCase().trim();
  if (!t) return FISH_SPECIES.slice(0, 6);
  return FISH_SPECIES.filter((f) =>
    [f.name, f.family, f.water, f.tips].join(" ").toLowerCase().includes(t)
  ).slice(0, 8);
}

// ── Fishing Log Tab ───────────────────────────────────────
function FishingLogTab({ form, set }) {
  const log = form.fishingLog || [];
  const [fish, setFish] = useState({
    species: "",
    count: "",
    size: "",
    bait: "",
    time: "",
    spot: "",
    water: "",
    notes: "",
    rating: 0,
    photo: null,
  });
  const [speciesQ, setSpeciesQ] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const photoRef = useRef();
  const totalFish = log.reduce((s, f) => s + (+f.count || 1), 0);
  const trophy = log
    .slice()
    .sort((a, b) => (parseFloat(b.size) || 0) - (parseFloat(a.size) || 0))[0];
  const favoriteBait = (() => {
    const counts = {};
    log.forEach((f) => {
      if (f.bait) counts[f.bait] = (counts[f.bait] || 0) + (+f.count || 1);
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  })();
  const addFish = () => {
    if (!fish.species.trim()) return;
    set("fishingLog", [...log, { ...fish, id: "fish" + Date.now() }]);
    setFish({
      species: "",
      count: "",
      size: "",
      bait: "",
      time: "",
      spot: "",
      water: "",
      notes: "",
      rating: 0,
      photo: null,
    });
    setSpeciesQ("");
  };
  const removeFish = (id) =>
    set(
      "fishingLog",
      log.filter((f) => f.id !== id)
    );
  const pickSpecies = (sp) => {
    setFish({ ...fish, species: sp.name });
    setSpeciesQ(sp.name);
  };
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) =>
      setFish((p) => ({
        ...p,
        photo: { url: ev.target.result, name: file.name },
      }));
    r.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div>
      <SLabel mt={0}>🎣 Fishing</SLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {[
          { l: "Caught", v: totalFish, e: "🎣" },
          { l: "Entries", v: log.length, e: "📝" },
          { l: "Top Bait", v: favoriteBait || "—", e: "🎯" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: P.cream,
              border: `1px solid ${P.border}`,
              borderRadius: 10,
              padding: "9px 6px",
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 17 }}>{s.e}</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: P.forest,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 9,
                color: P.muted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>
      {trophy && (
        <div
          style={{
            background: "#FFF8ED",
            border: `1.5px solid ${P.gold}55`,
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: P.gold,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            🏆 Trophy Fish
          </div>
          <div style={{ fontWeight: 700, color: P.forest, fontSize: 15 }}>
            {trophy.species}
            {trophy.size ? ` · ${trophy.size}` : ""}
          </div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
            {trophy.bait && `Caught on ${trophy.bait}`}
            {trophy.spot && ` at ${trophy.spot}`}
          </div>
        </div>
      )}
      {log.length > 0 && (
        <>
          <SLabel>Saved Catches</SLabel>
          {log.map((f) => (
            <div
              key={f.id}
              style={{
                background: "#EEF5F7",
                border: `1px solid ${P.water}33`,
                borderRadius: 11,
                padding: "10px 12px",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                {f.photo && (
                  <img
                    src={f.photo.url}
                    alt=""
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 9,
                      objectFit: "cover",
                      border: `1px solid ${P.border}`,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontWeight: 700, color: P.forest, fontSize: 15 }}
                  >
                    {f.count || 1}× {f.species}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: P.muted,
                      marginTop: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {f.bait && `🎯 ${f.bait} · `}
                    {f.time && `🕒 ${f.time} · `}
                    {f.spot && `📍 ${f.spot}`}
                  </div>
                  {f.size && (
                    <div style={{ fontSize: 12, color: P.water, marginTop: 3 }}>
                      📏 {f.size}
                    </div>
                  )}
                  {f.water && (
                    <div style={{ fontSize: 12, color: P.teal, marginTop: 3 }}>
                      💧 {f.water}
                    </div>
                  )}
                  {f.rating > 0 && <Stars n={f.rating} size={12} />}{" "}
                  {f.notes && (
                    <div
                      style={{
                        fontSize: 13,
                        color: P.text,
                        marginTop: 6,
                        lineHeight: 1.6,
                      }}
                    >
                      {f.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFish(f.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: P.red,
                    fontSize: 18,
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </>
      )}
      <SLabel>{log.length ? "Add Another Catch" : "Add First Catch"}</SLabel>
      <div style={{ position: "relative" }}>
        <Inp
          value={speciesQ}
          onChange={(e) => {
            setSpeciesQ(e.target.value);
            setFish({ ...fish, species: e.target.value });
          }}
          placeholder="Search fish species, e.g. trout, bass, catfish"
        />
        {speciesQ && (
          <div
            style={{
              background: "#fff",
              border: `1.5px solid ${P.border}`,
              borderRadius: 10,
              marginTop: -6,
              marginBottom: 10,
              overflow: "hidden",
              boxShadow: "0 4px 12px #00000010",
            }}
          >
            {fishMatches(speciesQ).map((sp) => (
              <button
                key={sp.name}
                onClick={() => pickSpecies(sp)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background:
                    fish.species === sp.name ? P.water + "16" : "#fff",
                  border: "none",
                  borderBottom: `1px solid ${P.border}66`,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "'Lora',Georgia,serif",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: P.forest }}>
                  🎣 {sp.name}
                </div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
                  {sp.family} · {sp.water}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => setShowGuide(!showGuide)}
        style={{
          width: "100%",
          background: P.cream,
          border: `1px solid ${P.border}`,
          borderRadius: 10,
          padding: "9px 12px",
          fontFamily: "'Lora',Georgia,serif",
          fontSize: 13,
          color: P.earth,
          cursor: "pointer",
          marginBottom: 10,
          textAlign: "left",
        }}
      >
        🔎 Fish identifier guide {showGuide ? "▲" : "▼"}
      </button>
      {showGuide && (
        <div
          style={{
            background: P.card,
            border: `1px solid ${P.border}`,
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 12,
          }}
        >
          {fishMatches(speciesQ || fish.species).map((sp) => (
            <div
              key={sp.name}
              style={{
                padding: "7px 0",
                borderBottom: `1px solid ${P.border}88`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: P.forest }}>
                {sp.name}
              </div>
              <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.5 }}>
                {sp.tips}
              </div>
            </div>
          ))}
          <div
            style={{
              fontSize: 11,
              color: P.muted,
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            Manual guide only. Real AI photo ID would need an image-recognition
            backend later.
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Inp
          value={fish.count}
          onChange={(e) => setFish({ ...fish, count: e.target.value })}
          placeholder="Count"
          type="number"
        />
        <Inp
          value={fish.size}
          onChange={(e) => setFish({ ...fish, size: e.target.value })}
          placeholder="Size, e.g. 14 in"
        />
      </div>
      <Inp
        value={fish.bait}
        onChange={(e) => setFish({ ...fish, bait: e.target.value })}
        placeholder="Bait / lure, e.g. nightcrawler, Panther Martin"
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Inp
          value={fish.time}
          onChange={(e) => setFish({ ...fish, time: e.target.value })}
          placeholder="Time, e.g. 7:30am"
        />
        <Inp
          value={fish.water}
          onChange={(e) => setFish({ ...fish, water: e.target.value })}
          placeholder="Water, e.g. clear, moving"
        />
      </div>
      <Inp
        value={fish.spot}
        onChange={(e) => setFish({ ...fish, spot: e.target.value })}
        placeholder="Spot / pin, e.g. creek bend by site 42"
      />
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handlePhoto}
      />
      <button
        onClick={() => photoRef.current?.click()}
        style={{
          width: "100%",
          background: "transparent",
          border: `1.5px dashed ${P.border}`,
          borderRadius: 10,
          color: P.muted,
          padding: 10,
          fontSize: 13,
          fontFamily: "'Lora',Georgia,serif",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        {fish.photo ? `📷 ${fish.photo.name}` : "📷 Add catch photo"}
      </button>
      <SLabel>Fishing Spot Rating</SLabel>
      <div style={{ marginBottom: 12 }}>
        <Stars
          n={fish.rating}
          onRate={(r) => setFish({ ...fish, rating: r })}
          size={26}
        />
      </div>
      <textarea
        value={fish.notes}
        onChange={(e) => setFish({ ...fish, notes: e.target.value })}
        placeholder="Water clarity, depth, where fish were holding, what worked..."
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "#fff",
          border: `1.5px solid ${P.border}`,
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "'Lora',Georgia,serif",
          color: P.text,
          outline: "none",
          boxSizing: "border-box",
          resize: "vertical",
          minHeight: 80,
          marginBottom: 12,
        }}
      />
      <Btn full color={P.water} onClick={addFish}>
        + Add Catch
      </Btn>
    </div>
  );
}

// ── Edit Entry ────────────────────────────────────────────
const WEATHER = [
  "☀️ Hot & Sunny",
  "🌤 Warm & Clear",
  "⛅ Partly Cloudy",
  "🌧 Rainy",
  "🌩 Stormy",
  "🌬 Windy",
  "❄️ Cold",
  "🌫 Foggy",
];
const EditEntry = ({ initial, onSave, onCancel, profiles }) => {
  const [form, setForm] = useState(
    () =>
      initial || {
        campgroundName: "",
        location: "",
        emoji: "🏕️",
        startDate: null,
        endDate: null,
        siteNumber: "",
        rating: 0,
        notes: "",
        wishlist: [],
        photos: [],
        who: [],
        weather: "",
        totalCost: "",
        returnWorthy: null,
        packingList: [],
        activities: [],
        siteDetails: {},
        fishingLog: [],
        mileage: "",
        gasCost: "",
        fuelGallons: "",
        privacy: "private",
        memorySpots: [],
        tripCover: "auto",
      }
  );
  const [etab, setEtab] = useState("main");
  const [wSite, setWSite] = useState("");
  const [wNote, setWNote] = useState("");
  const [showW, setShowW] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mNote, setMNote] = useState("");
  const [showM, setShowM] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleWho = (id) =>
    set(
      "who",
      form.who?.includes(id)
        ? form.who.filter((x) => x !== id)
        : [...(form.who || []), id]
    );
  const genPack = () => {
    set("packingList", buildPacking(form.activities || []));
    setEtab("packing");
  };
  const togglePack = (id) =>
    set(
      "packingList",
      form.packingList.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      )
    );
  const [newItem, setNewItem] = useState("");
  const ETABS = [
    { k: "main", l: "Trip" },
    { k: "site", l: "Site" },
    { k: "fishing", l: "Fishing" },
    { k: "packing", l: "Packing" },
  ];
  return (
    <div style={S.scroll}>
      <div
        style={{
          display: "flex",
          background: P.card,
          borderRadius: 12,
          border: `1px solid ${P.border}`,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        {ETABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setEtab(t.k)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: etab === t.k ? P.forest : "transparent",
              color: etab === t.k ? "#F4EFE6" : P.muted,
              border: "none",
              fontFamily: "'Lora',Georgia,serif",
              fontSize: 13,
              fontWeight: etab === t.k ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          {etab === "main" && (
            <>
              {!initial?.campgroundName && (
                <>
                  <SLabel mt={0}>Campground Name</SLabel>
                  <Inp
                    value={form.campgroundName}
                    onChange={(e) => set("campgroundName", e.target.value)}
                    placeholder="e.g. Lake Cachuma Recreation Area"
                  />
                  <SLabel>Location</SLabel>
                  <Inp
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="e.g. Santa Barbara, CA"
                  />
                </>
              )}
              {initial?.campgroundName && (
                <div
                  style={{
                    background: P.cream,
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{form.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {form.campgroundName}
                    </div>
                    <div style={{ fontSize: 12, color: P.muted }}>
                      {form.location}
                    </div>
                  </div>
                </div>
              )}
              <SLabel mt={0}>Trip Dates</SLabel>
              <DatePicker
                startDate={form.startDate}
                endDate={form.endDate}
                onChange={({ startDate, endDate }) =>
                  setForm((p) => ({ ...p, startDate, endDate }))
                }
              />
              <SLabel>Site Number Stayed</SLabel>
              <Inp
                value={form.siteNumber}
                onChange={(e) => set("siteNumber", e.target.value)}
                placeholder="e.g. 42"
              />
              <SLabel>Your Rating</SLabel>
              <div style={{ marginBottom: 12 }}>
                <Stars
                  n={form.rating}
                  onRate={(r) => set("rating", r)}
                  size={28}
                />
              </div>
              <SLabel>Who came?</SLabel>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginBottom: 12,
                }}
              >
                {profiles.map((p) => {
                  const sel = form.who?.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleWho(p.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 20,
                        border: `1.5px solid ${sel ? p.color : P.border}`,
                        background: sel ? p.color + "22" : "transparent",
                        color: sel ? p.color : P.muted,
                        fontFamily: "'Lora',Georgia,serif",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: sel ? 700 : 400,
                      }}
                    >
                      {p.emoji} {p.name}
                    </button>
                  );
                })}
              </div>
              <SLabel>Privacy</SLabel>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { k: "private", l: "🔒 Private" },
                  { k: "friends", l: "👥 Friends" },
                  { k: "link", l: "🔗 Link" },
                ].map((o) => (
                  <button
                    key={o.k}
                    onClick={() => set("privacy", o.k)}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        form.privacy === o.k ? P.pine : P.border
                      }`,
                      background:
                        form.privacy === o.k ? P.pine + "22" : "transparent",
                      color: form.privacy === o.k ? P.pine : P.muted,
                      fontFamily: "'Lora',Georgia,serif",
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: form.privacy === o.k ? 700 : 400,
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
              <SLabel>Weather</SLabel>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {WEATHER.map((w) => (
                  <button
                    key={w}
                    onClick={() => set("weather", form.weather === w ? "" : w)}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 20,
                      border: `1.5px solid ${
                        form.weather === w ? P.amber : P.border
                      }`,
                      background:
                        form.weather === w ? P.amber + "22" : "transparent",
                      color: form.weather === w ? P.amber : P.muted,
                      fontFamily: "'Lora',Georgia,serif",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <SLabel>Total Trip Cost</SLabel>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: P.muted,
                    fontSize: 15,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={form.totalCost}
                  onChange={(e) => set("totalCost", e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    background: "#fff",
                    border: `1.5px solid ${P.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    fontFamily: "'Lora',Georgia,serif",
                    color: P.text,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <SLabel>Travel / Gas</SLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <Inp
                  value={form.mileage || ""}
                  onChange={(e) => set("mileage", e.target.value)}
                  placeholder="Miles driven"
                  type="number"
                />
                <Inp
                  value={form.gasCost || ""}
                  onChange={(e) => set("gasCost", e.target.value)}
                  placeholder="Gas cost $"
                  type="number"
                />
              </div>
              <Inp
                value={form.fuelGallons || ""}
                onChange={(e) => set("fuelGallons", e.target.value)}
                placeholder="Gallons used (optional)"
                type="number"
              />
              <SLabel>Would You Return?</SLabel>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                {[
                  { v: true, l: "✅ Yes!" },
                  { v: false, l: "❌ Probably not" },
                ].map((o) => (
                  <button
                    key={o.l}
                    onClick={() =>
                      set(
                        "returnWorthy",
                        form.returnWorthy === o.v ? null : o.v
                      )
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        form.returnWorthy === o.v
                          ? o.v
                            ? P.pine
                            : P.red
                          : P.border
                      }`,
                      background:
                        form.returnWorthy === o.v
                          ? o.v
                            ? P.pine + "22"
                            : P.red + "22"
                          : "transparent",
                      color:
                        form.returnWorthy === o.v
                          ? o.v
                            ? P.pine
                            : P.red
                          : P.muted,
                      fontFamily: "'Lora',Georgia,serif",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: form.returnWorthy === o.v ? 700 : 400,
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
              <SLabel>Notes & Memories</SLabel>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="What made this trip special? Fishing spots, trail tips, campfire memories..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#fff",
                  border: `1.5px solid ${P.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: "'Lora',Georgia,serif",
                  color: P.text,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  minHeight: 90,
                  marginBottom: 12,
                }}
              />
              <SLabel>📍 Remember This Spot</SLabel>
              {(form.memorySpots || []).map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: P.cream,
                    border: `1px solid ${P.border}`,
                    borderRadius: 9,
                    padding: "8px 10px",
                    marginBottom: 7,
                    display: "flex",
                    gap: 8,
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 700, color: P.forest, fontSize: 13 }}
                    >
                      {m.title}
                    </div>
                    {m.note && (
                      <div
                        style={{ fontSize: 12, color: P.muted, marginTop: 2 }}
                      >
                        {m.note}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      set(
                        "memorySpots",
                        (form.memorySpots || []).filter((_, j) => j !== i)
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: P.red,
                      fontSize: 18,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {showM ? (
                <div
                  style={{
                    background: P.cream,
                    border: `1.5px solid ${P.border}`,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Inp
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Spot name, e.g. creek bend, sunset rock"
                  />
                  <Inp
                    value={mNote}
                    onChange={(e) => setMNote(e.target.value)}
                    placeholder="Why remember it?"
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      color={P.pine}
                      small
                      onClick={() => {
                        if (!mTitle.trim()) return;
                        set("memorySpots", [
                          ...(form.memorySpots || []),
                          { title: mTitle, note: mNote },
                        ]);
                        setMTitle("");
                        setMNote("");
                        setShowM(false);
                      }}
                    >
                      Save Spot
                    </Btn>
                    <Btn
                      outline
                      color={P.muted}
                      small
                      onClick={() => setShowM(false)}
                    >
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowM(true)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: `1.5px dashed ${P.border}`,
                    borderRadius: 10,
                    color: P.muted,
                    padding: 9,
                    fontSize: 13,
                    fontFamily: "'Lora',Georgia,serif",
                    cursor: "pointer",
                    marginBottom: 12,
                  }}
                >
                  + Remember a Spot
                </button>
              )}
              <SLabel>Trip Photos</SLabel>
              <PhotoUploader
                photos={form.photos || []}
                onChange={(fn) =>
                  set(
                    "photos",
                    typeof fn === "function" ? fn(form.photos || []) : fn
                  )
                }
              />
              <SLabel>⭐ Wishlist Sites for Next Time</SLabel>
              {form.wishlist?.map((w, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FFF8ED",
                    border: `1px solid ${P.amber}44`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 7,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: P.forest }}>
                      Site #{w.site}
                    </span>
                    {w.note && (
                      <div
                        style={{ fontSize: 12, color: P.muted, marginTop: 2 }}
                      >
                        {w.note}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      set(
                        "wishlist",
                        form.wishlist.filter((_, j) => j !== i)
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: P.red,
                      fontSize: 18,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {showW ? (
                <div
                  style={{
                    background: "#FFF8ED",
                    border: `1.5px solid ${P.amber}55`,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <SLabel mt={0}>Site Number</SLabel>
                  <Inp
                    value={wSite}
                    onChange={(e) => setWSite(e.target.value)}
                    placeholder="e.g. 78"
                  />
                  <SLabel>Why this site?</SLabel>
                  <Inp
                    value={wNote}
                    onChange={(e) => setWNote(e.target.value)}
                    placeholder="e.g. More shade, near the creek"
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      color={P.amber}
                      small
                      onClick={() => {
                        if (!wSite.trim()) return;
                        set("wishlist", [
                          ...(form.wishlist || []),
                          { site: wSite, note: wNote },
                        ]);
                        setWSite("");
                        setWNote("");
                        setShowW(false);
                      }}
                    >
                      Save
                    </Btn>
                    <Btn
                      outline
                      color={P.muted}
                      small
                      onClick={() => setShowW(false)}
                    >
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowW(true)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: `1.5px dashed ${P.border}`,
                    borderRadius: 10,
                    color: P.muted,
                    padding: 9,
                    fontSize: 13,
                    fontFamily: "'Lora',Georgia,serif",
                    cursor: "pointer",
                    marginBottom: 14,
                  }}
                >
                  + Add Wishlist Site
                </button>
              )}
            </>
          )}
          {etab === "site" && <SiteDetailsTab form={form} set={set} />}
          {etab === "fishing" && <FishingLogTab form={form} set={set} />}
          {etab === "packing" && (
            <>
              {!form.packingList?.length ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎒</div>
                  <div
                    style={{
                      fontSize: 14,
                      color: P.muted,
                      lineHeight: 1.7,
                      marginBottom: 14,
                    }}
                  >
                    Generate a packing list based on your trip activities.
                  </div>
                  <SLabel mt={0}>Trip Activities</SLabel>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      "Fishing",
                      "Hiking",
                      "Swimming",
                      "Kayaking",
                      "Rock Climbing",
                      "Stargazing",
                      "Kids",
                      "Beach",
                      "Cold Weather",
                      "Long Drive",
                    ].map((a) => {
                      const sel = (form.activities || []).includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() =>
                            set(
                              "activities",
                              sel
                                ? (form.activities || []).filter((x) => x !== a)
                                : [...(form.activities || []), a]
                            )
                          }
                          style={{
                            padding: "6px 12px",
                            borderRadius: 20,
                            border: `1.5px solid ${sel ? P.pine : P.border}`,
                            background: sel ? P.pine + "22" : "transparent",
                            color: sel ? P.pine : P.muted,
                            fontFamily: "'Lora',Georgia,serif",
                            fontSize: 13,
                            cursor: "pointer",
                            fontWeight: sel ? 700 : 400,
                          }}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                  <Btn color={P.pine} onClick={genPack}>
                    Generate Packing List
                  </Btn>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ fontSize: 13, color: P.muted }}>
                      {form.packingList.filter((i) => i.checked).length}/
                      {form.packingList.length} packed
                    </div>
                    <Btn
                      small
                      outline
                      color={P.muted}
                      onClick={() => set("packingList", [])}
                    >
                      Reset
                    </Btn>
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: P.cream,
                      borderRadius: 4,
                      marginBottom: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: P.pine,
                        borderRadius: 4,
                        width: `${
                          form.packingList.length
                            ? (form.packingList.filter((i) => i.checked)
                                .length /
                                form.packingList.length) *
                              100
                            : 0
                        }%`,
                        transition: "width .3s",
                      }}
                    />
                  </div>
                  {form.packingList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => togglePack(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 10px",
                        marginBottom: 4,
                        borderRadius: 9,
                        background: item.checked
                          ? P.pine + "12"
                          : "transparent",
                        cursor: "pointer",
                        border: `1px solid ${
                          item.checked ? P.pine + "33" : P.border
                        }`,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          border: `2px solid ${
                            item.checked ? P.pine : P.border
                          }`,
                          background: item.checked ? P.pine : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        {item.checked && "✓"}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          color: item.checked ? P.muted : P.text,
                          textDecoration: item.checked
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {item.item}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newItem.trim()) {
                          set("packingList", [
                            ...form.packingList,
                            {
                              id: Math.random().toString(36).slice(2),
                              item: newItem,
                              checked: false,
                            },
                          ]);
                          setNewItem("");
                        }
                      }}
                      placeholder="Add custom item..."
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "#fff",
                        border: `1.5px solid ${P.border}`,
                        borderRadius: 9,
                        fontSize: 13,
                        fontFamily: "'Lora',Georgia,serif",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newItem.trim()) {
                          set("packingList", [
                            ...form.packingList,
                            {
                              id: Math.random().toString(36).slice(2),
                              item: newItem,
                              checked: false,
                            },
                          ]);
                          setNewItem("");
                        }
                      }}
                      style={{
                        background: P.pine,
                        border: "none",
                        color: "#fff",
                        borderRadius: 9,
                        padding: "8px 14px",
                        fontFamily: "'Lora',Georgia,serif",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn outline color={P.muted} onClick={onCancel} sx={{ flex: 1 }}>
              Cancel
            </Btn>
            <Btn color={P.forest} onClick={() => onSave(form)} sx={{ flex: 2 }}>
              Save to Journal
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Share Modal ───────────────────────────────────────────
const ShareModal = ({ entry, onClose }) => {
  const [priv, setPriv] = useState("friends");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000000AA",
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: P.card,
            borderRadius: 20,
            padding: 28,
            textAlign: "center",
            maxWidth: 300,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏕️</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: P.forest,
              marginBottom: 8,
            }}
          >
            Trip Shared!
          </div>
          <div
            style={{
              fontSize: 14,
              color: P.muted,
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            Your crew can now see your {entry?.campgroundName} trip in their
            feed.
          </div>
          <Btn full color={P.pine} onClick={onClose}>
            Done
          </Btn>
        </div>
      </div>
    );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000AA",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: P.card,
          borderRadius: "20px 20px 0 0",
          padding: 24,
          width: "100%",
          maxWidth: 440,
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: P.border,
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          Share This Trip
        </div>
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 16 }}>
          {entry?.campgroundName}
        </div>
        {[
          {
            k: "friends",
            i: "👥",
            l: "Approved Friends Only",
            d: "Only your crew sees this",
          },
          {
            k: "link",
            i: "🔗",
            l: "Anyone with link",
            d: "They need the direct link",
          },
          { k: "private", i: "🔒", l: "Just Me", d: "Keep it private" },
        ].map((o) => (
          <button
            key={o.k}
            onClick={() => setPriv(o.k)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              marginBottom: 8,
              borderRadius: 10,
              border: `1.5px solid ${priv === o.k ? P.pine : P.border}`,
              background: priv === o.k ? P.pine + "11" : "transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 22 }}>{o.i}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: priv === o.k ? 700 : 400,
                  fontSize: 14,
                  color: priv === o.k ? P.forest : P.text,
                  fontFamily: "'Lora',Georgia,serif",
                }}
              >
                {o.l}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: P.muted,
                  fontFamily: "'Lora',Georgia,serif",
                }}
              >
                {o.d}
              </div>
            </div>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `2px solid ${priv === o.k ? P.pine : P.border}`,
                background: priv === o.k ? P.pine : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {priv === o.k && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              )}
            </div>
          </button>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Btn outline color={P.muted} onClick={onClose} sx={{ flex: 1 }}>
            Cancel
          </Btn>
          <Btn color={P.pine} onClick={() => setDone(true)} sx={{ flex: 2 }}>
            Share Trip 🏕️
          </Btn>
        </div>
      </div>
    </div>
  );
};

function getTripCover(entry) {
  const hay = [
    entry.campgroundName,
    entry.location,
    entry.notes,
    ...(entry.activities || []),
    entry.weather || "",
  ]
    .join(" ")
    .toLowerCase();
  if (hay.includes("ocean") || hay.includes("beach") || hay.includes("sur"))
    return { emoji: "🌊", label: "Coastal Camp", c1: P.water, c2: "#4D8AA8" };
  if (
    hay.includes("fish") ||
    hay.includes("trout") ||
    (entry.fishingLog || []).length
  )
    return { emoji: "🎣", label: "Fishing Trip", c1: P.water, c2: P.pine };
  if (
    hay.includes("mount") ||
    hay.includes("sierra") ||
    hay.includes("mammoth")
  )
    return { emoji: "🏔️", label: "Mountain Trip", c1: P.forest, c2: P.water };
  if (hay.includes("desert") || hay.includes("joshua") || hay.includes("moab"))
    return { emoji: "🏜️", label: "Desert Camp", c1: P.earth, c2: P.amber };
  return {
    emoji: entry.emoji || "🏕️",
    label: "Camp Memory",
    c1: P.earth,
    c2: P.pine,
  };
}
// ── Journal ───────────────────────────────────────────────
const niceDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-");
  return `${MONTHS[+m - 1].slice(0, 3)} ${+d}, ${y}`;
};
const JournalView = ({ entries, onAdd, onEdit, onDelete, profiles }) => {
  const [filter, setFilter] = useState("all");
  const [shareEntry, setShareEntry] = useState(null);
  const [viewerPhotos, setViewerPhotos] = useState([]);
const [viewerIndex, setViewerIndex] = useState(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  useEffect(() => {
  if (viewerIndex !== null) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [viewerIndex]);
  useEffect(() => {
  if (viewerIndex === null) return;

  const handleKeyDown = (e) => {
    e.preventDefault();
    
    if (e.key === "Escape") {
      setViewerIndex(null);
      setViewerPhotos([]);
    }

    if (e.key === "ArrowRight") {
      setPhotoLoaded(false);
      
      setViewerIndex((i) =>
        i < viewerPhotos.length - 1 ? i + 1 : 0
      );
    }

    if (e.key === "ArrowLeft") {
      setPhotoLoaded(false);
      
      setViewerIndex((i) =>
        i > 0 ? i - 1 : viewerPhotos.length - 1
      );
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [viewerIndex, viewerPhotos.length]);
  const filtered = entries.filter((e) => {
    if (filter === "return") return e.returnWorthy === true;
    if (filter === "family") return e.who?.length > 1;
    return true;
  });
  const totalCost = entries.reduce((s, e) => s + (+e.totalCost || 0), 0);
  const totalNights = entries.reduce((s, e) => {
    if (e.startDate && e.endDate) {
      const [y1, m1, d1] = e.startDate.split("-");
      const [y2, m2, d2] = e.endDate.split("-");
      return (
        s +
        Math.round(
          (new Date(+y2, +m2 - 1, +d2) - new Date(+y1, +m1 - 1, +d1)) / 864e5
        )
      );
    }
    return s;
  }, 0);
  return (
    <div style={S.scroll}>
      {entries.length > 0 &&
        (() => {
          const fishCaught = entries.reduce(
            (s, e) =>
              s + (e.fishingLog || []).reduce((a, f) => a + (+f.count || 1), 0),
            0
          );
          const returnTrips = entries.filter(
            (e) => e.returnWorthy === true
          ).length;
          const uniqueCamps = new Set(
  entries.map((e) => e.campgroundName).filter(Boolean)
).size;

const latestPhotoByCamp = {};
entries.forEach((e) => {
  if (e.photos?.[0]?.url) {
    latestPhotoByCamp[e.campgroundName] = e.photos[0].url;
  }
});
          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {[
                { l: "Trips", v: entries.length, e: "🏕️" },
                { l: "Nights", v: totalNights, e: "🌙" },
                { l: "Fish", v: fishCaught, e: "🎣" },
                {
                  l: "Spent",
                  v: totalCost > 0 ? `$${totalCost.toLocaleString()}` : "—",
                  e: "💰",
                },
                { l: "Return", v: returnTrips, e: "✅" },
                { l: "Camps", v: uniqueCamps, e: "📍" },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    background: P.card,
                    border: `1px solid ${P.border}`,
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{s.e}</div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: P.forest,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: P.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      <Btn full color={P.pine} onClick={onAdd} sx={{ marginBottom: 12 }}>
        + Add a Campground Visit
      </Btn>
      {entries.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[
            { k: "all", l: "All" },
            { k: "return", l: "✅ Return" },
            { k: "family", l: "👨‍👩‍👧 Family" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: `1px solid ${filter === f.k ? P.pine : P.border}`,
                background: filter === f.k ? P.pine + "22" : "transparent",
                color: filter === f.k ? P.pine : P.muted,
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: filter === f.k ? 700 : 400,
              }}
            >
              {f.l}
            </button>
          ))}
        </div>
      )}
      {filtered.length === 0 && entries.length === 0 && (
        <div
          style={{ textAlign: "center", padding: "40px 20px", color: P.muted }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📓</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            Your journal is empty
          </div>
          <div style={{ fontSize: 14 }}>
            Start logging your camping trips above!
          </div>
        </div>
      )}
      {filtered.map((entry) => {
        const ep = profiles.filter((p) => entry.who?.includes(p.id));
        const sd = entry.siteDetails || {};
        const fishLog = entry.fishingLog || [];
        const fishCount = fishLog.reduce((s, f) => s + (+f.count || 1), 0);
        const sdTags = [
          sd.toiletType,
          sd.waterType,
          sd.shade,
          sd.pets,
          sd.waterProximity,
        ].filter(Boolean);
        const cover = getTripCover(entry);
        return (
          <div key={entry.id} style={S.card}>
            <div
              style={{
                ...S.hdrCard(cover.c1, cover.c2),
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {entry.photos?.[0]?.url ? (
  <img
    src={entry.photos[0].url}
    alt=""
    style={{
      width: 54,
      height: 54,
      objectFit: "cover",
      borderRadius: 12,
    }}
  />
) : (
  <span style={{ fontSize: 32 }}>{cover.emoji}</span>
)}
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#F4EFE6" }}
                >
                  {entry.campgroundName}
                </div>
                <div style={{ fontSize: 11, color: "#ffffff99", marginTop: 1 }}>
                  {entry.location}
                </div>
                <div style={{ fontSize: 11, color: "#ffffff99", marginTop: 1 }}>
                  {entry.startDate &&
                    (entry.endDate
                      ? `🗓 ${niceDate(entry.startDate)} → ${niceDate(
                          entry.endDate
                        )}`
                      : `🗓 ${niceDate(entry.startDate)}`)}
                  {entry.siteNumber && ` · Site #${entry.siteNumber}`}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {entry.rating > 0 && <Stars n={entry.rating} size={13} />}
                  {entry.returnWorthy === true && (
                    <Tag label="✅ Return" color={P.pine} small />
                  )}
                  {entry.returnWorthy === false && (
                    <Tag label="❌ Skip" color={P.red} small />
                  )}
                  {entry.weather && (
                    <Tag label={entry.weather} color={P.water} small />
                  )}
                  {entry.totalCost && (
                    <Tag
                      label={`$${(+entry.totalCost).toLocaleString()}`}
                      color={P.gold}
                      small
                    />
                  )}
                  {entry.mileage && (
                    <Tag
                      label={`🚗 ${entry.mileage} mi`}
                      color={P.earth}
                      small
                    />
                  )}
                  {entry.gasCost && (
                    <Tag label={`⛽ $${entry.gasCost}`} color={P.gold} small />
                  )}
                  {entry.privacy && (
                    <Tag
                      label={
                        entry.privacy === "private"
                          ? "🔒 Private"
                          : entry.privacy === "friends"
                          ? "👥 Friends"
                          : "🔗 Link"
                      }
                      color={P.muted}
                      small
                    />
                  )}
                  {fishCount > 0 && (
                    <Tag label={`🎣 ${fishCount} fish`} color={P.water} small />
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={() => setShareEntry(entry)}
                  style={{
                    background: "#ffffff22",
                    border: "none",
                    color: "#fff",
                    borderRadius: 7,
                    padding: "3px 7px",
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  📤
                </button>
                <button
                  onClick={() => onEdit(entry)}
                  style={{
                    background: "#ffffff22",
                    border: "none",
                    color: "#fff",
                    borderRadius: 7,
                    padding: "3px 7px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  style={{
                    background: "#ffffff22",
                    border: "none",
                    color: "#fff",
                    borderRadius: 7,
                    padding: "3px 7px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
            <div style={{ padding: "10px 14px 12px" }}>
              {ep.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {ep.map((p) => (
                    <Tag
                      key={p.id}
                      label={`${p.emoji} ${p.name}`}
                      color={p.color}
                      small
                    />
                  ))}
                </div>
              )}
              {entry.notes && (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.8,
                    fontStyle: "italic",
                    color: P.text,
                    margin: "0 0 8px",
                  }}
                >
                  "{entry.notes}"
                </p>
              )}
              {fishLog.length > 0 && (
                <div
                  style={{
                    background: "#EEF5F7",
                    borderRadius: 9,
                    padding: "8px 10px",
                    marginBottom: 8,
                    border: `1px solid ${P.water}22`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: P.water,
                      marginBottom: 6,
                    }}
                  >
                    🎣 Fishing Log
                  </div>
                  {fishLog.slice(0, 3).map((f) => (
                    <div key={f.id} style={{ fontSize: 13, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: P.forest }}>
                        {f.count || 1}× {f.species}
                      </span>
                      {f.bait && (
                        <span style={{ color: P.muted }}> — {f.bait}</span>
                      )}
                      {f.spot && (
                        <span style={{ color: P.muted }}> · {f.spot}</span>
                      )}
                    </div>
                  ))}
                  {fishLog.length > 3 && (
                    <div style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>
                      +{fishLog.length - 3} more catch entries
                    </div>
                  )}
                </div>
              )}
              {entry.photos?.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 4,
                    marginBottom: 10,
                  }}
                >
                  {entry.photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setViewerPhotos(entry.photos.map((x) => x.url));
                        setViewerIndex(entry.photos.findIndex((x) => x.id === p.id));
                      }}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 7,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={p.url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {sdTags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                    marginBottom: 8,
                  }}
                >
                  {sdTags.map((t) => (
                    <Tag key={t} label={t} color={P.teal} small />
                  ))}
                  {sd.cleanRestrooms && (
                    <Tag label="✓ Clean Restrooms" color={P.teal} small />
                  )}
                </div>
              )}
              {sd.nearbyActivities?.length > 0 && (
                <div
                  style={{
                    background: P.cream,
                    borderRadius: 8,
                    padding: "7px 10px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: P.muted,
                      marginBottom: 5,
                    }}
                  >
                    🥾 Nearby
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {sd.nearbyActivities.map((a) => (
                      <Tag key={a} label={a} color={P.pine} small />
                    ))}
                  </div>
                </div>
              )}
              {sd.albumName && (
                <div style={{ fontSize: 12, color: P.water, marginBottom: 8 }}>
                  📸 Album: <strong>{sd.albumName}</strong>
                </div>
              )}
              {entry.memorySpots?.length > 0 && (
                <div
                  style={{
                    background: "#EEF5F7",
                    borderRadius: 9,
                    padding: "8px 10px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: P.water,
                      marginBottom: 6,
                    }}
                  >
                    📍 Remembered Spots
                  </div>
                  {entry.memorySpots.slice(0, 3).map((m, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: P.forest }}>
                        {m.title}
                      </span>
                      {m.note && (
                        <span style={{ color: P.muted }}> — {m.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {entry.wishlist?.length > 0 && (
                <div
                  style={{
                    background: P.cream,
                    borderRadius: 9,
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: P.amber,
                      marginBottom: 6,
                    }}
                  >
                    ⭐ Wishlist for next time
                  </div>
                  {entry.wishlist.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: P.forest }}>
                        Site #{w.site}
                      </span>
                      {w.note && (
                        <span style={{ color: P.muted }}> — {w.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {shareEntry && (
        <ShareModal entry={shareEntry} onClose={() => setShareEntry(null)} />
      )}
      
    {viewerIndex !== null && (
  <div
  onClick={(e) => {
    if (e.target !== e.currentTarget) return;
    setViewerIndex(null);
    setViewerPhotos([]);
  }}
  onPointerDown={(e) => {
    window.swipeStartX = e.clientX;
  }}
  onPointerUp={(e) => {
    const diff = window.swipeStartX - e.clientX;

    if (diff > 60) {
      setViewerIndex((i) =>
        i < viewerPhotos.length - 1 ? i + 1 : 0
      );
    }

    if (diff < -60) {
      setViewerIndex((i) =>
        i > 0 ? i - 1 : viewerPhotos.length - 1
      );
    }
  }
}
    style={{
      touchAction: "pan-y",
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >

    <style>
  {`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `}
</style>
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10002,
    background: "rgba(0,0,0,0.65)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
  }}
>
  {viewerIndex + 1} / {viewerPhotos.length}
</div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setViewerIndex((i) =>
          i > 0 ? i - 1 : viewerPhotos.length - 1
        );
      }}
      style={{
        position: "absolute",
        left: 24,
        top: "50%",
        fontSize: 36,
        zIndex: 10001,
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 48,
        height: 48,
      }}
    >
      ‹
    </button>

    <img
  key={viewerIndex}
  src={viewerPhotos[viewerIndex]}
  alt=""
  onClick={(e) => e.stopPropagation()}
  onLoad={() => setPhotoLoaded(true)}
  onPointerDown={(e) => {
  window.swipeStartX = e.clientX;
}}

onPointerUp={(e) => {
  const diff = window.swipeStartX - e.clientX;

  if (diff > 50) {
    setPhotoLoaded(false);
    
    setViewerIndex((i) =>
      i < viewerPhotos.length - 1 ? i + 1 : 0
    );
  }

  if (diff < -50) {
    setPhotoLoaded(false);
    
    setViewerIndex((i) =>
      i > 0 ? i - 1 : viewerPhotos.length - 1
    );
  }
}}
      style={{
        touchAction: "pan-y",
        zIndex: 10000,
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
        borderRadius: 12,
        transition: "opacity 0.2s ease",
        animation: "fadeIn 0.25s ease",
        opacity: photoLoaded ? 1 : 0,
      }}
    />

    <button
      onClick={(e) => {
        e.stopPropagation();
        setViewerIndex((i) =>
          i < viewerPhotos.length - 1 ? i + 1 : 0
        );
      }}
      style={{
        position: "absolute",
        zIndex: 10000,
        right: 24,
        top: "50%",
        fontSize: 36,
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 48,
        height: 48,
      }}
    >
      ›
    </button>

    <div
      style={{
        position: "absolute",
        top: 20,
        color: "#fff",
        fontSize: 14,
        background: "rgba(0,0,0,0.35)",
        padding: "6px 10px",
        borderRadius: 999,
      }}
    >
      {viewerIndex + 1} / {viewerPhotos.length}
    </div>
  </div>
)}
    </div>
  );
};

// ── Discover ──────────────────────────────────────────────
const DiscoverView = ({ onSelectCamp }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [custom, setCustom] = useState({
    name: "",
    location: "",
    elevation: "",
    description: "",
    activities: "Fishing, Hiking",
    amenities: "",
    emoji: "🏕️",
  });
  const doSearch = (term) => {
    const t = (term || q).trim();
    if (!t) return;
    setQ(t);
    setSearched(true);
    setResults(searchDB(t));
  };
  const makeCustomCamp = () => {
    if (!custom.name.trim()) return;
    const camp = {
      id: "custom" + Date.now(),
      name: custom.name.trim(),
      location: custom.location.trim() || "Custom campground",
      elevation: custom.elevation.trim() || "—",
      description:
        custom.description.trim() ||
        "Added manually by your family or friends. Log trips, photos, fishing notes, pins, and favorite sites here.",
      activities: (custom.activities || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      amenities: (custom.amenities || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      sites: "—",
      rating: 0,
      reviews: 0,
      emoji: custom.emoji || "🏕️",
      tags: [custom.name, custom.location, "custom", "manual"]
        .join(" ")
        .toLowerCase()
        .split(/\s+/),
    };
    onSelectCamp(camp);
    setCustom({
      name: "",
      location: "",
      elevation: "",
      description: "",
      activities: "Fishing, Hiking",
      amenities: "",
      emoji: "🏕️",
    });
    setShowManual(false);
  };
  return (
    <div style={S.scroll}>
      <div
        style={{
          background: `linear-gradient(135deg,${P.water},${P.forest})`,
          borderRadius: 16,
          padding: "14px 16px",
          marginBottom: 12,
          color: "#F4EFE6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -16,
            top: -16,
            fontSize: 86,
            opacity: 0.08,
          }}
        >
          🏛️
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.75,
            marginBottom: 4,
          }}
        >
          Recreation.gov Placeholder
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>
          Official campground search coming next
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.86 }}>
          This screen is ready for RIDB/Recreation.gov data later: official
          campgrounds, photos, activities, booking links, and federal facility
          details. For now, use the sample search or add any campground
          manually.
        </div>
        <div
          style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
        >
          <Tag label="🔌 API not connected yet" color="#F4EFE6" small />
          <Tag label="📷 Photos placeholder" color="#F4EFE6" small />
          <Tag label="🏕 Manual entry works now" color="#F4EFE6" small />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: "'Lora',Georgia,serif",
            color: P.text,
            outline: "none",
          }}
          placeholder="Search sample campgrounds..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
        />
        <Btn
          onClick={() => doSearch()}
          sx={{ padding: "10px 14px", fontSize: 18 }}
        >
          🔍
        </Btn>
      </div>
      <Btn
        full
        outline
        color={P.earth}
        onClick={() => setShowManual(!showManual)}
        sx={{ marginBottom: 12 }}
      >
        {showManual
          ? "Hide manual campground"
          : "+ Add Any Campground Manually"}
      </Btn>

      {showManual && (
        <div style={S.card}>
          <div style={{ padding: "12px 14px" }}>
            <SLabel mt={0}>Add Campground Manually</SLabel>
            <div
              style={{
                fontSize: 12,
                color: P.muted,
                lineHeight: 1.7,
                marginBottom: 10,
              }}
            >
              Use this for private campgrounds, county parks, state parks,
              dispersed spots, or any place not in the sample database.
            </div>
            <Inp
              value={custom.name}
              onChange={(e) => setCustom({ ...custom, name: e.target.value })}
              placeholder="Campground name, e.g. Twin Lakes Campground"
            />
            <Inp
              value={custom.location}
              onChange={(e) =>
                setCustom({ ...custom, location: e.target.value })
              }
              placeholder="Location, e.g. Bridgeport, CA"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: 8,
              }}
            >
              <Inp
                value={custom.emoji}
                onChange={(e) =>
                  setCustom({ ...custom, emoji: e.target.value })
                }
                placeholder="🏕️"
              />
              <Inp
                value={custom.elevation}
                onChange={(e) =>
                  setCustom({ ...custom, elevation: e.target.value })
                }
                placeholder="Elevation, e.g. 7,000 ft"
              />
            </div>
            <Inp
              value={custom.activities}
              onChange={(e) =>
                setCustom({ ...custom, activities: e.target.value })
              }
              placeholder="Activities, comma separated"
            />
            <Inp
              value={custom.amenities}
              onChange={(e) =>
                setCustom({ ...custom, amenities: e.target.value })
              }
              placeholder="Amenities, comma separated"
            />
            <textarea
              value={custom.description}
              onChange={(e) =>
                setCustom({ ...custom, description: e.target.value })
              }
              placeholder="Notes about the campground, sites, fishing, bathrooms, shade..."
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#fff",
                border: `1.5px solid ${P.border}`,
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "'Lora',Georgia,serif",
                color: P.text,
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: 80,
                marginBottom: 12,
              }}
            />
            <Btn full color={P.pine} onClick={makeCustomCamp}>
              Create Campground Page
            </Btn>
          </div>
        </div>
      )}

      {!searched && (
        <div style={{ textAlign: "center", padding: "18px 16px" }}>
          <div style={{ fontSize: 46, marginBottom: 10 }}>🌲</div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: P.forest,
              marginBottom: 6,
            }}
          >
            Find Your Next Camp
          </div>
          <div
            style={{
              fontSize: 13,
              color: P.muted,
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            Search sample campgrounds now. Later, this same search can pull real
            Recreation.gov/RIDB campground data.
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              justifyContent: "center",
            }}
          >
            {[
              "Lake Cachuma",
              "Yosemite",
              "Big Sur",
              "Mammoth Lakes",
              "Moab",
              "Zion",
              "Boundary Waters",
            ].map((s) => (
              <button
                key={s}
                onClick={() => doSearch(s)}
                style={{
                  background: P.cream,
                  border: `1px solid ${P.border}`,
                  borderRadius: 20,
                  padding: "6px 13px",
                  fontSize: 12,
                  fontFamily: "'Lora',Georgia,serif",
                  color: P.earth,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {searched && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "26px", color: P.muted }}>
          <div style={{ fontSize: 32 }}>🏕️</div>
          <div style={{ marginTop: 8, fontSize: 14 }}>
            No sample matches yet.
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
            Your family can still add it manually above and log trips
            immediately.
          </div>
        </div>
      )}
      {results.map((camp) => (
        <div
          key={camp.id}
          style={{ ...S.card, cursor: "pointer" }}
          onClick={() => onSelectCamp(camp)}
        >
          <div style={S.hdrCard()}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 36 }}>{camp.emoji}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#F4EFE6" }}
                >
                  {camp.name}
                </div>
                <div style={{ fontSize: 12, color: "#ffffff99", marginTop: 2 }}>
                  📍 {camp.location} · {camp.elevation}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Stars n={Math.round(camp.rating)} />
                  <span style={{ fontSize: 11, color: "#ffffffbb" }}>
                    {camp.rating} ({camp.reviews})
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 14px 12px" }}>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: P.muted,
                margin: "0 0 8px",
              }}
            >
              {camp.description.slice(0, 110)}...
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 4,
                marginBottom: 8,
              }}
            >
              {[camp.emoji, "📷", "🏞️"].map((ph, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1.6",
                    borderRadius: 7,
                    background: P.cream,
                    border: `1px solid ${P.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {ph}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {camp.activities.slice(0, 3).map((a) => (
                <Tag key={a} label={a} small />
              ))}
              <Tag label="Official data placeholder" color={P.water} small />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DetailView = ({
  camp,
  onLogVisit,
  favorites = [],
  bucketList = [],
  onToggleFavorite,
  onToggleBucket,
}) => {
  const fav = favorites.some((f) => f.id === camp.id);
  const buck = bucketList.some((f) => f.id === camp.id);
  return (
    <div style={S.scroll}>
      <div style={S.card}>
        <div style={{ ...S.hdrCard(), padding: "18px 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{camp.emoji}</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#F4EFE6" }}>
            {camp.name}
          </div>
          <div style={{ fontSize: 12, color: "#ffffff99", marginTop: 3 }}>
            📍 {camp.location} · {camp.elevation}
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Stars n={Math.round(camp.rating)} size={16} />
            <span style={{ color: "#ffffffcc", fontSize: 12 }}>
              {camp.rating} · {camp.reviews} reviews
            </span>
          </div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={4}>About</SLabel>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: P.text,
              margin: "0 0 4px",
            }}
          >
            {camp.description}
          </p>
          <SLabel>Activities</SLabel>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              marginBottom: 4,
            }}
          >
            {camp.activities.map((a) => (
              <Tag key={a} label={a} color={P.pine} />
            ))}
          </div>
          <SLabel>Amenities</SLabel>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              marginBottom: 12,
            }}
          >
            {camp.amenities.map((a) => (
              <Tag key={a} label={a} color={P.water} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: P.muted, marginBottom: 14 }}>
            🏕️ {camp.sites} total sites
          </div>
          <div
            style={{
              background: P.cream,
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: P.muted,
                marginBottom: 5,
              }}
            >
              🌤️ Weather Placeholder
            </div>
            <div style={{ fontSize: 13, color: P.text, lineHeight: 1.6 }}>
              Future: show upcoming forecast, wind, moon phase, and save actual
              trip weather.
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Btn
              outline={!fav}
              color={P.gold}
              onClick={() => onToggleFavorite?.(camp)}
            >
              {fav ? "⭐ Favorited" : "☆ Favorite"}
            </Btn>
            <Btn
              outline={!buck}
              color={P.amber}
              onClick={() => onToggleBucket?.(camp)}
            >
              {buck ? "✓ Bucket" : "+ Bucket"}
            </Btn>
          </div>
          <Btn full color={P.pine} onClick={() => onLogVisit(camp)}>
            + Log a Visit Here
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ── Pins View ─────────────────────────────────────────────
function PinMap({ pins, selectedCampName, onPinClick }) {
  const [hovered, setHovered] = useState(null);
  const campPins = pins.filter((p) => p.campName === selectedCampName);
  const getPos = (pin) => {
    const hash = pin.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      left: 10 + ((hash * 37) % 70) + "%",
      top: 10 + ((hash * 53) % 65) + "%",
    };
  };
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${P.border}`,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 260,
          background: `radial-gradient(ellipse at 30% 40%, #C8D4A8 0%, transparent 50%),radial-gradient(ellipse at 70% 60%, #B8C898 0%, transparent 40%),linear-gradient(160deg, #D4E0B8 0%, #C0CC98 30%, #A8C090 60%, #90A878 100%)`,
          position: "relative",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.12,
          }}
          viewBox="0 0 400 260"
        >
          <ellipse
            cx="200"
            cy="130"
            rx="160"
            ry="95"
            fill="none"
            stroke="#3A6645"
            strokeWidth="1"
          />
          <ellipse
            cx="200"
            cy="130"
            rx="120"
            ry="65"
            fill="none"
            stroke="#3A6645"
            strokeWidth="1"
          />
          <ellipse
            cx="200"
            cy="130"
            rx="75"
            ry="40"
            fill="none"
            stroke="#3A6645"
            strokeWidth="1"
          />
          <path
            d="M0 180 Q100 160 200 170 Q300 180 400 160"
            fill="none"
            stroke="#2A5C7A"
            strokeWidth="2"
            opacity="0.5"
          />
          <text
            x="12"
            y="18"
            fill="#3A6645"
            fontSize="10"
            fontFamily="Georgia"
            opacity="0.7"
          >
            N ↑
          </text>
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: "18%",
            left: "8%",
            width: "22%",
            height: "16%",
            background: "#2A5C7A44",
            borderRadius: "40%",
            border: "1px solid #2A5C7A55",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "43%",
            left: "42%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div style={{ fontSize: 20 }}>🏕️</div>
          <div
            style={{
              background: P.forest,
              color: "#fff",
              fontSize: 8,
              padding: "1px 5px",
              borderRadius: 8,
              fontFamily: "Georgia",
              whiteSpace: "nowrap",
              fontWeight: 700,
            }}
          >
            CAMP
          </div>
        </div>
        {campPins.map((pin) => {
          const pt = getPinType(pin.type);
          const pos = getPos(pin);
          const isH = hovered === pin.id;
          return (
            <div
              key={pin.id}
              onClick={() => onPinClick(pin)}
              onMouseEnter={() => setHovered(pin.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "absolute",
                ...pos,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "transform 0.2s",
                transform: isH ? "scale(1.25)" : "scale(1)",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50% 50% 50% 0",
                  background: pt.color,
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  transform: "rotate(-45deg)",
                  boxShadow: `0 2px 8px ${pt.color}88`,
                }}
              >
                <span style={{ transform: "rotate(45deg)" }}>{pt.icon}</span>
              </div>
              {isH && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "115%",
                    background: P.forest,
                    color: "#fff",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontFamily: "Georgia",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px #00000030",
                  }}
                >
                  {pin.title}
                </div>
              )}
            </div>
          );
        })}
        {campPins.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#000000AA",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontFamily: "Georgia",
              }}
            >
              No pins yet — add your first spot!
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "#00000066",
            color: "#fff",
            fontSize: 9,
            padding: "2px 8px",
            borderRadius: 10,
            fontFamily: "Georgia",
          }}
        >
          Tap + to add a pin
        </div>
      </div>
      {campPins.length > 0 && (
        <div
          style={{
            padding: "8px 12px",
            background: P.card,
            borderTop: `1px solid ${P.border}`,
            display: "flex",
            gap: 7,
            flexWrap: "wrap",
          }}
        >
          {campPins.map((pin) => {
            const pt = getPinType(pin.type);
            return (
              <button
                key={pin.id}
                onClick={() => onPinClick(pin)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "transparent",
                  border: `1px solid ${pt.color}44`,
                  borderRadius: 20,
                  padding: "2px 10px",
                  cursor: "pointer",
                  fontFamily: "Georgia",
                }}
              >
                <span style={{ fontSize: 11 }}>{pt.icon}</span>
                <span
                  style={{ fontSize: 10, color: pt.color, fontWeight: 700 }}
                >
                  {pin.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddPinForm({ campName, onSave, onCancel }) {
  const [form, setForm] = useState({
    type: "fishing",
    title: "",
    desc: "",
    distance: "",
    rating: 0,
    date: new Date().toISOString().split("T")[0],
    campName,
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const pt = getPinType(form.type);
  return (
    <div style={S.card}>
      <div
        style={{
          background: `linear-gradient(135deg,${pt.color},${pt.color}88)`,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#ffffff99",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          New Location Pin
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#F4EFE6",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 26 }}>{pt.icon}</span>
          {pt.label}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <SLabel mt={0}>Pin Type</SLabel>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
        >
          {PIN_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => set("type", t.id)}
              style={{
                padding: "5px 10px",
                borderRadius: 20,
                border: `1.5px solid ${
                  form.type === t.id ? t.color : P.border
                }`,
                background: form.type === t.id ? t.color + "22" : "transparent",
                color: form.type === t.id ? t.color : P.muted,
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: form.type === t.id ? 700 : 400,
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: P.muted,
            fontStyle: "italic",
            marginBottom: 12,
          }}
        >
          {pt.desc}
        </div>
        <SLabel>Location Name</SLabel>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Rush Creek Fishing Bend"
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: "'Lora',Georgia,serif",
            color: P.text,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 10,
          }}
        />
        <SLabel>Notes & Details</SLabel>
        <textarea
          value={form.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="What makes this spot special? Best time, what you caught, how to find it..."
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "'Lora',Georgia,serif",
            color: P.text,
            outline: "none",
            boxSizing: "border-box",
            resize: "vertical",
            minHeight: 80,
            marginBottom: 10,
          }}
        />
        <SLabel>Directions from Camp</SLabel>
        <input
          value={form.distance}
          onChange={(e) => set("distance", e.target.value)}
          placeholder="e.g. 0.4mi from Site 42, follow creek downstream"
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "'Lora',Georgia,serif",
            color: P.text,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 10,
          }}
        />
        <SLabel>Your Rating</SLabel>
        <div style={{ marginBottom: 14 }}>
          <Stars n={form.rating} onRate={(r) => set("rating", r)} size={26} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn outline color={P.muted} onClick={onCancel} sx={{ flex: 1 }}>
            Cancel
          </Btn>
          <Btn
            color={pt.color}
            onClick={() => {
              if (!form.title.trim()) return;
              onSave({ ...form, id: "pin" + Date.now() });
            }}
            sx={{ flex: 2 }}
          >
            Drop Pin 📍
          </Btn>
        </div>
      </div>
    </div>
  );
}

function PinDetail({ pin, onClose, onDelete }) {
  const pt = getPinType(pin.type);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#00000088",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: P.card,
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg,${pt.color},${pt.color}88)`,
            padding: "16px 16px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 30 }}>{pt.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#ffffff88",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {pt.label}
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: 700, color: "#F4EFE6" }}
                >
                  {pin.title}
                </div>
                {pin.rating > 0 && <Stars n={pin.rating} size={13} />}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#ffffff22",
                border: "none",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ padding: "14px 16px 28px" }}>
          {pin.desc && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: P.text,
                margin: "0 0 12px",
              }}
            >
              {pin.desc}
            </p>
          )}
          {pin.distance && (
            <div
              style={{
                background: P.cream,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>🧭</span>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: P.muted,
                    marginBottom: 2,
                  }}
                >
                  How to Find It
                </div>
                <div style={{ fontSize: 14, color: P.text }}>
                  {pin.distance}
                </div>
              </div>
            </div>
          )}
          {pin.date && (
            <div style={{ fontSize: 12, color: P.muted, marginBottom: 14 }}>
              📅 Discovered {pin.date}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onDelete(pin.id)}
              style={{
                flex: 1,
                background: P.red + "22",
                border: `1.5px solid ${P.red}44`,
                color: P.red,
                borderRadius: 10,
                padding: 10,
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🗑 Delete
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 2,
                background: P.forest,
                border: "none",
                color: "#F4EFE6",
                borderRadius: 10,
                padding: 10,
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PinsView = ({ pins, setPins, entries }) => {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [mapView, setMapView] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);

  // Build camp list from journal entries + sample
  const campNames = [
    ...new Set([
      ...entries.map((e) => e.campgroundName),
      ...pins.map((p) => p.campName),
    ]),
  ].filter(Boolean);
  const activeCamp = selectedCamp || campNames[0] || "My Spots";

  const addPin = (pin) => {
    setPins((p) => [...p, pin]);
    setShowAdd(false);
  };
  const deletePin = (id) => {
    setPins((p) => p.filter((x) => x.id !== id));
    setSelectedPin(null);
  };
  const campPins = pins.filter((p) => p.campName === activeCamp);

  const grouped = PIN_TYPES.reduce((acc, pt) => {
    const g = campPins.filter((p) => p.type === pt.id);
    if (g.length > 0) acc[pt.id] = g;
    return acc;
  }, {});

  return (
    <div style={S.scroll}>
      {/* Camp selector */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: P.muted,
            marginBottom: 8,
          }}
        >
          Select Area
        </div>
        <div
          style={{
            display: "flex",
            gap: 7,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {campNames.length === 0 && (
            <div style={{ fontSize: 13, color: P.muted, fontStyle: "italic" }}>
              Log a campground visit to start adding pins
            </div>
          )}
          {campNames.map((name) => {
            const count = pins.filter((p) => p.campName === name).length;
            return (
              <button
                key={name}
                onClick={() => setSelectedCamp(name)}
                style={{
                  flexShrink: 0,
                  padding: "7px 13px",
                  borderRadius: 20,
                  border: `1.5px solid ${
                    activeCamp === name ? P.pine : P.border
                  }`,
                  background:
                    activeCamp === name ? P.pine + "22" : "transparent",
                  color: activeCamp === name ? P.pine : P.muted,
                  fontFamily: "'Lora',Georgia,serif",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: activeCamp === name ? 700 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {name.split(" ").slice(0, 2).join(" ")}
                {count > 0 && (
                  <span
                    style={{
                      background: P.pine,
                      color: "#fff",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      {campPins.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {PIN_TYPES.slice(0, 4).map((pt) => {
            const count = campPins.filter((p) => p.type === pt.id).length;
            return (
              <div
                key={pt.id}
                style={{
                  background: P.card,
                  border: `1px solid ${count > 0 ? pt.color + "44" : P.border}`,
                  borderRadius: 10,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 16 }}>{pt.icon}</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: count > 0 ? pt.color : P.border,
                  }}
                >
                  {count}
                </div>
                <div style={{ fontSize: 9, color: P.muted }}>
                  {pt.label.split(" ")[0]}
                </div>
              </div>
            );
          })}{" "}
        </div>
      )}

      {/* Map/List toggle + Add */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            background: P.card,
            border: `1px solid ${P.border}`,
            borderRadius: 10,
            overflow: "hidden",
            flex: 1,
          }}
        >
          {[
            { v: true, l: "🗺️ Map" },
            { v: false, l: "📋 List" },
          ].map((t) => (
            <button
              key={t.l}
              onClick={() => setMapView(t.v)}
              style={{
                flex: 1,
                padding: "9px 0",
                background: mapView === t.v ? P.forest : "transparent",
                color: mapView === t.v ? "#F4EFE6" : P.muted,
                border: "none",
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: mapView === t.v ? 700 : 400,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
        <Btn
          color={P.pine}
          onClick={() => setShowAdd(true)}
          sx={{ padding: "9px 16px" }}
        >
          + Pin
        </Btn>
      </div>

      {showAdd && (
        <AddPinForm
          campName={activeCamp}
          onSave={addPin}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {!showAdd && mapView && campNames.length > 0 && (
        <PinMap
          pins={pins}
          selectedCampName={activeCamp}
          onPinClick={setSelectedPin}
        />
      )}

      {/* Pin list by category */}
      {!showAdd &&
        Object.entries(grouped).map(([typeId, typePins]) => {
          const pt = getPinType(typeId);
          return (
            <div key={typeId} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: pt.color,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>{pt.icon}</span>
                {pt.label}s ({typePins.length})
              </div>
              {typePins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  style={{
                    background: P.card,
                    borderRadius: 12,
                    border: `1px solid ${pt.color}33`,
                    marginBottom: 7,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <div
                    style={{ width: 5, background: pt.color, flexShrink: 0 }}
                  />
                  <div style={{ padding: "10px 12px", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: P.forest,
                        }}
                      >
                        {pin.title}
                      </div>
                      {pin.rating > 0 && <Stars n={pin.rating} size={11} />}
                    </div>
                    {pin.desc && (
                      <div
                        style={{
                          fontSize: 12,
                          color: P.muted,
                          marginTop: 3,
                          lineHeight: 1.6,
                        }}
                      >
                        {pin.desc.slice(0, 80)}
                        {pin.desc.length > 80 ? "..." : ""}
                      </div>
                    )}
                    {pin.distance && (
                      <div
                        style={{
                          fontSize: 11,
                          color: pt.color,
                          marginTop: 4,
                          fontWeight: 600,
                        }}
                      >
                        🧭 {pin.distance}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

      {!showAdd && campPins.length === 0 && campNames.length > 0 && (
        <div
          style={{ textAlign: "center", padding: "30px 20px", color: P.muted }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: P.forest,
              marginBottom: 6,
            }}
          >
            No pins for this area yet
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Drop a pin to save fishing spots, trails, hidden gems, and any
            location worth remembering.
          </div>
          <Btn color={P.pine} onClick={() => setShowAdd(true)}>
            + Drop First Pin
          </Btn>
        </div>
      )}

      {selectedPin && (
        <PinDetail
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onDelete={deletePin}
        />
      )}
    </div>
  );
};

// ── Feed ──────────────────────────────────────────────────
const FeedView = ({ friends, onApproveFriend }) => {
  const [liked, setLiked] = useState({});
  const [showComment, setShowComment] = useState({});
  const pending = friends.filter((f) => f.status === "pending");
  return (
    <div style={S.scroll}>
      <div
        style={{
          background: `linear-gradient(135deg,${P.forest},${P.pine})`,
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            fontSize: 100,
            opacity: 0.06,
          }}
        >
          🌲
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#ffffff88",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          Camp Feed
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#F4EFE6",
            marginBottom: 4,
          }}
        >
          Your Crew's Adventures
        </div>
        <div style={{ fontSize: 13, color: "#ffffffaa", lineHeight: 1.6 }}>
          See where your approved friends have been camping — real notes, real
          site tips.
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 7 }}>
          <Tag
            label={`👥 ${
              friends.filter((f) => f.status === "friend").length
            } friends`}
            color="#F4EFE6"
            small
          />
        </div>
      </div>
      {pending.map((f) => (
        <div
          key={f.id}
          style={{
            background: "#FFF8ED",
            border: `1.5px solid ${P.amber}55`,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Avatar emoji={f.avatar} color={f.color} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: P.amber }}>
              {f.name} wants to follow your trips
            </div>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 1 }}>
              Approve to see each other's camp logs
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => onApproveFriend(f.id)}
              style={{
                background: P.pine,
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✓
            </button>
            <button
              style={{
                background: "transparent",
                border: `1px solid ${P.border}`,
                color: P.muted,
                borderRadius: 8,
                padding: "6px 10px",
                fontFamily: "'Lora',Georgia,serif",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      {FEED.map((trip) => {
        const isLiked = liked[trip.id];
        return (
          <div key={trip.id} style={S.card}>
            <div
              style={{
                padding: "12px 14px 10px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: `1px solid ${P.border}`,
              }}
            >
              <Avatar
                emoji={trip.userAvatar}
                color={trip.userColor}
                size={38}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {trip.userName}
                </div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 1 }}>
                  📍 {trip.campground}
                </div>
              </div>
              <div style={{ fontSize: 11, color: P.muted }}>{trip.timeAgo}</div>
            </div>
            <div
              style={{
                background: `linear-gradient(135deg,${trip.userColor},${trip.userColor}88)`,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{trip.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#F4EFE6" }}
                  >
                    {trip.campground}
                  </div>
                  <div style={{ fontSize: 11, color: "#ffffff99" }}>
                    🗓 {trip.dates} · {trip.nights}n · Site #{trip.site}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      display: "flex",
                      gap: 5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Stars n={trip.rating} size={12} />
                    {trip.returnWorthy && (
                      <Tag label="✅ Return" color="#F4EFE6" small />
                    )}
                    {trip.weather && (
                      <Tag label={trip.weather} color="#F4EFE6" small />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 3, padding: "8px 14px 0" }}>
              {trip.photos.map((p, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    aspectRatio: "1",
                    borderRadius: 7,
                    background: trip.userColor + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    border: `1px solid ${P.border}`,
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 14px" }}>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: P.text,
                  margin: "0 0 8px",
                  fontStyle: "italic",
                }}
              >
                "{trip.notes}"
              </p>
              {trip.wishlist?.length > 0 && (
                <div
                  style={{
                    background: P.cream,
                    borderRadius: 8,
                    padding: "8px 10px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: P.amber,
                      marginBottom: 5,
                    }}
                  >
                    ⭐ They want to try next time
                  </div>
                  {trip.wishlist.map((w, i) => (
                    <div key={i} style={{ fontSize: 12, color: P.earth }}>
                      <strong>Site #{w.site}</strong>
                      {w.note && ` — ${w.note}`}
                    </div>
                  ))}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  borderTop: `1px solid ${P.border}`,
                  marginTop: 8,
                  paddingTop: 10,
                }}
              >
                <button
                  onClick={() =>
                    setLiked((p) => ({ ...p, [trip.id]: !p[trip.id] }))
                  }
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Lora',Georgia,serif",
                    fontSize: 13,
                    color: isLiked ? P.amber : P.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    fontWeight: isLiked ? 700 : 400,
                  }}
                >
                  {isLiked ? "🔥" : "🤍"} {trip.likes + (isLiked ? 1 : 0)}
                </button>
                <button
                  onClick={() =>
                    setShowComment((p) => ({ ...p, [trip.id]: !p[trip.id] }))
                  }
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Lora',Georgia,serif",
                    fontSize: 13,
                    color: P.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  💬 {trip.comments}
                </button>
                <button
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Lora',Georgia,serif",
                    fontSize: 13,
                    color: P.pine,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    fontWeight: 700,
                  }}
                >
                  🏕️ Save
                </button>
              </div>
              {showComment[trip.id] && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: P.pine + "22",
                      border: `2px solid ${P.pine}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    🧑
                  </div>
                  <input
                    placeholder="Add a comment..."
                    style={{
                      flex: 1,
                      padding: "7px 12px",
                      background: "#fff",
                      border: `1.5px solid ${P.border}`,
                      borderRadius: 20,
                      fontSize: 13,
                      fontFamily: "'Lora',Georgia,serif",
                      outline: "none",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: 12,
          color: P.border,
          fontStyle: "italic",
        }}
      >
        Live feed requires backend — coming in v2.0
      </div>
    </div>
  );
};

const FriendsView = ({ friends, setFriends }) => {
  const [search, setSearch] = useState("");
  const active = friends.filter((f) => f.status === "friend");
  const pending = friends.filter((f) => f.status === "pending");
  return (
    <div style={S.scroll}>
      <div style={S.card}>
        <div style={{ ...S.hdrCard(), padding: "14px 16px" }}>
          <div
            style={{
              fontSize: 11,
              color: "#ffffff88",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            Your Privacy
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#F4EFE6" }}>
            Who sees your trips?
          </div>
        </div>
        <div style={{ padding: "10px 14px" }}>
          {[
            {
              k: "friends",
              l: "✅ Approved Friends Only",
              d: "Only people you approve",
              a: true,
            },
            {
              k: "private",
              l: "🔒 Just Me",
              d: "Completely private",
              a: false,
            },
            {
              k: "public",
              l: "🌍 Anyone",
              d: "Anyone with the link",
              a: false,
            },
          ].map((o) => (
            <div
              key={o.k}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "9px 0",
                borderBottom: `1px solid ${P.border}`,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${o.a ? P.pine : P.border}`,
                  background: o.a ? P.pine : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {o.a && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                )}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: o.a ? 700 : 400,
                    fontSize: 14,
                    color: o.a ? P.forest : P.muted,
                  }}
                >
                  {o.l}
                </div>
                <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
                  {o.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {pending.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 8,
            }}
          >
            Pending
          </div>
          {pending.map((f) => (
            <div key={f.id} style={S.card}>
              <div
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Avatar emoji={f.avatar} color={f.color} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
                    Wants to see your camp trips
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 14px 12px", display: "flex", gap: 8 }}>
                <Btn
                  small
                  color={P.pine}
                  onClick={() =>
                    setFriends((p) =>
                      p.map((x) =>
                        x.id === f.id ? { ...x, status: "friend" } : x
                      )
                    )
                  }
                  sx={{ flex: 1 }}
                >
                  ✓ Approve
                </Btn>
                <Btn small outline color={P.red} sx={{ flex: 1 }}>
                  ✕ Decline
                </Btn>
              </div>
            </div>
          ))}
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, marginTop: 8 }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "'Lora',Georgia,serif",
            outline: "none",
          }}
        />
        <Btn color={P.pine} sx={{ padding: "10px 14px" }}>
          🔍
        </Btn>
      </div>
      <div
        style={{
          background: P.cream,
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 14,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 26 }}>📲</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: P.forest }}>
            Invite a camping buddy
          </div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
            Share CampBook so you can swap trip recommendations
          </div>
        </div>
        <Btn small color={P.amber}>
          Invite
        </Btn>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: P.muted,
          marginBottom: 8,
        }}
      >
        Your Crew ({active.length})
      </div>
      {active.map((f) => (
        <div key={f.id} style={S.card}>
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar emoji={f.avatar} color={f.color} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</div>
              <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
                Active {f.lastActive}
              </div>
            </div>
            <Btn small color={P.pine} sx={{ fontSize: 11 }}>
              View Trips
            </Btn>
          </div>
        </div>
      ))}
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: 12,
          color: P.border,
          fontStyle: "italic",
        }}
      >
        Friend sync requires backend — coming in v2.0
      </div>
    </div>
  );
};

const CrewView = ({ profiles, setProfiles }) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👤");
  const EMOJIS = [
    "👤",
    "👨",
    "👩",
    "👦",
    "👧",
    "👨‍👩‍👧",
    "👨‍👩‍👦",
    "🧑",
    "👴",
    "👵",
    "🐕",
    "🐈",
  ];
  const add = () => {
    if (!name.trim()) return;
    setProfiles((p) => [
      ...p,
      {
        id: "p" + Date.now(),
        name,
        emoji,
        color: ["#3A6645", "#C8790A", "#2A5C7A", "#7A5530", "#A83030"][
          p.length % 5
        ],
      },
    ]);
    setName("");
    setEmoji("👤");
  };
  return (
    <div style={S.scroll}>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Your Crew</SLabel>
          <div
            style={{
              fontSize: 13,
              color: P.muted,
              marginBottom: 14,
              lineHeight: 1.7,
            }}
          >
            Add family and friends. Tag them on trips to filter your journal.
          </div>
          {profiles.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: P.cream,
                borderRadius: 10,
                marginBottom: 8,
                border: `1px solid ${P.border}`,
              }}
            >
              <span style={{ fontSize: 22 }}>{p.emoji}</span>
              <span
                style={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: 15,
                  color: P.forest,
                }}
              >
                {p.name}
              </span>
              <button
                onClick={() =>
                  setProfiles((prev) => prev.filter((x) => x.id !== p.id))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: P.muted,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
          <SLabel>Add Person</SLabel>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: `2px solid ${emoji === e ? P.pine : P.border}`,
                  background: emoji === e ? P.pine + "22" : "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <Inp
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Dad, Kids, Jake)"
          />
          <Btn full color={P.pine} onClick={add}>
            Add to Crew
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ── Home / Dashboard / Bucket / Profile ───────────────────
function calcTripStats(entries = []) {
  const fish = entries.reduce(
    (s, e) => s + (e.fishingLog || []).reduce((a, f) => a + (+f.count || 1), 0),
    0
  );
  const miles = entries.reduce((s, e) => s + (+e.mileage || 0), 0);
  const gas = entries.reduce((s, e) => s + (+e.gasCost || 0), 0);
  const nights = entries.reduce((s, e) => {
    if (e.startDate && e.endDate) {
      const [y1, m1, d1] = e.startDate.split("-");
      const [y2, m2, d2] = e.endDate.split("-");
      return (
        s +
        Math.round(
          (new Date(+y2, +m2 - 1, +d2) - new Date(+y1, +m1 - 1, +d1)) / 864e5
        )
      );
    }
    return s;
  }, 0);
  const trophy = entries
    .flatMap((e) =>
      (e.fishingLog || []).map((f) => ({
        ...f,
        campgroundName: e.campgroundName,
      }))
    )
    .sort((a, b) => (parseFloat(b.size) || 0) - (parseFloat(a.size) || 0))[0];
  const visited = {};
  entries.forEach((e) => {
    if (e.campgroundName)
      visited[e.campgroundName] = (visited[e.campgroundName] || 0) + 1;
  });
  const mostVisited = Object.entries(visited).sort((a, b) => b[1] - a[1])[0];
  const remembered = entries.reduce(
    (s, e) => s + (e.memorySpots || []).length,
    0
  );
  return { fish, miles, gas, nights, trophy, mostVisited, remembered };
}

function FishingView({ entries, onAdd, onEdit, onGo }) {
  const allCatches = entries.flatMap((e) =>
    (e.fishingLog || []).map((f) => ({
      ...f,
      campgroundName: e.campgroundName,
      location: e.location,
      date: e.startDate,
      tripId: e.id,
      weather: e.weather,
    }))
  );
  const fishCaught = allCatches.reduce((s, f) => s + (+f.count || 1), 0);
  const speciesCounts = allCatches.reduce((acc, f) => {
    const name = f.species || "Unknown";
    acc[name] = (acc[name] || 0) + (+f.count || 1);
    return acc;
  }, {});
  const topSpecies = Object.entries(speciesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const trophy =
    allCatches.find((f) => f.trophy) || allCatches.find((f) => f.size);
  const tripsWithFish = entries.filter((e) => (e.fishingLog || []).length > 0);
  return (
    <div style={S.scroll}>
      <div
        style={{
          background: `linear-gradient(135deg,${P.water},${P.forest})`,
          borderRadius: 18,
          padding: "18px 16px",
          marginBottom: 14,
          color: "#F4EFE6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -16,
            top: -14,
            fontSize: 100,
            opacity: 0.08,
          }}
        >
          🎣
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.75,
            marginBottom: 4,
          }}
        >
          Fishing
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Log catches. Remember spots.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.82 }}>
          Track species, bait, time, water notes, trophy fish, and the campsites
          that produced.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Btn small color={P.amber} onClick={onAdd}>
            + Add Fishing Trip
          </Btn>
          <Btn small outline color="#F4EFE6" onClick={() => onGo("pins")}>
            Map Spots
          </Btn>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          { l: "Fish", v: fishCaught, e: "🎣" },
          { l: "Species", v: Object.keys(speciesCounts).length, e: "🐟" },
          { l: "Fish Trips", v: tripsWithFish.length, e: "🏕️" },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 12,
              padding: "10px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18 }}>{x.e}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: P.forest }}>
              {x.v}
            </div>
            <div
              style={{
                fontSize: 10,
                color: P.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {x.l}
            </div>
          </div>
        ))}
      </div>

      {trophy && (
        <div style={S.card}>
          <div style={{ ...S.hdrCard(P.gold, P.amber) }}>
            <div
              style={{
                fontSize: 11,
                color: "#fff8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Trophy Fish
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
              🏆 {trophy.species}
              {trophy.size ? ` · ${trophy.size}` : ""}
            </div>
          </div>
          <div style={{ padding: "10px 14px", fontSize: 13, color: P.muted }}>
            Caught at <strong>{trophy.campgroundName}</strong>
            {trophy.bait ? ` using ${trophy.bait}` : ""}
            {trophy.spot ? ` · ${trophy.spot}` : ""}
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Species Board</SLabel>
          {topSpecies.length === 0 && (
            <div style={{ fontSize: 13, color: P.muted, lineHeight: 1.7 }}>
              No fish logged yet. Add a trip, open the Fishing tab inside the
              trip, then search for species like rainbow trout or brown trout.
            </div>
          )}
          {topSpecies.map(([species, count]) => (
            <div
              key={species}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${P.border}`,
              }}
            >
              <div style={{ fontWeight: 700, color: P.forest, fontSize: 14 }}>
                🐟 {species}
              </div>
              <Tag label={`${count} caught`} color={P.water} small />
            </div>
          ))}
        </div>
      </div>

      <SLabel>Recent Catches</SLabel>
      {allCatches.length === 0 && (
        <div
          style={{ textAlign: "center", padding: "30px 20px", color: P.muted }}
        >
          <div style={{ fontSize: 44, marginBottom: 10 }}>🎣</div>
          <div style={{ fontWeight: 700, color: P.forest, marginBottom: 4 }}>
            No catches yet
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            Try it with Sherwin Creek: add rainbow trout and brown trout to a
            trip.
          </div>
        </div>
      )}
      {allCatches
        .slice()
        .reverse()
        .map((f) => (
          <div key={f.id} style={S.card}>
            <div style={{ padding: "11px 14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, color: P.forest, fontSize: 15 }}
                  >
                    {f.count || 1}× {f.species}
                  </div>
                  <div style={{ fontSize: 12, color: P.muted, marginTop: 3 }}>
                    {f.campgroundName}
                    {f.date ? ` · ${niceDate(f.date)}` : ""}
                  </div>
                </div>
                {f.trophy && <Tag label="🏆 Trophy" color={P.gold} small />}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  marginTop: 7,
                }}
              >
                {f.bait && <Tag label={`🎯 ${f.bait}`} color={P.water} small />}
                {f.time && <Tag label={`🕒 ${f.time}`} color={P.pine} small />}
                {f.spot && <Tag label={`📍 ${f.spot}`} color={P.earth} small />}
                {f.size && <Tag label={`📏 ${f.size}`} color={P.gold} small />}
              </div>
              {f.notes && (
                <div
                  style={{
                    fontSize: 13,
                    color: P.text,
                    lineHeight: 1.7,
                    marginTop: 8,
                  }}
                >
                  {f.notes}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}

function HomeView({ entries, pins, favorites, bucketList, onAdd, onGo }) {
  const st = calcTripStats(entries);
  const last = entries[entries.length - 1];
  return (
    <div style={S.scroll}>
      <div
        style={{
          background: `linear-gradient(135deg,${P.forest},${P.pine})`,
          borderRadius: 18,
          padding: "18px 16px",
          marginBottom: 14,
          color: "#F4EFE6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -18,
            top: -20,
            fontSize: 110,
            opacity: 0.08,
          }}
        >
          🏕️
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.75,
            marginBottom: 4,
          }}
        >
          Welcome back
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Plan it. Camp it. Remember it.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.82 }}>
          Your private camping, fishing, family-memory, and secret-spot
          notebook.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Btn small color={P.amber} onClick={saveTripToSupabase}>
            + Quick Add Trip
          </Btn>
          <Btn small outline color="#F4EFE6" onClick={signUp}>
  Sign Up
</Btn>

<Btn small outline color="#F4EFE6" onClick={signIn}>
  Sign In
</Btn>
          <Btn small outline color="#F4EFE6" onClick={() => onGo("discover")}>
            Discover
          </Btn>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          { l: "Trips", v: entries.length, e: "🏕️" },
          { l: "Nights", v: st.nights, e: "🌙" },
          { l: "Fish", v: st.fish, e: "🎣" },
          { l: "Pins", v: pins.length, e: "📍" },
          { l: "Favorites", v: favorites.length, e: "⭐" },
          { l: "Miles", v: st.miles || "—", e: "🚗" },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 12,
              padding: "10px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18 }}>{x.e}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: P.forest }}>
              {x.v}
            </div>
            <div
              style={{
                fontSize: 10,
                color: P.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {x.l}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => onGo("journal")}
          style={{
            background: P.card,
            border: `1px solid ${P.border}`,
            borderRadius: 14,
            padding: 14,
            textAlign: "left",
            fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28 }}>📓</div>
          <div style={{ fontWeight: 700, color: P.forest }}>Trips</div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
            Journal, photos, costs
          </div>
        </button>
        <button
          onClick={() => onGo("pins")}
          style={{
            background: P.card,
            border: `1px solid ${P.border}`,
            borderRadius: 14,
            padding: 14,
            textAlign: "left",
            fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28 }}>🗺️</div>
          <div style={{ fontWeight: 700, color: P.forest }}>Map Pins</div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
            Fishing spots, trails
          </div>
        </button>
        <button
          onClick={() => onGo("bucket")}
          style={{
            background: P.card,
            border: `1px solid ${P.border}`,
            borderRadius: 14,
            padding: 14,
            textAlign: "left",
            fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28 }}>🪣</div>
          <div style={{ fontWeight: 700, color: P.forest }}>Bucket List</div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
            {bucketList.length} saved ideas
          </div>
        </button>
        <button
          onClick={() => onGo("profile")}
          style={{
            background: P.card,
            border: `1px solid ${P.border}`,
            borderRadius: 14,
            padding: 14,
            textAlign: "left",
            fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28 }}>👤</div>
          <div style={{ fontWeight: 700, color: P.forest }}>Profile</div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
            Stats & timeline
          </div>
        </button>
      </div>
      {st.trophy && (
        <div style={S.card}>
          <div style={{ ...S.hdrCard(P.gold, P.amber) }}>
            <div
              style={{
                fontSize: 11,
                color: "#fff8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Trophy Fish Tracker
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
              🏆 {st.trophy.species}
              {st.trophy.size ? ` · ${st.trophy.size}` : ""}
            </div>
          </div>
          <div style={{ padding: "10px 14px", fontSize: 13, color: P.muted }}>
            Best catch logged at <strong>{st.trophy.campgroundName}</strong>
            {st.trophy.bait ? ` using ${st.trophy.bait}` : ""}.
          </div>
        </div>
      )}
      {last && (
        <div style={S.card}>
          <div style={{ padding: "12px 14px" }}>
            <SLabel mt={0}>Latest Memory</SLabel>
            <div style={{ fontWeight: 700, color: P.forest }}>
              {last.campgroundName}
            </div>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 3 }}>
              {last.startDate ? niceDate(last.startDate) : "No date"} ·{" "}
              {last.weather || "Weather not logged"}
            </div>
            {last.notes && (
              <p style={{ fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                "{last.notes.slice(0, 130)}
                {last.notes.length > 130 ? "..." : ""}"
              </p>
            )}
          </div>
        </div>
      )}
      <div
        style={{
          background: P.cream,
          borderRadius: 13,
          padding: "11px 14px",
          fontSize: 12,
          color: P.muted,
          lineHeight: 1.6,
        }}
      >
        🌤️ Weather integration placeholder: in the real app this can connect to
        OpenWeather/WeatherKit and save forecast + actual weather to each trip.
      </div>
    </div>
  );
}
function BucketListView({
  bucketList,
  setBucketList,
  favorites,
  onSelectCamp,
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const addCamp = (c) =>
    setBucketList((p) =>
      p.some((x) => x.id === c.id)
        ? p
        : [
            ...p,
            {
              id: c.id,
              name: c.name,
              location: c.location,
              emoji: c.emoji,
              notes: "",
              priority: "Want to go",
            },
          ]
    );
  return (
    <div style={S.scroll}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setResults(searchDB(q));
          }}
          placeholder="Search and add campgrounds..."
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "'Lora',Georgia,serif",
            outline: "none",
          }}
        />
        <Btn onClick={() => setResults(searchDB(q))}>🔍</Btn>
      </div>
      {results.map((c) => (
        <div key={c.id} style={S.card}>
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 28 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.forest }}>{c.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{c.location}</div>
            </div>
            <Btn small color={P.amber} onClick={() => addCamp(c)}>
              Add
            </Btn>
          </div>
        </div>
      ))}
      <SLabel>⭐ Favorite Campsites</SLabel>
      {favorites.length === 0 && (
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 12 }}>
          Favorite campsites from Discover to see them here.
        </div>
      )}
      {favorites.map((f) => (
        <div key={f.id} style={S.card}>
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 25 }}>{f.emoji || "🏕️"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.forest }}>{f.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{f.location}</div>
            </div>
          </div>
        </div>
      ))}
      <SLabel>🪣 Bucket List</SLabel>
      {bucketList.length === 0 && (
        <div style={{ textAlign: "center", padding: "25px", color: P.muted }}>
          No bucket-list camps yet.
        </div>
      )}
      {bucketList.map((c) => (
        <div key={c.id} style={S.card}>
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 28 }}>{c.emoji || "🏕️"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.forest }}>{c.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{c.location}</div>
            </div>
            <button
              onClick={() =>
                setBucketList((p) => p.filter((x) => x.id !== c.id))
              }
              style={{
                background: "none",
                border: "none",
                color: P.red,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
function ProfileView({ entries, profiles, friends, darkMode, setDarkMode }) {
  const st = calcTripStats(entries);
  return (
    <div style={S.scroll}>
      <div
        style={{
          background: `linear-gradient(135deg,${P.earth},${P.forest})`,
          borderRadius: 18,
          padding: 18,
          color: "#F4EFE6",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar emoji="👤" color="#F4EFE6" size={54} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              CampBook Profile
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {entries.length} trips ·{" "}
              {friends.filter((f) => f.status === "friend").length} friends ·{" "}
              {profiles.length} crew
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          { l: "Fish caught", v: st.fish },
          { l: "Nights camped", v: st.nights },
          { l: "Miles driven", v: st.miles || 0 },
          { l: "Gas spent", v: st.gas ? `$${st.gas}` : "—" },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: P.forest }}>
              {x.v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: P.muted,
                textTransform: "uppercase",
              }}
            >
              {x.l}
            </div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Best Of</SLabel>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, color: P.text }}>
              🏕️ Most visited:{" "}
              <strong>
                {st.mostVisited
                  ? `${st.mostVisited[0]} (${st.mostVisited[1]})`
                  : "—"}
              </strong>
            </div>
            <div style={{ fontSize: 13, color: P.text }}>
              🏆 Biggest fish:{" "}
              <strong>
                {st.trophy
                  ? `${st.trophy.species}${
                      st.trophy.size ? ` · ${st.trophy.size}` : ""
                    }`
                  : "—"}
              </strong>
            </div>
            <div style={{ fontSize: 13, color: P.text }}>
              📍 Remembered spots: <strong>{st.remembered}</strong>
            </div>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Appearance</SLabel>
          <Check
            label="Dark mode"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            icon="🌙"
          />
        </div>
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Family Trip Timeline</SLabel>
          {entries.length === 0 && (
            <div style={{ fontSize: 13, color: P.muted }}>
              Trips you tag with your crew will appear here.
            </div>
          )}
          {entries
            .slice()
            .reverse()
            .map((e) => (
              <div
                key={e.id}
                style={{
                  borderLeft: `3px solid ${P.pine}`,
                  padding: "0 0 13px 12px",
                  marginLeft: 6,
                }}
              >
                <div style={{ fontWeight: 700, color: P.forest, fontSize: 14 }}>
                  {e.campgroundName}
                </div>
                <div style={{ fontSize: 12, color: P.muted }}>
                  {e.startDate ? niceDate(e.startDate) : "No date"}
                  {e.who?.length ? ` · ${e.who.length} crew tagged` : ""}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Social Profile Preview</SLabel>
          <div style={{ fontSize: 13, color: P.muted, lineHeight: 1.7 }}>
            This is where public/friend-only trip cards, badges, favorite camps,
            and trophy catches can live when you add a backend.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────
export default function CampBook() {
  const [data, setData] = useState(() => loadData());
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState(null);
  const [camp, setCamp] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    saveData(data);
  }, [data]);
  useEffect(() => {
  async function checkLogin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const trips = await loadTripsFromSupabase();

      if (trips.length > 0) {
        setData((d) => ({
          ...d,
          entries: trips
          .map((t) => ({ ...t.trip_data, supabase_id: t.id }))
          .filter(Boolean),
        }));
      }
    }
  }

  checkLogin();
    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    checkLogin();
  }
});

return () => subscription.unsubscribe();
}, []);

  const setEntries = (fn) =>
    setData((d) => ({
      ...d,
      entries: typeof fn === "function" ? fn(d.entries) : fn,
    }));
  const setProfiles = (fn) =>
    setData((d) => ({
      ...d,
      profiles: typeof fn === "function" ? fn(d.profiles) : fn,
    }));
  const setFriends = (fn) =>
    setData((d) => ({
      ...d,
      friends: typeof fn === "function" ? fn(d.friends) : fn,
    }));
  const setPins = (fn) =>
    setData((d) => ({
      ...d,
      pins: typeof fn === "function" ? fn(d.pins || []) : fn,
    }));
  const setBucketList = (fn) =>
    setData((d) => ({
      ...d,
      bucketList: typeof fn === "function" ? fn(d.bucketList || []) : fn,
    }));
  const setDarkMode = (v) => setData((d) => ({ ...d, darkMode: v }));
  const approveFriend = (id) =>
    setFriends((p) =>
      p.map((f) => (f.id === id ? { ...f, status: "friend" } : f))
    );
  const toggleFavorite = (c) =>
    setData((d) => ({
      ...d,
      favorites: (d.favorites || []).some((f) => f.id === c.id)
        ? (d.favorites || []).filter((f) => f.id !== c.id)
        : [
            ...(d.favorites || []),
            { id: c.id, name: c.name, location: c.location, emoji: c.emoji },
          ],
    }));
  const toggleBucket = (c) =>
    setBucketList((p) =>
      p.some((f) => f.id === c.id)
        ? p.filter((f) => f.id !== c.id)
        : [
            ...p,
            {
              id: c.id,
              name: c.name,
              location: c.location,
              emoji: c.emoji,
              notes: "",
              priority: "Want to go",
            },
          ]
    );
  const add = (e) => setEntries((p) => [...p, { ...e, id: Date.now() }]);
  const update = (id, patch) =>
    setEntries((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const remove = (id) => setEntries((p) => p.filter((e) => e.id !== id));

  const goDetail = (c) => {
    setCamp(c);
    setSub("detail");
  };
  const goEdit = (e) => {
    setEditing(e);
    setSub("edit");
  };
  const goAdd = () => {
    setEditing({
      campgroundName: "",
      location: "",
      emoji: "🏕️",
      photos: [],
      wishlist: [],
      rating: 0,
      notes: "",
      startDate: null,
      endDate: null,
      siteNumber: "",
      who: [],
      weather: "",
      totalCost: "",
      returnWorthy: null,
      packingList: [],
      activities: [],
      siteDetails: {},
      fishingLog: [],
      mileage: "",
      gasCost: "",
      fuelGallons: "",
      privacy: "private",
      memorySpots: [],
      tripCover: "auto",
    });
    setSub("edit");
  };
  const goLogVisit = (c) => {
    setEditing({
      campgroundName: c.name,
      location: c.location,
      emoji: c.emoji || "🏕️",
      photos: [],
      wishlist: [],
      rating: 0,
      notes: "",
      startDate: null,
      endDate: null,
      siteNumber: "",
      who: [],
      weather: "",
      totalCost: "",
      returnWorthy: null,
      packingList: [],
      activities: c.activities || [],
      siteDetails: {},
      fishingLog: [],
      mileage: "",
      gasCost: "",
      fuelGallons: "",
      privacy: "private",
      memorySpots: [],
      tripCover: "auto",
    });
    setTab("journal");
    setSub("edit");
  };
  const save = async (form) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updatedForm = {
  ...form,
  supabase_id: editing?.supabase_id || form.supabase_id,
};

if (editing?.id) {
  update(editing.id, updatedForm);
} else if (editing?.supabase_id) {
  setEntries((p) =>
    p.map((e) =>
      e.supabase_id === editing.supabase_id ? updatedForm : e
    )
  );
} else {
  add(updatedForm);
}

  const { error } = await supabase.from("trips").upsert([
    {
      id: editing?.supabase_id || form.supabase_id,
      title: form.campgroundName || "Untitled Trip",
      location: form.location || "",
      user_id: user.id,
      trip_data: {
      ...form,
      supabase_id: editing?.supabase_id,
},
    },
  ]);

  if (error) {
    alert("Cloud save failed: " + error.message);
    return;
  }

  setSub(null);
  setEditing(null);
  setTab("journal");
};
  const cancel = () => {
    setSub(null);
    setEditing(null);
  };

  const isInner = sub === "detail" || sub === "edit";
  const subTitle =
    sub === "detail"
      ? camp?.name || "Campground"
      : sub === "edit"
      ? editing?.id
        ? "Edit Entry"
        : "Log a Visit"
      : "";

  const totalPins = (data.pins || []).length;
  const TABS = [
    { k: "home", i: "🏠", l: "Home" },
    { k: "journal", i: "📓", l: "Trips" },
    { k: "fishing", i: "🎣", l: "Fishing" },
    { k: "profile", i: "👤", l: "Profile" },
  ];

  const theme = data.darkMode
    ? { ...S.app, background: "#11180F", color: "#F4EFE6" }
    : S.app;
  return (
    <div style={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');*{box-sizing:border-box};nav::-webkit-scrollbar{display:none}`}</style>
      <div style={S.hdr}>
        <div style={S.logo}>
          {isInner && (
            <button
              style={S.back}
              onClick={() => (sub === "detail" ? setSub(null) : cancel())}
            >
              ←
            </button>
          )}
          <span>🌲</span>
          <span
            style={{
              fontSize: isInner ? 14 : 18,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isInner ? subTitle : "CAMPBOOK"}
          </span>
          {!isInner && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "#ffffff44",
                fontWeight: 400,
              }}
            >
              {data.entries?.length || 0}T · {totalPins}P
            </span>
          )}
        </div>
        {!isInner && (
          <nav style={S.nav}>
            {TABS.map((t) => (
              <button
                key={t.k}
                style={S.navBtn(tab === t.k)}
                onClick={() => setTab(t.k)}
              >
                {t.i} {t.l}
              </button>
            ))}
          </nav>
        )}
      </div>

      {sub === "detail" && (
        <DetailView
          camp={camp}
          onLogVisit={goLogVisit}
          favorites={data.favorites || []}
          bucketList={data.bucketList || []}
          onToggleFavorite={toggleFavorite}
          onToggleBucket={toggleBucket}
        />
      )}
      {sub === "edit" && (
        <EditEntry
          initial={editing}
          onSave={save}
          onCancel={cancel}
          profiles={data.profiles || []}
        />
      )}
      {!sub && tab === "home" && (
        <HomeView
          entries={data.entries || []}
          pins={data.pins || []}
          favorites={data.favorites || []}
          bucketList={data.bucketList || []}
          onAdd={goAdd}
          onGo={setTab}
        />
      )}
      {!sub && tab === "discover" && <DiscoverView onSelectCamp={goDetail} />}
      {!sub && tab === "feed" && (
        <FeedView
          friends={data.friends || []}
          onApproveFriend={approveFriend}
        />
      )}
      {!sub && tab === "journal" && (
        <JournalView
          entries={data.entries || []}
          onAdd={goAdd}
          onEdit={goEdit}
          onDelete={remove}
          profiles={data.profiles || []}
        />
      )}
      {!sub && tab === "fishing" && (
        <FishingView
          entries={data.entries || []}
          onAdd={goAdd}
          onEdit={goEdit}
          onGo={setTab}
        />
      )}
      {!sub && tab === "pins" && (
        <PinsView
          pins={data.pins || []}
          setPins={setPins}
          entries={data.entries || []}
        />
      )}
      {!sub && tab === "bucket" && (
        <BucketListView
          bucketList={data.bucketList || []}
          setBucketList={setBucketList}
          favorites={data.favorites || []}
          onSelectCamp={goDetail}
        />
      )}
      {!sub && tab === "profile" && (
        <ProfileView
          entries={data.entries || []}
          profiles={data.profiles || []}
          friends={data.friends || []}
          darkMode={!!data.darkMode}
          setDarkMode={setDarkMode}
        />
      )}
      {!sub && tab === "friends" && (
        <FriendsView friends={data.friends || []} setFriends={setFriends} />
      )}
      {!sub && tab === "crew" && (
        <CrewView profiles={data.profiles || []} setProfiles={setProfiles} />
      )}
    </div>
  );
}
