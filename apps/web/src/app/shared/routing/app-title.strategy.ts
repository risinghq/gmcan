import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { deepestChild, routeTitle } from "@app/shared/routing/derived-data";

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (!title) return;
    this.title.setTitle(`GMCAN | ${title}`);
  }

  override buildTitle(snapshot: RouterStateSnapshot): string | undefined {
    return routeTitle(deepestChild(snapshot.root));
  }
}
