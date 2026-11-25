import { FormControl, FormGroup, Validators } from "@angular/forms";
import { localeForm } from "@app/shared/forms/locale-form";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import type { AdminMember, MemberProfileWrite } from "@gmcan/contracts/admin";
import type { GenderCode, PrefixCode } from "@gmcan/contracts/public";

import { optionalText, requiredText } from "../content/forms/text-fields";

export const BIO_MAX = 500;

/** The fields a member edits on their own profile and an administrator edits on any member. */
export function profileForm() {
  return new FormGroup({
    firstName: requiredText(),
    middleName: optionalText(),
    lastName: requiredText(),
    maternalName: optionalText(),
    birthDate: new FormControl<Date | null>(null),
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    genderCode: new FormControl<GenderCode | null>(null),
    prefixCode: new FormControl<PrefixCode | null>(null),
    translations: localeForm(() => ({ bio: optionalText() })),
  });
}

export type ProfileForm = ReturnType<typeof profileForm>;
type ProfileValue = ReturnType<ProfileForm["getRawValue"]>;

/** The API keeps the given names in one field; the form shows the first one apart from the rest. */
export function profileValue(member: AdminMember): ProfileValue {
  const [firstName = "", ...rest] = member.firstName.trim().split(/\s+/);
  return {
    firstName,
    middleName: rest.join(" "),
    lastName: member.lastName,
    maternalName: member.maternalName ?? "",
    birthDate: parseLocalDate(member.birthDate) ?? null,
    email: member.email,
    genderCode: member.genderCode,
    prefixCode: member.prefixCode,
    translations: member.translations,
  };
}

export function toProfileWrite(value: ProfileValue): MemberProfileWrite {
  return {
    email: value.email.trim(),
    firstName: [value.firstName.trim(), value.middleName.trim()].filter(Boolean).join(" "),
    lastName: value.lastName.trim(),
    maternalName: value.maternalName.trim() || null,
    birthDate: value.birthDate ? toIsoDate(value.birthDate) : null,
    prefixCode: value.prefixCode,
    genderCode: value.genderCode,
    translations: value.translations,
  };
}
