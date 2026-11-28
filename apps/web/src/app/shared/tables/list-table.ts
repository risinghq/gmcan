import { signal } from "@angular/core";
import type { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import type { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

/** The smallest page a dashboard table offers, so a list no longer than this never needs a paginator. */
export const PAGE_SIZE = 10;

export const PAGINATOR_DEFAULTS: MatPaginatorDefaultOptions = {
  pageSize: PAGE_SIZE,
  pageSizeOptions: [PAGE_SIZE, 25, 100],
};

/** The value a sortable column orders its rows by, keyed by the column's `matColumnDef` name. */
export type SortValues<T> = Record<string, (row: T) => string | number>;

export interface ListTableOptions<T> {
  /** Without it the data source filters on every field. */
  search?: (row: T) => (string | null | undefined)[];
  /** Columns whose name is not a row field, or whose shown text sorts wrong, such as a date label. */
  sort?: SortValues<T>;
}

/**
 * The data source lives as long as the table, so the sort and paginator the view attaches stay
 * connected when rows arrive.
 */
export class ListTable<T> {
  readonly dataSource = new MatTableDataSource<T>([]);
  readonly notFound = signal(false);
  readonly paged = signal(false);
  readonly searching = signal(false);

  constructor({ search, sort }: ListTableOptions<T> = {}) {
    if (search) {
      this.dataSource.filterPredicate = (row, filter) =>
        search(row).some((text) => (text ?? "").toLowerCase().includes(filter));
    }
    if (sort) {
      const byField = this.dataSource.sortingDataAccessor;
      this.dataSource.sortingDataAccessor = (row, column) => {
        const value = sort[column]?.(row) ?? byField(row, column);
        return typeof value === "string" ? value.toLowerCase() : value;
      };
    }
  }

  show(rows: T[]): void {
    this.dataSource.data = rows;
    this.count();
  }

  attach(sort: MatSort, paginator: MatPaginator): void {
    this.dataSource.sort = sort;
    this.dataSource.paginator = paginator;
  }

  filter(text: string): void {
    this.dataSource.filter = text.trim().toLowerCase();
    this.searching.set(this.dataSource.filter !== "");
    this.dataSource.paginator?.firstPage();
    this.count();
  }

  private count(): void {
    const matches = this.dataSource.filteredData.length;
    this.notFound.set(matches === 0);
    this.paged.set(matches > PAGE_SIZE);
  }

  filterFrom(event: Event): void {
    this.filter((event.target as HTMLInputElement).value);
  }
}

/** Sorts a reference list, such as journals or universities, whose one column is `nombre`. */
export const byName: SortValues<{ name: string }> = { nombre: (row) => row.name };
