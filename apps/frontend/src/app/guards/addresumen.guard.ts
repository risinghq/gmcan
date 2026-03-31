import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddResumenComponent } from "../add-resumen/add-resumen.component";

@Injectable()
export class AddResumenGuard implements CanDeactivate<AddResumenComponent> {
  canDeactivate(component: AddResumenComponent) {
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
