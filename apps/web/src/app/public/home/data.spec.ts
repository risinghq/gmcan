import { Languages } from "@app/shared/models/languages";
import { describe, expect, it } from "vitest";

import { homeCounters } from "./data";

const [es, en] = Languages;

function labels(memberCount: number, journal_article: number, thesis: number, conference_paper: number, language = es) {
  const counts = { journal_article, thesis, conference_paper };
  return homeCounters({ memberCount, publicationCounts: counts }, language).map((c) => `${c.value} ${c.label}`);
}

describe("homeCounters", () => {
  it("names a single item in the singular", () => {
    expect(labels(1, 1, 1, 1)).toEqual(["1 Miembro", "1 Artículo", "1 Tesis", "1 Resumen"]);
    expect(labels(1, 1, 1, 1, en)).toEqual(["1 Member", "1 Paper", "1 Thesis", "1 Conference abstract"]);
  });

  it("names zero and many in the plural", () => {
    expect(labels(24, 15, 2, 0)).toEqual(["24 Miembros", "15 Artículos", "2 Tesis", "0 Resúmenes"]);
    expect(labels(24, 15, 2, 0, en)).toEqual(["24 Members", "15 Papers", "2 Theses", "0 Conference abstracts"]);
  });

  it("links each publication count to its own tab", () => {
    const counts = { journal_article: 1, thesis: 1, conference_paper: 1 };
    const links = homeCounters({ memberCount: 1, publicationCounts: counts }, es).map((c) => [
      c.link,
      c.queryParams?.type,
    ]);
    expect(links).toEqual([
      ["/members", undefined],
      ["/publications", undefined],
      ["/publications", "thesis"],
      ["/publications", "conference_paper"],
    ]);
  });
});
