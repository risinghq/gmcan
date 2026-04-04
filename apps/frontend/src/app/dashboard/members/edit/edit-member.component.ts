import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
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
import { createUsuarioFull } from "@app/shared/models/factories";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { UsuarioPermiso } from "@app/shared/models/usuariopermiso";
import { GeneroService } from "@app/shared/services/genero.service";
import { GLOBAL } from "@app/shared/services/global";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";
import { AutosizeModule } from "ngx-autosize";

interface StatusResponse {
  status?: number;
  user?: number;
}

interface TipoMiembroOption {
  idTipoMiembro?: number;
  nombreSingular?: string;
  nombre?: string;
}

interface PrefijoOption {
  idPrefijo?: number;
  nombre?: string;
}

interface GeneroOption {
  idGenero?: number;
  nombre?: string;
}

/*
interface PermisoResponse {
  permiso_idPermiso?: number;
  usuario_DNI?: string;
}
*/

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
    MatOption,
    MatIconButton,
    AutosizeModule,
    MatCheckbox,
  ],
})
export default class EditMemberComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _usuarioService = inject(UsuarioService);
  _tipoMiembroService = inject(TipoMiembroService);
  _prefijoService = inject(PrefijoService);
  _generoService = inject(GeneroService);
  _usuarioPermisoService = inject(UsuarioHasPermisoService);
  private _snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  _publicacionAutoresService = inject(PublicacionAutoresService);
  _noticiaService = inject(NoticiaService);

  url: string;
  public memberForm: FormGroup;
  member: UsuarioFull = createUsuarioFull();
  tipoMiembros: TipoMiembroOption[] = [];
  prefijos: PrefijoOption[] = [];
  generos: GeneroOption[] = [];
  listaPermisos: number[] = [];
  button_text = "Actualizar información";
  permisosExistentes: UsuarioPermiso[] = [];
  edit = false;

  constructor() {
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
    this.member = createUsuarioFull();
    this.url = GLOBAL.url;
  }

  hide = true;
  hide2 = true;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit(): void {
    this.getUser();
  }

  isDirty(): boolean {
    return this.memberForm.dirty;
  }

  oldPassword = "";

  getUser(): void {
    this._route.params.forEach((params: Params) => {
      const DNI = String(params["id"] ?? "");
      this._usuarioService.getFullUser(DNI).subscribe((result: UsuarioFull[]) => {
        if (result.length > 0) {
          this.memberForm.controls["DNI"].disable();
          this.member = result[0];
          this.oldEmail = this.member.correo ?? "";
          this.oldPassword = this.member.password ?? "";
          this.memberForm.controls["confirmPassword"].setValue(this.member.password);
          const d = new Date(this.member.fechaNacimiento ?? new Date());
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.member.fechaNacimientoDate = d;
          if (this.member.apellidoMaterno) {
            this.member.nombreCompleto =
              this.member.nombre + " " + this.member.apellidoPaterno + " " + this.member.apellidoMaterno;
          } else {
            this.member.nombreCompleto = this.member.nombre + " " + this.member.apellidoPaterno;
          }
          localStorage.setItem("miembroEdit", JSON.stringify(this.member.nombreCompleto));
          if ((this.member.nombre ?? "").includes(" ")) {
            const parts = (this.member.nombre ?? "").split(" ");
            this.member.nombre = parts[0] ?? "";
            this.memberForm.controls["segundoNombre"].setValue(parts[1] ?? "");
          }
          this.getCargo(this.member);
          this.getNivelAcademico(this.member);
        }
      });
    });
  }

  getCargo(miembro: UsuarioFull): void {
    this._tipoMiembroService.getTipoMiembros().subscribe((res: TipoMiembroOption[]) => {
      if (res) {
        this.tipoMiembros = res;
        const index = res.findIndex((x: TipoMiembroOption) => x.idTipoMiembro === miembro.tipoMiembro_idTipoMiembro);
        if (index != -1) {
          miembro.tipoMiembro = res[index].nombre ?? res[index].nombreSingular ?? "";
        }
      }
    });
  }

  getNivelAcademico(miembro: UsuarioFull): void {
    this._prefijoService.getPrefijos().subscribe((res: PrefijoOption[]) => {
      if (res) {
        this.prefijos = res;
        const index = res.findIndex((x: PrefijoOption) => x.idPrefijo === miembro.prefijo_idPrefijo);
        if (index != -1) {
          miembro.prefijo = res[index].nombre ?? "";
        }
        this.getGenero(miembro);
      }
    });
  }

  getGenero(miembro: UsuarioFull): void {
    this._generoService.getGeneros().subscribe((result: GeneroOption[]) => {
      if (result) {
        this.generos = result;
        this.getPermisos(miembro);
      }
    });
  }

  getPermisos(miembro: UsuarioFull): void {
    this._usuarioPermisoService.getUsuarioHasPermiso(miembro.DNI ?? "").subscribe((result: UsuarioPermiso[]) => {
      if (result) {
        this.permisosExistentes = result;
        this.validarPermisos(this.permisosExistentes);
        this.getPublicaciones(miembro);
      }
    });
  }

  getPublicaciones(miembro: UsuarioFull): void {
    this._publicacionAutoresService.getByUser(miembro.DNI ?? "").subscribe((result) => {
      if (result.length == 0) {
        this.edit = true;
      }
      if (this.edit) {
        this.getNoticias(miembro);
      }
    });
  }

  getNoticias(miembro: UsuarioFull): void {
    this._noticiaService.getNoticiaUsuario(miembro.DNI ?? "").subscribe((result: unknown[]) => {
      if (result.length == 0) {
        this.edit = true;
      } else {
        this.edit = false;
      }
    });
  }

  permisoNoticia = false;
  permisoPublicacion = false;
  permisoProyecto = false;
  permisoContenido = false;

  validarPermisos(permisos: UsuarioPermiso[]): void {
    for (let index = 0; index < permisos.length; index++) {
      switch (Number(permisos[index].permiso_idPermiso ?? 0)) {
        case 1:
          this.permisoNoticia = true;
          this.listaPermisos.push(Number(permisos[index].permiso_idPermiso ?? 0));
          break;
        case 3:
          this.permisoPublicacion = true;
          this.listaPermisos.push(Number(permisos[index].permiso_idPermiso ?? 0));
          break;
        case 2:
          this.permisoProyecto = true;
          this.listaPermisos.push(Number(permisos[index].permiso_idPermiso ?? 0));
          break;
        case 5:
          this.permisoContenido = true;
          this.listaPermisos.push(Number(permisos[index].permiso_idPermiso ?? 0));
          break;
        default:
          break;
      }
    }
  }

  selectPermiso(id: number, event: boolean): void {
    if (event) {
      this.listaPermisos.push(id);
    } else {
      const index = this.listaPermisos.findIndex((x: number) => x === id);
      if (index != -1) {
        this.listaPermisos.splice(index, 1);
      }
    }
  }

  adHono = 0;

  setCoord(value: number): void {
    this.member.tipoUsuario_idTipoUsuario = value;
  }

  adHonorem(value: number): void {
    this.adHono = value;
  }

  oldMem = 0;
  oldMember(value: number): void {
    this.oldMem = value;
  }

  errPass = false;
  errEmail = false;
  oldEmail = "";

  addMember(): void {
    if (this.memberForm.valid) {
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate);
        const formattedDate = new Date(momentDate).toLocaleDateString("sv");
        this.member.fechaNacimiento = formattedDate;
      } else {
        this.member.fechaNacimiento = undefined;
      }
      this._usuarioService.verifyUser(this.member).subscribe((result: UsuarioFull[]) => {
        if (result.length == 0 || this.oldEmail == this.member.correo) {
          if (this.member.password === this.memberForm.controls["confirmPassword"].value) {
            if (
              this.memberForm.controls["segundoNombre"].value != "" &&
              this.memberForm.controls["segundoNombre"].value
            ) {
              this.member.nombre =
                `${this.member.nombre ?? ""} ${this.memberForm.controls["segundoNombre"].value}`.trim();
            }
            if (this.adHono == 3) {
              this.member.estado = this.adHono;
            } else if (this.oldMem == 0) {
              this.member.estado = this.oldMem;
            } else if (!this.member.estado) {
              this.member.estado = 1;
            }
            this._usuarioService.updateUser(this.member).subscribe((res: StatusResponse) => {
              if (res.status == 1) {
                if (this.member.password != this.oldPassword) {
                  this._usuarioService
                    .changePassword({
                      password: this.member.password ?? "",
                      correo: this.member.correo ?? "",
                    })
                    .subscribe((passwordResult: unknown) => {
                      if (passwordResult) {
                      }
                    });
                }
                if (this.fileData) {
                  if (this.member.foto == null) {
                    this._usuarioService
                      .uploadUsuarioFoto(this.fileData, String(res.user ?? ""))
                      .subscribe((uploadResult: unknown) => {
                        if (uploadResult) {
                        }
                      });
                  } else {
                    this._usuarioService.deleteImage(String(this.member.foto)).subscribe((deleteResult: unknown) => {
                      if (deleteResult) {
                      }
                    });
                    this._usuarioService
                      .uploadUsuarioFoto(this.fileData, String(res.user ?? ""))
                      .subscribe((uploadResult: unknown) => {
                        if (uploadResult) {
                        }
                      });
                  }
                }
                this.openSnackBar("Miembro actualizado exitosamente");
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

  setPermisos(): void {
    let permisoEx: UsuarioPermiso | undefined;
    if (this.permisosExistentes.length > 0) {
      permisoEx = this.permisosExistentes[0];
    }
    if (this.member.tipoUsuario_idTipoUsuario == 2) {
      this.listaPermisos.push(4);
      this.listaPermisos.push(6);
    }
    if (permisoEx) {
      this._usuarioPermisoService
        .deletePermisoUsuario({ usuario_DNI: permisoEx.usuario_DNI ?? "" })
        .subscribe((deleteResult: unknown) => {
          if (deleteResult) {
          }
          for (let index = 0; index < this.listaPermisos.length; index++) {
            let permiso = {
              usuario_DNI: this.member.DNI ?? "",
              permiso_idPermiso: this.listaPermisos[index],
            };
            this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe((addResult: unknown) => {
              if (addResult) {
              }
            });
          }
        });
    } else {
      for (let index = 0; index < this.listaPermisos.length; index++) {
        let permiso = {
          usuario_DNI: this.member.DNI ?? "",
          permiso_idPermiso: this.listaPermisos[index],
        };
        this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe((addResult: unknown) => {
          if (addResult) {
          }
        });
      }
    }
  }

  fileData: File | null = null;
  previewUrl: any = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
  fileProgress(fileInput: any): void {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();
  }

  preview(): void {
    // Show preview
    if (!this.fileData) {
      return;
    }
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", (_event: ProgressEvent<FileReader>) => {
      this.previewUrl = reader.result;
    });
  }

  openSnackBar(text: string, panel?: string): void {
    this._snackBar.open(text, undefined, {
      panelClass: panel ? [panel] : [],
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

  private dialogRef2?: MatDialogRef<DialogCancel5>;

  openEraser(): void {
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

      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.erasePermisos();
        }
      });
    }
  }

  erasePermisos(): void {
    let end = false;
    for (let index = 0; index < this.permisosExistentes.length; index++) {
      this._usuarioPermisoService
        .deletePermisoUsuario({ usuario_DNI: this.permisosExistentes[index].usuario_DNI ?? "" })
        .subscribe((deleteResult: unknown) => {
          if (deleteResult) {
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

  eraseUser(): void {
    if (this.member.foto)
      this._usuarioService.deleteImage(String(this.member.foto)).subscribe((deleteImageResult: unknown) => {
        if (deleteImageResult) {
        }
      });
    this._usuarioService.deleteUsuario({ DNI: String(this.member.DNI ?? "") }).subscribe((result: StatusResponse) => {
      if (result.status == 1) {
        this.memberForm.markAsPristine();
        this.return();
        this.openSnackBar("Usuario eliminado exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogCancel5 {
  dialogRef = inject<MatDialogRef<DialogCancel5>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
