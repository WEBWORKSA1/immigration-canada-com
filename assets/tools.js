/* Draw tracker, pathway finder, CLB converter, cost calculator, video list, multi-step assessment form */
document.addEventListener("DOMContentLoaded", () => { drawTracker(); pathway(); clbTool(); costTool(); videoList(); stepForm(); });

/* ---------- Express Entry draw tracker ---------- */
async function drawTracker() {
  const root = $("#tracker"); if (!root) return;
  let d; try { d = await getDraws(); } catch { root.innerHTML = "<p>Draw data could not be loaded. Please refresh.</p>"; return; }
  const rounds = d.rounds.map(r => ({ ...r, type: drawType(r.name) }));
  const types = ["All", ...new Set(rounds.map(r => r.type))];
  const sel = $("#t-type"); sel.innerHTML = types.map(t => `<option>${t}</option>`).join("");
  $("#t-updated").textContent = `Source: IRCC rounds of invitations. Last refreshed ${fdate(d.updated)}.`;
  if (rounds[0].date < RULE_CHANGE) $("#t-notice").innerHTML = `<div class="notice"><strong>Rounds are paused.</strong> IRCC changed the CRS on 3 November 2026 and is recalculating every profile in the pool, which it says can take up to two weeks. Cut-offs below were set under the previous rules. This page updates itself when rounds resume.</div>`;
  function chart(list) {
    const pts = list.slice(0, 30).reverse(); if (pts.length < 2) return `<p class="muted">Not enough rounds of this type to chart.</p>`;
    const W = 720, H = 240, p = 36, ys = pts.map(r => r.crs), lo = Math.min(...ys) - 8, hi = Math.max(...ys) + 8;
    const x = i => p + i * (W - 2 * p) / (pts.length - 1), y = v => H - p - (v - lo) / (hi - lo) * (H - 2 * p);
    const line = pts.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.crs).toFixed(1)}`).join(" ");
    const ticks = [lo, (lo + hi) / 2, hi].map(v => `<text x="4" y="${y(v) + 4}" font-size="11" fill="#586174">${Math.round(v)}</text><line x1="${p}" x2="${W - p}" y1="${y(v)}" y2="${y(v)}" stroke="#e4ddd0"/>`).join("");
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="CRS cut-off trend, last ${pts.length} rounds">${ticks}<path d="${line}" fill="none" stroke="#0f5c4d" stroke-width="2.5"/>${pts.map((r, i) => `<circle cx="${x(i)}" cy="${y(r.crs)}" r="4" fill="#e8a23a"><title>#${r.n} · ${r.date} · ${r.name} · CRS ${r.crs}</title></circle>`).join("")}<text x="${p}" y="${H - 8}" font-size="11" fill="#586174">${pts[0].date}</text><text x="${W - p}" y="${H - 8}" font-size="11" fill="#586174" text-anchor="end">${pts.at(-1).date}</text></svg>`;
  }
  function render() {
    const t = sel.value, list = t === "All" ? rounds : rounds.filter(r => r.type === t);
    const crsv = list.map(r => r.crs), inv = list.reduce((a, r) => a + r.size, 0);
    $("#t-stats").innerHTML = [[list.length, "rounds shown"], [fmt(inv), "invitations issued"], [Math.min(...crsv), "lowest cut-off"], [Math.max(...crsv), "highest cut-off"]].map(([v, l]) => `<div class="card"><div class="stat">${v}<small>${l}</small></div></div>`).join("");
    $("#t-chart").innerHTML = t === "All" ? `<p class="muted">Pick a round type above to see its cut-off trend. Mixing types on one chart is misleading because PNP scores include a 600-point nomination.</p>` : chart(list);
    $("#t-body").innerHTML = list.map(r => `<tr><td>#${r.n}</td><td style="white-space:nowrap">${fdate(r.date)}</td><td>${esc(r.name)}</td><td class="num">${fmt(r.size)}</td><td class="num"><strong>${r.crs}</strong></td></tr>`).join("");
  }
  sel.onchange = render; render();
  const mx = Math.max(...d.pool.ranges.map(r => r[1]));
  $("#t-pool").innerHTML = `<p class="updated">Candidates in the pool as of ${fdate(d.pool.asOf)}: <strong>${fmt(d.pool.total)}</strong></p>` + d.pool.ranges.map(([l, c]) => `<div class="kv"><span>${l}</span><b>${fmt(c)}</b></div><div class="bar"><b style="width:${c / mx * 100}%"></b></div>`).join("");
  const chk = $("#t-check");
  chk.addEventListener("submit", e => {
    e.preventDefault(); const s = +$("#t-score").value; if (!s) return;
    const seen = {}; rounds.forEach(r => { (seen[r.type] = seen[r.type] || []).push(r); });
    $("#t-result").innerHTML = `<div class="tablewrap"><table><thead><tr><th>Round type</th><th class="num">Listed rounds you would have cleared</th><th class="num">Latest cut-off</th></tr></thead><tbody>${Object.entries(seen).map(([t, l]) => { const c = l.filter(r => s >= r.crs).length; return `<tr><td>${t}</td><td class="num">${c} of ${l.length}</td><td class="num">${l[0].crs}</td></tr>`; }).join("")}</tbody></table></div><p class="updated">Clearing a cut-off only matters if you were also eligible for that round type (for example, a provincial nomination for PNP rounds or NCLC 7 French for French rounds).</p>`;
  });
  try { const s = localStorage.getItem("ic-crs"); if (s) $("#t-score").value = s; } catch {}
}

