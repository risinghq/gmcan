import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-content-form",
  imports: [MatIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <div class="pad">
      <div class="add-box">
        <div class="flex-news">
          <a class="flex-news back-div" [routerLink]="backTo()">
            <mat-icon class="back-icon">arrow_back</mat-icon>
            <div class="back-text">Volver</div>
          </a>
          <div class="right obligatory-text"><span class="red-text">(*) </span>{{ note() }}</div>
        </div>
        <ng-content />
        <div class="flex-news">
          @if (deleteLabel(); as label) {
            <div class="red-btn">
              <button type="button" class="link link-set link-red" [disabled]="busy()" (click)="remove.emit()">
                {{ label }}
              </button>
            </div>
          }
          <div class="right flex-news">
            <ng-content select="[formAction]" />
            <div [class.btn-grey]="!canSave()" [class.black-btn]="canSave()">
              <button type="button" class="link link-set" [disabled]="!canSave()" (click)="save.emit()">
                {{ saveLabel() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContentFormComponent {
  readonly backTo = input("/dashboard/contenidos");
  readonly note = input("Campos obligatorios");
  readonly saveLabel = input.required<string>();
  readonly deleteLabel = input<string | null>(null);
  readonly canSave = input.required<boolean>();
  readonly busy = input(false);
  readonly save = output();
  readonly remove = output();
}
