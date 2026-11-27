import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { AboutFacade } from "@app/public/about/facade";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-works",
  templateUrl: "./component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./component.scss",
})
export default class WorksComponent {
  private readonly session = inject(SessionService);
  private readonly facade = inject(AboutFacade);

  readonly language = this.session.language;
  readonly group = this.facade.group;

  constructor() {
    void this.facade.loadGroup();
  }
}
