import { CdkScrollable } from "@angular/cdk/scrolling";
import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { RichTextEditorComponent } from "@app/shared/components/rich-text-editor/rich-text-editor.component";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import { DialogData } from "@app/shared/models/dialogdata";
import { createNews } from "@app/shared/models/factories";
import type { News } from "@app/shared/models/news";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { AssetService } from "@app/shared/services/asset.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import { AutosizeModule } from "ngx-autosize";

import { toNewsUpsertBody } from "../flow/news-payload";

interface NewsPreviewData {
  title: string | null;
  summary: string | null;
  asset: string | ArrayBuffer | null;
  newsTypeName: string | null;
  author: {
    firstName: string;
    lastName: string;
    maternalName: string | null;
    photoUrl: string;
    photoAlt: string;
  } | null;
  body: string | null;
  publishedAt: string | null;
}

@Component({
  selector: "app-edit-news",
  templateUrl: "../add/add-news.component.html",
  styleUrl: "../add/add-news.component.scss",
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    MatOption,
    AutosizeModule,
    RichTextEditorComponent,
  ],
})
export default class EditNewsComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  private readonly assets = inject(AssetService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private newsService = inject(NewsService);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  lookup = inject(LookupService);

  noticia: News;
  publishedAtObj?: Date;
  edit = true;
  url: string;
  public newsForm: FormGroup;
  get categorias() {
    return this.lookup.newsKinds();
  }
  autores: AdminMemberListItem[] = [];
  button_text = "";
  button_text2 = "";

  constructor() {
    this.newsForm = this.formBuilder.group({
      title: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      summary: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      body: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      publishedAt: ["", [Validators.required]],
      authorId: [null, [Validators.required]],
      newsKindCode: ["", [Validators.required]],
    });
    this.noticia = createNews();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.initFromResolver();
    this.autores = this.route.snapshot.data["authors"] as AdminMemberListItem[];
  }

  isDirty(): boolean {
    return this.newsForm.dirty;
  }

  private initFromResolver(): void {
    const found = this.route.snapshot.data["news"] as News;
    this.noticia = found;
    this.newsForm.controls["body"].setValue(found.body);
    if (found.publishedAt) {
      this.publishedAtObj = parseLocalDate(found.publishedAt);
    }
    if (found.statusCode === "draft") {
      this.button_text = "Publicar noticia";
      this.button_text2 = "Guardar sin publicar";
      return;
    }
    this.button_text = "Actualizar noticia";
    this.button_text2 = "Dejar de publicar y guardar cambios";
  }

  return(): void {
    this.router.navigate(["dashboard/news"]);
  }

  submitNews(mode: "published" | "draft"): void {
    if (mode === "published" && this.newsForm.valid && (this.noticia.asset || this.fileData)) {
      this.publishDialog(mode);
    } else if (mode === "draft") {
      if (this.noticia.statusCode === "draft") {
        this.publishMethod(mode);
      } else {
        this.notPublishDialog(mode);
      }
    }
  }

  publish(mode: "published" | "draft"): void {
    if (mode === "published" && this.newsForm.valid && (this.noticia.asset || this.fileData)) {
      this.publishMethod(mode);
    } else if (mode === "draft") {
      this.publishMethod(mode);
    }
  }

  publishMethod(mode: "published" | "draft"): void {
    this.noticia.body = this.newsForm.controls["body"].value ?? "";
    const publishedAt = this.publishedAtObj ? toIsoDate(this.publishedAtObj) : undefined;
    const body = toNewsUpsertBody(this.noticia, mode, publishedAt);
    if (!body) return;
    this.newsService.updateNews(this.noticia.id, body).subscribe((result) => {
      if (result.status === 1) {
        if (this.fileData) {
          this.assets.put({ ownerType: "news", ownerId: this.noticia.id, slot: "photo" }, this.fileData).subscribe();
        }
        this.newsForm.markAsPristine();
        this.return();
        this.openSnackBar(mode === "published" ? "Noticia publicada exitosamente" : "Noticia guardada exitosamente");
      }
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview2>;

  previewNews(): void {
    const cat = this.categorias.find((x) => x.code === this.noticia.newsKindCode);
    const aut = this.autores.find((x) => x.id === this.noticia.authorId) ?? null;
    const publishedAt = this.publishedAtObj ? toIsoDate(this.publishedAtObj) : null;
    const data: NewsPreviewData = {
      title: this.noticia.title ?? null,
      summary: this.noticia.summary ?? null,
      asset: this.previewUrl ?? this.noticia.asset,
      newsTypeName: cat?.name ?? null,
      author: aut
        ? {
            firstName: aut.firstName,
            lastName: aut.lastName,
            maternalName: aut.maternalName,
            photoUrl: aut.photoUrl,
            photoAlt: aut.photoAlt,
          }
        : null,
      body: this.newsForm.controls["body"].value ?? null,
      publishedAt,
    };
    this.previewDialog = this.dialog.open(DialogPreview2, {
      width: "871px",
      id: "previewNews",
      data,
    });
    this.previewDialog.afterClosed().subscribe();
  }

  private dialogRef2?: MatDialogRef<DialogPublish2>;

  publishDialog(value: "published" | "draft"): void {
    this.dialogRef2 = this.dialog.open(DialogPublish2, {
      width: "530px",
      id: "idleTimer",
      data: {
        title:
          this.noticia.statusCode === "published"
            ? "¿Estás seguro que deseas actualizar la noticia?"
            : "¿Estás seguro que deseas publicar la noticia?",
        text: "La información será publica para todo el mundo",
        cancel: "No, cancelar",
        yes: "Sí, publicar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (!result) {
        this.publish(value);
      }
    });
  }

  private dialogRef3?: MatDialogRef<DialogPublish3>;

  notPublishDialog(value: "published" | "draft"): void {
    this.dialogRef3 = this.dialog.open(DialogPublish3, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Dejar de publicar noticia",
        text: "¿Estás seguro de que deseas dejar de publicar esta noticia?",
        cancel: "Si, dejar de publicar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef3.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.publish(value);
      }
    });
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  date = new FormControl(new Date());

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileProgress(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    this.fileData = input.files?.[0] ?? null;
    this.preview();
  }

  preview(): void {
    if (!this.fileData) return;
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) return;
    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", () => {
      this.previewUrl = reader.result;
    });
  }

  private dialogRef5?: MatDialogRef<DialogErase2>;

  openEraser(): void {
    this.dialogRef5 = this.dialog.open(DialogErase2, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar noticia",
        text: "¿Estás seguro que deseas eliminar esta noticia?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef5.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseNews();
      }
    });
  }

  eraseNews(): void {
    this.newsService.deleteNews(this.noticia.id).subscribe((result) => {
      if (result.status === 1) {
        this.newsForm.markAsPristine();
        this.return();
        this.openSnackBar("Noticia eliminada exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogPublish3 {
  dialogRef = inject<MatDialogRef<DialogPublish3>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogPublish2 {
  dialogRef = inject<MatDialogRef<DialogPublish2>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-preview.html",
  styleUrl: "../../../public/detail-news/component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogClose],
})
export class DialogPreview2 {
  dialogRef = inject<MatDialogRef<DialogPreview2>>(MatDialogRef);
  noticia = inject<NewsPreviewData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url: string;
  dia = "";
  mes = "";
  anio = "";
  datere: Date = new Date();

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    const newsBody = document.getElementById("newsBody");
    if (newsBody) {
      newsBody.innerHTML = this.noticia.body ?? "";
    }
    this.datere = new Date(String(this.noticia.publishedAt));
    this.dia = this.datePipe.transform(this.datere, "dd") ?? "";
    this.mes = this.datePipe.transform(this.datere, "MMMM") ?? "";
    this.anio = this.datePipe.transform(this.datere, "y") ?? "";
  }

  public fbicon = "/img/icons/Facebook.svg";
  public twitter = "/img/icons/twitter.svg";
  mouseEnter(int: number): void {
    switch (int) {
      case 1:
        this.fbicon = "/img/icons/Facebook2.svg";
        break;
      case 2:
        this.twitter = "/img/icons/twitter2.svg";
        break;
    }
  }

  mouseLeave(int: number): void {
    switch (int) {
      case 1:
        this.fbicon = "/img/icons/Facebook.svg";
        break;
      case 2:
        this.twitter = "/img/icons/twitter.svg";
        break;
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase2 {
  dialogRef = inject<MatDialogRef<DialogErase2>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
