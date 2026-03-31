import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";

import { Grupo } from "../models/grupo";
import { Languages } from "../models/languages";
import { AuthService } from "../services/auth.service";
import { EmailService } from "../services/email.service";
import { GLOBAL } from "../services/global";
import { GrupoService } from "../services/grupo.service";
import { UsuarioService } from "../services/usuario.service";

@Component({
  standalone: false,
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public grupoinfo: Grupo;
  public url;
  public loginForm: FormGroup;
  public emailForm: FormGroup;
  public previouslink;
  constructor(
    public _usuarioService: UsuarioService,
    public _grupoService: GrupoService,
    public fb: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public _emailService: EmailService,
    public authService: AuthService,
    private titleService: Title,
  ) {
    this.loginForm = this.fb.group({
      correo: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
    this.emailForm = this.fb.group({
      correo: ["", [Validators.required, Validators.email]],
    });
    this.grupoinfo = new Grupo(
      null,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      null,
      null,
    );
    this.url = GLOBAL.url;
  }
  error;
  language;

  ngOnInit() {
    localStorage.setItem("lanId", "0");
    this.language = Languages[0];
    localStorage.setItem("language", JSON.stringify(this.language));
    this.language = JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle("GMCAN | " + this.language.login);
    this.getGrupoInfo();
    this.previouslink = sessionStorage.getItem("previous-page");
  }

  getGrupoInfo() {
    this.grupoinfo = JSON.parse(localStorage.getItem("grupoInfo"));
    this._grupoService.getGrupoInfo().subscribe((res) => {
      this.grupoinfo = res[0];
      localStorage.setItem("grupoInfo", JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
    });
    this.grupoinfo.logoHeader = this.url + "grupo/get-image-grupo/" + this.grupoinfo.logoHeader;
  }

  login() {
    if (!this.loginForm.invalid) {
      let user = {
        correo: this.loginForm.controls.correo.value,
        password: this.loginForm.controls.password.value,
      };
      this.authService.login(user).subscribe((res) => {
        if (res.state == 1) {
          window.location.href = "/dashboard";
        } else {
          this.error = "Correo electrónico o contraseña incorrectos";
        }
      });
    }
  }
  recoverValue = false;

  change() {
    this.recoverValue = !this.recoverValue;
    this.error = null;
    this.exito = null;
  }

  exito;

  recover() {
    this.exito = null;
    this.error = null;
    if (this.emailForm.invalid) {
      return;
    }
    let user = {
      correo: this.emailForm.controls.correo.value,
    };
    this._emailService.sendPasswordReset(user).subscribe(
      (res) => {
        if (res && res.success) {
          this.exito = res.message;
        } else {
          this.error = (res && res.message) || "Ocurrió un error al procesar la solicitud.";
        }
      },
      (err) => {
        this.error = "Hubo un problema de conexión. Intente más tarde.";
      },
    );
  }
  return() {
    this._router.navigate(["/home"]);
  }
}
