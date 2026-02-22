"use client";

import { useState, useMemo, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPills from "@/components/FilterPills";
import critters from "@/data/critters.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthAvailability {
  [month: string]: string;
}

interface Critter {
  name: string;
  type: string;
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

type Hemisphere = "Northern" | "Southern";
type CritterFilter = "All" | "Fish" | "Bugs" | "Sea Creatures";

const CRITTER_FILTERS: CritterFilter[] = [
  "All",
  "Fish",
  "Bugs",
  "Sea Creatures",
];

const MONTH_NAMES = [
  "",
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

// ---------------------------------------------------------------------------
// Time-parsing utilities
// ---------------------------------------------------------------------------

/**
 * Parse an hour string like "4 AM", "9 PM", "11 PM" to a 0-23 hour number.
 */
function parseHour(str: string): number {
  const trimmed = str.trim();
  const match = trimmed.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hour = parseInt(match[1], 10);
  const period = match[2].toUpperCase();
  if (period === "AM" && hour === 12) hour = 0;
  else if (period === "PM" && hour !== 12) hour += 12;
  return hour;
}

/**
 * Check if a given hour (0-23) falls within a single time range like
 * "4 AM \u2013 9 PM" or "9 PM \u2013 4 AM" (wraps around midnight).
 */
function isHourInRange(hour: number, rangeStr: string): boolean {
  // Split on en-dash (U+2013) which the API uses
  const parts = rangeStr.split("\u2013").map((s) => s.trim());
  if (parts.length !== 2) return false;

  const start = parseHour(parts[0]);
  const end = parseHour(parts[1]);
  if (start === -1 || end === -1) return false;

  if (start <= end) {
    // Normal range: e.g., 4 AM (4) to 9 PM (21) -> hour must be in [4, 21)
    return hour >= start && hour < end;
  } else {
    // Wraps midnight: e.g., 9 PM (21) to 4 AM (4) -> hour >= 21 OR hour < 4
    return hour >= start || hour < end;
  }
}

/**
 * Check if a critter is available at the given month and hour based on its
 * time string for that month.
 *
 * Possible values: "NA", "All day", "4 AM \u2013 9 PM", or multi-range with & or ;
 */
function isAvailableNow(
  timeStr: string,
  currentHour: number
): boolean {
  if (timeStr === "NA") return false;
  if (timeStr === "All day") return true;

  // Split multi-range strings on & or ;
  const ranges = timeStr.split(/[&;]/).map((s) => s.trim());
  return ranges.some((range) => isHourInRange(currentHour, range));
}

/**
 * Check if a critter is available in a given month at all (regardless of hour).
 */
function isAvailableInMonth(timeStr: string): boolean {
  return timeStr !== "NA";
}

/**
 * Get the month availability string for a critter based on hemisphere.
 */
function getMonthStr(
  critter: Critter,
  hemisphere: Hemisphere,
  month: number
): string {
  const monthKey = String(month);
  return hemisphere === "Northern"
    ? critter.north[monthKey] ?? "NA"
    : critter.south[monthKey] ?? "NA";
}

// ---------------------------------------------------------------------------
// Filter helper for type pills
// ---------------------------------------------------------------------------

function matchesTypeFilter(critter: Critter, filter: CritterFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Fish") return critter.type === "Fish";
  if (filter === "Bugs") return critter.type === "Bug";
  if (filter === "Sea Creatures") return critter.type === "Sea Creature";
  return true;
}

// ---------------------------------------------------------------------------
// Type badge color
// ---------------------------------------------------------------------------

function typeBadgeColor(type: string): string {
  switch (type) {
    case "Fish":
      return "bg-[var(--color-acnh-blue)]/15 text-[var(--color-acnh-blue)]";
    case "Bug":
      return "bg-[var(--color-acnh-green)]/15 text-[var(--color-acnh-green-dark)]";
    case "Sea Creature":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ---------------------------------------------------------------------------
// Bell icon SVG
// ---------------------------------------------------------------------------

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block h-3.5 w-3.5 text-[var(--color-acnh-yellow)]"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Critter Card
// ---------------------------------------------------------------------------

interface CritterCardProps {
  critter: Critter;
  badge?: "leaving" | "new" | null;
}

function CritterCard({ critter, badge }: CritterCardProps) {
  return (
    <div className="relative flex flex-col items-center rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Status badge */}
      {badge === "leaving" && (
        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
          Leaving soon!
        </span>
      )}
      {badge === "new" && (
        <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
          New!
        </span>
      )}

      {/* Critter image */}
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--color-acnh-cream)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={critter.imageUrl}
          alt={critter.name}
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          loading="lazy"
        />
      </div>

      {/* Name */}
      <p className="mb-1 text-center text-sm font-bold capitalize leading-tight text-[#3d3225]">
        {critter.name}
      </p>

      {/* Type badge */}
      <span
        className={`mb-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColor(critter.type)}`}
      >
        {critter.type}
      </span>

      {/* Location (if present) */}
      {critter.location && (
        <p className="mb-1 text-center text-xs text-[#3d3225]/50">
          {critter.location}
        </p>
      )}

      {/* Sell price */}
      <div className="flex items-center gap-1 text-xs font-medium text-[#3d3225]/70">
        <BellIcon />
        <span>{critter.sellPrice.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------

interface CritterSectionProps {
  title: string;
  count: number;
  items: Critter[];
  badge?: "leaving" | "new" | null;
  emptyMessage: string;
  titleColor?: string;
  borderColor?: string;
}

function CritterSection({
  title,
  count,
  items,
  badge,
  emptyMessage,
  titleColor = "text-[var(--color-acnh-green-dark)]",
  borderColor = "border-[var(--color-acnh-green)]/20",
}: CritterSectionProps) {
  return (
    <section className="mb-10">
      <div
        className={`mb-4 flex items-center gap-3 border-b pb-2 ${borderColor}`}
      >
        <h2 className={`text-xl font-bold ${titleColor}`}>{title}</h2>
        <span className="rounded-full bg-[#3d3225]/10 px-2.5 py-0.5 text-xs font-medium text-[#3d3225]/60">
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white py-8 text-center shadow-sm">
          <p className="text-sm text-[#3d3225]/40">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((critter) => (
            <CritterCard
              key={`${critter.type}-${critter.name}`}
              critter={critter}
              badge={badge}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CrittersPage() {
  const [hemisphere, setHemisphere] = useState<Hemisphere>("Northern");
  const [typeFilter, setTypeFilter] = useState<CritterFilter>("All");
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Auto-update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const currentMonth = currentTime.getMonth() + 1; // 1-12
  const currentHour = currentTime.getHours(); // 0-23
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;

  // Format the current time for display
  const timeDisplay = currentTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  // Type the imported JSON data
  const allCritters = critters as Critter[];

  // Compute all three lists
  const { availableNow, leavingThisMonth, newThisMonth } = useMemo(() => {
    const query = search.toLowerCase();

    const available: Critter[] = [];
    const leaving: Critter[] = [];
    const newOnes: Critter[] = [];

    for (const critter of allCritters) {
      // Apply type filter
      if (!matchesTypeFilter(critter, typeFilter)) continue;

      // Apply search filter
      if (query && !critter.name.toLowerCase().includes(query)) continue;

      const monthStr = getMonthStr(critter, hemisphere, currentMonth);
      const nextMonthStr = getMonthStr(critter, hemisphere, nextMonth);
      const prevMonthStr = getMonthStr(critter, hemisphere, prevMonth);

      const availableThisMonth = isAvailableInMonth(monthStr);
      const availableRightNow = isAvailableNow(monthStr, currentHour);

      if (availableRightNow) {
        available.push(critter);
      }

      // Leaving this month: available this month but NOT next month
      if (availableThisMonth && !isAvailableInMonth(nextMonthStr)) {
        leaving.push(critter);
      }

      // New this month: NOT available last month but available this month
      if (!isAvailableInMonth(prevMonthStr) && availableThisMonth) {
        newOnes.push(critter);
      }
    }

    return {
      availableNow: available,
      leavingThisMonth: leaving,
      newThisMonth: newOnes,
    };
  }, [allCritters, hemisphere, typeFilter, search, currentMonth, currentHour, nextMonth, prevMonth]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-acnh-green-dark)]">
          Critter Tracker
        </h1>
        <p className="text-sm text-[#3d3225]/60">
          See which fish, bugs, and sea creatures are available to catch right
          now
        </p>
      </div>

      {/* Time display + Hemisphere toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Current time & month */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <span className="text-xs font-medium text-[#3d3225]/50">
              Current Time
            </span>
            <p className="text-lg font-bold text-[var(--color-acnh-green-dark)]">
              {MONTH_NAMES[currentMonth]} &middot; {timeDisplay}
            </p>
          </div>
        </div>

        {/* Hemisphere toggle */}
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          <button
            onClick={() => setHemisphere("Northern")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              hemisphere === "Northern"
                ? "bg-[var(--color-acnh-green)] text-white shadow-sm"
                : "text-[#3d3225]/60 hover:text-[#3d3225]"
            }`}
          >
            Northern
          </button>
          <button
            onClick={() => setHemisphere("Southern")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              hemisphere === "Southern"
                ? "bg-[var(--color-acnh-green)] text-white shadow-sm"
                : "text-[#3d3225]/60 hover:text-[#3d3225]"
            }`}
          >
            Southern
          </button>
        </div>
      </div>

      {/* Search + Type filter + Count */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search critters..."
        />
        <span className="shrink-0 text-sm font-medium text-[#3d3225]/50">
          {availableNow.length} available now
        </span>
      </div>

      <div className="mb-8">
        <FilterPills
          options={CRITTER_FILTERS}
          selected={typeFilter}
          onSelect={(val) => setTypeFilter(val as CritterFilter)}
        />
      </div>

      {/* Available Now section */}
      <CritterSection
        title="Available Now"
        count={availableNow.length}
        items={availableNow}
        emptyMessage="No critters available at this time."
      />

      {/* Leaving This Month section */}
      <CritterSection
        title="Leaving This Month"
        count={leavingThisMonth.length}
        items={leavingThisMonth}
        badge="leaving"
        emptyMessage="No critters leaving this month."
        titleColor="text-red-600"
        borderColor="border-red-200"
      />

      {/* New This Month section */}
      <CritterSection
        title="New This Month"
        count={newThisMonth.length}
        items={newThisMonth}
        badge="new"
        emptyMessage="No new critters this month."
        titleColor="text-emerald-600"
        borderColor="border-emerald-200"
      />
    </main>
  );
}
