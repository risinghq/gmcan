import { CdkScrollable } from "@angular/cdk/scrolling";
import { TitleCasePipe } from "@angular/common";
import { DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormControl } from "@angular/forms";
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
import { ActivatedRoute, Router, Params } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { createNoticiaFull } from "@app/shared/models/factories";
import { Languages } from "@app/shared/models/languages";
import type { NoticiaFull } from "@app/shared/models/noticiafull";
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { Usuario } from "@app/shared/models/usuario";
import { GLOBAL } from "@app/shared/services/global";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { SessionService } from "@app/shared/services/session.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoNoticiaService } from "@app/shared/services/tiponoticia.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

interface StatusResponse {
  status?: number;
}

interface NewsPreviewUser {
  nombre: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  foto: string | null;
}

interface NewsPreviewData {
  language: number;
  titulo: string | null;
  resumen: string | null;
  foto: string;
  nombreTipoNoticia: string | null;
  usuario: NewsPreviewUser;
  cuerpo: string | null;
  fechaPublicacion: string | Date | undefined;
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
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _noticiaService = inject(NoticiaService);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _tipoNoticiaService = inject(TipoNoticiaService);
  private _usuarioService = inject(UsuarioService);
  private _session = inject(SessionService);

  public Editor = ClassicEditor;
  noticia: NoticiaFull;
  edit = true;

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
    this.noticia = createNoticiaFull();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.getNews();
  }
  url: string;
  public newsForm: FormGroup;
  categorias: TipoNoticia[] = [];
  autores: Usuario[] = [];
  button_text = "";
  button_text2 = "";

  isDirty(): boolean {
    return this.newsForm.dirty;
  }

  getNews(): void {
    this._route.params.forEach((params: Params) => {
      const idNoticia = Number(params["id"] ?? 0);
      this._noticiaService.getNoticiaFull(idNoticia).subscribe((result: NoticiaFull) => {
        if (result) {
          this.noticia = result;
          this.newsForm.controls["cuerpo"].setValue(this.noticia.cuerpo);
          const d = new Date(result.fechaPublicacion ?? new Date());
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.noticia.fechaPublicacion = d.toISOString();
          this.noticia.fechaPublicacionDate = d;
          this._session.setNoticiaPublicada((this.noticia.estado ?? 0) === 1);
          this.getCategorias();
          if (this.noticia.estado == 0) {
            this.button_text = "Publicar noticia";
            this.button_text2 = "Guardar sin publicar";
          } else {
            this.button_text = "Actualizar noticia";
            this.button_text2 = "Dejar de publicar y guardar cambios";
          }
        }
      });
    });
  }

  getCategorias(): void {
    this._tipoNoticiaService.getTipoNoticia().subscribe((result: TipoNoticia[]) => {
      if (result) {
        this.categorias = result;
      }
      this.getAuthors();
    });
  }

  getAuthors(): void {
    this._usuarioService.getUsuario().subscribe((result: Usuario[]) => {
      if (result) {
        this.autores = result;
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory(value: number): void {
    this.noticia.estado = value;
  }

  submitNews(value: number): void {
    if (value == 1 && this.newsForm.valid && (this.noticia.foto || this.fileData)) {
      this.publishDialog(value);
    } else if (value == 0) {
      if (this.noticia.estado == 0) {
        this.publishMethod(value);
      } else {
        this.notPublishDialog(value);
      }
    }
  }

  publish(value: number): void {
    if (value == 1 && this.newsForm.valid && (this.noticia.foto || this.fileData)) {
      this.publishMethod(value);
    } else if (value == 0) {
      this.publishMethod(value);
    }
  }

  publishMethod(value: number): void {
    this.noticia.estado = value;
    if (this.noticia.fechaPublicacionDate) {
      const momentDate = new Date(this.noticia.fechaPublicacionDate);
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.noticia.fechaPublicacion = formattedDate;
    } else {
      this.noticia.fechaPublicacion = undefined;
    }
    if (!this.noticia.autorPublicacion) {
      this.noticia.autorPublicacion = undefined;
    }
    this._noticiaService.updateNoticia(this.noticia).subscribe((result: StatusResponse) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._noticiaService
            .uploadNoticiaFoto(this.fileData, this.noticia.idNoticia ?? 0)
            .subscribe((_res: unknown) => {});
        }
        this.newsForm.markAsPristine();
        this.return();
        if (value == 1) {
          this.openSnackBar("Noticia publicada exitosamente");
        } else {
          this.openSnackBar("Noticia guardada exitosamente");
        }
      }
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview2>;

  previewNews(value: number): void {
    const indexCat = this.categorias.findIndex(
      (x: TipoNoticia) => x.idtipoNoticia == this.noticia.tipoNoticia_idtipoNoticia,
    );
    const indexAut = this.autores.findIndex((x: Usuario) => x.DNI == this.noticia.autorPublicacion);
    let noticiaPreview: NewsPreviewData = {
      language: value,
      titulo: null,
      resumen: null,
      foto: this.url + "noticia/get-image-noticia/" + this.noticia.foto,
      nombreTipoNoticia: null,
      usuario: {
        nombre: null,
        apellidoPaterno: null,
        apellidoMaterno: null,
        foto: null,
      },
      cuerpo: null,
      fechaPublicacion: this.noticia.fechaPublicacion,
    };
    if (this.previewUrl) {
      noticiaPreview = this.previewUrl;
    }
    if (indexCat != -1) {
      noticiaPreview.nombreTipoNoticia = this.categorias[indexCat].nombre ?? null;
    }
    if (indexAut != -1) {
      noticiaPreview.usuario.nombre = this.autores[indexAut].nombre ?? null;
      noticiaPreview.usuario.apellidoPaterno = this.autores[indexAut].apellidoPaterno ?? null;
      noticiaPreview.usuario.apellidoMaterno = this.autores[indexAut].apellidoMaterno ?? null;
      noticiaPreview.usuario.foto = this.autores[indexAut].foto ?? null;
    }
    switch (value) {
      case 0:
        noticiaPreview.titulo = this.noticia.titulo ?? null;
        noticiaPreview.resumen = this.noticia.resumen ?? null;
        noticiaPreview.cuerpo = this.noticia.cuerpo ?? null;
        break;
      case 1:
        noticiaPreview.titulo = this.noticia.tituloEN ?? null;
        noticiaPreview.resumen = this.noticia.resumenEN ?? null;
        noticiaPreview.cuerpo = this.noticia.cuerpoEN ?? null;
        break;
      default:
        break;
    }
    this.previewDialog = this.dialog.open(DialogPreview2, {
      width: "871px",
      id: "previewNews",
      data: noticiaPreview,
    });

    this.previewDialog.afterClosed().subscribe((result: boolean) => {
      if (!result) {
      }
    });
  }

  private dialogRef2?: MatDialogRef<DialogPublish2>;

  publishDialog(value: number): void {
    if (this.noticia.estado == 1) {
      this.dialogRef2 = this.dialog.open(DialogPublish2, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "¿Estás seguro que deseas actualizar la noticia?",
          text: "La información será publica para todo el mundo",
          cancel: "No, cancelar",
          yes: "Sí, publicar",
        },
      });
    } else {
      this.dialogRef2 = this.dialog.open(DialogPublish2, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "¿Estás seguro que deseas publicar la noticia?",
          text: "La información será publica para todo el mundo",
          cancel: "No, cancelar",
          yes: "Sí, publicar",
        },
      });
    }

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
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  date = new FormControl(new Date());

  fileData: File | null = null;
  previewUrl: any = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
  fileProgress(fileInput: any): void {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();
  }

  preview(): void {
    // Show preview
    if (!this.fileData) {
      return;
    }
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.addEventListener("load", (_event: ProgressEvent<FileReader>) => {
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
    this._noticiaService.deleteNoticia(this.noticia.idNoticia ?? 0).subscribe((result: StatusResponse) => {
      if (result.status == 1) {
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
  styleUrl: "../../../public/detail-news/detail-news.component.scss",
  imports: [MatDialogClose],
})
export class DialogPreview2 {
  dialogRef = inject<MatDialogRef<DialogPreview2>>(MatDialogRef);
  noticia = inject<NewsPreviewData>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url: string;
  language: any = null;
  dia: string = "";
  mes: string = "";
  anio: string = "";
  datere: Date = new Date();
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = Languages[this.noticia.language];
    const newsBody = document.getElementById("newsBody");
    if (newsBody) {
      newsBody.innerHTML = this.noticia.cuerpo ?? "";
    }
    this.datere = new Date(String(this.noticia.fechaPublicacion));
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
