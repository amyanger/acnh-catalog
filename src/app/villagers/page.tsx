"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import FilterPills from "@/components/FilterPills";
import villagers from "@/data/villagers.json";

/** Top species for the filter pills, with an "Other" catch-all */
const TOP_SPECIES = [
  "All",
  "Cat",
  "Dog",
  "Rabbit",
  "Squirrel",
  "Bear",
  "Duck",
  "Deer",
  "Wolf",
  "Eagle",
  "Frog",
  "Other",
];

function personalityColor(personality: string): string {
  const map: Record<string, string> = {
    Lazy: "bg-[var(--color-acnh-blue)]/15 text-[var(--color-acnh-blue)]",
    Normal: "bg-pink-100 text-pink-600",
    Peppy: "bg-[var(--color-acnh-yellow)]/25 text-amber-700",
    Jock: "bg-orange-100 text-orange-700",
    Cranky: "bg-red-100 text-red-700",
    Snooty: "bg-purple-100 text-purple-700",
    Smug: "bg-indigo-100 text-indigo-700",
    Sisterly: "bg-teal-100 text-teal-700",
  };
  return map[personality] ?? "bg-gray-100 text-gray-600";
}

export default function VillagersPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("All");

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return villagers.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(query);
      const isTopSpecies = TOP_SPECIES.includes(v.species);
      const matchesSpecies =
        species === "All" ||
        (species === "Other" ? !isTopSpecies : v.species === species);
      return matchesSearch && matchesSpecies;
    });
  }, [search, species]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-acnh-green-dark)]">
          Villagers
        </h1>
        <p className="text-sm text-[#3d3225]/60">
          Discover every villager from Animal Crossing: New Horizons
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search villagers..."
        />
        <span className="shrink-0 text-sm font-medium text-[#3d3225]/50">
          {filtered.length.toLocaleString()} villager
          {filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mb-8">
        <FilterPills
          options={TOP_SPECIES}
          selected={species}
          onSelect={setSpecies}
        />
      </div>

      {/* Villager Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-lg text-[#3d3225]/40">No villagers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((villager) => (
            <div
              key={villager.id}
              className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Villager portrait */}
              <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--color-acnh-cream)]">
                <Image
                  src={`/sprites/villagers/${villager.id}.png`}
                  alt={villager.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                  unoptimized
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                  }}
                />
              </div>
              <p className="mb-2 text-center text-sm font-bold text-[#3d3225]">
                {villager.name}
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                <span className="rounded-full bg-[var(--color-acnh-green)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-acnh-green-dark)]">
                  {villager.species}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${personalityColor(villager.personality)}`}
                >
                  {villager.personality}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
