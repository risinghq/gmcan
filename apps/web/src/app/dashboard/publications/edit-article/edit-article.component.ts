import { CdkScrollable } from "@angular/cdk/scrolling";
import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
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
import type { AuthorSearchResult, SaveAuthorEntry } from "@app/shared/models/author";
import { DialogData } from "@app/shared/models/dialogdata";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { resolveReturnTo } from "@app/shared/routing/return-to";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { parseLocalDate } from "@app/shared/utils/date";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

interface AuthorFormRow {
  id: number;
  name: string;
  memberId: number | null;
  myControl: FormControl<string>;
  filteredOptions?: Observable<AuthorSearchResult[]>;
}

interface ArticleDraft {
  title: string;
  abstract: string;
  doi: string;
  journalId: number | null;
  journalIssue: number | null;
}

@Component({
  selector: "app-edit-article",
  templateUrl: "../add-article/add-article.component.html",
  styleUrl: "../add-article/add-article.component.scss",
  providers: [provideNativeDateAdapter()],
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatAutocompleteTrigger,
    MatAutocomplete,
    AutosizeModule,
    AsyncPipe,
  ],
})
export default class EditArticleComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicationService = inject(PublicationService);
  private readonly memberService = inject(MemberService);
  lookup = inject(LookupService);
  dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  publicacion: PublicPublicationWithAuthors;
  draft: ArticleDraft;
  publishedAtObj?: Date;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  url: string;
  edit = true;

  selectedUser = "";
  principalAuthor: AuthorSearchResult | null = null;
  myControl = new FormControl<string>("", { nonNullable: true });
  options: AuthorSearchResult[] = [];
  filteredOptions!: Observable<AuthorSearchResult[]>;
  otrosAutores: AuthorFormRow[] = [];
  fileData: File | null = null;

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      publishedAt: ["", [Validators.required]],
      journalId: ["", [Validators.required]],
      journalIssue: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      doi: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      abstract: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = this.route.snapshot.data["publication"] as PublicPublicationWithAuthors;
    this.draft = { title: "", abstract: "", doi: "", journalId: null, journalIssue: null };
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  ngOnInit(): void {
    this.bindPublication(this.publicacion);
  }

  private bindPublication(pub: PublicPublicationWithAuthors): void {
    this.publicacion = pub;
    this.draft = {
      title: pub.title,
      abstract: pub.abstract ?? "",
      doi: pub.doi ?? "",
      journalId: pub.subtype.kindCode === "journal_article" ? (pub.subtype.journalArticle.journalId ?? null) : null,
      journalIssue: pub.subtype.kindCode === "journal_article" ? (pub.subtype.journalArticle.issue ?? null) : null,
    };
    const publishedAt = parseLocalDate(pub.publishedAt);
    if (publishedAt) {
      this.publishedAtObj = publishedAt;
    }

    this.memberService.searchAuthors("").subscribe((allAuthors) => {
      this.options = allAuthors;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this.filterAuthors(value)),
      );

      const principal = pub.authors.find((a) => a.authorOrder === 0);
      if (principal) {
        this.selectedUser = principal.name;
        this.principalAuthor =
          principal.kind === "registered" && principal.memberId
            ? { id: principal.memberId, name: principal.name, asset: principal.asset ?? null }
            : null;
        this.myControl.setValue(principal.name);
      }

      const coAuthors = pub.authors.filter((a) => a.authorOrder > 0).toSorted((a, b) => a.authorOrder - b.authorOrder);
      this.otrosAutores = coAuthors.map((a, i) => {
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
        map((v) => this.filterAuthors(v)),
      );
    }
  }

  selectUser(evento: AuthorSearchResult | { value: string }, value: number): void {
    if (value === 1) {
      const author = evento as AuthorSearchResult;
      this.myControl.setValue(author.name);
      this.selectedUser = author.name;
      this.principalAuthor = author;
    } else {
      const name = (evento as { value: string }).value;
      this.selectedUser = name;
      this.principalAuthor = this.options.find((o) => o.name === name) ?? null;
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
    if (!this.publicacionForm.valid || !this.selectedUser) return;

    const publishedAt = this.publishedAtObj ? new Date(this.publishedAtObj).toLocaleDateString("sv") : "";

    const data = {
      doi: this.draft.doi ?? undefined,
      publishedAt: publishedAt,
      subtype: {
        kindCode: "journal_article" as const,
        journalArticle: {
          journalId: this.draft.journalId ?? undefined,
          issue: this.draft.journalIssue ?? undefined,
        },
      },
      translations: {
        es: {
          title: this.draft.title,
          abstract: this.draft.abstract ?? undefined,
        },
      },
    };

    this.publicationService.updatePublication(this.publicacion.id, data, this.buildSaveList()).subscribe((response) => {
      if (response.status === 1) {
        if (this.fileData) {
          this.publicationService.uploadAsset(this.publicacion.id, this.fileData).subscribe();
        }
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Artículo actualizado exitosamente");
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    const entries: SaveAuthorEntry[] = [];

    const resolvedPrincipal = this.principalAuthor?.name === this.selectedUser ? this.principalAuthor : null;
    if (resolvedPrincipal?.id) {
      entries.push({ kind: "registered", memberId: resolvedPrincipal.id, authorOrder: 0 });
    } else {
      entries.push({ kind: "external", externalName: this.selectedUser, authorOrder: 0 });
    }

    this.otrosAutores.forEach((row, i) => {
      if (!row.name) return;
      const matchedAuthor = this.options.find((o) => o.name === row.name);
      const memberId = row.memberId ?? matchedAuthor?.id ?? null;
      if (memberId) {
        entries.push({ kind: "registered", memberId, authorOrder: i + 1 });
      } else {
        entries.push({ kind: "external", externalName: row.name, authorOrder: i + 1 });
      }
    });

    return entries;
  }

  erasePublicacion(): void {
    this.publicationService.deletePublication(this.publicacion.id).subscribe((response) => {
      if (response.status === 1) {
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Artículo eliminado exitosamente");
      }
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase6>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase6, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar artículo",
        text: "¿Estás seguro que deseas eliminar este artículo?",
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
    const returnTo = resolveReturnTo(this.route, ["articulos", "my-articles"], "my-articles");
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

  get hasExistingAsset(): boolean {
    return this.publicacion.asset != null;
  }

  get existingAssetLabel(): string | null {
    const download = this.publicacion.asset?.download;
    if (!download) return null;
    try {
      const fileName = new URL(download).pathname.split("/").pop();
      return fileName || "PDF";
    } catch {
      return "PDF";
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase6 {
  dialogRef = inject<MatDialogRef<DialogErase6>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
