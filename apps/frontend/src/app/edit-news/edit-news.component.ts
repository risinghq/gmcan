import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NoticiaService } from '../services/noticia.service';
import { DialogData } from '../models/dialogdata';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import { TipoNoticia } from '../models/tiponoticia';
import { UsuarioService } from '../services/usuario.service';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as ClassicEditor from '../../assets/ckeditor/ckeditor.js'

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { NoticiaFull } from '../models/noticiafull';
import { Usuario } from '../models/usuario';
import { GLOBAL } from '../services/global';
import { publish } from 'rxjs/operators';
import { Languages } from '../models/languages';
import { TitleCasePipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { stringify } from 'querystring';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-edit-news',
  templateUrl: '../add-news/add-news.component.html',
  styleUrls: ['../add-news/add-news.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class EditNewsComponent implements OnInit {

  noticia: NoticiaFull;
  edit=true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _noticiaService: NoticiaService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _tipoNoticiaService:TipoNoticiaService,
    private _usuarioService:UsuarioService,
  ) {
    this.newsForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      tituloEN: ['', Validators.required],
      resumen: ['', Validators.required],
      resumenEN: ['', Validators.required],
      cuerpo: ['', Validators.required],
      cuerpoEN: ['', Validators.required],
      fechaPublicacion: ['', Validators.required],
      autorPublicacion: ['',Validators.required],
      tipoNoticia_idtipoNoticia: ['',Validators.required],
    });
    this.noticia= new NoticiaFull(null,'','','','','','',null,'',null,null,null,null,'','',null);
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.getNews();
  }
  url;
  public newsForm: FormGroup;
  categorias: Array<TipoNoticia>;
  autores: Array<Usuario>;
  button_text="Actualizar noticia";
  button_text2="Dejar de publicar y guardar cambios";

  getNews(){
    this._route.params.forEach((params:Params)=>{
      let idNoticia=params['id'];
      this._noticiaService.getNoticiaFull(idNoticia).subscribe(result => {
        if(result){
          this.noticia=result;
          this.noticia.fechaPublicacionDate=this.noticia.fechaPublicacion;
          sessionStorage.setItem('noticiaPublicada', JSON.stringify(this.noticia.estado));
          this.getCategorias();
        }
      });
    })
  }

  getCategorias(){
    this._tipoNoticiaService.getTipoNoticia().subscribe(result => {
      if(result){
        this.categorias=result;
      }
      this.getAuthors();
    });
  }

  getAuthors(){
    this._usuarioService.getUsuario().subscribe(result => {
      if(result){
        this.autores=result;
      }
    });
  }

  return(){
    this._router.navigate(['dashboard/noticias']);
  }

  submitCategory(value){
    this.noticia.estado=value;
  }

  submitNews(value){
    if(value==1 && this.newsForm.valid && this.noticia.foto){
      this.publishDialog(value)
    }else if(value==0){
      this.notPublishDialog(value)
    }
  }

  publish(value){
    if (value==1 && this.newsForm.valid && this.noticia.foto) {
      this.publishMethod(value);
    }else if(value==0){
      this.publishMethod(value)
    }
  }

  publishMethod(value){
    this.noticia.estado=value;
    if (this.noticia.fechaPublicacionDate) {
      const momentDate = new Date(this.noticia.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = moment(momentDate).format("YYYY-MM-DD");
      this.noticia.fechaPublicacion=formattedDate; 
    }
      this._noticiaService.updateNoticia(this.noticia).subscribe(result => {
        if(result.status==1){
          if(this.fileData){
            this._noticiaService.uploadNoticiaFoto(this.fileData, result.rows)
            .subscribe(res => {
            console.log(res);
          })
          this.return();
          this.openSnackBar("Noticia actualizada exitosamente");
          } 
        }
      });
  }

  private previewDialog: MatDialogRef<DialogPreview2>

  previewNews(value){
    let indexCat = this.categorias.findIndex(x => x.idtipoNoticia == this.noticia.tipoNoticia_idtipoNoticia);
    let indexAut = this.autores.findIndex(x => x.DNI == this.noticia.autorPublicacion);
    const momentDate = new Date(this.noticia.fechaPublicacionDate); // Replace event.value with your date value
    const formattedDate = moment(momentDate).format("YYYY-MM-DD");
    this.noticia.fechaPublicacion=formattedDate;
    let noticiaPreview={
      language:value,
      titulo:null,
      resumen:null,
      foto: this.url+'noticia/get-image-noticia/'+this.noticia.foto,
      nombreTipoNoticia:null,
      usuario:{
        nombre: null,
        apellidoPaterno:null,
        apellidoMaterno:null,
        foto:null,
      },
      cuerpo:null,
      fechaPublicacion:this.noticia.fechaPublicacion,
    };
    if(this.previewUrl){
      noticiaPreview=this.previewUrl;
    }
    if(indexCat!=-1){
      noticiaPreview.nombreTipoNoticia=this.categorias[indexCat].nombre
    }
    if(indexAut!=-1){
      noticiaPreview.usuario.nombre=this.autores[indexAut].nombre;
      noticiaPreview.usuario.apellidoPaterno=this.autores[indexAut].apellidoPaterno;
      noticiaPreview.usuario.apellidoMaterno=this.autores[indexAut].apellidoMaterno;
      noticiaPreview.usuario.foto=this.autores[indexAut].foto;
    }
    switch (value) {
      case 0:
        noticiaPreview.titulo=this.noticia.titulo;
        noticiaPreview.resumen=this.noticia.resumen;
        noticiaPreview.cuerpo=this.noticia.cuerpo;
        break;
      case 1:
        noticiaPreview.titulo=this.noticia.tituloEN;
        noticiaPreview.resumen=this.noticia.resumenEN;
        noticiaPreview.cuerpo=this.noticia.cuerpoEN;
        break;
      default:
        break;
    }
    this.previewDialog = this.dialog.open(DialogPreview2,{
      width:'871px',
      id:'previewNews',
      data: noticiaPreview
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if(!result){        
      }
    });
  }

  private dialogRef2: MatDialogRef<DialogPublish2>

  publishDialog(value) {
    this.dialogRef2 = this.dialog.open(DialogPublish2,{
      width:"530px",
      id:"idleTimer",
      data: {title: "¿Estás seguro que deseas actualizar la noticia?",
            text:"La información será publica para todo el mundo",
            cancel:"No, cancelar",
            yes:"Sí, publicar"}
    });

    this.dialogRef2.afterClosed().subscribe(result => {
      if(!result){
        this.publish(value);
      }
    });
  }

  private dialogRef3: MatDialogRef<DialogPublish3>

  notPublishDialog(value) {
    this.dialogRef3 = this.dialog.open(DialogPublish3,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Dejar de publicar noticia",
            text:"¿Estás seguro de que deseas dejar de publicar esta noticia?",
            cancel:"Si, dejar de publicar",
            yes:"No, cancelar"}
    });

    this.dialogRef3.afterClosed().subscribe(result => {
      if(result){
        this.publish(value);
      }
    });
  }

  private dialogRef: MatDialogRef<DialogCancel4>

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel4,{
      width:"530px",
      id:"idleTimer",
      data: {title: "¿Estás seguro que deseas volver sin guardar?",
            text:"La información no se guardará",
            cancel:"Sí, volver",
            yes:"No, mantenerme aquí"}
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.return();
      }
    });
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  date = new FormControl(moment());

  fileData: File = null;
  previewUrl:any = null;
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
    }
  }

  private dialogRef5: MatDialogRef<DialogErase2>

  openEraser(){
    this.dialogRef5 = this.dialog.open(DialogErase2,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar noticia",
        text:"¿Estás seguro que deseas eliminar esta noticia?",
        cancel:"Sí, eliminar",
        yes:"No, cancelar"}
      });  
      this.dialogRef5.afterClosed().subscribe(result => {
        if(result){
          this.eraseNews();
        }
      }); 
  }

  eraseNews(){
    this._noticiaService.deleteNoticia(this.noticia.idNoticia).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar("Categoría eliminada exitosamente");
      }else{
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }

}


