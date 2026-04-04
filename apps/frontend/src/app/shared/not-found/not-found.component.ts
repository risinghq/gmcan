import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  styleUrls: ["./not-found.component.scss"],
})
export default class NotFoundComponent implements OnInit {
  _router = inject(Router);
  private _session = inject(SessionService);

  button_text = "";
  dashboard = false;

  language: any = {};
  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.setTexts();
  }

  setTexts(): void {
    if (window.location.href.includes("dashboard")) {
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
