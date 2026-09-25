import { Component, OnInit, inject, viewChild, ChangeDetectionStrategy } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from "@angular/material/table";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Router } from "@angular/router";
import type { AdminProjectListItem } from "@app/shared/models/admin-list";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import type { FundingSourceItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

@Component({
  selector: "app-proyectos",
  templateUrl: "./proyectos.component.html",
  styleUrl: "./proyectos.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTabGroup,
    MatTab,
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
export default class ProyectosComponent implements OnInit {
  router = inject(Router);
  projectService = inject(ProjectService);
  lookup = inject(LookupService);
  private refService = inject(RefService);
  private tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "primerAutor", "fechaInicio", "codigo"];
  displayedColumns2: string[] = ["nombre"];
  dataSource = new MatTableDataSource<AdminProjectListItem>([]);
  dataSource2: MatTableDataSource<FundingSourceItem> = new MatTableDataSource<FundingSourceItem>([]);
  fundingSources: FundingSourceItem[] = [];
  items: AdminProjectListItem[] = [];
  selectedTab = 0;

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  ejecucion = false;

  ngOnInit(): void {
    this.selectedTab = this.tabState.projectTab();
    if (window.location.href.includes("ejecucion")) {
      this.ejecucion = true;
      this.loadFundingSources();
      this.loadList(true);
    } else {
      this.loadList(false);
    }
  }

  loadFundingSources(): void {
    this.refService.listFundingSources().subscribe((sources) => {
      this.fundingSources = sources;
      this.dataSource2 = new MatTableDataSource(this.fundingSources);
      this.dataSource2.sort = this.sort2();
      this.dataSource2.paginator = this.paginator2();
    });
  }

  loadList(activeMode: boolean): void {
    this.projectService.listAdminProjects().subscribe((rows) => {
      this.items = activeMode
        ? rows.filter((item) => item.statusCode === "active")
        : rows.filter((item) => item.statusCode !== "active");
      this.dataSource = new MatTableDataSource(this.items);
      this.dataSource.filterPredicate = (row, filter) => {
        const normalized = filter.trim().toLowerCase();
        return (
          row.title.toLowerCase().includes(normalized) ||
          row.startDateLabel.toLowerCase().includes(normalized) ||
          row.code.toLowerCase().includes(normalized) ||
          row.members.some((member) => member.name.toLowerCase().includes(normalized))
        );
      };
      this.dataSource.sort = this.matSort();
      this.dataSource.paginator = this.paginator();
    });
  }

  displayedNotFound = false;

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.displayedNotFound = this.dataSource.filteredData.length === 0;
  }

  displayedNotFound2 = false;

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    this.displayedNotFound2 = this.dataSource2.filteredData.length === 0;
  }

  changedTab(event: number): void {
    this.tabState.projectTab.set(event);
  }

  addProject(): void {
    this.router.navigate(["dashboard/add-project"]);
  }

  editProject(id: number): void {
    this.router.navigate(["dashboard/edit-project/" + id]);
  }

  addFuente(): void {
    this.router.navigate(["dashboard/add-fuente"]);
  }

  editFuente(id: number): void {
    this.router.navigate(["dashboard/edit-fuente/" + id]);
  }
}
