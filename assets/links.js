/* Loads the override stylesheet and keeps official links current without editing every page. */
(() => {
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/fixes.css'; document.head.appendChild(l);
  const fix = {
    'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/supplementary-immigration-levels-2027-2029.html': 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/immigration-system/levels/supplementary-immigration-levels-2027-2029.html',
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test/equivalency-charts.html': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html',
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/fees.html': 'https://ircc.canada.ca/english/information/fees/fees.asp'
  };
  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('a[href]').forEach(a => { const h = a.getAttribute('href'); if (fix[h]) a.setAttribute('href', fix[h]); }));
})();
