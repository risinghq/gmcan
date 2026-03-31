import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditUniversidadComponent } from "../edit-universidad/edit-universidad.component";

@Injectable()
export class EditUniversidadGuard implements CanDeactivate<EditUniversidadComponent> {
  canDeactivate(component: EditUniversidadComponent) {
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
