import { app } from "./app.js";
import { sweepExpiredSessions } from "./middleware/session.js";
import { sweepExpiredResets } from "./services/password-reset.service.js";

export default {
  fetch: app.fetch,
  async scheduled(_controller, _env, ctx) {
    ctx.waitUntil(Promise.all([sweepExpiredSessions(), sweepExpiredResets()]));
  },
} satisfies ExportedHandler;
