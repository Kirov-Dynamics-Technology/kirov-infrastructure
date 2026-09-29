# React + Vite + Tailwind (Web template)

Kirov web apps: React 18, Vite, TypeScript, Tailwind.

```
apps/web/
├── src/
│   ├── api/            # client.ts + per-resource modules
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── types/
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## API layer (provider-independent)

UI never calls `fetch()` with the provider URL directly:

```ts
// src/api/client.ts
export const api = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    const body = await res.json();
    return body.data as T;
  },
};
```

```ts
// src/api/bookings.ts
import { api } from "./client";
export const bookings = {
  list: () => api.request("/bookings"),
  create: (dto: unknown) => api.request("/bookings", { method: "POST", body: JSON.stringify(dto) }),
};
```

## Env

Vite uses `VITE_*` prefixes:
```
VITE_API_BASE_URL=http://127.0.0.1:8787/api/v1
```

Public site env is committed; real secrets never are.

## Notes

- Deploys to Cloudflare Pages (output `dist`).
- Use the same API client shape as the mobile app so both hit one backend.