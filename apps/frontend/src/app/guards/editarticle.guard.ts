import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditArticleComponent } from "../edit-article/edit-article.component";

@Injectable()
export class EditArticleGuard implements CanDeactivate<EditArticleComponent> {
  canDeactivate(component: EditArticleComponent) {
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
