import { CdkScrollable } from "@angular/cdk/scrolling";
import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
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
import { DialogData } from "@app/shared/models/dialogdata";
import { createNews } from "@app/shared/models/factories";
import { Languages } from "@app/shared/models/languages";
import type { Member } from "@app/shared/models/member";
import type { News } from "@app/shared/models/news";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService, type NewsBody } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { parseLocalDate, toIsoDate } from "@app/shared/utils/date";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

interface NewsPreviewData {
  language: number;
  title: string | null;
  summary: string | null;
  photo: string | ArrayBuffer | null;
  newsTypeName: string | null;
  author: { firstName: string; lastName: string; maternalName: string | null; photo: string | null } | null;
  body: string | null;
  publishedAt: string | null;
}

@Component({
  selector: "app-edit-news",
  templateUrl: "../add/add-news.component.html",
  styleUrl: "../add/add-news.component.scss",
  providers: [provideNativeDateAdapter()],
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
    CKEditorModule,
  ],
})
export default class EditNewsComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private newsService = inject(NewsService);
  dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  lookup = inject(LookupService);
  private memberService = inject(MemberService);
  private session = inject(SessionService);

  public Editor = ClassicEditor;
  noticia: News;
  publishedAtObj?: Date;
  edit = true;
  url: string;
  public newsForm: FormGroup;
  get categorias() {
    return this.lookup.newsTypes();
  }
  autores: Member[] = [];
  button_text = "";
  button_text2 = "";

  constructor() {
    this.newsForm = this.formBuilder.group({
      titulo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      tituloEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cuerpo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cuerpoEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacion: ["", [Validators.required]],
      autorPublicacion: [null, [Validators.required]],
      tipoNoticia_idtipoNoticia: ["", [Validators.required]],
    });
    this.noticia = createNews();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.getNews();
  }

  isDirty(): boolean {
    return this.newsForm.dirty;
  }

  getNews(): void {
    const id = Number(this.route.snapshot.params["id"] ?? 0);
    this.newsService.getAdminNews(id).subscribe((found: News) => {
      if (found) {
        this.noticia = found;
        this.newsForm.controls["cuerpo"].setValue(found.body);
        if (found.publishedAt) {
          this.publishedAtObj = parseLocalDate(found.publishedAt);
        }
        this.session.setNoticiaPublicada((found.status ?? 0) === 1);
        this.getAuthors();
        if (found.status === 0) {
          this.button_text = "Publicar noticia";
          this.button_text2 = "Guardar sin publicar";
        } else {
          this.button_text = "Actualizar noticia";
          this.button_text2 = "Dejar de publicar y guardar cambios";
        }
      }
    });
  }

  getAuthors(): void {
    this.memberService.listAdminMembers().subscribe((result: Member[]) => {
      if (result) {
        this.autores = result;
      }
    });
  }

  return(): void {
    this.router.navigate(["dashboard/noticias"]);
  }

  submitNews(status: number): void {
    if (status === 1 && this.newsForm.valid && (this.noticia.photo || this.fileData)) {
      this.publishDialog(status);
    } else if (status === 0) {
      if (this.noticia.status === 0) {
        this.publishMethod(status);
      } else {
        this.notPublishDialog(status);
      }
    }
  }

  publish(status: number): void {
    if (status === 1 && this.newsForm.valid && (this.noticia.photo || this.fileData)) {
      this.publishMethod(status);
    } else if (status === 0) {
      this.publishMethod(status);
    }
  }

  publishMethod(status: number): void {
    const publishedAt = this.publishedAtObj ? toIsoDate(this.publishedAtObj) : undefined;
    const body: NewsBody = {
      title: this.noticia.title ?? undefined,
      titleEN: this.noticia.titleEN ?? undefined,
      summary: this.noticia.summary ?? undefined,
      summaryEN: this.noticia.summaryEN ?? undefined,
      body: this.noticia.body ?? undefined,
      bodyEN: this.noticia.bodyEN ?? undefined,
      status,
      publishedAt,
      authorId: this.noticia.authorId ?? undefined,
      newsTypeId: this.noticia.newsTypeId ?? undefined,
    };
    this.newsService.updateNews(this.noticia.id, body).subscribe((result) => {
      if (result.status === 1) {
        if (this.fileData) {
          this.newsService.uploadPhoto(this.noticia.id, this.fileData).subscribe();
        }
        this.newsForm.markAsPristine();
        this.return();
        this.openSnackBar(status === 1 ? "Noticia publicada exitosamente" : "Noticia guardada exitosamente");
      }
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview2>;

  previewNews(value: number): void {
    const cat = this.categorias.find((x) => x.id === this.noticia.newsTypeId);
    const aut = this.autores.find((x) => x.id === this.noticia.authorId) ?? null;
    const publishedAt = this.publishedAtObj ? toIsoDate(this.publishedAtObj) : null;
    const data: NewsPreviewData = {
      language: value,
      title: value === 0 ? (this.noticia.title ?? null) : (this.noticia.titleEN ?? null),
      summary: value === 0 ? (this.noticia.summary ?? null) : (this.noticia.summaryEN ?? null),
      photo: this.previewUrl ?? (this.noticia.photo ? this.url + "api/news/" + this.noticia.id + "/photo" : null),
      newsTypeName: cat?.name ?? null,
      author: aut
        ? { firstName: aut.firstName, lastName: aut.lastName, maternalName: aut.maternalName, photo: aut.photo }
        : null,
      body: value === 0 ? (this.noticia.body ?? null) : (this.noticia.bodyEN ?? null),
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

  publishDialog(value: number): void {
    this.dialogRef2 = this.dialog.open(DialogPublish2, {
      width: "530px",
      id: "idleTimer",
      data: {
        title:
          this.noticia.status === 1
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

  notPublishDialog(value: number): void {
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
  imports: [MatDialogClose],
})
export class DialogPreview2 {
  dialogRef = inject<MatDialogRef<DialogPreview2>>(MatDialogRef);
  noticia = inject<NewsPreviewData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url: string;
  language: (typeof Languages)[number] | undefined;
  dia = "";
  mes = "";
  anio = "";
  datere: Date = new Date();

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = Languages[this.noticia.language];
    const newsBody = document.getElementById("newsBody");
    if (newsBody) {
      newsBody.innerHTML = this.noticia.body ?? "";
    }
    this.datere = new Date(String(this.noticia.publishedAt));
    this.dia = this.datePipe.transform(this.datere, "dd") ?? "";
    this.mes = this.datePipe.transform(this.datere, "MMMM") ?? "";
    this.anio = this.datePipe.transform(this.datere, "y") ?? "";
  }

  public fbicon = "../../assets/img/Facebook.svg";
  public twitter = "../../assets/img/twitter.svg";
  mouseEnter(int: number): void {
    switch (int) {
      case 1:
        this.fbicon = "../../assets/img/Facebook2.svg";
        break;
      case 2:
        this.twitter = "../../assets/img/twitter2.svg";
        break;
    }
  }

  mouseLeave(int: number): void {
    switch (int) {
      case 1:
        this.fbicon = "../../assets/img/Facebook.svg";
        break;
      case 2:
        this.twitter = "../../assets/img/twitter.svg";
        break;
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
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
