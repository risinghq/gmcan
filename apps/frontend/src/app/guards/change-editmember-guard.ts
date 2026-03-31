import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { EditMemberComponent } from "../edit-member/edit-member.component";

@Injectable()
export class EditMemberGuard implements CanDeactivate<EditMemberComponent> {
  canDeactivate(component: EditMemberComponent) {
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
