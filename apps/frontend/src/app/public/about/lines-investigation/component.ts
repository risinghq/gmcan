import { TitleCasePipe, DatePipe, SlicePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
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
  nameEN: "",
  description: "",
  descriptionEN: "",
  photo: null,
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
  private _researchLinesService = inject(ResearchLinesService);
  private _projectService = inject(ProjectService);
  private _titlecasePipe = inject(TitleCasePipe);
  private _datePipe = inject(DatePipe);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  lookup = inject(LookupService);
  private _session = inject(SessionService);
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
    this.language = this._session.language();
    this.titleService.setTitle("GMCAN | " + this.language.linesInvestigation);
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      lineas: this._researchLinesService.list(),
      projects: this._projectService.listProjects(),
    }).subscribe(({ lineas, projects }) => {
      const fuentesMap = new Map(this.lookup.fundingSources().map((f) => [f.id, f]));
      const monedasMap = new Map(this.lookup.monedas().map((m) => [m.idMoneda, m]));

      const enrichedProjects = projects.map((p): ProjectDisplay => {
        const startDate = new Date(p.startDate ?? "");
        if (String(startDate) !== "Invalid Date") {
          startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
        }
        let fechaF: string | undefined;
        if (p.endDate) {
          const end = new Date(p.endDate);
          if (String(end) !== "Invalid Date") {
            end.setMinutes(end.getMinutes() + end.getTimezoneOffset());
            fechaF = this._titlecasePipe.transform(this._datePipe.transform(end, "MMMM, y", "es") ?? "") ?? undefined;
          }
        }
        return {
          ...p,
          fechaI:
            String(startDate) === "Invalid Date"
              ? ""
              : (this._titlecasePipe.transform(this._datePipe.transform(startDate, "MMMM, y", "es") ?? "") ?? ""),
          fechaF,
          lineasInvestigacion: lineas.find((l) => l.id === p.researchLineId)?.name,
          fuenteFinanciamiento: fuentesMap.get(p.fundingSourceId)?.name,
          moneda: monedasMap.get(p.currencyId)?.simbolo,
        };
      });

      const mapped: ResearchLineDisplay[] = lineas.slice(0, 3).map((l) =>
        Object.assign({} as ResearchLineDisplay, l, {
          proyectos: enrichedProjects.filter((p) => p.researchLineId === l.id && !p.endDate),
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
    this._router.navigate(["/home/detail-member/" + member.memberId]);
  }
}
