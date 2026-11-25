import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type OnInit,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatOption, provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect } from "@angular/material/select";
import { ImageFieldComponent } from "@app/shared/components/image-field/image-field.component";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";
import { confirmAction } from "@app/shared/forms/confirm-dialog.component";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AssetService } from "@app/shared/services/asset.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import type { AdminNews, NewsKindCode, NewsStatusCode, NewsWrite } from "@gmcan/contracts/admin";
import { AutosizeModule } from "ngx-autosize";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { requiredText } from "../content/forms/text-fields";
import { type NewsPreview, NewsPreviewDialog } from "./news-preview.dialog";

const NEWS_LIST = "/dashboard/news";

function fullName(member: AdminMemberListItem): string {
  return [member.firstName, member.lastName, member.maternalName].filter(Boolean).join(" ");
}

function newsForm() {
  return new FormGroup({
    publishedAt: new FormControl<Date | null>(null, Validators.required),
    authorId: new FormControl<number | null>(null, Validators.required),
    newsKindCode: new FormControl<NewsKindCode | null>(null, Validators.required),
    translations: localeForm(() => ({ title: requiredText(), summary: requiredText(), body: requiredText() })),
  });
}

type NewsFormValue = ReturnType<ReturnType<typeof newsForm>["getRawValue"]>;

/** The request body for a valid form; the required validators guarantee the shared fields. */
function toNewsWrite(value: NewsFormValue, statusCode: NewsStatusCode): NewsWrite {
  const { publishedAt, authorId, newsKindCode, translations } = value;
  if (!publishedAt || authorId === null || !newsKindCode) throw new Error("The news form is incomplete");
  return { statusCode, publishedAt: toIsoDate(publishedAt), authorId, newsKindCode, translations };
}

