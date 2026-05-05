export type WriteStatusResponse = { status: 1 };

export function okStatus(): WriteStatusResponse {
  return { status: 1 };
}
