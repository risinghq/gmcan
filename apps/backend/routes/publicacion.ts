import { Hono } from "hono";
import { registerPublicacionCrudRoutes } from "./publicacion/crud.js";
import { registerPublicacionEditViewRoutes } from "./publicacion/edit-view.js";
import { registerPublicacionFileRoutes } from "./publicacion/file.js";
import { registerPublicacionReadRoutes } from "./publicacion/read.js";

const router = new Hono();
registerPublicacionReadRoutes(router);
registerPublicacionEditViewRoutes(router);
registerPublicacionCrudRoutes(router);
registerPublicacionFileRoutes(router);

export default router;
