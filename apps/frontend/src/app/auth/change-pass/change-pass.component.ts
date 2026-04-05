import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Router, ActivatedRoute } from "@angular/router";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-change-pass",
  templateUrl: "./change-pass.component.html",
  styleUrl: "./change-pass.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class ChangePassComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private grupoService = inject(GrupoService);
  private session = inject(SessionService);

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

  constructor() {
    this.url = GLOBAL.url;
    this.grupoInfo = createGrupo();

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
    this.language = this.session.getLanguageData<any>() ?? {};
  }

  private getGrupoInfo(): void {
    this.grupoService.getGrupoInfo().subscribe({
      next: (res: Grupo[]) => {
        if (res && res.length > 0) {
          this.grupoInfo = res[0];
          this.session.setGrupoInfo(this.grupoInfo);
          this.grupoInfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoInfo.logoHeader;
        }
      },
      error: (error: any) => {
        console.error("Error getting grupo info:", error);
      },
    });
  }

  private extractAndVerifyToken(): void {
    const token = this.route.snapshot.queryParams["token"] as string | undefined;

    if (!token) {
      this.error = "Token de recuperación no válido o no encontrado en la URL.";
      return;
    }

    this.resetToken = token;
    this.verifyToken(token);
  }

  private verifyToken(token: string): void {
    this.loading = true;
    this.error = null;

    this.usuarioService.verifyResetToken({ token }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tokenValid = true;
          this.userInfo = response.user;
        } else {
          this.error = response.message || "Token inválido o expirado.";
          this.tokenValid = false;
        }
      },
      error: (error: any) => {
        console.error("Token verification error:", error);
        this.error = "Token inválido o expirado. Por favor, solicita un nuevo enlace.";
        this.tokenValid = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
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
      next: (response: any) => {
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
      error: (error: any) => {
        console.error("Password reset error:", error);
        this.error = "Error al cambiar la contraseña. Por favor intenta nuevamente.";
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  public returnToLogin(): void {
    this.router.navigate(["/login"]);
  }

  public get passwordControl(): AbstractControl {
    return this.passwordForm.get("password")!;
  }

  public get confirmPasswordControl(): AbstractControl {
    return this.passwordForm.get("confirmPassword")!;
  }

  public hasError(controlName: string, errorType: string): boolean {
    const control = this.passwordForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}
