import { Component, ElementRef, OnInit, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { Languages } from "@app/shared/models/languages";
import { AuthService } from "@app/shared/services/auth.service";
import { EmailService } from "@app/shared/services/email.service";
import { GroupService } from "@app/shared/services/group.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IconComponent, ReactiveFormsModule, RouterLink],
})
export default class LoginComponent implements OnInit {
  private groupService = inject(GroupService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private emailService = inject(EmailService);
  private authService = inject(AuthService);
  private uiState = inject(UiStateService);
  private titleService = inject(Title);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly grupoinfo = this.uiState.groupInfo;
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly exito = signal<string | null>(null);
  readonly recoverValue = signal(inject(ActivatedRoute).snapshot.queryParamMap.has("recover"));
  readonly loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });
  readonly emailForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });
  readonly language = Languages[0];

  ngOnInit(): void {
    this.titleService.setTitle("GMCAN | " + this.language.login);
    this.groupService.getGroup().subscribe((group) => this.uiState.setGroupInfo(group));
  }

  fieldError(form: FormGroup, name: "email" | "password"): string | null {
    const control = form.controls[name];
    if (!control.touched || !control.errors) return null;

    if (!control.errors["required"]) return "Escribe un correo válido, como nombre@dominio.com.";
    return name === "email" ? "Ingresa tu correo electrónico." : "Ingresa tu contraseña.";
  }

  private rejectInvalid(form: FormGroup): boolean {
    if (form.valid) return false;

    form.markAllAsTouched();
    const first = Object.keys(form.controls).find((name) => form.controls[name].invalid);
    this.host.nativeElement.querySelector<HTMLElement>(`form [name="${first}"]`)?.focus();
    return true;
  }

  login(): void {
    if (this.loading() || this.rejectInvalid(this.loginForm)) return;
    const credentials = {
      email: this.loginForm.controls["email"].value as string,
      password: this.loginForm.controls["password"].value as string,
    };
    this.error.set(null);
    this.loading.set(true);
    this.authService
      .login(credentials)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(["/dashboard"]);
        },
        error: () => {
          this.error.set("Correo electrónico o contraseña incorrectos");
        },
      });
  }

  change(): void {
    this.recoverValue.update((v) => !v);
    this.error.set(null);
    this.exito.set(null);
  }

  recover(): void {
    this.exito.set(null);
    this.error.set(null);
    if (this.loading() || this.rejectInvalid(this.emailForm)) return;
    this.loading.set(true);
    this.emailService
      .requestPasswordReset(this.emailForm.controls["email"].value as string)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.exito.set("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
        },
        error: () => {
          this.error.set("No se pudo procesar la solicitud. Intente más tarde.");
        },
      });
  }
}
