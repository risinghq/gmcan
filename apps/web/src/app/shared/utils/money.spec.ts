import { describe, expect, it } from "vitest";

import { moneyLabel } from "./money";

const nbsp = " ";

describe("money labels", () => {
  it("formats stored minor units as a Peruvian amount in Spanish", () => {
    expect(moneyLabel(6200000, "pen", "es")).toBe(`S/${nbsp}62,000.00`);
    expect(moneyLabel(150050, "usd", "es")).toBe(`$${nbsp}1,500.50`);
  });

  it("formats the same amount for English readers", () => {
    expect(moneyLabel(6200000, "pen", "en")).toBe(`PEN${nbsp}62,000.00`);
    expect(moneyLabel(150050, "usd", "en")).toBe("$1,500.50");
  });
});
