import { NgClass } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
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
import { createUsuarioFull } from "@app/shared/models/factories";
import { Genero } from "@app/shared/models/genero";
import { Prefijo } from "@app/shared/models/prefijo";
import { TipoMiembro } from "@app/shared/models/tipomiembro";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { UsuarioPermiso } from "@app/shared/models/usuariopermiso";
import { GeneroService } from "@app/shared/services/genero.service";
import { GLOBAL } from "@app/shared/services/global";
import { PermisoService } from "@app/shared/services/permiso.service";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";
import { AutosizeModule } from "ngx-autosize";

interface PermisoItem {
  idPermiso?: number;
}

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
    MatOption,
    MatIconButton,
    AutosizeModule,
    MatCheckbox,
  ],
})
export default class AddMemberComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _usuarioService = inject(UsuarioService);
  _generoService = inject(GeneroService);
  _tipoMiembroService = inject(TipoMiembroService);
  _prefijoService = inject(PrefijoService);
  _permisosService = inject(PermisoService);
  _usuarioPermisoService = inject(UsuarioHasPermisoService);
  private _snackBar = inject(MatSnackBar);
  _router = inject(Router);
  dialog = inject(MatDialog);

  public memberForm: FormGroup;
  member: UsuarioFull;
  generos: Genero[] = [];
  tipoMiembros: TipoMiembro[] = [];
  prefijos: Prefijo[] = [];
  usuarioPermiso: UsuarioPermiso = {} as UsuarioPermiso;
  listaPermisos: Array<number> = [];
  hide = true;
  hide2 = true;
  url: string;

  button_text = "Registrar nuevo miembro";

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
      tipoMiembro_idTipoMiembro: [Validators.required],
      DNI: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      password: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      confirmPassword: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenPro: [""],
      resumenProEN: [""],
    });
    this.url = GLOBAL.url;
    this.member = createUsuarioFull();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  ngOnInit(): void {
    this.getGenero();
  }

  isDirty(): boolean {
    return this.memberForm.dirty;
  }

  getGenero(): void {
    this._generoService.getGeneros().subscribe((result: Genero[]) => {
      if (result) {
        this.generos = result;
        this.getCargo();
      }
    });
  }

  getCargo(): void {
    this._tipoMiembroService.getTipoMiembros().subscribe((res: TipoMiembro[]) => {
      if (res) {
        this.tipoMiembros = res;
        this.getNivelAcademico();
      }
    });
  }

  getNivelAcademico(): void {
    this._prefijoService.getPrefijos().subscribe((res: Prefijo[]) => {
      if (res) {
        this.prefijos = res;
        this.getPermisos();
      }
    });
  }

  getPermisos(): void {
    this._permisosService.getPermisos().subscribe((res: PermisoItem[]) => {
      if (res) {
      }
    });
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

  addMember(): void {
    if (this.memberForm.valid) {
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate); // Replace event.value with your date value
        const formattedDate = new Date(momentDate).toLocaleDateString("sv");
        this.member.fechaNacimiento = formattedDate;
      } else {
        this.member.fechaNacimiento = null;
      }
      if (this.member.prefijo_idPrefijo == 6) {
        this.member.prefijo = undefined;
      }
      this._usuarioService.verifyUser(this.member).subscribe((result: UsuarioFull[]) => {
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
            this._usuarioService.addUser(this.member).subscribe((res: { user?: string }) => {
              if (res.user) {
                if (this.listaPermisos.length > 0) {
                  this.addPermisos(res.user);
                }
                if (this.fileData) {
                  this._usuarioService.uploadUsuarioFoto(this.fileData, res.user).subscribe((_res: unknown) => {
                    if (res) {
                    }
                  });
                }
                this.openSnackBar("Miembro agregado exitosamente", undefined);
                this.memberForm.markAsPristine();
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

  addPermisos(DNI: string): void {
    if (this.member.tipoUsuario_idTipoUsuario == 2) {
      this.listaPermisos.push(4);
      this.listaPermisos.push(6);
    }
    for (let index = 0; index < this.listaPermisos.length; index++) {
      let permiso = { usuario_DNI: DNI, permiso_idPermiso: this.listaPermisos[index] };
      this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe((_res: unknown) => {});
    }
  }

  openSnackBar(text: string, panel: string = ""): void {
    this._snackBar.open(text, undefined, {
      panelClass: panel ? panel : undefined,
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
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

  return() {
    this._router.navigate(["dashboard/miembros-activos"]);
  }

  openEraser() {}
  edit = false;
  permisoNoticia = false;
  permisoPublicacion = false;
  permisoProyecto = false;
  permisoContenido = false;
}
