import type { About } from "@app/shared/models/about";
import type { Group } from "@app/shared/models/group";

export interface PreviewAboutData {
  about: About;
  languageIndex: 0 | 1;
}

export interface PreviewFutureData {
  group: Group;
  languageIndex: 0 | 1;
}
