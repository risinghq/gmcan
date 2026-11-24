import { Component, OnInit, computed, inject, signal, viewChild, ChangeDetectionStrategy } from "@angular/core";
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
  private tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "primerAutor", "fechaInicio", "codigo"];
  displayedColumns2: string[] = ["nombre"];
  dataSource = new MatTableDataSource<AdminProjectListItem>([]);
  items: AdminProjectListItem[] = [];
  selectedTab = 0;

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  private readonly fundingSearch = signal("");
  readonly filteredFundingSources = computed(() => {
    const search = this.fundingSearch();
    return this.lookup.fundingSources().filter((source) => source.name.toLowerCase().includes(search));
  });

  ejecucion = false;

  ngOnInit(): void {
    this.selectedTab = this.tabState.projectTab();
    if (window.location.href.includes("ejecucion")) {
      this.ejecucion = true;
      this.loadList(true);
    } else {
      this.loadList(false);
    }
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

  onFundingSearch(event: Event): void {
    this.fundingSearch.set((event.target as HTMLInputElement).value.trim().toLowerCase());
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
}
