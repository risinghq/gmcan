import { type AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
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
import { ActivatedRoute, Router } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { PersonComponent } from "@app/shared/components/person.component";
import { PublishabilityDialogComponent } from "@app/shared/member-publishability/dialog.component";
import { countMissingRequirements } from "@app/shared/member-publishability/utils";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import { MemberService } from "@app/shared/services/member.service";
import { ListTable } from "@app/shared/tables/list-table";

@Component({
  selector: "app-miembros",
  templateUrl: "./miembros.component.html",
  styleUrl: "./miembros.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PersonComponent,
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
export default class MiembrosComponent implements AfterViewInit {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  /** The same component lists former members on the other route. */
  private readonly active = (inject(ActivatedRoute).snapshot.routeConfig?.path ?? "").includes("activos");
  readonly canAdd = this.active;

  readonly displayedColumns = ["name", "memberTypeName", "prefixName", "publishability"];
  readonly table = new ListTable<AdminMemberListItem>({
    search: (row) => [row.firstName, row.lastName, row.maternalName, row.memberTypeName, row.prefixName, row.email],
    sort: { name: (row) => this.fullName(row) },
  });
  private readonly paginator = viewChild.required(MatPaginator);
  private readonly matSort = viewChild.required(MatSort);

  constructor() {
    const isActive = this.active ? 1 : 0;
    this.memberService
      .listAdminMembers()
      .subscribe((rows) => this.table.show(rows.filter((member) => member.isActive === isActive)));
  }

  ngAfterViewInit(): void {
    this.table.attach(this.matSort(), this.paginator());
  }

  addMember(): void {
    this.router.navigate(["dashboard/add-member"]);
  }

  editMember(id: number): void {
    const returnTo = this.active ? "miembros-activos" : "miembros-antiguos";
    this.router.navigate(["dashboard/edit-member/" + id], { queryParams: { returnTo } });
  }

  fullName(row: AdminMemberListItem): string {
    return [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" ");
  }

  missingCount(row: AdminMemberListItem): number {
    return countMissingRequirements(row.publishability);
  }

  openPublishability(row: AdminMemberListItem, event: Event): void {
    event.stopPropagation();
    this.dialog.open(PublishabilityDialogComponent, {
      width: "560px",
      data: {
        memberName: `${row.firstName} ${row.lastName}`.trim(),
        publishability: row.publishability,
      },
    });
  }
}
