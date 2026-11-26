import { SlicePipe } from "@angular/common";
import { Component, OnInit, computed, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import type { PublicationDisplay, PublicationViewModel } from "./types";

@Component({
  selector: "app-publication",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AvatarComponent,
    RouterLink,
    MatProgressSpinner,
    MatIcon,
    MatTabGroup,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class PublicationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionService);
  private readonly browser = inject(BrowserService);
  private readonly seo = inject(SeoService);

  private allArticulos: PublicationDisplay[] = [];
  private allTesis: PublicationDisplay[] = [];
  private allResumenes: PublicationDisplay[] = [];
  publicaciones: PublicationDisplay[] = [];
  activeTab = 0;
  cargado = false;
  allCharged: boolean | null = false;
  searchForm: FormGroup;
  readonly tabLabels = computed(() => {
    const text = this.session.language().publicationsText?.[0];
    return text
      ? [
          { label: text.nameTab1, search: text.search1 },
          { label: text.nameTab2, search: text.search2 },
          { label: text.nameTab3, search: text.search3 },
        ]
      : [];
  });
  url = GLOBAL.url;
  infoText = "";
  language: (typeof Languages)[number] = Languages[0];
  expandedKey: string | null = null;
  page = 1;
  pageSize = 5;

  constructor() {
    this.searchForm = this.fb.group({
      titulo: [""],
    });
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.publications);

    const pubData = this.route.snapshot.data["publications"] as PublicationViewModel;
    this.allArticulos = pubData.articulos;
    this.allTesis = pubData.tesis;
    this.allResumenes = pubData.resumenes;
    this.infoText = pubData.infoText;
    this.publicaciones = this.allArticulos;
    this.allCharged = true;
    this.cargado = true;
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }

  changeTab($event: { index: number }): void {
    this.activeTab = $event.index;
    this.page = 1;
    this.searchForm.controls["titulo"].setValue("");
    const sources = [this.allArticulos, this.allTesis, this.allResumenes];
    this.publicaciones = sources[$event.index] ?? [];
    this.allCharged = true;
  }

  search(value: string): void {
    const sources = [this.allArticulos, this.allTesis, this.allResumenes];
    const source = sources[this.activeTab] ?? [];
    if (!value.trim()) {
      this.publicaciones = source;
    } else {
      const q = value.toLowerCase();
      this.publicaciones = source.filter(
        (p) => p.title.toLowerCase().includes(q) || p.authors.some((a) => a.name.toLowerCase().includes(q)),
      );
    }
    this.page = 1;
  }

  toggleExpanded(section: string, index: number): void {
    const key = `${section}:${index}`;
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  isExpanded(section: string, index: number): boolean {
    return this.expandedKey === `${section}:${index}`;
  }

  expandLabel(section: string, index: number, seeMore: string, seeLess: string): string {
    return this.isExpanded(section, index) ? seeLess : seeMore;
  }
}
