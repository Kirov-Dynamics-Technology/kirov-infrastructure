# Umami Growth Report

Zero-dependency Node script that pulls the Kirov site's Umami Cloud stats into a
console growth report. Shows the numbers that answer "are our views relevant and
is the graph moving up?".

- Overview cards with **trend vs the previous equal window** (so you can see
  growth, not just totals).
- Top pages, referrers, countries, devices, browsers.
- **Funnel events** (`tool_used`, `assessment_start`, `assessment_complete`,
  `cta_click`, `contact_submit`) — which of those "not yet recorded" tells you
  the free tools aren't being used.
- Realtime visitors + a JSON snapshot for charting.

## Setup (once)

1. Go to Umami Cloud → Settings → **API keys** → Create a key (read-only fine).
2. Provide it as an environment variable:

   ```powershell
   $env:UMAMI_API_KEY = "your-key-here"
   ```

   (Optional: `$env:UMAMI_WEBSITE_ID` and `$env:UMAMI_API_CLIENT_ENDPOINT`
   already default to the Kirov site / `https://api.umami.is/v1`.)

3. Run:

   ```powershell
   node umami-report.mjs                      # last 30 days
   node umami-report.mjs --days 7             # last 7 days
   node umami-report.mjs --since 2026-09-29   # since a date
   ```

Requires Node 18+ (uses global `fetch`; no npm install).

## Reading the report

- **visitors + pageviews trending up** = more people landing on the site.
- **books vs total views** (referrers): direct/social means the last campaign
  worked; search engines growing = SEO working.
- **countries** dominated by ZA = relevant audience (South African SME/municipal
  buyers), not accidental international traffic.
- **funnel events**: if `tool_used`/`assessment_complete` stay at zero while
  pageviews rise, visitors are reading but not engaging — time to review the
  free-tool placement.

## Scheduled growth tracking

Run it on a timer (e.g. Windows Task Scheduler or a GitHub Actions cron) and
archive `umami-report.json` snapshots to chart the trend over weeks.