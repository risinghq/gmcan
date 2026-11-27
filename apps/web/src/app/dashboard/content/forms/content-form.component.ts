import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";

@Component({
  selector: "app-content-form",
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <div class="pad">
      <div class="add-box">
        <div class="flex-news">
          <a class="flex-news back-div" [routerLink]="backTo()">
            <app-icon class="back-icon" name="arrow-left" />
            <div class="back-text">Volver</div>
          </a>
          <div class="right obligatory-text"><span class="red-text">(*) </span>{{ note() }}</div>
        </div>
        <ng-content />
        <div class="flex-news">
          @if (deleteLabel(); as label) {
            <button type="button" class="btn-black btn-red" [disabled]="busy()" (click)="remove.emit()">
              <span class="link link-set link-red">{{ label }}</span>
            </button>
          }
          <div class="right flex-news">
            <ng-content select="[formAction]" />
            <button type="button" class="btn-black" [disabled]="!canSave()" (click)="save.emit()">
              <span class="link link-set">{{ saveLabel() }}</span>
            </button>
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
