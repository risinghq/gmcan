import { Injectable, computed, signal } from "@angular/core";
import { Languages } from "@app/shared/models/languages";
import { SessionService } from "@app/shared/services/session.service";

@Injectable()
export class AboutFacade {
  private readonly _language = signal<(typeof Languages)[number]>(Languages[0]);
  private readonly _selectedCategory = signal("");

  readonly language = this._language.asReadonly();
  readonly selectedCategory = computed(() => this._selectedCategory());

  constructor(private readonly session: SessionService) {}

  init(routeUrl: string): void {
    this._language.set(this.session.language());
    this.syncCategoryFromRoute(routeUrl);
  }

  setSelectedCategory(value: string): void {
    this._selectedCategory.set(value);
  }

  private syncCategoryFromRoute(route: string): void {
    const language = this._language();
    switch (route) {
      case "/home/about-us/about":
      case "/home/about-us":
        this._selectedCategory.set(language.who);
        break;
      case "/home/about-us/lines-investigation":
        this._selectedCategory.set(language.linesInvestigation);
        break;
      case "/home/about-us/methods":
        this._selectedCategory.set(language.methods);
        break;
      case "/home/about-us/facilities-resources":
        this._selectedCategory.set(language.resources);
        break;
      case "/home/about-us/works":
        this._selectedCategory.set(language.futureWorks);
        break;
      default:
        this._selectedCategory.set("");
        break;
    }
  }
}
