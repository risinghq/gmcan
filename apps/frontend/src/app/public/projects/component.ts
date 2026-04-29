import { SlicePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import type { ProjectDisplay, ProjectsViewModel } from "./types";

@Component({
  selector: "app-projects",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [
    MatIcon,
    MatTabGroup,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
  ],
})
export default class ProjectsComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _browser = inject(BrowserService);
  private readonly _session = inject(SessionService);
  private readonly _titleService = inject(Title);

  private allActive: ProjectDisplay[] = [];
  private allFinished: ProjectDisplay[] = [];
  currentProjects: ProjectDisplay[] = [];
  tipoProyectos: string[] = [];
  activeTab = 0;
  allCharged: boolean | null = false;
  searchForm: FormGroup;
  url = GLOBAL.url;
  infoText = "";
  language: any = {};
  page = 1;
  pageSize = 5;
  screenWidth = 0;
  searchText = "";
  expandedKey: string | null = null;

  constructor() {
    this.searchForm = this._fb.group({
      titulo: [""],
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this._browser.innerWidth();
    this.setSearchText();
  }

  ngOnInit(): void {
    this.language = this._session.language();
    this._titleService.setTitle("GMCAN | " + this.language.projects);
    this.screenWidth = this._browser.innerWidth();
    this.page = 1;
    this.pageSize = 5;
    this.setSearchText();

    const projectsData = this._route.snapshot.data["projects"] as ProjectsViewModel;
    this.allActive = projectsData.active;
    this.allFinished = projectsData.finished;
    this.infoText = projectsData.infoText;

    this.tipoProyectos.push(this.language.projectsText[0].projectsType1);
    this.tipoProyectos.push(this.language.projectsText[0].projectsType2);
    this.currentProjects = this.allActive;
    this.allCharged = true;
  }

  ngDoCheck(): void {
    if (this.tipoProyectos) {
      this.tipoProyectos[0] = this.language.projectsText[0].projectsType1;
      this.tipoProyectos[1] = this.language.projectsText[0].projectsType2;
    }
  }

  setSearchText(): void {
    this.searchText = this.language.projectsText[0].placeholderMobile;
    if (this.screenWidth > 960) {
      this.searchText = this.language.projectsText[0].placeholder;
    }
  }

  changeTab($event: { index: number }): void {
    this.activeTab = $event.index;
    this.page = 1;
    this.searchForm.controls["titulo"].setValue("");
    this.currentProjects = $event.index === 0 ? this.allActive : this.allFinished;
  }

  scroll(): void {
    this._browser.scrollIntoViewById("main-toolbar");
  }

  search(term: string): void {
    const source = this.activeTab === 0 ? this.allActive : this.allFinished;
    if (!term.trim()) {
      this.currentProjects = source;
    } else {
      const q = term.toLowerCase();
      this.currentProjects = source.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.lineasInvestigacion ?? "").toLowerCase().includes(q) ||
          p.members.some((m) => m.name.toLowerCase().includes(q)),
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

  profile(member: { memberId: number }): void {
    this._router.navigate(["/home/detail-member/" + member.memberId]);
  }
}
