"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/items", label: "Items" },
  { href: "/critters", label: "Critters" },
  { href: "/villagers", label: "Villagers" },
  { href: "/recipes", label: "Recipes" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-acnh-green)]/20 bg-[var(--color-acnh-cream)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="leaf">
            🍃
          </span>
          <span className="text-xl font-bold text-[var(--color-acnh-green-dark)]">
            ACNH Catalog
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#3d3225] transition-colors hover:bg-[var(--color-acnh-green)]/10 hover:text-[var(--color-acnh-green-dark)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[#3d3225] transition-colors hover:bg-[var(--color-acnh-green)]/10 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-[var(--color-acnh-green)]/10 px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-[#3d3225] transition-colors hover:bg-[var(--color-acnh-green)]/10"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
