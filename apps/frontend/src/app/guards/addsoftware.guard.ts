import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddSoftwareComponent } from "../add-software/add-software.component";

@Injectable()
export class AddSoftwareGuard implements CanDeactivate<AddSoftwareComponent> {
  canDeactivate(component: AddSoftwareComponent) {
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
