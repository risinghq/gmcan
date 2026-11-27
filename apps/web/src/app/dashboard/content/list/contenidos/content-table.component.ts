import { AfterViewInit, ChangeDetectionStrategy, Component, inject, input, viewChild } from "@angular/core";
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
import { Router, RouterLink } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";

import { ContentTable } from "./table";

@Component({
  selector: "app-content-table",
  styleUrl: "./content-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
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
    RouterLink,
  ],
  template: `
    @let list = table();
    <div class="flex-news mb-16">
      <div class="search-news">
        <input #search class="input-search-text" (keyup)="list.filter(search.value)" [placeholder]="searchLabel()" />
        <app-icon class="icon-search-toolbar" name="search" />
      </div>
      <div class="center btn-black">
        <a class="link" [routerLink]="list.addRoute">{{ addLabel() }}</a>
      </div>
    </div>
    <table mat-table [dataSource]="list.dataSource" [hidden]="list.notFound()" matSort>
      <ng-container matColumnDef="nombre">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
        <td mat-cell *matCellDef="let row">
          <button type="button" class="row-action">{{ row.name }}</button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row class="clickable-row" *matRowDef="let row; columns: columns" (click)="edit(row.id)"></tr>
    </table>
    <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" [hidden]="list.notFound()" />
    @if (list.notFound()) {
      <span class="plex-sans">No se encontraron resultados</span>
    }
  `,
})
export class ContentTableComponent implements AfterViewInit {
  private readonly router = inject(Router);

  readonly table = input.required<ContentTable>();
  readonly searchLabel = input.required<string>();
  readonly addLabel = input.required<string>();

  readonly columns = ["nombre"];
  private readonly tableSort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  ngAfterViewInit(): void {
    this.table().attach(this.tableSort(), this.paginator());
  }

  edit(id: number): void {
    this.router.navigate([this.table().editRoute, id]);
  }
}
