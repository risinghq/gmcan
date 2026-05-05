export type WriteStatusResponse = { status: 1 };
export type LocaleCode = string;
export type LocalizedMap<T> = Record<LocaleCode, T>;

export function okStatus(): WriteStatusResponse {
  return { status: 1 };
}
