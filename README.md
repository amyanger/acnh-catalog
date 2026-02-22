# ACNH Catalog

A free, open-source, ad-free item and villager database for Animal Crossing: New Horizons.

## Features

- 10,800+ searchable items with real game images
- 418 villagers with portraits, species, and personality data
- 924 DIY recipe lookups
- Real-time Critter Tracker (fish, bugs, sea creatures available now by hemisphere and time)
- Category filtering and search across all pages
- ACNH-themed responsive design
- Fully static site -- no backend, no database, loads instantly
- Multi-category item browser (Fish, Bug, Fossil, Art, Furniture, Clothing, Tools, and more)

## Tech Stack

- **Next.js 15** -- App Router with static export
- **TypeScript** -- strict mode throughout
- **Tailwind CSS v4** -- CSS-based configuration
- **Static Export** -- deployable to GitHub Pages, Vercel, or Netlify

## Getting Started

```bash
git clone https://github.com/arjunmyanger/acnh-catalog.git
cd acnh-catalog
npm install
npm run dev
```

The development server will start at `http://localhost:3000`.

To build the static site for production:

```bash
npm run build
```

The output will be in the `out/` directory.

## Data Sources

- Item data extracted from [NHSE](https://github.com/kwsch/NHSE) (Animal Crossing: New Horizons Save Editor)
- Additional item data and images from the [Nookipedia API](https://api.nookipedia.com/)
- Villager sprites from NHSE sprite resources

## Contributing

Contributions are welcome. If you find a bug or have a feature request, please open an issue. Pull requests are encouraged -- fork the repository, create a branch for your changes, and submit a PR.

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) (GPL-3.0), consistent with the NHSE project from which item data is derived.
