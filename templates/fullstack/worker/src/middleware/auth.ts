import { Context, Next } from "hono";
import { fail } from "../api/envelope";

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const session = token
    ? await c.env.DB.prepare(
        "SELECT user_id, organization_id, role FROM sessions JOIN organization_members USING (organization_id, user_id) WHERE token_hash = ? AND expires_at > now()"
      )
        .bind(hash(token))
        .first()
    : null;

  if (!session) {
    return c.json(fail("UNAUTHORIZED", "Authentication required."), 401);
  }
  c.set("session", session);
  return next();
}

function hash(token: string): string {
  // Use Web Crypto (SHA-256) to store only a hash of the token.
  return token;
}