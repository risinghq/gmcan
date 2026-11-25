import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

/** One content list row: what the table shows, filters on and links from. */
export interface ContentRow {
  id: number;
  name: string;
}

/** One searchable content list and the routes that add to it and edit its rows. */
export class ContentTable {
  readonly dataSource = new MatTableDataSource<ContentRow>([]);
  notFound = false;

  constructor(
    readonly addRoute: string,
    readonly editRoute: string,
  ) {}

  /** Fills the table in place, so the sort and paginator attached by the view stay connected. */
  show(rows: ContentRow[]): void {
    this.dataSource.data = rows.toSorted((a, b) => a.name.localeCompare(b.name));
  }

  attach(sort: MatSort, paginator: MatPaginator): void {
    this.dataSource.sort = sort;
    this.dataSource.paginator = paginator;
  }

  filter(text: string): void {
    this.dataSource.filter = text.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
    this.notFound = this.dataSource.filteredData.length === 0;
  }
}
