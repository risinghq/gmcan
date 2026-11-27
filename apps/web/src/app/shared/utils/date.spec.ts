import { describe, expect, it } from "vitest";

import { dateLabel, dateText } from "./date";

describe("date labels", () => {
  it("names the month in the visitor's language", () => {
    expect(dateLabel("2020-08-15", "MMMM y", "en")).toBe("August 2020");
    expect(dateLabel("2020-08-15", "MMMM y", "es")).toBe("Agosto 2020");
  });

  it("puts the day before the month in a Spanish short date", () => {
    expect(dateText("2024-06-11", "mediumDate", "es")).toBe("11 jun 2024");
  });

  it("keeps the stored calendar day whatever the time zone", () => {
    expect(dateText("2020-08-01", "d", "en")).toBe("1");
  });

  it("is empty for a missing or invalid date", () => {
    expect(dateText(null, "MMMM y", "en")).toBe("");
    expect(dateText("not a date", "MMMM y", "en")).toBe("");
  });

  it("formats a sentence with quoted words", () => {
    expect(dateText("2020-08-05", "'Escrito el' d 'de' MMMM 'del' y", "es")).toBe("Escrito el 5 de agosto del 2020");
    expect(dateText("2020-08-05", "'Written on' MMMM d, y", "en")).toBe("Written on August 5, 2020");
  });
});
