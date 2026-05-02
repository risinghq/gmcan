import { FormControl } from "@angular/forms";
import type { AuthorSearchResult, SaveAuthorEntry } from "@app/shared/models/author";
import { map, Observable, startWith } from "rxjs";

export interface AuthorFormRow {
  id: number;
  name: string;
  memberId: number | null;
  myControl: FormControl<string>;
  filteredOptions?: Observable<AuthorSearchResult[]>;
}

export function filterAuthors(options: AuthorSearchResult[], value: string): AuthorSearchResult[] {
  const normalized = value.toLowerCase();
  return options.filter((option) => option.name.toLowerCase().includes(normalized));
}

export function newAuthorRow(index: number): AuthorFormRow {
  return {
    id: index,
    name: "",
    memberId: null,
    myControl: new FormControl<string>("", { nonNullable: true }),
  };
}

export function attachFilter(row: AuthorFormRow, options: AuthorSearchResult[]): AuthorFormRow {
  row.filteredOptions = row.myControl.valueChanges.pipe(
    startWith(""),
    map((value) => filterAuthors(options, value ?? "")),
  );
  return row;
}

export function buildCoAuthorSaveList(
  rows: AuthorFormRow[],
  options: AuthorSearchResult[],
  startPrincipalIndex = 1,
): SaveAuthorEntry[] {
  const entries: SaveAuthorEntry[] = [];
  rows.forEach((row, index) => {
    if (!row.name) return;
    const matchedAuthor = options.find((option) => option.name === row.name) ?? null;
    const memberId = row.memberId ?? matchedAuthor?.id ?? null;
    if (memberId) {
      entries.push({ kind: "registered", memberId, isPrincipal: startPrincipalIndex + index });
      return;
    }
    entries.push({ kind: "external", externalName: row.name, isPrincipal: startPrincipalIndex + index });
  });
  return entries;
}
