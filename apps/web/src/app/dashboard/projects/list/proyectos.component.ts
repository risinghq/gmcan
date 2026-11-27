import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
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
import { ActivatedRoute, Router } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { PersonComponent } from "@app/shared/components/person.component";
import type { AdminProjectListItem } from "@app/shared/models/admin-list";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { ListTable } from "@app/shared/tables/list-table";

import { isOngoing } from "../project-status";

@Component({
  selector: "app-proyectos",
  templateUrl: "./proyectos.component.html",
  styleUrl: "./proyectos.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PersonComponent,
    MatTabGroup,
    MatTab,
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
  ],
})
export default class ProyectosComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly lookup = inject(LookupService);
  private readonly tabState = inject(TabStateService);

  /** Only the ongoing list edits funding sources. The other route lists concluded projects. */
  readonly ongoing = (inject(ActivatedRoute).snapshot.routeConfig?.path ?? "").includes("ejecucion");

  readonly displayedColumns = ["titulo", "primerAutor", "fechaInicio", "codigo"];
  readonly displayedColumns2 = ["nombre"];
  readonly table = new ListTable<AdminProjectListItem>({
    search: (row) => [row.title, row.startDateLabel, row.code, ...row.members.map((member) => member.name)],
    sort: {
      titulo: (row) => row.title,
      primerAutor: (row) => row.members[0]?.name ?? "",
      fechaInicio: (row) => row.startDate,
      codigo: (row) => row.code,
    },
  });
  selectedTab = this.tabState.projectTab();

  private readonly paginator = viewChild.required(MatPaginator);
  private readonly matSort = viewChild.required(MatSort);

  private readonly fundingSearch = signal("");
  readonly filteredFundingSources = computed(() => {
    const search = this.fundingSearch();
    return this.lookup.fundingSources().filter((source) => source.name.toLowerCase().includes(search));
  });

  constructor() {
    this.projectService
      .listAdminProjects()
      .subscribe((rows) => this.table.show(rows.filter((item) => isOngoing(item.statusCode) === this.ongoing)));
  }

  ngAfterViewInit(): void {
    this.table.attach(this.matSort(), this.paginator());
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
