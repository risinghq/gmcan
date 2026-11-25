import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Languages } from "@app/shared/models/languages";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import { GroupService } from "./group.service";
import { SessionService } from "./session.service";

describe("GroupService", () => {
  const original = environment.apiUrl;
  const groupUrl = "https://api.example.test/api/group";
  let http: HttpTestingController;
  let group: GroupService;
  let session: SessionService;

  beforeEach(() => {
    environment.apiUrl = "https://api.example.test";
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    group = TestBed.inject(GroupService);
    session = TestBed.inject(SessionService);
  });

  afterEach(() => {
    environment.apiUrl = original;
    http.verify();
  });

  it("serves every caller from one request", () => {
    const answers: unknown[] = [];
    group.getGroup().subscribe((value) => answers.push(value));
    group.getGroup().subscribe((value) => answers.push(value));

    http.expectOne(groupUrl).flush({ id: 1 });
    group.getGroup().subscribe((value) => answers.push(value));

    expect(answers).toEqual([{ id: 1 }, { id: 1 }, { id: 1 }]);
  });

  it("asks again when the language changes", () => {
    group.getGroup().subscribe();
    http.expectOne(groupUrl).flush({ id: 1 });

    session.setLanguage(Languages[1], 1);
    group.getGroup().subscribe();
    http.expectOne(groupUrl).flush({ id: 1 });
  });

  it("asks again after an admin edit", () => {
    group.getGroup().subscribe();
    http.expectOne(groupUrl).flush({ id: 1 });

    group.updateGroup(1, { email: "", phone: "", translations: {} }).subscribe();
    http.expectOne("https://api.example.test/admin/group/1").flush({ status: 200 });

    group.getGroup().subscribe();
    http.expectOne(groupUrl).flush({ id: 1 });
  });
});
