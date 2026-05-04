import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";
import { afterEach, describe, expect, it } from "bun:test";

import { STORAGE_ROOT, deleteUploadedFile, saveUploadedFile, serveAsset } from "../lib/upload.js";

function cleanup() {
  fs.rmSync(STORAGE_ROOT, { recursive: true, force: true });
}

afterEach(cleanup);

describe("asset route", () => {
  it("serves nested keys", async () => {
    const nested = path.join(STORAGE_ROOT, "nested");
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, "x.txt"), "hello", "utf8");

    const app = new Hono();
    app.get("/api/assets/*", (c) => serveAsset(c, { assetKey: c.req.param("*") }));
    const res = await app.request("http://localhost/api/assets/nested/x.txt");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("hello");
  });

  it("rejects traversal and missing keys", async () => {
    const app = new Hono();
    app.get("/api/assets/*", (c) => serveAsset(c, { assetKey: c.req.param("*") }));

    const bad = await app.request("http://localhost/api/assets/../etc/passwd");
    expect(bad.status).toBe(400);

    const missing = await app.request("http://localhost/api/assets/does-not-exist.png");
    expect(missing.status).toBe(404);
  });

  it("supports download headers", async () => {
    fs.mkdirSync(STORAGE_ROOT, { recursive: true });
    fs.writeFileSync(path.join(STORAGE_ROOT, "test.pdf"), "pdf", "utf8");

    const app = new Hono();
    app.get("/api/assets/*", (c) => serveAsset(c, { assetKey: c.req.param("*"), asAttachment: true }));

    const res = await app.request("http://localhost/api/assets/test.pdf");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toContain("attachment");
  });
});

describe("uploads and quarantine", () => {
  it("creates uuidv7-style keys", async () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    const key = await saveUploadedFile(file, { domain: "members", kind: "image" });
    expect(key).toBeTruthy();
    expect(key as string).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[a-f0-9][0-9a-f]{3}-[0-9a-f]{12}\.png$/);
  });

  it("moves unreferenced assets to quarantine", async () => {
    fs.mkdirSync(STORAGE_ROOT, { recursive: true });
    fs.writeFileSync(path.join(STORAGE_ROOT, "orphan.jpg"), "x", "utf8");
    const moved = await deleteUploadedFile({ assetKey: "orphan.jpg" });
    expect(moved).toBe(true);
    expect(fs.existsSync(path.join(STORAGE_ROOT, ".quarantine", "orphan.jpg"))).toBe(true);
  });
});
