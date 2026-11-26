import { ChangeDetectionStrategy, Component, type OnInit, computed, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatAutocomplete, MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatOption, provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from "@angular/material/datepicker";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect } from "@angular/material/select";
import { ActivatedRoute } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { CONTENT_LOCALES, localeForm, localeLabel } from "@app/shared/forms/locale-form";
import type { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { type ReturnTarget, resolveReturnTo } from "@app/shared/routing/return-to";
import { AssetService } from "@app/shared/services/asset.service";
import type { EventItem } from "@app/shared/services/event.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import type {
  AdminPublication,
  AuthorCandidate,
  PublicationAuthorWrite,
  PublicationSubtypeWrite,
  PublicationWrite,
} from "@gmcan/contracts/admin";
import type { PublicationKindCode, ThesisKindCode } from "@gmcan/contracts/public";
import { AutosizeModule } from "ngx-autosize";
import { firstValueFrom, map } from "rxjs";

import { ContentFormFlow } from "../content/forms/content-form-flow";
import { ContentFormComponent } from "../content/forms/content-form.component";
import { RecordSave } from "../content/forms/record-save";
import { optionalText, requiredText } from "../content/forms/text-fields";

interface KindCopy {
  noun: string;
  /** The admin list, then the member's own list. An unknown `returnTo` goes to the member's list. */
  lists: [ReturnTarget, ReturnTarget];
}

const KINDS: Record<PublicationKindCode, KindCopy> = {
  journal_article: { noun: "artículo", lists: ["articulos", "my-articles"] },
  thesis: { noun: "tesis", lists: ["tesis", "my-thesis"] },
  conference_paper: { noun: "resumen", lists: ["eventos", "my-abstracts"] },
};

const MAX_CANDIDATES = 20;

/** One byline row. `memberId` is set only while the name is the one picked from a member. */
function authorRow(name = "", memberId: number | null = null) {
  return new FormGroup({
    name: requiredText(name),
    memberId: new FormControl<number | null>(memberId),
  });
}

type AuthorRow = ReturnType<typeof authorRow>;

function publicationForm() {
  return new FormGroup({
    publishedAt: new FormControl<Date | null>(null, Validators.required),
    doi: optionalText(),
    journalId: new FormControl<number | null>(null),
    issue: new FormControl<number | null>(null, Validators.min(1)),
    eventId: new FormControl<number | null>(null),
    universityId: new FormControl<number | null>(null),
    thesisKindCode: new FormControl<ThesisKindCode | null>(null),
    authors: new FormArray<AuthorRow>([authorRow()], Validators.required),
    translations: localeForm(() => ({ title: requiredText(), abstract: optionalText() })),
  });
}

type PublicationForm = ReturnType<typeof publicationForm>;
type PublicationFormValue = ReturnType<PublicationForm["getRawValue"]>;

function requireSubtype(form: PublicationForm, kind: PublicationKindCode): void {
  const { journalId, eventId, universityId, thesisKindCode } = form.controls;
  const required = {
    journal_article: [journalId],
    conference_paper: [eventId],
    thesis: [universityId, thesisKindCode],
  }[kind];
  for (const control of required) control.addValidators(Validators.required);
}

/** The required validators guarantee the fields a kind needs. */
function toSubtypeWrite(value: PublicationFormValue, kind: PublicationKindCode): PublicationSubtypeWrite {
  const { journalId, issue, eventId, universityId, thesisKindCode } = value;
  switch (kind) {
    case "journal_article":
      return { kindCode: kind, journalArticle: { journalId: journalId ?? undefined, issue: issue ?? undefined } };
    case "conference_paper":
      if (eventId === null) throw new Error("The paper has no event");
      return { kindCode: kind, conferencePaper: { eventId } };
    case "thesis":
      if (universityId === null || thesisKindCode === null) throw new Error("The thesis has no university or kind");
      return { kindCode: kind, thesis: { universityId, thesisKindCode } };
  }
}

type RegisteredCandidate = Extract<AuthorCandidate, { kind: "registered" }>;

function findMember(
  candidates: readonly AuthorCandidate[],
  matches: (member: RegisteredCandidate) => boolean,
): RegisteredCandidate | undefined {
  return candidates.find(
    (candidate): candidate is RegisteredCandidate => candidate.kind === "registered" && matches(candidate),
  );
}

