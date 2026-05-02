const DEFAULT_BACK_TARGET = "dashboard";

export const ARTICLE_BACK_KEY = "article-back";
export const THESIS_BACK_KEY = "thesis-back";
export const RESUMEN_BACK_FALLBACK = "my-abstracts";

export function setBackTarget(key: string, target: string): void {
  localStorage.setItem(key, target);
}

export function resolveBackTarget(key: string, fallback = DEFAULT_BACK_TARGET): string {
  return localStorage.getItem(key) ?? fallback;
}
