import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CanDeactivateFn } from "@angular/router";

import { confirmAction } from "../forms/confirm-dialog.component";
import { HasUnsavedChanges } from "../models/unsaved-changes";
import { UiStateService } from "../services/ui-state.service";

export const canDeactivateGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  const uiState = inject(UiStateService);
  if (uiState.sessionEnding()) {
    uiState.acknowledgeSessionEnd();
    return true;
  }
  if (!component.isDirty()) return true;

  return confirmAction(inject(MatDialog), {
    title: "¿Estás seguro que deseas volver sin guardar?",
    text: "La información no se guardará",
    confirm: "Sí, volver",
    dismiss: "No, mantenerme aquí",
  });
};
