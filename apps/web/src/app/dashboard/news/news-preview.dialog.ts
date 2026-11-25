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
    <div class="card-detail scroll">
      <div class="news-title-div">
        @if (data.image; as image) {
          <img class="detail-img" [src]="image" alt="" />
        }
        <div class="news-title">{{ data.title }}</div>
      </div>
      <div class="detail-text-div">
        <div class="news-abstract">{{ data.summary }}</div>
        <div class="flex-news other-div"></div>
        <div class="author-div">
          <div class="author-img-div">
            @if (data.author; as author) {
              <img class="author-img" [src]="author.photoUrl" [alt]="author.photoAlt" />
            }
          </div>
          <div class="author-text">
            <div class="news-type">{{ data.kindName }}</div>
            <div class="author-name">{{ data.author?.name }}</div>
            <div class="news-date">{{ data.publishedAt | date: "d MMMM y" }}</div>
          </div>
        </div>
        <div class="detail-text" style="white-space: pre-wrap" [innerHTML]="data.body"></div>
      </div>
    </div>
    <div class="outside" [mat-dialog-close]="false">X</div>
  `,
})
export class NewsPreviewDialog {
  readonly data = inject<NewsPreview>(MAT_DIALOG_DATA);
}
