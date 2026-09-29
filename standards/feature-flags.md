# Feature Flags & Kill Switches

## Feature flags

Deploy incomplete functionality disabled. Toggles are per-environment config or
per-organization overrides.

```
FEATURE_AI_ASSISTANT=true
FEATURE_LIVE_TRACKING=false
FEATURE_PAYMENTS=false
FEATURE_DRIVER_APP=true
```

Example: Kirov Logistics ships with Booking/Dispatch/Tracking ON, but AI Assistant and
Payments OFF — without rebuilding the app to enable them later.

- Toggle names: `FEATURE_*`.
- A feature flag controls **visibility/behavior of a feature**, not a cost.
- Flags are read at runtime (env var or config), so no rebuild is needed.

## Kill switches (cost switches)

For every potentially paid external API:

```
AI_ENABLED=false
MAPS_ENABLED=false
SMS_ENABLED=false
```

If a provider starts costing money unexpectedly, flip the switch off. The application
must return gracefully:

> "This feature is temporarily unavailable."

— never crash, never keep incurring cost.

Kill switches and feature flags are checked server-side by the middleware:

```
request
  → feature flag check
  → kill switch check
  → quota check
  → execute
```

## Per-organization overrides

Store overrides in the DB (e.g. `organization_settings` toggles) so a single customer
can be opted in/out without a redeploy. Framework:

```
feature_flags(organization_id?, feature, enabled)
```

- `organization_id = NULL` → global default.
- `organization_id = <id>` → override that org only.

## Enforcement

- Flags/kill switches are honored in the **backend**, never only in the UI.
- UI may hide controls, but the API must still reject disabled operations.
- Every guarded route: feature on? kill switch on? quota ok? → else 503/409 with a
  friendly message.