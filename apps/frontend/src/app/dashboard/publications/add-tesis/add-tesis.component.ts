import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import {
  attachFilter,
  buildCoAuthorSaveList,
  type AuthorFormRow,
  newAuthorRow,
} from "@app/dashboard/publications/flow/authors";
import { buildThesisPayload } from "@app/dashboard/publications/flow/publication-payload";
import type { AuthorSearchResult, SaveAuthorEntry } from "@app/shared/models/author";
import { createPublication } from "@app/shared/models/factories";
import type { Publication } from "@app/shared/models/publication";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { resolveReturnTo } from "@app/shared/routing/return-to";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-add-tesis",
  templateUrl: "./add-tesis.component.html",
  styleUrl: "./add-tesis.component.scss",
  providers: [provideNativeDateAdapter()],
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
export default class AddTesisComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicationService = inject(PublicationService);
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  publicacion: Publication;
  publishedAtObj?: Date;
  public publicacionForm: FormGroup;
  button_text = "Guardar tesis";
  url: string;
  edit = false;

  options: AuthorSearchResult[] = [];
  otrosAutores: AuthorFormRow[] = [];
  fileData: File | null = null;

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      publishedAt: ["", [Validators.required]],
      universityId: ["", [Validators.required]],
      thesisTypeId: ["", [Validators.required]],
      abstractES: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      abstractEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.publicacion = createPublication();
    this.publicacion.typeId = 2;
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  openEraser(): void {}

  ngOnInit(): void {
    this.memberService.searchAuthors("").subscribe((authors) => {
      this.options = authors;
      this.otrosAutores = [attachFilter(newAuthorRow(1), this.options)];
    });
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
    if (!this.publicacionForm.valid || !this.otrosAutores[0]?.name) return;

    const data = buildThesisPayload({
      title: this.publicacion.title,
      abstractES: this.publicacion.abstractES ?? undefined,
      abstractEN: this.publicacion.abstractEN ?? undefined,
      publishedAt: this.publishedAtObj,
      universityId: this.publicacion.universityId ?? undefined,
      thesisTypeId: this.publicacion.thesisTypeId ?? undefined,
    });

    this.publicationService.createPublication(data, this.buildSaveList()).subscribe((result) => {
      if (result.id != null) {
        if (this.fileData) {
          this.publicationService.uploadFile(result.id, this.fileData).subscribe();
        }
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar("Tesis agregada exitosamente");
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    return buildCoAuthorSaveList(this.otrosAutores, this.options, 0);
  }

  return(): void {
    const returnTo = resolveReturnTo(this.route, ["tesis", "my-thesis"], "my-thesis");
    this.router.navigate(["dashboard/" + returnTo]);
  }

  openSnackBar(msg = "Tesis agregada exitosamente"): void {
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
