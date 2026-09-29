#!/usr/bin/env node
/* umami-report.mjs — pull the Kirov site's Umami Cloud stats into a growth report.
   Zero-dependency, runs on stock Node 18+ (global fetch).

   ENV:
     UMAMI_API_KEY              required (Umami Cloud -> Settings -> API keys)
     UMAMI_API_CLIENT_ENDPOINT  default https://api.umami.is/v1
     UMAMI_WEBSITE_ID           default the kirov-dynamics website id

   Usage:
     node umami-report.mjs                    # last 30 days
     node umami-report.mjs --days 7           # last 7 days
     node umami-report.mjs --days 30 --top 8  # custom table depth
     node umami-report.mjs --since 2026-09-29 # since a specific date
*/
import fs from 'fs';

const ARGS = process.argv.slice(2);
function flag(name, fallback) {
  const i = ARGS.indexOf('--' + name);
  return i !== -1 && ARGS[i + 1] !== undefined ? ARGS[i + 1] : fallback;
}
const DAYS = parseInt(flag('days', '30'), 10);
const TOP = parseInt(flag('top', '10'), 10);
const SINCE = flag('since', null);

const API_KEY = process.env.UMAMI_API_KEY || '';
const ENDPOINT = (process.env.UMAMI_API_CLIENT_ENDPOINT || 'https://api.umami.is/v1').replace(/\/+$/, '');
const WEBSITE_ID =
  process.env.UMAMI_WEBSITE_ID || '2710875c-7962-4d56-85e0-0d6af2c2e879';

if (!API_KEY) {
  console.error(
    'Missing UMAMI_API_KEY.\nCreate one at cloud.umami.is -> Settings -> API keys.\n' +
      'Then rerun, e.g.: $env:UMAMI_API_KEY="..." ; node umami-report.mjs'
  );
  process.exit(1);
}

const now = Date.now();
const startAt = SINCE
  ? new Date(SINCE + 'T00:00:00').getTime()
  : now - DAYS * 86400000;
const prevStart = startAt - DAYS * 86400000;

