# Analytics event registry (kirov-dynamics site)

Single source of truth for the custom event names fired into Umami. Keeping names
stable keeps charts comparable.

| Event | Context | Fired when | Payload |
| --- | --- | --- | --- |
| `assessment_start` | Free Tools | user opens a tool | `{ tool: "tech-score" \| "roi" }` |
| `assessment_complete` | Free Tools | tool finished | `{ tool, score?, roi? }` |
| `tool_used` | Free Tools | any free tool used | `{ tool }` |
| `contact_submit` | All pages | contact/lead form submitted | `{ page }` |
| `cta_click` | All pages | primary CTA clicked | `{ cta, href, page }` |

Umami also reports `pageview` automatically for every page (no custom payload).

## Rules

- Names are snake_case, grouped by domain, never personal data in payloads.
- Fire after the action succeeds (e.g., on form `submit` handler), not on mount.
- Never block the interaction if tracking fails (try/catch, no await).
- No PII in payloads (no emails, no phone numbers).