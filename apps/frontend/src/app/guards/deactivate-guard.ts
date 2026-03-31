import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddCategoryComponent } from "../add-category/add-category.component";

@Injectable()
export class DeactivateGuard implements CanDeactivate<AddCategoryComponent> {
  canDeactivate(component: AddCategoryComponent) {
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
