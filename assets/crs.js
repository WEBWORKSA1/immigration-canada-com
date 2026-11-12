/* CRS calculator — grid as published by IRCC, in force from 3 November 2026 (Labour Market Integration factor). */
const AGE = { 18: [90, 99], 19: [95, 105], 30: [95, 105], 31: [90, 99], 32: [85, 94], 33: [80, 88], 34: [75, 83], 35: [70, 77], 36: [65, 72], 37: [60, 66], 38: [55, 61], 39: [50, 55], 40: [45, 50], 41: [35, 39], 42: [25, 28], 43: [15, 17], 44: [5, 6] };
const EDU = [[0, 0], [28, 30], [84, 90], [91, 98], [112, 120], [119, 128], [126, 135], [140, 150]];
const EDU_SP = [0, 2, 6, 7, 8, 9, 10, 10];
const L1 = c => c >= 10 ? [32, 34] : c == 9 ? [29, 31] : c == 8 ? [22, 23] : c == 7 ? [16, 17] : c == 6 ? [8, 9] : c >= 4 ? [6, 6] : [0, 0];
const L2 = c => c >= 9 ? 6 : c >= 7 ? 3 : c >= 5 ? 1 : 0;
const LSP = c => c >= 9 ? 5 : c >= 7 ? 3 : c >= 5 ? 1 : 0;
const CW = [[0, 0], [35, 40], [46, 53], [56, 64], [63, 72], [70, 80]];
const CW_SP = [0, 5, 7, 8, 9, 10];

function crs(v) {
  const sp = v.marital === "spouse", i = sp ? 0 : 1, n = k => +v[k] || 0;
  const first = [n("l1"), n("l2"), n("l3"), n("l4")], second = [n("s1"), n("s2"), n("s3"), n("s4")];
  const minF = Math.min(...first), cw = Math.min(n("cw"), 5), age = n("age");
  const o = {};
  o.age = age >= 20 && age <= 29 ? (sp ? 100 : 110) : (AGE[age] || [0, 0])[i];
  o.edu = EDU[n("edu")][i];
  o.lang1 = first.reduce((a, c) => a + L1(c)[i], 0);
  o.lang2 = Math.min(second.reduce((a, c) => a + L2(c), 0), sp ? 22 : 24);
  // Labour Market Integration: the higher of (work length + high-wage experience) or a high-wage job offer
  const exp = CW[cw][i] + (cw >= 1 ? n("hw") : 0);
  o.lmi = Math.min(Math.max(exp, n("jo")), sp ? 140 : 150);
  o.lmiVia = n("jo") > exp ? "job offer" : "Canadian experience";
  o.core = o.age + o.edu + o.lang1 + o.lang2 + o.lmi;
  o.spouse = sp ? EDU_SP[n("sEdu")] + [n("p1"), n("p2"), n("p3"), n("p4")].reduce((a, c) => a + LSP(c), 0) + CW_SP[Math.min(n("sCw"), 5)] : 0;
  // Skill transferability
  const e = n("edu"), ec = e >= 5 ? 2 : e >= 2 ? 1 : 0, fw = n("fw");
  const langT = minF >= 9 ? [0, 25, 50] : minF >= 7 ? [0, 13, 25] : [0, 0, 0];
  const cwT = cw >= 2 ? [0, 25, 50] : cw == 1 ? [0, 13, 25] : [0, 0, 0];
  const tEdu = Math.min(50, langT[ec] + cwT[ec]), tFw = Math.min(50, langT[fw] + cwT[fw]);
  const tCert = n("cert") ? (minF >= 7 ? 50 : minF >= 5 ? 25 : 0) : 0;
  o.transfer = Math.min(100, tEdu + tFw + tCert);
  // Additional points
  const fr = v.firstLang === "fr" ? first : second, en = v.firstLang === "fr" ? second : first;
  o.french = Math.min(...fr) >= 7 ? (Math.min(...en) >= 5 ? 50 : 25) : 0;
  o.sibling = n("sib") ? 15 : 0; o.canEdu = [0, 15, 30][n("canEdu")]; o.pnp = n("pnp") ? 600 : 0;
  o.additional = Math.min(600, o.french + o.sibling + o.canEdu + o.pnp);
  o.total = o.core + o.spouse + o.transfer + o.additional;
  o.minFirst = minF;
  return o;
}
if (typeof module !== "undefined") module.exports = { crs };

