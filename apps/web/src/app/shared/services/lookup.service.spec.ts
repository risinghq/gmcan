import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import { LookupService } from "./lookup.service";

describe("LookupService.load", () => {
  const original = environment.apiUrl;
  let http: HttpTestingController;
  let lookup: LookupService;

  beforeEach(() => {
    environment.apiUrl = "https://api.example.test";
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    lookup = TestBed.inject(LookupService);
  });

  afterEach(() => {
    environment.apiUrl = original;
    http.verify();
  });

  it("exposes the lookups the API returns", async () => {
    const loaded = lookup.load();
    http
      .expectOne("https://api.example.test/api/lookup")
      .flush({ journals: [{ id: 7, name: "Neuron" }], locales: { supported: ["es", "en"], default: "es" } });
    await loaded;

    expect(lookup.journals()).toEqual([{ id: 7, name: "Neuron" }]);
  });

  it("leaves the lookups empty when the request fails", async () => {
    const loaded = lookup.load();
    http.expectOne("https://api.example.test/api/lookup").flush("down", { status: 503, statusText: "Unavailable" });
    await loaded;

    expect(lookup.journals()).toEqual([]);
  });

  it("leaves the lookups empty when no API URL is configured, as during the build", async () => {
    environment.apiUrl = "";

    await expect(lookup.load()).resolves.toBeUndefined();
    expect(lookup.journals()).toEqual([]);
  });
});
