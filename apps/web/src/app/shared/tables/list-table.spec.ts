import { describe, expect, it } from "vitest";

import { ListTable } from "./list-table";

const rows = [{ name: "Ana Torres" }, { name: "Justo Rojas" }];

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

  it("keeps the active search when new rows arrive", () => {
    const table = new ListTable<{ name: string }>({ search: (row) => [row.name] });
    table.filter("zzz");

    table.show(rows);

    expect(table.notFound()).toBe(true);
  });
});