/**
 * A row becomes a member author when the admin picked the member or typed a member's exact name.
 * Any other name is stored as written. The byline starts at order 1.
 */
function toAuthorWrite(
  row: PublicationFormValue["authors"][number],
  index: number,
  candidates: readonly AuthorCandidate[],
): PublicationAuthorWrite {
  const name = row.name.trim();
  const memberId = row.memberId ?? findMember(candidates, (member) => member.name === name)?.memberId ?? null;
  return memberId === null
    ? { kind: "external", externalName: name, authorOrder: index + 1 }
    : { kind: "registered", memberId, authorOrder: index + 1 };
}

function toPublicationWrite(
  value: PublicationFormValue,
  kind: PublicationKindCode,
  candidates: readonly AuthorCandidate[],
): PublicationWrite {
  if (!value.publishedAt) throw new Error("The publication has no date");
  return {
    publishedAt: toIsoDate(value.publishedAt),
    doi: value.doi.trim() || undefined,
    subtype: toSubtypeWrite(value, kind),
    authors: value.authors.map((row, index) => toAuthorWrite(row, index, candidates)),
    translations: value.translations,
  };
}

function candidateName(candidates: readonly AuthorCandidate[], memberId: number): string {
  return findMember(candidates, (member) => member.memberId === memberId)?.name ?? `Miembro ${memberId}`;
}

