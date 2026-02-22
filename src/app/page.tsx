import Link from "next/link";
import items from "@/data/items.json";
import villagers from "@/data/villagers.json";
import recipes from "@/data/recipes.json";

const features = [
  {
    title: "Items",
    description: "Browse furniture, clothing, tools, fossils, and more.",
    href: "/items",
    icon: "🎒",
    color: "var(--color-acnh-green)",
  },
  {
    title: "Villagers",
    description: "Discover all villager species, personalities, and portraits.",
    href: "/villagers",
    icon: "🏠",
    color: "var(--color-acnh-blue)",
  },
  {
    title: "Recipes",
    description: "Find every DIY recipe and what it crafts.",
    href: "/recipes",
    icon: "🔨",
    color: "var(--color-acnh-yellow)",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="px-4 pb-12 pt-16 text-center md:pb-20 md:pt-24">
        <h1 className="mb-4 text-5xl font-bold text-[var(--color-acnh-green-dark)] md:text-6xl">
          ACNH Catalog
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#3d3225]/70 md:text-xl">
          Browse {items.length.toLocaleString()}+ items,{" "}
          {villagers.length.toLocaleString()}+ villagers, and DIY recipes from{" "}
          <span className="font-semibold text-[#3d3225]">
            Animal Crossing: New Horizons
          </span>
        </p>
      </section>

      {/* Stats Bar */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--color-acnh-green)] md:text-4xl">
              {items.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm font-medium text-[#3d3225]/60">Items</p>
          </div>
          <div className="border-x border-[#3d3225]/10 text-center">
            <p className="text-3xl font-bold text-[var(--color-acnh-blue)] md:text-4xl">
              {villagers.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm font-medium text-[#3d3225]/60">
              Villagers
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--color-acnh-brown)] md:text-4xl">
              {recipes.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm font-medium text-[#3d3225]/60">
              Recipes
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                {feature.icon}
              </div>
              <h2 className="mb-2 text-xl font-bold text-[#3d3225] group-hover:text-[var(--color-acnh-green-dark)]">
                {feature.title}
              </h2>
              <p className="text-sm text-[#3d3225]/60">{feature.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--color-acnh-green)]">
                Browse
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3d3225]/10 px-4 py-8 text-center text-sm text-[#3d3225]/50">
        <p>
          Data sourced from{" "}
          <span className="font-medium text-[#3d3225]/70">NHSE</span> — Open
          source on GitHub
        </p>
      </footer>
    </main>
  );
}
