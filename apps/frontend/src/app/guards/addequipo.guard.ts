import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddEquipoComponent } from "../add-equipo/add-equipo.component";

@Injectable()
export class AddEquipoGuard implements CanDeactivate<AddEquipoComponent> {
  canDeactivate(component: AddEquipoComponent) {
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
