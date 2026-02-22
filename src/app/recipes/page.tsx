"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import recipes from "@/data/recipes.json";

export default function RecipesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return recipes.filter((r) =>
      r.resultItemName.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-acnh-green-dark)]">
          DIY Recipes
        </h1>
        <p className="text-sm text-[#3d3225]/60">
          All craftable recipes from Animal Crossing: New Horizons
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search recipes..."
        />
        <span className="shrink-0 text-sm font-medium text-[#3d3225]/50">
          {filtered.length.toLocaleString()} recipe
          {filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Recipes Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-lg text-[#3d3225]/40">No recipes found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[80px_1fr] border-b border-[#3d3225]/10 bg-[var(--color-acnh-green)]/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#3d3225]/50 sm:grid-cols-[80px_80px_1fr]">
            <span>Recipe</span>
            <span className="hidden sm:block">Item</span>
            <span>Result</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#3d3225]/5">
            {filtered.map((recipe) => (
              <div
                key={recipe.recipeId}
                className="grid grid-cols-[80px_1fr] items-center px-4 py-3 transition-colors hover:bg-[var(--color-acnh-green)]/5 sm:grid-cols-[80px_80px_1fr]"
              >
                <span className="text-sm font-medium text-[#3d3225]/40">
                  #{recipe.recipeId}
                </span>
                <span className="hidden text-sm text-[#3d3225]/40 sm:block">
                  #{recipe.resultItemId}
                </span>
                <span className="text-sm font-medium text-[#3d3225]">
                  {recipe.resultItemName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
