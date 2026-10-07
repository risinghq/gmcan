import { app } from "./app.js";
import { sweepExpiredSessions } from "./middleware/session.js";

export default {
  fetch: app.fetch,
  async scheduled(_controller, _env, ctx) {
    ctx.waitUntil(sweepExpiredSessions());
  },
} satisfies ExportedHandler;
