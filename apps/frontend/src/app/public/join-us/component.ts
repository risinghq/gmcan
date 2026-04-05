import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import type { EmailBody } from "@app/shared/models/emailBody";
import { createEmailBody } from "@app/shared/models/factories";
import { EmailService } from "@app/shared/services/email.service";
import { GLOBAL } from "@app/shared/services/global";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { SessionService } from "@app/shared/services/session.service";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-join-us",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, FormsModule, ReactiveFormsModule, AutosizeModule, MatButton, NewsComponent],
})
export default class JoinUsComponent implements OnInit {
  fb = inject(FormBuilder);
  _emailService = inject(EmailService);
  dialog = inject(MatDialog);
  _router = inject(Router);
  private _navigationHistory = inject(NavigationHistoryService);
  private _session = inject(SessionService);
  private titleService = inject(Title);

  public user: FormGroup;
  public validation = true;
  public email: EmailBody = createEmailBody();
  constructor() {
    this.user = this.fb.group({
      nombre: ["", Validators.required],
      razon: ["", Validators.required],
      correo: ["", [Validators.required, Validators.email]],
      telefono: ["", Validators.required],
    });
  }

  language: any = {};

  public previouslink: string | null = null;
  ngOnInit(): void {
    this.language = this._session.language();
    this.titleService.setTitle("GMCAN | " + this.language.join);
    this.previouslink = this._navigationHistory.previousUrl();
  }

  return(): void {
    if (this.previouslink) {
      this._router.navigate([this.previouslink]);
    } else {
      this._router.navigate(["/home"]);
    }
  }

  sendEmail(): void {
    if (!this.user.invalid) {
      this.email.nombre = this.user.controls["nombre"].value;
      this.email.razon = this.user.controls["razon"].value;
      this.email.correo = this.user.controls["correo"].value;
      this.email.telefono = this.user.controls["telefono"].value;
      this._emailService
        .sendMembershipApplication({
          nombre: this.email.nombre ?? "",
          razon: this.email.razon ?? "",
          correo: this.email.correo ?? "",
          telefono: this.email.telefono ?? "",
        })
        .subscribe((_res) => {
          this.openDialog();
        });
    }
  }

  openDialog(): void {
    let width = "913px";
    if (window.innerWidth < 960) {
      width = "312px";
    }
    const dialogRef = this.dialog.open(EmailExitoso, {
      disableClose: true,
      width: width,
      position: { top: "170px" },
      id: "joinUs",
    });

    dialogRef.afterClosed().subscribe(() => {});
  }
}

@Component({
  selector: "exitoso-dialog",
  templateUrl: "../../shared/modals/email-exitoso.html",
  imports: [MatButton],
})
export class EmailExitoso {
  dialogRef = inject<MatDialogRef<EmailExitoso>>(MatDialogRef);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _session = inject(SessionService);

  public url: string;
  grupoLogo = "";
  grupoInfo: any = {};
  screenWidth: number;
  language: any = {};
  constructor() {
    this.language = this._session.language();
    this.screenWidth = window.innerWidth;
    this.url = GLOBAL.url;
    this.grupoInfo = this._session.getGrupoInfo();
    this.grupoLogo = this.url + "grupo/" + this.grupoInfo.idGrupo + "/files/header";
  }

  onNoClick(): void {
    this._router.navigate(["/"]);
    this.dialogRef.close();
  }
}
