import { describe, expect, it } from "vitest";

import { ListTable, PAGE_SIZE } from "./list-table";

const rows = [{ name: "Ana Torres" }, { name: "Justo Rojas" }];

function names(count: number) {
  return Array.from({ length: count }, (_, index) => ({ name: `Miembro ${index}` }));
}

describe("ListTable", () => {
  it("reports no results when the list arrives empty", () => {
    const table = new ListTable<{ name: string }>();

    table.show([]);

    expect(table.notFound()).toBe(true);
  });

  it("reports no results only while the search matches nothing", () => {
    const table = new ListTable<{ name: string }>({ search: (row) => [row.name] });
    table.show(rows);
    expect(table.notFound()).toBe(false);

    table.filter("zzz");
    expect(table.notFound()).toBe(true);

    table.filter("ana");
    expect(table.notFound()).toBe(false);
    expect(table.dataSource.filteredData).toEqual([rows[0]]);
  });

  it("tells an empty list from a search that matches nothing", () => {
    const table = new ListTable<{ name: string }>({ search: (row) => [row.name] });
    table.show([]);
    expect(table.searching()).toBe(false);

    table.filter("  zzz ");
    expect(table.searching()).toBe(true);

    table.filter("   ");
    expect(table.searching()).toBe(false);
  });

  it("pages only a list longer than one page", () => {
    const table = new ListTable<{ name: string }>({ search: (row) => [row.name] });

    table.show(names(PAGE_SIZE));
    expect(table.paged()).toBe(false);

    table.show(names(PAGE_SIZE + 1));
    expect(table.paged()).toBe(true);

    table.filter("miembro 1");
    expect(table.paged()).toBe(false);
  });

  it("keeps the active search when new rows arrive", () => {
    const table = new ListTable<{ name: string }>({ search: (row) => [row.name] });
    table.filter("zzz");

    table.show(rows);

    expect(table.notFound()).toBe(true);
  });
});
