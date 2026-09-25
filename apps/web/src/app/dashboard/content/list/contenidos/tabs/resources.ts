import { Component, Input, AfterViewInit, viewChild, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { AutosizeModule } from "ngx-autosize";

import { ContenidosState } from "../state";

@Component({
  selector: "app-contenidos-resources-tab",
  templateUrl: "./resources.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    AutosizeModule,
  ],
})
export class ContenidosResourcesTab implements AfterViewInit {
  @Input({ required: true }) state!: ContenidosState;

  readonly eqSort = viewChild.required("eqSort", { read: MatSort });
  readonly eqPaginator = viewChild.required("eqPaginator", { read: MatPaginator });
  readonly swSort = viewChild.required("swSort", { read: MatSort });
  readonly swPaginator = viewChild.required("swPaginator", { read: MatPaginator });

  ngAfterViewInit(): void {
    this.state.connectTable3(this.eqSort(), this.eqPaginator());
    this.state.connectTable4(this.swSort(), this.swPaginator());
  }
}
