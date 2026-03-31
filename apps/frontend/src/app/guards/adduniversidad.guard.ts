import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddUniversidadComponent } from "../add-universidad/add-universidad.component";

@Injectable()
export class AddUniversidadGuard implements CanDeactivate<AddUniversidadComponent> {
  canDeactivate(component: AddUniversidadComponent) {
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
