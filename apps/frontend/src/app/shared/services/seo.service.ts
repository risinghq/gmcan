import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable({ providedIn: "root" })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setPageTitle(title: string): void {
    this.title.setTitle(title);
  }

  setDescription(description: string): void {
    this.meta.updateTag({ name: "description", content: description });
  }

  setOpenGraphTitle(title: string): void {
    this.meta.updateTag({ property: "og:title", content: title });
  }
}
