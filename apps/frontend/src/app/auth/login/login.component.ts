import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
import { AuthService } from "@app/shared/services/auth.service";
import { EmailService } from "@app/shared/services/email.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule],
})
export default class LoginComponent implements OnInit {
  _usuarioService = inject(UsuarioService);
  _grupoService = inject(GrupoService);
  fb = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _emailService = inject(EmailService);
  authService = inject(AuthService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  public grupoinfo: Grupo;
  public url: string;
  public loginForm: FormGroup;
  public emailForm: FormGroup;
  public previouslink: string | null = null;
  error: string | null = null;
  exito: string | null = null;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
    this.loginForm = this.fb.group({
      correo: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
    this.emailForm = this.fb.group({
      correo: ["", [Validators.required, Validators.email]],
    });
    this.grupoinfo = createGrupo();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.session.setLanguageId(0);
    this.language = Languages[0];
    this.session.setLanguageData(this.language);
    this.language = this.session.getLanguageData<(typeof Languages)[number]>() ?? Languages[0];
    this.titleService.setTitle("GMCAN | " + this.language.login);
    this.getGrupoInfo();
    this.previouslink = this.session.getPreviousPage();
  }

  getGrupoInfo(): void {
    this.grupoinfo = this.session.getGrupoInfo();
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      this.grupoinfo = res[0];
      this.session.setGrupoInfo(this.grupoinfo);
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
    });
    this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
  }

  login(): void {
    if (!this.loginForm.invalid) {
      let user = {
        correo: this.loginForm.controls["correo"].value,
        password: this.loginForm.controls["password"].value,
      };
      this.authService.login(user).subscribe((res: any) => {
        if (res.state == 1) {
          window.location.href = "/dashboard";
        } else {
          this.error = "Correo electrónico o contraseña incorrectos";
        }
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
    let user = {
      correo: this.emailForm.controls["correo"].value,
    };
    this._emailService.sendPasswordReset(user).subscribe(
      (res: any) => {
        if (res && res.success) {
          this.exito = res.message;
        } else {
          this.error = (res && res.message) || "Ocurrió un error al procesar la solicitud.";
        }
      },
      (_err: any) => {
        this.error = "Hubo un problema de conexión. Intente más tarde.";
      },
    );
  }
  return(): void {
    this._router.navigate(["/home"]);
  }
}
