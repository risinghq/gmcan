import { Component, OnInit, RESPONSE_INIT, inject, ChangeDetectionStrategy } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Languages } from "@app/shared/models/languages";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
  styleUrl: "./not-found.component.scss",
})
export default class NotFoundComponent implements OnInit {
  private router = inject(Router);
  private session = inject(SessionService);
  private response = inject(RESPONSE_INIT, { optional: true });

  button_text = "";
  dashboard = false;

  language: (typeof Languages)[number] = this.session.language();
  ngOnInit(): void {
    if (this.response) this.response.status = 404;
    this.language = this.session.language();
    this.setTexts();
  }

  setTexts(): void {
    if (this.router.url.startsWith("/dashboard")) {
      this.button_text = "Volver al dashboard";
      this.dashboard = true;
    } else {
      this.button_text = this.language.notFoundBtn;
    }
  }
}
