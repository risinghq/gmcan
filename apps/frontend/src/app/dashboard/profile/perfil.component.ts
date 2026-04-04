import { Component, OnInit, HostListener, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { createUsuarioFull } from "@app/shared/models/factories";
import { Genero } from "@app/shared/models/genero";
import { Prefijo } from "@app/shared/models/prefijo";
import { TipoMiembro } from "@app/shared/models/tipomiembro";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { CommonService } from "@app/shared/services/common.service";
import { GeneroService } from "@app/shared/services/genero.service";
import { GLOBAL } from "@app/shared/services/global";
import { PrefijoService } from "@app/shared/services/prefijo.service";
import { TipoMiembroService } from "@app/shared/services/tipomiembro.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.component.html",
  styleUrls: ["./perfil.component.scss"],
  providers: [provideNativeDateAdapter()],
  imports: [
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
    MatOption,
    MatIconButton,
    MatIcon,
    AutosizeModule,
  ],
})
export default class PerfilComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  _usuarioService = inject(UsuarioService);
  _tipoMiembroService = inject(TipoMiembroService);
  _prefijoService = inject(PrefijoService);
  _generoService = inject(GeneroService);
  private _snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  private _commonService = inject(CommonService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);

  oldMem: number | null = null;
  url: string;
  member: UsuarioFull;
  public memberForm: FormGroup;
  tipoMiembros: TipoMiembro[] = [];
  prefijos: Prefijo[] = [];
  generos: Genero[] = [];
  button_text = "Actualizar información";

  constructor() {
    this.memberForm = this.formBuilder.group({
      nombre: ["", Validators.required],
      segundoNombre: [""],
      apellidoPaterno: ["", Validators.required],
      apellidoMaterno: [""],
      fechaNacimiento: [""],
      correo: ["", Validators.required],
      genero_idGenero: [""],
      prefijo_idPrefijo: [""],
      tipoMiembro_idTipoMiembro: ["", Validators.required],
      DNI: ["", Validators.required],
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required],
      resumenPro: [""],
      resumenProEN: [""],
    });
    this.member = createUsuarioFull();
    this.url = GLOBAL.url;
  }

  hide = true;
  hide2 = true;

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    const user = this._usuarioService.getUserLogged();
    if (!user?.DNI) {
      return;
    }
    this._usuarioService.getFullUser(user.DNI).subscribe((result: UsuarioFull[]) => {
      if (result.length > 0) {
        this.memberForm.controls["DNI"].disable();
        this.member = result[0];
        this.oldEmail = this.member.correo ?? "";
        this.oldPassword = this.member.password ?? "";
        this.memberForm.controls["confirmPassword"].setValue(this.member.password);
        const d = new Date(this.member.fechaNacimiento ?? new Date());
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        this.member.fechaNacimientoDate = d;
        if ((this.member.nombre ?? "").includes(" ")) {
          const string = (this.member.nombre ?? "").split(" ");
          this.member.nombre = string[0];
          this.memberForm.controls["segundoNombre"].setValue(string[1]);
        }
        this.getCargo(this.member);
        this.getNivelAcademico(this.member);
      }
    });
  }

  getCargo(miembro: UsuarioFull): void {
    this._tipoMiembroService.getTipoMiembros().subscribe((res: (TipoMiembro & { nombreSingular?: string })[]) => {
      if (res) {
        this.tipoMiembros = res;
        const index = res.findIndex((x: TipoMiembro) => x.idTipoMiembro === miembro.tipoMiembro_idTipoMiembro);
        if (index !== -1) {
          miembro.tipoMiembro = res[index].nombreSingular ?? "";
        }
      }
    });
  }

  getNivelAcademico(miembro: UsuarioFull): void {
    this._prefijoService.getPrefijos().subscribe((res: Prefijo[]) => {
      if (res) {
        this.prefijos = res;
        const index = res.findIndex((x: Prefijo) => x.idPrefijo === miembro.prefijo_idPrefijo);
        if (index !== -1) {
          miembro.prefijo = res[index].nombre ?? "";
        }
        this.getGenero();
      }
    });
  }

  getGenero(): void {
    this._generoService.getGeneros().subscribe((result: Genero[]) => {
      if (result) {
        this.generos = result;
      }
    });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  errPass = false;
  errEmail = false;
  oldEmail = "";

  oldPassword = "";

  actualizarUsuario(): void {
    if (this.memberForm.valid) {
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate); // Replace event.value with your date value
        const formattedDate = new Date(momentDate).toLocaleDateString("sv");
        this.member.fechaNacimiento = formattedDate;
      } else {
        this.member.fechaNacimiento = undefined;
      }
      const miembroAGuardar: UsuarioFull = JSON.parse(JSON.stringify(this.member));
      if (this.memberForm.controls["segundoNombre"].value != "" && this.memberForm.controls["segundoNombre"].value) {
        miembroAGuardar.nombre =
          `${miembroAGuardar.nombre ?? ""} ${this.memberForm.controls["segundoNombre"].value}`.trim();
      }
      if (this.oldMem !== null && this.oldMem !== miembroAGuardar.estado) {
        miembroAGuardar.estado = this.oldMem;
      }
      this._usuarioService.verifyUser(miembroAGuardar).subscribe((result: unknown[]) => {
        if (result.length === 0 || this.oldEmail === this.member.correo) {
          if (this.member.password === this.memberForm.controls["confirmPassword"].value) {
            this._usuarioService
              .updateUser(miembroAGuardar)
              .subscribe((updateResponse: { status?: number; user?: string }) => {
                if (updateResponse.status === 1) {
                  if (this.member.password !== this.oldPassword) {
                    this._usuarioService
                      .changePassword(miembroAGuardar as { password: string; correo: string })
                      .subscribe((passwordResponse: unknown) => {
                        if (passwordResponse) {
                          this.errPass = false;
                        }
                      });
                  }
                  if (this.fileData) {
                    if (this.member.foto == null && updateResponse.user) {
                      this._usuarioService
                        .uploadUsuarioFoto(this.fileData, updateResponse.user)
                        .subscribe((uploadResponse: unknown) => {
                          if (uploadResponse) {
                          }
                        });
                    } else {
                      if (miembroAGuardar.foto) {
                        this._usuarioService
                          .deleteImage(miembroAGuardar.foto)
                          .subscribe((deleteImageResponse: unknown) => {
                            if (deleteImageResponse) {
                            }
                          });
                      }
                      if (updateResponse.user) {
                        this._usuarioService
                          .uploadUsuarioFoto(this.fileData, updateResponse.user)
                          .subscribe((uploadResponse: unknown) => {
                            if (uploadResponse) {
                            }
                          });
                      }
                    }
                  }
                  this._commonService.setReset(true);
                  this.openSnackBar("Información actualizada exitosamente", undefined);
                  this.getUser();
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

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
  fileProgress(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    this.fileData = input.files?.[0] ?? null;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) {
      this.previewUrl = null;
      return;
    }

    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", () => {
      this.previewUrl = reader.result;
    });
  }

  agregar = false;

  openSnackBar(text: string, panel?: string): void {
    const panelClass = panel ? [panel] : [];
    this._snackBar.open(text, undefined, {
      panelClass,
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  oldMember(value: number): void {
    this.oldMem = value;
  }
}
