import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

/** One content list row: what the table shows, filters on and links from. */
export interface ContentRow {
  id: number;
  name: string;
}

export function makeDataSource(rows: ContentRow[]): MatTableDataSource<ContentRow> {
  return new MatTableDataSource(rows.toSorted((a, b) => a.name.localeCompare(b.name)));
}

export function attachTable<T>(dataSource: MatTableDataSource<T>, sort: MatSort, paginator: MatPaginator): void {
  dataSource.sort = sort;
  dataSource.paginator = paginator;
}

export function applyTableFilter<T>(event: Event, dataSource: MatTableDataSource<T>): boolean {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  dataSource.filter = filterValue;
  dataSource.paginator?.firstPage();
  return dataSource.filteredData.length === 0;
}
