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
import { Router } from "@angular/router";
import type { Member } from "@app/shared/models/member";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";

interface MemberRow extends Member {
  memberTypeName?: string;
  prefixName?: string;
}

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
  lookup = inject(LookupService);
  private router = inject(Router);

  displayedColumns: string[] = ["firstName", "lastName", "maternalName", "memberTypeName", "prefixName", "email"];
  miembros: MemberRow[] = [];
  dataSource = new MatTableDataSource<MemberRow>([]);
  url: string;
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.obtainingValue();
  }
  canAdd = false;
  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  obtainingValue(): void {
    if (window.location.href.includes("activos")) {
      localStorage.setItem("active-member", "1");
      this.getMembers(1);
      this.canAdd = true;
    } else {
      localStorage.setItem("active-member", "0");
      this.getMembers(0);
      this.getMembers(3);
    }
  }

  getMembers(status: number): void {
    this.memberService.listAdminMembers({ status }).subscribe((res: Member[]) => {
      if (res.length > 0) {
        const memberTypesById = new Map(this.lookup.memberTypes().map((type) => [type.id, type.nameSingular]));
        const prefixesById = new Map(this.lookup.prefijos().map((prefix) => [prefix.idPrefijo, prefix.nombre]));
        const sorted = res.toSorted((a, b) => a.lastName.localeCompare(b.lastName));
        for (const m of sorted) {
          const row: MemberRow = { ...m };
          const memberTypeName = memberTypesById.get(m.memberTypeId);
          if (memberTypeName) row.memberTypeName = memberTypeName;
          if (m.prefixId != null) {
            const prefixName = prefixesById.get(m.prefixId);
            if (prefixName) row.prefixName = prefixName;
          }
          this.miembros.push(row);
        }
        this.dataSource = new MatTableDataSource(this.miembros);
        this.dataSource.paginator = this.paginator();
        this.dataSource.sort = this.matSort();
      }
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
    this.router.navigate(["dashboard/edit-member/" + id]);
  }
}