@Component({
  selector: "app-news-page",
  imports: [
    ReactiveFormsModule,
    AutosizeModule,
    ContentFormComponent,
    ImageFieldComponent,
    RichTextEditorComponent,
    MatFormField,
    MatInput,
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSelect,
    MatOption,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["../content/forms/content-form.scss", "./news.page.scss"],
  template: `
    <app-content-form
      backTo="/dashboard/news"
      note="Campos obligatorios para la publicación de la noticia"
      [saveLabel]="published() ? 'Actualizar noticia' : 'Publicar noticia'"
      [deleteLabel]="item() ? 'Eliminar noticia' : null"
      [canSave]="valid() && hasImage() && !saving()"
      [busy]="saving()"
      (save)="publish()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24">
        <div class="flex-news full-width mb-32">
          <div class="mr-32">
            <app-image-field label="Imagen de portada *" [current]="item()?.asset ?? null" (picked)="pick($event)" />
          </div>
          <div class="full-width">
            <div class="full-width flex-news">
              <div class="full-width mr-26">
                <div class="text-category">Fecha de publicación <span class="red-text">*</span></div>
                <mat-form-field class="input-category">
                  <input matInput [matDatepicker]="dp" formControlName="publishedAt" />
                  <mat-datepicker-toggle matSuffix [for]="dp" />
                  <mat-datepicker #dp />
                </mat-form-field>
              </div>
              <div class="full-width ml-26">
                <div class="text-category">Categoría <span class="red-text">*</span></div>
                <mat-form-field class="input-category">
                  <mat-select formControlName="newsKindCode">
                    @for (kind of kinds(); track kind.code) {
                      <mat-option [value]="kind.code">{{ kind.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="full-width">
              <div class="text-category">Autor <span class="red-text">*</span></div>
              <mat-form-field class="input-category">
                <mat-select formControlName="authorId">
                  @for (author of authors(); track author.id) {
                    <mat-option [value]="author.id">
                      <img class="img-user" [src]="author.photoUrl" [alt]="author.photoAlt" />
                      {{ name(author) }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>
        <div formGroupName="translations">
          @for (locale of locales; track locale) {
            @let fields = form.controls.translations.controls[locale].controls;
            <div class="locale-section full-width" [formGroupName]="locale">
              <div class="locale-title">{{ label(locale) }}</div>
              <div class="text-category">
                Título <span>({{ fields.title.value.length }}/100)</span> <span class="red-text">*</span>
              </div>
              <input class="input-category" formControlName="title" maxlength="100" />
              <div class="text-category">
                Resumen <span>({{ fields.summary.value.length }}/500)</span> <span class="red-text">*</span>
              </div>
              <textarea class="input-category" formControlName="summary" maxlength="500" autosize></textarea>
              <div class="flex-news">
                <div class="text-category">Contenido <span class="red-text">*</span></div>
                <button type="button" class="link green-text top-auto right plex-sans" (click)="preview(locale)">
                  Vista previa
                </button>
              </div>
              <app-rich-text-editor formControlName="body" />
            </div>
          }
        </div>
      </form>
      <div formAction class="mr-16">
        <button type="button" class="link link-set" [disabled]="!valid() || saving()" (click)="saveDraft()">
          {{ published() ? "Dejar de publicar y guardar cambios" : "Guardar sin publicar" }}
        </button>
      </div>
    </app-content-form>
  `,
})
export default class NewsPage implements OnInit, HasUnsavedChanges {
  readonly item = input<AdminNews | null>(null);
  readonly authors = input.required<AdminMemberListItem[]>();

  private readonly news = inject(NewsService);
  private readonly assets = inject(AssetService);
  private readonly flow = inject(ContentFormFlow);
  private readonly dialog = inject(MatDialog);
  private readonly lookup = inject(LookupService);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly name = fullName;
  readonly kinds = computed(() => this.lookup.newsKinds());
  readonly form = newsForm();
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly image = signal<File | null>(null);
  readonly hasImage = computed(() => this.image() !== null || !!this.item()?.asset);
  readonly published = computed(() => this.item()?.statusCode === "published");
  readonly saving = signal(false);
  private record = new RecordSave(null);
  /** A blob URL of the picked image, so the preview can show it before upload. */
  private imageUrl: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeImageUrl());
  }

  ngOnInit(): void {
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) {
      this.form.patchValue({
        publishedAt: parseLocalDate(item.publishedAt) ?? null,
        authorId: item.authorId,
        newsKindCode: item.newsKindCode,
        translations: item.translations,
      });
    } else {
      this.form.controls.publishedAt.setValue(new Date());
    }
    this.form.updateValueAndValidity();
  }

  isDirty(): boolean {
    return this.form.dirty || this.image() !== null;
  }

  pick(file: File): void {
    this.revokeImageUrl();
    this.image.set(file);
  }

  preview(locale: string): void {
    const value = this.form.getRawValue();
    const fields = value.translations[locale];
    const author = this.authors().find((member) => member.id === value.authorId);
    const file = this.image();
    if (file && !this.imageUrl) this.imageUrl = URL.createObjectURL(file);
    const data: NewsPreview = {
      title: fields?.title ?? "",
      summary: fields?.summary ?? "",
      body: fields?.body ?? "",
      image: file ? this.imageUrl : (this.item()?.asset ?? null),
      kindName: this.kinds().find((kind) => kind.code === value.newsKindCode)?.name ?? null,
      author: author ? { name: fullName(author), photoUrl: author.photoUrl, photoAlt: author.photoAlt } : null,
      publishedAt: value.publishedAt,
    };
    this.dialog.open(NewsPreviewDialog, { width: "871px", data });
  }

  async publish(): Promise<void> {
    const confirmed = await confirmAction(this.dialog, {
      title: this.published()
        ? "¿Estás seguro que deseas actualizar la noticia?"
        : "¿Estás seguro que deseas publicar la noticia?",
      text: "La información será pública para todo el mundo",
      confirm: "Sí, publicar",
      dismiss: "No, cancelar",
    });
    if (confirmed) await this.write("published", "Noticia publicada");
  }

  async saveDraft(): Promise<void> {
    if (this.published()) {
      const confirmed = await confirmAction(this.dialog, {
        title: "Dejar de publicar noticia",
        text: "¿Estás seguro de que deseas dejar de publicar esta noticia?",
        confirm: "Sí, dejar de publicar",
        dismiss: "No, cancelar",
      });
      if (!confirmed) return;
    }
    await this.write("draft", "Noticia guardada como borrador");
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    if (!(await this.flow.confirmDelete("Eliminar noticia", "¿Estás seguro que deseas eliminar esta noticia?"))) return;
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.news.deleteNews(id));
        this.settle();
      },
      "Noticia eliminada",
      "No se pudo eliminar la noticia",
      NEWS_LIST,
    );
  }

  private write(statusCode: NewsStatusCode, success: string): Promise<void> {
    return this.flow.run(
      this.saving,
      async () => {
        const body = toNewsWrite(this.form.getRawValue(), statusCode);
        const id = await this.record.write(
          () => this.news.createNews(body),
          (savedId) => this.news.updateNews(savedId, body),
        );
        const image = this.image();
        if (image) await firstValueFrom(this.assets.put({ ownerType: "news", ownerId: id, slot: "photo" }, image));
        this.settle();
      },
      success,
      "No se pudo guardar la noticia",
      NEWS_LIST,
    );
  }

  private settle(): void {
    this.form.markAsPristine();
    this.image.set(null);
  }

  private revokeImageUrl(): void {
    if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
    this.imageUrl = null;
  }
}