@Component({
  selector: "app-publication-page",
  imports: [
    AvatarComponent,
    ReactiveFormsModule,
    AutosizeModule,
    ContentFormComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["../content/forms/content-form.scss", "./publication.page.scss"],
  template: `
    <app-content-form
      [backTo]="listPath()"
      [saveLabel]="item() ? 'Actualizar información' : 'Guardar ' + copy().noun"
      [deleteLabel]="item() ? 'Eliminar ' + copy().noun : null"
      [canSave]="valid() && !saving()"
      [busy]="saving()"
      (save)="save()"
      (remove)="remove()"
    >
      <form [formGroup]="form" class="mt-24 mb-32">
        <div class="flex-news">
          <div class="mr-32 full-width">
            <div class="text-category">Fecha de publicación <span class="red-text">*</span></div>
            <mat-form-field class="input-category">
              <mat-label>Seleccionar fecha</mat-label>
              <input matInput [matDatepicker]="published" formControlName="publishedAt" />
              <mat-datepicker-toggle matSuffix [for]="published" />
              <mat-datepicker #published />
            </mat-form-field>
          </div>
          @switch (kind()) {
            @case ("journal_article") {
              <div class="mr-32 full-width">
                <div class="text-category">Revista <span class="red-text">*</span></div>
                <mat-form-field class="input-category">
                  <mat-label>Seleccionar revista</mat-label>
                  <mat-select formControlName="journalId">
                    @for (journal of lookup.journals(); track journal.id) {
                      <mat-option [value]="journal.id">{{ journal.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="mr-32 full-width">
                <div class="text-category">Volumen</div>
                <input class="input-category" type="number" min="1" step="1" formControlName="issue" />
              </div>
            }
            @case ("conference_paper") {
              <div class="mr-32 full-width">
                <div class="text-category">Evento <span class="red-text">*</span></div>
                <mat-form-field class="input-category">
                  <mat-label>Seleccionar evento</mat-label>
                  <mat-select formControlName="eventId">
                    @for (event of events(); track event.id) {
                      <mat-option [value]="event.id">{{ event.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }
            @case ("thesis") {
              <div class="mr-32 full-width">
                <div class="text-category">Tipo de tesis <span class="red-text">*</span></div>
                <mat-form-field class="input-category">
                  <mat-label>Seleccionar tipo</mat-label>
                  <mat-select formControlName="thesisKindCode">
                    @for (thesisKind of lookup.thesisKinds(); track thesisKind.code) {
                      <mat-option [value]="thesisKind.code">{{ thesisKind.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="mr-32 full-width">
                <div class="text-category">Universidad <span class="red-text">*</span></div>
                <mat-form-field class="input-category">
                  <mat-label>Seleccionar universidad</mat-label>
                  <mat-select formControlName="universityId">
                    @for (university of lookup.universities(); track university.id) {
                      <mat-option [value]="university.id">{{ university.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }
          }
          @if (kind() !== "thesis") {
            <div class="full-width">
              <div class="text-category">DOI</div>
              <input class="input-category" formControlName="doi" placeholder="Insertar DOI" />
            </div>
          }
        </div>

        <div class="full-width mt-16">
          <div class="text-category mb-0">Autores <span class="red-text">*</span></div>
          <div class="text-subtitle">
            En el orden de la publicación. Elige un miembro del GMCAN o escribe el nombre del autor tal como aparece en
            la publicación.
          </div>
          <div formArrayName="authors" class="mt-16">
            @for (row of form.controls.authors.controls; track row; let i = $index; let first = $first) {
              <div class="author-row" [formGroupName]="i">
                <span class="author-order">{{ i + 1 }}</span>
                <mat-form-field class="input-category author-name">
                  <mat-label>{{ first ? "Primer autor" : "Autor" }}</mat-label>
                  <input matInput formControlName="name" [matAutocomplete]="names" (input)="unlink(row)" />
                  <mat-autocomplete #names="matAutocomplete">
                    @for (candidate of matching(row.controls.name.value); track $index) {
                      <mat-option
                        [value]="candidate.name"
                        (onSelectionChange)="$event.isUserInput && link(row, candidate)"
                      >
                        @if (candidate.kind === "registered") {
                          <app-avatar
                            class="mr-12 img-user"
                            [src]="candidate.photoUrl"
                            [alt]="candidate.photoAlt"
                            [name]="candidate.name"
                          />
                        }
                        {{ candidate.name }}
                      </mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
                <button type="button" class="icon-button" [disabled]="first" (click)="moveUp(i)" title="Subir">
                  <mat-icon>arrow_upward</mat-icon>
                </button>
                <button
                  type="button"
                  class="icon-button"
                  [disabled]="form.controls.authors.length === 1"
                  (click)="removeAuthor(i)"
                  title="Quitar"
                >
                  <mat-icon>clear</mat-icon>
                </button>
              </div>
            }
          </div>
          <button type="button" class="green-text plex-sans mb-8" (click)="addAuthor()">Agregar autor</button>
        </div>

        <div formGroupName="translations">
          @for (locale of locales; track locale) {
            <div class="locale-section full-width" [formGroupName]="locale">
              <div class="locale-title">{{ label(locale) }}</div>
              <div class="text-category">Título <span class="red-text">*</span></div>
              <input class="input-category" formControlName="title" placeholder="Ingresar título" />
              <div class="text-category">Resumen</div>
              <textarea
                class="input-category"
                formControlName="abstract"
                placeholder="Insertar resumen"
                autosize
              ></textarea>
            </div>
          }
        </div>

        <div class="full-width mb-16">
          <div class="text-category">PDF (opcional)</div>
          <div class="flex-news">
            <div class="gray-box flex-news mr-16">
              <img class="upload-icon mr-16" src="/img/icons/upload.svg" alt="" />
              <span class="gray-pdf plex-sans">{{ file()?.name ?? (item()?.asset ? "PDF actual" : "PDF") }}</span>
            </div>
            <label class="green-text plex-sans">
              {{ file() || item()?.asset ? "Cambiar" : "Seleccionar PDF" }}
              <input class="file_upload" type="file" accept="application/pdf" (change)="pick($event)" />
            </label>
            @if (item()?.asset; as asset) {
              <a class="green-text plex-sans ml-16" [href]="asset" target="_blank" rel="noopener">Ver PDF actual</a>
            }
          </div>
        </div>
      </form>
    </app-content-form>
  `,
})
export default class PublicationPage implements OnInit, HasUnsavedChanges {
  readonly kind = input.required<PublicationKindCode>();
  readonly item = input<AdminPublication | null>(null);
  readonly authorCandidates = input.required<AuthorCandidate[]>();
  readonly events = input<EventItem[]>([]);

  private readonly publications = inject(PublicationService);
  private readonly assets = inject(AssetService);
  private readonly flow = inject(ContentFormFlow);
  private readonly route = inject(ActivatedRoute);
  readonly lookup = inject(LookupService);

  readonly locales = CONTENT_LOCALES;
  readonly label = localeLabel;
  readonly form = publicationForm();
  readonly valid = toSignal(this.form.statusChanges.pipe(map((status) => status === "VALID")), {
    initialValue: false,
  });
  readonly copy = computed(() => KINDS[this.kind()]);
  readonly listPath = computed(() => {
    const [adminList, ownList] = this.copy().lists;
    return `/dashboard/${resolveReturnTo(this.route, [adminList, ownList], ownList)}`;
  });
  readonly saving = signal(false);
  readonly file = signal<File | null>(null);
  private record = new RecordSave(null);

  ngOnInit(): void {
    requireSubtype(this.form, this.kind());
    const item = this.item();
    this.record = new RecordSave(item?.id ?? null);
    if (item) this.load(item);
    this.form.updateValueAndValidity();
  }

  private load(item: AdminPublication): void {
    const candidates = this.authorCandidates();
    const { subtype } = item;
    this.form.controls.authors.clear();
    for (const author of item.authors) {
      this.form.controls.authors.push(
        author.kind === "registered"
          ? authorRow(candidateName(candidates, author.memberId), author.memberId)
          : authorRow(author.externalName),
      );
    }
    this.form.patchValue({
      publishedAt: parseLocalDate(item.publishedAt) ?? null,
      doi: item.doi ?? "",
      journalId: subtype.kindCode === "journal_article" ? (subtype.journalArticle.journalId ?? null) : null,
      issue: subtype.kindCode === "journal_article" ? (subtype.journalArticle.issue ?? null) : null,
      eventId: subtype.kindCode === "conference_paper" ? subtype.conferencePaper.eventId : null,
      universityId: subtype.kindCode === "thesis" ? subtype.thesis.universityId : null,
      thesisKindCode: subtype.kindCode === "thesis" ? subtype.thesis.thesisKindCode : null,
      translations: item.translations,
    });
  }

  isDirty(): boolean {
    return this.form.dirty || this.file() !== null;
  }

  matching(name: string): AuthorCandidate[] {
    const query = name.trim().toLowerCase();
    return this.authorCandidates()
      .filter((candidate) => candidate.name.toLowerCase().includes(query))
      .slice(0, MAX_CANDIDATES);
  }

  link(row: AuthorRow, candidate: AuthorCandidate): void {
    row.controls.memberId.setValue(candidate.kind === "registered" ? candidate.memberId : null);
  }

  unlink(row: AuthorRow): void {
    row.controls.memberId.setValue(null);
  }

  addAuthor(): void {
    this.form.controls.authors.push(authorRow());
    this.form.markAsDirty();
  }

  removeAuthor(index: number): void {
    this.form.controls.authors.removeAt(index);
    this.form.markAsDirty();
  }

  moveUp(index: number): void {
    const authors = this.form.controls.authors;
    const row = authors.at(index);
    authors.removeAt(index, { emitEvent: false });
    authors.insert(index - 1, row);
    this.form.markAsDirty();
  }

  pick(event: Event): void {
    this.file.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  save(): Promise<void> {
    return this.flow.run(
      this.saving,
      async () => {
        const body = toPublicationWrite(this.form.getRawValue(), this.kind(), this.authorCandidates());
        const id = await this.record.write(
          () => this.publications.createPublication(body),
          (savedId) => this.publications.updatePublication(savedId, body),
        );
        const file = this.file();
        if (file) await firstValueFrom(this.assets.put({ ownerType: "publication", ownerId: id, slot: "file" }, file));
        this.form.markAsPristine();
        this.file.set(null);
      },
      this.item() ? "Publicación actualizada" : "Publicación agregada",
      "No se pudo guardar la publicación",
      this.listPath(),
    );
  }

  async remove(): Promise<void> {
    const id = this.record.savedId;
    if (id === null) return;
    const noun = this.copy().noun;
    if (!(await this.flow.confirmDelete(`Eliminar ${noun}`, `¿Estás seguro que deseas eliminar este ${noun}?`))) {
      return;
    }
    await this.flow.run(
      this.saving,
      async () => {
        await firstValueFrom(this.publications.deletePublication(id));
        this.form.markAsPristine();
      },
      "Publicación eliminada",
      "No se pudo eliminar la publicación",
      this.listPath(),
    );
  }
}
