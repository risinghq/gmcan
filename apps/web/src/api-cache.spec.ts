import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cachedApiFetch, FRESH_SECONDS, STALE_SECONDS, type ServiceBinding } from "./api-cache";

/** A Cache that keeps entries until their max-age passes, as a colo's cache does. */
class MemoryCache {
  private readonly entries = new Map<string, { response: Response; expiresAt: number }>();

  async match(request: Request): Promise<Response | undefined> {
    const entry = this.entries.get(request.url);
    if (!entry || entry.expiresAt <= Date.now()) return undefined;
    return entry.response.clone();
  }

  async put(request: Request, response: Response): Promise<void> {
    const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get("Cache-Control") ?? "")?.[1] ?? 0);
    this.entries.set(request.url, { response, expiresAt: Date.now() + maxAge * 1000 });
  }

  async delete(request: Request): Promise<boolean> {
    return this.entries.delete(request.url);
  }
}

function setup() {
  let body = "v1";
  let status = 200;
  let calls = 0;
  const api: ServiceBinding = {
    async fetch() {
      calls += 1;
      return new Response(body, { status, headers: { "Cache-Control": "public, max-age=60" } });
    },
  };
  const pending: Promise<unknown>[] = [];
  const ctx = { waitUntil: (work: Promise<unknown>) => void pending.push(work) };
  const cache = new MemoryCache() as unknown as Cache;
  return {
    calls: () => calls,
    publish(next: string) {
      body = next;
    },
    respondWith(next: number) {
      status = next;
    },
    async get(path: string, language = "es") {
      const request = new Request(`https://site.test${path}`, { headers: { "Accept-Language": language } });
      const response = await cachedApiFetch(request, api, cache, ctx);
      await Promise.all(pending.splice(0));
      return { cache: response.headers.get("X-Cache"), text: await response.text(), headers: response.headers };
    },
  };
}

describe("cachedApiFetch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("asks the API once, then answers from the cache with the API's own cache policy", async () => {
    const site = setup();
    expect((await site.get("/api/news")).cache).toBe("MISS");
    const second = await site.get("/api/news");
    expect(second.cache).toBe("HIT");
    expect(second.text).toBe("v1");
    expect(second.headers.get("Cache-Control")).toBe("public, max-age=60");
    expect(second.headers.has("X-Cached-At")).toBe(false);
    expect(site.calls()).toBe(1);
  });

  it("answers from the cache past the fresh period and refreshes it in the background", async () => {
    const site = setup();
    await site.get("/api/news");
    site.publish("v2");
    vi.advanceTimersByTime((FRESH_SECONDS + 1) * 1000);

    const stale = await site.get("/api/news");
    expect(stale).toMatchObject({ cache: "STALE", text: "v1" });
    expect(site.calls()).toBe(2);
    expect(await site.get("/api/news")).toMatchObject({ cache: "HIT", text: "v2" });
    expect(site.calls()).toBe(2);
  });

  it("asks the API again once the stale period is over", async () => {
    const site = setup();
    await site.get("/api/news");
    site.publish("v2");
    vi.advanceTimersByTime((FRESH_SECONDS + STALE_SECONDS + 1) * 1000);
    expect(await site.get("/api/news")).toMatchObject({ cache: "MISS", text: "v2" });
  });

  it("drops an entry whose refresh is no longer shareable", async () => {
    const site = setup();
    await site.get("/api/news/7");
    site.respondWith(404);
    vi.advanceTimersByTime((FRESH_SECONDS + 1) * 1000);
    expect((await site.get("/api/news/7")).cache).toBe("STALE");
    expect(await site.get("/api/news/7")).toMatchObject({ cache: null, text: "v1" });
    expect(site.calls()).toBe(3);
  });

  it("never serves an asset past the fresh period", async () => {
    const site = setup();
    await site.get("/api/assets/3");
    site.respondWith(404);
    vi.advanceTimersByTime((FRESH_SECONDS + 1) * 1000);
    expect((await site.get("/api/assets/3")).cache).toBeNull();
    expect(site.calls()).toBe(2);
  });

  it("keeps one entry per content language", async () => {
    const site = setup();
    await site.get("/api/news", "es");
    expect((await site.get("/api/news", "en")).cache).toBe("MISS");
    expect((await site.get("/api/news", "es")).cache).toBe("HIT");
    expect(site.calls()).toBe(2);
  });

  it("does not cache the email endpoints", async () => {
    const site = setup();
    await site.get("/api/email/contact");
    expect((await site.get("/api/email/contact")).cache).toBeNull();
    expect(site.calls()).toBe(2);
  });
});
