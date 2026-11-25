import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { EmailService } from "@app/shared/services/email.service";
import { GroupService } from "@app/shared/services/group.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { finalize } from "rxjs";

function passwordsMatch(control: AbstractControl): { passwordMismatch: true } | null {
  return control.get("password")?.value === control.get("confirmPassword")?.value ? null : { passwordMismatch: true };
}

@Component({
  selector: "app-change-pass",
  templateUrl: "./change-pass.component.html",
  styleUrl: "./change-pass.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class ChangePassComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly emailService = inject(EmailService);
  private readonly groupService = inject(GroupService);
  private readonly uiState = inject(UiStateService);

  protected readonly grupoInfo = this.uiState.groupInfo;
  protected readonly loading = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tokenValid = signal(false);

  protected readonly passwordForm = inject(FormBuilder).nonNullable.group(
    {
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
    },
    { validators: passwordsMatch },
  );

  private readonly resetToken = this.route.snapshot.queryParams["token"] as string | undefined;

  ngOnInit(): void {
    this.groupService.getGroup().subscribe((group) => this.uiState.setGroupInfo(group));

    if (!this.resetToken) {
      this.error.set("Token de recuperación no válido o no encontrado en la URL.");
      return;
    }

    this.loading.set(true);
    this.emailService
      .verifyResetToken(this.resetToken)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.tokenValid.set(true),
        error: () => this.error.set("Token inválido o expirado. Por favor, solicita un nuevo enlace."),
      });
  }

  protected get confirmPasswordControl(): AbstractControl {
    return this.passwordForm.controls.confirmPassword;
  }

  protected get isFormValid(): boolean {
    return this.passwordForm.valid && this.tokenValid();
  }

  protected resetPassword(): void {
    if (!this.isFormValid || !this.resetToken) return;

    this.loading.set(true);
    this.error.set(null);
    this.emailService
      .resetPassword(this.resetToken, this.passwordForm.controls.password.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.passwordForm.reset();
          setTimeout(() => this.router.navigate(["/login"]), 3000);
        },
        error: () => this.error.set("Error al cambiar la contraseña. Por favor intenta nuevamente."),
      });
  }

  protected returnToLogin(): void {
    this.router.navigate(["/login"]);
  }

  protected hasError(controlName: "password" | "confirmPassword", errorType: string): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.hasError(errorType) && control.touched;
  }
}
