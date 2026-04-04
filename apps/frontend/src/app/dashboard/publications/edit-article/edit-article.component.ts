import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgFor, NgIf, NgClass, AsyncPipe } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
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
import { ActivatedRoute, Router, Params } from "@angular/router";
import type { AuthorOption, SaveAuthorEntry } from "@app/shared/models/author";
import type { AuthorFormRow } from "@app/shared/models/author-form";
import { DialogData } from "@app/shared/models/dialogdata";
import { createPublicacion } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import { Revista } from "@app/shared/models/revista";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-edit-article",
  templateUrl: "../add-article/add-article.component.html",
  styleUrls: ["../add-article/add-article.component.scss"],
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
    NgFor,
    MatOption,
    MatAutocompleteTrigger,
    MatAutocomplete,
    NgIf,
    AutosizeModule,
    NgClass,
    AsyncPipe,
  ],
})
export default class EditArticleComponent implements OnInit, HasUnsavedChanges {
  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  revista: Revista[] = [];
  url: string;
  edit = true;

  // Principal author
  selectedUser = "";
  principalAuthor: AuthorOption | null = null;
  myControl = new FormControl<string>("", { nonNullable: true });
  options: AuthorOption[] = [];
  filteredOptions!: Observable<AuthorOption[]>;

  // Co-authors
  otrosAutores: AuthorFormRow[] = [];

  // File upload
  fileData: File | null = null;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _publicacionService: PublicacionService,
    private _publicacionAutoresService: PublicacionAutoresService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _revistaService: RevistaService,
  ) {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ["", [Validators.required]],
      revista_idRevista: ["", [Validators.required]],
      nroRevista: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      DOI: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = createPublicacion();
    this.publicacion.tipoPublicacion_idTipoPublicacion = 1;
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
      const idArticulo = Number(params["id"] ?? 0);
      this._publicacionService.getPublication(idArticulo).subscribe((result: any[]) => {
        if (result) {
          this.publicacion = result[0];
          const d = new Date(result[0].fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.publicacion.fechaPublicacionDate = d;
          this.getRevista(idArticulo);
        }
      });
    });
  }

  getRevista(idPublicacion: number): void {
    this._revistaService.getRevistas().subscribe((result: Revista[]) => {
      if (result) {
        this.revista = result;
        this.loadAuthors(idPublicacion);
      }
    });
  }

  loadAuthors(idPublicacion: number): void {
    this._publicacionAutoresService.search().subscribe((allAuthors) => {
      this.options = allAuthors;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this.filterAuthors(value)),
      );

      this._publicacionAutoresService.getForPublication(idPublicacion).subscribe((authors) => {
        const principal = authors.find((a) => a.isPrincipal === 0);
        if (principal) {
          this.selectedUser = principal.nombre;
          this.principalAuthor = {
            kind: principal.kind,
            nombre: principal.nombre,
            DNI: principal.DNI,
            foto: principal.foto,
          };
          this.myControl.setValue(principal.nombre);
        }

        const coAuthors = authors.filter((a) => a.isPrincipal > 0).toSorted((a, b) => a.isPrincipal - b.isPrincipal);
        this.otrosAutores = coAuthors.map((a, i) => {
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
          this.setupCoAuthorFilters();
        }
      });
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

  selectUser(evento: AuthorOption | { value: string }, value: number): void {
    if (value === 1) {
      const author = evento as AuthorOption;
      this.myControl.setValue(author.nombre);
      this.selectedUser = author.nombre;
      this.principalAuthor = author;
    } else {
      const nombre = (evento as { value: string }).value;
      this.principalAuthor = this.options.find((o) => o.nombre === nombre) ?? null;
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
    if (!this.publicacionForm.valid || !this.selectedUser) return;

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
          this.openSnackBar("Artículo actualizado exitosamente");
        });
      }
    });
  }

  private buildSaveList(): SaveAuthorEntry[] {
    const entries: SaveAuthorEntry[] = [];

    const resolvedPrincipal = this.principalAuthor?.nombre === this.selectedUser ? this.principalAuthor : null;
    if (resolvedPrincipal?.kind === "registered" && resolvedPrincipal.DNI) {
      entries.push({ kind: "registered", DNI: resolvedPrincipal.DNI, isPrincipal: 0 });
    } else {
      entries.push({ kind: "external", nombre: this.selectedUser, isPrincipal: 0 });
    }

    this.otrosAutores.forEach((row, i) => {
      if (!row.nombre) return;
      const opt = row.option?.nombre === row.nombre ? row.option : null;
      if (opt?.kind === "registered" && opt.DNI) {
        entries.push({ kind: "registered", DNI: opt.DNI, isPrincipal: i + 1 });
      } else {
        entries.push({ kind: "external", nombre: row.nombre, isPrincipal: i + 1 });
      }
    });

    return entries;
  }

  erasePublicacion(): void {
    const idPublicacion = this.publicacion.idPublicacion ?? 0;
    this._publicacionAutoresService.saveForPublication(idPublicacion, []).subscribe(() => {
      this._publicacionService.deletePublicacion(idPublicacion).subscribe((deleteResponse: any) => {
        if (deleteResponse.status === 1) {
          this.publicacionForm.markAsPristine();
          this.return();
          this.openSnackBar("Artículo eliminado exitosamente");
        }
      });
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
    this._router.navigate(["dashboard/" + localStorage.getItem("article-back")]);
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
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase6 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase6>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
