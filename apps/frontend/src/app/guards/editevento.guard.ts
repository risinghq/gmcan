import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditEventoComponent } from "../edit-evento/edit-evento.component";

@Injectable()
export class EditEventoGuard implements CanDeactivate<EditEventoComponent> {
  canDeactivate(component: EditEventoComponent) {
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
