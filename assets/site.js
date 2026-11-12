/* immigration-canada.com — shared site script (header, footer, forms, widgets) */
const CONFIG = {
  adClient: "ca-pub-6620975821265271",
  // Add AdSense ad-unit slot IDs here to switch on fixed placements (Auto ads work without them).
  adSlots: { top: "", mid: "", bottom: "" },
  // Add your payment links to switch on one-click donation buttons on support.html.
  donate: { paypal: "", stripe: "", buymeacoffee: "" },
  contactUrl: "https://web.works/contact",
  k: "bW9jLmxpYW1nQDFhc2tyb3diZXc=" // form inbox, stored encoded — never rendered on a page
};
document.head.appendChild(Object.assign(document.createElement("script"), { src: "assets/links.js" })); // override stylesheet + official-link corrections
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => Number(n).toLocaleString("en-CA");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fdate = d => new Date(d + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

const NAV = [
  ["Tools", [["CRS Calculator", "crs-calculator.html"], ["Express Entry Draw Tracker", "draw-tracker.html"], ["Pathway Finder Quiz", "pathway-finder.html"], ["CLB Language Converter", "clb-converter.html"], ["Cost & Funds Calculator", "cost-calculator.html"]]],
  ["Immigrate", [["Express Entry", "express-entry.html"], ["Provincial Nominee Programs", "provincial-nominee-programs.html"], ["Family Sponsorship", "family-sponsorship.html"], ["Immigration Levels Plan", "levels-plan.html"], ["Citizenship", "citizenship.html"]]],
  ["Study & Work", [["Study in Canada", "study-in-canada.html"], ["Work in Canada", "work-in-canada.html"], ["Settling in Canada", "settling-in-canada.html"]]],
  ["Updates", [["Key Changes & News", "updates.html"], ["Video Library", "videos.html"], ["Avoid Fraud", "avoid-fraud.html"], ["FAQ & Glossary", "faq.html"]]]
];
const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#0f5c4d"/><path d="M20 5l4.2 10.8L35 20l-10.8 4.2L20 35l-4.2-10.8L5 20l10.8-4.2z" fill="#faf7f1"/><circle cx="20" cy="20" r="3.2" fill="#e8a23a"/></svg>`;

function header() {
  const here = location.pathname.split("/").pop() || "index.html";
  const items = NAV.map(([t, links]) => `<li><button aria-haspopup="true">${t} ▾</button><div class="sub">${links.map(([n, h]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ""}>${n}</a>`).join("")}</div></li>`).join("");
  $("#site-header").innerHTML = `<div class="notgov">Independent information site — <strong>not</strong> affiliated with the Government of Canada or IRCC. Official source: <a href="https://www.canada.ca/en/immigration-refugees-citizenship.html" rel="noopener">canada.ca</a></div>
  <header class="site"><div class="wrap nav"><a class="brand" href="index.html">${LOGO}<span>immigration-canada.com<small>Independent guide · tools · news</small></span></a>
  <button class="burger" aria-label="Menu" aria-expanded="false">☰</button><ul>${items}<li><a class="btn sm" href="free-assessment.html">Free assessment</a></li></ul></div></header>`;
  const b = $(".burger"), ul = $(".nav ul");
  b.onclick = () => { const o = ul.classList.toggle("open"); b.setAttribute("aria-expanded", o); };
}
function footer() {
  const col = (t, l) => `<div><h4>${t}</h4><ul>${l.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join("")}</ul></div>`;
  $("#site-footer").innerHTML = `<footer class="site"><div class="wrap"><div class="fgrid">
  <div><a class="brand" href="index.html" style="color:#fff">${LOGO}<span>immigration-canada.com</span></a><p style="margin-top:12px">Free, independent tools and plain-language guides for people planning a move to Canada. We are a publisher, not a government body, law firm or immigration consultancy.</p>
  <form data-form="Newsletter" class="nl"><label for="nl-e" style="color:#fff">Draw alerts &amp; rule changes by email</label><div style="display:flex;gap:8px"><input id="nl-e" type="email" name="email" required placeholder="you@example.com" autocomplete="email"><button class="btn amber sm">Subscribe</button></div><input class="hp" name="_honey" tabindex="-1" autocomplete="off"><label class="check" style="color:#b9c2d3;margin-top:8px"><input type="checkbox" name="consent" value="yes" required> I agree to receive emails and can unsubscribe at any time.</label><div class="form-msg" role="status"></div></form></div>
  ${col("Tools", NAV[0][1])}${col("Guides", [...NAV[1][1], ...NAV[2][1]])}
  ${col("Site", [["About", "about.html"], ["Contact", "contact.html"], ["Free assessment", "free-assessment.html"], ["Support us / Donate", "support.html"], ["Contests", "contests.html"], ["Work with us", "careers.html"], ["Advertise / Sponsor", CONFIG.contactUrl]])}
  ${col("Legal", [["Disclaimer & trademarks", "disclaimer.html"], ["Privacy policy", "privacy.html"], ["Terms of use", "terms.html"], ["Editorial policy", "editorial-policy.html"], ["Sitemap", "sitemap.xml"]])}
  </div><div class="legal"><p>© ${new Date().getFullYear()} immigration-canada.com. All rights reserved. This website is privately owned and is <strong>not affiliated with, endorsed by, or connected to the Government of Canada, Immigration, Refugees and Citizenship Canada (IRCC), or any provincial government</strong>. Information is general in nature and is not legal or immigration advice. Only a lawyer, Quebec notary or a consultant licensed by the College of Immigration and Citizenship Consultants may advise or represent you for a fee. All trademarks and official marks belong to their respective owners and are used only to identify the organisations and programs discussed. <a href="disclaimer.html">Full disclosure</a>.</p>
  <p>Interested in this website, the domain name, sponsorship, advertising or a partnership? <a href="${CONFIG.contactUrl}">Contact us</a>.</p></div></div></footer>`;
}

/* ---------- forms: every form posts to one hidden inbox ---------- */
async function sendForm(form) {
  const msg = $(".form-msg", form), btn = $("button[type=submit],button:not([type])", form);
  const data = Object.fromEntries(new FormData(form).entries());
  if (data._honey) return;
  delete data._honey;
  $$("input[type=checkbox][name]", form).forEach(c => { if (!c.checked) data[c.name] = "no"; });
  const kind = form.dataset.form || "Website form";
  Object.assign(data, { _subject: `[immigration-canada.com] ${kind}`, _template: "table", _captcha: "false", form: kind, page: location.pathname });
  if (btn) btn.disabled = true;
  msg.className = "form-msg"; msg.textContent = "Sending…";
  try {
    const to = atob(CONFIG.k).split("").reverse().join("");
    const r = await fetch("https://formsubmit.co/ajax/" + to, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || String(j.success) === "false") throw new Error("send failed");
    msg.className = "form-msg ok"; msg.textContent = form.dataset.ok || "Thank you — we have received your submission.";
    form.reset(); form.dispatchEvent(new CustomEvent("sent"));
  } catch (e) {
    msg.className = "form-msg err";
    msg.innerHTML = `Sorry, that did not go through. Please try again, or reach us through <a href="${CONFIG.contactUrl}">our contact page</a>.`;
  } finally { if (btn) btn.disabled = false; }
}
function forms() {
  $$("form[data-form]").forEach(f => f.addEventListener("submit", e => { e.preventDefault(); if (f.reportValidity()) sendForm(f); }));
}

/* ---------- widgets ---------- */
let _draws;
const getDraws = () => _draws || (_draws = fetch("data/draws.json").then(r => r.json()));
const RULE_CHANGE = "2026-11-03";
function drawType(n) {
  n = n.toLowerCase();
  if (n.includes("provincial")) return "PNP"; if (n.includes("canadian experience")) return "CEC"; if (n.includes("french")) return "French";
  if (n.includes("health")) return "Healthcare"; if (n.includes("trade")) return "Trades"; if (n.includes("transport")) return "Transport";
  if (n.includes("physician")) return "Physicians"; if (n.includes("senior manager")) return "Senior managers"; if (n.includes("stem")) return "STEM";
  if (n.includes("education")) return "Education"; if (n.includes("research")) return "Researchers"; if (n.includes("military")) return "Military"; if (n.includes("no program") || n.includes("general")) return "General";
  return "Other";
}
async function latestDraw() {
  const el = $("[data-latest-draw]"); if (!el) return;
  try {
    const d = await getDraws(), r = d.rounds[0];
    el.innerHTML = `<span class="pill">Latest Express Entry round · #${r.n}</span><h3 class="mt0" style="margin-top:10px">${esc(r.name)}</h3>
    <div class="grid g2" style="margin:12px 0"><div><div class="stat">${r.crs}<small>CRS cut-off</small></div></div><div><div class="stat">${fmt(r.size)}<small>invitations · ${fdate(r.date)}</small></div></div></div>
    ${r.date < RULE_CHANGE ? `<div class="notice">New CRS rules took effect on 3 Nov 2026. IRCC paused rounds while it recalculates every profile; this card updates automatically when rounds resume. <a href="updates.html">What changed</a></div>` : ""}
    <a class="btn sm" href="draw-tracker.html">See all rounds</a> <a class="btn sm ghost" href="crs-calculator.html">Check my score</a>
    <p class="updated" style="margin:10px 0 0">Data: IRCC rounds of invitations · refreshed ${fdate(d.updated)}</p>`;
  } catch { el.innerHTML = `<p>Latest round data is loading slowly. <a href="draw-tracker.html">Open the draw tracker</a>.</p>`; }
}
async function updatesList() {
  const el = $("[data-updates]"); if (!el) return;
  const lim = +el.dataset.updates || 99;
  try {
    const [u, n] = await Promise.all([fetch("data/updates.json").then(r => r.json()), fetch("data/news.json").then(r => r.json()).catch(() => ({ items: [] }))]);
    el.innerHTML = u.items.slice(0, lim).map(i => `<article class="card"><span class="pill amber">${fdate(i.date)}</span><h3 style="margin-top:10px">${esc(i.title)}</h3><p>${esc(i.summary)}</p><a href="${i.url}" rel="noopener">${i.internal ? "Read our guide" : "Official source"} →</a></article>`).join("");
    const nl = $("[data-news]");
    if (nl && n.items && n.items.length) nl.innerHTML = `<h2>Latest official IRCC announcements</h2><p class="muted">Headlines link straight to the Government of Canada newsroom. Refreshed automatically.</p><div class="tablewrap"><table><tbody>${n.items.slice(0, 20).map(i => `<tr><td style="white-space:nowrap">${fdate(i.date)}</td><td><a href="${esc(i.url)}" rel="noopener">${esc(i.title)}</a></td></tr>`).join("")}</tbody></table></div>`;
  } catch { el.innerHTML = `<p>Updates could not be loaded. Please refresh.</p>`; }
}
function ads() {
  $$(".ad[data-slot]").forEach(a => {
    const id = CONFIG.adSlots[a.dataset.slot]; if (!id) return;
    a.innerHTML = `<small>Advertisement</small><ins class="adsbygoogle" style="display:block" data-ad-client="${CONFIG.adClient}" data-ad-slot="${id}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
}
function cookie() {
  let ok; try { ok = localStorage.getItem("ic-cookie"); } catch { ok = 1; }
  if (ok) return;
  const d = document.createElement("div"); d.className = "cookie"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Cookie notice");
  d.innerHTML = `<span>We use cookies for essential features, analytics and advertising (Google AdSense). See our <a href="privacy.html">privacy policy</a>.</span><button class="btn amber sm">OK</button>`;
  document.body.appendChild(d);
  $("button", d).onclick = () => { try { localStorage.setItem("ic-cookie", "1"); } catch {} d.remove(); };
}
function fab() {
  if (/free-assessment|contact|privacy|terms|disclaimer/.test(location.pathname)) return;
  const a = document.createElement("a"); a.className = "btn amber fab"; a.href = "free-assessment.html"; a.textContent = "Free assessment →"; document.body.appendChild(a);
}
document.addEventListener("DOMContentLoaded", () => { header(); footer(); forms(); latestDraw(); updatesList(); ads(); cookie(); fab(); });
