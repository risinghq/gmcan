import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";

import { EmailBody } from "../models/emailBody";
import { EmailService } from "../services/email.service";
import { GLOBAL } from "../services/global";

@Component({
  standalone: false,
  selector: "app-join-us",
  templateUrl: "./join-us.component.html",
  styleUrls: ["./join-us.component.scss"],
})
export class JoinUsComponent implements OnInit {
  public user: FormGroup;
  public validation = true;
  public email: EmailBody;
  constructor(
    public fb: FormBuilder,
    public _emailService: EmailService,
    public dialog: MatDialog,
    public _router: Router,
    private titleService: Title,
  ) {
    this.user = this.fb.group({
      nombre: ["", Validators.required],
      razon: ["", Validators.required],
      correo: ["", [Validators.required, Validators.email]],
      telefono: ["", Validators.required],
    });
  }

  language;

  public previouslink;
  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle("GMCAN | " + this.language.join);
    this.email = new EmailBody("", "", "", "");
    this.previouslink = sessionStorage.getItem("previous-page");
  }

  return() {
    if (this.previouslink) {
      this._router.navigate([this.previouslink]);
    } else {
      this._router.navigate(["/home"]);
    }
  }

  sendEmail() {
    if (!this.user.invalid) {
      this.email.nombre = this.user.controls.nombre.value;
      this.email.razon = this.user.controls.razon.value;
      this.email.correo = this.user.controls.correo.value;
      this.email.telefono = this.user.controls.telefono.value;
      this._emailService.sendMembershipApplication(this.email).subscribe((res) => {
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

    dialogRef.afterClosed().subscribe((result) => {});
  }
}

@Component({
  standalone: false,
  selector: "exitoso-dialog",
  templateUrl: "../modals/email-exitoso.html",
})
export class EmailExitoso {
  public url;
  grupoLogo;
  grupoInfo;
  screenWidth: number;
  language;
  constructor(
    public dialogRef: MatDialogRef<EmailExitoso>,
    public _route: ActivatedRoute,
    public _router: Router,
  ) {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.screenWidth = window.innerWidth;
    this.url = GLOBAL.url;
    this.grupoInfo = JSON.parse(localStorage.getItem("grupoInfo"));
    this.grupoLogo = this.grupoInfo.logoHeader;
    this.grupoLogo = this.url + "grupo/get-image-grupo/" + this.grupoLogo;
  }

  onNoClick(): void {
    this._router.navigate(["/"]);
    this.dialogRef.close();
  }
}