if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("crs"); if (!form) return;
  const CLB = [[0, "Below CLB 4 / no test"], [4, "CLB 4"], [5, "CLB 5"], [6, "CLB 6"], [7, "CLB 7"], [8, "CLB 8"], [9, "CLB 9"], [10, "CLB 10+"]];
  $$("select[data-clb]", form).forEach(s => { s.innerHTML = CLB.map(([v, t]) => `<option value="${v}">${t}</option>`).join(""); s.value = s.dataset.clb || 0; });
  const EDUS = ["Less than secondary school", "Secondary (high school) diploma", "One-year post-secondary credential", "Two-year post-secondary credential", "Bachelor's degree or 3+ year credential", "Two or more credentials (one 3+ years)", "Master's or professional degree", "Doctoral degree (PhD)"];
  $$("select[data-edu]", form).forEach(s => { s.innerHTML = EDUS.map((t, i) => `<option value="${i}">${t}</option>`).join(""); s.value = s.dataset.edu; });
  const out = document.getElementById("crs-out");
  const vals = () => Object.fromEntries(new FormData(form).entries());
  async function render() {
    const v = vals(), r = crs(v);
    $("#spouse-box").hidden = v.marital !== "spouse";
    const max = v.marital === "spouse" ? [530, 40] : [570, 0];
    const row = (l, p, m) => `<div class="kv"><span>${l}</span><b>${p}${m ? " / " + m : ""}</b></div>${m ? `<div class="bar"><b style="width:${Math.min(100, p / m * 100)}%"></b></div>` : ""}`;
    let cmp = "";
    try {
      const d = await getDraws(), seen = {};
      d.rounds.forEach(x => { const t = drawType(x.name); if (!seen[t]) seen[t] = x; });
      cmp = ["CEC", "French", "Healthcare", "Trades", "Transport", "PNP"].filter(t => seen[t]).map(t => { const x = seen[t], ok = r.total >= x.crs; return `<div class="kv"><span>${t} · ${fdate(x.date)}</span><b style="color:${ok ? "var(--ok)" : "var(--bad)"}">${x.crs} ${ok ? "✓" : "✗"}</b></div>`; }).join("");
      if (d.rounds[0].date < RULE_CHANGE) cmp += `<p class="updated">These cut-offs were set under the pre-3 November rules. Many profiles gained points on 3 November, so the first rounds after the pause may open higher.</p>`;
    } catch {}
    const tips = [];
    if (r.minFirst < 9) tips.push("Reaching CLB 9 in all four abilities unlocks the larger skill-transferability bonuses (up to +50 each for education and foreign experience).");
    if (!r.french) tips.push("French at NCLC 7 in all four abilities adds 25–50 points and qualifies you for French-language rounds, which have had the lowest cut-offs in 2026.");
    if (!r.pnp) tips.push("A provincial nomination adds 600 points. Check the streams in our PNP guide.");
    if (+v.cw < 1) tips.push("One year of skilled Canadian work adds 35–40 points, plus up to 70 more if the occupation is on IRCC's high-wage list.");
    if (+v.age >= 30) tips.push("Age points fall every birthday after 29 — entering the pool sooner preserves points.");
    out.innerHTML = `<span class="eyebrow">Your estimated CRS score</span><div class="big">${r.total}</div>
      <p class="updated">Estimate only. IRCC calculates your official score from your Express Entry profile.</p>
      ${row("Core / human capital", r.core, max[0])}
      <div style="padding-left:12px;border-left:2px solid var(--line);margin-bottom:10px">${row("Age", r.age)}${row("Education", r.edu)}${row("First official language", r.lang1)}${row("Second official language", r.lang2)}${row("Labour market integration (" + r.lmiVia + ")", r.lmi)}</div>
      ${max[1] ? row("Spouse or partner factors", r.spouse, 40) : ""}${row("Skill transferability", r.transfer, 100)}${row("Additional points", r.additional, 600)}
      <h3>Against the latest cut-offs</h3>${cmp || '<p class="muted">Loading…</p>'}
      ${tips.length ? `<h3>Ways to raise your score</h3><ul style="padding-left:1.1em;font-size:.92rem">${tips.slice(0, 4).map(t => `<li>${t}</li>`).join("")}</ul>` : ""}
      <a class="btn" style="width:100%;margin-top:8px" href="free-assessment.html?crs=${r.total}">Get a free profile assessment →</a>`;
    try { localStorage.setItem("ic-crs", r.total); } catch {}
  }
  form.addEventListener("input", render); form.addEventListener("change", render); render();
});
