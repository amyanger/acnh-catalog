/**
 * Data extraction script for ACNH Catalog.
 *
 * Reads raw game data from the NHSE repository and produces structured JSON
 * files plus copies sprite assets into the public directory.
 *
 * Usage:  npx tsx scripts/extract-data.ts
 *         npm run extract
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const NHSE_ROOT = "/Users/arjunmyanger/Documents/Dev/NHSE-source";
const PROJECT_ROOT = "/Users/arjunmyanger/Documents/Dev/acnh-catalog";

const ITEM_TEXT_PATH = path.join(
  NHSE_ROOT,
  "NHSE.Core/Resources/text/en/text_item_en.txt",
);
const ITEM_KIND_BIN_PATH = path.join(
  NHSE_ROOT,
  "NHSE.Core/Resources/byte/item_kind.bin",
);
const VILLAGER_TEXT_PATH = path.join(
  NHSE_ROOT,
  "NHSE.Core/Resources/text/en/text_villager_en.txt",
);
const RECIPE_CS_PATH = path.join(
  NHSE_ROOT,
  "NHSE.Core/Structures/RecipeList.cs",
);
const ITEM_MENUICON_BIN_PATH = path.join(
  NHSE_ROOT,
  "NHSE.Core/Resources/byte/item_menuicon.bin",
);
const MENUICON_ENUM_PATH = path.join(
  NHSE_ROOT,
  "NHSE.Core/Structures/Item/ItemMenuIconType.cs",
);
const VILLAGER_SPRITES_SRC = path.join(
  NHSE_ROOT,
  "NHSE.Sprites/Resources/Villagers",
);
const ITEM_SPRITES_SRC = path.join(
  NHSE_ROOT,
  "NHSE.Sprites/Resources/MenuIcon",
);

const DATA_OUT = path.join(PROJECT_ROOT, "src/data");
const VILLAGER_SPRITES_DEST = path.join(
  PROJECT_ROOT,
  "public/sprites/villagers",
);
const ITEM_SPRITES_DEST = path.join(PROJECT_ROOT, "public/sprites/items");

// ---------------------------------------------------------------------------
// ItemKind enum (byte value -> name)
// Derived from NHSE.Core/Structures/Item/ItemKind.cs declaration order.
// ---------------------------------------------------------------------------

const ITEM_KIND_ENUM: Record<number, string> = {
  0: "Bottoms_Long",
  1: "Bottoms_Middle",
  2: "Bottoms_Short",
  3: "Ftr_1x1_Chair",
  4: "Ftr_1x1_Floor",
  5: "Ftr_2x1_Bed",
  6: "Ftr_2x1_Floor",
  7: "Ftr_2x2_Floor",
  8: "Kind_Accessory",
  9: "Kind_AutumnLeaf",
  10: "Kind_Axe",
  11: "Kind_Bag",
  12: "Kind_Balloon",
  13: "Kind_Basket",
  14: "Kind_BdayCupcake",
  15: "Kind_BigbagPresent",
  16: "Kind_BlowBubble",
  17: "Kind_BridgeItem",
  18: "Kind_Bromide",
  19: "Kind_Bush",
  20: "Kind_BushSeedling",
  21: "Kind_Candy",
  22: "Kind_Candyfloss",
  23: "Kind_Cap",
  24: "Kind_ChangeStick",
  25: "Kind_CliffMaker",
  26: "Kind_CommonFabricObject",
  27: "Kind_CommonFabricRug",
  28: "Kind_CommonFabricTexture",
  29: "Kind_CookingMaterial",
  30: "Kind_Counter",
  31: "Kind_CraftMaterial",
  32: "Kind_CraftPhoneCase",
  33: "Kind_CraftRemake",
  34: "Kind_Dishes",
  35: "Kind_DiveFish",
  36: "Kind_DIYRecipe",
  37: "Kind_DoorDeco",
  38: "Kind_DreamGold",
  39: "Kind_Drink",
  40: "Kind_DummyCardboard",
  41: "Kind_DummyDIYRecipe",
  42: "Kind_DummyFtr",
  43: "Kind_DummyHowtoBook",
  44: "Kind_DummyPresentbox",
  45: "Kind_DummyRecipe",
  46: "Kind_DummyWrapping",
  47: "Kind_DummyWrappingOtoshidama",
  48: "Kind_EasterEgg",
  49: "Kind_EventObjFtr",
  50: "Kind_Feather",
  51: "Kind_Fence",
  52: "Kind_FierworkHand",
  53: "Kind_FireworkM",
  54: "Kind_Fish",
  55: "Kind_FishBait",
  56: "Kind_FishingRod",
  57: "Kind_FishToy",
  58: "Kind_Flower",
  59: "Kind_FlowerBud",
  60: "Kind_FlowerSeed",
  61: "Kind_FlowerShower",
  62: "Kind_Fossil",
  63: "Kind_FossilUnknown",
  64: "Kind_Fruit",
  65: "Kind_Ftr",
  66: "Kind_FtrWall",
  67: "Kind_GardenEditList",
  68: "Kind_Giftbox",
  69: "Kind_GroundMaker",
  70: "Kind_Gyroid",
  71: "Kind_GyroidScrap",
  72: "Kind_HandBag",
  73: "Kind_HandheldPennant",
  74: "Kind_HarvestDish",
  75: "Kind_Helmet",
  76: "Kind_Honeycomb",
  77: "Kind_HousePost",
  78: "Kind_HousingKit",
  79: "Kind_HousingKitBirdge",
  80: "Kind_HousingKitRcoQuest",
  81: "Kind_Icecandy",
  82: "Kind_Insect",
  83: "Kind_InsectToy",
  84: "Kind_JohnnyQuest",
  85: "Kind_JohnnyQuestDust",
  86: "Kind_JuiceFuzzyapple",
  87: "Kind_Ladder",
  88: "Kind_Lantern",
  89: "Kind_LicenseItem",
  90: "Kind_LostQuest",
  91: "Kind_LostQuestDust",
  92: "Kind_LoveCrystal",
  93: "Kind_MaracasCarnival",
  94: "Kind_Medicine",
  95: "Kind_Megaphone",
  96: "Kind_MessageBottle",
  97: "Kind_MilePlaneTicket",
  98: "Kind_Money",
  99: "Kind_Mushroom",
  100: "Kind_Music",
  101: "Kind_MusicMiss",
  102: "Kind_MyDesignObject",
  103: "Kind_MyDesignTexture",
  104: "Kind_Net",
  105: "Kind_NnpcRoomMarker",
  106: "Kind_NpcOutfit",
  107: "Kind_Ocarina",
  108: "Kind_OneRoomBox",
  109: "Kind_Ore",
  110: "Kind_Otoshidama",
  111: "Kind_Panflute",
  112: "Kind_Partyhorn",
  113: "Kind_PartyPopper",
  114: "Kind_PhotoStudioList",
  115: "Kind_Picture",
  116: "Kind_PictureFake",
  117: "Kind_Pillar",
  118: "Kind_PinataStick",
  119: "Kind_PirateQuest",
  120: "Kind_PitFallSeed",
  121: "Kind_PlayerDemoOutfit",
  122: "Kind_Poster",
  123: "Kind_QuestChristmasPresentbox",
  124: "Kind_QuestWrapping",
  125: "Kind_RainbowFeather",
  126: "Kind_RiverMaker",
  127: "Kind_RollanTicket",
  128: "Kind_RoomFloor",
  129: "Kind_RoomWall",
  130: "Kind_Rug",
  131: "Kind_RugMyDesign",
  132: "Kind_Sakurapetal",
  133: "Kind_Sculpture",
  134: "Kind_SculptureFake",
  135: "Kind_SequenceOnly",
  136: "Kind_SettingLadder",
  137: "Kind_ShellDrift",
  138: "Kind_ShellFish",
  139: "Kind_Shoes",
  140: "Kind_ShopTorso",
  141: "Kind_Shovel",
  142: "Kind_SincerityTowel",
  143: "Kind_Slingshot",
  144: "Kind_SlopeItem",
  145: "Kind_SmartPhone",
  146: "Kind_SnowCrystal",
  147: "Kind_Socks",
  148: "Kind_SouvenirChocolate",
  149: "Kind_SoySet",
  150: "Kind_SpeakerMegaphone",
  151: "Kind_StarPiece",
  152: "Kind_StickLight",
  153: "Kind_StickLightColorful",
  154: "Kind_SubToolCan",
  155: "Kind_SubToolDonut",
  156: "Kind_SubToolEat",
  157: "Kind_SubToolEatDrop",
  158: "Kind_SubToolEatRemakeable",
  159: "Kind_SubToolGeneric",
  160: "Kind_SubToolIcecream",
  161: "Kind_SubToolIcesoft",
  162: "Kind_SubToolRemakeable",
  163: "Kind_SubToolSensu",
  164: "Kind_TailorTicket",
  165: "Kind_Tambourine",
  166: "Kind_Tapioca",
  167: "Kind_Timer",
  168: "Kind_Transceiver",
  169: "Kind_Trash",
  170: "Kind_TreasureQuest",
  171: "Kind_TreasureQuestDust",
  172: "Kind_Tree",
  173: "Kind_TreeSeedling",
  174: "Kind_Turnip",
  175: "Kind_TurnipExpired",
  176: "Kind_Uchiwa",
  177: "Kind_Umbrella",
  178: "Kind_VegeSeedling",
  179: "Kind_Vegetable",
  180: "Kind_VegeTree",
  181: "Kind_Vine",
  182: "Kind_Watering",
  183: "Kind_Weed",
  184: "Kind_WeedLight",
  185: "Kind_Windmill",
  186: "Kind_WoodenStickTool",
  187: "Kind_WrappingPaper",
  188: "Kind_XmasDeco",
  189: "Kind_YutaroWisp",
  190: "Onepiece_Dress",
  191: "Onepiece_Long",
  192: "Onepiece_Middle",
  193: "Onepiece_Short",
  194: "Shoes_Boots",
  195: "Shoes_Pumps",
  196: "Top_Long",
  197: "Top_Middle",
  198: "Top_Short",
};

// ---------------------------------------------------------------------------
// Category classification sets (byte values from the enum above)
// ---------------------------------------------------------------------------

/** Clothing byte values — mirrors NHSE.Core ItemKindExtensions.Clothing */
const CLOTHING_KINDS = new Set<number>([
  0, 1, 2, // Bottoms_*
  8,        // Kind_Accessory
  11,       // Kind_Bag
  23,       // Kind_Cap
  75,       // Kind_Helmet
  106,      // Kind_NpcOutfit
  121,      // Kind_PlayerDemoOutfit
  139,      // Kind_Shoes
  147,      // Kind_Socks
  190, 191, 192, 193, // Onepiece_*
  194, 195,           // Shoes_*
  196, 197, 198,      // Top_*
]);

