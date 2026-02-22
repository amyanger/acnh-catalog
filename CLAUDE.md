# ACNH Catalog - Project Guidelines

## Project Overview
An open-source, ad-free web catalog for Animal Crossing: New Horizons. Browse items, villagers, DIY recipes, critter availability, and more. Built with data extracted from the NHSE save editor library and the Nookipedia API.

## Tech Stack
- **Framework:** Next.js 15 (App Router, static export)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (CSS-based config via `@import "tailwindcss"`, NOT tailwind.config.js)
- **Hosting:** Static site — deployable to GitHub Pages, Vercel, or Netlify
- **Data:** Pre-built JSON files in `src/data/`, no runtime database

## Architecture
- `src/app/` — Next.js App Router pages
- `src/components/` — Reusable React components
- `src/data/` — Static JSON data files (items, villagers, recipes, critters)
- `scripts/` — Data extraction and API fetch scripts (run locally, NOT in production)
- `public/sprites/` — Item and villager sprite images

## Key Commands
- `npm run dev` — Start development server
- `npm run build` — Build static site
- `npm run extract` — Extract data from NHSE source files
- `npx tsx scripts/fetch-images.ts` — Fetch images from Nookipedia API (requires .env)

## Development Rules

### Agents
- Use Claude Code agents (Task tool) for complex, multi-step work
- Parallelize independent tasks using multiple agent calls
- Use `precision-implementer` for code implementation
- Use `Explore` for codebase research
- Use `general-purpose` for research and multi-step tasks

### Git & Commits
- NEVER include "Co-Authored-By" or Claude co-contributor lines in commit messages
- NEVER commit the `.env` file or any API keys (Nookipedia key, etc.)
- NEVER include the Nookipedia API key in any committed file — always read from environment variables
- The `.gitignore` must always exclude: `.env`, `.env.local`, `.env.*.local`, `node_modules/`, `.next/`, `out/`

### Code Style
- All interactive pages use `"use client"` directive
- Use Tailwind utility classes directly, not `@apply`
- Use `<img>` or Next.js `<Image unoptimized>` for sprites (static export, no image optimization server)
- External image domains must be added to `next.config.ts` `images.remotePatterns`
- Import data directly: `import items from "@/data/items.json"`
- ACNH theme colors are CSS custom properties in `globals.css` (--color-acnh-green, --color-acnh-cream, etc.)

### Data Pipeline
- NHSE source repo expected at `../NHSE-source/` (sibling directory)
- `scripts/extract-data.ts` reads NHSE binary/text resources and outputs JSON to `src/data/`
- `scripts/fetch-images.ts` enriches items.json with Nookipedia image URLs (requires NOOKIPEDIA_API_KEY in .env)
- Data JSON files ARE committed to the repo (they're the build input)
- Scripts are development tools only — they don't run in production

### Static Export
- `next.config.ts` has `output: "export"` — the site is fully static
- No server-side features (no API routes, no SSR, no ISR)
- All filtering/searching is client-side
- Dynamic routes need `generateStaticParams`
