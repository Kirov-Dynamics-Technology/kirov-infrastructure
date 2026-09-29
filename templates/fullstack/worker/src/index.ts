import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { authMiddleware } from "./middleware/auth";
import { rbacMiddleware } from "./middleware/rbac";
import { featureFlagMiddleware } from "./middleware/feature-flag";
import { killSwitchMiddleware } from "./middleware/kill-switch";
import { quotaMiddleware } from "./middleware/quota";
import { errorEnvelope } from "./api/envelope";
import { health } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { bookingsRoutes } from "./routes/bookings";
import { aiRoutes } from "./routes/ai";

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  JOBS: Queue<any>;
  AI_ENABLED: string;
  FEATURE_PAYMENTS: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", secureHeaders());
app.use("*", cors());

// Public
app.route("/health", health);
app.route("/api/v1/auth", authRoutes);

// Guarded
app.use("/api/v1/*", authMiddleware);
app.use("/api/v1/*", rbacMiddleware);
app.use("/api/v1/*", featureFlagMiddleware);
app.use("/api/v1/*", killSwitchMiddleware);
app.use("/api/v1/*", quotaMiddleware);

app.route("/api/v1/bookings", bookingsRoutes);
app.route("/api/v1/ai", aiRoutes);

app.notFound((c) =>
  c.json(errorEnvelope("NOT_FOUND", "Route not found."), 404)
);

app.onError((err, c) => {
  console.error(err);
  return c.json(errorEnvelope("INTERNAL", "Internal server error."), 500);
});

export default app;