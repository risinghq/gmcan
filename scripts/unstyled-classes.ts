#!/usr/bin/env bun
// Fails when a web template names a class that no built stylesheet defines, which is how a typo or a
// merged class attribute ships unnoticed. Run it after `bun run build:web`.
import { Glob } from "bun";

const web = new URL("../apps/web/", import.meta.url).pathname;
const SELECTOR_CLASS = /\.(-?[a-zA-Z_][\w-]*)/g;
const COMPONENT_STYLES = /styles:\[((?:`[^`]*`|"(?:[^"\\]|\\.)*")(?:,(?:`[^`]*`|"(?:[^"\\]|\\.)*"))*)\]/g;
const TEMPLATE_CLASSES = [/\sclass="([^"{]*)"/g, /\[class\.([\w-]+)\]/g];

async function definedClasses(): Promise<Set<string>> {
  const defined = new Set<string>();
  for await (const file of new Glob("dist/*/browser/**/*.{css,js}").scan(web)) {
    const text = await Bun.file(web + file).text();
    const styles = file.endsWith(".css") ? [text] : [...text.matchAll(COMPONENT_STYLES)].map((m) => m[1]);
    for (const style of styles) for (const m of style.matchAll(SELECTOR_CLASS)) defined.add(m[1]);
  }
  return defined;
}

async function usedClasses(): Promise<Map<string, string>> {
  const used = new Map<string, string>();
  for await (const file of new Glob("src/**/*.{html,ts}").scan(web)) {
    if (file.endsWith(".spec.ts")) continue;
    const text = await Bun.file(web + file).text();
    for (const pattern of TEMPLATE_CLASSES)
      for (const m of text.matchAll(pattern))
        for (const name of m[1].split(/\s+/).filter(Boolean)) used.set(name, file);
  }
  return used;
}

const defined = await definedClasses();
if (defined.size === 0) {
  console.error("no built styles under apps/web/dist; run bun run build:web first");
  process.exit(2);
}

const unstyled = [...(await usedClasses())].filter(([name]) => !defined.has(name));
for (const [name, file] of unstyled) console.error(`${file}: class "${name}" matches no style`);
process.exit(unstyled.length ? 1 : 0);
