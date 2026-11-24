import { AbstractControl, ValidationErrors } from "@angular/forms";

export const SpaceValidator = {
  // Forms share this validator across text, date and select controls, so a
  // non-string value passes: only typed text can start with a space.
  cannotContainSpace(control: AbstractControl): ValidationErrors | null {
    const value: unknown = control.value;
    return typeof value === "string" && value.startsWith(" ") ? { cannotContainSpace: true } : null;
  },
};
