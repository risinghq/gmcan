import { SlicePipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { ActivatedRoute } from "@angular/router";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { ProjectMembersComponent } from "@app/shared/components/project-members.component";
import { SearchBoxComponent } from "@app/shared/components/search-box.component";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { MoneyPipe } from "@app/shared/utils/money";
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    SearchBoxComponent,
    ProjectMembersComponent,
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
    MoneyPipe,
  ],
})
export default class ProjectsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly browser = inject(BrowserService);
  private readonly session = inject(SessionService);
  private readonly seo = inject(SeoService);

  private allActive: ProjectDisplay[] = [];
  private allFinished: ProjectDisplay[] = [];
  currentProjects: ProjectDisplay[] = [];
  tipoProyectos: string[] = [];
  activeTab = 0;
  query = "";
  url = GLOBAL.url;
  infoText = "";
  language: (typeof Languages)[number] = Languages[0];
  page = 1;
  pageSize = 5;
  expandedKey: string | null = null;

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.projects);
    this.page = 1;
    this.pageSize = 5;

    const projectsData = this.route.snapshot.data["projects"] as ProjectsViewModel;
    this.allActive = projectsData.active;
    this.allFinished = projectsData.finished;
    this.infoText = projectsData.infoText;

    this.syncLabels();
    this.currentProjects = this.allActive;
  }

  ngDoCheck(): void {
    this.syncLabels();
  }

  changeTab($event: { index: number }): void {
    this.activeTab = $event.index;
    this.page = 1;
    this.query = "";
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

  private syncLabels(): void {
    const projectsText = this.language.projectsText?.[0];
    if (!projectsText) {
      return;
    }

    this.tipoProyectos = [projectsText.projectsType1, projectsText.projectsType2];
  }
}
