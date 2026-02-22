/**
 * Fetch critter data (fish, bugs, sea creatures) from the Nookipedia API
 * and save to src/data/critters.json.
 *
 * Usage:  npx tsx scripts/fetch-critters.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = "/Users/arjunmyanger/Documents/Dev/acnh-catalog";
const OUTPUT_PATH = path.join(PROJECT_ROOT, "src/data/critters.json");

// Load .env manually (no external dependency needed)
const envPath = path.join(PROJECT_ROOT, ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
}

const API_KEY = process.env.NOOKIPEDIA_API_KEY;
if (!API_KEY) {
  console.error("Error: NOOKIPEDIA_API_KEY not set. Add it to .env file.");
  process.exit(1);
}

const BASE_URL = "https://api.nookipedia.com";
const FETCH_TIMEOUT_MS = 60_000;
const DELAY_BETWEEN_REQUESTS_MS = 1_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthAvailability {
  [month: string]: string;
}

interface CritterOutput {
  name: string;
  type: "Fish" | "Bug" | "Sea Creature";
  imageUrl: string;
  location: string | null;
  rarity: string | null;
  sellPrice: number;
  sellPriceSpecial: number | null;
  catchphrase: string | null;
  shadowSize: string | null;
  speed: string | null;
  north: MonthAvailability;
  south: MonthAvailability;
}

interface NookipediaTimesByMonth {
  [month: string]: string;
}

interface NookipediaFish {
  name: string;
  image_url: string;
  location: string;
  shadow_size: string;
  rarity: string;
  sell_nook: string | number;
  sell_cj: string | number;
  catchphrases: string[];
  north: { times_by_month: NookipediaTimesByMonth };
  south: { times_by_month: NookipediaTimesByMonth };
}

interface NookipediaBug {
  name: string;
  image_url: string;
  location: string;
  rarity: string;
  sell_nook: string | number;
  sell_flick: string | number;
  catchphrases: string[];
  north: { times_by_month: NookipediaTimesByMonth };
  south: { times_by_month: NookipediaTimesByMonth };
}

interface NookipediaSeaCreature {
  name: string;
  image_url: string;
  shadow_size: string;
  shadow_movement: string;
  sell_nook: string | number;
  catchphrases: string[];
  north: { times_by_month: NookipediaTimesByMonth };
  south: { times_by_month: NookipediaTimesByMonth };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchEndpoint<T>(endpointPath: string): Promise<T[]> {
  const url = `${BASE_URL}${endpointPath}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": API_KEY!,
        "Accept-Version": "2.0.0",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`Expected array response from ${url}, got ${typeof data}`);
    }

    return data as T[];
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Convert API values that may be strings or numbers to a proper number. */
function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function extractMonths(timesByMonth: NookipediaTimesByMonth): MonthAvailability {
  const result: MonthAvailability = {};
  for (let m = 1; m <= 12; m++) {
    result[String(m)] = timesByMonth[String(m)] ?? "NA";
  }
  return result;
}

// ---------------------------------------------------------------------------
// Transform functions
// ---------------------------------------------------------------------------

function transformFish(fish: NookipediaFish): CritterOutput {
  return {
    name: fish.name,
    type: "Fish",
    imageUrl: fish.image_url,
    location: fish.location,
    rarity: fish.rarity,
    sellPrice: toNumber(fish.sell_nook),
    sellPriceSpecial: toNumber(fish.sell_cj),
    catchphrase: fish.catchphrases.length > 0 ? fish.catchphrases[0] : null,
    shadowSize: fish.shadow_size,
    speed: null,
    north: extractMonths(fish.north.times_by_month),
    south: extractMonths(fish.south.times_by_month),
  };
}

function transformBug(bug: NookipediaBug): CritterOutput {
  return {
    name: bug.name,
    type: "Bug",
    imageUrl: bug.image_url,
    location: bug.location,
    rarity: bug.rarity,
    sellPrice: toNumber(bug.sell_nook),
    sellPriceSpecial: toNumber(bug.sell_flick),
    catchphrase: bug.catchphrases.length > 0 ? bug.catchphrases[0] : null,
    shadowSize: null,
    speed: null,
    north: extractMonths(bug.north.times_by_month),
    south: extractMonths(bug.south.times_by_month),
  };
}

function transformSeaCreature(sea: NookipediaSeaCreature): CritterOutput {
  return {
    name: sea.name,
    type: "Sea Creature",
    imageUrl: sea.image_url,
    location: null,
    rarity: null,
    sellPrice: toNumber(sea.sell_nook),
    sellPriceSpecial: null,
    catchphrase: sea.catchphrases.length > 0 ? sea.catchphrases[0] : null,
    shadowSize: sea.shadow_size,
    speed: sea.shadow_movement,
    north: extractMonths(sea.north.times_by_month),
    south: extractMonths(sea.south.times_by_month),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Nookipedia Critter Fetcher ===\n");

  const allCritters: CritterOutput[] = [];

  // 1. Fetch fish
  console.log("[1/3] Fetching Fish (/nh/fish)...");
  try {
    const fishData = await fetchEndpoint<NookipediaFish>("/nh/fish");
    const fish = fishData.map(transformFish);
    allCritters.push(...fish);
    console.log(`  Fetched ${fish.length} fish`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  ERROR fetching fish: ${message}`);
  }

  await sleep(DELAY_BETWEEN_REQUESTS_MS);

  // 2. Fetch bugs
  console.log("[2/3] Fetching Bugs (/nh/bugs)...");
  try {
    const bugData = await fetchEndpoint<NookipediaBug>("/nh/bugs");
    const bugs = bugData.map(transformBug);
    allCritters.push(...bugs);
    console.log(`  Fetched ${bugs.length} bugs`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  ERROR fetching bugs: ${message}`);
  }

  await sleep(DELAY_BETWEEN_REQUESTS_MS);

  // 3. Fetch sea creatures
  console.log("[3/3] Fetching Sea Creatures (/nh/sea)...");
  try {
    const seaData = await fetchEndpoint<NookipediaSeaCreature>("/nh/sea");
    const seaCreatures = seaData.map(transformSeaCreature);
    allCritters.push(...seaCreatures);
    console.log(`  Fetched ${seaCreatures.length} sea creatures`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  ERROR fetching sea creatures: ${message}`);
  }

  // 4. Write output
  console.log(`\nTotal critters: ${allCritters.length}`);
  console.log(`Writing to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allCritters, null, 2) + "\n", "utf-8");
  console.log("  Done!\n");

  console.log("=== Critter fetch complete ===");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
