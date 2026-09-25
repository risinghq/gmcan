import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { Router } from "@angular/router";
import { Languages } from "@app/shared/models/languages";
import { BrowserService } from "@app/shared/services/browser.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./not-found.component.scss",
})
export default class NotFoundComponent implements OnInit {
  private router = inject(Router);
  private browser = inject(BrowserService);
  private session = inject(SessionService);

  button_text = "";
  dashboard = false;

  language: (typeof Languages)[number] = this.session.language();
  ngOnInit(): void {
    this.language = this.session.language();
    this.setTexts();
  }

  setTexts(): void {
    if (this.browser.locationHref().includes("dashboard")) {
      this.button_text = "Volver al dashboard";
      this.dashboard = true;
    } else {
      this.button_text = this.language.notFoundBtn;
    }
  }

  navigate(): void {
    if (this.dashboard) {
      this.router.navigate(["/dashboard"]);
    } else {
      this.router.navigate(["/"]);
    }
  }
}
