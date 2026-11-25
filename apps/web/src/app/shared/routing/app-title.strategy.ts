import { Injectable, inject } from "@angular/core";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { deepestChild, routeTitle } from "@app/shared/routing/derived-data";
import { SeoService } from "@app/shared/services/seo.service";

/** Runs after the route's components are created and before they initialize, so a page can override these tags. */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.seo.startPage(snapshot.url);
    const title = this.buildTitle(snapshot);
    this.seo.setPageTitle(title ? `GMCAN | ${title}` : "GMCAN | UNMSM");
  }

  override buildTitle(snapshot: RouterStateSnapshot): string | undefined {
    return routeTitle(deepestChild(snapshot.root));
  }
}
