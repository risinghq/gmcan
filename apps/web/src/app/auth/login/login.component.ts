import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { Languages } from "@app/shared/models/languages";
import { AuthService } from "@app/shared/services/auth.service";
import { EmailService } from "@app/shared/services/email.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SessionService } from "@app/shared/services/session.service";
import { UiStateService } from "@app/shared/services/ui-state.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class LoginComponent implements OnInit {
  private groupService = inject(GroupService);
  fb = inject(FormBuilder);
  private router = inject(Router);
  private emailService = inject(EmailService);
  authService = inject(AuthService);
  private session = inject(SessionService);
  private uiState = inject(UiStateService);
  private titleService = inject(Title);

  public grupoinfo: Group;
  public url: string;
  public loginForm: FormGroup;
  public emailForm: FormGroup;
  error: string | null = null;
  exito: string | null = null;
  language: (typeof Languages)[number] = Languages[0];

  constructor() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
    this.emailForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
    this.grupoinfo = createGroup();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.session.setLanguage(Languages[0], 0);
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | " + this.language.login);
    this.getGrupoInfo();
  }

  getGrupoInfo(): void {
    this.grupoinfo = this.uiState.groupInfo();
    this.groupService.getGroup().subscribe((group: Group) => {
      this.grupoinfo = group;
      this.uiState.setGroupInfo(this.grupoinfo);
    });
  }

  login(): void {
    if (!this.loginForm.invalid) {
      const credentials = {
        email: this.loginForm.controls["email"].value as string,
        password: this.loginForm.controls["password"].value as string,
      };
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(["/dashboard"]);
        },
        error: () => {
          this.error = "Correo electrónico o contraseña incorrectos";
        },
      });
    }
  }

  recoverValue = false;

  change(): void {
    this.recoverValue = !this.recoverValue;
    this.error = null;
    this.exito = null;
  }

  recover(): void {
    this.exito = null;
    this.error = null;
    if (this.emailForm.invalid) {
      return;
    }
    const request = {
      email: this.emailForm.controls["email"].value as string,
    };
    this.emailService.sendPasswordReset(request).subscribe({
      next: (res) => {
        if (res?.success) {
          this.exito = res.message;
        } else {
          this.error = res?.message || "Ocurrió un error al procesar la solicitud.";
        }
      },
      error: () => {
        this.error = "Hubo un problema de conexión. Intente más tarde.";
      },
    });
  }

  return(): void {
    this.router.navigate(["/home"]);
  }
}
