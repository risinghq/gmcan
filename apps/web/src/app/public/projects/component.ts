import { SlicePipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { ActivatedRoute } from "@angular/router";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { ProjectItemComponent } from "@app/shared/components/project-item.component";
import { SearchBoxComponent } from "@app/shared/components/search-box.component";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicProject } from "@gmcan/contracts/public";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

import type { ProjectsViewModel } from "./types";

@Component({
  selector: "app-projects",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    SearchBoxComponent,
    ProjectItemComponent,
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
export default class ProjectsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly browser = inject(BrowserService);
  private readonly session = inject(SessionService);

  private allActive: PublicProject[] = [];
  private allFinished: PublicProject[] = [];
  currentProjects: PublicProject[] = [];
  tipoProyectos: string[] = [];
  activeTab = 0;
  query = "";
  url = GLOBAL.url;
  infoText = "";
  language: (typeof Languages)[number] = Languages[0];
  page = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.language = this.session.language();
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
          (p.researchLine ?? "").toLowerCase().includes(q) ||
          p.members.some((m) => m.name.toLowerCase().includes(q)),
      );
    }
    this.page = 1;
  }

  private syncLabels(): void {
    const projectsText = this.language.projectsText?.[0];
    if (!projectsText) {
      return;
    }

    this.tipoProyectos = [projectsText.projectsType1, projectsText.projectsType2];
  }
}
