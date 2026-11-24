import { FormControl } from "@angular/forms";
import { describe, expect, it } from "vitest";

import { SpaceValidator } from "./spacevalidator";

describe("SpaceValidator.cannotContainSpace", () => {
  it("rejects text that starts with a space", () => {
    const control = new FormControl(" title", SpaceValidator.cannotContainSpace);
    expect(control.valid).toBe(false);
  });

  it("accepts text with inner spaces", () => {
    const control = new FormControl("a title", SpaceValidator.cannotContainSpace);
    expect(control.valid).toBe(true);
  });

  it.each([
    ["a date", new Date(2026, 10, 20)],
    ["a numeric id", 3],
    ["an empty value", null],
  ])("accepts %s without throwing", (_label, value) => {
    const control = new FormControl<unknown>(value, SpaceValidator.cannotContainSpace);
    expect(control.valid).toBe(true);
  });
});
