import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { provideRouter } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { environment } from "../../../environments/environment";
import JoinUsComponent from "./component";

describe("JoinUsComponent", () => {
  const original = environment.apiUrl;
  let http: HttpTestingController;
  let fixture: ComponentFixture<JoinUsComponent>;

  const page = () => fixture.nativeElement as HTMLElement;
  const sendButton = () => page().querySelector<HTMLButtonElement>("button.email-btn") as HTMLButtonElement;
  const alert = () => page().querySelector('[role="alert"]');

  async function fillAndSend() {
    fixture.componentInstance.user.setValue({
      nombre: "Ana Torres",
      razon: "I study neurons",
      correo: "ana@example.test",
      telefono: "999",
    });
    fixture.detectChanges();
    sendButton().click();
    fixture.detectChanges();
  }

  const contactRequest = () => http.expectOne("https://api.example.test/api/email/contact");

  beforeEach(async () => {
    environment.apiUrl = "https://api.example.test";
    await TestBed.configureTestingModule({
      imports: [JoinUsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
      .overrideComponent(JoinUsComponent, {
        remove: { imports: [NewsComponent] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
      })
      .compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(JoinUsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    environment.apiUrl = original;
    TestBed.inject(MatDialog).closeAll();
    http.verify();
  });

  it("sends the application to the contact endpoint and locks the button while it is in flight", async () => {
    await fillAndSend();

    const request = contactRequest();
    expect(request.request.body).toEqual({
      name: "Ana Torres",
      reason: "I study neurons",
      email: "ana@example.test",
      phone: "999",
    });
    expect(sendButton().disabled).toBe(true);
    request.flush({ status: 1 });
  });

  it("shows a message and unlocks the button when the send fails", async () => {
    await fillAndSend();
    expect(alert()).toBeNull();

    contactRequest().flush(
      { ok: false, error: { code: "upstream_failure", status: 503, message: "Email is not configured" } },
      { status: 503, statusText: "Service Unavailable" },
    );
    fixture.detectChanges();

    expect(alert()?.textContent?.trim()).toBe(fixture.componentInstance.language.joinUsText[0].sendFailed);
    expect(alert()?.textContent?.trim()).not.toBe("");
    expect(sendButton().disabled).toBe(false);
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
  });

  it("clears the message on the next attempt and opens the confirmation when it succeeds", async () => {
    await fillAndSend();
    contactRequest().flush({}, { status: 502, statusText: "Bad Gateway" });
    fixture.detectChanges();
    expect(alert()).not.toBeNull();

    sendButton().click();
    fixture.detectChanges();
    expect(alert()).toBeNull();
    contactRequest().flush({ status: 1 });
    fixture.detectChanges();

    expect(alert()).toBeNull();
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(1);
  });
});
