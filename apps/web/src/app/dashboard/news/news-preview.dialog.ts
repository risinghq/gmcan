import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";

export interface NewsPreview {
  title: string;
  summary: string;
  body: string;
  image: string | null;
  kindName: string | null;
  author: { name: string; photoUrl: string; photoAlt: string } | null;
  publishedAt: Date | null;
}

@Component({
  selector: "app-news-preview-dialog",
  imports: [DatePipe, MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../../public/detail-news/component.scss",
  template: `
    <article class="card-detail scroll">
      <header class="news-header" [class.news-header-img]="data.image">
        @if (data.image; as image) {
          <img class="detail-img" [src]="image" alt="" />
        }
        <h1 class="news-title">{{ data.title }}</h1>
      </header>
      <div class="detail-text-div">
        @if (data.summary) {
          <p class="news-abstract">{{ data.summary }}</p>
        }
        <div class="author-div">
          @if (data.author?.photoUrl) {
            <img class="author-img" [src]="data.author?.photoUrl" [alt]="data.author?.photoAlt" />
          }
          <div class="author-text">
            <div class="news-type">{{ data.kindName }}</div>
            <div class="author-name">{{ data.author?.name }}</div>
            <div class="news-date">{{ data.publishedAt | date: "d MMMM y" }}</div>
          </div>
        </div>
        @if (data.body) {
          <div class="detail-text" [innerHTML]="data.body"></div>
        }
      </div>
    </article>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class NewsPreviewDialog {
  readonly data = inject<NewsPreview>(MAT_DIALOG_DATA);
}
