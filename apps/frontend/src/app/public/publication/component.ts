import { SlicePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
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
  imports: [
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
  private readonly _fb = inject(FormBuilder);
  private readonly _navigationHistory = inject(NavigationHistoryService);
  private readonly _previousService = inject(PreviousPageService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _session = inject(SessionService);
  private readonly _browser = inject(BrowserService);
  private readonly _titleService = inject(Title);

  previouslink: string | null = null;
  previouspage = "";
  private allArticulos: PublicationDisplay[] = [];
  private allTesis: PublicationDisplay[] = [];
  private allResumenes: PublicationDisplay[] = [];
  publicaciones: PublicationDisplay[] = [];
  activeTab = 0;
  cargado = false;
  allCharged: boolean | null = false;
  searchForm: FormGroup;
  tabLabels: { label: string; search: string }[] = [
    { label: "", search: "" },
    { label: "", search: "" },
    { label: "", search: "" },
  ];
  url = GLOBAL.url;
  infoText = "";
  language: any = {};
  expandedKey: string | null = null;
  page = 1;
  pageSize = 5;

  constructor() {
    this.searchForm = this._fb.group({
      titulo: [""],
    });
  }

  ngOnInit(): void {
    this.language = this._session.language();
    this._titleService.setTitle("GMCAN | " + this.language.publications);

    const pubData = this._route.snapshot.data["publications"] as PublicationViewModel;
    this.allArticulos = pubData.articulos;
    this.allTesis = pubData.tesis;
    this.allResumenes = pubData.resumenes;
    this.infoText = pubData.infoText;
    this.publicaciones = this.allArticulos;
    this.allCharged = true;
    this.cargado = true;

    this.previouslink = this._navigationHistory.previousUrl();
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
  }

  ngDoCheck(): void {
    if (this.language?.publicationsText?.[0]) {
      this.tabLabels[0] = {
        label: this.language.publicationsText[0].nameTab1,
        search: this.language.publicationsText[0].search1,
      };
      this.tabLabels[1] = {
        label: this.language.publicationsText[0].nameTab2,
        search: this.language.publicationsText[0].search2,
      };
      this.tabLabels[2] = {
        label: this.language.publicationsText[0].nameTab3,
        search: this.language.publicationsText[0].search3,
      };
    }
  }

  scroll(): void {
    this._browser.scrollIntoViewById("main-toolbar");
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

  profile(autor: { memberId?: number }): void {
    if (!autor.memberId) return;
    this._router.navigate(["/home/detail-member/" + autor.memberId]);
  }
}
