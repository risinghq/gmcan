import { Injectable, computed, signal } from "@angular/core";
import { Languages } from "@app/shared/models/languages";
import { SessionService } from "@app/shared/services/session.service";

@Injectable()
export class AboutFacade {
  private readonly languageState = signal<(typeof Languages)[number]>(Languages[0]);
  private readonly selectedCategoryState = signal("");

  readonly language = this.languageState.asReadonly();
  readonly selectedCategory = computed(() => this.selectedCategoryState());

  constructor(private readonly session: SessionService) {}

  init(routeUrl: string): void {
    this.languageState.set(this.session.language());
    this.syncCategoryFromRoute(routeUrl);
  }

  setSelectedCategory(value: string): void {
    this.selectedCategoryState.set(value);
  }

  private syncCategoryFromRoute(route: string): void {
    const language = this.languageState();
    switch (route) {
      case "/home/about-us/about":
      case "/home/about-us":
        this.selectedCategoryState.set(language.who);
        break;
      case "/home/about-us/lines-investigation":
        this.selectedCategoryState.set(language.linesInvestigation);
        break;
      case "/home/about-us/methods":
        this.selectedCategoryState.set(language.methods);
        break;
      case "/home/about-us/facilities-resources":
        this.selectedCategoryState.set(language.resources);
        break;
      case "/home/about-us/works":
        this.selectedCategoryState.set(language.futureWorks);
        break;
      default:
        this.selectedCategoryState.set("");
        break;
    }
  }
}
