import { bootstrapApplication } from "@angular/platform-browser";

import AppComponent from "./app/app.component";
import { appConfig } from "./app/app.config";
import { applyRuntimeConfig, type RuntimeConfig } from "./runtime-config";

async function start(): Promise<void> {
  const response = await fetch("/config.json");
  if (!response.ok) throw new Error(`Could not load /config.json: ${response.status}`);
  applyRuntimeConfig((await response.json()) as RuntimeConfig);
  await bootstrapApplication(AppComponent, appConfig);
}

start().catch((err) => console.error(err));
