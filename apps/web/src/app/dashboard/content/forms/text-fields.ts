import { FormControl, Validators } from "@angular/forms";

/** A required text field; whitespace alone does not count, matching the API's trimmed `min(1)`. */
export function requiredText(): FormControl<string> {
  return new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });
}

export function optionalText(): FormControl<string> {
  return new FormControl("", { nonNullable: true });
}
