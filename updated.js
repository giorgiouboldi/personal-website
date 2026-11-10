// "Last updated" line under the bio.
// Uses the most recent change among the sources below:
//  - the Are.na feed channel (its updated_at changes whenever a block is added or edited)
//  - optionally, a timestamp published from the spreadsheet (see SHEET_UPDATED_URL)

(function () {
  const ARENA_CHANNEL = 'https://api.are.na/v2/channels/personal-feed-x77zoaxeieq';

  // Google doesn't expose when a published sheet was last edited. To include
  // the spreadsheet, add a tab whose cell A1 holds the last edit time (filled
  // by a small Apps Script onEdit trigger), publish that tab as TSV and paste
  // its link here. Leave empty to use the feed only.
  const SHEET_UPDATED_URL = '';

  async function arenaUpdated() {
    const res = await fetch(ARENA_CHANNEL);
    const data = await res.json();
    return data.updated_at ? new Date(data.updated_at) : null;
  }

  async function sheetUpdated() {
    if (!SHEET_UPDATED_URL) return null;
    const res = await fetch(SHEET_UPDATED_URL);
    const text = (await res.text()).split('\n')[0].trim();
    const d = new Date(text);
    return isNaN(d) ? null : d;
  }

  function format(date) {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  async function show() {
    const results = await Promise.allSettled([arenaUpdated(), sheetUpdated()]);
    const dates = results
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);
    if (!dates.length) return;

    const latest = new Date(Math.max(...dates));
    const bio = document.querySelector('#column1 p');
    if (!bio) return;

    const line = document.createElement('p');
    line.className = 'last-updated';
    line.innerHTML = 'Last updated <time datetime="' + latest.toISOString() + '">' + format(latest) + '</time>';
    bio.after(line);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
