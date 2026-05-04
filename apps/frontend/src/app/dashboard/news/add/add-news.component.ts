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
import type { Member } from "@app/shared/models/member";
import type { News } from "@app/shared/models/news";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService } from "@app/shared/services/news.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

import { toNewsUpsertBody } from "../flow/news-payload";

interface NewsPreviewData {
  title: string | null;
  summary: string | null;
  photo: string | ArrayBuffer | null;
  newsTypeName: string | null;
  author: { firstName: string; lastName: string; maternalName: string | null; photo: string | null } | null;
  body: string | null;
  publishedAt: string | null;
}

@Component({
  selector: "app-add-news",
  templateUrl: "./add-news.component.html",
  styleUrl: "./add-news.component.scss",
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
export default class AddNewsComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private newsService = inject(NewsService);
  private snackBar = inject(MatSnackBar);
  lookup = inject(LookupService);
  private memberService = inject(MemberService);

  public Editor = ClassicEditor;
  url: string;
  noticia: News;
  publishedAtObj?: Date;
  public newsForm: FormGroup;
  get categorias() {
    return this.lookup.newsTypes();
  }
  autores: Member[] = [];
  button_text = "Publicar noticia";
  button_text2 = "Guardar sin publicar";

  constructor() {
    this.newsForm = this.formBuilder.group({
      title: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      summary: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      body: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      publishedAt: ["", Validators.required],
      authorId: [null, Validators.required],
      newsTypeId: ["", Validators.required],
    });
    this.noticia = createNews();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.getAuthors();
  }

  isDirty(): boolean {
    return this.newsForm.dirty;
  }

  getAuthors(): void {
    this.memberService.listAdminMembers().subscribe((result: Member[]) => {
      if (result) {
        this.autores = result;
      }
    });
  }

  edit = false;
  openEraser(): void {}

  return(): void {
    this.router.navigate(["dashboard/noticias"]);
  }

  submitNews(status: number): void {
    if (status === 1 && this.newsForm.valid && this.fileData) {
      this.publishDialog(status);
    } else if (status === 0) {
      this.publish(status);
    }
  }

  publish(status: number): void {
    const publishedAt = this.publishedAtObj ? new Date(this.publishedAtObj).toLocaleDateString("sv") : undefined;
    const body = toNewsUpsertBody(this.noticia, status, publishedAt);
    if (!body) return;
    this.newsService.createNews(body).subscribe((result) => {
      if (result.id) {
        if (this.fileData) {
          this.newsService.uploadPhoto(result.id, this.fileData).subscribe();
        }
        this.newsForm.markAsPristine();
        this.return();
        this.openSnackBar("Noticia agregada exitosamente");
      }
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview>;

  previewNews(): void {
    const cat = this.categorias.find((x) => x.id === this.noticia.newsTypeId);
    const aut = this.autores.find((x) => x.id === this.noticia.authorId) ?? null;
    const publishedAt = this.publishedAtObj ? new Date(this.publishedAtObj).toLocaleDateString("sv") : null;
    const data: NewsPreviewData = {
      title: this.noticia.title ?? null,
      summary: this.noticia.summary ?? null,
      photo: this.previewUrl,
      newsTypeName: cat?.name ?? null,
      author: aut
        ? { firstName: aut.firstName, lastName: aut.lastName, maternalName: aut.maternalName, photo: aut.photo }
        : null,
      body: this.noticia.body ?? null,
      publishedAt,
    };
    this.previewDialog = this.dialog.open(DialogPreview, {
      width: "871px",
      id: "previewNews",
      data,
    });
    this.previewDialog.afterClosed().subscribe();
  }

  private dialogRef?: MatDialogRef<DialogPublish>;

  publishDialog(value: number): void {
    this.dialogRef = this.dialog.open(DialogPublish, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "¿Estás seguro que deseas publicar la noticia?",
        text: "La información será publica para todo el mundo",
        cancel: "No, cancelar",
        yes: "Sí, publicar",
      },
    });
    this.dialogRef.afterClosed().subscribe((result: unknown) => {
      if (!result) {
        this.publish(value);
      }
    });
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, undefined, {
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
    if (!this.fileData) {
      this.previewUrl = null;
      return;
    }
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) return;
    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", () => {
      this.previewUrl = reader.result;
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogPublish {
  dialogRef = inject<MatDialogRef<DialogPublish>>(MatDialogRef);
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
export class DialogPreview {
  dialogRef = inject<MatDialogRef<DialogPreview>>(MatDialogRef);
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
