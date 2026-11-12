# immigration-canada.com

Independent Canada immigration toolkit: CRS calculator, Express Entry draw tracker, pathway finder, language converter, cost calculator, plain-language guides, a lead-generation assessment funnel, and donation / contest / hiring pages.

**Not affiliated with the Government of Canada or IRCC.**

## How it works

- **Static site** — plain HTML, CSS and JavaScript. No build step. Hosted on GitHub Pages from the `main` branch root.
- **Self-updating data** — `.github/workflows/update-data.yml` runs every 4 hours, executes `scripts/update-data.mjs`, and commits fresh `data/*.json`:
  - `draws.json` — Express Entry rounds and pool distribution (IRCC public JSON)
  - `news.json` — IRCC newsroom headlines
  - `videos.json` — latest videos from the official IRCC YouTube channel
- **Curated updates** — edit `data/updates.json` to add a key change; it appears on the home and updates pages.
- **Shared layout** — header, footer, forms, cookie notice and widgets live in `assets/site.js`. Styling in `assets/site.css`.

## Configuration (`assets/site.js` → `CONFIG`)

| Key | Purpose |
|---|---|
| `adClient` | AdSense publisher ID (Auto ads load on every page) |
| `adSlots` | Optional ad-unit slot IDs for fixed placements (`top`, `mid`, `bottom`) |
| `donate` | PayPal / Stripe / Buy Me a Coffee links — buttons appear on `support.html` once set |
| `contactUrl` | Sponsorship / domain / partnership contact link |

All forms post to a single private inbox through FormSubmit. The address is stored encoded and is never rendered on a page. The first submission triggers a one-time activation email to that inbox.

## Adding a page

Copy any guide page, change the `<title>`, description, canonical URL and `<main>` content, then add it to `NAV` in `assets/site.js` and to `sitemap.xml`.

## Custom domain

In **Settings → Pages**, set the custom domain to `immigration-canada.com` and point DNS at GitHub Pages. `ads.txt` is already at the site root.

See `docs/BUILD-PROMPT.md` for the product rationale and the phase-wise build prompt.
