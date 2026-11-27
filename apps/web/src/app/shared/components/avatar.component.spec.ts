import { describe, expect, it } from "vitest";

import { initials } from "./avatar.component";

describe("initials", () => {
  it("takes the first letters of the first two names", () => {
    expect(initials("Ana Torres Vega")).toBe("AT");
  });

  it("skips an academic prefix", () => {
    expect(initials("Dr. Robert Mikhail Guzman Arellano")).toBe("RM");
    expect(initials("Mg. Denis Murillo")).toBe("DM");
  });

  it("keeps an initial that is part of a two-word name", () => {
    expect(initials("J. Smith")).toBe("JS");
  });
});
