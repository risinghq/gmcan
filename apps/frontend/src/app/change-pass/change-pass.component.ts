import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { UsuarioService } from "../services/usuario.service";
import { GrupoService } from "../services/grupo.service";
import { Grupo } from "../models/grupo";
import { GLOBAL } from "../services/global";

@Component({
  standalone: false,
  selector: "app-change-pass",
  templateUrl: "./change-pass.component.html",
  styleUrls: ["./change-pass.component.scss"],
})
export class ChangePassComponent implements OnInit {
  public passwordForm: FormGroup;
  public grupoInfo: Grupo;
  public url: string;
  public loading = false;
  public success = false;
  public error: string | null = null;
  public language: any;

  private resetToken: string | null = null;
  public userInfo: any = null;
  public tokenValid = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private grupoService: GrupoService,
  ) {
    this.url = GLOBAL.url;
    this.grupoInfo= new Grupo(0,'','','','','','','','','','','','','','','','','','','','','','','','',null,null);

    this.passwordForm = this.fb.group(
      {
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit(): void {
    this.initializeLanguage();
    this.getGrupoInfo();
    this.extractAndVerifyToken();
  }

  private initializeLanguage(): void {
    try {
      this.language = JSON.parse(localStorage.getItem("language") || "{}");
    } catch (error) {
      console.error("Error parsing language from localStorage:", error);
      this.language = {};
    }
  }

  private getGrupoInfo(): void {
    this.grupoService.getGrupoInfo().subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.grupoInfo = res[0];
          localStorage.setItem("grupoInfo", JSON.stringify(this.grupoInfo));
          this.grupoInfo.logoHeader =
            this.url + "grupo/get-image-grupo/" + this.grupoInfo.logoHeader;
        }
      },
      error: (error) => {
        console.error("Error getting grupo info:", error);
      },
    });
  }

  private extractAndVerifyToken(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params["token"];

      if (!token) {
        this.error = "Token de recuperación no válido o no encontrado en la URL.";
        return;
      }

      this.resetToken = token;
      this.verifyToken(this.resetToken);
    });
  }

  private verifyToken(token: string): void {
    this.loading = true;
    this.error = null;

    this.usuarioService.verifyResetToken({ token }).subscribe({
      next: (response) => {
        if (response.success) {
          this.tokenValid = true;
          this.userInfo = response.user;
        } else {
          this.error = response.message || "Token inválido o expirado.";
          this.tokenValid = false;
        }
      },
      error: (error) => {
        console.error("Token verification error:", error);
        this.error = "Token inválido o expirado. Por favor, solicita un nuevo enlace.";
        this.tokenValid = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): { [key: string]: any } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  public get passwordsMatch(): boolean {
    return !this.passwordForm.hasError("passwordMismatch");
  }

  public get isFormValid(): boolean {
    return this.passwordForm.valid && this.tokenValid;
  }

  public resetPassword(): void {
    if (!this.isFormValid || !this.resetToken) {
      return;
    }

    this.loading = true;
    this.error = null;

    const resetData = {
      token: this.resetToken,
      password: this.passwordForm.value.password,
    };

    this.usuarioService.resetPassword(resetData).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = true;
          this.passwordForm.reset();

          // Redirect to login after showing success message
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 3000);
        } else {
          this.error = response.message || "Error al cambiar la contraseña";
        }
      },
      error: (error) => {
        console.error("Password reset error:", error);
        this.error =
          "Error al cambiar la contraseña. Por favor intenta nuevamente.";
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  public returnToLogin(): void {
    this.router.navigate(["/login"]);
  }

  public get passwordControl() {
    return this.passwordForm.get("password");
  }

  public get confirmPasswordControl() {
    return this.passwordForm.get("confirmPassword");
  }

  public hasError(controlName: string, errorType: string): boolean {
    const control = this.passwordForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}
