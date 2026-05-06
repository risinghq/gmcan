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
import { ActivatedRoute, Router } from "@angular/router";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import { MemberService } from "@app/shared/services/member.service";

@Component({
  selector: "app-miembros",
  templateUrl: "./miembros.component.html",
  styleUrl: "./miembros.component.scss",
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
export default class MiembrosComponent implements OnInit {
  private memberService = inject(MemberService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  displayedColumns: string[] = [
    "firstName",
    "lastName",
    "maternalName",
    "memberTypeName",
    "prefixName",
    "email",
    "publishability",
  ];
  items: AdminMemberListItem[] = [];
  dataSource = new MatTableDataSource<AdminMemberListItem>([]);

  ngOnInit(): void {
    this.loadListByMode();
  }
  canAdd = false;
  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  loadListByMode(): void {
    const isActiveMode = (this.route.snapshot.routeConfig?.path ?? "").includes("activos");
    this.canAdd = isActiveMode;
    this.loadList(isActiveMode);
  }

  loadList(isActiveMode: boolean): void {
    this.memberService.listAdminMembers().subscribe((rows) => {
      this.items = isActiveMode
        ? rows.filter((member) => member.status === 1)
        : rows.filter((member) => member.status === 0 || member.status === 3);
      this.dataSource = new MatTableDataSource(this.items);
      this.dataSource.filterPredicate = (row, filter) => {
        const normalized = filter.trim().toLowerCase();
        return (
          row.firstName.toLowerCase().includes(normalized) ||
          row.lastName.toLowerCase().includes(normalized) ||
          (row.maternalName ?? "").toLowerCase().includes(normalized) ||
          (row.memberTypeName ?? "").toLowerCase().includes(normalized) ||
          (row.prefixName ?? "").toLowerCase().includes(normalized) ||
          row.email.toLowerCase().includes(normalized)
        );
      };
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.matSort();
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

  addMember(): void {
    this.router.navigate(["dashboard/add-member"]);
  }

  editMember(id: number): void {
    const returnTo = (this.route.snapshot.routeConfig?.path ?? "").includes("activos")
      ? "miembros-activos"
      : "miembros-antiguos";
    this.router.navigate(["dashboard/edit-member/" + id], { queryParams: { returnTo } });
  }

  missingCount(row: AdminMemberListItem): number {
    if (!row.publishability) return 0;
    return (
      row.publishability.missing.base.length +
      Object.values(row.publishability.missing.translations).reduce((sum, fields) => sum + fields.length, 0)
    );
  }
}