async function api(path) {
  const res = await fetch(`${ENDPOINT}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET ${path} -> ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function esc(s) {
  return String(s ?? '').replace(/[|]/g, '\\|');
}

function table(rows) {
  const w = rows[0].map((_, i) => Math.max(...rows.map((r) => (r[i] ?? '').length)));
  return rows
    .map((r) => '  ' + r.map((c, i) => String(c ?? '').padEnd(w[i])).join('  ').trimEnd())
    .join('\n');
}

function pct(cur, prev) {
  if (!prev) return 'new';
  const d = ((cur - prev) / prev) * 100;
  const arrow = d > 0 ? '+' : '';
  return `${arrow}${d.toFixed(1)}%`;
}

async function main() {
  console.log(`\nKirov Dynamics — web growth report`);
  console.log(
    `window: ${SINCE ? `since ${SINCE}` : `last ${DAYS} days`}  |  ${new Date(startAt).toISOString().slice(0, 10)} → ${new Date(now).toISOString().slice(0, 10)}`
  );
  console.log(`website id: ${WEBSITE_ID}\n`);

  /* Overview cards with trend vs previous equal window. */
  const stats = await api(`/websites/${WEBSITE_ID}/stats?startAt=${startAt}&endAt=${now}`);
  const prev = await api(`/websites/${WEBSITE_ID}/stats?startAt=${prevStart}&endAt=${startAt}`);
  const c = stats.comparison || {};
  console.log('Overview (trend vs previous equal window)');
  console.log(table([
    ['metric', 'period', 'previous-per-window', 'trend'],
    ['pageviews', stats.pageviews, c.pageviews ?? '-', pct(stats.pageviews, c.pageviews)],
    ['visitors', stats.visitors, c.visitors ?? '-', pct(stats.visitors, c.visitors)],
    ['visits', stats.visits, c.visits ?? '-', pct(stats.visits, c.visits)],
    ['bounces', stats.bounces, c.bounces ?? '-', pct(stats.bounces, c.bounces)],
    ['avg time/visit (s)', Math.round((stats.totaltime / (stats.visits || 1))), Math.round((c.totaltime ?? 0) / (c.visits ?? 1)), ''],
  ]));
  console.log('\n' + '='.repeat(64));

  /* Top pages — what content is pulling the relevant views. */
  const paths = await api(`/websites/${WEBSITE_ID}/metrics?type=path&startAt=${startAt}&endAt=${now}&limit=${TOP}`);
  console.log('\nTop pages');
  console.log(table([
    ['page', 'pageviews', 'visitors'],
    ...(paths.map((p) => [esc(p.x), p.y, p.visitors ?? ''])),
  ]));

  /* Top referrers — where the traffic money is coming from. */
  const refs = await api(`/websites/${WEBSITE_ID}/metrics?type=referrer&startAt=${startAt}&endAt=${now}&limit=${TOP}`);
  const refRows = refs.length ? refs.map((p) => [esc(p.x), p.y, p.visitors ?? '']) : [['(none)', '-', '-']];
  console.log('\nTop referrers');
  console.log(table([['referrer', 'pageviews', 'visitors'], ...refRows]));

  /* Top countries — are we reaching the SA market? */
  const countries = await api(`/websites/${WEBSITE_ID}/metrics?type=country&startAt=${startAt}&endAt=${now}&limit=${TOP}`);
  console.log('\nTop countries');
  console.log(table([
    ['country', 'pageviews', 'visitors'],
    ...(countries.map((p) => [esc(p.x), p.y, p.visitors ?? ''])),
  ]));

  /* Devices + browsers for context. */
  const devices = await api(`/websites/${WEBSITE_ID}/metrics?type=device&startAt=${startAt}&endAt=${now}&limit=3`);
  const browsers = await api(`/websites/${WEBSITE_ID}/metrics?type=browser&startAt=${startAt}&endAt=${now}&limit=5`);
  console.log('\nDevices');
  console.log(table([['device', 'pageviews', 'visitors'], ...(devices.map((p) => [esc(p.x), p.y, p.visitors ?? '']))]));
  console.log('\nBrowsers');
  console.log(table([['browser', 'pageviews', 'visitors'], ...(browsers.map((p) => [esc(p.x), p.y, p.visitors ?? '']))]));

  /* Funnel: the events that matter (tools used, CTAs, contact). */
  const events = await api(`/websites/${WEBSITE_ID}/metrics?type=event&startAt=${startAt}&endAt=${now}&limit=${TOP}`);
  if (events.length) {
    console.log('\nFunnel events (top)');
    console.log(table([
      ['event', 'count'],
      ...events.map((p) => [esc(p.x), p.y]),
    ]));
    const want = ['tool_used', 'assessment_start', 'assessment_complete', 'cta_click', 'contact_submit'];
    const got = new Map(events.map((p) => [p.x, p.y]));
    const missing = want.filter((e) => !got.has(e));
    if (missing.length) console.log('  (not yet recorded: ' + missing.join(', ') + ')');
  } else {
    console.log('\nNo custom events recorded yet in this window.');
  }

  console.log('\n' + '='.repeat(64));
  console.log('Realtime now:');
  try {
    const rt = await api(`/realtime/${WEBSITE_ID}`);
    console.log('  visitors last 30 min:', rt.visitors ?? 0);
  } catch (e) {
    console.log('  realtime unavailable:', e.message);
  }

  /* Optional: write a JSON snapshot for charting / scheduled growth tracking. */
  const outPath = 'umami-report.json';
  const snapshot = {
    generatedAt: new Date().toISOString(),
    window: { days: DAYS, startAt, endAt: now },
    overview: stats,
    topPages: paths,
    topReferrers: refs,
    topCountries: countries,
    events,
  };
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`\nSnapshot written: ${outPath} (reuse for trend charting).`);
}

main().catch((e) => {
  console.error('\nERROR:', e.message);
  process.exit(1);
});