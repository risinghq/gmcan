import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BackLinkComponent } from "@app/shared/components/back-link.component";
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
  imports: [BackLinkComponent, ReactiveFormsModule, RouterLink],
})
export default class ChangePassComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly emailService = inject(EmailService);
  private readonly groupService = inject(GroupService);
  private readonly uiState = inject(UiStateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly grupoInfo = this.uiState.groupInfo;
  protected readonly verifying = signal(false);
  protected readonly linkProblem = signal<string | null>(null);
  protected readonly tokenValid = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);
  protected readonly success = signal(false);

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
      this.linkProblem.set("Este enlace está incompleto. Solicita uno nuevo para cambiar tu contraseña.");
      return;
    }

    this.verifying.set(true);
    this.emailService
      .verifyResetToken(this.resetToken)
      .pipe(finalize(() => this.verifying.set(false)))
      .subscribe({
        next: () => this.tokenValid.set(true),
        error: () => this.linkProblem.set("Este enlace expiró o ya fue usado. Solicita uno nuevo."),
      });
  }

  protected resetPassword(): void {
    if (!this.tokenValid() || this.saving() || !this.resetToken) return;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      const first = this.fieldError("password") ? "password" : "confirmPassword";
      this.host.nativeElement.querySelector<HTMLElement>(`form [name="${first}"]`)?.focus();
      return;
    }

    this.saving.set(true);
    this.saveFailed.set(false);
    this.emailService
      .resetPassword(this.resetToken, this.passwordForm.controls.password.value)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.passwordForm.reset();
        },
        error: () => this.saveFailed.set(true),
      });
  }

  protected fieldError(name: "password" | "confirmPassword"): string | null {
    const control = this.passwordForm.controls[name];
    if (!control.touched) return null;

    if (name === "password") {
      if (control.hasError("required")) return "Ingresa una contraseña.";
      if (control.hasError("minlength")) return "La contraseña debe tener al menos 8 caracteres.";
      return null;
    }

    if (control.hasError("required")) return "Repite la contraseña.";
    if (this.passwordForm.hasError("passwordMismatch")) return "Las contraseñas no coinciden.";
    return null;
  }
}
