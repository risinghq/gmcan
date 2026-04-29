import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { AuthorSearchResult, SaveAuthorEntry } from "@app/shared/models/author";
import { createPublication } from "@app/shared/models/factories";
import type { Publication } from "@app/shared/models/publication";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
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

@Component({
  selector: "app-add-article",
  templateUrl: "./add-article.component.html",
  styleUrl: "./add-article.component.scss",
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
export default class AddArticleComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _publicationService = inject(PublicationService);
  private _memberService = inject(MemberService);
  lookup = inject(LookupService);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  publicacion: Publication;
  publishedAtObj?: Date;
  public publicacionForm: FormGroup;
  button_text = "Guardar artículo";
  url: string;
  edit = false;

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
      abstractES: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      abstractEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = createPublication();
    this.publicacion.typeId = 1;
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  openEraser(): void {}

  ngOnInit(): void {
    this._memberService.searchAuthors("").subscribe((authors) => {
      this.options = authors;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this.filterAuthors(value)),
      );
      this.otrosAutores = [this.newCoAuthorRow()];
      this.setupCoAuthorFilters();
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
      title: this.publicacion.title,
      abstractES: this.publicacion.abstractES ?? undefined,
      abstractEN: this.publicacion.abstractEN ?? undefined,
      doi: this.publicacion.doi ?? undefined,
      publishedAt,
      journalIssue: this.publicacion.journalIssue ?? undefined,
      typeId: 1,
      journalId: this.publicacion.journalId ?? undefined,
    };

    this._publicationService.createPublication(data, this.buildSaveList()).subscribe((result) => {
      if (result.id != null) {
        if (this.fileData) {
          this._publicationService.uploadFile(result.id, this.fileData).subscribe(() => {});
        }
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Publicación agregada exitosamente");
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    const entries: SaveAuthorEntry[] = [];

    const resolvedPrincipal = this.principalAuthor?.name === this.selectedUser ? this.principalAuthor : null;
    if (resolvedPrincipal?.id) {
      entries.push({ kind: "registered", memberId: resolvedPrincipal.id, isPrincipal: 0 });
    } else {
      entries.push({ kind: "external", externalName: this.selectedUser, isPrincipal: 0 });
    }

    this.otrosAutores.forEach((row, i) => {
      if (!row.name) return;
      const matchedAuthor = this.options.find((o) => o.name === row.name);
      const memberId = row.memberId ?? matchedAuthor?.id ?? null;
      if (memberId) {
        entries.push({ kind: "registered", memberId, isPrincipal: i + 1 });
      } else {
        entries.push({ kind: "external", externalName: row.name, isPrincipal: i + 1 });
      }
    });

    return entries;
  }

  return(): void {
    this._router.navigate(["dashboard/" + localStorage.getItem("article-back")]);
  }

  openSnackBar(msg = "Publicación agregada exitosamente"): void {
    this._snackBar.open(msg, undefined, {
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
