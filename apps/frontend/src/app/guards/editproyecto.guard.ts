import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditProyectoComponent } from "../edit-proyecto/edit-proyecto.component";

@Injectable()
export class EditProyectoGuard implements CanDeactivate<EditProyectoComponent> {
  canDeactivate(component: EditProyectoComponent) {
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
