import { Hono } from "hono";
import { cors } from "hono/cors";

import { getFrontendUrl, withRequestOrigin } from "./config.js";
import { loadActor } from "./middleware/authz.js";
import { onError, onNotFound } from "./middleware/error.js";
import { publicCache } from "./middleware/public-cache.js";
import { requireRequestLocale } from "./middleware/public-locale.js";
import { requireSession } from "./middleware/session.js";
import AdminAccountRoutes from "./routes/admin/account.js";
import AdminAssetsRoutes from "./routes/admin/assets.js";
import AdminAuthRoutes from "./routes/admin/auth.js";
import AdminDashboardRoutes from "./routes/admin/dashboard.js";
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
import PublicAssetsRoutes from "./routes/public/content/assets.js";
import PublicEquipmentRoutes from "./routes/public/content/equipment.js";
import PublicEventsRoutes from "./routes/public/content/events.js";
import PublicGroupRoutes from "./routes/public/content/group.js";
import PublicHomeRoutes from "./routes/public/content/home.js";
import PublicLookupRoutes from "./routes/public/content/lookup.js";
import PublicMembersRoutes from "./routes/public/content/members.js";
import PublicMethodsRoutes from "./routes/public/content/methods.js";
import PublicNewsRoutes from "./routes/public/content/news.js";
import PublicPlaceholdersRoutes from "./routes/public/content/placeholders.js";
import PublicProjectsRoutes from "./routes/public/content/projects.js";
import PublicPublicationsRoutes from "./routes/public/content/publications.js";
import PublicResearchLinesRoutes from "./routes/public/content/research-lines.js";
import PublicSearchRoutes from "./routes/public/content/search.js";
import PublicSitemapRoutes from "./routes/public/content/sitemap.js";
import PublicSoftwareRoutes from "./routes/public/content/software.js";
import { createEmailRouter } from "./routes/public/operational/email.js";

export const app = new Hono({ strict: false });
const publicContentApi = new Hono({ strict: false });
const adminApi = new Hono({ strict: false });

app.onError(onError);
app.notFound(onNotFound);
app.use("*", (c, next) => withRequestOrigin(c.req.url, next));

app.use(
  "*",
  cors({
    origin: getFrontendUrl(),
    credentials: true,
    allowHeaders: ["Content-Type", "Accept"],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  }),
);

publicContentApi.use("*", requireRequestLocale);
publicContentApi.use("*", publicCache);
publicContentApi.route("/home", PublicHomeRoutes);
publicContentApi.route("/publications", PublicPublicationsRoutes);
publicContentApi.route("/members", PublicMembersRoutes);
publicContentApi.route("/projects", PublicProjectsRoutes);
publicContentApi.route("/news", PublicNewsRoutes);
publicContentApi.route("/events", PublicEventsRoutes);
publicContentApi.route("/research-lines", PublicResearchLinesRoutes);
publicContentApi.route("/methods", PublicMethodsRoutes);
publicContentApi.route("/software", PublicSoftwareRoutes);
publicContentApi.route("/equipment", PublicEquipmentRoutes);
publicContentApi.route("/group", PublicGroupRoutes);
publicContentApi.route("/lookup", PublicLookupRoutes);
publicContentApi.route("/search", PublicSearchRoutes);
publicContentApi.route("/sitemap", PublicSitemapRoutes);
publicContentApi.route("/assets", PublicAssetsRoutes);

// The session middleware exempts only login and logout under /admin/*.
adminApi.use("*", requireRequestLocale);
adminApi.use("*", requireSession);
adminApi.use("*", loadActor);
adminApi.route("/auth", AdminAuthRoutes);
adminApi.route("/account", AdminAccountRoutes);
adminApi.route("/assets", AdminAssetsRoutes);
adminApi.route("/dashboard", AdminDashboardRoutes);
adminApi.route("/email", AdminEmailRoutes);
adminApi.route("/members", AdminMembersRoutes);
adminApi.route("/publications", AdminPublicationsRoutes);
adminApi.route("/projects", AdminProjectsRoutes);
adminApi.route("/news", AdminNewsRoutes);
adminApi.route("/events", AdminEventsRoutes);
adminApi.route("/research-lines", AdminResearchLinesRoutes);
adminApi.route("/methods", AdminMethodsRoutes);
adminApi.route("/group", AdminGroupRoutes);
adminApi.route("/ref", AdminRefRoutes);

app.route("/api/email", createEmailRouter());
app.route("/api", publicContentApi);
app.route("/api/placeholders", PublicPlaceholdersRoutes);
app.route("/admin", adminApi);
