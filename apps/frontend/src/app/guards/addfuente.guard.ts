import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddFuenteComponent } from "../add-fuente/add-fuente.component";

@Injectable()
export class AddFuenteGuard implements CanDeactivate<AddFuenteComponent> {
  canDeactivate(component: AddFuenteComponent) {
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
