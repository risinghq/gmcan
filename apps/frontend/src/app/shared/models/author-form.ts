import type { FormControl } from "@angular/forms";
import type { Observable } from "rxjs";

import type { AuthorOption } from "./author";

/** Form row for a co-author slot in add/edit publication forms */
export type AuthorFormRow = {
  id: number;
  nombre: string; // [(ngModel)] target + *ngIf visibility check
  option: AuthorOption | null; // resolved from autocomplete; null = typed manually
  myControl: FormControl<string>;
  filteredOptions?: Observable<AuthorOption[]>;
};