/** Furniture byte values — mirrors NHSE.Core ItemKindExtensions.Furniture + wall */
const FURNITURE_KINDS = new Set<number>([
  3, 4, 5, 6, 7, // Ftr_*
  42,             // Kind_DummyFtr
  49,             // Kind_EventObjFtr
  65,             // Kind_Ftr
  66,             // Kind_FtrWall
  30,             // Kind_Counter
  117,            // Kind_Pillar
  37,             // Kind_DoorDeco
]);

/** Tool byte values */
const TOOL_KINDS = new Set<number>([
  10,  // Kind_Axe
  56,  // Kind_FishingRod
  87,  // Kind_Ladder
  104, // Kind_Net
  141, // Kind_Shovel
  143, // Kind_Slingshot
  182, // Kind_Watering
  24,  // Kind_ChangeStick (wands)
  136, // Kind_SettingLadder
]);

// ---------------------------------------------------------------------------
// Hardcoded game-list ID sets (from NHSE.Core GameLists)
// ---------------------------------------------------------------------------

function expandRange(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

const FISH_IDS = new Set<number>([
  328, 329,
  ...expandRange(2215, 2284),
  2502,
  3466, 3469, 3470,
  ...expandRange(4189, 4204),
  5254,
  12514,
]);

const BUG_IDS = new Set<number>([
  ...expandRange(582, 653),
  ...expandRange(3477, 3485),
  3487, 3539, 3540,
  4702,
  5157, 5339, 5859,
  7374,
]);

const FOSSIL_IDS = new Set<number>([
  ...expandRange(169, 171),
  177, 178,
  ...expandRange(180, 182),
  184, 185,
  ...expandRange(188, 190),
  192, 193,
  195, 196,
  198, 199,
  ...expandRange(202, 204),
  ...expandRange(206, 208),
  210, 211,
  213, 214,
  ...expandRange(216, 220),
  ...expandRange(222, 224),
  ...expandRange(226, 228),
  ...expandRange(234, 236),
  ...expandRange(238, 240),
  ...expandRange(242, 244),
  ...expandRange(294, 303),
  4651,
  ...expandRange(4658, 4665),
  ...expandRange(4688, 4691),
  ...expandRange(4697, 4699),
  7251,
]);

const ART_IDS = new Set<number>([
  2, 5, 6, 9, 10, 13, 14, 17, 18, 20, 23, 24, 27, 28, 31, 32, 34,
  38, 41, 42, 44, 46, 48, 50, 52, 55, 56, 65, 66, 68, 71, 72, 75, 76, 78,
  ...expandRange(1331, 1346),
  ...expandRange(12533, 12541),
  12570, 12571,
  ...expandRange(12618, 12625),
  12629,
]);

// ---------------------------------------------------------------------------
// Species prefix -> species name (VillagerSpecies)
// ---------------------------------------------------------------------------

const SPECIES_MAP: Record<string, string> = {
  ant: "Anteater",
  bea: "Bear",
  brd: "Bird",
  bul: "Bull",
  cat: "Cat",
  cbr: "Bear Cub",
  chn: "Chicken",
  cow: "Cow",
  crd: "Crocodile",
  der: "Deer",
  dog: "Dog",
  duk: "Duck",
  elp: "Elephant",
  flg: "Frog",
  goa: "Goat",
  gor: "Gorilla",
  ham: "Hamster",
  hip: "Hippo",
  hrs: "Horse",
  kal: "Koala",
  kgr: "Kangaroo",
  lon: "Lion",
  mnk: "Monkey",
  mus: "Mouse",
  ocp: "Octopus",
  ost: "Ostrich",
  pbr: "Eagle",
  pgn: "Penguin",
  pig: "Pig",
  rbt: "Rabbit",
  rhn: "Rhino",
  shp: "Sheep",
  squ: "Squirrel",
  tig: "Tiger",
  wol: "Wolf",
};

// ---------------------------------------------------------------------------
// Well-known villager personality data (internalId -> personality).
// Source: community-verified datasets. Using "Unknown" as fallback.
// ---------------------------------------------------------------------------

const VILLAGER_PERSONALITIES: Record<string, string> = {
  // Anteaters
  ant00: "Cranky", ant01: "Jock", ant02: "Peppy", ant03: "Peppy",
  ant05: "Normal", ant06: "Snooty", ant08: "Normal", ant09: "Smug",
  // Bears
  bea00: "Jock", bea01: "Peppy", bea02: "Cranky", bea03: "Cranky",
  bea05: "Lazy", bea06: "Cranky", bea07: "Peppy", bea08: "Normal",
  bea09: "Cranky", bea10: "Normal", bea11: "Cranky", bea12: "Uchi",
  bea13: "Lazy", bea14: "Smug",
  // Birds
  brd00: "Jock", brd01: "Peppy", brd02: "Lazy", brd03: "Snooty",
  brd04: "Cranky", brd05: "Peppy", brd06: "Jock", brd07: "Normal",
  brd08: "Cranky", brd09: "Jock", brd10: "Normal", brd11: "Peppy",
  brd12: "Smug",
  // Bulls
  bul00: "Lazy", bul01: "Cranky", bul02: "Lazy", bul03: "Cranky",
  bul04: "Jock", bul05: "Jock", bul06: "Cranky",
  // Cats
  cat00: "Lazy", cat01: "Normal", cat02: "Peppy", cat03: "Snooty",
  cat04: "Normal", cat05: "Peppy", cat06: "Lazy", cat07: "Snooty",
  cat08: "Lazy", cat09: "Cranky", cat10: "Cranky", cat11: "Snooty",
  cat12: "Peppy", cat14: "Peppy", cat15: "Normal", cat17: "Smug",
  cat18: "Peppy", cat19: "Peppy", cat20: "Jock", cat23: "Normal",
  cat24: "Smug",
  // Bear Cubs
  cbr00: "Peppy", cbr01: "Snooty", cbr02: "Normal", cbr03: "Peppy",
  cbr04: "Snooty", cbr05: "Lazy", cbr06: "Normal", cbr08: "Lazy",
  cbr09: "Peppy", cbr10: "Cranky", cbr11: "Jock", cbr12: "Smug",
  cbr13: "Jock", cbr14: "Normal", cbr15: "Uchi",
  // Chickens
  chn00: "Peppy", chn01: "Snooty", chn02: "Jock", chn03: "Lazy",
  chn04: "Normal", chn05: "Peppy", chn06: "Cranky", chn07: "Jock",
  chn08: "Uchi", chn09: "Smug",
  // Cows
  cow00: "Snooty", cow01: "Normal", cow02: "Normal", cow03: "Peppy",
  cow04: "Lazy", cow05: "Uchi",
  // Crocodiles
  crd00: "Lazy", crd01: "Jock", crd02: "Cranky", crd03: "Snooty",
  crd04: "Normal", crd05: "Cranky", crd06: "Peppy",
  // Deer
  der00: "Jock", der01: "Normal", der02: "Snooty", der03: "Peppy",
  der04: "Snooty", der05: "Lazy", der06: "Cranky", der07: "Peppy",
  der08: "Smug", der09: "Normal", der10: "Jock",
  // Dogs
  dog00: "Peppy", dog01: "Lazy", dog02: "Jock", dog03: "Lazy",
  dog04: "Normal", dog05: "Peppy", dog06: "Normal", dog07: "Cranky",
  dog08: "Snooty", dog09: "Cranky", dog10: "Peppy", dog11: "Snooty",
  dog13: "Jock", dog14: "Peppy", dog15: "Jock", dog16: "Smug",
  dog17: "Uchi",
  // Ducks
  duk00: "Jock", duk01: "Peppy", duk02: "Snooty", duk03: "Lazy",
  duk04: "Cranky", duk05: "Normal", duk06: "Jock", duk07: "Peppy",
  duk08: "Normal", duk09: "Peppy", duk10: "Snooty", duk11: "Peppy",
  duk12: "Lazy", duk13: "Cranky", duk14: "Uchi", duk15: "Jock",
  duk16: "Smug", duk17: "Normal",
  // Elephants
  elp00: "Jock", elp01: "Normal", elp02: "Cranky", elp03: "Lazy",
  elp04: "Snooty", elp05: "Normal", elp06: "Peppy", elp07: "Peppy",
  elp08: "Cranky", elp09: "Normal", elp10: "Uchi", elp11: "Smug",
  // Frogs
  flg00: "Jock", flg01: "Normal", flg02: "Cranky", flg03: "Peppy",
  flg04: "Lazy", flg05: "Jock", flg06: "Normal", flg07: "Peppy",
  flg08: "Snooty", flg09: "Snooty", flg10: "Lazy", flg11: "Peppy",
  flg12: "Cranky", flg13: "Normal", flg14: "Smug", flg15: "Uchi",
  flg16: "Jock", flg17: "Cranky", flg18: "Lazy",
  // Goats
  goat00: "Lazy",
  goa00: "Lazy", goa01: "Normal", goa02: "Cranky", goa03: "Peppy",
  goa04: "Jock", goa05: "Snooty", goa06: "Peppy", goa07: "Uchi",
  goa08: "Smug",
  // Gorillas
  gor00: "Cranky", gor01: "Lazy", gor02: "Snooty", gor03: "Cranky",
  gor04: "Peppy", gor05: "Jock", gor06: "Jock", gor07: "Normal",
  gor08: "Uchi", gor09: "Smug",
  // Hamsters
  ham00: "Jock", ham01: "Peppy", ham02: "Peppy", ham03: "Lazy",
  ham04: "Normal", ham05: "Normal", ham06: "Jock", ham07: "Snooty",
  ham08: "Uchi",
  // Hippos
  hip00: "Normal", hip01: "Peppy", hip02: "Cranky", hip03: "Snooty",
  hip04: "Lazy", hip05: "Jock", hip06: "Peppy", hip07: "Cranky",
  hip08: "Uchi",
  // Horses
  hrs00: "Snooty", hrs01: "Jock", hrs02: "Peppy", hrs03: "Lazy",
  hrs04: "Peppy", hrs05: "Normal", hrs06: "Cranky", hrs07: "Normal",
  hrs08: "Jock", hrs09: "Snooty", hrs10: "Peppy", hrs11: "Lazy",
  hrs12: "Cranky", hrs13: "Normal", hrs14: "Jock", hrs15: "Uchi",
  // Koalas
  kal00: "Peppy", kal01: "Snooty", kal02: "Normal", kal03: "Lazy",
  kal04: "Normal", kal05: "Cranky", kal06: "Peppy", kal07: "Snooty",
  kal08: "Uchi", kal09: "Smug",
  // Kangaroos
  kgr00: "Peppy", kgr01: "Snooty", kgr02: "Normal", kgr03: "Normal",
  kgr04: "Peppy", kgr05: "Cranky", kgr06: "Uchi", kgr07: "Jock",
  kgr08: "Smug",
  // Lions
  lon00: "Lazy", lon01: "Snooty", lon02: "Cranky", lon03: "Normal",
  lon04: "Jock", lon05: "Peppy", lon06: "Jock", lon07: "Uchi",
  lon08: "Smug",
  // Monkeys
  mnk00: "Lazy", mnk01: "Jock", mnk02: "Peppy", mnk03: "Cranky",
  mnk04: "Normal", mnk05: "Snooty", mnk06: "Uchi", mnk07: "Smug",
  mnk08: "Peppy",
  // Mice
  mus00: "Snooty", mus01: "Peppy", mus02: "Jock", mus03: "Normal",
  mus04: "Lazy", mus05: "Peppy", mus06: "Cranky", mus07: "Snooty",
  mus08: "Peppy", mus09: "Normal", mus10: "Lazy", mus11: "Peppy",
  mus12: "Peppy", mus13: "Jock", mus14: "Normal", mus15: "Uchi",
  mus16: "Smug", mus17: "Jock",
  // Octopuses
  ocp00: "Cranky", ocp01: "Normal", ocp02: "Lazy",
  // Ostriches
  ost00: "Snooty", ost01: "Cranky", ost02: "Normal", ost03: "Peppy",
  ost04: "Snooty", ost05: "Jock", ost06: "Peppy", ost07: "Normal",
  ost08: "Lazy", ost09: "Uchi", ost10: "Smug",
  // Eagles
  pbr00: "Cranky", pbr01: "Snooty", pbr02: "Jock", pbr03: "Cranky",
  pbr05: "Cranky", pbr06: "Cranky", pbr07: "Jock", pbr08: "Smug",
  pbr09: "Normal", pbr10: "Snooty",
  // Penguins
  pgn00: "Normal", pgn01: "Jock", pgn02: "Lazy", pgn03: "Cranky",
  pgn04: "Snooty", pgn05: "Snooty", pgn06: "Lazy", pgn07: "Lazy",
  pgn09: "Lazy", pgn10: "Lazy", pgn11: "Jock", pgn12: "Smug",
  pgn13: "Uchi", pgn14: "Peppy",
  // Pigs
  pig00: "Jock", pig01: "Peppy", pig02: "Cranky", pig03: "Lazy",
  pig04: "Normal", pig05: "Lazy", pig08: "Jock", pig09: "Cranky",
  pig10: "Normal", pig11: "Peppy", pig13: "Normal", pig14: "Smug",
  pig15: "Jock", pig16: "Snooty", pig17: "Uchi",
  // Rabbits
  rbt00: "Peppy", rbt01: "Snooty", rbt02: "Peppy", rbt03: "Lazy",
  rbt04: "Normal", rbt05: "Peppy", rbt06: "Cranky", rbt07: "Jock",
  rbt08: "Peppy", rbt09: "Snooty", rbt10: "Normal", rbt11: "Lazy",
  rbt12: "Peppy", rbt13: "Cranky", rbt14: "Jock", rbt15: "Snooty",
  rbt16: "Peppy", rbt17: "Normal", rbt18: "Uchi", rbt19: "Smug",
  rbt20: "Jock",
  // Rhinos
  rhn00: "Cranky", rhn01: "Snooty", rhn02: "Peppy", rhn03: "Normal",
  rhn04: "Jock", rhn05: "Peppy", rhn06: "Uchi",
  // Sheep
  shp00: "Normal", shp01: "Snooty", shp02: "Peppy", shp03: "Jock",
  shp04: "Normal", shp05: "Lazy", shp06: "Snooty", shp07: "Peppy",
  shp08: "Normal", shp09: "Cranky", shp10: "Lazy", shp11: "Peppy",
  shp12: "Uchi", shp13: "Smug",
  // Squirrels
  squ00: "Peppy", squ01: "Normal", squ02: "Peppy", squ03: "Snooty",
  squ04: "Cranky", squ05: "Peppy", squ06: "Lazy", squ07: "Normal",
  squ08: "Jock", squ09: "Peppy", squ10: "Jock", squ11: "Normal",
  squ12: "Cranky", squ13: "Snooty", squ14: "Lazy", squ15: "Peppy",
  squ16: "Uchi", squ17: "Smug", squ18: "Jock",
  // Tigers
  tig00: "Peppy", tig01: "Snooty", tig02: "Lazy", tig03: "Jock",
  tig04: "Cranky", tig05: "Normal", tig06: "Peppy", tig07: "Uchi",
  // Wolves
  wol00: "Cranky", wol01: "Snooty", wol02: "Normal", wol03: "Peppy",
  wol04: "Jock", wol05: "Cranky", wol06: "Normal", wol07: "Snooty",
  wol08: "Peppy", wol09: "Lazy", wol10: "Uchi", wol11: "Smug",
};

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

interface ItemRecord {
  id: number;
  name: string;
  category: string;
  sprite: string | null;
}

interface VillagerRecord {
  id: string;
  name: string;
  species: string;
  personality: string;
  sprite: string | null;
}

interface RecipeRecord {
  recipeId: number;
  resultItemId: number;
  resultItemName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created directory: ${dirPath}`);
  }
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`  Wrote ${filePath}`);
}

/**
 * Determine the high-level category for an item.
 *
 * Priority order:
 *   1. Hardcoded game-list IDs (Fish, Bug, Fossil, Art)
 *   2. ItemKind byte classification (Clothing, Furniture, Tool, etc.)
 *   3. Fallback to "Other"
 */
function classifyItem(id: number, kindByte: number): string {
  // 1. Hardcoded game-list overrides
  if (FISH_IDS.has(id)) return "Fish";
  if (BUG_IDS.has(id)) return "Bug";
  if (FOSSIL_IDS.has(id)) return "Fossil";
  if (ART_IDS.has(id)) return "Art";

  // 2. ItemKind byte-based classification
  const kindName = ITEM_KIND_ENUM[kindByte] ?? "Unknown";

  if (CLOTHING_KINDS.has(kindByte)) return "Clothing";
  if (FURNITURE_KINDS.has(kindByte)) return "Furniture";
  if (TOOL_KINDS.has(kindByte)) return "Tool";

  // Music
  if (kindByte === 100 || kindByte === 101) return "Music"; // Kind_Music, Kind_MusicMiss

  // Wallpaper & Flooring
  if (kindByte === 129) return "Wallpaper";  // Kind_RoomWall
  if (kindByte === 128) return "Flooring";   // Kind_RoomFloor

  // Rugs
  if (kindByte === 130 || kindByte === 131 || kindByte === 27) return "Rug";
  // Kind_Rug, Kind_RugMyDesign, Kind_CommonFabricRug

  // Recipes
  if (kindByte === 36 || kindByte === 41 || kindByte === 45) return "Recipe";
  // Kind_DIYRecipe, Kind_DummyDIYRecipe, Kind_DummyRecipe

  // Materials
  if (
    kindByte === 31 ||  // Kind_CraftMaterial
    kindByte === 109 || // Kind_Ore
    kindByte === 29 ||  // Kind_CookingMaterial
    kindByte === 33     // Kind_CraftRemake
  ) {
    return "Material";
  }

  // Fossils by kind byte (in case not in hardcoded list)
  if (kindByte === 62 || kindByte === 63) return "Fossil";

  // Fish/Insect by kind byte (in case not in hardcoded list)
  if (kindByte === 54 || kindByte === 35) return "Fish";   // Kind_Fish, Kind_DiveFish
  if (kindByte === 82) return "Bug";                        // Kind_Insect

  // Art by kind byte
  if (kindByte === 115 || kindByte === 116 || kindByte === 133 || kindByte === 134) {
    return "Art"; // Kind_Picture, Kind_PictureFake, Kind_Sculpture, Kind_SculptureFake
  }

  // Gyroid
  if (kindByte === 70 || kindByte === 71) return "Furniture"; // Gyroids are furniture

  // Fence
  if (kindByte === 51) return "Furniture"; // Kind_Fence

  // Check for some known "not useful" kinds we can still tag
  if (kindName.startsWith("Kind_SubTool")) return "Tool";

  return "Other";
}

/**
 * Extract the species prefix from a villager internal ID.
 * E.g. "ant00" -> "ant", "cbr12" -> "cbr"
 */
function getSpeciesPrefix(internalId: string): string {
  const match = internalId.match(/^([a-z]+)/);
  return match ? match[1] : "";
}

// ---------------------------------------------------------------------------
// Main extraction functions
// ---------------------------------------------------------------------------

/**
 * Parse the ItemMenuIconType enum from its C# source file.
 * Returns an array where index = enum numeric value, value = enum name.
 */
function parseMenuIconEnum(): string[] {
  const csContent = fs.readFileSync(MENUICON_ENUM_PATH, "utf-8");
  const names: string[] = [];
  // Match each enum entry (name, optionally with = value)
  const entryRegex = /^\s+(\w+)(?:\s*=\s*.+)?,?\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = entryRegex.exec(csContent)) !== null) {
    const name = m[1];
    // Skip the "Unknown = ushort.MaxValue" sentinel
    if (name === "Unknown") continue;
    names.push(name);
  }
  return names;
}

/**
 * Build a mapping from item ID -> sprite filename using item_menuicon.bin.
 * The bin file is an array of ushort (2 bytes LE each). Each ushort at
 * position i is the ItemMenuIconType enum value for item ID i.
 */
function buildItemSpriteMap(menuIconNames: string[]): Map<number, string> {
  const buf = fs.readFileSync(ITEM_MENUICON_BIN_PATH);
  const spriteMap = new Map<number, string>();
  const numItems = buf.length / 2; // ushort = 2 bytes

  // Build a set of available sprite files for quick lookup
  const availableSprites = new Set(
    fs.readdirSync(ITEM_SPRITES_SRC)
      .filter(f => f.endsWith(".png"))
      .map(f => f.replace(".png", ""))
  );

  for (let i = 0; i < numItems; i++) {
    const enumValue = buf.readUInt16LE(i * 2);
    const iconName = menuIconNames[enumValue];
    if (iconName && !iconName.startsWith("_0x") && availableSprites.has(iconName)) {
      spriteMap.set(i, `/sprites/items/${iconName}.png`);
    }
  }

  console.log(`  Built sprite map: ${spriteMap.size} items have sprites`);
  return spriteMap;
}

function extractItems(): { items: ItemRecord[]; nameMap: Map<number, string> } {
  console.log("\n[1/4] Extracting items...");

  const textContent = fs.readFileSync(ITEM_TEXT_PATH, "utf-8");
  const lines = textContent.split("\n");
  // Remove BOM if present
  if (lines[0] && lines[0].charCodeAt(0) === 0xfeff) {
    lines[0] = lines[0].slice(1);
  }

  const kindBuf = fs.readFileSync(ITEM_KIND_BIN_PATH);

  // Build item ID -> sprite mapping
  const menuIconNames = parseMenuIconEnum();
  console.log(`  Parsed ${menuIconNames.length} MenuIcon enum entries`);
  const spriteMap = buildItemSpriteMap(menuIconNames);

  const items: ItemRecord[] = [];
  const nameMap = new Map<number, string>();

  for (let id = 0; id < lines.length; id++) {
    const name = lines[id]?.trim() ?? "";
    if (!name || name === "(None)") continue;

    nameMap.set(id, name);

    const kindByte = id < kindBuf.length ? kindBuf[id] : 255;
    const category = classifyItem(id, kindByte as number);
    const sprite = spriteMap.get(id) ?? null;

    items.push({ id, name, category, sprite });
  }

  console.log(`  Found ${items.length} items with names`);

  // Log category breakdown
  const categoryCounts: Record<string, number> = {};
  for (const item of items) {
    categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`    ${cat}: ${count}`);
  }

  const outPath = path.join(DATA_OUT, "items.json");
  writeJson(outPath, items);

  return { items, nameMap };
}

function extractVillagers(): VillagerRecord[] {
  console.log("\n[2/4] Extracting villagers...");

  const textContent = fs.readFileSync(VILLAGER_TEXT_PATH, "utf-8");
  const lines = textContent.split("\n");

  const villagers: VillagerRecord[] = [];

  // Known villager species prefixes
  const knownPrefixes = new Set(Object.keys(SPECIES_MAP));

  for (const rawLine of lines) {
    // Remove BOM if present
    const line = rawLine.replace(/^\uFEFF/, "").trim();
    if (!line) continue;

    const tabIndex = line.indexOf("\t");
    if (tabIndex === -1) continue;

    const internalId = line.slice(0, tabIndex).trim();
    const displayName = line.slice(tabIndex + 1).trim();

    if (!internalId || !displayName) continue;

    // Only include actual villagers (skip NPCs, special characters)
    const prefix = getSpeciesPrefix(internalId);
    if (!knownPrefixes.has(prefix)) continue;

    const species = SPECIES_MAP[prefix] ?? "Unknown";
    const personality = VILLAGER_PERSONALITIES[internalId] ?? "Unknown";

    // Check if sprite exists
    const spriteSrc = path.join(VILLAGER_SPRITES_SRC, `${internalId}.png`);
    const hasSprite = fs.existsSync(spriteSrc);

    villagers.push({
      id: internalId,
      name: displayName,
      species,
      personality,
      sprite: hasSprite ? `/sprites/villagers/${internalId}.png` : null,
    });
  }

  console.log(`  Found ${villagers.length} villagers`);

  // Log species breakdown
  const speciesCounts: Record<string, number> = {};
  for (const v of villagers) {
    speciesCounts[v.species] = (speciesCounts[v.species] ?? 0) + 1;
  }
  for (const [sp, count] of Object.entries(speciesCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`    ${sp}: ${count}`);
  }

  // Log personality breakdown
  const personalityCounts: Record<string, number> = {};
  for (const v of villagers) {
    personalityCounts[v.personality] =
      (personalityCounts[v.personality] ?? 0) + 1;
  }
  console.log("  Personality breakdown:");
  for (const [p, count] of Object.entries(personalityCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`    ${p}: ${count}`);
  }

  const outPath = path.join(DATA_OUT, "villagers.json");
  writeJson(outPath, villagers);

  return villagers;
}

function extractRecipes(nameMap: Map<number, string>): RecipeRecord[] {
  console.log("\n[3/4] Extracting recipes...");

  const csContent = fs.readFileSync(RECIPE_CS_PATH, "utf-8");

  // Match lines like: {0x006, 02596}, // juicy-apple TV
  const recipeRegex = /\{0x([0-9A-Fa-f]+),\s*(\d+)\}/g;

  const recipes: RecipeRecord[] = [];
  let match: RegExpExecArray | null;

  while ((match = recipeRegex.exec(csContent)) !== null) {
    const recipeId = parseInt(match[1], 16);
    const resultItemId = parseInt(match[2], 10);
    const resultItemName = nameMap.get(resultItemId) ?? `Unknown (${resultItemId})`;

    recipes.push({ recipeId, resultItemId, resultItemName });
  }

  console.log(`  Found ${recipes.length} recipes`);

  const outPath = path.join(DATA_OUT, "recipes.json");
  writeJson(outPath, recipes);

  return recipes;
}

function copySprites(): void {
  console.log("\n[4/4] Copying sprites...");

  // Copy villager sprites
  ensureDir(VILLAGER_SPRITES_DEST);
  const villagerFiles = fs
    .readdirSync(VILLAGER_SPRITES_SRC)
    .filter((f) => f.endsWith(".png"));
  let villagerCount = 0;
  for (const file of villagerFiles) {
    fs.copyFileSync(
      path.join(VILLAGER_SPRITES_SRC, file),
      path.join(VILLAGER_SPRITES_DEST, file),
    );
    villagerCount++;
  }
  console.log(
    `  Copied ${villagerCount} villager sprites to ${VILLAGER_SPRITES_DEST}`,
  );

  // Copy item/menu-icon sprites
  ensureDir(ITEM_SPRITES_DEST);
  const itemFiles = fs
    .readdirSync(ITEM_SPRITES_SRC)
    .filter((f) => f.endsWith(".png"));
  let itemCount = 0;
  for (const file of itemFiles) {
    fs.copyFileSync(
      path.join(ITEM_SPRITES_SRC, file),
      path.join(ITEM_SPRITES_DEST, file),
    );
    itemCount++;
  }
  console.log(`  Copied ${itemCount} item sprites to ${ITEM_SPRITES_DEST}`);
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

function main(): void {
  console.log("=== ACNH Data Extraction ===");
  console.log(`Source: ${NHSE_ROOT}`);
  console.log(`Output: ${PROJECT_ROOT}`);

  // Ensure output directories exist
  ensureDir(DATA_OUT);

  // Extract items first (recipes need the name map)
  const { nameMap } = extractItems();

  // Extract villagers
  extractVillagers();

  // Extract recipes (needs item name map)
  extractRecipes(nameMap);

  // Copy sprites
  copySprites();

  console.log("\n=== Extraction complete ===");
}

main();
