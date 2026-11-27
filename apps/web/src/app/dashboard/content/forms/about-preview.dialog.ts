import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { EmphasisPipe } from "@app/shared/utils/emphasis";
import type { AboutTranslation } from "@gmcan/contracts/admin";

export interface AboutPreview {
  about: AboutTranslation;
  image: string | null;
}

@Component({
  selector: "app-about-preview-dialog",
  imports: [MatDialogClose, EmphasisPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../../../public/about/about-us/component.scss",
  template: `
    <div class="card-about scroll">
      @if (data.image) {
        <img class="about-img" [src]="data.image" alt="" />
      }
      <div class="about-text-div">
        <div class="page-title">¿Quiénes somos?</div>
        <div class="page-rule"></div>
        <div class="page-body" [innerHTML]="data.about.description"></div>
        @for (section of sections; track section.title) {
          <div class="page-title about-section">{{ section.title }}</div>
          <p class="page-subtitle">{{ section.question }}</p>
          <div class="page-rule"></div>
          <div class="page-body">
            @for (paragraph of data.about[section.key].introParagraphs; track $index) {
              <p>{{ paragraph }}</p>
            }
            <ul>
              @for (item of data.about[section.key].items; track $index) {
                <li>
                  @for (part of item | emphasis; track $index) {
                    @if (part.strong) {
                      <strong>{{ part.text }}</strong>
                    } @else {
                      {{ part.text }}
                    }
                  }
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class AboutPreviewDialog {
  readonly data = inject<AboutPreview>(MAT_DIALOG_DATA);
  readonly sections = [
    { key: "objectivesContent", title: "Nuestros Objetivos", question: "¿Qué objetivos tenemos?" },
    { key: "servicesContent", title: "Nuestros Servicios", question: "¿Qué servicios ofrecemos?" },
  ] as const;
}
