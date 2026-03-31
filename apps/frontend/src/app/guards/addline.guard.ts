import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddLineaComponent } from "../add-linea/add-linea.component";

@Injectable()
export class AddLineGuard implements CanDeactivate<AddLineaComponent> {
  canDeactivate(component: AddLineaComponent) {
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
