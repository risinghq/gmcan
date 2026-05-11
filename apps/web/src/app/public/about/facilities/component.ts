import { Component, computed, inject, input } from "@angular/core";
import { MatChip, MatChipSet } from "@angular/material/chips";
import type { FacilitiesData } from "@app/public/about/data";
import { BrowserService } from "@app/shared/services/browser.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-facilities",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatChipSet, MatChip],
})
export default class FacilitiesComponent {
  private browser = inject(BrowserService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly facilities = input.required<FacilitiesData>();
  readonly grupo = computed(() => this.facilities().group);
  readonly equipos = computed(() => this.facilities().equipment);
  readonly software = computed(() => this.facilities().software);

  public page1 = 1;
  public pageSize = 5;
  public page2 = 1;

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().resources);
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
