import { NgTemplateOutlet, SlicePipe } from "@angular/common";
import { Component, inject, input, ChangeDetectionStrategy } from "@angular/core";
import type { ResearchLineDisplay } from "@app/public/about/data";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { ProjectItemComponent } from "@app/shared/components/project-item.component";
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ProjectItemComponent,
    IconComponent,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NgTemplateOutlet,
    SlicePipe,
  ],
})
export default class LinesInvestigationComponent {
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly lineasProyecto = input.required<ResearchLineDisplay[]>();

  public pageSize = 5;
  public expandedLineId: number | null = null;
  public pageByLineId: Record<number, number> = {};

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
}
