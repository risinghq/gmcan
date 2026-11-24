import { CdkScrollable } from "@angular/cdk/scrolling";
import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, Validators, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { buildThesisPayload } from "@app/dashboard/publications/flow/publication-payload";
import type { AuthorSearchResult, SaveAuthorEntry } from "@app/shared/models/author";
import { DialogData } from "@app/shared/models/dialogdata";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { resolveReturnTo } from "@app/shared/routing/return-to";
import { AssetService } from "@app/shared/services/asset.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { parseLocalDate } from "@app/shared/utils/date";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

interface AuthorFormRow {
  id: number;
  name: string;
  memberId: number | null;
  myControl: FormControl<string>;
  filteredOptions?: Observable<AuthorSearchResult[]>;
}

interface ThesisDraft {
  id: number;
  title: string;
  abstract: string;
  publishedAt: string;
  universityId: number | null;
  thesisKindCode: "phd" | "masters" | null;
  asset: string | null;
}

@Component({
  selector: "app-edit-tesis",
  templateUrl: "../add-tesis/add-tesis.component.html",
  styleUrl: "../add-tesis/add-tesis.component.scss",
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
export default class EditTesisComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private readonly assets = inject(AssetService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicationService = inject(PublicationService);
  lookup = inject(LookupService);
  dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  publicacion: ThesisDraft;
  publishedAtObj?: Date;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  url: string;
  edit = true;
  private loadedPublication: PublicPublicationWithAuthors;

  options: AuthorSearchResult[] = [];
  otrosAutores: AuthorFormRow[] = [];
  fileData: File | null = null;

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      publishedAt: ["", [Validators.required]],
      universityId: ["", [Validators.required]],
      thesisKindCode: ["", [Validators.required]],
      abstract: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    const loaded = this.route.snapshot.data["publication"] as PublicPublicationWithAuthors;
    this.loadedPublication = loaded;
    this.publicacion = {
      id: loaded.id,
      title: loaded.title,
      abstract: loaded.abstract ?? "",
      publishedAt: loaded.publishedAt,
      universityId: loaded.subtype.kindCode === "thesis" ? loaded.subtype.thesis.universityId : null,
      thesisKindCode: loaded.subtype.kindCode === "thesis" ? loaded.subtype.thesis.thesisKindCode : null,
      asset: loaded.asset?.inline ?? null,
    };
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  ngOnInit(): void {
    this.bindPublication(this.loadedPublication);
  }

  private bindPublication(pub: PublicPublicationWithAuthors): void {
    const publishedAt = parseLocalDate(pub.publishedAt);
    if (publishedAt) {
      this.publishedAtObj = publishedAt;
    }

    this.options = this.route.snapshot.data["authorOptions"] as AuthorSearchResult[];
    const sorted = pub.authors.toSorted((a, b) => a.authorOrder - b.authorOrder);
    this.otrosAutores = sorted.map((a, i) => {
      const row: AuthorFormRow = {
        id: i + 1,
        name: a.name,
        memberId: a.kind === "registered" ? a.memberId : null,
        myControl: new FormControl<string>(a.name, { nonNullable: true }),
      };
      row.filteredOptions = row.myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterAuthors(v)),
      );
      return row;
    });

    if (this.otrosAutores.length === 0) {
      this.otrosAutores = [this.newCoAuthorRow()];
      this.setupFilters();
    }
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

  private setupFilters(): void {
    for (const row of this.otrosAutores) {
      row.filteredOptions = row.myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterAuthors(v)),
      );
    }
  }

  selectUserAutor(evento: AuthorSearchResult | { value: string }, value: number, i: number): void {
    if (value === 1) {
      const author = evento as AuthorSearchResult;
      this.otrosAutores[i].memberId = author.id;
      this.otrosAutores[i].name = author.name;
      this.otrosAutores[i].myControl.setValue(author.name);
    } else {
      const name = (evento as { value: string }).value;
      const author = this.options.find((o) => o.name === name) ?? null;
      this.otrosAutores[i].memberId = author?.id ?? null;
      this.otrosAutores[i].name = author?.name ?? name;
    }
  }

  addAnotherAuthor(): void {
    const row = this.newCoAuthorRow();
    row.filteredOptions = row.myControl.valueChanges.pipe(
      startWith(""),
      map((v) => this.filterAuthors(v)),
    );
    this.otrosAutores.push(row);
  }

  removeAnotherAuthor(i: number): void {
    if (this.otrosAutores.length === 1) {
      this.otrosAutores[0] = this.newCoAuthorRow();
      this.otrosAutores[0].filteredOptions = this.otrosAutores[0].myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterAuthors(v)),
      );
    } else {
      this.otrosAutores.splice(i, 1);
    }
  }

  submitArticle(): void {
    if (!this.publicacionForm.valid) return;

    if (!this.publicacion.universityId || !this.publicacion.thesisKindCode) return;
    const data = buildThesisPayload({
      title: this.publicacion.title,
      abstract: this.publicacion.abstract ?? undefined,
      publishedAt: this.publishedAtObj,
      universityId: this.publicacion.universityId,
      thesisKindCode: this.publicacion.thesisKindCode,
    });

    this.publicationService.updatePublication(this.publicacion.id, data, this.buildSaveList()).subscribe((response) => {
      if (response.status === 1) {
        if (this.fileData) {
          this.assets
            .put({ ownerType: "publication", ownerId: this.publicacion.id, slot: "file" }, this.fileData)
            .subscribe();
        }
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Tesis actualizada exitosamente");
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    return this.otrosAutores
      .filter((row) => !!row.name)
      .map((row, i) => {
        const matchedAuthor = this.options.find((o) => o.name === row.name);
        const memberId = row.memberId ?? matchedAuthor?.id ?? null;
        if (memberId) {
          return { kind: "registered" as const, memberId, authorOrder: i };
        }
        return { kind: "external" as const, externalName: row.name, authorOrder: i };
      });
  }

  erasePublicacion(): void {
    this.publicationService.deletePublication(this.publicacion.id).subscribe((response) => {
      if (response.status === 1) {
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Tesis eliminada exitosamente");
      }
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase7>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase7, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar tesis",
        text: "¿Estás seguro que deseas eliminar esta tesis?",
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
    const returnTo = resolveReturnTo(this.route, ["tesis", "my-thesis"], "my-thesis");
    this.router.navigate(["dashboard/" + returnTo]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  fileProgress(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    this.fileData = input.files?.[0] ?? null;
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase7 {
  dialogRef = inject<MatDialogRef<DialogErase7>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
