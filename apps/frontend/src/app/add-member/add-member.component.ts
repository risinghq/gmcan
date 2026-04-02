import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { MatCheckbox } from "@angular/material/checkbox";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AutosizeModule } from "ngx-autosize";

import { HomeComponent } from "../home/home.component";
import { Genero } from "../models/genero";
import { Prefijo } from "../models/prefijo";
import { TipoMiembro } from "../models/tipomiembro";
import { UsuarioFull } from "../models/usuarioFull";
import { UsuarioPermiso } from "../models/usuariopermiso";
import { CommonService } from "../services/common.service";
import { GeneroService } from "../services/genero.service";
import { GLOBAL } from "../services/global";
import { PermisoService } from "../services/permiso.service";
import { PrefijoService } from "../services/prefijo.service";
import { SpaceValidator } from "../services/spacevalidator";
import { TipoMiembroService } from "../services/tipomiembro.service";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioHasPermisoService } from "../services/usuariohaspermiso.service";

@Component({
  selector: "app-add-member",
  templateUrl: "./add-member.component.html",
  styleUrls: ["./add-member.component.scss"],
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
    NgClass,
    MatSelect,
    NgFor,
    MatOption,
    MatIconButton,
    NgIf,
    AutosizeModule,
    MatCheckbox,
    HomeComponent,
  ],
})
export class AddMemberComponent implements OnInit {
  public memberForm: FormGroup;
  member: UsuarioFull;
  generos: Array<Genero>;
  tipoMiembros: Array<TipoMiembro>;
  prefijos: Array<Prefijo>;
  usuarioPermiso: UsuarioPermiso;
  listaPermisos: Array<any>;
  hide = true;
  hide2 = true;
  url;

  button_text = "Registrar nuevo miembro";

  constructor(
    public formBuilder: FormBuilder,
    public _usuarioService: UsuarioService,
    public _generoService: GeneroService,
    public _tipoMiembroService: TipoMiembroService,
    public _prefijoService: PrefijoService,
    public _permisosService: PermisoService,
    public _usuarioPermisoService: UsuarioHasPermisoService,
    private _snackBar: MatSnackBar,
    public _router: Router,
    public dialog: MatDialog,
    private _commonService: CommonService,
  ) {
    this.memberForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      segundoNombre: [""],
      apellidoPaterno: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      apellidoMaterno: [""],
      fechaNacimiento: [""],
      correo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      genero_idGenero: [""],
      prefijo_idPrefijo: [""],
      tipoMiembro_idTipoMiembro: [Validators.required],
      DNI: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      password: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      confirmPassword: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenPro: [""],
      resumenProEN: [""],
    });
    this.url = GLOBAL.url;
    this.member = new UsuarioFull(
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      0,
      "",
      "",
      "",
      null,
      null,
      "",
      null,
      null,
      null,
      "",
      3,
      "",
      null,
    );
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit() {
    this.listaPermisos = [];
    this.getGenero();
  }

  getGenero() {
    this._generoService.getGeneros().subscribe((result) => {
      if (result) {
        this.generos = result;
        this.getCargo();
      }
    });
  }

  getCargo() {
    this._tipoMiembroService.getTipoMiembros().subscribe((res) => {
      if (res) {
        this.tipoMiembros = res;
        this.getNivelAcademico();
      }
    });
  }

  getNivelAcademico() {
    this._prefijoService.getPrefijos().subscribe((res) => {
      if (res) {
        this.prefijos = res;
        this.getPermisos();
      }
    });
  }

  getPermisos() {
    this._permisosService.getPermisos().subscribe((res) => {
      if (res) {
      }
    });
  }

  adHono = 0;

  setCoord(value) {
    this.member.tipoUsuario_idTipoUsuario = value;
  }

  adHonorem(value) {
    this.adHono = value;
  }

  oldMem = 0;
  oldMember(value) {
    this.oldMem = value;
  }

  errPass;
  errEmail;

  addMember() {
    if (this.memberForm.valid) {
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate); // Replace event.value with your date value
        const formattedDate = new Date(momentDate).toLocaleDateString("sv");
        this.member.fechaNacimiento = formattedDate;
      } else {
        this.member.fechaNacimiento = null;
      }
      if (this.member.prefijo_idPrefijo == 6) {
        this.member.prefijo = null;
      }
      this._usuarioService.verifyUser(this.member).subscribe((result) => {
        if (result.length == 0) {
          if (this.member.password === this.memberForm.controls["confirmPassword"].value) {
            if (
              this.memberForm.controls["segundoNombre"].value != "" &&
              this.memberForm.controls["segundoNombre"].value
            ) {
              this.member.nombre += " " + this.memberForm.controls["segundoNombre"].value;
            }
            if (this.adHono == 3) {
              this.member.estado = this.adHono;
            } else if (this.oldMem == 0) {
              this.member.estado = this.oldMem;
            } else {
              this.member.estado = 1;
            }
            this._usuarioService.addUser(this.member).subscribe((res) => {
              if (res.user) {
                if (this.listaPermisos.length > 0) {
                  this.addPermisos(res.user);
                }
                if (this.fileData) {
                  this._usuarioService.uploadUsuarioFoto(this.fileData, res.user).subscribe((res) => {
                    if (res) {
                    }
                  });
                }
                this.openSnackBar("Miembro agregado exitosamente", null);
                this.agregar = true;
                this.return();
              }
            });
          } else {
            this.openSnackBar("Las contraseñas no coinciden", "err-snackbar");
            this.errPass = true;
            this.errEmail = false;
          }
        } else {
          this.openSnackBar("Este usuario ya se encuentra registrado", "err-snackbar");
          this.errEmail = true;
        }
      });
    }
  }

  addPermisos(DNI) {
    if (this.member.tipoUsuario_idTipoUsuario == 2) {
      this.listaPermisos.push(4);
      this.listaPermisos.push(6);
    }
    for (let index = 0; index < this.listaPermisos.length; index++) {
      let permiso = { usuario_DNI: DNI, permiso_idPermiso: this.listaPermisos[index] };
      this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe((res) => {
        if (res) {
        }
      });
    }
  }

  openSnackBar(text, panel) {
    this._snackBar.open(text, null, {
      panelClass: [panel],
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();
  }

  preview() {
    // Show preview
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
    };
  }

  selectPermiso(id, event) {
    if (event) {
      this.listaPermisos.push(id);
    } else {
      let index = this.listaPermisos.findIndex((x) => x === id);
      if (index != -1) {
        this.listaPermisos.splice(index, 1);
      }
    }
  }

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/miembros-activos"]);
  }

  agregar;

  openEraser() {}
  edit;
  permisoNoticia;
  permisoPublicacion;
  permisoProyecto;
  permisoContenido;
}
