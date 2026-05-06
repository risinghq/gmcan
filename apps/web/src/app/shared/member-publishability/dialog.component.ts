import { Component, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";

import type { MemberPublishability } from "../models/member";
import { publishabilityMissingItems } from "./utils";

interface PublishabilityDialogData {
  memberName: string;
  publishability: MemberPublishability;
}

@Component({
  selector: "app-publishability-dialog",
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
  templateUrl: "./dialog.component.html",
})
export class PublishabilityDialogComponent {
  protected data = inject<PublishabilityDialogData>(MAT_DIALOG_DATA);

  protected missingItems(): string[] {
    return publishabilityMissingItems(this.data.publishability);
  }
}
