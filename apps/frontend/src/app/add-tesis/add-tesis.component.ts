import { Component, OnInit, Inject } from '@angular/core';

import { GLOBAL } from '../services/global';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../edit-news/edit-news.component';
import { Universidad } from '../models/universidad';
import { Publicacion } from '../models/publicacion';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Autor } from '../models/autores';
import { Usuario } from '../models/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionService } from '../services/publicacion.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { CommonService } from '../services/common.service';
import { UniversidadService } from '../services/universidad.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { TipoTesisService } from '../services/tipotesis.service';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-add-tesis',
  templateUrl: './add-tesis.component.html',
  styleUrls: ['./add-tesis.component.scss'],
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
export class AddTesisComponent implements OnInit {

  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text="Guardar tesis";
  universidad: Array<Universidad>;
  autores: Array<Autor>;
  usuarios: Array<Usuario>;
  url;
  tipoTesis;

  constructor(public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _publicacionService: PublicacionService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _usuarioService: UsuarioService,
    private _autorService: AutorService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _universidadService: UniversidadService,
    private _tipotesisService: TipoTesisService,
  ) {
    this.publicacionForm = this.formBuilder.group({
      título: ['', Validators.required],
      fechaPublicacionDate: ['', Validators.required],
      universidad_idUniversidad: ['', Validators.required],
      tipoTesis_idTipoTesis:['', Validators.required],
      resumen: ['', Validators.required],
      resumenEN: ['', Validators.required],
    });
    this.publicacion = new Publicacion(null,'','','','','',null,'',null,null,null,null,2,'','',null,null,null,'',null,null,null,'','',null,'',null,'')
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.getUniversidades();
  }

  myControl = new FormControl();
  options: Array<any>=[];
  filteredOptions: Observable<any>;

  private _filter(value): any {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.nombre.toLowerCase().includes(filterValue));
  }

  getUniversidades(){
    this._universidadService.getUniversidades().subscribe(result => {
      if(result){
        this.universidad=result;
        this.getUsuarios();
      } 
    });
  }

  getAutores(){
    this._autorService.getAutor().subscribe(result => {
      if(result){
        result.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0));
        this.autores=result;
        for (let index = 0; index < this.autores.length; index++) {
          this.options.push(this.autores[index]);
        }
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
        this.setFilters();
        this.getTipoTesis();
      } 
    });
  }

  getUsuarios(){
    this._usuarioService.getUsuarios().subscribe(result => {
      if(result){
        result.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0));
        this.usuarios=result;
        for (let index = 0; index < this.usuarios.length; index++) {
          this.usuarios[index].nombre=this.usuarios[index].nombre+' '+this.usuarios[index].apellidoPaterno+' '+this.usuarios[index].apellidoMaterno
          this.options.push(this.usuarios[index]);
        }
        this.getAutores();
      }
    });
  }

  getTipoTesis(){
    this._tipotesisService.getTiposTesis().subscribe(result => {
      if(result){
        this.tipoTesis=result;
        console.log(this.tipoTesis);
      }
    });
  }

  otrosAutores: any[]=[{
    id:1,
    idAutor:'',
    nombre:'',
    isAutor: true,
    myControl: new FormControl()
  }]

  setFilters(){
    for (let index = 0; index < this.otrosAutores.length; index++) {
      this.otrosAutores[index].filteredOptions = this.otrosAutores[index].myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    }
  }

  addAnotherAuthor(){
    this.otrosAutores.push({
      id:this.otrosAutores.length+1,
      idAutor:'',
      nombre:'',
      isAutor: true,
      myControl: new FormControl(),
    })
    this.otrosAutores[this.otrosAutores.length-1].filteredOptions = this.otrosAutores[this.otrosAutores.length-1].myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  removeAnotherAuthor(i: number) {
    if(i>0){
      this.otrosAutores.splice(i, 1);
    }
  }

  selectUserAutor(evento, value, i){
    if(value==1){
      if(evento.idAutor){
        this.otrosAutores[i].idAutor=evento.idAutor;
      }else{
        this.otrosAutores[i].idAutor=evento.DNI;
        this.otrosAutores[i].isAutor=false;
      }
      this.otrosAutores[i].nombre=evento.nombre;
    }else{
      let index = this.options.findIndex(option => option.nombre === evento.value)
      if(this.options[index].idAutor){
        this.otrosAutores[i].idAutor=this.options[index].idAutor;
      }else{
        this.otrosAutores[i].idAutor=this.options[index].DNI;
        this.otrosAutores[i].isAutor=false;
      }
      this.otrosAutores[i].nombre=this.options[index].nombre;
    }
  }

  agregar;

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/'+localStorage.getItem('thesis-back')]);
  }

  openSnackBar() {
    this._snackBar.open("Tesis agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  submitArticle(){
    this.revisarValues();
    if(this.publicacionForm.valid && this.otrosAutores.length>0 && this.otrosAutores[0].nombre!=''){
      const momentDate = new Date(this.publicacion.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = moment(momentDate).format("YYYY-MM-DD");
      this.publicacion.fechaPublicacion=formattedDate;
      this._publicacionService.addPublicacion(this.publicacion).subscribe(result => {
        if(result.status==1){
          if(this.fileData){
            this._publicacionService.uploadPublicacionFile(this.fileData, result.idPublicacion)
            .subscribe(res => {
            }) 
          }
          for (let index = 0; index < this.otrosAutores.length; index++) {
            this.setAutores(this.otrosAutores[index], result.idPublicacion);
          }
          this.agregar=true;
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  setAutores(autor, idPublicacion){
    if(autor.nombre){
      if(autor.idAutor=='' || (!autor.idAutor && !autor.DNI)){
        let newAuthor={nombre: autor.nombre};
        this._autorService.addAuthor(newAuthor).subscribe(res => {
          if(res){
            let autorPublicacion={autor_idAutor: res.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:1}
            this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(res => {
            }) 
          }
        }) 
      }else if(autor.idAutor){
        if(autor.isAutor){
          let autorPublicacion={autor_idAutor: autor.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:1}
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(res => {
          })
        }else if(autor.isAutor==undefined){
          let autorPublicacion={autor_idAutor: autor.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:1}
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(res => {
          })
        }else{
          let usuarioPublicacion={usuario_DNI: autor.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:1}
          this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe(res => {
          })  
        }
      }else if(autor.DNI){
        let usuarioPublicacion={usuario_DNI: autor.DNI, publicacion_idPublicacion:idPublicacion, isPrincipal:1}
        this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe(res => {
        })
      }
    }
  }

  revisarValues(){
    for (let index = 0; index < this.otrosAutores.length; index++) {
      let found = this.options.findIndex(option => option.nombre === this.otrosAutores[index].nombre);
      if(found==-1){
        this.otrosAutores[index].idAutor=null;
        this.otrosAutores[index].isAutor=true;
      }
    }
  }

  private dialogRef: MatDialogRef<DialogCancel14>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel14,{
      width:"530px",
      id:"idleTimer",
      data: {title: "¿Estás seguro que deseas volver sin guardar?",
            text:"La información no se guardará",
            cancel:"Sí, volver",
            yes:"No, mantenerme aquí"}
    });
  }

  canDeactivate(): Observable<boolean> {
    if(!this.agregar){
      this.openDialog();
      return this.dialogRef.afterClosed().pipe(map(result => {
        return result === true;
      }));
    }else{
      return ;
    }
  }

  fileData: File = null;
  previewUrl:any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];  
  }

  openEraser(){}
  edit;

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel14 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel14>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}