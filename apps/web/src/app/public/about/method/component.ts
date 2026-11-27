import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { AboutFacade } from "@app/public/about/facade";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-method",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
})
export default class MethodComponent {
  private readonly session = inject(SessionService);
  private readonly facade = inject(AboutFacade);

  readonly language = this.session.language;
  readonly methods = this.facade.methods;

  constructor() {
    void this.facade.loadMethods();
  }
}
