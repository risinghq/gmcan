import { ListTable, byName } from "@app/shared/tables/list-table";

export interface ContentRow {
  id: number;
  name: string;
}

export class ContentTable extends ListTable<ContentRow> {
  constructor(
    readonly addRoute: string,
    readonly editRoute: string,
  ) {
    super({ sort: byName });
  }

  override show(rows: ContentRow[]): void {
    super.show(rows.toSorted((a, b) => a.name.localeCompare(b.name)));
  }
}
