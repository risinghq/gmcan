import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddProyectoComponent } from "../add-proyecto/add-proyecto.component";

@Injectable()
export class AddProyectoGuard implements CanDeactivate<AddProyectoComponent> {
  canDeactivate(component: AddProyectoComponent) {
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
