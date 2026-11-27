import { Component, RESPONSE_INIT, inject, ChangeDetectionStrategy } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
  styleUrl: "./not-found.component.scss",
})
export default class NotFoundComponent {
  private response = inject(RESPONSE_INIT, { optional: true });

  readonly language = inject(SessionService).language();
  readonly dashboard = inject(Router).url.startsWith("/dashboard");
  readonly button_text = this.dashboard ? "Volver al dashboard" : this.language.notFoundBtn;

  constructor() {
    if (this.response) this.response.status = 404;
  }
}
