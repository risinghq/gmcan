import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CanDeactivateFn } from "@angular/router";
import { map } from "rxjs/operators";

import ConfirmLeaveComponent from "../modals/confirm-leave.component";
import { HasUnsavedChanges } from "../models/unsaved-changes";
import { UiStateService } from "../services/ui-state.service";

export const canDeactivateGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  const uiState = inject(UiStateService);
  if (uiState.sessionEnding()) {
    uiState.acknowledgeSessionEnd();
    return true;
  }
  if (!component.isDirty()) return true;

  return inject(MatDialog)
    .open(ConfirmLeaveComponent, { width: "530px", id: "idleTimer" })
    .afterClosed()
    .pipe(map((result) => result === true));
};
