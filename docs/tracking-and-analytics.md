# Tracking & Analytics (Umami on the Kirov site)

Goal: accurate, cookieless, privacy-respecting analytics for the Kirov Dynamics website
with no third-party trackers leaking data.

## Chosen: Umami (+Umami Cloud free tier, self-hostable)

- **Recommended:** Umami Cloud Hobby — $0, up to 100k events/mo, 1 website, 6-month
  retention. No cookies, EU-adjacent hosting, simple.
- **Alternative / escape hatch:** self-host Umami on Cloudflare (Workers/R2/D1/Queues)
  or any small VM later; the snippet contract is the same.

## What gets tracked (accurate, minimal)

- Pageviews per page.
- Referrer (browser provides; no cookie).
- Optional named events for things that matter:
  - `assessment_start` / `assessment_complete` (Free Tools)
  - `tool_used` (roi / tech-score)
  - `contact_submit` (contact + lead forms)
  - `cta_click` (primary CTAs)
- Umami hashes visitor fallback; it stores aggregate, event-level data only.

Not tracked: cross-site identity, personally identifying clicks, cookies, fingerprinting.

## Snippet contract (all pages — `<head>`, after the reveal gate)

```html
<script async defer
    src="https://<host-url>/script.js"
    data-website-id="<website-id>"
    data-host-url="https://<host-url>"
    data-domains="your-custom-domain.example"></script>
```

- `data-website-id`: assigned when the website is added to Umami.
- `data-host-url`: where the Umami instance is served (self-host URL, or Umami Cloud URL).
- `data-domains`: restrict the tracker to your own domains (privacy win).

## JS event hook pattern (inline, no dependency)

```js
function trackEvent(name, data){ try {
  if (window.umami && typeof window.umami.track === 'function')
    window.umami.track(name, data);
} catch(e) {} }
```

Bind on real user actions (form submit, tool complete, CTA click). Fails closed —
tracking must never break the site.

## Activation steps (2 minutes)

1. Sign in to Umami Cloud (free) → **Add website** → name it `kirov-dynamics`.
2. Copy the tracker `script.js` URL and the `website-id`.
3. In the kirov-dynamics repo `docs/`:
   - Add the snippet to the `<head>` of all 11 pages with real `data-host-url` and
     `data-website-id`.
   - Add the small `trackEvent` helper + bind events to forms/tools/CTAs.
4. Set `data-domains` to the real custom domain once live.
5. Deploy (git push → Pages), then verify events appear under Sites → kirov-dynamics
   and the "Realtime" view.

## Privacy disclosure (mirror in `privacy.html`)

Update the privacy page to state: free cookieless analytics (Umami) that aggregates
pageview/event data without cookies or personal identifiers; no data sold; no ads;
dashboards are visible to Kirov only.

## References

- `docs/events.md` (event name registry)
- Free limits: `docs/free-tier-limits.md`
- Umami docs: https://umami.is/docs