import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

import { AddMemberComponent } from "../add-member/add-member.component";

@Injectable()
export class AddMemberGuard implements CanDeactivate<AddMemberComponent> {
  canDeactivate(component: AddMemberComponent) {
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
