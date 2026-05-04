import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import type { ProjectWithMembers } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";
import { forkJoin } from "rxjs";

type ProjectDisplay = ProjectWithMembers & {
  fechaI?: string;
  fechaF?: string;
  lineasInvestigacion?: string;
  fuenteFinanciamiento?: string;
  moneda?: string;
};
type ResearchLineDisplay = ResearchLine & { proyectos: ProjectDisplay[] };

const EMPTY_LINE: ResearchLineDisplay = {
  id: 0,
  name: "",
  description: "",
  asset: null,
  groupId: 0,
  createdAt: null,
  updatedAt: null,
  proyectos: [],
};

@Component({
  selector: "app-lines-investigation",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, NgbPagination, NgbPaginationPrevious, NgbPaginationNumber, NgbPaginationNext, SlicePipe],
})
export default class LinesInvestigationComponent implements OnInit {
  private researchLinesService = inject(ResearchLinesService);
  private projectService = inject(ProjectService);
  private titlecasePipe = inject(TitleCasePipe);
  private datePipe = inject(DatePipe);
  router = inject(Router);
  lookup = inject(LookupService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  language: any = {};

  public lineasProyecto: ResearchLineDisplay[] = [{ ...EMPTY_LINE }, { ...EMPTY_LINE }, { ...EMPTY_LINE }];
  public page0 = 1;
  public pageSize = 5;
  public page1 = 1;
  public pageSize2 = 5;
  public page2 = 1;
  public pageSize3 = 5;
  public url = GLOBAL.url;

  expandedKey: string | null = null;

  ngOnInit(): void {
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | " + this.language.linesInvestigation);
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      lineas: this.researchLinesService.list(),
      projects: this.projectService.listProjects(),
    }).subscribe(({ lineas, projects }) => {
      const fuentesMap = new Map(this.lookup.fundingSources().map((f) => [f.id, f]));
      const monedasMap = new Map(this.lookup.monedas().map((m) => [m.idMoneda, m]));

      const enrichedProjects = projects.map(
        (project): ProjectDisplay => this.enrichProject(project, lineas, fuentesMap, monedasMap),
      );

      const mapped: ResearchLineDisplay[] = lineas.slice(0, 3).map((line) =>
        Object.assign({} as ResearchLineDisplay, line, {
          proyectos: enrichedProjects.filter((project) => project.researchLineId === line.id && !project.endDate),
        }),
      );

      while (mapped.length < 3) {
        mapped.push({ ...EMPTY_LINE, proyectos: [] });
      }

      this.lineasProyecto = mapped;
    });
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
    this.router.navigate(["/home/detail-member/" + member.memberId], { queryParams: { from: "about" } });
  }

  private enrichProject(
    project: ProjectWithMembers,
    lineas: ResearchLine[],
    fuentesMap: Map<number, { name?: string }>,
    monedasMap: Map<number, { simbolo?: string }>,
  ): ProjectDisplay {
    return {
      ...project,
      fechaI: this.formatMonth(project.startDate),
      fechaF: project.endDate ? this.formatMonth(project.endDate) : undefined,
      lineasInvestigacion: lineas.find((line) => line.id === project.researchLineId)?.name,
      fuenteFinanciamiento: fuentesMap.get(project.fundingSourceId)?.name,
      moneda: monedasMap.get(project.currencyId)?.simbolo,
    };
  }

  private formatMonth(value?: string | null): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return this.titlecasePipe.transform(this.datePipe.transform(date, "MMMM, y", "es") ?? "") ?? "";
  }
}
