import { describe, expect, test } from "bun:test";

import { monthYearEs } from "../lib/date-label.js";

describe("monthYearEs", () => {
  test("names the month and year the way the web tables do", () => {
    expect(monthYearEs("2020-06-01")).toBe("Junio 2020");
  });

  test("is empty for an invalid date", () => {
    expect(monthYearEs("not a date")).toBe("");
  });
});
