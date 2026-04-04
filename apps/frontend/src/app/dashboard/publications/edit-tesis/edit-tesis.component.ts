import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass, AsyncPipe } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
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
import { ActivatedRoute, Router, Params } from "@angular/router";
import type { AuthorOption, SaveAuthorEntry } from "@app/shared/models/author";
import type { AuthorFormRow } from "@app/shared/models/author-form";
import { DialogData } from "@app/shared/models/dialogdata";
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
  selector: "app-edit-tesis",
  templateUrl: "../add-tesis/add-tesis.component.html",
  styleUrls: ["../add-tesis/add-tesis.component.scss"],
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
    NgClass,
    AsyncPipe,
  ],
})
export default class EditTesisComponent implements OnInit, HasUnsavedChanges {
  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  universidad: Universidad[] = [];
  url: string;
  tipoTesis: TipoTesisItem[] = [];
  edit = true;

  options: AuthorOption[] = [];
  otrosAutores: AuthorFormRow[] = [];
  fileData: File | null = null;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _publicacionService: PublicacionService,
    private _publicacionAutoresService: PublicacionAutoresService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _universidadService: UniversidadService,
    private _tipotesisService: TipoTesisService,
  ) {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ["", [Validators.required]],
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

  ngOnInit(): void {
    this.getArticulo();
  }

  getArticulo(): void {
    this._route.params.forEach((params: Params) => {
      const idTesis = Number(params["id"] ?? 0);
      this._publicacionService.getPublication(idTesis).subscribe((result: any[]) => {
        if (result) {
          this.publicacion = result[0];
          const d = new Date(result[0].fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.publicacion.fechaPublicacionDate = d;
          this.getUniversidades(idTesis);
        }
      });
    });
  }

  getUniversidades(idPublicacion: number): void {
    this._universidadService.getUniversidades().subscribe((result: Universidad[]) => {
      if (result) {
        this.universidad = result;
        this.loadAuthors(idPublicacion);
      }
    });
  }

  loadAuthors(idPublicacion: number): void {
    this._publicacionAutoresService.search().subscribe((allAuthors) => {
      this.options = allAuthors;

      this._publicacionAutoresService.getForPublication(idPublicacion).subscribe((authors) => {
        const sorted = authors.toSorted((a, b) => a.isPrincipal - b.isPrincipal);
        this.otrosAutores = sorted.map((a, i) => {
          const row: AuthorFormRow = {
            id: i + 1,
            nombre: a.nombre,
            option: { kind: a.kind, nombre: a.nombre, DNI: a.DNI, foto: a.foto },
            myControl: new FormControl<string>(a.nombre, { nonNullable: true }),
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

        this.getTipoTesis();
      });
    });
  }

  getTipoTesis(): void {
    this._tipotesisService.getTiposTesis().subscribe((result: TipoTesisItem[]) => {
      if (result) this.tipoTesis = result;
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

  private setupFilters(): void {
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
    if (!this.publicacionForm.valid) return;

    const idPublicacion = this.publicacion.idPublicacion ?? 0;
    const momentDate = new Date(this.publicacion.fechaPublicacionDate ?? new Date());
    this.publicacion.fechaPublicacion = new Date(momentDate).toLocaleDateString("sv");

    this._publicacionService.updatePublicacion(this.publicacion).subscribe((updateResponse: any) => {
      if (updateResponse.status === 1) {
        if (this.fileData) {
          this._publicacionService.uploadPublicacionFile(this.fileData, idPublicacion).subscribe(() => {});
        }
        this._publicacionAutoresService.saveForPublication(idPublicacion, this.buildSaveList()).subscribe(() => {
          this.publicacionForm.markAsPristine();
          this.return();
          this.openSnackBar("Tesis actualizada exitosamente");
        });
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

  erasePublicacion(): void {
    const idPublicacion = this.publicacion.idPublicacion ?? 0;
    this._publicacionAutoresService.saveForPublication(idPublicacion, []).subscribe(() => {
      this._publicacionService.deletePublicacion(idPublicacion).subscribe((deleteResponse: any) => {
        if (deleteResponse.status === 1) {
          this.publicacionForm.markAsPristine();
          this.return();
          this.openSnackBar("Tesis eliminada exitosamente");
        }
      });
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
    this._router.navigate(["dashboard/" + localStorage.getItem("thesis-back")]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
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
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase7 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase7>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
