import { CdkScrollable } from "@angular/cdk/scrolling";
import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { buildResumenPayload } from "@app/dashboard/publications/flow/publication-payload";
import type { AuthorEntry, SaveAuthorEntry } from "@app/shared/models/author";
import { DialogData } from "@app/shared/models/dialogdata";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { resolveReturnTo } from "@app/shared/routing/return-to";
import type { EventItem } from "@app/shared/services/event.service";
import { EventService } from "@app/shared/services/event.service";
import { GLOBAL } from "@app/shared/services/global";
import { MemberService } from "@app/shared/services/member.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { requireLocalDate } from "@app/shared/utils/date";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

interface AuthorSearchResult {
  id: number;
  name: string;
  photoUrl: string;
  photoAlt: string;
}

interface AuthorFormRow {
  id: number;
  name: string;
  memberId: number | null;
  myControl: FormControl<string>;
  filteredOptions?: Observable<AuthorSearchResult[]>;
}

interface ResumenDraft {
  id: number;
  title: string;
  abstract: string;
  doi: string;
  publishedAtDate: Date;
  eventId: number | null;
}

@Component({
  selector: "app-edit-resumen",
  templateUrl: "../add-resumen/add-resumen.component.html",
  styleUrl: "../add-resumen/add-resumen.component.scss",
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatAutocompleteTrigger,
    MatAutocomplete,
    AutosizeModule,
    AsyncPipe,
  ],
})
export default class EditResumenComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private publicationService = inject(PublicationService);
  private memberService = inject(MemberService);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private eventService = inject(EventService);

  publicacion: ResumenDraft;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  eventos: EventItem[] = [];
  url = GLOBAL.url;
  edit = true;

  selectedUser: string | null = null;
  principalMemberId: number | null = null;
  myControl = new FormControl<string>("");
  options: AuthorSearchResult[] = [];
  filteredOptions!: Observable<AuthorSearchResult[]>;

  otrosAutores: AuthorFormRow[] = [];

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      title: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      publishedAtDate: ["", [Validators.required]],
      eventId: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      doi: [""],
      abstract: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = {
      id: 0,
      title: "",
      abstract: "",
      doi: "",
      publishedAtDate: new Date(),
      eventId: null,
    };
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  ngOnInit(): void {
    this.bindResumen(this.route.snapshot.data["publication"] as PublicPublicationWithAuthors);
  }

  private bindResumen(result: PublicPublicationWithAuthors): void {
    this.publicacion = {
      id: result.id,
      title: result.title,
      abstract: result.abstract ?? "",
      doi: result.doi ?? "",
      publishedAtDate: requireLocalDate(result.publishedAt, "publication.publishedAt"),
      eventId: result.subtype.kindCode === "conference_paper" ? result.subtype.conferencePaper.eventId : null,
    };
    this.getEventos(result.authors);
  }

  getEventos(authors: AuthorEntry[]): void {
    this.eventService.listAdmin().subscribe((result: EventItem[]) => {
      if (result) {
        this.eventos = result;
        this.loadAuthors(authors);
      }
    });
  }

  loadAuthors(existingAuthors: AuthorEntry[]): void {
    this.memberService.searchAuthors("").subscribe((allAuthors) => {
      this.options = allAuthors as AuthorSearchResult[];
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this.filterAuthors(value ?? "")),
      );

      const principal = existingAuthors.find((a) => a.authorOrder === 0);
      if (principal) {
        this.selectedUser = principal.name;
        this.principalMemberId = principal.kind === "registered" ? (principal.memberId ?? null) : null;
        this.myControl.setValue(principal.name);
      }

      const coAuthors = existingAuthors
        .filter((a) => a.authorOrder > 0)
        .toSorted((a, b) => a.authorOrder - b.authorOrder);
      this.otrosAutores = coAuthors.map((a, i) => {
        const row: AuthorFormRow = {
          id: i + 1,
          name: a.name,
          memberId: a.kind === "registered" ? (a.memberId ?? null) : null,
          myControl: new FormControl<string>(a.name, { nonNullable: true }),
        };
        row.filteredOptions = row.myControl.valueChanges.pipe(
          startWith(""),
          map((v) => this.filterAuthors(v ?? "")),
        );
        return row;
      });

      if (this.otrosAutores.length === 0) {
        this.otrosAutores = [this.newCoAuthorRow()];
        this.setupCoAuthorFilters();
      }
    });
  }

  private filterAuthors(value: string): AuthorSearchResult[] {
    const lower = value.toLowerCase();
    return this.options.filter((o) => o.name.toLowerCase().includes(lower));
  }

  private newCoAuthorRow(): AuthorFormRow {
    return {
      id: this.otrosAutores.length + 1,
      name: "",
      memberId: null,
      myControl: new FormControl<string>("", { nonNullable: true }),
    };
  }

  private setupCoAuthorFilters(): void {
    for (const row of this.otrosAutores) {
      row.filteredOptions = row.myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterAuthors(v ?? "")),
      );
    }
  }

  selectUser(author: AuthorSearchResult | { value: string }, value: number): void {
    if (value === 1) {
      const a = author as AuthorSearchResult;
      this.myControl.setValue(a.name);
      this.selectedUser = a.name;
      this.principalMemberId = a.id;
    } else {
      const name = (author as { value: string }).value;
      const found = this.options.find((o) => o.name === name) ?? null;
      this.selectedUser = name;
      this.principalMemberId = found?.id ?? null;
    }
  }

  selectUserAutor(author: AuthorSearchResult | { value: string }, value: number, i: number): void {
    if (value === 1) {
      const a = author as AuthorSearchResult;
      this.otrosAutores[i].memberId = a.id;
      this.otrosAutores[i].name = a.name;
      this.otrosAutores[i].myControl.setValue(a.name);
    } else {
      const name = (author as { value: string }).value;
      const found = this.options.find((o) => o.name === name) ?? null;
      this.otrosAutores[i].memberId = found?.id ?? null;
      this.otrosAutores[i].name = name;
    }
  }

  addAnotherAuthor(): void {
    const row = this.newCoAuthorRow();
    row.filteredOptions = row.myControl.valueChanges.pipe(
      startWith(""),
      map((v) => this.filterAuthors(v ?? "")),
    );
    this.otrosAutores.push(row);
  }

  removeAnotherAuthor(i: number): void {
    if (this.otrosAutores.length === 1) {
      this.otrosAutores[0] = this.newCoAuthorRow();
      this.otrosAutores[0].filteredOptions = this.otrosAutores[0].myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterAuthors(v ?? "")),
      );
    } else {
      this.otrosAutores.splice(i, 1);
    }
  }

  submitArticle(): void {
    if (!this.publicacionForm.valid || !this.selectedUser) return;

    if (!this.publicacion.eventId) return;
    const data = buildResumenPayload({
      title: this.publicacion.title,
      abstract: this.publicacion.abstract,
      doi: this.publicacion.doi || undefined,
      publishedAt: this.publicacion.publishedAtDate,
      eventId: this.publicacion.eventId,
    });

    this.publicationService.updatePublication(this.publicacion.id, data, this.buildSaveList()).subscribe((result) => {
      if (result.status === 1) {
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Resumen actualizado exitosamente");
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    const entries: SaveAuthorEntry[] = [];

    if (this.principalMemberId) {
      entries.push({ kind: "registered", memberId: this.principalMemberId, authorOrder: 0 });
    } else if (this.selectedUser) {
      entries.push({ kind: "external", externalName: this.selectedUser, authorOrder: 0 });
    }

    this.otrosAutores.forEach((row, i) => {
      if (!row.name) return;
      if (row.memberId) {
        entries.push({ kind: "registered", memberId: row.memberId, authorOrder: i + 1 });
      } else {
        entries.push({ kind: "external", externalName: row.name, authorOrder: i + 1 });
      }
    });

    return entries;
  }

  erasePublicacion(): void {
    this.publicationService.deletePublication(this.publicacion.id).subscribe((result) => {
      if (result.status === 1) {
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Resumen eliminado exitosamente");
      }
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase8>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase8, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar resumen",
        text: "¿Estás seguro que deseas eliminar este resumen?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.erasePublicacion();
      }
    });
  }

  return(): void {
    const returnTo = resolveReturnTo(this.route, ["eventos", "my-abstracts"], "my-abstracts");
    this.router.navigate(["dashboard/" + returnTo]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase8 {
  dialogRef = inject<MatDialogRef<DialogErase8>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
