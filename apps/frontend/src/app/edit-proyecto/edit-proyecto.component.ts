import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgFor, NgIf, NgClass } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
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
import { AutosizeModule } from "ngx-autosize";

import { DialogData } from "../models/dialogdata";
import { FuenteFinanciamiento } from "../models/fuentefinanciamiento";
import { lineasInvestigacion } from "../models/lineaInvestigacion";
import { Moneda } from "../models/moneda";
import { Proyecto } from "../models/proyecto";
import { Usuario } from "../models/usuario";
import { CommonService } from "../services/common.service";
import { FuenteFinanciamientoService } from "../services/fuentefinanciamiento.service";
import { GLOBAL } from "../services/global";
import { LineasInvestigacionService } from "../services/lineasinvestigacion.service";
import { MonedaService } from "../services/moneda.service";
import { ProyectoService } from "../services/proyecto.service";
import { SpaceValidator } from "../services/spacevalidator";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioHasProyectoService } from "../services/usuariohasproyecto";

@Component({
  selector: "app-edit-proyecto",
  templateUrl: "../add-proyecto/add-proyecto.component.html",
  styleUrls: ["../add-proyecto/add-proyecto.component.scss"],
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
    NgIf,
    AutosizeModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgClass,
  ],
})
export class EditProyectoComponent implements OnInit {
  edit = true;
  terminado = false;
  button_text = "Actualizar información";
  button_text2 = "Concluir proyecto";
  usuarios: Array<Usuario>;
  lineasInvestigacion: Array<lineasInvestigacion>;
  fuentesFinaciamiento: Array<FuenteFinanciamiento>;
  proyecto: Proyecto;
  proyectoForm: FormGroup;
  monedas: Array<Moneda>;
  url;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _usuarioService: UsuarioService,
    private _lineaInvestigacionService: LineasInvestigacionService,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
    private _monedaService: MonedaService,
    private _proyectoService: ProyectoService,
    private _usuariohasproyecto: UsuarioHasProyectoService,
    public dialog: MatDialog,
  ) {
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
    this.proyecto = new Proyecto(
      null,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      1,
      null,
      null,
      "",
      "",
      null,
      "",
      null,
      null,
      null,
      null,
      "",
      null,
      null,
    );
    this.url = GLOBAL.url;
    this.proyectoForm.valueChanges.subscribe(() => {
      if (this.proyectoForm.get("fechaInicio").hasError("lessThan")) {
        this.field2HasError = true;
      } else {
        this.field2HasError = false;
      }
    });
  }
  field2HasError: boolean;

  greaterThan(field: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const group = control.parent;
      const fieldToCompare = group.get(field);
      var d = new Date(fieldToCompare.value);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      var e = new Date(control.value);
      e.setMinutes(e.getMinutes() + e.getTimezoneOffset());
      var isLessThan;
      if (e) {
        isLessThan = d > e;
      }
      return isLessThan ? { lessThan: { value: control.value } } : null;
    };
  }

  ngOnInit() {
    this.getProyecto();
  }

  disableSelect;

  ngAfterViewChecked() {
    if (this.proyecto.estado == 0) {
      let element = document.getElementsByClassName("text-autocomplete-normal");
      for (let index = 0; index < element.length; index++) {
        element[index].className = "text-autocomplete";
      }
    }
  }

  getProyecto() {
    this._route.params.forEach((params: Params) => {
      let idProyecto = params["id"];
      this._proyectoService.getProject(idProyecto).subscribe((result) => {
        if (result) {
          this.proyecto = result[0];
          var d = new Date(this.proyecto.fechaInicio);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.proyecto.fechaInicio = d;
          localStorage.setItem("proyectoEdit", JSON.stringify(this.proyecto.titulo));
          if (this.proyecto.estado == 0) {
            this.terminado = true;
            this.proyectoForm.get("fechaFin").setValidators(this.greaterThan("fechaInicio"));
            d = new Date(this.proyecto.fechaFin);
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            this.proyecto.fechaFin = d;
            this.proyectoForm.disable();
            this.proyectoForm.controls["fechaFin"].enable();
            this.disableSelect = true;
            this.button_text2 = "Reactivar proyecto";
          }
          this.getLineaInvestigacion();
          this.getUsuariosPublicacion(this.proyecto.idProyecto);
        }
      });
    });
  }

  getUsuariosPublicacion(idProyecto) {
    this._usuariohasproyecto.getUsuarioHasProyectos(idProyecto).subscribe((result) => {
      if (result) {
        for (let index = 0; index < result.length; index++) {
          this.getUsuario(result[index].usuario_DNI);
        }
      }
    });
  }

  getUsuario(DNI) {
    this._usuarioService.getUser(DNI).subscribe((result) => {
      if (result) {
        result[0].nombre = result[0].nombre + " " + result[0].apellidoPaterno + " " + result[0].apellidoMaterno;
        this.autoresSeleccionados.push(result[0]);
        this.setearOtrosAutores();
      }
    });
  }

  setearOtrosAutores() {
    this.otrosAutores = [];
    for (let index = 0; index < this.autoresSeleccionados.length; index++) {
      this.otrosAutores.push({
        id: this.otrosAutores.length + 1,
        DNI: this.autoresSeleccionados[index].DNI,
        nombre: this.autoresSeleccionados[index].nombre,
      });
    }
    if (this.autoresSeleccionados.length == 0) {
      this.otrosAutores.push({
        id: 1,
        DNI: "",
        nombre: "",
      });
    }
  }

  autoresSeleccionados = [];

  getLineaInvestigacion() {
    this._lineaInvestigacionService.getLineasInvestigacion().subscribe((result) => {
      if (result) {
        this.lineasInvestigacion = result;
        this.getFuenteFinanciamiento();
      }
    });
  }

  getFuenteFinanciamiento() {
    this._fuenteFinanciamientoService.getFuenteFinanciamientos().subscribe((result) => {
      if (result) {
        this.fuentesFinaciamiento = result;
        this.getMoneda();
      }
    });
  }

  getMoneda() {
    this._monedaService.getMonedas().subscribe((result) => {
      if (result) {
        this.monedas = result;
        this.getUsuarios();
      }
    });
  }

  options: Array<any> = [];

  agregar;

  return() {
    this._commonService.setEndSession("0");
    sessionStorage.setItem("oldProject", "0");
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
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
      }
    });
  }

  otrosAutores: any[];

  addAnotherAuthor() {
    this.otrosAutores.push({
      id: this.otrosAutores.length + 1,
      DNI: "",
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

  selectUserAutor(evento, value, i) {
    if (value == 1) {
      this.otrosAutores[i].DNI = evento.DNI;
      this.otrosAutores[i].nombre = evento.nombre;
    } else {
      let index = this.options.findIndex((option) => option.nombre === evento.value);
      if (this.options[index].DNI) {
        this.otrosAutores[i].DNI = this.options[index].DNI;
      } else {
        this.otrosAutores[i].DNI = this.options[index].DNI;
        this.otrosAutores[i].isAutor = false;
      }
      this.otrosAutores[i].nombre = this.options[index].nombre;
    }
  }

  submitProyecto() {
    this.revisarValues();
    if (this.proyectoForm.valid && this.otrosAutores.length > 0 && this.otrosAutores[0].nombre != "") {
      const momentDate = new Date(this.proyecto.fechaInicio);
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.proyecto.fechaI = formattedDate;
      if (this.proyecto.fechaFin) {
        const momentDate1 = new Date(this.proyecto.fechaFin);
        const formattedDate1 = new Date(momentDate1).toLocaleDateString("sv");
        this.proyecto.fechaF = formattedDate1;
      }
      this._proyectoService.updateProyecto(this.proyecto).subscribe((result) => {
        if (result.status == 1) {
          this._usuariohasproyecto.deleteUsuarioProyecto(this.proyecto.idProyecto).subscribe((result) => {
            if (result.status == 1) {
              for (let index = 0; index < this.otrosAutores.length; index++) {
                this.setAutores(this.otrosAutores[index], this.proyecto.idProyecto);
              }
            }
          });
          this.agregar = true;
          this.return();
          this.openSnackBar("Proyecto actualizado exitosamente");
        }
      });
    }
  }

  projectEnd() {
    if (this.proyecto.estado == 1) {
      this.proyecto.estado = 0;
      this._proyectoService.endProyecto(this.proyecto).subscribe((result) => {
        if (result.status == 1) {
          this.agregar = true;
          this.return();
          this.openSnackBar("Proyecto concluido exitosamente");
        }
      });
    } else {
      this.proyecto.estado = 1;
      this._proyectoService.restartProyecto(this.proyecto).subscribe((result) => {
        if (result.status == 1) {
          this.agregar = true;
          this.return();
          this.openSnackBar("Proyecto reactivado exitosamente");
        }
      });
    }
  }

  setAutores(autor, idProyecto) {
    let usuarioPublicacion = { usuario_DNI: autor.DNI, proyecto_idProyecto: idProyecto };
    this._usuariohasproyecto.addUsuarioProyecto(usuarioPublicacion).subscribe((res) => {});
  }

  revisarValues() {
    for (let index = 0; index < this.otrosAutores.length; index++) {
      let found = this.options.findIndex((option) => option.nombre === this.otrosAutores[index].nombre);
      if (found == -1) {
        this.otrosAutores[index].DNI = null;
        this.otrosAutores[index].isAutor = true;
      }
    }
  }

  erasePublicacion() {
    this._usuariohasproyecto.deleteUsuarioProyecto(this.proyecto.idProyecto).subscribe((result) => {
      if (result.status == 1) {
        this._proyectoService.deleteProyecto(this.proyecto.idProyecto).subscribe((result) => {
          if (result.status == 1) {
            this.agregar = true;
            this.return();
            this.openSnackBar("Proyecto eliminado exitosamente");
          }
        });
      }
    });
  }

  private dialogRef2: MatDialogRef<DialogErase10>;

  openEraser() {
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
    this.dialogRef2.afterClosed().subscribe((result) => {
      if (result) {
        this.erasePublicacion();
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase10 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase10>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
