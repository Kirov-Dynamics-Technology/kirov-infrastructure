# Cloudflare Workers — API standard

## Layout

```
worker/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── organizations.ts
│   │   ├── customers.ts
│   │   ├── bookings.ts
│   │   ├── drivers.ts
│   │   ├── vehicles.ts
│   │   ├── documents.ts
│   │   ├── analytics.ts
│   │   └── ai.ts
│   ├── services/
│   │   ├── BookingService.ts
│   │   ├── NotificationService.ts
│   │   ├── EmailService.ts
│   │   ├── AiService.ts
│   │   └── EventBus.ts
│   ├── middleware/
│   │   ├── auth.ts            # authenticate
│   │   ├── rbac.ts            # authorize org → role → permission
│   │   ├── feature-flag.ts    # FEATURE_* check
│   │   ├── kill-switch.ts     # *_ENABLED check
│   │   └── quota.ts           # usage ledger check / increment
│   ├── repositories/
│   │   ├── BookingRepository.ts   # D1 implementation
│   │   └── (interface, Postgres implementation later)
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── bookings.ts
│   │   ├── drivers.ts
│   │   └── users.ts
│   └── index.ts              # router entry
│
├── wrangler.toml
```

## Standard API versioning

All application routes live under `/api/v1/`:

```
/api/v1/auth
/api/v1/users
/api/v1/organizations
/api/v1/customers
/api/v1/bookings
/api/v1/drivers
/api/v1/vehicles
/api/v1/documents
/api/v1/analytics
/api/v1/ai
```

REST conventions:

```
GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id
```

## Standard response envelope

Success:

```json
{ "success": true, "data": {}, "error": null }
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking could not be found."
  }
}
```

All frontends (web + mobile) share this contract.

## Middleware ordering (every request)

```
auth → rbac → feature-flag → kill-switch → quota → route handler
```

Applied to guarded routes; public routes (health, login) skip to route handler.

## Health endpoints

```
GET /health
GET /health/dependencies
```

## Repository abstraction (the migration lever)

Business logic depends on interfaces (e.g. `IBookingRepository`). `D1BookingRepository`
implements it today; PostgreSQL can be dropped in later without touching the service
layer.

```typescript
class BookingService {
  constructor(private repo: IBookingRepository, private eventBus: EventBus) {}
  async create(dto) {
    const booking = await this.repo.insert(dto);
    await this.eventBus.emit("BookingCreated", { bookingId: booking.id });
    return booking;
  }
}
```

## Event bus (no Kafka needed)

Simple events over Cloudflare Queues (within free limits):

```
BookingCreated
DriverAssigned
DeliveryPickedUp
DeliveryDelivered
ProofUploaded
```

`BookingCreated` fans out to send-confirmation, update-analytics, notify-dispatcher —
decoupled but simple.