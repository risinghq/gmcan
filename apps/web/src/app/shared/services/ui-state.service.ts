import { Injectable, signal } from "@angular/core";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";

@Injectable({ providedIn: "root" })
export class UiStateService {
  private readonly groupInfoState = signal<Group>(createGroup());
  private readonly sessionEndingState = signal(false);
  private readonly profileUpdatedState = signal(false);
  private readonly methodLanguageState = signal<0 | 1>(0);

  readonly groupInfo = this.groupInfoState.asReadonly();
  readonly sessionEnding = this.sessionEndingState.asReadonly();
  readonly profileUpdated = this.profileUpdatedState.asReadonly();
  readonly methodLanguage = this.methodLanguageState.asReadonly();

  setGroupInfo(group: Group): void {
    this.groupInfoState.set(group);
  }

  beginSessionEnd(): void {
    this.sessionEndingState.set(true);
  }

  acknowledgeSessionEnd(): void {
    this.sessionEndingState.set(false);
  }

  setProfileUpdated(updated: boolean): void {
    this.profileUpdatedState.set(updated);
  }

  setMethodLanguage(value: 0 | 1): void {
    this.methodLanguageState.set(value);
  }
}
