import { AbstractControl, ValidationErrors } from "@angular/forms";

export class SpaceValidator {
  static cannotContainSpace(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      if ((control.value as string).indexOf(" ") == 0) {
        return { cannotContainSpace: true };
      }
    }
    return null;
  }

  static lessOrMore(control: AbstractControl, control1: AbstractControl): ValidationErrors | null {
    if (control.value) {
      if (control < control1) {
        return { lessOrMore: true };
      }
    }
    return null;
  }
}
