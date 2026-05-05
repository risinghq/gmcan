import { AbstractControl, ValidationErrors } from "@angular/forms";

export const SpaceValidator = {
  cannotContainSpace(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      if ((control.value as string).indexOf(" ") == 0) {
        return { cannotContainSpace: true };
      }
    }
    return null;
  },

  lessOrMore(control: AbstractControl, control1: AbstractControl): ValidationErrors | null {
    if (control.value) {
      if (control < control1) {
        return { lessOrMore: true };
      }
    }
    return null;
  },
};
