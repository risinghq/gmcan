import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { BrowserService } from "@app/shared/services/browser.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.scss",
})
export default class NotFoundComponent implements OnInit {
  _router = inject(Router);
  private _browser = inject(BrowserService);
  private _session = inject(SessionService);

  button_text = "";
  dashboard = false;

  language: any = {};
  ngOnInit(): void {
    this.language = this._session.language();
    this.setTexts();
  }

  setTexts(): void {
    if (this._browser.locationHref().includes("dashboard")) {
      this.button_text = "Volver al dashboard";
      this.dashboard = true;
    } else {
      this.button_text = this.language.notFoundBtn;
    }
  }

  navigate(): void {
    if (this.dashboard) {
      this._router.navigate(["/dashboard"]);
    } else {
      this._router.navigate(["/"]);
    }
  }
}
