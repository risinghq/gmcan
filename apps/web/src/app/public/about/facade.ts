import { Injectable, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";
import { map, startWith } from "rxjs";

@Injectable()
export class AboutFacade {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly language = this.session.language;

  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly selectedCategory = computed(() => {
    const language = this.language();
    switch (this.currentRoute()) {
      case "/home/about-us/about":
      case "/home/about-us":
        return language.who;
      case "/home/about-us/lines-investigation":
        return language.linesInvestigation;
      case "/home/about-us/methods":
        return language.methods;
      case "/home/about-us/facilities-resources":
        return language.resources;
      case "/home/about-us/works":
        return language.futureWorks;
      default:
        return "";
    }
  });
}
