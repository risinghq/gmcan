import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, viewChild } from "@angular/core";
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
import type { Project } from "@app/shared/models/project";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import type { FundingSourceItem } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

interface ProjectRow extends Project {
  fechaI?: string;
  members?: { memberId: number; name: string }[];
}

@Component({
  selector: "app-proyectos",
  templateUrl: "./proyectos.component.html",
  styleUrl: "./proyectos.component.scss",
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
  _router = inject(Router);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _projectService = inject(ProjectService);
  _lookup = inject(LookupService);
  private _tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "primerAutor", "fechaInicio", "codigo"];
  displayedColumns2: string[] = ["nombre"];
  dataSource: MatTableDataSource<ProjectRow> = new MatTableDataSource<ProjectRow>([]);
  dataSource2: MatTableDataSource<FundingSourceItem> = new MatTableDataSource<FundingSourceItem>([]);
  fundingSources: FundingSourceItem[] = [];
  proyectos: ProjectRow[] = [];
  selectedTab = 0;

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  ejecucion = false;

  ngOnInit(): void {
    this.selectedTab = this._tabState.projectTab();
    if (window.location.href.includes("ejecucion")) {
      this.ejecucion = true;
      this.loadFundingSources();
      this.getProyectos(1);
    } else {
      this.getProyectos(0);
    }
  }

  loadFundingSources(): void {
    const sources = this._lookup.fundingSources();
    this.fundingSources = sources;
    this.dataSource2 = new MatTableDataSource(this.fundingSources);
    this.dataSource2.sort = this.sort2();
    this.dataSource2.paginator = this.paginator2();
  }

  getProyectos(status: number): void {
    this._projectService.listAdminProjects().subscribe((res: Project[]) => {
      if (res) {
        const filtered = (
          status === 1 ? res.filter((p) => p.status === 1) : res.filter((p) => p.status !== 1)
        ).toSorted((a, b) =>
          (a.startDate ?? "") < (b.startDate ?? "") ? 1 : (b.startDate ?? "") < (a.startDate ?? "") ? -1 : 0,
        );
        this.proyectos = filtered.map((p) => {
          const d = new Date(p.startDate ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          return Object.assign({} as ProjectRow, p, {
            fechaI: this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM, y", "es") ?? ""),
          });
        });
        this.dataSource = new MatTableDataSource(this.proyectos);
        this.dataSource.sort = this.matSort();
        this.dataSource.paginator = this.paginator();

        for (const proyecto of this.proyectos) {
          this._projectService.getProjectMembers(proyecto.id).subscribe((members) => {
            proyecto.members = members as { memberId: number; name: string }[];
          });
        }
      }
    });
  }

  displayedNotFound = false;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.displayedNotFound = this.dataSource.filteredData.length === 0;
  }

  displayedNotFound2 = false;

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    this.displayedNotFound2 = this.dataSource2.filteredData.length === 0;
  }

  changedTab(event: number): void {
    this._tabState.projectTab.set(event);
  }

  addProject(): void {
    this._router.navigate(["dashboard/add-project"]);
  }

  editProject(id: number): void {
    this._router.navigate(["dashboard/edit-project/" + id]);
  }

  addFuente(): void {
    this._router.navigate(["dashboard/add-fuente"]);
  }

  editFuente(id: number): void {
    this._router.navigate(["dashboard/edit-fuente/" + id]);
  }
}
