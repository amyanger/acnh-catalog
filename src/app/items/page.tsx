"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import FilterPills from "@/components/FilterPills";
import items from "@/data/items.json";

const CATEGORIES = [
  "All",
  "Fish",
  "Bug",
  "Fossil",
  "Art",
  "Furniture",
  "Clothing",
  "Tool",
  "Material",
  "Other",
];

const ITEMS_PER_PAGE = 100;

/** Map category names to a Tailwind-friendly color token */
function categoryColor(category: string): string {
  const map: Record<string, string> = {
    Fish: "bg-[var(--color-acnh-blue)]/15 text-[var(--color-acnh-blue)]",
    Bug: "bg-[var(--color-acnh-green)]/15 text-[var(--color-acnh-green-dark)]",
    Fossil: "bg-[var(--color-acnh-brown)]/15 text-[var(--color-acnh-brown)]",
    Art: "bg-purple-100 text-purple-700",
    Furniture: "bg-orange-100 text-orange-700",
    Clothing: "bg-pink-100 text-pink-700",
    Tool: "bg-gray-100 text-gray-700",
    Material: "bg-amber-100 text-amber-700",
  };
  return map[category] ?? "bg-gray-100 text-gray-600";
}

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(query);
      const matchesCategory =
        category === "All" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-acnh-green-dark)]">
          Items
        </h1>
        <p className="text-sm text-[#3d3225]/60">
          Browse all items from Animal Crossing: New Horizons
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search items..."
        />
        <span className="shrink-0 text-sm font-medium text-[#3d3225]/50">
          {filtered.length.toLocaleString()} item
          {filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mb-8">
        <FilterPills
          options={CATEGORIES}
          selected={category}
          onSelect={handleCategory}
        />
      </div>

      {/* Items Grid */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-lg text-[#3d3225]/40">No items found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Item sprite */}
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--color-acnh-cream)]">
                  {item.sprite ? (
                    <Image
                      src={item.sprite}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl opacity-30">?</span>
                  )}
                </div>
                <p className="mb-2 text-center text-sm font-medium text-[#3d3225] leading-tight">
                  {item.name}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(item.category)}`}
                >
                  {item.category}
                </span>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() =>
                  setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                }
                className="cursor-pointer rounded-full bg-[var(--color-acnh-green)] px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-acnh-green-dark)]"
              >
                Load More ({(filtered.length - visibleCount).toLocaleString()}{" "}
                remaining)
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
