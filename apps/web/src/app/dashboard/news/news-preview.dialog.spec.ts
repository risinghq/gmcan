import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { describe, expect, it } from "vitest";

import { type NewsPreview, NewsPreviewDialog } from "./news-preview.dialog";

const PREVIEW: NewsPreview = {
  title: "Integración de Dinámica Molecular",
  summary: "",
  body: "",
  image: null,
  kindName: "Evento",
  author: null,
  publishedAt: new Date(2024, 5, 11),
};

describe("NewsPreviewDialog", () => {
  it("dates the preview in Spanish whatever the build locale", async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: "en-US" },
        { provide: MAT_DIALOG_DATA, useValue: PREVIEW },
      ],
    });
    const fixture = TestBed.createComponent(NewsPreviewDialog);
    await fixture.whenStable();

    const time: HTMLTimeElement = fixture.nativeElement.querySelector("time");
    expect(time.textContent).toContain("11 de junio de 2024");
    expect(time.getAttribute("datetime")).toBe("2024-06-11");
  });
});
