import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddMethodComponent } from "../add-method/add-method.component";

@Injectable()
export class AddMethodGuard implements CanDeactivate<AddMethodComponent> {
  AddMethodComponent;
  canDeactivate(component: AddMethodComponent) {
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
