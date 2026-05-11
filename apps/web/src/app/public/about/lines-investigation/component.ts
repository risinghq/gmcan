import { DatePipe, SlicePipe } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import type { ResearchLineDisplay } from "@app/public/about/data";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
} from "@ng-bootstrap/ng-bootstrap/pagination";

@Component({
  selector: "app-lines-investigation",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, NgbPagination, NgbPaginationPrevious, NgbPaginationNumber, NgbPaginationNext, SlicePipe, DatePipe],
})
export default class LinesInvestigationComponent {
  router = inject(Router);
  private titleService = inject(Title);
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly lineasProyecto = input.required<ResearchLineDisplay[]>();

  public pageSize = 5;
  public expandedLineId: number | null = null;
  public pageByLineId: Record<number, number> = {};

  expandedKey: string | null = null;

  constructor() {
    this.titleService.setTitle("GMCAN | " + this.language().linesInvestigation);
  }

  toggleLine(lineId: number): void {
    this.expandedLineId = this.expandedLineId === lineId ? null : lineId;
  }

  isLineExpanded(lineId: number): boolean {
    return this.expandedLineId === lineId;
  }

  pageForLine(lineId: number): number {
    return this.pageByLineId[lineId] ?? 1;
  }

  setPageForLine(lineId: number, page: number): void {
    this.pageByLineId[lineId] = page;
  }

  projectKey(lineId: number, index: number): string {
    return `${lineId}:${index}`;
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
}
