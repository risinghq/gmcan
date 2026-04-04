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
import { ActivatedRoute, Router, Params } from "@angular/router";
import type { AuthorOption, SaveAuthorEntry } from "@app/shared/models/author";
import type { AuthorFormRow } from "@app/shared/models/author-form";
import { DialogData } from "@app/shared/models/dialogdata";
import { Evento } from "@app/shared/models/eventos";
import { createPublicacion } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SessionService } from "@app/shared/services/session.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

@Component({
  selector: "app-edit-resumen",
  templateUrl: "../add-resumen/add-resumen.component.html",
  styleUrls: ["../add-resumen/add-resumen.component.scss"],
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
export default class EditResumenComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _publicacionService = inject(PublicacionService);
  private _publicacionAutoresService = inject(PublicacionAutoresService);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _eventoService = inject(EventoService);
  private _session = inject(SessionService);

  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  evento: Array<Evento> = [];
  url: string;
  edit = true;

  // Principal author
  selectedUser: string | null = null;
  principalAuthor: AuthorOption | null = null;
  myControl = new FormControl<string>("");
  options: AuthorOption[] = [];
  filteredOptions!: Observable<AuthorOption[]>;

  // Co-authors
  otrosAutores: AuthorFormRow[] = [];

  constructor() {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ["", [Validators.required]],
      evento_idEvento: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      DOI: [""],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = createPublicacion();
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  ngOnInit(): void {
    this.getResumen();
  }

  getResumen(): void {
    this._route.params.forEach((params: Params) => {
      const idArticulo = params["id"];
      this._publicacionService.getPublication(idArticulo).subscribe((result: any[]) => {
        if (result) {
          this.publicacion = result[0];
          const d = new Date(result[0].fechaPublicacion);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.publicacion.fechaPublicacionDate = d;
          this.getEventos(idArticulo);
        }
      });
    });
  }

  getEventos(idPublicacion: number): void {
    this._eventoService.getEventoesAll().subscribe((result: Evento[]) => {
      if (result) {
        this.evento = result;
        this.loadAuthors(idPublicacion);
      }
    });
  }

  loadAuthors(idPublicacion: number): void {
    this._publicacionAutoresService.search().subscribe((allAuthors) => {
      this.options = allAuthors;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this.filterAuthors(value ?? "")),
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
            map((v) => this.filterAuthors(v ?? "")),
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
        map((v) => this.filterAuthors(v ?? "")),
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

    const idPublicacion = Number(this.publicacion.idPublicacion ?? 0);
    const momentDate = new Date(this.publicacion.fechaPublicacionDate ?? new Date());
    this.publicacion.fechaPublicacion = new Date(momentDate).toLocaleDateString("sv");

    this._publicacionService.updatePublicacion(this.publicacion).subscribe((updateResponse: any) => {
      if (updateResponse.status === 1) {
        this._publicacionAutoresService.saveForPublication(idPublicacion, this.buildSaveList()).subscribe(() => {
          this.publicacionForm.markAsPristine();
          this.return();
          this.openSnackBar("Resumen actualizado exitosamente");
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
      entries.push({ kind: "external", nombre: this.selectedUser!, isPrincipal: 0 });
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
    const idPublicacion = Number(this.publicacion.idPublicacion ?? 0);
    this._publicacionAutoresService.saveForPublication(idPublicacion, []).subscribe(() => {
      this._publicacionService.deletePublicacion(idPublicacion).subscribe((deleteResponse: any) => {
        if (deleteResponse.status === 1) {
          this.publicacionForm.markAsPristine();
          this.return();
          this.openSnackBar("Resumen eliminado exitosamente");
        }
      });
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
    this._router.navigate(["dashboard/" + this._session.getResumenBack()]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
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
