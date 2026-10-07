import { serve } from "@hono/node-server";

import { app } from "./app.js";
import { bootstrap } from "./db/bootstrap.js";

await bootstrap();

serve({ fetch: app.fetch, port: 3000 });
