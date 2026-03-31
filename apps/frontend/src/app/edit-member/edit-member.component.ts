import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { TipoMiembroService } from '../services/tipomiembro.service';
import { PrefijoService } from '../services/prefijo.service';
import { GeneroService } from '../services/genero.service';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../add-news/add-news.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsuarioFull } from '../models/usuarioFull';
import { TipoMiembro } from '../models/tipomiembro';
import { Prefijo } from '../models/prefijo';
import { Genero } from '../models/genero';
import { UsuarioHasPermisoService } from '../services/usuariohaspermiso.service';
import { UsuarioPermiso } from '../models/usuariopermiso';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { NoticiaService } from '../services/noticia.service';
import { PublicacionHasUsuarioService } from '../services/publicacionhasusuario.service';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import moment from 'moment';
import { GLOBAL } from '../services/global';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  standalone: false,
  selector: 'app-edit-member',
  templateUrl: '../add-member/add-member.component.html',
  styleUrls: ['./edit-member.component.scss'],
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
export class EditMemberComponent implements OnInit {
  url;
  public memberForm: FormGroup;
  member: UsuarioFull;
  tipoMiembros: Array<TipoMiembro>;
  prefijos: Array<Prefijo>;
  generos: Array<Genero>;
  listaPermisos:Array<any>;
  button_text="Actualizar información";
  permisosExistentes:Array<UsuarioPermiso>;
  edit=false;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public _usuarioService: UsuarioService,
    public _tipoMiembroService:TipoMiembroService,
    public _prefijoService: PrefijoService,
    public _generoService: GeneroService,
    public _usuarioPermisoService:UsuarioHasPermisoService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _commonService: CommonService,
    public _usuarioPublicacionService: PublicacionHasUsuarioService,
    public _noticiaService: NoticiaService,
  ) {
    this.memberForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      segundoNombre: [''],
      apellidoPaterno: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      apellidoMaterno: [''],
      fechaNacimiento: [''],
      correo: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      genero_idGenero: [''],
      prefijo_idPrefijo: [''],
      tipoMiembro_idTipoMiembro: ['', [Validators.required]],
      DNI: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      password: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      confirmPassword: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      resumenPro: [''],
      resumenProEN: [''],
    });
    this.member=new UsuarioFull('','','','','','','','','',null,'','','',null,null,'',null,null,null,'',3,'',null);
    this.url=GLOBAL.url;
  }

  hide = true;
  hide2 = true;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    event.returnValue = false;
  }


  ngOnInit() {
    this.listaPermisos=[];
    this.getUser();
  }

  oldPassword;

  getUser(){
    this._route.params.forEach((params:Params)=>{
      let DNI = params['id'];
      this._usuarioService.getFullUser(DNI).subscribe(result => {
        if(result.length>0){
          this.memberForm.controls.DNI.disable();
          this.member=result[0];
          this.oldEmail=this.member.correo;
          this.oldPassword=this.member.password;
          this.memberForm.controls.confirmPassword.setValue(this.member.password);
          var d = new Date(this.member.fechaNacimiento);
          d.setMinutes( d.getMinutes() + d.getTimezoneOffset());
          this.member.fechaNacimientoDate=d;
          if(this.member.apellidoMaterno){
            this.member.nombreCompleto=this.member.nombre+ " " +this.member.apellidoPaterno + " " + this.member.apellidoMaterno;
          }else{
            this.member.nombreCompleto=this.member.nombre+ " " +this.member.apellidoPaterno;
          }
          localStorage.setItem("miembroEdit",JSON.stringify(this.member.nombreCompleto));
          if(this.member.nombre.includes(' ')){
            let string = this.member.nombre.split(' ');
            this.member.nombre = string[0];
            this.memberForm.controls.segundoNombre.setValue(string[1]);
          }
          this.getCargo(this.member);
          this.getNivelAcademico(this.member);
        }
      });
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
        this.getPermisos(miembro);
      }
    });
  }

  getPermisos(miembro){
    this._usuarioPermisoService.getUsuarioHasPermiso(miembro.DNI).subscribe(result => {
      if(result){
        this.permisosExistentes=result;
        this.validarPermisos(this.permisosExistentes);
        this.getPublicaciones(miembro);
      }
    });
  }

  getPublicaciones(miembro){
    this._usuarioPublicacionService.searchPublicacionHasUsuario(miembro.DNI).subscribe(result => {
      if(result.length==0){
        this.edit=true;
      }
      if(this.edit){
        this.getNoticias(miembro);
      }
    });
  }

  getNoticias(miembro){
    this._noticiaService.getNoticiaUsuario(miembro.DNI).subscribe(result => {
      if(result.length==0){
        this.edit=true;
      }else{
        this.edit=false;
      }
    });
  }

  permisoNoticia;
  permisoPublicacion;
  permisoProyecto;
  permisoContenido;

  validarPermisos(permisos){
    for (let index = 0; index < permisos.length; index++) {
      switch (permisos[index].permiso_idPermiso) {
        case 1:
          this.permisoNoticia=true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        case 3:
          this.permisoPublicacion=true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        case 2:
          this.permisoProyecto=true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        case 5:
          this.permisoContenido=true;
          this.listaPermisos.push(permisos[index].permiso_idPermiso);
          break;
        default:
          break;
      }
    }
  }

  selectPermiso(id,event){
    if(event){
      this.listaPermisos.push(id);
    }else{
      let index = this.listaPermisos.findIndex(x => x === id)
      if(index!=-1){
        this.listaPermisos.splice(index,1);
      }
    }
  }

  adHono;

  setCoord(value){
    this.member.tipoUsuario_idTipoUsuario=value;
  }

  adHonorem(value){
    this.adHono=value;
  }

  oldMem;
  oldMember(value){
    this.oldMem=value;
  }

  errPass;
  errEmail;
  oldEmail;

  addMember(){
    if(this.memberForm.valid){
      if (this.member.fechaNacimientoDate) {
        const momentDate = new Date(this.member.fechaNacimientoDate); // Replace event.value with your date value
        const formattedDate = moment(momentDate).format("YYYY-MM-DD");
        this.member.fechaNacimiento=formattedDate;
      }else{
        this.member.fechaNacimiento=null;
      }
      this._usuarioService.verifyUser(this.member).subscribe(result => {
        if(result.length==0 || this.oldEmail==this.member.correo){
          if(this.member.password===this.memberForm.controls.confirmPassword.value){
            if(this.memberForm.controls.segundoNombre.value!='' && this.memberForm.controls.segundoNombre.value){
              this.member.nombre+= " "+this.memberForm.controls.segundoNombre.value;
            }
            if(this.adHono==3){
              this.member.estado=this.adHono;
            }else if(this.oldMem==0){
              this.member.estado=this.oldMem;
            }else if(!this.member.estado){
              this.member.estado=1;
            }
            this._usuarioService.updateUser(this.member).subscribe((res)=>{
              if(res.status==1){
                if(this.member.password!=this.oldPassword){
                  const token = this._usuarioService.getToken();
                  if (token) {
                    this._usuarioService.changePassword({
                      password: this.member.password,
                      correo: this.member.correo,
                      token: token
                    }).subscribe(res => {
                      if(res){
                      }
                    });
                  }
                }
                if(this.fileData){
                  if(this.member.foto==null){
                    this._usuarioService.uploadUsuarioFoto(this.fileData, res.user)
                    .subscribe(res => {
                      if(res){
                      }
                    }) 
                  }else{
                    this._usuarioService.deleteImage(String(this.member.foto))
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
                this.agregar=true;
                this.eliminar=true;
                this.openSnackBar('Miembro actualizado exitosamente', null);
                this.return();
              }
              this.setPermisos();
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

  setPermisos(){
    let permisoEx;
    if(this.permisosExistentes.length>0){
      permisoEx=this.permisosExistentes[0];
    }
    if(this.member.tipoUsuario_idTipoUsuario==2){
      this.listaPermisos.push(4);
      this.listaPermisos.push(6);
    }
    if(permisoEx){
      this._usuarioPermisoService.deletePermisoUsuario(permisoEx).subscribe(res => {
        if(res){
        }
        for (let index = 0; index < this.listaPermisos.length; index++) {
          let permiso = {usuario_DNI: this.member.DNI,permiso_idPermiso:this.listaPermisos[index]}
          this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe(res => {
            if(res){
            }
          });
        }
      }) 
    }else{
      for (let index = 0; index < this.listaPermisos.length; index++) {
        let permiso = {usuario_DNI: this.member.DNI,permiso_idPermiso:this.listaPermisos[index]}
        this._usuarioPermisoService.addPermisoUsuario(permiso).subscribe(res => {
          if(res){
          }
        });
      }
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

  openSnackBar(text, panel) {
    this._snackBar.open(text, null, {
      panelClass : [panel],
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  agregar;
  eliminar;

  return(){
    if(!this.eliminar){
      this.agregar=false;
    }
    this._commonService.setEndSession('0');
    if(localStorage.getItem("active-member")=='1'){
      this._router.navigate(['dashboard/miembros-activos']);
    }else{
      this._router.navigate(['dashboard/miembros-antiguos']);
    }
  }

  private dialogRef: MatDialogRef<DialogReturn2>

  openDialog() {
    this.dialogRef = this.dialog.open(DialogReturn2,{
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

  private dialogRef2: MatDialogRef<DialogCancel5>;

  openEraser(){
    if(this.edit){
      this.dialogRef2 = this.dialog.open(DialogCancel5,{
        width:"530px",
        id:"idleTimer",
        data: {title: "Eliminar miembro",
              text:"¿Estás seguro que deseas eliminar a este miembro del grupo?",
              cancel:"Sí, eliminar",
              yes:"No, cancelar"}
      });
  
      this.dialogRef2.afterClosed().subscribe(result => {
        if(result){
          this.erasePermisos();
        }
      }); 
    }
  }

  erasePermisos(){
    let end;
    for (let index = 0; index < this.permisosExistentes.length; index++) {
      this._usuarioPermisoService.deletePermisoUsuario(this.permisosExistentes[index]).subscribe(result => {
        if(result){
        }
      });
      if(index==(this.permisosExistentes.length-1)){
        end=true;
      }
    }
    if(this.permisosExistentes.length==0){
      end = true;
    }
    if(end){
      this.eraseUser();
    }
  }

  eraseUser(){
    if(this.member.foto)
    this._usuarioService.deleteImage(String(this.member.foto))
    .subscribe(res => {
      if(res){
      }
    })
    this._usuarioService.deleteUsuario({ DNI: String(this.member.DNI) }).subscribe(result => {
      if(result.status==1){
        this.eliminar=true;
        this.agregar=true;
        this.return();
        this.openSnackBar("Usuario eliminado exitosamente",null);
            
      }else{
        this.openSnackBar("Hubo un problema al eliminar",null);
      } 
    });
  }

}


@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogReturn2 {
  constructor(
    public dialogRef: MatDialogRef<DialogReturn2>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel5 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel5>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
