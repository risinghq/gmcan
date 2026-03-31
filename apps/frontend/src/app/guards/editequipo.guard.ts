import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditEquipoComponent } from "../edit-equipo/edit-equipo.component";

@Injectable()
export class EditEquipoGuard implements CanDeactivate<EditEquipoComponent> {
  canDeactivate(component: EditEquipoComponent) {
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
