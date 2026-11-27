import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { describe, expect, it, vi } from "vitest";

import { AppErrorHandlingService } from "./app-error-handling.service";

function setup() {
  const handleError = vi.fn();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ErrorHandler, useValue: { handleError } }],
  });
  const service = TestBed.inject(AppErrorHandlingService);
  const serialize = (command: ReturnType<typeof service.redirect>) =>
    TestBed.inject(Router).serializeUrl(command.redirectTo);
  return { service, serialize, handleError };
}

describe("AppErrorHandlingService.redirect", () => {
  it("shows the not-found page in place without reporting a missing record", () => {
    const { service, serialize, handleError } = setup();

    const command = service.redirect({ code: "not_found", message: "gone" }, "/detail-member/9999");

    expect(serialize(command)).toBe("/not-found");
    expect(command.navigationBehaviorOptions?.skipLocationChange).toBe(true);
    expect(handleError).not.toHaveBeenCalled();
  });

  it("keeps a missing dashboard record inside the dashboard", () => {
    const { service, serialize } = setup();

    expect(serialize(service.redirect({ code: "not_found", message: "gone" }, "/dashboard/news/9"))).toBe(
      "/dashboard/not-found",
    );
  });

  it("reports any other failure and sends it to the error page", () => {
    const { service, serialize, handleError } = setup();
    const cause = new Error("boom");

    const command = service.redirect({ code: "internal_error", message: "boom", cause }, "/news");

    expect(serialize(command)).toBe("/error?code=internal_error");
    expect(command.navigationBehaviorOptions?.skipLocationChange).toBeFalsy();
    expect(handleError).toHaveBeenCalledWith(cause);
  });
});
