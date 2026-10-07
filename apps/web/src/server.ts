import { join } from "node:path";

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import express from "express";

import { applyServerEnv, currentRuntimeConfig } from "./runtime-config";

const browserDistFolder = join(import.meta.dirname, "../browser");
const SERVER_PORT = 4200;

const app = express();
const angularApp = new AngularNodeAppEngine();

app.get("/config.json", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(currentRuntimeConfig());
});

app.use(
  express.static(browserDistFolder, {
    maxAge: "1y",
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  // The production build has no deployment URLs. Supply API_URL and APP_URL when the server starts.
  applyServerEnv(process.env);
  app.listen(SERVER_PORT, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${SERVER_PORT}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
