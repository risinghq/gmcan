import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    if (!routeTitle) return;
    this.title.setTitle(`GMCAN | ${routeTitle}`);
  }

  override buildTitle(snapshot: RouterStateSnapshot): string | undefined {
    let route: ActivatedRouteSnapshot | null = snapshot.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return route?.title ? this.getResolvedTitleForRoute(route) : undefined;
  }
}
