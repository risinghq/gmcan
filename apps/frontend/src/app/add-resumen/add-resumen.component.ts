import { NgFor, NgIf, NgClass, AsyncPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
import { ActivatedRoute, Router } from "@angular/router";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

import { Autor } from "../models/autores";
import { Evento } from "../models/eventos";
import { Publicacion } from "../models/publicacion";
import { Usuario } from "../models/usuario";
import { AutorService } from "../services/autor.service";
import { CommonService } from "../services/common.service";
import { EventoService } from "../services/evento.service";
import { GLOBAL } from "../services/global";
import { PublicacionService } from "../services/publicacion.service";
import { PublicacionHasAutorService } from "../services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "../services/publicacionhasusuario.service";
import { SpaceValidator } from "../services/spacevalidator";
import { UsuarioService } from "../services/usuario.service";

@Component({
  selector: "app-add-resumen",
  templateUrl: "./add-resumen.component.html",
  styleUrls: ["./add-resumen.component.scss"],
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
export class AddResumenComponent implements OnInit {
  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Guardar resumen";
  evento: Array<Evento>;
  autores: Array<Autor>;
  usuarios: Array<Usuario>;
  url;
  tipoTesis;
  selectedUser;

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
    private _commonService: CommonService,
    private _eventoService: EventoService,
  ) {
    this.publicacionForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      evento_idEvento: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      DOI: [""],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      userSelector: [""],
    });
    this.publicacion = new Publicacion(
      null,
      "",
      "",
      "",
      "",
      "",
      null,
      "",
      null,
      null,
      null,
      null,
      3,
      "",
      "",
      null,
      null,
      null,
      "",
      null,
      null,
      null,
      "",
      "",
      null,
      "",
      null,
      "",
    );
    this.url = GLOBAL.url;
  }

  openEraser() {}
  edit;

  ngOnInit() {
    this.getEventos();
  }

  myControl = new FormControl();
  options: Array<any> = [];
  filteredOptions: Observable<any>;

  private _filter(value): any {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) => option.nombre.toLowerCase().includes(filterValue));
  }

  getEventos() {
    this._eventoService.getEventoesAll().subscribe((result) => {
      if (result) {
        this.evento = result;
        this.getUsuarios();
      }
    });
  }

  getAutores() {
    this._autorService.getAutor().subscribe((result) => {
      if (result) {
        result.sort((a, b) => (a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0));
        this.autores = result;
        for (let index = 0; index < this.autores.length; index++) {
          this.options.push(this.autores[index]);
        }
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(""),
          map((value) => this._filter(value)),
        );
        this.setFilters();
      }
    });
  }

  getUsuarios() {
    this._usuarioService.getUsuarios().subscribe((result) => {
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

  selectedUsers = [];

  selectUser(evento, value) {
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

  otrosAutores: any[] = [
    {
      id: 1,
      idAutor: "",
      nombre: "",
      isAutor: true,
      myControl: new FormControl(),
    },
  ];

  setFilters() {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      this.otrosAutores[index].filteredOptions = this.otrosAutores[index].myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this._filter(value)),
      );
    }
  }

  addAnotherAuthor() {
    this.otrosAutores.push({
      id: this.otrosAutores.length + 1,
      idAutor: "",
      nombre: "",
      isAutor: true,
      myControl: new FormControl(),
    });
    this.otrosAutores[this.otrosAutores.length - 1].filteredOptions = this.otrosAutores[
      this.otrosAutores.length - 1
    ].myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value)),
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

  selectUserAutor(evento, value, i) {
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

  agregar;

  submitArticle() {
    this.revisarValues();
    if (this.publicacionForm.valid && this.selectedUser) {
      const momentDate = new Date(this.publicacion.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.publicacion.fechaPublicacion = formattedDate;
      this._publicacionService.addPublicacion(this.publicacion).subscribe((result) => {
        if (result.status == 1) {
          if (this.selectedUsers.length > 0) {
            this.setAutores(this.selectedUsers[0], 0, result.idPublicacion);
          } else {
            let autorNuevo = { nombre: this.selectedUser };
            this.setAutores(autorNuevo, 0, result.idPublicacion);
          }
          for (let index = 0; index < this.otrosAutores.length; index++) {
            this.setAutores(this.otrosAutores[index], index + 1, result.idPublicacion);
          }
          this.agregar = true;
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  setAutores(autor, isPrincipal, idPublicacion) {
    if (autor.nombre) {
      if (autor.idAutor == "" || (!autor.idAutor && !autor.DNI)) {
        let newAuthor = { nombre: autor.nombre };
        this._autorService.addAuthor(newAuthor).subscribe((res) => {
          if (res) {
            let autorPublicacion = {
              autor_idAutor: res.idAutor,
              publicacion_idPublicacion: idPublicacion,
              isPrincipal: isPrincipal,
            };
            this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe((res) => {});
          }
        });
      } else if (autor.idAutor) {
        if (autor.isAutor) {
        } else if (autor.isAutor == undefined) {
          let autorPublicacion = {
            autor_idAutor: autor.idAutor,
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe((res) => {});
        } else {
          let usuarioPublicacion = {
            usuario_DNI: autor.idAutor,
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe((res) => {});
        }
      } else if (autor.DNI) {
        let usuarioPublicacion = {
          usuario_DNI: autor.DNI,
          publicacion_idPublicacion: idPublicacion,
          isPrincipal: isPrincipal,
        };
        this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe((res) => {});
      }
    }
  }

  revisarValues() {
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
        } else if (this.selectedUser[index].DNI) {
          this.selectedUsers[index].DNI = null;
        }
      }
      if (this.selectedUser != this.selectedUsers[index].nombre) {
        this.selectedUsers.splice(index, 1);
      }
    }
  }

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/" + localStorage.getItem("resumen-back")]);
  }

  openSnackBar() {
    this._snackBar.open("Publicación agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
