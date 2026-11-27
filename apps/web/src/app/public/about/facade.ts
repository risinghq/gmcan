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

  readonly categories = computed(() => {
    const language = this.language();
    return [
      { path: "/about-us/about", label: language.who },
      { path: "/about-us/lines-investigation", label: language.linesInvestigation },
      { path: "/about-us/methods", label: language.methods },
      { path: "/about-us/facilities-resources", label: language.resources },
      { path: "/about-us/works", label: language.futureWorks },
    ];
  });

  readonly selectedCategory = computed(() => {
    const path = this.currentRoute().split(/[?#]/)[0];
    const current = path === "/about-us" ? "/about-us/about" : path;
    return this.categories().find((category) => category.path === current)?.label ?? "";
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