/* ---------- Pathway finder ---------- */
function pathway() {
  const f = $("#pf"); if (!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault(); const v = Object.fromEntries(new FormData(f).entries()), n = k => +v[k] || 0, res = [];
    const add = (score, title, why, href, cta) => res.push({ score, title, why, href, cta });
    const skilled = n("fw") >= 1 || n("cw") >= 1, lang7 = n("clb") >= 7;
    if (v.parent === "yes") add(98, "Citizenship by descent", "You told us a parent is or was a Canadian citizen. You may already be a citizen and need proof of citizenship rather than an immigration application.", "citizenship.html", "Read the citizenship guide");
    if (v.family === "spouse") add(95, "Spouse or partner sponsorship", "A Canadian citizen or permanent resident aged 18+ can sponsor a spouse, common-law or conjugal partner. There is no points test and no minimum income in most cases.", "family-sponsorship.html", "Family sponsorship guide");
    if (v.family === "parent") add(60, "Super visa (parents and grandparents)", "The parents and grandparents sponsorship program takes limited intakes by invitation. The super visa lets parents visit for long stays in the meantime.", "family-sponsorship.html", "Family sponsorship guide");
    if (n("cw") >= 1 && lang7) add(92, "Express Entry — Canadian Experience Class", "You have at least one year of skilled Canadian work and CLB 7+. CEC rounds were held roughly every two weeks in 2026, and no settlement funds are required.", "express-entry.html", "Express Entry guide");
    else if (n("cw") >= 1 && n("clb") >= 5) add(70, "Express Entry — Canadian Experience Class (TEER 2–3 jobs)", "CEC accepts CLB 5 for TEER 2 or 3 occupations. Check your occupation's TEER before relying on this.", "express-entry.html", "Express Entry guide");
    if (n("fw") >= 1 && lang7 && n("edu") >= 1) add(n("age") <= 35 ? 85 : 68, "Express Entry — Federal Skilled Worker", "One year of continuous skilled work, CLB 7 and a secondary credential or higher meet the core requirements. You also need 67 points on the selection grid and settlement funds.", "express-entry.html", "Express Entry guide");
    if (v.french === "yes") add(90, "French-language rounds (Express Entry)", "NCLC 7 in French qualifies you for French-language proficiency rounds, which invited the most candidates and had the lowest cut-offs of any regular category in 2026 (382–435).", "draw-tracker.html", "See French round history");
    if (v.trade === "yes" && n("clb") >= 5) add(78, "Federal Skilled Trades / trade-occupation rounds", "Two years in a skilled trade plus a job offer or certificate of qualification can qualify you; trade-occupation rounds had cut-offs of 476–477 in 2026.", "express-entry.html", "Express Entry guide");
    if (v.offer === "atlantic") add(88, "Atlantic Immigration Program", "A job offer from a designated employer in New Brunswick, Nova Scotia, PEI or Newfoundland and Labrador is the key requirement. The 2027 target rises to 6,000 admissions.", "provincial-nominee-programs.html", "Provincial and regional programs");
    if (v.offer === "rural") add(84, "Rural Community Immigration Program", "A job offer from a designated employer in a participating rural community is the entry point. The pilot is becoming a permanent program with 5,500 admissions planned for 2027.", "provincial-nominee-programs.html", "Provincial and regional programs");
    if (v.offer === "other" || skilled) add(v.offer === "other" ? 82 : 66, "Provincial Nominee Program", "Provinces nominate people who meet local labour needs. A nomination through an Express Entry-linked stream adds 600 CRS points. The PNP target rises to 95,000 for 2027.", "provincial-nominee-programs.html", "Compare provinces");
    if (v.goal === "study" || (n("age") <= 30 && n("cw") < 1 && n("edu") <= 4)) add(v.goal === "study" ? 86 : 55, "Study permit → post-graduation work → permanent residence", "Studying at a designated learning institution can lead to a post-graduation work permit and Canadian experience. New study permits are capped (150,000 new student arrivals a year for 2027–2029).", "study-in-canada.html", "Study guide");
    if (v.goal === "work" && n("cw") < 1) add(64, "Employer-supported work permit", "A job offer backed by an LMIA or an LMIA-exempt category gets you working in Canada, which then builds toward the Canadian Experience Class.", "work-in-canada.html", "Work guide");
    if (n("age") >= 18 && n("age") <= 35 && n("cw") < 1) add(50, "International Experience Canada (if your country takes part)", "Citizens of partner countries aged 18–35 (18–30 for some) can get an open work permit through the Working Holiday category.", "work-in-canada.html", "Work guide");
    if (!res.length) add(40, "Build eligibility first", "Based on these answers no program is a clear match yet. The fastest levers are a language test at CLB 7+, one year of skilled work, and an educational credential assessment.", "express-entry.html", "See what programs require");
    res.sort((a, b) => b.score - a.score);
    $("#pf-out").innerHTML = `<h2>Your likely pathways</h2><p class="muted">Ranked by how well your answers fit each program's published requirements. This is a screening tool, not an eligibility decision.</p>` + res.slice(0, 5).map((r, i) => `<div class="card" style="margin-bottom:12px"><span class="pill${i ? " amber" : ""}">${i ? "Also consider" : "Best match"} · fit ${r.score}%</span><h3 style="margin-top:10px">${r.title}</h3><p>${r.why}</p><a href="${r.href}">${r.cta} →</a></div>`).join("") + `<div class="card" style="background:var(--ink);color:#fff"><h3 class="mt0" style="color:#fff">Want a person to check this?</h3><p>Send your profile for a free assessment. If a licensed professional can help, we will connect you.</p><a class="btn amber" href="free-assessment.html?path=${encodeURIComponent(res[0].title)}">Get my free assessment →</a></div>`;
    $("#pf-out").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ---------- CLB converter (IRCC equivalency charts; order: listening, reading, writing, speaking) ---------- */
const CLB_T = {
  ielts: { name: "IELTS General Training", step: .5, min: 0, max: 9, t: { 10: [8.5, 8, 7.5, 7.5], 9: [8, 7, 7, 7], 8: [7.5, 6.5, 6.5, 6.5], 7: [6, 6, 6, 6], 6: [5.5, 5, 5.5, 5.5], 5: [5, 4, 5, 5], 4: [4.5, 3.5, 4, 4] } },
  celpip: { name: "CELPIP-General", step: 1, min: 0, max: 12, t: { 10: [10, 10, 10, 10], 9: [9, 9, 9, 9], 8: [8, 8, 8, 8], 7: [7, 7, 7, 7], 6: [6, 6, 6, 6], 5: [5, 5, 5, 5], 4: [4, 4, 4, 4] } },
  pte: { name: "PTE Core", step: 1, min: 10, max: 90, t: { 10: [89, 88, 90, 89], 9: [82, 78, 88, 84], 8: [71, 69, 79, 76], 7: [60, 60, 69, 68], 6: [50, 51, 60, 59], 5: [39, 42, 51, 51], 4: [28, 33, 41, 42] } }
};
function clbTool() {
  const f = $("#clb"); if (!f) return;
  const test = $("#clb-test"), ins = ["cl", "cr", "cw", "cs"].map(i => $("#" + i));
  function setup() { const T = CLB_T[test.value]; ins.forEach(i => { i.step = T.step; i.min = T.min; i.max = T.max; }); render(); }
  function render() {
    const T = CLB_T[test.value], names = ["Listening", "Reading", "Writing", "Speaking"];
    const lv = ins.map((inp, k) => { const s = parseFloat(inp.value); if (isNaN(s)) return null; for (let c = 10; c >= 4; c--) if (s >= T.t[c][k]) return c; return 0; });
    if (lv.some(x => x === null)) { $("#clb-out").innerHTML = `<p class="muted">Enter all four scores to see your CLB levels.</p>`; return; }
    const lo = Math.min(...lv);
    $("#clb-out").innerHTML = `<span class="eyebrow">${T.name}</span><div class="grid g2">${names.map((nm, k) => `<div><div class="stat">${lv[k] ? (lv[k] == 10 ? "10+" : lv[k]) : "<4"}<small>${nm}</small></div></div>`).join("")}</div>
    <div class="notice info" style="margin-top:16px">Your lowest ability is <strong>CLB ${lo || "below 4"}</strong>. ${lo >= 9 ? "CLB 9+ across the board earns the maximum skill-transferability bonuses." : lo >= 7 ? "You meet the CLB 7 minimum for the Federal Skilled Worker program. CLB 9 in every ability would unlock larger bonuses." : "Federal Skilled Worker needs CLB 7 in all four abilities; Canadian Experience Class needs CLB 7 (TEER 0–1) or CLB 5 (TEER 2–3)."}</div>
    <a class="btn" href="crs-calculator.html">Use these levels in the CRS calculator →</a>`;
  }
  test.onchange = setup; f.addEventListener("input", render); setup();
  $("#clb-table").innerHTML = Object.values(CLB_T).map(T => `<h3>${T.name}</h3><div class="tablewrap"><table><thead><tr><th>CLB</th><th class="num">Listening</th><th class="num">Reading</th><th class="num">Writing</th><th class="num">Speaking</th></tr></thead><tbody>${[10, 9, 8, 7, 6, 5, 4].map(c => `<tr><td>CLB ${c}</td>${T.t[c].map(v => `<td class="num">${v}+</td>`).join("")}</tr>`).join("")}</tbody></table></div>`).join("");
}

/* ---------- Cost & settlement funds calculator (fees in force since 30 April 2026) ---------- */
const FEES = { adult: 990, rprf: 600, child: 270, bio1: 85, bioFam: 170, funds: [0, 15263, 19001, 23360, 28362, 32168, 36280, 40392], extra: 4112 };
function costTool() {
  const f = $("#cost"); if (!f) return;
  function render() {
    const v = Object.fromEntries(new FormData(f).entries()), n = k => Math.max(0, +v[k] || 0);
    const adults = v.partner === "yes" ? 2 : 1, kids = n("kids"), fam = adults + kids;
    const gov = adults * (FEES.adult + FEES.rprf) + kids * FEES.child, bio = fam > 1 ? FEES.bioFam : FEES.bio1;
    const other = adults * (n("lang") + n("eca") + n("police")) + fam * n("medical");
    const funds = v.exempt === "yes" ? 0 : (fam <= 7 ? FEES.funds[fam] : FEES.funds[7] + (fam - 7) * FEES.extra);
    const row = (l, a) => `<div class="kv"><span>${l}</span><b>$${fmt(a)}</b></div>`;
    $("#cost-out").innerHTML = `<span class="eyebrow">Estimated total to budget (CAD)</span><div class="big">$${fmt(gov + bio + other + funds)}</div>
    <h3>Government fees</h3>${row(`Processing fee × ${adults} adult${adults > 1 ? "s" : ""} ($${FEES.adult} each)`, adults * FEES.adult)}${row(`Right of permanent residence fee × ${adults} ($${FEES.rprf} each)`, adults * FEES.rprf)}${kids ? row(`Dependent children × ${kids} ($${FEES.child} each)`, kids * FEES.child) : ""}${row("Biometrics", bio)}
    <h3>Third-party costs (your estimates)</h3>${row("Language tests, credential assessment, police certificates, medical exams", other)}
    <h3>Settlement funds you must show</h3>${v.exempt === "yes" ? `<p class="muted">Exempt: Canadian Experience Class, or authorized to work in Canada with a valid job offer. You still upload a letter explaining the exemption.</p>` : row(`Family of ${fam} (you keep this money — it is not a fee)`, funds)}
    <p class="updated">Fees: IRCC fee list, in force since 30 April 2026. Funds: IRCC table updated 7 July 2025. Confirm both on canada.ca before paying.</p>`;
  }
  f.addEventListener("input", render); render();
}

/* ---------- Video list (official IRCC channel; refreshed by the data workflow) ---------- */
async function videoList() {
  const el = $("#videos"); if (!el) return;
  try {
    const v = await fetch("data/videos.json").then(r => r.json());
    if (!v.items.length) return;
    el.innerHTML = v.items.map(i => `<div class="card"><div class="video"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(i.id)}" title="${esc(i.title)}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><h3 style="font-size:1rem">${esc(i.title)}</h3><p class="updated">${i.date ? fdate(i.date) : ""} · Immigration, Refugees and Citizenship Canada</p></div>`).join("");
  } catch {}
}

/* ---------- Multi-step lead form ---------- */
function stepForm() {
  const f = $("form[data-steps]"); if (!f) return;
  const steps = $$(".step", f), dots = $$(".steps i", f); let i = 0;
  const show = k => { i = k; steps.forEach((s, j) => s.classList.toggle("on", j === k)); dots.forEach((d, j) => d.classList.toggle("on", j <= k)); };
  f.addEventListener("click", e => {
    if (e.target.matches("[data-next]")) { const bad = $$("input,select,textarea", steps[i]).find(x => !x.checkValidity()); if (bad) return bad.reportValidity(); show(i + 1); }
    if (e.target.matches("[data-back]")) show(i - 1);
  });
  f.addEventListener("sent", () => { show(0); f.hidden = true; $("#lead-done").hidden = false; });
  const q = new URLSearchParams(location.search); let s = q.get("crs"); try { s = s || localStorage.getItem("ic-crs"); } catch {}
  if (s && f.elements.crs_score) f.elements.crs_score.value = s;
  if (q.get("path") && f.elements.message) f.elements.message.value = "Pathway finder suggested: " + q.get("path");
  show(0);
}
