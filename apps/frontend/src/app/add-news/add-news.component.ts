import { CdkScrollable } from "@angular/cdk/scrolling";
import { TitleCasePipe, NgIf, NgFor, NgClass } from "@angular/common";
import { DatePipe } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
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
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

import { DialogData } from "../models/dialogdata";
import { Languages } from "../models/languages";
import { NoticiaFull } from "../models/noticiafull";
import { TipoNoticia } from "../models/tiponoticia";
import { Usuario } from "../models/usuario";
import { CommonService } from "../services/common.service";
import { GLOBAL } from "../services/global";
import { NoticiaService } from "../services/noticia.service";
import { SpaceValidator } from "../services/spacevalidator";
import { TipoNoticiaService } from "../services/tiponoticia.service";
import { UsuarioService } from "../services/usuario.service";

@Component({
  selector: "app-add-news",
  templateUrl: "./add-news.component.html",
  styleUrls: ["./add-news.component.scss"],
  providers: [provideNativeDateAdapter()],
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    NgFor,
    MatOption,
    AutosizeModule,
    CKEditorModule,
    NgClass,
  ],
})
export class AddNewsComponent implements OnInit {
  public Editor = ClassicEditor;
  url;
  noticia: NoticiaFull;
  public newsForm: FormGroup;
  categorias: Array<TipoNoticia>;
  autores: Array<Usuario>;
  button_text = "Publicar noticia";
  button_text2 = "Guardar sin publicar";
  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    public _noticiaService: NoticiaService,
    private _snackBar: MatSnackBar,
    private _tipoNoticiaService: TipoNoticiaService,
    private _usuarioService: UsuarioService,
    private _commonService: CommonService,
  ) {
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
    this.noticia = new NoticiaFull(null, "", "", "", "", "", "", null, "", null, null, null, null, "", "", null);
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.getCategorias();
  }

  getCategorias() {
    this._tipoNoticiaService.getTipoNoticia().subscribe((result) => {
      if (result) {
        this.categorias = result;
      }
      this.getAuthors();
    });
  }

  getAuthors() {
    this._usuarioService.getUsuario().subscribe((result) => {
      if (result) {
        this.autores = result;
      }
    });
  }

  agregar;
  eliminar;

  edit;
  openEraser() {}

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/noticias"]);
  }

  submitCategory(value) {
    this.noticia.estado = value;
  }

  submitNews(value) {
    if (value == 1 && this.newsForm.valid && this.fileData) {
      this.publishDialog(value);
    } else if (value == 0) {
      this.publish(value);
    }
  }

  publish(value) {
    this.noticia.estado = value;
    if (this.noticia.fechaPublicacionDate) {
      const momentDate = new Date(this.noticia.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = new Date(momentDate).toLocaleDateString("sv");
      this.noticia.fechaPublicacion = formattedDate;
    } else {
      this.noticia.fechaPublicacion = null;
    }
    if (!this.noticia.autorPublicacion) {
      this.noticia.autorPublicacion = null;
    }
    this._noticiaService.addNews(this.noticia).subscribe((result) => {
      if (result.status == 1) {
        if (this.fileData) {
          this._noticiaService.uploadNoticiaFoto(this.fileData, result.rows).subscribe((res) => {});
        }
        this.agregar = true;
        this.return();
        this.openSnackBar();
      }
    });
  }

  private previewDialog: MatDialogRef<DialogPreview>;

  previewNews(value) {
    let indexCat = this.categorias.findIndex((x) => x.idtipoNoticia == this.noticia.tipoNoticia_idtipoNoticia);
    let indexAut = this.autores.findIndex((x) => x.DNI == this.noticia.autorPublicacion);
    var d = new Date(this.noticia.fechaPublicacionDate);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    const momentDate = d; // Replace event.value with your date value
    const formattedDate = new Date(momentDate).toLocaleDateString("sv");
    this.noticia.fechaPublicacion = formattedDate;
    let noticiaPreview = {
      language: value,
      titulo: null,
      resumen: null,
      foto: this.previewUrl,
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
    if (indexCat != -1) {
      noticiaPreview.nombreTipoNoticia = this.categorias[indexCat].nombre;
    }
    if (indexAut != -1) {
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

    this.previewDialog.afterClosed().subscribe((result) => {
      if (!result) {
      }
    });
  }

  private dialogRef: MatDialogRef<DialogPublish>;

  publishDialog(value) {
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

    this.dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        this.publish(value);
      }
    });
  }

  openSnackBar() {
    this._snackBar.open("Noticia agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  date = new FormControl(new Date());

  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();
  }

  preview() {
    // Show preview
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
    };
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
  imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogPublish {
  constructor(
    public dialogRef: MatDialogRef<DialogPublish>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-preview.html",
  styleUrls: ["../detail-news/detail-news.component.scss"],
  imports: [NgIf, MatDialogClose],
})
export class DialogPreview {
  url;
  language;
  dia;
  mes;
  anio;
  datere: Date;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview>,
    @Inject(MAT_DIALOG_DATA) public noticia,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.language = Languages[this.noticia.language];
    document.getElementById("newsBody").innerHTML = this.noticia.cuerpo;
    this.datere = new Date(String(this.noticia.fechaPublicacion));
    this.dia = this.datePipe.transform(this.datere, "dd");
    this.mes = this.datePipe.transform(this.datere, "MMMM");
    this.anio = this.datePipe.transform(this.datere, "y");
  }

  public fbicon = "../../assets/img/Facebook.svg";
  public twitter = "../../assets/img/twitter.svg";
  mouseEnter(int) {
    switch (int) {
      case 1:
        this.fbicon = "../../assets/img/Facebook2.svg";
        break;
      case 2:
        this.twitter = "../../assets/img/twitter2.svg";
        break;
    }
  }

  mouseLeave(int) {
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
