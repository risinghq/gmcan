import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Router, ActivatedRoute } from "@angular/router";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { EmailService } from "@app/shared/services/email.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SessionService } from "@app/shared/services/session.service";

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
  private _emailService = inject(EmailService);
  private _groupService = inject(GroupService);
  private session = inject(SessionService);

  public passwordForm: FormGroup;
  public grupoInfo: Group;
  public url: string;
  public loading = false;
  public success = false;
  public error: string | null = null;
  public language: any;

  private resetToken: string | null = null;
  public tokenValid = false;

  constructor() {
    this.url = GLOBAL.url;
    this.grupoInfo = createGroup();

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
    this.loadGroupInfo();
    this.extractAndVerifyToken();
  }

  private initializeLanguage(): void {
    this.language = this.session.language();
  }

  private loadGroupInfo(): void {
    this._groupService.getGroup().subscribe({
      next: (group: Group) => {
        this.grupoInfo = group;
        this.grupoInfo.logoHeader = this.url + "api/group/files/header";
        this.session.setGroupInfo(this.grupoInfo);
      },
    });
    this.grupoInfo.logoHeader = this.url + "api/group/files/header";
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

    this._emailService.verifyResetToken(token).subscribe({
      next: (response) => {
        this.tokenValid = response.valid;
        if (!response.valid) {
          this.error = "Token inválido o expirado. Por favor, solicita un nuevo enlace.";
        }
      },
      error: () => {
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

    this._emailService.resetPassword(this.resetToken, this.passwordForm.value.password as string).subscribe({
      next: (response) => {
        if (response.status === 1) {
          this.success = true;
          this.passwordForm.reset();
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 3000);
        } else {
          this.error = "Error al cambiar la contraseña";
        }
      },
      error: () => {
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
