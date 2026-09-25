import { AfterViewInit, Component, Input, viewChild, ChangeDetectionStrategy } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from "@angular/material/table";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-lines-tab",
  templateUrl: "./lines.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIcon,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
  ],
})
export class ContenidosLinesTab implements AfterViewInit {
  @Input({ required: true }) state!: ContenidosState;
  @Input({ required: true }) mode!: "line" | "method";

  readonly paginator = viewChild.required(MatPaginator);
  readonly tableSort = viewChild.required(MatSort);

  ngAfterViewInit(): void {
    if (this.mode === "line") {
      this.state.connectTable1(this.tableSort(), this.paginator());
      return;
    }
    this.state.connectTable2(this.tableSort(), this.paginator());
  }
}
