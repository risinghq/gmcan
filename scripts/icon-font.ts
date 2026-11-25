#!/usr/bin/env bun
// Keep the self-hosted Material Symbols font in step with the icons the web app uses.
//   bun scripts/icon-font.ts          download a subset holding exactly the used icons
//   bun scripts/icon-font.ts --check  fail when a used icon is missing from the subset
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Glob } from "bun";

const root = join(import.meta.dir, "..");
const appDir = join(root, "apps/web/src/app");
const fontFile = join(root, "apps/web/src/fonts/material-symbols.woff2");
const namesFile = join(root, "apps/web/src/fonts/material-symbols.txt");

// Fixed axes give a static font. FILL 1 matches the filled Material Icons the design was drawn with.
const FAMILY = "Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0";
// Google answers woff2 only to a browser it knows supports it.
const BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const ICON_ELEMENT = /<mat-icon\b[^>]*>([\s\S]*?)<\/mat-icon>/g;
const ICON_FIELD = /\bicon: "([a-z0-9_]+)"/g;
const ICON_NAME = /^[a-z0-9_]+$/;
// Bindings whose values come from ICON_FIELD entries.
const FIELD_BINDINGS = new Set(["{{ link.icon }}"]);

function usedIcons(): string[] {
  const names = new Set<string>();
  const unknown: string[] = [];

  for (const file of new Glob("**/*.{html,ts}").scanSync(appDir)) {
    if (file.endsWith(".spec.ts")) continue;
    const source = readFileSync(join(appDir, file), "utf8");

    for (const [, content] of source.matchAll(ICON_ELEMENT)) {
      const text = content.trim();
      if (ICON_NAME.test(text)) names.add(text);
      else if (!FIELD_BINDINGS.has(text)) unknown.push(`${file}: ${text}`);
    }

    for (const [, name] of source.matchAll(ICON_FIELD)) names.add(name);
  }

  if (unknown.length) {
    throw new Error(`mat-icon content the scan cannot resolve to a name:\n${unknown.join("\n")}`);
  }

  return [...names].toSorted();
}

async function download(names: string[]): Promise<void> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${FAMILY}&icon_names=${names.join(",")}&display=block`;
  const css = await (await fetch(cssUrl, { headers: { "User-Agent": BROWSER } })).text();
  const fontUrl = css.match(/src: url\((https:[^)]+)\) format\('woff2'\)/)?.[1];
  if (!fontUrl) throw new Error(`no woff2 in the Google Fonts answer:\n${css}`);

  const font = await fetch(fontUrl);
  if (!font.ok) throw new Error(`font download answered ${font.status}`);
  writeFileSync(fontFile, new Uint8Array(await font.arrayBuffer()));
  writeFileSync(namesFile, `${names.join("\n")}\n`);
}

const names = usedIcons();

if (process.argv.includes("--check")) {
  const held = new Set(readFileSync(namesFile, "utf8").split("\n").filter(Boolean));
  const missing = names.filter((name) => !held.has(name));
  if (missing.length) {
    console.error(`Icons missing from the font: ${missing.join(", ")}. Run bun scripts/icon-font.ts.`);
    process.exit(1);
  }
} else {
  await download(names);
  console.log(`${names.length} icons: ${names.join(", ")}`);
}
