import { FormArray, FormControl, type ValidatorFn, Validators } from "@angular/forms";

/** Whitespace alone does not count, matching the API's trimmed `min(1)`. */
export function requiredText(value = ""): FormControl<string> {
  return new FormControl(value, { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });
}

export function optionalText(value = ""): FormControl<string> {
  return new FormControl(value, { nonNullable: true });
}

export function textList(values: readonly string[], validators: ValidatorFn[] = []): FormArray<FormControl<string>> {
  return new FormArray(values.map(requiredText), validators);
}
