import { NgFor, NgIf, NgClass, AsyncPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
import { Autor } from "@app/shared/models/autores";
import { createPublicacion } from "@app/shared/models/factories";
import type { Publicacion } from "@app/shared/models/publicacion";
import { Revista } from "@app/shared/models/revista";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { Usuario } from "@app/shared/models/usuario";
import { AutorService } from "@app/shared/services/autor.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

interface AuthorOption {
  idAutor?: number | string | null;
  DNI?: string | null;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  foto?: string;
  isPrincipal?: number | boolean;
  isAutor?: boolean;
  value?: string;
}

interface AutorFormItem {
  id: number;
  idAutor: number | string | null;
  nombre: string;
  isAutor?: boolean;
  DNI?: string | null;
  myControl: FormControl<string>;
  filteredOptions?: Observable<AuthorOption[]>;
}

interface AddPublicacionResponse {
  status?: number;
  idPublicacion?: number;
}

interface AddAuthorResponse {
  idAutor?: number;
}

@Component({
  selector: "app-add-article",
  templateUrl: "./add-article.component.html",
  styleUrls: ["./add-article.component.scss"],
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
export default class AddArticleComponent implements OnInit, HasUnsavedChanges {
  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text = "Guardar artículo";
  revista: Revista[] = [];
  autores: Autor[] = [];
  usuarios: Usuario[] = [];
  url: string;

  selectedUser = "";

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

  edit = false;

  ngOnInit(): void {
    this.getRevista();
  }

  isDirty(): boolean {
    return this.publicacionForm.dirty;
  }

  myControl = new FormControl<string>("", { nonNullable: true });
  options: AuthorOption[] = [];
  filteredOptions!: Observable<AuthorOption[]>;

  private _filter(value: string): AuthorOption[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option: AuthorOption) => (option.nombre ?? "").toLowerCase().includes(filterValue));
  }

  openEraser(): void {}

  getRevista(): void {
    this._revistaService.getRevistas().subscribe((result: Revista[]) => {
      if (result) {
        this.revista = result;
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
          this.options.push(this.autores[index]);
        }
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(""),
          map((value: string) => this._filter(value)),
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
            (this.usuarios[index].nombre ?? "") +
            " " +
            (this.usuarios[index].apellidoPaterno ?? "") +
            " " +
            (this.usuarios[index].apellidoMaterno ?? "");
          this.options.push(this.usuarios[index]);
        }
        this.getAutores();
      }
    });
  }

  selectedUsers: AuthorOption[] = [];

  selectUser(evento: AuthorOption, value: number): void {
    if (value === 1) {
      this.myControl.setValue(evento.nombre ?? "");
      if (this.selectedUsers.length !== 0) {
        this.selectedUsers[0] = evento;
      } else {
        this.selectedUsers.push(evento);
      }
    } else {
      const index = this.options.findIndex((option: AuthorOption) => option.nombre === evento.value);
      if (index === -1) {
        return;
      }
      if (this.selectedUsers.length !== 0) {
        this.selectedUsers[0] = this.options[index];
      } else {
        this.selectedUsers.push(this.options[index]);
      }
    }
  }

  otrosAutores: AutorFormItem[] = [
    {
      id: 1,
      idAutor: null,
      nombre: "",
      isAutor: true,
      myControl: new FormControl<string>("", { nonNullable: true }),
    },
  ];

  setFilters(): void {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      this.otrosAutores[index].filteredOptions = this.otrosAutores[index].myControl.valueChanges.pipe(
        startWith(""),
        map((value: string) => this._filter(value)),
      );
    }
  }

  addAnotherAuthor(): void {
    this.otrosAutores.push({
      id: this.otrosAutores.length + 1,
      idAutor: null,
      nombre: "",
      isAutor: true,
      myControl: new FormControl<string>("", { nonNullable: true }),
    });
    this.otrosAutores[this.otrosAutores.length - 1].filteredOptions = this.otrosAutores[
      this.otrosAutores.length - 1
    ].myControl.valueChanges.pipe(
      startWith(""),
      map((value: string) => this._filter(value)),
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

  selectUserAutor(evento: AuthorOption, value: number, i: number): void {
    if (value === 1) {
      if (evento.idAutor) {
        this.otrosAutores[i].idAutor = evento.idAutor;
      } else {
        this.otrosAutores[i].idAutor = evento.DNI ?? "";
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = evento.nombre ?? "";
    } else {
      const index = this.options.findIndex((option: AuthorOption) => option.nombre === evento.value);
      if (index === -1) {
        return;
      }
      if (this.options[index].idAutor) {
        this.otrosAutores[i].idAutor = this.options[index].idAutor;
      } else {
        this.otrosAutores[i].idAutor = this.options[index].DNI ?? "";
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = this.options[index].nombre ?? "";
    }
  }

  return(): void {
    this._router.navigate(["dashboard/" + localStorage.getItem("article-back")]);
  }

  openSnackBar(): void {
    this._snackBar.open("Publicación agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  submitArticle(): void {
    this.revisarValues();
    if (this.publicacionForm.valid && this.selectedUser) {
      const momentDate = new Date(this.publicacion.fechaPublicacionDate ?? new Date()); // Replace event.value with your date value
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.publicacion.fechaPublicacion = formattedDate;
      this._publicacionService.addPublicacion(this.publicacion).subscribe((result: AddPublicacionResponse) => {
        if (result.status === 1 && result.idPublicacion != null) {
          if (this.fileData) {
            this._publicacionService.uploadPublicacionFile(this.fileData, result.idPublicacion).subscribe(() => {});
          }
          if (this.selectedUsers.length > 0) {
            this.setAutores(this.selectedUsers[0], 0, result.idPublicacion);
          } else {
            const autorNuevo: AuthorOption = { nombre: this.selectedUser };
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

  setAutores(autor: AuthorOption | AutorFormItem, isPrincipal: number, idPublicacion: number): void {
    if (autor.nombre) {
      if (autor.idAutor == null || autor.idAutor === "" || (!autor.idAutor && !autor.DNI)) {
        const newAuthor = { nombre: autor.nombre };
        this._autorService.addAuthor(newAuthor).subscribe((res: AddAuthorResponse) => {
          if (res) {
            const autorPublicacion = {
              autor_idAutor: res.idAutor,
              publicacion_idPublicacion: idPublicacion,
              isPrincipal: isPrincipal,
            };
            this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(() => {});
          }
        });
      } else if (autor.idAutor) {
        if (autor.isAutor) {
          const autorPublicacion = {
            autor_idAutor: Number(autor.idAutor ?? 0),
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(() => {});
        } else if (autor.isAutor === undefined) {
          const autorPublicacion = {
            autor_idAutor: Number(autor.idAutor ?? 0),
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(() => {});
        } else {
          const usuarioPublicacion = {
            usuario_DNI: String(autor.idAutor),
            publicacion_idPublicacion: idPublicacion,
            isPrincipal: isPrincipal,
          };
          this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe(() => {});
        }
      } else if (autor.DNI) {
        const usuarioPublicacion = {
          usuario_DNI: autor.DNI,
          publicacion_idPublicacion: idPublicacion,
          isPrincipal: isPrincipal,
        };
        this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe(() => {});
      }
    }
  }

  revisarValues(): void {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      const found = this.options.findIndex((option: AuthorOption) => option.nombre === this.otrosAutores[index].nombre);
      if (found === -1) {
        this.otrosAutores[index].idAutor = null;
        this.otrosAutores[index].isAutor = true;
      }
    }
    for (let index = 0; index < this.selectedUsers.length; index++) {
      const found = this.options.findIndex(
        (option: AuthorOption) => option.nombre === this.selectedUsers[index].nombre,
      );
      if (found === -1) {
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

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
  fileProgress(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    this.fileData = input.files?.[0] ?? null;
  }
}
