import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { originRoute, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { EmailService } from "@app/shared/services/email.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

import { SentDialogComponent } from "./sent-dialog.component";

@Component({
  selector: "app-join-us",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BreadcrumbComponent, IconComponent, ReactiveFormsModule, NewsComponent, RouterLink],
})
export default class JoinUsComponent implements OnInit {
  private emailService = inject(EmailService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private session = inject(SessionService);
  private seo = inject(SeoService);

  readonly user = inject(FormBuilder).nonNullable.group({
    nombre: ["", Validators.required],
    razon: ["", Validators.required],
    correo: ["", [Validators.required, Validators.email]],
    telefono: ["", Validators.required],
  });
  readonly sending = signal(false);
  readonly sendFailed = signal(false);

  language: any = {};
  readonly previouslink = originRoute(parsePublicOrigin(this.route.snapshot.queryParamMap.get("from")));

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.join);
  }

  sendEmail(): void {
    if (this.user.invalid || this.sending()) return;

    this.sending.set(true);
    this.sendFailed.set(false);
    const { nombre, razon, correo, telefono } = this.user.getRawValue();

    this.emailService
      .sendMembershipApplication({ name: nombre, reason: razon, email: correo, phone: telefono })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.user.reset();
          this.dialog.open(SentDialogComponent, {
            width: "530px",
            maxWidth: "calc(100vw - 32px)",
          });
        },
        error: () => {
          this.sending.set(false);
          this.sendFailed.set(true);
        },
      });
  }
}
