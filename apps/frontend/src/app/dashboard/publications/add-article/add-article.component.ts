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
import { Router } from "@angular/router";
import {
  attachFilter,
  buildCoAuthorSaveList,
  type AuthorFormRow,
  filterAuthors,
  newAuthorRow,
} from "@app/dashboard/publications/flow/authors";
import { ARTICLE_BACK_KEY, resolveBackTarget } from "@app/dashboard/publications/flow/back-nav";
import { buildArticlePayload } from "@app/dashboard/publications/flow/publication-payload";
import type { AuthorSearchResult } from "@app/shared/models/author";
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
  private router = inject(Router);
  private publicationService = inject(PublicationService);
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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
    this.memberService.searchAuthors("").subscribe((authors) => {
      this.options = authors;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => filterAuthors(this.options, value)),
      );
      this.otrosAutores = [attachFilter(newAuthorRow(1), this.options)];
    });
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
    this.otrosAutores.push(attachFilter(newAuthorRow(this.otrosAutores.length + 1), this.options));
  }

  removeAnotherAuthor(i: number): void {
    if (this.otrosAutores.length === 1) {
      this.otrosAutores[0] = attachFilter(newAuthorRow(1), this.options);
    } else {
      this.otrosAutores.splice(i, 1);
    }
  }

  submitArticle(): void {
    if (!this.publicacionForm.valid || !this.selectedUser) return;

    const data = buildArticlePayload({
      title: this.publicacion.title,
      abstractES: this.publicacion.abstractES ?? undefined,
      abstractEN: this.publicacion.abstractEN ?? undefined,
      doi: this.publicacion.doi ?? undefined,
      publishedAt: this.publishedAtObj,
      journalIssue: this.publicacion.journalIssue ?? undefined,
      journalId: this.publicacion.journalId ?? undefined,
    });

    this.publicationService.createPublication(data, this.buildSaveList()).subscribe((result) => {
      if (result.id != null) {
        if (this.fileData) {
          this.publicationService.uploadFile(result.id, this.fileData).subscribe();
        }
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Publicación agregada exitosamente");
      }
    });
  }

  private buildSaveList() {
    const entries = buildCoAuthorSaveList(this.otrosAutores, this.options, 1);

    const resolvedPrincipal = this.principalAuthor?.name === this.selectedUser ? this.principalAuthor : null;
    if (resolvedPrincipal?.id) {
      return [{ kind: "registered" as const, memberId: resolvedPrincipal.id, isPrincipal: 0 }, ...entries];
    } else {
      return [{ kind: "external" as const, externalName: this.selectedUser, isPrincipal: 0 }, ...entries];
    }
  }

  return(): void {
    this.router.navigate(["dashboard/" + resolveBackTarget(ARTICLE_BACK_KEY, "my-articles")]);
  }

  openSnackBar(msg = "Publicación agregada exitosamente"): void {
    this.snackBar.open(msg, undefined, {
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
