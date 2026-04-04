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
import { Autor } from "@app/shared/models/autores";
import { DialogData } from "@app/shared/models/dialogdata";
import { Evento } from "@app/shared/models/eventos";
import { createPublicacion } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { Usuario } from "@app/shared/models/usuario";
import { AutorService } from "@app/shared/services/autor.service";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
import { SessionService } from "@app/shared/services/session.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { UsuarioService } from "@app/shared/services/usuario.service";
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
    NgFor,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatAutocompleteTrigger,
    MatAutocomplete,
    NgIf,
    AutosizeModule,
    NgClass,
    AsyncPipe,
  ],
})
export default class EditResumenComponent implements OnInit, HasUnsavedChanges {
  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Actualizar información";
  evento: Array<Evento> = [];
  autores: Array<Autor> = [];
  usuarios: Array<Usuario> = [];
  url: string;
  tipoTesis: string | null = null;
  selectedUser: string | null = null;

  edit = true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _publicacionService: PublicacionService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _usuarioService: UsuarioService,
    private _autorService: AutorService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _eventoService: EventoService,
    private _session: SessionService,
  ) {
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
      let idArticulo = params["id"];
      this._publicacionService.getPublication(idArticulo).subscribe((result: any[]) => {
        if (result) {
          this.publicacion = result[0];
          var d = new Date(result[0].fechaPublicacion);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.publicacion.fechaPublicacionDate = d;
          localStorage.setItem("resumenEdit", JSON.stringify(this.publicacion.titulo));
          this.getEventos();
          this.getAutoresPublicacion(idArticulo);
          this.setearOtrosAutores();
        }
      });
    });
  }

  getEventos(): void {
    this._eventoService.getEventoesAll().subscribe((result: Evento[]) => {
      if (result) {
        this.evento = result;
        this.getUsuarios();
      }
    });
  }

  myControl = new FormControl<string>("");
  options: Array<any> = [];
  filteredOptions!: Observable<any>;

  private _filter(value: unknown): any {
    const filterValue = String(value ?? "").toLowerCase();
    return this.options.filter((option) => option.nombre.toLowerCase().includes(filterValue));
  }

  selectedUsers: any[] = [];

  getAutores(): void {
    this._autorService.getAutor().subscribe((result: any[]) => {
      if (result) {
        result.sort((a, b) => (a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0));
        this.autores = result;
        for (let index = 0; index < this.autores.length; index++) {
          this.options.push(this.autores[index]);
        }
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(""),
          map((value) => this._filter(value ?? "")),
        );
      }
    });
  }

  getUsuarios(): void {
    this._usuarioService.getUsuarios().subscribe((result: any[]) => {
      if (result) {
        result.sort((a, b) => (a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0));
        this.usuarios = result;
        for (let index = 0; index < this.usuarios.length; index++) {
          this.usuarios[index].nombre =
            this.usuarios[index].nombre +
            " " +
            this.usuarios[index].apellidoPaterno +
            " " +
            this.usuarios[index].apellidoMaterno;
          this.options.push(this.usuarios[index]);
        }
        this.getAutores();
      }
    });
  }

  getAutoresPublicacion(idPublicacion: number): void {
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe((result: any[]) => {
      if (result) {
        for (let index = 0; index < result.length; index++) {
          this.getAutor(result[index].autores_idAutor, result[index].isPrincipal);
        }
      }
      this.getUsuariosPublicacion(idPublicacion);
    });
  }
  getUsuariosPublicacion(idPublicacion: number): void {
    this._publicacionhasusuarioService.getPublicacionHasUsuario(idPublicacion).subscribe((result: any[]) => {
      if (result) {
        for (let index = 0; index < result.length; index++) {
          this.getUsuario(result[index].usuario_DNI, result[index].isPrincipal);
        }
      }
    });
  }

  getAutor(idAutor: number, isPrincipal: number): void {
    this._autorService.getAuthor(idAutor).subscribe((result: any[]) => {
      if (result) {
        result[0].isPrincipal = isPrincipal;
        if (isPrincipal == 0) {
          this.selectedUsers.push(result[0]);
          this.myControl.setValue(result[0].nombre);
        } else {
          this.autoresSeleccionados.push(result[0]);
          this.setearOtrosAutores();
        }
      }
    });
  }

  getUsuario(DNI: string, isPrincipal: number): void {
    this._usuarioService.getUser(DNI).subscribe((result: any[]) => {
      if (result) {
        result[0].nombre = result[0].nombre + " " + result[0].apellidoPaterno + " " + result[0].apellidoMaterno;
        result[0].isPrincipal = isPrincipal;
        if (isPrincipal == 0) {
          this.selectedUsers.push(result[0]);
          this.myControl.setValue(result[0].nombre);
        } else {
          this.autoresSeleccionados.push(result[0]);
          this.setearOtrosAutores();
        }
      }
    });
  }

  setearOtrosAutores(): void {
    this.otrosAutores = [];
    this.autoresSeleccionados.sort((a, b) =>
      a.isPrincipal > b.isPrincipal ? 1 : b.isPrincipal > a.isPrincipal ? -1 : 0,
    );
    for (let index = 0; index < this.autoresSeleccionados.length; index++) {
      let idAutorSeleccionado;
      let isAutor = true;
      if (this.autoresSeleccionados[index].idAutor) {
        idAutorSeleccionado = this.autoresSeleccionados[index].idAutor;
      } else {
        idAutorSeleccionado = this.autoresSeleccionados[index].DNI;
        isAutor = false;
      }
      this.otrosAutores.push({
        id: this.otrosAutores.length + 1,
        idAutor: idAutorSeleccionado,
        nombre: this.autoresSeleccionados[index].nombre,
        isAutor: isAutor,
        myControl: new FormControl<string>(""),
      });
      this.otrosAutores[this.otrosAutores.length - 1].filteredOptions = this.otrosAutores[
        this.otrosAutores.length - 1
      ].myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this._filter(typeof value === "string" ? value : "")),
      );
    }
    if (this.autoresSeleccionados.length == 0) {
      this.otrosAutores.push({
        id: 1,
        idAutor: "",
        nombre: "",
        isAutor: true,
        myControl: new FormControl<string>(""),
      });
    }
  }

  autoresSeleccionados: any[] = [];

  otrosAutores: any[] = [];

  addAnotherAuthor(): void {
    this.otrosAutores.push({
      id: this.otrosAutores.length + 1,
      idAutor: "",
      nombre: "",
      isAutor: true,
      myControl: new FormControl<string>(""),
    });
    this.otrosAutores[this.otrosAutores.length - 1].filteredOptions = this.otrosAutores[
      this.otrosAutores.length - 1
    ].myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(typeof value === "string" ? value : "")),
    );
  }

  removeAnotherAuthor(i: number) {
    if (i > 0) {
      this.otrosAutores.splice(i, 1);
    } else if (i == 0 && this.otrosAutores.length == 1) {
      this.otrosAutores.splice(i, 1);
      this.addAnotherAuthor();
    } else {
      this.otrosAutores.splice(i, 1);
    }
  }

  submitArticle(): void {
    this.revisarValues();
    if (this.publicacionForm.valid && this.selectedUser) {
      const idPublicacion = Number(this.publicacion.idPublicacion ?? 0);
      const momentDate = new Date(this.publicacion.fechaPublicacionDate ?? new Date()); // Replace event.value with your date value
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.publicacion.fechaPublicacion = formattedDate;
      this._publicacionService.updatePublicacion(this.publicacion).subscribe((updateResponse: any) => {
        if (updateResponse.status == 1) {
          this.clearPublicationRelations(idPublicacion, () => {
            if (this.selectedUsers.length > 0) {
              this.setAutores(this.selectedUsers[0], 0, idPublicacion);
            } else {
              let autorNuevo = { nombre: this.selectedUser };
              this.setAutores(autorNuevo, 0, idPublicacion);
            }
            for (let index = 0; index < this.otrosAutores.length; index++) {
              this.setAutores(this.otrosAutores[index], index + 1, idPublicacion);
            }
          });
        }
      });
    }
  }

  private clearPublicationRelations(idPublicacion: number, onSuccess: () => void): void {
    this._publicacionhasautorService.deletePublicacionHasAutor(idPublicacion).subscribe((authorDeleteResponse: any) => {
      if (authorDeleteResponse.status == 1) {
        this._publicacionhasusuarioService
          .deletePublicacionHasUsuario(idPublicacion)
          .subscribe((userDeleteResponse: any) => {
            if (userDeleteResponse.status == 1) {
              onSuccess();
            }
          });
      }
    });
  }

  setAutores(autor: any, isPrincipal: number, idPublicacion: number): void {
    if (autor.nombre) {
      if (autor.idAutor == "" || (!autor.idAutor && !autor.DNI)) {
        let newAuthor = { nombre: autor.nombre };
        this._autorService.addAuthor(newAuthor).subscribe((res: any) => {
          if (res) {
            let autorPublicacion = {
              autor_idAutor: res.idAutor,
              publicacion_idPublicacion: idPublicacion,
              isPrincipal: isPrincipal,
            };
            this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe((_res: any) => {});
          }
        });
      } else if (autor.idAutor) {
        if (autor.isAutor) {
          let autorPublicacion = {
            autor_idAutor: autor.idAutor,
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe((_res: any) => {});
        } else if (autor.isAutor == undefined) {
          let autorPublicacion = {
            autor_idAutor: autor.idAutor,
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe((_res: any) => {});
        } else {
          let usuarioPublicacion = {
            usuario_DNI: autor.idAutor,
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe((_res: any) => {});
        }
      } else if (autor.DNI) {
        let usuarioPublicacion = {
          usuario_DNI: autor.DNI,
          publicacion_idPublicacion: idPublicacion,
          isPrincipal: isPrincipal,
        };
        this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe((_res: any) => {});
      }
    }
    if (isPrincipal) {
      this.publicacionForm.markAsPristine();
      this.return();
      this.openSnackBar("Resumen actualizado exitosamente");
    }
  }

  selectUser(evento: any, value: number): void {
    if (value == 1) {
      this.myControl.setValue(evento.nombre);
      if (this.selectedUsers.length != 0) {
        this.selectedUsers[0] = evento;
      } else {
        this.selectedUsers.push(evento);
      }
    } else {
      let index = this.options.findIndex((option) => option.nombre === evento.value);
      if (this.selectedUsers.length != 0) {
        this.selectedUsers[0] = this.options[index];
      } else {
        this.selectedUsers.push(this.options[index]);
      }
    }
  }

  selectUserAutor(evento: any, value: number, i: number): void {
    if (value == 1) {
      if (evento.idAutor) {
        this.otrosAutores[i].idAutor = evento.idAutor;
      } else {
        this.otrosAutores[i].idAutor = evento.DNI;
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = evento.nombre;
    } else {
      let index = this.options.findIndex((option) => option.nombre === evento.value);
      if (this.options[index].idAutor) {
        this.otrosAutores[i].idAutor = this.options[index].idAutor;
      } else {
        this.otrosAutores[i].idAutor = this.options[index].DNI;
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = this.options[index].nombre;
    }
  }

  revisarValues(): void {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      let found = this.options.findIndex((option) => option.nombre === this.otrosAutores[index].nombre);
      if (found == -1) {
        this.otrosAutores[index].idAutor = null;
        this.otrosAutores[index].isAutor = true;
      }
    }
    for (let index = 0; index < this.selectedUsers.length; index++) {
      let found = this.options.findIndex((option) => option.nombre === this.selectedUsers[index].nombre);
      if (found == -1) {
        if (this.selectedUsers[index].idAutor) {
          this.selectedUsers[index].idAutor = null;
        } else if (this.selectedUsers[index].DNI) {
          this.selectedUsers[index].DNI = null;
        }
      }
      if (this.selectedUser != this.selectedUsers[index].nombre) {
        this.selectedUsers.splice(index, 1);
      }
    }
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

  erasePublicacion(): void {
    const idPublicacion = Number(this.publicacion.idPublicacion ?? 0);
    this.clearPublicationRelations(idPublicacion, () => {
      this._publicacionService.deletePublicacion(idPublicacion).subscribe((deleteResponse: any) => {
        if (deleteResponse.status == 1) {
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
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase8 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase8>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
