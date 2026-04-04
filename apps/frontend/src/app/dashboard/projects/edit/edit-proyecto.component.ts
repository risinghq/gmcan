import { CdkScrollable } from "@angular/cdk/scrolling";
import { Component, OnInit, inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
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
import { DialogData } from "@app/shared/models/dialogdata";
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
import { TabStateService } from "@app/shared/services/tab-state.service";
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
  isAutor?: boolean;
}

interface StatusResponse {
  status?: number;
}

@Component({
  selector: "app-edit-proyecto",
  templateUrl: "../add/add-proyecto.component.html",
  styleUrls: ["../add/add-proyecto.component.scss"],
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
export default class EditProyectoComponent implements OnInit, HasUnsavedChanges {
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
  private _tabState = inject(TabStateService);

  edit = true;
  terminado = false;
  button_text = "Actualizar información";
  button_text2 = "Concluir proyecto";
  usuarios: Usuario[] = [];
  lineasInvestigacion: LineasInvestigacion[] = [];
  fuentesFinaciamiento: FuenteFinanciamiento[] = [];
  proyecto: Proyecto;
  proyectoForm: FormGroup;
  monedas: Moneda[] = [];
  url: string;

  constructor() {
    this.proyectoForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      títuloEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      codigo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaInicio: ["", [Validators.required]],
      lineasInvestigacion_idLineasInvestigacion: ["", [Validators.required]],
      fuenteFinanciamiento_idFuenteFinanciamiento: ["", [Validators.required]],
      moneda_idMoneda: ["", [Validators.required]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      montoFinanciado: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaFin: [""],
    });
    this.proyecto = createProyecto();
    this.url = GLOBAL.url;
    this.proyectoForm.valueChanges.subscribe(() => {
      const fechaInicioControl = this.proyectoForm.get("fechaInicio");
      if (fechaInicioControl?.hasError("lessThan")) {
        this.field2HasError = true;
      } else {
        this.field2HasError = false;
      }
    });
  }
  field2HasError = false;

  greaterThan(field: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control.parent;
      if (!group) {
        return null;
      }
      const fieldToCompare = group.get(field);
      if (!fieldToCompare?.value || !control.value) {
        return null;
      }
      const d = new Date(fieldToCompare.value);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      const e = new Date(control.value);
      e.setMinutes(e.getMinutes() + e.getTimezoneOffset());
      let isLessThan = false;
      if (e) {
        isLessThan = d > e;
      }
      return isLessThan ? { lessThan: { value: control.value } } : null;
    };
  }

  ngOnInit(): void {
    this.getProyecto();
  }

  isDirty(): boolean {
    return this.proyectoForm.dirty;
  }

  disableSelect = false;

  ngAfterViewChecked(): void {
    if (this.proyecto.estado == 0) {
      const element = document.getElementsByClassName("text-autocomplete-normal");
      for (let index = 0; index < element.length; index++) {
        element[index].className = "text-autocomplete";
      }
    }
  }

  getProyecto(): void {
    this._route.params.forEach((params: Params) => {
      const idProyecto = Number(params["id"] ?? 0);
      this._proyectoService.getProject(idProyecto).subscribe((result: Proyecto[]) => {
        if (result) {
          this.proyecto = result[0];
          let d = new Date(this.proyecto.fechaInicio ?? new Date());
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.proyecto.fechaInicio = d;
          localStorage.setItem("proyectoEdit", JSON.stringify(this.proyecto.titulo ?? ""));
          if (this.proyecto.estado == 0) {
            this.terminado = true;
            this.proyectoForm.get("fechaFin")?.setValidators(this.greaterThan("fechaInicio"));
            d = new Date(this.proyecto.fechaFin ?? new Date());
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            this.proyecto.fechaFin = d;
            this.proyectoForm.disable();
            this.proyectoForm.controls["fechaFin"]?.enable();
            this.disableSelect = true;
            this.button_text2 = "Reactivar proyecto";
          }
          this.getLineaInvestigacion();
          this.getUsuariosPublicacion(this.proyecto.idProyecto ?? 0);
        }
      });
    });
  }

  getUsuariosPublicacion(idProyecto: number): void {
    this._usuariohasproyecto.getUsuarioHasProyectos(idProyecto).subscribe((result: { usuario_DNI?: string }[]) => {
      if (result) {
        for (let index = 0; index < result.length; index++) {
          this.getUsuario(result[index].usuario_DNI ?? "");
        }
      }
    });
  }

  getUsuario(DNI: string): void {
    this._usuarioService.getUser(DNI).subscribe((result: Usuario[]) => {
      if (result) {
        const user: UserOption = {
          ...result[0],
          nombre:
            `${result[0].nombre ?? ""} ${result[0].apellidoPaterno ?? ""} ${result[0].apellidoMaterno ?? ""}`.trim(),
        };
        this.autoresSeleccionados.push(user);
        this.setearOtrosAutores();
      }
    });
  }

  setearOtrosAutores(): void {
    this.otrosAutores = [];
    for (let index = 0; index < this.autoresSeleccionados.length; index++) {
      this.otrosAutores.push({
        id: this.otrosAutores.length + 1,
        DNI: this.autoresSeleccionados[index].DNI ?? null,
        nombre: this.autoresSeleccionados[index].nombre ?? "",
      });
    }
    if (this.autoresSeleccionados.length == 0) {
      this.otrosAutores.push({
        id: 1,
        DNI: null,
        nombre: "",
      });
    }
  }

  autoresSeleccionados: UserOption[] = [];

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
    this._tabState.projectTab.set(0);
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
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

  otrosAutores: AutorProyectoItem[] = [];

  addAnotherAuthor(): void {
    this.otrosAutores.push({
      id: this.otrosAutores.length + 1,
      DNI: null,
      nombre: "",
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
      this.otrosAutores[i].DNI = (evento as UserOption).DNI ?? null;
      this.otrosAutores[i].nombre = (evento as UserOption).nombre ?? "";
    } else {
      const index = this.options.findIndex(
        (option: UserOption) => option.nombre === (evento as { value?: string }).value,
      );
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
      if (this.proyecto.fechaFin) {
        const momentDate1 = new Date(this.proyecto.fechaFin);
        const formattedDate1 = new Date(momentDate1).toLocaleDateString("sv");
        this.proyecto.fechaF = formattedDate1;
      }
      this._proyectoService.updateProyecto(this.proyecto).subscribe((updateResponse: StatusResponse) => {
        if (updateResponse.status == 1) {
          this._usuariohasproyecto
            .deleteUsuarioProyecto(this.proyecto.idProyecto ?? 0)
            .subscribe((deleteUserProjectResponse: StatusResponse) => {
              if (deleteUserProjectResponse.status == 1) {
                for (let index = 0; index < this.otrosAutores.length; index++) {
                  this.setAutores(this.otrosAutores[index], this.proyecto.idProyecto ?? 0);
                }
              }
            });
          this.proyectoForm.markAsPristine();
          this.return();
          this.openSnackBar("Proyecto actualizado exitosamente");
        }
      });
    }
  }

  projectEnd(): void {
    if (this.proyecto.estado == 1) {
      this.proyecto.estado = 0;
      this._proyectoService.endProyecto(this.proyecto).subscribe((result: StatusResponse) => {
        if (result.status == 1) {
          this.proyectoForm.markAsPristine();
          this.return();
          this.openSnackBar("Proyecto concluido exitosamente");
        }
      });
    } else {
      this.proyecto.estado = 1;
      this._proyectoService.restartProyecto(this.proyecto).subscribe((result: StatusResponse) => {
        if (result.status == 1) {
          this.proyectoForm.markAsPristine();
          this.return();
          this.openSnackBar("Proyecto reactivado exitosamente");
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

  erasePublicacion(): void {
    this._usuariohasproyecto
      .deleteUsuarioProyecto(this.proyecto.idProyecto ?? 0)
      .subscribe((deleteUserProjectResponse: StatusResponse) => {
        if (deleteUserProjectResponse.status == 1) {
          this._proyectoService
            .deleteProyecto(this.proyecto.idProyecto ?? 0)
            .subscribe((deleteProjectResponse: StatusResponse) => {
              if (deleteProjectResponse.status == 1) {
                this.proyectoForm.markAsPristine();
                this.return();
                this.openSnackBar("Proyecto eliminado exitosamente");
              }
            });
        }
      });
  }

  private dialogRef2?: MatDialogRef<DialogErase10>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase10, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar proyecto",
        text: "¿Estás seguro que deseas eliminar esta proyecto?",
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
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase10 {
  dialogRef = inject<MatDialogRef<DialogErase10>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
