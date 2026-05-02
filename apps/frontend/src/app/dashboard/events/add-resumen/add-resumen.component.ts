import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { RESUMEN_BACK_FALLBACK } from "@app/dashboard/publications/flow/back-nav";
import { buildResumenPayload } from "@app/dashboard/publications/flow/publication-payload";
import type { AuthorSearchResult, SaveAuthorEntry } from "@app/shared/models/author";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { EventItem } from "@app/shared/services/event.service";
import { EventService } from "@app/shared/services/event.service";
import { MemberService } from "@app/shared/services/member.service";
import { PublicationService, type PublicationFields } from "@app/shared/services/publication.service";
import { SessionService } from "@app/shared/services/session.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

@Component({
  selector: "app-add-resumen",
  templateUrl: "./add-resumen.component.html",
  styleUrl: "./add-resumen.component.scss",
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
export default class AddResumenComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private publicationService = inject(PublicationService);
  private memberService = inject(MemberService);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private eventService = inject(EventService);
  private session = inject(SessionService);

  publicacion: PublicationFields & { publishedAtDate?: Date };
  public publicacionForm: FormGroup;
  button_text = "Guardar resumen";
  eventos: EventItem[] = [];
  edit = false;

  selectedUser: string | null = null;
  principalMemberId: number | null = null;
  myControl = new FormControl<string>("");
  options: AuthorSearchResult[] = [];
  filteredOptions!: Observable<AuthorSearchResult[]>;

  otrosAutores: AuthorFormRow[] = [];

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      evento_idEvento: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      DOI: [""],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = {
      title: "",
      publishedAt: "",
      typeId: 3,
    };
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  openEraser() {}

  ngOnInit(): void {
    this.getEventos();
  }

  getEventos(): void {
    this.eventService.listAdmin().subscribe((result: EventItem[]) => {
      if (result) {
        this.eventos = result;
        this.loadAuthors();
      }
    });
  }

  loadAuthors(): void {
    this.memberService.searchAuthors("").subscribe((authors) => {
      this.options = authors as AuthorSearchResult[];
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => filterAuthors(this.options, value ?? "")),
      );
      this.otrosAutores = [attachFilter(newAuthorRow(1), this.options)];
    });
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

    const data: PublicationFields = buildResumenPayload({
      title: this.publicacion.title,
      abstractES: this.publicacion.abstractES,
      abstractEN: this.publicacion.abstractEN,
      doi: this.publicacion.doi,
      publishedAt: this.publicacion.publishedAtDate,
      eventId: this.publicacion.eventId,
    });

    this.publicationService.createPublication(data, this.buildSaveList()).subscribe((result) => {
      if (result.id) {
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    const entries: SaveAuthorEntry[] = [];

    if (this.principalMemberId) {
      entries.push({ kind: "registered", memberId: this.principalMemberId, isPrincipal: 0 });
    } else if (this.selectedUser) {
      entries.push({ kind: "external", externalName: this.selectedUser, isPrincipal: 0 });
    }
    entries.push(...buildCoAuthorSaveList(this.otrosAutores, this.options, 1));

    return entries;
  }

  return(): void {
    this.router.navigate(["dashboard/" + (this.session.getResumenBack() || RESUMEN_BACK_FALLBACK)]);
  }

  openSnackBar(): void {
    this.snackBar.open("Publicación agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
