# Analytics event registry (kirov-dynamics site)

Single source of truth for the custom event names fired into Umami. Keeping names
stable keeps charts comparable.

| Event | Context | Fired when | Payload |
| --- | --- | --- | --- |
| `assessment_start` | Free Tools | Digital Readiness section scrolled into view | `{ tool: "tech-score" }` |
| `assessment_complete` | Free Tools | ROI calculator first real input (yields result instantly) | `{ tool: "roi" }` |
| `tool_used` | Free Tools | ROI calculator first real input | `{ tool: "roi" }` |
| `contact_submit` | All pages | contact/lead form submitted | `{ page }` |
| `cta_click` | All pages | primary CTA clicked | `{ cta, href, page }` |

Umami also reports `pageview` automatically for every page (no custom payload).

## Reference funnel

```
pageview → (Digital Readiness viewed) assessment_start
         → (ROI interacted) tool_used + assessment_complete
         → (CTA) cta_click → (form sent) contact_submit
```

## Rules

- Names are snake_case, grouped by domain, never personal data in payloads.
- Fire after the action succeeds (e.g., on form `submit` handler), not on mount.
- Never block the interaction if tracking fails (try/catch, no await).
- No PII in payloads (no emails, no phone numbers).