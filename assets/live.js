/* Live fallback: if the bundled draw data is more than 3 days old, read the public IRCC rounds file directly in the browser. */
_draws = (async () => {
  const d = await fetch('data/draws.json').then(r => r.json());
  if ((Date.now() - new Date(d.updated).getTime()) / 864e5 < 3) return d;
  const num = v => Number(String(v || '').split(',').join('')) || 0;
  try {
    const c = JSON.parse(localStorage.getItem('ic-live') || 'null');
    if (c && Date.now() - c.t < 216e5) return c.d;
  } catch (e) {}
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 7000);
    const j = await fetch('https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json', { signal: ctl.signal }).then(r => r.json());
    const rounds = j.rounds.map(r => ({ n: num(r.drawNumber), date: r.drawDate, name: String(r.drawName).split('<')[0].split(', 20')[0].trim(), size: num(r.drawSize), crs: num(r.drawCRS) })).filter(r => r.n && r.crs && r.date).sort((a, b) => b.n - a.n).slice(0, 200);
    if (rounds.length < 50 || rounds[0].n < d.rounds[0].n) return d;
    const live = { ...d, updated: new Date().toISOString().slice(0, 10), rounds };
    try { localStorage.setItem('ic-live', JSON.stringify({ t: Date.now(), d: live })); } catch (e) {}
    return live;
  } catch (e) { return d; }
})();
