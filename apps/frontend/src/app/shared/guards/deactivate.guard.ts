import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CanDeactivateFn } from "@angular/router";
import { map } from "rxjs/operators";

import ConfirmLeaveComponent from "../modals/confirm-leave.component";
import { HasUnsavedChanges } from "../models/unsaved-changes";

export const canDeactivateGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (localStorage.getItem("sessionEnd") === "1") {
    localStorage.setItem("sessionEnd", "0");
    return true;
  }
  if (!component.isDirty()) return true;

  return inject(MatDialog)
    .open(ConfirmLeaveComponent, { width: "530px", id: "idleTimer" })
    .afterClosed()
    .pipe(map((result) => result === true));
};
