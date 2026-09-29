# Subscriptions, Quotas & Payments

## Future subscription structure (SaaS-ready)

| | Free (R0) | Business (monthly) | Enterprise (custom) |
| --- | --- | --- | --- |
| Users | 1 | multiple | multiple, advanced permissions |
| Bookings | 10 | more | custom |
| AI requests | 5 | bundled / 500 plan | custom |
| Reports | basic only | advanced analytics | custom |
| Other | — | automation | API, integrations, dedicated support, custom workflows |

Infrastructure cost becomes **tied to customer usage** rather than a flat company-wide
bill.

## Don't start with payments (Logistics MVP)

Manual first:

```
Request quote
  → Kirov reviews
  → Quote sent
  → Customer accepts
  → Manual payment
```

Online later:

```
Customer
  → Online payment
  → Payment gateway
  → Webhook
  → Booking confirmed
```

Keeps the MVP simple and avoids being blocked on payment-gateway integration before
the product works.

## South African payment architecture (when ready)

Payments are another abstraction, never scattered provider code:

```
Kirov
  → PaymentService   (interface)
  → Payment provider
```

The booking system calls `PaymentService`. Swap providers without rebuilding bookings.
Consider SA context (Card providers, PayShap/instant, EFT, perhaps PayFast/Yoco/SaferPay,
later Checkout/Stripe) behind `PAYMENT_PROVIDER`.

## Quotas tie-in

Same quota mechanics apply to money-adjacent features: per-plan limits on bookings,
AI, documents (see `architecture/usage-and-thresholds.md`). A subscription selects a
plan; the plan sets allowances; usage ledger enforces them.

## Never trust the frontend for pricing

- Frontend sends **booking details**, not a price.
- Backend computes the price: base + distance + vehicle class + VAT.
- Frontend only displays the result. Users cannot manipulate price in dev tools.
- Add automated tests around this: `R100 quote + VAT + distance + vehicle = correct
  final amount`.

## Test priorities (money & logistics first)

1. authentication
2. permissions
3. booking creation
4. booking status transitions
5. pricing calculations
6. AI usage limits
7. file permissions
8. payment webhooks

Not 100% coverage — the dangerous parts first.