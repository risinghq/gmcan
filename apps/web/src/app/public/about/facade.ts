import { Injectable, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { toNavigationAppError } from "@app/shared/errors/app-error";
import { AppErrorHandlingService } from "@app/shared/errors/app-error-handling.service";
import type { Group } from "@app/shared/models/group";
import type { Method } from "@app/shared/models/method";
import { SessionService } from "@app/shared/services/session.service";
import { map, startWith } from "rxjs";

import { AboutDataService } from "./data";

@Injectable()
export class AboutFacade {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly dataService = inject(AboutDataService);
  private readonly errorHandler = inject(AppErrorHandlingService);

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
      case "/about-us/about":
      case "/about-us":
        return language.who;
      case "/about-us/lines-investigation":
        return language.linesInvestigation;
      case "/about-us/methods":
        return language.methods;
      case "/about-us/facilities-resources":
        return language.resources;
      case "/about-us/works":
        return language.futureWorks;
      default:
        return "";
    }
  });

  readonly methods = signal<Method[]>([]);
  readonly group = signal<Group | null>(null);

  async loadMethods(): Promise<void> {
    try {
      this.methods.set(await this.dataService.getMethods());
    } catch (error) {
      this.errorHandler.handle(toNavigationAppError(error));
    }
  }

  async loadGroup(): Promise<void> {
    try {
      this.group.set(await this.dataService.getGroup());
    } catch (error) {
      this.errorHandler.handle(toNavigationAppError(error));
    }
  }
}
