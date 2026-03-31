import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditMethodComponent } from "../edit-method/edit-method.component";

@Injectable()
export class EditMethodGuard implements CanDeactivate<EditMethodComponent> {
  canDeactivate(component: EditMethodComponent) {
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
