/**
 * Fetch real item image URLs from the Nookipedia API and update items.json.
 *
 * For each Nookipedia endpoint, fetches all items, builds a name-to-image-URL
 * map, then matches against our items.json by name (case-insensitive).
 *
 * Usage:  npx tsx scripts/fetch-images.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_KEY_VALUE = process.env.NOOKIPEDIA_API_KEY;
if (!API_KEY_VALUE) {
  console.error("Error: NOOKIPEDIA_API_KEY not set. Add it to .env file.");
  process.exit(1);
}
const API_KEY: string = API_KEY_VALUE;
const BASE_URL = "https://api.nookipedia.com";
const FETCH_TIMEOUT_MS = 60_000; // 60 seconds — clothing endpoint is large
const DELAY_BETWEEN_REQUESTS_MS = 1_000; // 1 second between API calls

const PROJECT_ROOT = "/Users/arjunmyanger/Documents/Dev/acnh-catalog";
const ITEMS_JSON_PATH = path.join(PROJECT_ROOT, "src/data/items.json");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LocalItem {
  id: number;
  name: string;
  category: string;
  sprite: string | null;
}

/** An endpoint definition for Nookipedia. */
interface EndpointConfig {
  /** Human-readable label for logging. */
  label: string;
  /** API path (appended to BASE_URL). */
  path: string;
  /** How to extract the image URL from a single API response object. */
  getImageUrl: (item: Record<string, unknown>) => string | null;
  /** How to extract the item name from a single API response object. */
  getName: (item: Record<string, unknown>) => string;
}

// ---------------------------------------------------------------------------
// Nookipedia endpoint definitions
// ---------------------------------------------------------------------------

/** Extract image_url from root level. */
function rootImageUrl(item: Record<string, unknown>): string | null {
  const url = item["image_url"];
  return typeof url === "string" && url.length > 0 ? url : null;
}

/** Extract image_url from variations[0].image_url. */
function variationImageUrl(item: Record<string, unknown>): string | null {
  const variations = item["variations"];
  if (!Array.isArray(variations) || variations.length === 0) return null;
  const firstVariation = variations[0] as Record<string, unknown>;
  const url = firstVariation["image_url"];
  return typeof url === "string" && url.length > 0 ? url : null;
}

/** Extract the item name from the "name" field at root level. */
function rootName(item: Record<string, unknown>): string {
  return typeof item["name"] === "string" ? item["name"] : "";
}

const ENDPOINTS: EndpointConfig[] = [
  { label: "Fish", path: "/nh/fish", getImageUrl: rootImageUrl, getName: rootName },
  { label: "Bugs", path: "/nh/bugs", getImageUrl: rootImageUrl, getName: rootName },
  { label: "Sea Creatures", path: "/nh/sea", getImageUrl: rootImageUrl, getName: rootName },
  { label: "Fossils", path: "/nh/fossils/all", getImageUrl: rootImageUrl, getName: rootName },
  { label: "Art", path: "/nh/art", getImageUrl: rootImageUrl, getName: rootName },
  { label: "Furniture", path: "/nh/furniture", getImageUrl: variationImageUrl, getName: rootName },
  { label: "Clothing", path: "/nh/clothing", getImageUrl: variationImageUrl, getName: rootName },
  { label: "Tools", path: "/nh/tools", getImageUrl: variationImageUrl, getName: rootName },
  { label: "Interior", path: "/nh/interior", getImageUrl: variationImageUrl, getName: rootName },
  { label: "Photos", path: "/nh/photos", getImageUrl: variationImageUrl, getName: rootName },
  { label: "Gyroids", path: "/nh/gyroids", getImageUrl: variationImageUrl, getName: rootName },
  { label: "Recipes", path: "/nh/recipes", getImageUrl: rootImageUrl, getName: rootName },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a Nookipedia endpoint. Returns the parsed JSON array.
 * Throws on HTTP errors or timeouts.
 */
async function fetchEndpoint(endpointPath: string): Promise<Record<string, unknown>[]> {
  const url = `${BASE_URL}${endpointPath}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": API_KEY,
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

    return data as Record<string, unknown>[];
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Nookipedia Image Fetcher ===\n");

  // 1. Read existing items.json
  console.log(`Reading ${ITEMS_JSON_PATH}...`);
  const rawJson = fs.readFileSync(ITEMS_JSON_PATH, "utf-8");
  const items: LocalItem[] = JSON.parse(rawJson) as LocalItem[];
  console.log(`  Loaded ${items.length} items\n`);

  // 2. Build a global name -> image URL map from all Nookipedia endpoints
  const imageMap = new Map<string, string>();

  for (let i = 0; i < ENDPOINTS.length; i++) {
    const endpoint = ENDPOINTS[i];
    console.log(`[${i + 1}/${ENDPOINTS.length}] Fetching ${endpoint.label} (${endpoint.path})...`);

    try {
      const apiItems = await fetchEndpoint(endpoint.path);
      let mapped = 0;

      for (const apiItem of apiItems) {
        const name = endpoint.getName(apiItem);
        const imageUrl = endpoint.getImageUrl(apiItem);

        if (name && imageUrl) {
          const normalizedName = name.toLowerCase().trim();
          // Only set if not already in the map (first endpoint wins for duplicates)
          if (!imageMap.has(normalizedName)) {
            imageMap.set(normalizedName, imageUrl);
            mapped++;
          }
        }
      }

      console.log(`  Fetched ${apiItems.length} items, ${mapped} new image URLs mapped`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ERROR fetching ${endpoint.label}: ${message}`);
    }

    // Delay between requests (skip delay after the last one)
    if (i < ENDPOINTS.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\nTotal unique image URLs collected: ${imageMap.size}\n`);

  // 3. Match items.json entries against the image map and update sprites
  //
  // Strategy:
  //   a) Exact case-insensitive name match
  //   b) Fallback: strip the parenthetical variant suffix, e.g.
  //      "sailor's shirt (Pink)" -> "sailor's shirt"
  //      This helps with clothing/furniture variants where Nookipedia uses
  //      the base name and our data has per-variant entries.
  let matchCount = 0;
  let matchCountFallback = 0;
  let alreadyHadSprite = 0;
  let noMatch = 0;

  for (const item of items) {
    const normalizedName = item.name.toLowerCase().trim();
    let imageUrl = imageMap.get(normalizedName);

    // Fallback: try stripping parenthetical suffix
    if (!imageUrl) {
      const baseName = normalizedName.replace(/\s*\([^)]*\)\s*$/, "").trim();
      if (baseName !== normalizedName) {
        imageUrl = imageMap.get(baseName);
        if (imageUrl) matchCountFallback++;
      }
    }

    if (imageUrl) {
      item.sprite = imageUrl;
      matchCount++;
    } else {
      // Keep the existing sprite as fallback
      noMatch++;
      if (item.sprite && item.sprite !== "/sprites/items/Leaf.png") {
        alreadyHadSprite++;
      }
    }
  }

  console.log(`Matching results:`);
  console.log(`  Matched with Nookipedia image: ${matchCount} (${matchCount - matchCountFallback} exact, ${matchCountFallback} via base-name fallback)`);
  console.log(`  No match found: ${noMatch}`);
  console.log(`  (of which ${alreadyHadSprite} already had a non-default sprite)\n`);

  // 4. Write updated items.json back
  console.log(`Writing updated ${ITEMS_JSON_PATH}...`);
  fs.writeFileSync(ITEMS_JSON_PATH, JSON.stringify(items, null, 2) + "\n", "utf-8");
  console.log("  Done!\n");

  console.log("=== Image fetch complete ===");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
