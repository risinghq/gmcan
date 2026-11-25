import { describe, expect, it } from "vitest";

import { emphasisParts } from "./emphasis";

describe("content emphasis", () => {
  it("bolds the phrase between double asterisks", () => {
    expect(emphasisParts("Brindar servicios a los **grupos experimentales** de la UNMSM.")).toEqual([
      { text: "Brindar servicios a los ", strong: false },
      { text: "grupos experimentales", strong: true },
      { text: " de la UNMSM.", strong: false },
    ]);
  });

  it("bolds a phrase at the end of the line", () => {
    expect(emphasisParts("Advice to the **academic and business community**")).toEqual([
      { text: "Advice to the ", strong: false },
      { text: "academic and business community", strong: true },
    ]);
  });

  it("leaves a line without markers as plain text", () => {
    expect(emphasisParts("Plain line.")).toEqual([{ text: "Plain line.", strong: false }]);
  });

  it("keeps an unclosed marker as written", () => {
    expect(emphasisParts("2 ** 3 is eight")).toEqual([{ text: "2 ** 3 is eight", strong: false }]);
  });
});
