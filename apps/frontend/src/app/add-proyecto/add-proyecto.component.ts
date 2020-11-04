import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { UsuarioService } from '../services/usuario.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { lineasInvestigacion } from '../models/lineaInvestigacion';
import { FuenteFinanciamientoService } from '../services/fuentefinanciamiento.service';
import { FuenteFinanciamiento } from '../models/fuentefinanciamiento';
import { Proyecto } from '../models/proyecto';
import { GLOBAL } from '../services/global';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../edit-news/edit-news.component';
import { MonedaService } from '../services/moneda.service';
import { Moneda } from '../models/moneda';
import { ProyectoService } from '../services/proyecto.service';
import { UsuarioHasProyectoService } from '../services/usuariohasproyecto';
import { DialogData } from '../models/dialogdata';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-add-proyecto',
  templateUrl: './add-proyecto.component.html',
  styleUrls: ['./add-proyecto.component.scss'],
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
export class AddProyectoComponent implements OnInit {
  button_text='Guardar proyecto';
  usuarios: Array<Usuario>;
  lineasInvestigacion: Array<lineasInvestigacion>;
  fuentesFinaciamiento: Array<FuenteFinanciamiento>;
  proyecto: Proyecto;
  proyectoForm: FormGroup;
  monedas: Array<Moneda>;
  url;

  disableSelect;
  openEraser(){}
  projectEnd(){}
  edit;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _usuarioService: UsuarioService,
    private _lineaInvestigacionService: LineasInvestigacionService,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
    private _monedaService: MonedaService,
    private _proyectoService: ProyectoService,
    private _usuariohasproyecto: UsuarioHasProyectoService,
    public dialog: MatDialog,
  ) {
    this.proyectoForm = this.formBuilder.group({
      título: ['', Validators.required],
      títuloEN: ['', Validators.required],
      codigo: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      lineasInvestigacion_idLineasInvestigacion: ['', Validators.required],
      fuenteFinanciamiento_idFuenteFinanciamiento:['', Validators.required],
      moneda_idMoneda:['', Validators.required],
      descripcion: ['', Validators.required],
      descripcionEN: ['', Validators.required],
      montoFinanciado: ['', Validators.required],
      fechaFin: ['']
    });
    this.proyecto = new Proyecto(null,'','','','','','','',1,null,null,'',null,null,'',null,null,null,null,'',null,null);
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.getLineaInvestigacion();
  }

  getLineaInvestigacion(){
    this._lineaInvestigacionService.getLineasInvestigacion().subscribe(result => {
      if(result){
        this.lineasInvestigacion=result;
        this.getFuenteFinanciamiento();
      }
    });
  }

  getFuenteFinanciamiento(){
    this._fuenteFinanciamientoService.getFuenteFinanciamientos().subscribe(result => {
      if(result){
        this.fuentesFinaciamiento=result;
        this.getMoneda()
      }
    });
  }

  getMoneda(){
    this._monedaService.getMonedas().subscribe(result => {
      if(result){
        this.monedas=result;
        this.getUsuarios();
      }
    });
  }

  options: Array<any>=[];

  agregar

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/proyectos-ejecucion']);
  }

  openSnackBar() {
    this._snackBar.open("Tesis agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
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
      }
    });
  }

  otrosAutores: any[]=[{
    id:1,
    DNI:'',
    nombre:'',
    isAutor: true,
  }]

  addAnotherAuthor(){
    console.log(this.otrosAutores)
    this.otrosAutores.push({
      id:this.otrosAutores.length+1,
      DNI:'',
      nombre:'',
      isAutor: true,
    })
  }

  removeAnotherAuthor(i: number) {
    if(i>0){
      this.otrosAutores.splice(i, 1);
    }
  }

  selectUserAutor(evento, value, i){
    if(value==1){
      if(evento.DNI){
        this.otrosAutores[i].DNI=evento.DNI;
      }else{
        this.otrosAutores[i].DNI=evento.DNI;
        this.otrosAutores[i].isAutor=false;
      }
      this.otrosAutores[i].nombre=evento.nombre;
    }else{
      let index = this.options.findIndex(option => option.nombre === evento.value)
      if(this.options[index].DNI){
        this.otrosAutores[i].DNI=this.options[index].DNI;
      }else{
        this.otrosAutores[i].DNI=this.options[index].DNI;
        this.otrosAutores[i].isAutor=false;
      }
      this.otrosAutores[i].nombre=this.options[index].nombre;
    }
  }

  submitProyecto(){
    this.revisarValues();
    if(this.proyectoForm.valid && this.otrosAutores.length>0 && this.otrosAutores[0].nombre!=''){
      const momentDate = new Date(this.proyecto.fechaInicio); // Replace event.value with your date value
      const formattedDate = moment(momentDate).format("YYYY-MM-DD");
      this.proyecto.fechaI=formattedDate;
      this.proyecto.fechaF=null;
      this._proyectoService.addProyecto(this.proyecto).subscribe(result => {
        if(result.status==1){
          console.log(this.otrosAutores)
          for (let index = 0; index < this.otrosAutores.length; index++) {
            this.setAutores(this.otrosAutores[index], result.idProyecto);
          }
          this.agregar=true;
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  setAutores(autor, idProyecto){
    let usuarioPublicacion={usuario_DNI: autor.DNI, proyecto_idProyecto:idProyecto}
    this._usuariohasproyecto.addUsuarioProyecto(usuarioPublicacion).subscribe(res => {
    })
  }

  revisarValues(){
    for (let index = 0; index < this.otrosAutores.length; index++) {
      let found = this.options.findIndex(option => option.nombre === this.otrosAutores[index].nombre);
      if(found==-1){
        this.otrosAutores[index].DNI=null;
        this.otrosAutores[index].isAutor=true;
      }
    }
  }

  private dialogRef: MatDialogRef<DialogCancel20>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel20,{
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
  button_text2='';

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel20 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel20>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}