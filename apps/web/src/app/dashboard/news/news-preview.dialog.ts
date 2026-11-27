import { formatDate } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { NewsMetaComponent } from "@app/shared/components/news-meta.component";
import { toIsoDate } from "@app/shared/utils/date";

export interface NewsPreview {
  title: string;
  summary: string;
  body: string;
  image: string | null;
  kindName: string | null;
  author: { name: string; photoUrl: string | null; photoAlt: string } | null;
  publishedAt: Date | null;
}

@Component({
  selector: "app-news-preview-dialog",
  imports: [MatDialogClose, AvatarComponent, NewsMetaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "../../public/detail-news/component.scss",
  template: `
    <article class="card-detail scroll">
      <header [class.news-header-img]="data.image">
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
          @if (data.author; as author) {
            <app-avatar
              class="author-img"
              [src]="author.photoUrl"
              [alt]="author.photoAlt"
              [name]="author.name"
              loading="eager"
            />
          }
          <div class="author-text">
            <div class="author-name">{{ data.author?.name }}</div>
            <app-news-meta [type]="data.kindName ?? ''" [date]="isoDate" [label]="dateLabel" />
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
  readonly isoDate = this.data.publishedAt ? toIsoDate(this.data.publishedAt) : "";
  readonly dateLabel = this.data.publishedAt ? formatDate(this.data.publishedAt, "longDate", "es") : "";
}
