// Refreshes data/*.json from public official feeds. Runs in GitHub Actions (Node 20+, no dependencies).
// Each source is independent: if one fails, the existing file is left untouched.
// The outcome of each source is recorded in data/refresh-log.json.
import { readFile, writeFile } from "node:fs/promises";

const today = new Date().toISOString().slice(0, 10);
const UA = { "User-Agent": "Mozilla/5.0 (compatible; immigration-canada.com data refresh)", "Accept-Language": "en" };
const get = async (url, as = "text") => { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r[as](); };
const num = v => Number(String(v ?? "").replace(/[^\d]/g, ""));
const clean = s => String(s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
async function save(file, obj, label) {
  let old = ""; try { old = await readFile(file, "utf8"); } catch {}
  const strip = s => s.replace(/"updated":"[^"]*"/, "").trim();
  const next = JSON.stringify(obj);
  if (old && strip(JSON.stringify(JSON.parse(old))) === strip(next)) return console.log(`${label}: no change`);
  await writeFile(file, next + "\n"); console.log(`${label}: updated`);
}

async function draws() {
  const j = await get("https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json", "json");
  const rounds = j.rounds.map(r => ({ n: num(r.drawNumber), date: r.drawDate, name: clean(r.drawName).replace(/,?\s*20\d\d-Version \d+/i, "").replace(/\s*\(Version \d+\)/i, ""), size: num(r.drawSize), crs: num(r.drawCRS) }))
    .filter(r => r.n && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.crs).sort((a, b) => b.n - a.n).slice(0, 200);
  if (rounds.length < 50) throw new Error("draw feed looks incomplete");
  const t = j.rounds.find(r => num(r.drawNumber) === rounds[0].n) || {};
  const labels = { dd1: "601-1200", dd2: "501-600", dd4: "491-500", dd5: "481-490", dd6: "471-480", dd7: "461-470", dd8: "451-460", dd10: "441-450", dd11: "431-440", dd12: "421-430", dd13: "411-420", dd14: "401-410", dd15: "351-400", dd16: "301-350", dd17: "0-300" };
  const old = JSON.parse(await readFile("data/draws.json", "utf8"));
  let pool = old.pool;
  const asOf = new Date(clean(t.drawDistributionAsOn));
  if (num(t.dd18) && !isNaN(asOf)) pool = { asOf: asOf.toISOString().slice(0, 10), total: num(t.dd18), ranges: Object.entries(labels).map(([k, l]) => [l, num(t[k])]) };
  await save("data/draws.json", { updated: today, source: old.source, pool, rounds }, "draws");
}
async function videos() {
  const cfg = JSON.parse(await readFile("data/videos.json", "utf8"));
  const feeds = [`channel_id=${cfg.channel}`, `playlist_id=UU${cfg.channel.slice(2)}`, "user=CitImmCanada"];
  const errors = []; let items = [];
  for (const q of feeds) {
    try {
      const xml = await get(`https://www.youtube.com/feeds/videos.xml?${q}`);
      items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => ({ id: (m[1].match(/<yt:videoId>([^<]+)/) || [])[1], title: clean((m[1].match(/<title>([^<]*)/) || [])[1]), date: ((m[1].match(/<published>([^<]+)/) || [])[1] || "").slice(0, 10) })).filter(v => v.id).slice(0, 12);
      if (items.length) break;
      errors.push(`${q}: no entries`);
    } catch (e) { errors.push(`${q}: ${e.message}`); }
  }
  if (!items.length) throw new Error(errors.join("; "));
  await save("data/videos.json", { updated: today, channel: cfg.channel, items }, "videos");
}
async function news() {
  const xml = await get("https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&pick=30&format=atom&atomtitle=IRCC");
  const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => ({ title: clean((m[1].match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1]), url: (m[1].match(/<link[^>]*href="([^"]+)"/) || [])[1], date: ((m[1].match(/<(?:published|updated)>([^<]+)/) || [])[1] || "").slice(0, 10) }))
    .filter(i => i.title && /^https:\/\/www\.canada\.ca\//.test(i.url || "") && /^\d{4}-\d{2}-\d{2}$/.test(i.date)).slice(0, 25);
  if (!items.length) throw new Error("no news parsed");
  await save("data/news.json", { updated: today, items }, "news");
}
const log = {};
for (const [name, fn] of [["draws", draws], ["videos", videos], ["news", news]]) {
  try { await fn(); log[name] = "ok"; } catch (e) { log[name] = `failed: ${e.message}`; console.log(`${name}: skipped (${e.message})`); }
}
await writeFile("data/refresh-log.json", JSON.stringify(log, null, 1) + "\n");
