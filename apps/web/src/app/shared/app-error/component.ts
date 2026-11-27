import { Component, RESPONSE_INIT, inject, ChangeDetectionStrategy } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-app-error",
  templateUrl: "./component.html",
  styleUrl: "../not-found/not-found.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export default class AppErrorComponent {
  private response = inject(RESPONSE_INIT, { optional: true });

  readonly language = inject(SessionService).language();

  constructor() {
    if (this.response) this.response.status = 500;
  }
}
