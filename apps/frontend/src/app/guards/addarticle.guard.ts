import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddArticleComponent } from "../add-article/add-article.component";

@Injectable()
export class AddArticleGuard implements CanDeactivate<AddArticleComponent> {
  canDeactivate(component: AddArticleComponent) {
    let sessionEnd;
    if (localStorage.getItem("sessionEnd") == "1") {
      localStorage.setItem("sessionEnd", "0");
      sessionEnd = true;
    } else {
      sessionEnd = false;
    }
    if (!component.agregar && !sessionEnd) {
      return component.canDeactivate();
    } else {
      return true;
    }
  }
}
