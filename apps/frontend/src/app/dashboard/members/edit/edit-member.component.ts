import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, HostListener, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { MatCheckbox } from "@angular/material/checkbox";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
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
import { Params, Router, ActivatedRoute } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { Genero } from "@app/shared/models/genero";
import { Prefijo } from "@app/shared/models/prefijo";
import { TipoMiembro } from "@app/shared/models/tipomiembro";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
import { UsuarioPermiso } from "@app/shared/models/usuariopermiso";
import { GeneroService } from "@app/shared/services/genero.service";
import { GLOBAL } from "@app/shared/services/global";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-edit-member",
  templateUrl: "../add/add-member.component.html",
  styleUrls: ["./edit-member.component.scss"],
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
  ],
})
export default class EditMemberComponent implements OnInit, HasUnsavedChanges {
  url;
  public memberForm: FormGroup;
  member: UsuarioFull;
  tipoMiembros: Array<TipoMiembro>;
  prefijos: Array<Prefijo>;
  generos: Array<Genero>;
  listaPermisos: Array<any>;
  button_text = "Actualizar información";
  permisosExistentes: Array<UsuarioPermiso>;
  edit = false;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public _usuarioService: UsuarioService,
    public _tipoMiembroService: TipoMiembroService,
    public _prefijoService: PrefijoService,
    public _generoService: GeneroService,
    public _usuarioPermisoService: UsuarioHasPermisoService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public _usuarioPublicacionService: PublicacionHasUsuarioService,
    public _noticiaService: NoticiaService,
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
      tipoMiembro_idTipoMiembro: ["", [Validators.required]],
      DNI: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      password: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      confirmPassword: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenPro: [""],
      resumenProEN: [""],
    });
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
      null,
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
    this.url = GLOBAL.url;
  }

  hide = true;
  hide2 = true;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit() {
    this.listaPermisos = [];
    this.getUser();
  }

  isDirty(): boolean {
    return this.memberForm.dirty;
  }

  oldPassword;

  getUser() {
    this._route.params.forEach((params: Params) => {
      let DNI = params["id"];
      this._usuarioService.getFullUser(DNI).subscribe((result) => {
        if (result.length > 0) {
          this.memberForm.controls["DNI"].disable();
          this.member = result[0];
          this.oldEmail = this.member.correo;
          this.oldPassword = this.member.password;
          this.memberForm.controls["confirmPassword"].setValue(this.member.password);
          var d = new Date(this.member.fechaNacimiento);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.member.fechaNacimientoDate = d;
          if (this.member.apellidoMaterno) {
            this.member.nombreCompleto =
              this.member.nombre + " " + this.member.apellidoPaterno + " " + this.member.apellidoMaterno;
          } else {
            this.member.nombreCompleto = this.member.nombre + " " + this.member.apellidoPaterno;
          }
          localStorage.setItem("miembroEdit", JSON.stringify(this.member.nombreCompleto));
          if (this.member.nombre.includes(" ")) {
            let string = this.member.nombre.split(" ");
            this.member.nombre = string[0];
            this.memberForm.controls["segundoNombre"].setValue(string[1]);
          }
          this.getCargo(this.member);
          this.getNivelAcademico(this.member);
        }
      });
    });
  }

  getCargo(miembro) {
    this._tipoMiembroService.getTipoMiembros().subscribe((res) => {
      if (res) {
        this.tipoMiembros = res;
        let index = res.findIndex((x) => x.idTipoMiembro === miembro.tipoMiembro_idTipoMiembro);
        if (index != -1) {
          miembro.tipoMiembro = res[index].nombreSingular;
        }
      }
    });
  }

  getNivelAcademico(miembro) {
    this._prefijoService.getPrefijos().subscribe((res) => {
      if (res) {
        this.prefijos = res;
        let index = res.findIndex((x) => x.idPrefijo === miembro.prefijo_idPrefijo);
        if (index != -1) {
          miembro.prefijo = res[index].nombre;
        }
        this.getGenero(miembro);
      }
    });
  }

  getGenero(miembro) {
    this._generoService.getGeneros().subscribe((result) => {
      if (result) {
        this.generos = result;
        this.getPermisos(miembro);
      }
    });
  }

  getPermisos(miembro) {
    this._usuarioPermisoService.getUsuarioHasPermiso(miembro.DNI).subscribe((result) => {
      if (result) {
        this.permisosExistentes = result;
        this.validarPermisos(this.permisosExistentes);
        this.getPublicaciones(miembro);
      }
    });
  }

  getPublicaciones(miembro) {
    this._usuarioPublicacionService.searchPublicacionHasUsuario(miembro.DNI).subscribe((result) => {
      if (result.length == 0) {
        this.edit = true;
      }
      if (this.edit) {
        this.getNoticias(miembro);
      }
    });
  }

  getNoticias(miembro) {
    this._noticiaService.getNoticiaUsuario(miembro.DNI).subscribe((result) => {
      if (result.length == 0) {
        this.edit = true;
      } else {
        this.edit = false;
      }
    });
  }

  permisoNoticia;
  permisoPublicacion;
  permisoProyecto;
  permisoContenido;

  validarPermisos(permisos) {
    for (let index = 0; index < permisos.length; index++) {
      switch (permisos[index].permiso_idPermiso) {
        case 1:
          this.permisoNoticia = true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        case 3:
          this.permisoPublicacion = true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        case 2:
          this.permisoProyecto = true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        case 5:
          this.permisoContenido = true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        default:
          break;
      }
    }
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

  adHono;

  setCoord(value) {
    this.member.tipoUsuario_idTipoUsuario = value;
  }

  adHonorem(value) {
    this.adHono = value;
  }

  oldMem;
  oldMember(value) {
    this.oldMem = value;
  }

  errPass;
  errEmail;
  oldEmail;

  addMember() {
    if (this.memberForm.valid) {
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate); // Replace event.value with your date value
        const formattedDate = new Date(momentDate).toLocaleDateString("sv");
        this.member.fechaNacimiento = formattedDate;
      } else {
        this.member.fechaNacimiento = null;
      }
      this._usuarioService.verifyUser(this.member).subscribe((result) => {
        if (result.length == 0 || this.oldEmail == this.member.correo) {
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
            } else if (!this.member.estado) {
              this.member.estado = 1;
            }
            this._usuarioService.updateUser(this.member).subscribe((res) => {
              if (res.status == 1) {
                if (this.member.password != this.oldPassword) {
                  this._usuarioService
                    .changePassword({
                      password: this.member.password,
                      correo: this.member.correo,
                    })
                    .subscribe((res) => {
                      if (res) {
                      }
                    });
                }
                if (this.fileData) {
                  if (this.member.foto == null) {
                    this._usuarioService.uploadUsuarioFoto(this.fileData, res.user).subscribe((res) => {
                      if (res) {
                      }
                    });
                  } else {
                    this._usuarioService.deleteImage(String(this.member.foto)).subscribe((res) => {
                      if (res) {
                      }
                    });
                    this._usuarioService.uploadUsuarioFoto(this.fileData, res.user).subscribe((res) => {
                      if (res) {
                      }
                    });
                  }
                }
                this.openSnackBar("Miembro actualizado exitosamente", null);
                this.memberForm.markAsPristine();
                this.return();
              }
              this.setPermisos();
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

  setPermisos() {
    let permisoEx;
    if (this.permisosExistentes.length > 0) {
      permisoEx = this.permisosExistentes[0];
    }
    if (this.member.tipoUsuario_idTipoUsuario == 2) {
      this.listaPermisos.push(4);
      this.listaPermisos.push(6);
    }
    if (permisoEx) {
      this._usuarioPermisoService.deletePermisoUsuario(permisoEx).subscribe((res) => {
        if (res) {
        }
        for (let index = 0; index < this.listaPermisos.length; index++) {
          let permiso = {
            usuario_DNI: this.member.DNI,
            permiso_idPermiso: this.listaPermisos[index],
          };
          this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe((res) => {
            if (res) {
            }
          });
        }
      });
    } else {
      for (let index = 0; index < this.listaPermisos.length; index++) {
        let permiso = {
          usuario_DNI: this.member.DNI,
          permiso_idPermiso: this.listaPermisos[index],
        };
        this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe((res) => {
          if (res) {
          }
        });
      }
    }
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

  openSnackBar(text, panel) {
    this._snackBar.open(text, null, {
      panelClass: [panel],
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  return() {
    if (localStorage.getItem("active-member") == "1") {
      this._router.navigate(["dashboard/miembros-activos"]);
    } else {
      this._router.navigate(["dashboard/miembros-antiguos"]);
    }
  }

  private dialogRef2: MatDialogRef<DialogCancel5>;

  openEraser() {
    if (this.edit) {
      this.dialogRef2 = this.dialog.open(DialogCancel5, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar miembro",
          text: "¿Estás seguro que deseas eliminar a este miembro del grupo?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });

      this.dialogRef2.afterClosed().subscribe((result) => {
        if (result) {
          this.erasePermisos();
        }
      });
    }
  }

  erasePermisos() {
    let end;
    for (let index = 0; index < this.permisosExistentes.length; index++) {
      this._usuarioPermisoService.deletePermisoUsuario(this.permisosExistentes[index]).subscribe((result) => {
        if (result) {
        }
      });
      if (index == this.permisosExistentes.length - 1) {
        end = true;
      }
    }
    if (this.permisosExistentes.length == 0) {
      end = true;
    }
    if (end) {
      this.eraseUser();
    }
  }

  eraseUser() {
    if (this.member.foto)
      this._usuarioService.deleteImage(String(this.member.foto)).subscribe((res) => {
        if (res) {
        }
      });
    this._usuarioService.deleteUsuario({ DNI: String(this.member.DNI) }).subscribe((result) => {
      if (result.status == 1) {
        this.memberForm.markAsPristine();
        this.return();
        this.openSnackBar("Usuario eliminado exitosamente", null);
      } else {
        this.openSnackBar("Hubo un problema al eliminar", null);
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogCancel5 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel5>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
