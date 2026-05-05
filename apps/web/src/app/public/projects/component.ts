import { SlicePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { Languages } from "@app/shared/models/languages";
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
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly browser = inject(BrowserService);
  private readonly session = inject(SessionService);
  private readonly titleService = inject(Title);

  private allActive: ProjectDisplay[] = [];
  private allFinished: ProjectDisplay[] = [];
  currentProjects: ProjectDisplay[] = [];
  tipoProyectos: string[] = [];
  activeTab = 0;
  allCharged: boolean | null = false;
  searchForm: FormGroup;
  url = GLOBAL.url;
  infoText = "";
  language: (typeof Languages)[number] = Languages[0];
  page = 1;
  pageSize = 5;
  screenWidth = 0;
  searchText = "";
  expandedKey: string | null = null;

  constructor() {
    this.searchForm = this.fb.group({
      titulo: [""],
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this.browser.innerWidth();
    this.setSearchText();
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | " + this.language.projects);
    this.screenWidth = this.browser.innerWidth();
    this.page = 1;
    this.pageSize = 5;
    this.setSearchText();

    const projectsData = this.route.snapshot.data["projects"] as ProjectsViewModel;
    this.allActive = projectsData.active;
    this.allFinished = projectsData.finished;
    this.infoText = projectsData.infoText;

    this.syncLabels();
    this.currentProjects = this.allActive;
    this.allCharged = true;
  }

  ngDoCheck(): void {
    this.syncLabels();
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
    this.browser.scrollIntoViewById("main-toolbar");
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
    this.router.navigate(["/home/detail-member/" + member.memberId], { queryParams: { from: "projects" } });
  }

  private syncLabels(): void {
    const projectsText = this.language.projectsText?.[0];
    if (!projectsText) {
      return;
    }

    this.tipoProyectos = [projectsText.projectsType1, projectsText.projectsType2];
  }
}
