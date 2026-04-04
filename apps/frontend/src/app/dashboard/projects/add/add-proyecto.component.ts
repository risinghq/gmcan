import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { createProyecto } from "@app/shared/models/factories";
import { FuenteFinanciamiento } from "@app/shared/models/fuentefinanciamiento";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
import { Moneda } from "@app/shared/models/moneda";
import type { Proyecto } from "@app/shared/models/proyecto";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { Usuario } from "@app/shared/models/usuario";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { GLOBAL } from "@app/shared/services/global";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { MonedaService } from "@app/shared/services/moneda.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasProyectoService } from "@app/shared/services/usuariohasproyecto";
import { AutosizeModule } from "ngx-autosize";

interface UserOption {
  DNI?: string | null;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  foto?: string;
}

interface AutorProyectoItem {
  id: number;
  DNI: string | null;
  nombre: string;
  isAutor: boolean;
}

interface AddProyectoResponse {
  status?: number;
  idProyecto?: number;
}

@Component({
  selector: "app-add-proyecto",
  templateUrl: "./add-proyecto.component.html",
  styleUrls: ["./add-proyecto.component.scss"],
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
    AutosizeModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
  ],
})
export default class AddProyectoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _usuarioService = inject(UsuarioService);
  private _lineaInvestigacionService = inject(LineasInvestigacionService);
  private _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  private _monedaService = inject(MonedaService);
  private _proyectoService = inject(ProyectoService);
  private _usuariohasproyecto = inject(UsuarioHasProyectoService);
  dialog = inject(MatDialog);

  terminado = false;
  edit = false;
  button_text = "Guardar proyecto";
  usuarios: Usuario[] = [];
  lineasInvestigacion: LineasInvestigacion[] = [];
  fuentesFinaciamiento: FuenteFinanciamiento[] = [];
  proyecto: Proyecto;
  proyectoForm: FormGroup;
  monedas: Moneda[] = [];
  url: string;

  disableSelect = false;
  openEraser() {}
  projectEnd() {}

  constructor() {
    this.proyectoForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      títuloEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      codigo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaInicio: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      lineasInvestigacion_idLineasInvestigacion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fuenteFinanciamiento_idFuenteFinanciamiento: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      moneda_idMoneda: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      montoFinanciado: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaFin: [""],
    });
    this.proyecto = createProyecto();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.getLineaInvestigacion();
  }

  isDirty(): boolean {
    return this.proyectoForm.dirty;
  }

  getLineaInvestigacion(): void {
    this._lineaInvestigacionService.getLineasInvestigacion().subscribe((result: LineasInvestigacion[]) => {
      if (result) {
        this.lineasInvestigacion = result;
        this.getFuenteFinanciamiento();
      }
    });
  }

  getFuenteFinanciamiento(): void {
    this._fuenteFinanciamientoService.getFuenteFinanciamientos().subscribe((result: FuenteFinanciamiento[]) => {
      if (result) {
        this.fuentesFinaciamiento = result;
        this.getMoneda();
      }
    });
  }

  getMoneda(): void {
    this._monedaService.getMonedas().subscribe((result: Moneda[]) => {
      if (result) {
        this.monedas = result;
        this.getUsuarios();
      }
    });
  }

  options: UserOption[] = [];

  return(): void {
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Proyecto agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
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
      }
    });
  }

  otrosAutores: AutorProyectoItem[] = [
    {
      id: 1,
      DNI: null,
      nombre: "",
      isAutor: true,
    },
  ];

  addAnotherAuthor(): void {
    this.otrosAutores.push({
      id: this.otrosAutores.length + 1,
      DNI: null,
      nombre: "",
      isAutor: true,
    });
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

  selectUserAutor(evento: UserOption | { value?: string }, value: number, i: number): void {
    if (value == 1) {
      const selected = evento as UserOption;
      if (selected.DNI) {
        this.otrosAutores[i].DNI = selected.DNI;
      } else {
        this.otrosAutores[i].DNI = selected.DNI ?? null;
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = selected.nombre ?? "";
    } else {
      const typedEvent = evento as { value?: string };
      const index = this.options.findIndex((option: UserOption) => option.nombre === typedEvent.value);
      if (index === -1) {
        return;
      }
      if (this.options[index].DNI) {
        this.otrosAutores[i].DNI = this.options[index].DNI ?? null;
      } else {
        this.otrosAutores[i].DNI = this.options[index].DNI ?? null;
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = this.options[index].nombre ?? "";
    }
  }

  submitProyecto(): void {
    this.revisarValues();
    if (this.proyectoForm.valid && this.otrosAutores.length > 0 && this.otrosAutores[0].nombre != "") {
      const momentDate = new Date(this.proyecto.fechaInicio ?? new Date());
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.proyecto.fechaI = formattedDate;
      this.proyecto.fechaF = undefined;
      this._proyectoService.addProyecto(this.proyecto).subscribe((result: AddProyectoResponse) => {
        if (result.status == 1) {
          for (let index = 0; index < this.otrosAutores.length; index++) {
            this.setAutores(this.otrosAutores[index], result.idProyecto ?? 0);
          }
          this.proyectoForm.markAsPristine();
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  setAutores(autor: AutorProyectoItem, idProyecto: number): void {
    const usuarioPublicacion = { usuario_DNI: autor.DNI ?? "", proyecto_idProyecto: idProyecto };
    this._usuariohasproyecto.addUsuarioProyecto(usuarioPublicacion).subscribe((_res: unknown) => {});
  }

  revisarValues(): void {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      const found = this.options.findIndex((option: UserOption) => option.nombre === this.otrosAutores[index].nombre);
      if (found == -1) {
        this.otrosAutores[index].DNI = null;
        this.otrosAutores[index].isAutor = true;
      }
    }
  }

  button_text2 = "";
}
