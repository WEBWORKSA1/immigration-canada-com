# immigration-canada.com: idea and phase-wise build prompt

## 1. The idea

**An independent Canada immigration toolkit**: free interactive tools first, plain-language guides second, a lead-generation assessment funnel behind both.

Positioning: *numbers, not guesswork*. The site answers the three questions every prospective immigrant asks, in this order: What is my score? Would I have been invited? What will it cost and which route fits me?

### Why this model, based on a survey of 37 sites

Sites reviewed: canada.ca (IRCC hub, Express Entry, CRS criteria, proof of funds, categories), ontario.ca OINP, welcomebc.ca, alberta.ca AAIP, saskatchewan.ca SINP, immigratemanitoba.com, liveinnovascotia.com, quebec.ca, jobbank.gc.ca, college-ic.ca, cicnews.com, canadavisa.com, moving2canada.com, immigration.ca, canadim.com, visaplace.com, immigroup.com, justforcanada.com, settler.ca, gofarglobal.com, wildmountainimmigration.com, myvisasource.com, insights.immergity.ca, canadaplatform.ca, immigrationnewscanada.ca, immigration2canada.com, canadaimmigration.news, ircc.com, nextmovepath.com, nova-stage.ca, settlement.org, arrivein.com, prepareforcanada.com, wes.org, celpip.ca, ielts.ca.

Patterns that repeat across the strongest sites:

| Pattern | Seen on | How this site uses it |
|---|---|---|
| CRS calculator as the main traffic and lead magnet | nearly every commercial site | Flagship tool, updated for the 3 Nov 2026 grid |
| Draw tracker with live data | moving2canada, ircc.com, nextmovepath, nova-stage, immigration2canada | Auto-refreshing tracker, trend chart, pool distribution, score checker |
| Eligibility quiz feeding a free-assessment form | canadavisa, canadim, moving2canada, immergity | Pathway finder then three-step assessment form |
| CLB converter, cost and proof-of-funds tools | canadavisa, wildmountain, myvisasource | Both included |
| Explicit non-affiliation and regulator links | ircc.com, immigration2canada | Banner on every page, fraud guide, full disclosure page |
| Newsletter and draw alerts | cicnews, moving2canada, nextmovepath | Footer and updates page |
| Sponsors: banks, test providers, insurers | cicnews, moving2canada | Sponsor slots and contest prize sponsorship |

Gap exploited: law-firm and consultant sites gate their tools behind lead forms; news sites have data but weak tools. A fast, ungated, always-current tool hub with a single optional lead funnel sits between them.

### Revenue stack

1. **Leads** (primary). Free-assessment submissions referred to licensed RCICs and immigration lawyers on a per-lead or flat monthly basis. Consent is captured per submission.
2. **Display ads** (AdSense Auto ads sitewide, optional fixed units).
3. **Sponsorships**: tool sponsorship, newsletter, contest prizes (banks, language tests, credential assessment, insurance, relocation).
4. **Reader contributions**: support page.
5. **Domain and site value**: exact-match domain with working product and traffic history.

Planning model (assumptions to validate, not measured data): revenue per month = sessions x ad RPM / 1000 + leads x share sold x price per lead. Track sessions, tool completion rate, assessment conversion rate and accepted-lead rate from day one; those four numbers decide where to invest.

### Compliance guardrails

- Clear, repeated statement that the site is not a government website; original logo and palette; no official symbols.
- No paid advice. Under section 91 of the Immigration and Refugee Protection Act only lawyers, Quebec notaries and CICC licensees may advise for a fee, so the site publishes information and refers.
- Leads go only to licensed professionals, with explicit consent (PIPEDA, Law 25, CASL).
- AdSense: substantial original content, clear navigation, privacy policy with the required Google cookie disclosure, ads.txt, no ads near buttons, no misleading affiliation.

## 2. Phase-wise build prompt

Use each phase as a standalone prompt. Constraints for all phases: static HTML, CSS and vanilla JavaScript only; no build step; all pages in the repository root so relative links work on GitHub Pages and on the custom domain; shared header, footer, forms and widgets injected by assets/site.js; AdSense script tag (client ca-pub-6620975821265271) in the head of every page; the top bar on every page reads *Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership* and links to https://web.works/contact; all forms deliver to one private inbox whose address is stored encoded in assets/site.js and never appears in any page; cite the official source for every figure and show the date.

