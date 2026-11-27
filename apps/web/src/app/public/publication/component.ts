import { SlicePipe } from "@angular/common";
import { Component, computed, inject, input, linkedSignal, ChangeDetectionStrategy } from "@angular/core";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { PublicationItemComponent } from "@app/shared/components/publication-item.component";
import { SearchBoxComponent } from "@app/shared/components/search-box.component";
import { BrowserService } from "@app/shared/services/browser.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import { PUBLICATION_TABS, type PublicationDisplay, type PublicationViewModel } from "./types";

@Component({
  selector: "app-publication",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    PublicationItemComponent,
    SearchBoxComponent,
    BreadcrumbComponent,
    IconComponent,
    MatTabGroup,
    MatTab,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class PublicationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly browser = inject(BrowserService);
  private readonly data = this.route.snapshot.data["publications"] as PublicationViewModel;
  private readonly sources = [this.data.articulos, this.data.tesis, this.data.resumenes];

  readonly language = inject(SessionService).language();
  readonly tabLabels = [
    this.language.publicationsText[0].nameTab1,
    this.language.publicationsText[0].nameTab2,
    this.language.publicationsText[0].nameTab3,
  ];
  readonly infoText = this.data.infoText;
  readonly pageSize = 5;

  readonly type = input<string>();
  readonly activeTab = computed(() =>
    Math.max(0, PUBLICATION_TABS.indexOf(this.type() as (typeof PUBLICATION_TABS)[number])),
  );
  readonly query = linkedSignal({ source: this.activeTab, computation: () => "" });
  readonly page = linkedSignal({ source: this.activeTab, computation: () => 1 });
  private readonly searched = linkedSignal({ source: this.activeTab, computation: () => "" });
  readonly publicaciones = computed(() => matching(this.sources[this.activeTab()], this.searched()));

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }

  changeTab(index: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: index ? PUBLICATION_TABS[index] : null },
      replaceUrl: true,
    });
  }

  search(value: string): void {
    this.searched.set(value);
    this.page.set(1);
  }
}

function matching(publications: PublicationDisplay[], value: string): PublicationDisplay[] {
  const q = value.trim().toLowerCase();
  if (!q) return publications;
  return publications.filter(
    (p) => p.title.toLowerCase().includes(q) || p.authors.some((a) => a.name.toLowerCase().includes(q)),
  );
}
