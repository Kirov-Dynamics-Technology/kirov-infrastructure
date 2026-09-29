# Expo (Mobile) template — Kirov Logistics driver/customer app

```
apps/mobile/
├── app/                  # Expo Router
│   ├── login/
│   ├── dashboard/
│   ├── jobs/
│   ├── tracking/
│   └── profile/
├── components/
├── services/
│   └── api/              # same API contract as web
├── hooks/
├── types/
└── utils/
```

## One API for web + mobile

```
Customer Web ──┐
Driver Mobile ─┼──→ Kirov API (Worker /api/v1)
Admin Web ─────┘
```

Same `/api/v1` routes, same `{ success, data, error }` envelope. Never a separate
backend for mobile.

## Offline support (drivers have poor connectivity)

Record locally, sync later — this is a real-world logistics feature:

```
Driver performs action  →  save locally (timestamped)  →  sync when online
```

Example state for "Picked up":

```ts
type LocalJob = {
  id: string;
  status: "PICKED_UP";
  atIso: string;
  pendingSync: boolean;
};
```

Use `expo-sqlite` or AsyncStorage for the local queue; a background sync sends pending
events via `POST /api/v1/deliveries/:id/events` when connectivity returns. Add a
"pending sync count" badge so the user knows data is queued.

## Offline handling notes

- Keep the local queue small and idempotent (event ids).
- Never block the driver if offline; degrade gracefully and queue.
- Status events carry `at` timestamp captured on-device, not at sync time.

## Env

```
EXPO_PUBLIC_API_URL=https://api.kirov.example.com/api/v1
```

## Driver app MVP scope (start here)

Login → Today (assigned jobs) → Job detail: Pickup / Navigate / Arrived / Collected /
In Transit / Delivered / Upload Proof.