@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel4 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel4>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})

export class DialogPublish3 {
  constructor(
    public dialogRef: MatDialogRef<DialogPublish3>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})

export class DialogPublish2 {
  constructor(
    public dialogRef: MatDialogRef<DialogPublish2>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-preview.html',
  styleUrls: ['../detail-news/detail-news.component.scss'],
})
export class DialogPreview2 {
  url;
  language;
  dia;
  mes;
  anio;
  datere:Date;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview2>,
    @Inject(MAT_DIALOG_DATA) public noticia,
    public titlecasePipe:TitleCasePipe,
    public datePipe:DatePipe,) {
      this.url=GLOBAL.url;
    }

    ngOnInit(){
      this.language=Languages[this.noticia.language];
      document.getElementById("newsBody").innerHTML=this.noticia.cuerpo;
      this.datere=new Date(String(this.noticia.fechaPublicacion));
      this.dia=this.datePipe.transform(this.datere,'dd');
      this.mes=this.datePipe.transform(this.datere,'MMMM');
      this.anio=this.datePipe.transform(this.datere,'y');
    }

  public fbicon="../../assets/img/Facebook.svg";
  public twitter="../../assets/img/twitter.svg";
  mouseEnter(int){
    switch (int) {
      case 1:
        this.fbicon="../../assets/img/Facebook2.svg";
        break;
      case 2:
        this.twitter="../../assets/img/twitter2.svg";
        break;
    }
  }

  mouseLeave(int){
    switch (int) {
      case 1:
        this.fbicon="../../assets/img/Facebook.svg";
        break;
      case 2:
        this.twitter="../../assets/img/twitter.svg";
        break;
    }
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase2 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase2>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}


