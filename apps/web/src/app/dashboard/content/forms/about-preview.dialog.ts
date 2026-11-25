import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import type { AboutTranslation } from "@gmcan/contracts/admin";

export interface AboutPreview {
  about: AboutTranslation;
  image: string | null;
}

@Component({
  selector: "app-about-preview-dialog",
  imports: [MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../../../public/about/about-us/component.scss",
  template: `
    <div class="card-about scroll">
      <img class="about-img" [src]="data.image ?? '/img/grupal.jpg'" alt="" />
      <div class="about-text-div">
        <div class="about-title">¿Quiénes Somos?</div>
        <div class="about-sub-divi"></div>
        <div class="about-text" [innerHTML]="data.about.description"></div>
        @for (section of sections; track section.title) {
          <div class="about-title about-top">{{ section.title }}</div>
          <div class="about-subtitle">{{ section.question }}</div>
          <div class="about-sub-divi"></div>
          <div class="about-text">
            @for (paragraph of data.about[section.key].introParagraphs; track $index) {
              <p>{{ paragraph }}</p>
            }
            <ul>
              @for (item of data.about[section.key].items; track $index) {
                <li>{{ item }}</li>
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
