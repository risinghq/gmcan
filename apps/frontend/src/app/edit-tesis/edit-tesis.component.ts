import { Component, OnInit, Inject } from '@angular/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../edit-news/edit-news.component';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { PublicacionService } from '../services/publicacion.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { CommonService } from '../services/common.service';
import { UniversidadService } from '../services/universidad.service';
import { TipoTesisService } from '../services/tipotesis.service';
import { Publicacion } from '../models/publicacion';
import { GLOBAL } from '../services/global';
import { Universidad } from '../models/universidad';
import { Autor } from '../models/autores';
import { Usuario } from '../models/usuario';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

const moment = _rollupMoment || _moment;

@Component({
  standalone: false,
  selector: 'app-edit-tesis',
  templateUrl: '../add-tesis/add-tesis.component.html',
  styleUrls: ['../add-tesis/add-tesis.component.scss'],
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
export class EditTesisComponent implements OnInit {

  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text="Actualizar información";
  universidad: Array<Universidad>;
  autores: Array<Autor>;
  usuarios: Array<Usuario>
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
      título: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaPublicacionDate: ['', [Validators.required]],
      universidad_idUniversidad: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      tipoTesis_idTipoTesis:['', [Validators.required, SpaceValidator.cannotContainSpace]],
      resumen: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenEN: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.publicacion = new Publicacion(null,'','','','','',null,'',null,null,null,null,2,'','',null,null,null,'',null,null,null,'','',null,'',null,'')
    this.url=GLOBAL.url;
  }

  agregar;
  edit=true;

  ngOnInit() {
    this.getArticulo();
  }

  getArticulo(){
    this._route.params.forEach((params:Params)=>{
      let idTesis=params['id'];
      this._publicacionService.getPublication(idTesis).subscribe(result => {
        if(result){
          this.publicacion = result[0];
          var d = new Date(result[0].fechaPublicacion);
          d.setMinutes( d.getMinutes() + d.getTimezoneOffset() );
          this.publicacion.fechaPublicacionDate=d;
          localStorage.setItem("thesisEdit",JSON.stringify(this.publicacion.titulo));
          this.getUniversidades();
          this.getAutoresPublicacion(idTesis);
        } 
      });
    });
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

  selectedUsers=[];

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
      }
    });
  }

  setFilters(){
    if(this.otrosAutores){
      for (let index = 0; index < this.otrosAutores.length; index++) {
        this.otrosAutores[index].filteredOptions = this.otrosAutores[index].myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      }
    }
  }

  getAutoresPublicacion(idPublicacion){
    this._publicacionhasautorService.getPublicacionHasAutor(idPublicacion).subscribe(result => {
      if(result){
        for (let index = 0; index < result.length; index++) {
          this.getAutor(result[index].autores_idAutor, result[index].isPrincipal)
        }
      }
      this.getUsuariosPublicacion(idPublicacion);
    });
  }
  getUsuariosPublicacion(idPublicacion){
    this._publicacionhasusuarioService.getPublicacionHasUsuario(idPublicacion).subscribe(result => {
      if(result){
        for (let index = 0; index < result.length; index++) {
          this.getUsuario(result[index].usuario_DNI, result[index].isPrincipal);
        }
      } 
    });
  }

  getAutor(idAutor, isPrincipal){
    this._autorService.getAuthor(idAutor).subscribe(result => {
      if(result){
        result[0].isPrincipal=isPrincipal;
        this.autoresSeleccionados.push(result[0]);
        this.setearOtrosAutores();
      } 
    });
  }

  getUsuario(DNI, isPrincipal){
    this._usuarioService.getUser(DNI).subscribe(result => {
      if(result){
        result[0].isPrincipal=isPrincipal;
        result[0].nombre=result[0].nombre+' '+result[0].apellidoPaterno+' '+result[0].apellidoMaterno
        this.autoresSeleccionados.push(result[0]);
        this.setearOtrosAutores();
      }
    });
  }

  setearOtrosAutores(){
    this.otrosAutores=[];
    this.autoresSeleccionados.sort((a,b) => (a.isPrincipal > b.isPrincipal) ? 1 : ((b.isPrincipal > a.isPrincipal) ? -1 : 0));
    for (let index = 0; index < this.autoresSeleccionados.length; index++) {
      let idAutorSeleccionado;
      let isAutor=true;
      if(this.autoresSeleccionados[index].idAutor){
        idAutorSeleccionado=this.autoresSeleccionados[index].idAutor;
      }else{
        idAutorSeleccionado=this.autoresSeleccionados[index].DNI;
        isAutor=false;
      }
      this.otrosAutores.push({
        id:this.otrosAutores.length+1,
        idAutor:idAutorSeleccionado,
        nombre:this.autoresSeleccionados[index].nombre,
        isAutor: isAutor,
        myControl: new FormControl(),
      })
      this.otrosAutores[this.otrosAutores.length-1].filteredOptions = this.otrosAutores[this.otrosAutores.length-1].myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    }
    if(this.autoresSeleccionados.length==0){
      this.otrosAutores.push({
        id:1,
        idAutor:'',
        nombre:'',
        isAutor: true,
        myControl: new FormControl()
      })
    }
  }

  autoresSeleccionados=[];

  otrosAutores: any[];

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
    }else if(i==0 && this.otrosAutores.length==1){
      this.otrosAutores.splice(i, 1);
      this.addAnotherAuthor();
    }else{
      this.otrosAutores.splice(i, 1);
    }
  }

  submitArticle(){
    this.revisarValues();
    if(this.publicacionForm.valid){
      const momentDate = new Date(this.publicacion.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = moment(momentDate).format("YYYY-MM-DD");
      this.publicacion.fechaPublicacion=formattedDate;
      this._publicacionService.updatePublicacion(this.publicacion).subscribe(result => {
        if(result.status==1){
          if(this.fileData){
            this._publicacionService.uploadPublicacionFile(this.fileData, this.publicacion.idPublicacion)
            .subscribe(res => {
            }) 
          }
          this._publicacionhasautorService.deletePublicacionHasAutor(this.publicacion.idPublicacion).subscribe(result => {
            if(result.status==1){
              this._publicacionhasusuarioService.deletePublicacionHasUsuario(this.publicacion.idPublicacion).subscribe(result => {
                if(result.status==1){
                  for (let index = 0; index < this.otrosAutores.length; index++) {
                    this.setAutores(this.otrosAutores[index], this.publicacion.idPublicacion, index);
                  }
                } 
              });
            } 
          });
        }
      });
    }
  }

  setAutores(autor, idPublicacion, isPrincipal){
    if(autor.nombre){
      if(autor.idAutor=='' || (!autor.idAutor && !autor.DNI)){
        let newAuthor={nombre: autor.nombre};
        this._autorService.addAuthor(newAuthor).subscribe(res => {
          if(res){
            let autorPublicacion={autor_idAutor: res.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:isPrincipal}
            this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(res => {
            }) 
          }
        }) 
      }else if(autor.idAutor){
        if(autor.isAutor){
          let autorPublicacion={autor_idAutor: autor.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:isPrincipal}
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(res => {
          })
        }else if(autor.isAutor==undefined){
          let autorPublicacion={autor_idAutor: autor.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:isPrincipal}
          this._publicacionhasautorService.addPublicacionHasAutor(autorPublicacion).subscribe(res => {
          })
        }else{
          let usuarioPublicacion={usuario_DNI: autor.idAutor, publicacion_idPublicacion:idPublicacion, isPrincipal:isPrincipal}
          this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe(res => {
          })  
        }
      }else if(autor.DNI){
        let usuarioPublicacion={usuario_DNI: autor.DNI, publicacion_idPublicacion:idPublicacion, isPrincipal:isPrincipal}
        this._publicacionhasusuarioService.addPublicacionHasUsuario(usuarioPublicacion).subscribe(res => {
        })
      }
    }
    this.agregar=true;
    this.return();
    this.openSnackBar("Artículo actualizado exitosamente");
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

  revisarValues(){
    for (let index = 0; index < this.otrosAutores.length; index++) {
      let found = this.options.findIndex(option => option.nombre === this.otrosAutores[index].nombre);
      if(found==-1){
        this.otrosAutores[index].idAutor=null;
        this.otrosAutores[index].isAutor=true;
      }
    }
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/'+localStorage.getItem('thesis-back')]);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  fileData: File = null;
  previewUrl:any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];  
  }

  private dialogRef: MatDialogRef<DialogCancel15>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel15,{
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

  erasePublicacion(){
    this._publicacionhasautorService.deletePublicacionHasAutor(this.publicacion.idPublicacion).subscribe(result => {
      if(result.status==1){
        this._publicacionhasusuarioService.deletePublicacionHasUsuario(this.publicacion.idPublicacion).subscribe(result => {
          if(result.status==1){
            this._publicacionService.deletePublicacion(this.publicacion.idPublicacion).subscribe(result => {
              if(result.status==1){
                this.agregar=true;
                this.return();
                this.openSnackBar("Tesis eliminado exitosamente");
              } 
            });
          } 
        });
      } 
    });
  }

  private dialogRef2: MatDialogRef<DialogErase7>;

  openEraser(){
    this.dialogRef2 = this.dialog.open(DialogErase7,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar tesis",
        text:"¿Estás seguro que deseas eliminar esta tesis?",
        cancel:"Sí, eliminar",
        yes:"No, cancelar"}
    });  
    this.dialogRef2.afterClosed().subscribe(result => {
      if(result){
        this.erasePublicacion();
      }
    }); 
  }

}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel15 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel15>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase7 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase7>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}