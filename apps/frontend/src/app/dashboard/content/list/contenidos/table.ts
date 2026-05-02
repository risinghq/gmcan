import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

export function makeDataSource<T>(items: T[], getName: (item: T) => string): MatTableDataSource<T> {
  const sorted = items.toSorted((a, b) => getName(a).localeCompare(getName(b)));
  return new MatTableDataSource(sorted);
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
