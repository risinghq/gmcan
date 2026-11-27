import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import type { EmailBody } from "@app/shared/models/emailBody";
import { createEmailBody } from "@app/shared/models/factories";
import { originRoute, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { BrowserService } from "@app/shared/services/browser.service";
import { EmailService } from "@app/shared/services/email.service";
import { GLOBAL } from "@app/shared/services/global";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-join-us",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BreadcrumbComponent, IconComponent, FormsModule, ReactiveFormsModule, AutosizeModule, NewsComponent],
})
export default class JoinUsComponent implements OnInit {
  fb = inject(FormBuilder);
  emailService = inject(EmailService);
  dialog = inject(MatDialog);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private uiState = inject(UiStateService);
  private seo = inject(SeoService);

  public user: FormGroup;
  public validation = true;
  public sending = signal(false);
  public sendFailed = signal(false);
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

  public previouslink = "/";
  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.join);
    this.previouslink = originRoute(parsePublicOrigin(this.route.snapshot.queryParamMap.get("from")));
  }

  return(): void {
    this.router.navigateByUrl(this.previouslink);
  }

  sendEmail(): void {
    if (!this.user.invalid && !this.sending()) {
      this.sending.set(true);
      this.sendFailed.set(false);
      this.email.nombre = this.user.controls["nombre"].value;
      this.email.razon = this.user.controls["razon"].value;
      this.email.correo = this.user.controls["correo"].value;
      this.email.telefono = this.user.controls["telefono"].value;
      this.emailService
        .sendMembershipApplication({
          name: this.email.nombre ?? "",
          reason: this.email.razon ?? "",
          email: this.email.correo ?? "",
          phone: this.email.telefono ?? "",
        })
        .subscribe({
          next: () => {
            this.sending.set(false);
            this.openDialog();
          },
          error: () => {
            this.sending.set(false);
            this.sendFailed.set(true);
          },
        });
    }
  }

  openDialog(): void {
    let width = "913px";
    if (this.browser.innerWidth() < 960) {
      width = "312px";
    }
    const dialogRef = this.dialog.open(EmailExitoso, {
      disableClose: true,
      width: width,
      position: { top: "170px" },
      id: "joinUs",
    });

    dialogRef.afterClosed().subscribe();
  }
}

@Component({
  selector: "exitoso-dialog",
  templateUrl: "../../shared/modals/email-exitoso.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatButton],
})
export class EmailExitoso {
  dialogRef = inject<MatDialogRef<EmailExitoso>>(MatDialogRef);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private session = inject(SessionService);
  private uiState = inject(UiStateService);

  url = GLOBAL.url;
  grupoInfo: any = this.uiState.groupInfo();
  language: any = this.session.language();

  onNoClick(): void {
    this.router.navigate(["/"]);
    this.dialogRef.close();
  }
}
