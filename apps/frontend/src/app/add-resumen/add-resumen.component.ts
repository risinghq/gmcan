import { Component, OnInit, Inject } from '@angular/core';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../edit-news/edit-news.component';
import { Publicacion } from '../models/publicacion';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Evento } from '../models/eventos';
import { Autor } from '../models/autores';
import { Usuario } from '../models/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionService } from '../services/publicacion.service';
import { PublicacionHasAutorService } from '../services/publicacionhasautor.service';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import { UsuarioService } from '../services/usuario.service';
import { AutorService } from '../services/autor.service';
import { CommonService } from '../services/common.service';
import { GLOBAL } from '../services/global';
import { EventoService } from '../services/evento.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-add-resumen',
  templateUrl: './add-resumen.component.html',
  styleUrls: ['./add-resumen.component.scss'],
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
export class AddResumenComponent implements OnInit {

  publicacion: Publicacion;
  public publicacionForm: FormGroup;
  button_text="Guardar resumen";
  evento: Array<Evento>;
  autores: Array<Autor>;
  usuarios: Array<Usuario>;
  url;
  tipoTesis;
  selectedUser;

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
    private _eventoService: EventoService,
  ) {
    this.publicacionForm = this.formBuilder.group({
      título: ['', Validators.required],
      fechaPublicacionDate: ['', Validators.required],
      evento_idEvento: ['', Validators.required],
      DOI: [''],
      resumen: ['', Validators.required],
      resumenEN: ['', Validators.required],
      userSelector: ['']
    });
    this.publicacion = new Publicacion(null,'','','','','',null,'',null,null,null,null,3,'','',null,null,null,'',null,null,null,'','',null,'',null,'')
    this.url=GLOBAL.url;
  }

  openEraser(){}
  edit;

  ngOnInit() {
    this.getEventos();
  }

  myControl = new FormControl();
  options: Array<any>=[];
  filteredOptions: Observable<any>;

  private _filter(value): any {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.nombre.toLowerCase().includes(filterValue));
  }

  getEventos(){
    this._eventoService.getEventoesAll().subscribe(result => {
      if(result){
        this.evento=result;
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
        this.setFilters()
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

  selectedUsers=[];

  selectUser(evento, value){
    if(value==1){
      this.myControl.setValue(evento.nombre);
      if(this.selectedUsers.length!=0){
        this.selectedUsers[0]=evento;
      }else{
        this.selectedUsers.push(evento)
      }
    }else{
      let index = this.options.findIndex(option => option.nombre === evento.value)
      if(this.selectedUsers.length!=0){
        this.selectedUsers[0]=this.options[index];
      }else{
        this.selectedUsers.push(this.options[index])
      }
    }
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

  agregar

  submitArticle(){
    this.revisarValues();
    if(this.publicacionForm.valid && this.selectedUser){
      const momentDate = new Date(this.publicacion.fechaPublicacionDate); // Replace event.value with your date value
      const formattedDate = moment(momentDate).format("YYYY-MM-DD");
      this.publicacion.fechaPublicacion=formattedDate;
      this._publicacionService.addPublicacion(this.publicacion).subscribe(result => {
        if(result.status==1){
          if(this.selectedUsers.length>0){
            this.setAutores(this.selectedUsers[0], 1, result.idPublicacion);
          }else{
            let autorNuevo={nombre: this.selectedUser}
            this.setAutores(autorNuevo, 1, result.idPublicacion);
          }
          for (let index = 0; index < this.otrosAutores.length; index++) {
            this.setAutores(this.otrosAutores[index], 0, result.idPublicacion);
          }
          this.agregar=true;
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  setAutores(autor, isPrincipal, idPublicacion){
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
  }

  revisarValues(){
    for (let index = 0; index < this.otrosAutores.length; index++) {
      let found = this.options.findIndex(option => option.nombre === this.otrosAutores[index].nombre);
      if(found==-1){
        this.otrosAutores[index].idAutor=null;
        this.otrosAutores[index].isAutor=true;
      }
    }
    for (let index = 0; index < this.selectedUsers.length; index++) {
      let found = this.options.findIndex(option => option.nombre === this.selectedUsers[index].nombre);
      if(found==-1){
        if(this.selectedUsers[index].idAutor){
          this.selectedUsers[index].idAutor=null;
        }else if(this.selectedUser[index].DNI){
          this.selectedUsers[index].DNI=null;
        }
      }
      if(this.selectedUser!=this.selectedUsers[index].nombre){
        this.selectedUsers.splice(index,1);
      }
    }
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/'+localStorage.getItem('resumen-back')]);
  }

  openSnackBar() {
    this._snackBar.open("Publicación agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel16>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel16,{
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

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel16 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel16>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