### Phase 1: Research and positioning
Survey at least 35 Canada-immigration sites (official, provincial, news, consultant and law-firm, tool sites, settlement, test and credential providers). Record navigation, tools, lead forms, monetisation and trust signals. Verify current facts on canada.ca: CRS grid, latest rounds, categories, fees, proof of funds, levels plan. Output a feature matrix and the positioning statement.

### Phase 2: Design system and layout
Create assets/site.css and assets/site.js. Original identity that cannot be mistaken for a government site: spruce green, ink navy and amber on warm paper; serif display headings; compass-star logo. Components: top contact bar, non-affiliation strip, sticky header with dropdown navigation and mobile menu, hero, cards, stat blocks, tables, forms, accordions, notices, footer with newsletter and legal text, cookie notice, floating assessment button. Responsive to 360 px, keyboard accessible, reduced-motion aware.

### Phase 3: Flagship tools
Build crs-calculator.html (assets/crs.js) implementing the full IRCC grid in force from 3 November 2026: age, education, first and second language, Labour Market Integration factor (work length plus high-wage bonus, or high-wage job offer, whichever is higher, capped at 150 or 140), spouse factors, skill transferability and additional points. Show a live breakdown, comparison with the latest cut-off per round type, and tailored ways to raise the score. Build draw-tracker.html: filter by round type, summary stats, SVG trend chart, pool distribution, and a check of a score against past rounds. Unit-test the scoring function against worked examples.

### Phase 4: Supporting tools
pathway-finder.html (rule-based ranking across Express Entry, French rounds, trades, PNP, Atlantic and rural programs, study, work, IEC, family, citizenship by descent), clb-converter.html (IELTS General, CELPIP-General, PTE Core), cost-calculator.html (fees since 30 April 2026, biometrics, editable third-party costs, settlement funds by family size and exemptions).

### Phase 5: Guides and trust content
Write original guides with review dates and official links: Express Entry, Provincial Nominee Programs (directory with official URLs), family sponsorship, levels plan 2027-2029, citizenship, study, work, settling in, avoiding fraud, FAQ and glossary. Add about, editorial policy, privacy policy (with Google advertising cookie disclosure and opt-out links), terms, and a disclaimer page with non-affiliation, trademark and copyright disclosure.

### Phase 6: Lead generation
Build free-assessment.html: benefit-led hero, four-step explanation, three-step form (goal, profile, contact) with progress bar, required contact consent and optional consent to share with a licensed professional, honeypot spam trap, success state with next actions. Carry the CRS score and pathway result into the form. Add calls to action from every tool result, the header, a floating button, and guide sidebars.

### Phase 7: Monetisation pages
AdSense Auto ads plus optional fixed slots controlled from CONFIG.adSlots; ads.txt. support.html with funding purposes (operations, promotion, hiring, contests and prizes), preset amounts, pledge form, and payment buttons that appear when links are added to CONFIG.donate. contests.html with formats, prize policy, standard rules and a notification form. careers.html with roles and an application form. Sponsor and advertiser calls to action linking to https://web.works/contact.

### Phase 8: Automation
data/draws.json, data/news.json, data/videos.json and curated data/updates.json. scripts/update-data.mjs (no dependencies) pulls the IRCC rounds file, the IRCC newsroom feed and the official IRCC YouTube channel feed, validates, and rewrites the JSON only when it changed. A scheduled GitHub Actions workflow runs it every four hours and commits. assets/live.js reads the IRCC rounds file directly in the browser if bundled data is more than three days old. Notices about the November 2026 pause disappear automatically once a newer round exists.

### Phase 9: SEO, launch and approval
Unique title, description and canonical on every page; sitemap.xml; robots.txt; 404 page; favicon. Publish on GitHub Pages from the main branch root, attach the custom domain, enforce HTTPS, confirm ads.txt resolves at the domain root, then submit the domain in AdSense and to Search Console. Activate the form inbox with one test submission.

### Phase 10: Expansion backlog
Provincial points calculators (Ontario, British Columbia, Alberta, Manitoba, Saskatchewan), occupation and TEER lookup with the high-wage list, PGWP eligibility checker, citizenship day counter and practice test, processing-time tracker, PNP draw tracker, French edition, country-specific landing pages, email draw alerts, verified professional directory, first contest.
