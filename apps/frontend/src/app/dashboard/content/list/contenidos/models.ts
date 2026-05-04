import type { About } from "@app/shared/models/about";
import type { Group } from "@app/shared/models/group";

export interface PreviewAboutData {
  about: About;
}

export interface PreviewFutureData {
  group: Group;
}
