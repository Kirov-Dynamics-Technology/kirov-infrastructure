// Quota check before an expensive operation (AI) — reads the usage ledger first.
// Store: usage(id, organization_id, feature, count, period)
async function assertAiQuota(db: D1Database, organizationId: string, month: string) {
  const row = await db
    .prepare("SELECT count FROM usage WHERE organization_id = ? AND feature = 'ai' AND period = ?")
    .bind(organizationId, month)
    .first<{ count: number }>();

  const used = row?.count ?? 0;
  const allowance = 500; // from the org's plan

  if (used >= allowance) {
    throw Object.assign(new Error("AI monthly limit reached."), {
      status: 429,
      code: "AI_QUOTA_EXCEEDED",
    });
  }
  if (used >= allowance * 0.8) {
    // warning only — still allow
    console.warn("AI usage at 80%+ for org", organizationId);
  }
}

// Call-site (in the AI route, behind kill-switch + quota middleware):
await assertAiQuota(env.DB, session.organization_id, "2026-09");
const result = await aiService.chat(...);   // provider abstraction
await db
  .prepare(
    `INSERT INTO usage (id, organization_id, feature, count, period)
     VALUES (?, ?, 'ai', 1, ?)
     ON CONFLICT(organization_id, feature, period)
     DO UPDATE SET count = count + 1`
  )
  .bind(crypto.randomUUID(), session.organization_id, "2026-09")
  .run();

// Kill-switch: when AI_ENABLED=false the middleware short-circuits:
if (env.AI_ENABLED === "false") {
  return c.json(fail("FEATURE_DISABLED", "This feature is temporarily unavailable."), 503);
}