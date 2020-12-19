import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../edit-news/edit-news.component';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioFull } from '../models/usuarioFull';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TipoMiembroService } from '../services/tipomiembro.service';
import { PrefijoService } from '../services/prefijo.service';
import { GeneroService } from '../services/genero.service';
import { TipoMiembro } from '../models/tipomiembro';
import { Prefijo } from '../models/prefijo';
import { Genero } from '../models/genero';
import { GLOBAL } from '../services/global';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import moment from 'moment';
import { CommonService } from '../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
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
export class PerfilComponent implements OnInit {
  oldMem;
  url;
  member: UsuarioFull;
  public memberForm: FormGroup;
  tipoMiembros: Array<TipoMiembro>;
  prefijos: Array<Prefijo>;
  generos: Array<Genero>;
  button_text="Actualizar información";

  constructor(
    public formBuilder: FormBuilder,
    public _usuarioService: UsuarioService,
    public _tipoMiembroService:TipoMiembroService,
    public _prefijoService: PrefijoService,
    public _generoService: GeneroService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _commonService: CommonService,
    public _route: ActivatedRoute,
    public _router: Router,
  ) {
    this.memberForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      segundoNombre: [''],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      fechaNacimiento: [''],
      correo: ['', Validators.required],
      genero_idGenero: [''],
      prefijo_idPrefijo: [''],
      tipoMiembro_idTipoMiembro: ['', Validators.required],
      DNI: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      resumenPro: [''],
      resumenProEN: [''],
    });
    this.member=new UsuarioFull('','','','','','','','','',0,'','','',null,null,'',null,null,null,'',3,'',null);
    this.url=GLOBAL.url;
  }

  hide = true;
  hide2 = true;

  ngOnInit() {
    this.getUser();
  }

  getUser(){
    let user = this._usuarioService.getUserLogged();
    this._usuarioService.getFullUser(user.DNI).subscribe(result => {
      if(result.length>0){
        this.memberForm.controls.DNI.disable();
        this.member=result[0];
        this.oldEmail=this.member.correo;
        this.oldPassword=this.member.password;
        this.memberForm.controls.confirmPassword.setValue(this.member.password);
        this.member.fechaNacimientoDate=this.member.fechaNacimiento;
        if(this.member.nombre.includes(' ')){
          let string = this.member.nombre.split(' ');
          this.member.nombre = string[0];
          this.memberForm.controls.segundoNombre.setValue(string[1]);
        }
        this.getCargo(this.member);
        this.getNivelAcademico(this.member);
      }
    });
  }

  getCargo(miembro){
    this._tipoMiembroService.getTipoMiembros().subscribe((res)=>{
      if(res){
        this.tipoMiembros=res;
        let index = res.findIndex(x => x.idTipoMiembro === miembro.tipoMiembro_idTipoMiembro);
        if(index != -1){
          miembro.tipoMiembro=res[index].nombreSingular;
        }
      }
    });
  }

  getNivelAcademico(miembro){
    this._prefijoService.getPrefijos().subscribe((res)=>{
      if(res){
        this.prefijos=res;
        let index = res.findIndex(x => x.idPrefijo === miembro.prefijo_idPrefijo);
        if(index != -1){
          miembro.prefijo=res[index].nombre;
        }
        this.getGenero(miembro);
      }
    });
  }

  getGenero(miembro){
    this._generoService.getGeneros().subscribe(result => {
      if(result){
        this.generos=result;
      }
    });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }

  errPass;
  errEmail;
  oldEmail;

  oldPassword;

  actualizarUsuario(){
    if(this.memberForm.valid){
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate); // Replace event.value with your date value
        const formattedDate = moment(momentDate).format("YYYY-MM-DD");
        this.member.fechaNacimiento=formattedDate;
      }else{
        this.member.fechaNacimiento=null;
      }
      let miembroAGuardar=JSON.parse(JSON.stringify(this.member));
      if(this.memberForm.controls.segundoNombre.value!='' && this.memberForm.controls.segundoNombre.value){
        miembroAGuardar.nombre+= " "+this.memberForm.controls.segundoNombre.value;
      }
      if(this.oldMem!=miembroAGuardar.estado.estado){
        miembroAGuardar.estado=this.oldMem;
      }
      this._usuarioService.verifyUser(miembroAGuardar).subscribe(result => {
        if(result.length==0 || this.oldEmail==this.member.correo){
          if(this.member.password===this.memberForm.controls.confirmPassword.value){
            this._usuarioService.updateUser(miembroAGuardar).subscribe((res)=>{
              if(res.status==1){
                if(this.member.password!=this.oldPassword){
                  this._usuarioService.changePassword(miembroAGuardar).subscribe(res => {
                    if(res){
                      this.errPass=false;
                    }
                  }) 
                }
                if(this.fileData){
                  if(this.member.foto==null){
                    this._usuarioService.uploadUsuarioFoto(this.fileData, res.user)
                    .subscribe(res => {
                      if(res){
                      }
                    }) 
                  }else{
                    this._usuarioService.deleteImage(miembroAGuardar.foto)
                    .subscribe(res => {
                      if(res){
                      }
                    }) 
                    this._usuarioService.uploadUsuarioFoto(this.fileData, res.user)
                    .subscribe(res => {
                      if(res){
                      }
                    }) 
                  }
                }
                this._commonService.setReset(true);
                this.openSnackBar('Información actualizada exitosamente', null);
                this.getUser();
              }
            });
          }else{
            this.openSnackBar('Las contraseñas no coinciden','err-snackbar');
            this.errPass=true;
            this.errEmail=false;
          }
        }else{
          this.openSnackBar('Este usuario ya se encuentra registrado','err-snackbar');
          this.errEmail=true;
        }
      });
    }
  }

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

  agregar;

  openSnackBar(text, panel) {
    this._snackBar.open(text, null, {
      panelClass : [panel],
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  oldMember(value){
    this.oldMem=value;
  }

};