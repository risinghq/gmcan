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
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import { createNoticiaFull } from "@app/shared/models/factories";
import { Languages } from "@app/shared/models/languages";
import type { NoticiaFull } from "@app/shared/models/noticiafull";
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { Usuario } from "@app/shared/models/usuario";
import { GLOBAL } from "@app/shared/services/global";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TipoNoticiaService } from "@app/shared/services/tiponoticia.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

interface AddNewsResponse {
  status?: number;
  rows?: number;
}

interface NewsPreviewData {
  language: number;
  titulo?: string;
  resumen?: string;
  foto: string | ArrayBuffer | null;
  nombreTipoNoticia?: string;
  usuario: {
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    foto?: string;
  };
  cuerpo?: string;
  fechaPublicacion?: string;
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
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  _noticiaService = inject(NoticiaService);
  private _snackBar = inject(MatSnackBar);
  private _tipoNoticiaService = inject(TipoNoticiaService);
  private _usuarioService = inject(UsuarioService);

  public Editor = ClassicEditor;
  url: string;
  noticia: NoticiaFull;
  public newsForm: FormGroup;
  categorias: TipoNoticia[] = [];
  autores: Usuario[] = [];
  button_text = "Publicar noticia";
  button_text2 = "Guardar sin publicar";
  constructor() {
    this.newsForm = this.formBuilder.group({
      titulo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      tituloEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumen: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cuerpo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      cuerpoEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacion: ["", Validators.required],
      autorPublicacion: [null, Validators.required],
      tipoNoticia_idtipoNoticia: ["", Validators.required],
    });
    this.noticia = createNoticiaFull();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  isDirty(): boolean {
    return this.newsForm.dirty;
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

  edit = false;
  openEraser(): void {}

  return(): void {
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory(value: number): void {
    this.noticia.estado = value;
  }

  submitNews(value: number): void {
    if (value === 1 && this.newsForm.valid && this.fileData) {
      this.publishDialog(value);
    } else if (value === 0) {
      this.publish(value);
    }
  }

  publish(value: number): void {
    this.noticia.estado = value;
    if (this.noticia.fechaPublicacionDate) {
      const momentDate = new Date(this.noticia.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.noticia.fechaPublicacion = formattedDate;
    } else {
      this.noticia.fechaPublicacion = undefined;
    }
    if (!this.noticia.autorPublicacion) {
      this.noticia.autorPublicacion = undefined;
    }
    this._noticiaService.addNews(this.noticia).subscribe((result: AddNewsResponse) => {
      if (result.status === 1) {
        if (this.fileData && result.rows != null) {
          this._noticiaService.uploadNoticiaFoto(this.fileData, result.rows).subscribe(() => {});
        }
        this.newsForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  private previewDialog?: MatDialogRef<DialogPreview>;

  previewNews(value: number): void {
    const indexCat = this.categorias.findIndex(
      (x: TipoNoticia) => x.idtipoNoticia === this.noticia.tipoNoticia_idtipoNoticia,
    );
    const indexAut = this.autores.findIndex((x: Usuario) => x.DNI === this.noticia.autorPublicacion);
    const d = new Date(this.noticia.fechaPublicacionDate ?? new Date());
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    const momentDate = d; // Replace event.value with your date value
    const formattedDate = new Date(momentDate).toLocaleDateString("sv");
    this.noticia.fechaPublicacion = formattedDate;
    const noticiaPreview: NewsPreviewData = {
      language: value,
      titulo: "",
      resumen: "",
      foto: this.previewUrl,
      nombreTipoNoticia: "",
      usuario: {
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        foto: "",
      },
      cuerpo: "",
      fechaPublicacion: this.noticia.fechaPublicacion,
    };
    if (indexCat !== -1) {
      noticiaPreview.nombreTipoNoticia = this.categorias[indexCat].nombre;
    }
    if (indexAut !== -1) {
      noticiaPreview.usuario.nombre = this.autores[indexAut].nombre;
      noticiaPreview.usuario.apellidoPaterno = this.autores[indexAut].apellidoPaterno;
      noticiaPreview.usuario.apellidoMaterno = this.autores[indexAut].apellidoMaterno;
      noticiaPreview.usuario.foto = this.autores[indexAut].foto;
    }
    switch (value) {
      case 0:
        noticiaPreview.titulo = this.noticia.titulo;
        noticiaPreview.resumen = this.noticia.resumen;
        noticiaPreview.cuerpo = this.noticia.cuerpo;
        break;
      case 1:
        noticiaPreview.titulo = this.noticia.tituloEN;
        noticiaPreview.resumen = this.noticia.resumenEN;
        noticiaPreview.cuerpo = this.noticia.cuerpoEN;
        break;
      default:
        break;
    }
    this.previewDialog = this.dialog.open(DialogPreview, {
      width: "871px",
      id: "previewNews",
      data: noticiaPreview,
    });

    this.previewDialog.afterClosed().subscribe((result: unknown) => {
      if (!result) {
      }
    });
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

  openSnackBar(): void {
    this._snackBar.open("Noticia agregada exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  date = new FormControl(new Date());

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileUploadProgress: string | null = null;
  uploadedFilePath: string | null = null;
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

    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

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
  styleUrl: "../../../public/detail-news/detail-news.component.scss",
  imports: [MatDialogClose],
})
export class DialogPreview {
  dialogRef = inject<MatDialogRef<DialogPreview>>(MatDialogRef);
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
