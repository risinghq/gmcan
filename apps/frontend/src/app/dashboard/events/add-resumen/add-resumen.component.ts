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
import { Autor } from "@app/shared/models/autores";
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
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

type ResumenAuthor = {
  idAutor?: number | null;
  DNI?: string | null;
  nombre: string;
  isAutor?: boolean;
  foto?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
};

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
export default class AddResumenComponent implements OnInit, HasUnsavedChanges {
  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Guardar resumen";
  evento: Array<Evento> = [];
  autores: Array<Autor> = [];
  usuarios: Array<Usuario> = [];
  url: string;
  tipoTesis: string | null = null;
  selectedUser: string | null = null;

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
    this.publicacion = createPublicacion();
    this.url = GLOBAL.url;
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  openEraser() {}
  edit = false;

  ngOnInit(): void {
    this.getEventos();
  }

  myControl = new FormControl<string>("");
  options: Array<ResumenAuthor> = [];
  filteredOptions!: Observable<Array<ResumenAuthor>>;

  private _filter(value: string): Array<ResumenAuthor> {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) => option.nombre.toLowerCase().includes(filterValue));
  }

  getEventos(): void {
    this._eventoService.getEventoesAll().subscribe((result: Evento[]) => {
      if (result) {
        this.evento = result;
        this.getUsuarios();
      }
    });
  }

  getAutores(): void {
    this._autorService.getAutor().subscribe((result: Autor[]) => {
      if (result) {
        result.sort((a: Autor, b: Autor) =>
          (a.nombre ?? "") > (b.nombre ?? "") ? 1 : (b.nombre ?? "") > (a.nombre ?? "") ? -1 : 0,
        );
        this.autores = result;
        for (let index = 0; index < this.autores.length; index++) {
          this.options.push(this.autores[index] as ResumenAuthor);
        }
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(""),
          map((value) => this._filter(value ?? "")),
        );
        this.setFilters();
      }
    });
  }

  getUsuarios(): void {
    this._usuarioService.getUsuarios().subscribe((result: Usuario[]) => {
      if (result) {
        result.sort((a: Usuario, b: Usuario) =>
          (a.nombre ?? "") > (b.nombre ?? "") ? 1 : (b.nombre ?? "") > (a.nombre ?? "") ? -1 : 0,
        );
        this.usuarios = result;
        for (let index = 0; index < this.usuarios.length; index++) {
          this.usuarios[index].nombre =
            `${this.usuarios[index].nombre ?? ""} ${this.usuarios[index].apellidoPaterno ?? ""} ${this.usuarios[index].apellidoMaterno ?? ""}`.trim();
          this.options.push(this.usuarios[index] as ResumenAuthor);
        }
        this.getAutores();
      }
    });
  }

  selectedUsers: ResumenAuthor[] = [];

  selectUser(evento: ResumenAuthor | { value: string }, value: number): void {
    if (value == 1) {
      this.myControl.setValue((evento as ResumenAuthor).nombre);
      if (this.selectedUsers.length != 0) {
        this.selectedUsers[0] = evento as ResumenAuthor;
      } else {
        this.selectedUsers.push(evento as ResumenAuthor);
      }
    } else {
      let index = this.options.findIndex((option) => option.nombre === (evento as { value: string }).value);
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
      myControl: new FormControl<string>(""),
    },
  ];

  setFilters(): void {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      this.otrosAutores[index].filteredOptions = this.otrosAutores[index].myControl.valueChanges.pipe(
        startWith(""),
        map((value: string | null) => this._filter(value ?? "")),
      );
    }
  }

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
      map((value: string | null) => this._filter(value ?? "")),
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

  submitArticle(): void {
    this.revisarValues();
    if (this.publicacionForm.valid && this.selectedUser) {
      const momentDate = new Date(this.publicacion.fechaPublicacionDate ?? new Date()); // Replace event.value with your date value
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.publicacion.fechaPublicacion = formattedDate;
      this._publicacionService.addPublicacion(this.publicacion).subscribe((result: any) => {
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
          this.publicacionForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
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
    this._router.navigate(["dashboard/" + localStorage.getItem("resumen-back")]);
  }

  openSnackBar(): void {
    this._snackBar.open("Publicación agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }
}
