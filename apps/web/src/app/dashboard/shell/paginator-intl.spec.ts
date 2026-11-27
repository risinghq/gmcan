import { describe, expect, it } from "vitest";

import { SpanishPaginatorIntl } from "./paginator-intl";

const intl = new SpanishPaginatorIntl();

describe("SpanishPaginatorIntl", () => {
  it("labels the page size control in Spanish", () => {
    expect(intl.itemsPerPageLabel).toBe("Filas por página:");
  });

  it("shows the visible range of a full page", () => {
    expect(intl.getRangeLabel(0, 5, 12)).toBe("1 – 5 de 12");
  });

  it("ends the last page at the total", () => {
    expect(intl.getRangeLabel(2, 5, 12)).toBe("11 – 12 de 12");
  });

  it("shows an empty list as zero", () => {
    expect(intl.getRangeLabel(0, 5, 0)).toBe("0 de 0");
  });
});
