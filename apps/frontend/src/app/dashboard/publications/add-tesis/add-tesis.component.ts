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
import type { AuthorOption, SaveAuthorEntry } from "@app/shared/models/author";
import type { AuthorFormRow } from "@app/shared/models/author-form";
import { createPublicacion } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import { Universidad } from "@app/shared/models/universidad";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoTesisService } from "@app/shared/services/tipotesis.service";
import { UniversidadService } from "@app/shared/services/universidad.service";
import { AutosizeModule } from "ngx-autosize";
import { startWith, map } from "rxjs/operators";

interface TipoTesisItem {
  idTipoTesis?: number;
  nombre?: string;
  nombreEN?: string;
}

@Component({
  selector: "app-add-tesis",
  templateUrl: "./add-tesis.component.html",
  styleUrls: ["./add-tesis.component.scss"],
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
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _publicacionService = inject(PublicacionService);
  private _publicacionAutoresService = inject(PublicacionAutoresService);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _universidadService = inject(UniversidadService);
  private _tipotesisService = inject(TipoTesisService);

  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Guardar tesis";
  universidad: Universidad[] = [];
  url: string;
  tipoTesis: TipoTesisItem[] = [];
  edit = false;

  options: AuthorOption[] = [];
  // All authors (including principal at index 0) go through otrosAutores
  otrosAutores: AuthorFormRow[] = [];

  fileData: File | null = null;

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      universidad_idUniversidad: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      tipoTesis_idTipoTesis: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.publicacion = createPublicacion();
    this.publicacion.tipoPublicacion_idTipoPublicacion = 2;
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  openEraser(): void {}

  ngOnInit(): void {
    this.getUniversidades();
  }

  getUniversidades(): void {
    this._universidadService.getUniversidades().subscribe((result: Universidad[]) => {
      if (result) {
        this.universidad = result;
        this.loadAuthors();
      }
    });
  }

  loadAuthors(): void {
    this._publicacionAutoresService.search().subscribe((authors) => {
      this.options = authors;
      this.otrosAutores = [this.newCoAuthorRow()];
      this.setupCoAuthorFilters();
      this.getTipoTesis();
    });
  }

  getTipoTesis(): void {
    this._tipotesisService.getTiposTesis().subscribe((result: TipoTesisItem[]) => {
      if (result) {
        this.tipoTesis = result;
      }
    });
  }

  private filterAuthors(value: string): AuthorOption[] {
    const lower = value.toLowerCase();
    return this.options.filter((o) => o.nombre.toLowerCase().includes(lower));
  }

  private newCoAuthorRow(): AuthorFormRow {
    return {
      id: this.otrosAutores.length + 1,
      nombre: "",
      option: null,
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

  selectUserAutor(evento: AuthorOption | { value: string }, value: number, i: number): void {
    if (value === 1) {
      const author = evento as AuthorOption;
      this.otrosAutores[i].option = author;
      this.otrosAutores[i].nombre = author.nombre;
      this.otrosAutores[i].myControl.setValue(author.nombre);
    } else {
      const nombre = (evento as { value: string }).value;
      const author = this.options.find((o) => o.nombre === nombre) ?? null;
      this.otrosAutores[i].option = author;
      this.otrosAutores[i].nombre = author?.nombre ?? nombre;
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
    if (!this.publicacionForm.valid || !this.otrosAutores[0]?.nombre) return;

    const momentDate = new Date(this.publicacion.fechaPublicacionDate ?? new Date());
    this.publicacion.fechaPublicacion = new Date(momentDate).toLocaleDateString("sv");

    this._publicacionService.addPublicacion(this.publicacion).subscribe((result: any) => {
      if (result.status === 1 && result.idPublicacion != null) {
        if (this.fileData) {
          this._publicacionService.uploadPublicacionFile(this.fileData, result.idPublicacion).subscribe(() => {});
        }
        this._publicacionAutoresService
          .saveForPublication(result.idPublicacion, this.buildSaveList())
          .subscribe(() => {});
        this.publicacionForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    return this.otrosAutores
      .filter((row) => !!row.nombre)
      .map((row, i) => {
        const opt = row.option?.nombre === row.nombre ? row.option : null;
        if (opt?.kind === "registered" && opt.DNI) {
          return { kind: "registered" as const, DNI: opt.DNI, isPrincipal: i };
        }
        return { kind: "external" as const, nombre: row.nombre, isPrincipal: i };
      });
  }

  return(): void {
    this._router.navigate(["dashboard/" + localStorage.getItem("thesis-back")]);
  }

  openSnackBar(): void {
    this._snackBar.open("Tesis agregada exitosamente", undefined, {
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
