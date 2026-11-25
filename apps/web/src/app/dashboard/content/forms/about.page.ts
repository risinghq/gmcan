import { ChangeDetectionStrategy, Component, DestroyRef, type OnInit, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ImageFieldComponent } from "@app/shared/components/image-field/image-field.component";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";
import { CONTENT_LOCALES, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AssetService } from "@app/shared/services/asset.service";
import { GroupService } from "@app/shared/services/group.service";
import type { AboutSection, AboutTranslation, AdminAbout, Translations } from "@gmcan/contracts/admin";
import { firstValueFrom, map } from "rxjs";

import { type AboutPreview, AboutPreviewDialog } from "./about-preview.dialog";
import { ContentFormFlow } from "./content-form-flow";
import { ContentFormComponent } from "./content-form.component";
import { requiredText, textList } from "./text-fields";
import { TextListComponent } from "./text-list.component";

const EMPTY_ABOUT: AboutTranslation = {
  description: "",
  objectivesContent: { introParagraphs: [], items: [] },
  servicesContent: { introParagraphs: [], items: [] },
  homeServicesTeaserContent: { paragraphs: [] },
};

function sectionForm(section: AboutSection) {
  return new FormGroup({ introParagraphs: textList(section.introParagraphs), items: textList(section.items) });
}

/** The lists vary in length, so each locale's group is built from the saved page rather than patched. */
function aboutForm(about: AboutTranslation) {
  return new FormGroup({
    description: requiredText(about.description),
    objectivesContent: sectionForm(about.objectivesContent),
    servicesContent: sectionForm(about.servicesContent),
    homeServicesTeaserContent: new FormGroup({
      paragraphs: textList(about.homeServicesTeaserContent.paragraphs, [Validators.minLength(1)]),
    }),
  });
}

type AboutForm = ReturnType<typeof aboutForm>;

/** Edits the about page: the team photo, the description, objectives, services and the home teaser. */
@Component({
  selector: "app-about-page",
  imports: [ReactiveFormsModule, ContentFormComponent, ImageFieldComponent, RichTextEditorComponent, TextListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./content-form.scss",
  template: `
    <app-content-form
      saveLabel="Guardar cambios"
      [deleteLabel]="null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
    >
      <form [formGroup]="form" class="mt-24">
        <app-image-field label="Imagen del equipo" [current]="about().asset" (picked)="pick($event)" />
        @for (locale of locales; track locale) {
          @let group = form.controls[locale]!;
          <div class="locale-section full-width" [formGroup]="group">
            <div class="locale-title">{{ label(locale) }}</div>
            <div class="flex-news">
              <div class="text-category">Descripción <span class="red-text">*</span></div>
              <button type="button" class="link green-text top-auto right plex-sans" (click)="preview(locale)">
                Vista previa
              </button>
            </div>
            <app-rich-text-editor formControlName="description" />
            <div class="text-category mt-24">Objetivos</div>
            <app-text-list
              label="Párrafos introductorios"
              [list]="group.controls.objectivesContent.controls.introParagraphs"
            />
            <app-text-list label="Objetivos" [list]="group.controls.objectivesContent.controls.items" />
            <div class="text-category mt-24">Servicios</div>
            <app-text-list
              label="Párrafos introductorios"
              [list]="group.controls.servicesContent.controls.introParagraphs"
            />
            <app-text-list label="Servicios" [list]="group.controls.servicesContent.controls.items" />
            <div class="text-category mt-24">Servicios en la página de inicio <span class="red-text">*</span></div>
            <app-text-list label="Párrafos" [list]="group.controls.homeServicesTeaserContent.controls.paragraphs" />
          </div>
        }
      </form>
    </app-content-form>
  `,
})
export default class AboutPage implements OnInit, HasUnsavedChanges {
  readonly about = input.required<AdminAbout>();

  private readonly groups = inject(GroupService);
  private readonly assets = inject(AssetService);
  private readonly flow = inject(ContentFormFlow);
  private readonly dialog = inject(MatDialog);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = new FormGroup<Record<string, AboutForm>>(
    Object.fromEntries(CONTENT_LOCALES.map((locale) => [locale, aboutForm(EMPTY_ABOUT)])),
  );
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly image = signal<File | null>(null);
  readonly saving = signal(false);
  /** A blob URL of the picked image, so the preview can show it before upload. */
  private imageUrl: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeImageUrl());
  }

  ngOnInit(): void {
    const { translations } = this.about();
    for (const locale of CONTENT_LOCALES) {
      this.form.setControl(locale, aboutForm(translations[locale] ?? EMPTY_ABOUT), { emitEvent: false });
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
    const file = this.image();
    if (file && !this.imageUrl) this.imageUrl = URL.createObjectURL(file);
    const data: AboutPreview = {
      about: this.form.getRawValue()[locale] ?? EMPTY_ABOUT,
      image: file ? this.imageUrl : this.about().asset,
    };
    this.dialog.open(AboutPreviewDialog, { width: "871px", data });
  }

  save(): Promise<void> {
    const id = this.about().id;
    return this.flow.run(
      this.saving,
      async () => {
        const translations: Translations<AboutTranslation> = this.form.getRawValue();
        await firstValueFrom(this.groups.updateAbout(id, { translations }));
        const image = this.image();
        if (image) await firstValueFrom(this.assets.put({ ownerType: "about", ownerId: id, slot: "photo" }, image));
        this.form.markAsPristine();
        this.image.set(null);
      },
      "Quiénes somos actualizado",
      "No se pudo guardar Quiénes somos",
    );
  }

  private revokeImageUrl(): void {
    if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
    this.imageUrl = null;
  }
}
