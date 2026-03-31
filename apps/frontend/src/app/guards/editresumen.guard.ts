import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditResumenComponent } from "../edit-resumen/edit-resumen.component";

@Injectable()
export class EditResumenGuard implements CanDeactivate<EditResumenComponent> {
  canDeactivate(component: EditResumenComponent) {
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
