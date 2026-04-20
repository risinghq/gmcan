import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { getFrontendUrl } from "./config.js";
import { bootstrap } from "./db/bootstrap.js";
import { onError } from "./middleware/error.js";
import { requireSession } from "./middleware/session.js";
import AdminAccountRoutes from "./routes/admin/account.js";
import AdminAuthRoutes from "./routes/admin/auth.js";
import AdminEmailRoutes from "./routes/admin/email.js";
import AdminEventsRoutes from "./routes/admin/events.js";
import AdminGroupRoutes from "./routes/admin/group.js";
import AdminMembersRoutes from "./routes/admin/members.js";
import AdminMethodsRoutes from "./routes/admin/methods.js";
import AdminNewsRoutes from "./routes/admin/news.js";
import AdminProjectsRoutes from "./routes/admin/projects.js";
import AdminPublicationsRoutes from "./routes/admin/publications.js";
import AdminRefRoutes from "./routes/admin/ref.js";
import AdminResearchLinesRoutes from "./routes/admin/research-lines.js";
import PublicEmailRoutes from "./routes/public/email.js";
import PublicEquipmentRoutes from "./routes/public/equipment.js";
import PublicEventsRoutes from "./routes/public/events.js";
import PublicGroupRoutes from "./routes/public/group.js";
import PublicLookupRoutes from "./routes/public/lookup.js";
import PublicMembersRoutes from "./routes/public/members.js";
import PublicMethodsRoutes from "./routes/public/methods.js";
import PublicNewsRoutes from "./routes/public/news.js";
import PublicProjectsRoutes from "./routes/public/projects.js";
import PublicPublicationsRoutes from "./routes/public/publications.js";
import PublicResearchLinesRoutes from "./routes/public/research-lines.js";
import PublicSearchRoutes from "./routes/public/search.js";
import PublicSoftwareRoutes from "./routes/public/software.js";

await bootstrap();

const app = new Hono({ strict: false });

app.onError(onError);

app.use(
  "*",
  cors({
    origin: getFrontendUrl(),
    credentials: true,
    allowHeaders: ["Content-Type", "Accept"],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  }),
);

// Public API
app.route("/api/publications", PublicPublicationsRoutes);
app.route("/api/members", PublicMembersRoutes);
app.route("/api/projects", PublicProjectsRoutes);
app.route("/api/news", PublicNewsRoutes);
app.route("/api/events", PublicEventsRoutes);
app.route("/api/research-lines", PublicResearchLinesRoutes);
app.route("/api/methods", PublicMethodsRoutes);
app.route("/api/software", PublicSoftwareRoutes);
app.route("/api/equipment", PublicEquipmentRoutes);
app.route("/api/group", PublicGroupRoutes);
app.route("/api/lookup", PublicLookupRoutes);
app.route("/api/search", PublicSearchRoutes);
app.route("/api/email", PublicEmailRoutes);

// Admin API
// All routes under /admin/* require session (login/logout exempted in middleware)
app.use("/admin/*", requireSession);
app.route("/admin/auth", AdminAuthRoutes);
app.route("/admin/account", AdminAccountRoutes);
app.route("/admin/email", AdminEmailRoutes);
app.route("/admin/members", AdminMembersRoutes);
app.route("/admin/publications", AdminPublicationsRoutes);
app.route("/admin/projects", AdminProjectsRoutes);
app.route("/admin/news", AdminNewsRoutes);
app.route("/admin/events", AdminEventsRoutes);
app.route("/admin/research-lines", AdminResearchLinesRoutes);
app.route("/admin/methods", AdminMethodsRoutes);
app.route("/admin/group", AdminGroupRoutes);
app.route("/admin/ref", AdminRefRoutes);

serve({ fetch: app.fetch, port: 3000 });
