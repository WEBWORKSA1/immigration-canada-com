# immigration-canada.com

Independent Canada immigration toolkit: CRS calculator, Express Entry draw tracker, pathway finder, language converter, cost calculator, plain-language guides, a lead-generation assessment funnel, and donation / contest / hiring pages.

**Not affiliated with the Government of Canada or IRCC.**

## Publish (one-time)

1. **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`. The site then serves at `https://webworksa1.github.io/immigration-canada-com/`.
2. **Custom domain**: enter `immigration-canada.com` on the same screen and point DNS at GitHub Pages. `ads.txt` is already at the site root.
3. **Automatic data refresh**: move `docs/update-data.workflow.yml` to `.github/workflows/update-data.yml` (open the file on GitHub, click the pencil, edit the path, commit). Until then the site falls back to reading the IRCC rounds file in the browser when bundled data is more than three days old.
4. **Forms**: submit any form once and click the activation link FormSubmit sends to the site inbox.

## How it works

- **Static site**: plain HTML, CSS and JavaScript in the repository root. No build step.
- **Shared layout**: header, footer, forms, cookie notice and widgets live in `assets/site.js`; styling in `assets/site.css` with overrides in `assets/fixes.css`.
- **Tools**: `assets/crs.js` (CRS grid in force from 3 November 2026), `assets/tools.js` (draw tracker, pathway finder, CLB converter, cost calculator, multi-step lead form), `assets/live.js` (live draw fallback).
- **Data**: `data/draws.json`, `data/news.json`, `data/videos.json` are rewritten by `scripts/update-data.mjs`; `data/updates.json` is curated by hand and feeds the home and updates pages.

## Configuration (`assets/site.js`, `CONFIG`)

| Key | Purpose |
|---|---|
| `adClient` | AdSense publisher ID (Auto ads load on every page) |
| `adSlots` | Optional ad-unit slot IDs for fixed placements (`top`, `mid`, `bottom`) |
| `donate` | PayPal / Stripe / Buy Me a Coffee links; buttons appear on `support.html` once set |
| `contactUrl` | Sponsorship / domain / partnership contact link |

All forms post to one private inbox through FormSubmit. The address is stored encoded and is never rendered on a page.

## Adding a page

Copy any guide page, change the title, description, canonical URL and main content, then add it to `NAV` in `assets/site.js` and to `sitemap.xml`.

See `docs/BUILD-PROMPT.md` for the product rationale and the phase-wise build prompt.
