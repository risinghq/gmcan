import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { Grupo } from '../models/grupo';
import { UsuarioService } from '../services/usuario.service';
import { PermisoService } from '../services/permiso.service';
import { UsuarioHasPermisoService } from '../services/usuariohaspermiso.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GLOBAL } from '../services/global';
import { UsuarioFull } from '../models/usuarioFull';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from '../services/auth.service';
import { DialogData } from '../models/dialogdata';
import { CommonService } from '../services/common.service';
import { stringify } from 'querystring';
import { Languages } from '../models/languages';
import { GrupoService } from '../services/grupo.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-log-home',
  templateUrl: './log-home.component.html',
  styleUrls: ['./log-home.component.scss']
})
export class LogHomeComponent implements OnInit {

  token;
  user;
  screenWidth;
  public  url;
  public  grupoinfo:Grupo;
  permisos={
    noticiaPermiso: false,
    miembroPermiso:false,
    proyectoPermiso:false,
    publicacionPermiso:false,
    contenidoPermiso:false,
    analiticaPermiso:false,
  };

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  title = 'Dashboard';
  permisoUsuario;
  counterDown;
  constructor(
    public _authService: AuthService,
    public _usuarioService: UsuarioService,
    public _permisoService: PermisoService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private idle: Idle, private keepalive: Keepalive,
    private router: Router,
    private _commonService:CommonService,
    private _grupoService:GrupoService,
    private titleService: Title,
  ){
    this.screenWidth = window.innerWidth;
    if(this.screenWidth>=960){
      this.enterAny=false;
    }else{
      this.enterAny=true;
    }
    this.url=GLOBAL.url;
    this.user = new UsuarioFull('','','','','','','','','',0,'','','',null,null,'',null,null,null,'',3,'',null);
        // sets an idle timeout of 5 seconds, for testing purposes.
        idle.setIdle(240);
        // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
        idle.setTimeout(59);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    
        idle.onIdleEnd.subscribe(() => { 
          this.idleState = 'No longer idle.'
          this.reset();
        });
        
        idle.onTimeout.subscribe(() => {
          this.dialog.closeAll();
          this.timedOut = true;
          localStorage.setItem("sessionEnd", '1');
          this._commonService.setEndSession('1');
          this.router.navigate(['/login']);
        });
        
        idle.onIdleStart.subscribe(() => {
            this.openDialog();
        });
        
        idle.onTimeoutWarning.subscribe((countdown) => {
          this.counterDown=countdown;
          localStorage.setItem("sessionEnd", '1');
          this._commonService.setEndSession('1');
          if(this.dialogRef.componentInstance){
            this.dialogRef.componentInstance.data.timer=countdown;
          }
        });
    
        // sets the ping interval to 15 seconds
        keepalive.interval(5);
    
        keepalive.onPing.subscribe(() => this.lastPing = new Date());
    
        if (JSON.parse(localStorage.getItem("user"))) {
          idle.watch();
          this.timedOut = false;
        } else {
          idle.stop();
        }

        // this.reset();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth>=960){
      this.enterAny=false;
    }else{
      this.enterAny=true;
    }
  }

  reset() {
    this.idle.watch();
    //xthis.idleState = 'Started.';
    this.timedOut = false;
  }  

  stay() {
    this._commonService.setEndSession('0');
    this.reset();
  }

  language

  ngOnInit() {
    this.titleService.setTitle('GMCAN | Administrador');
    this.getUser();
    this.getGrupoInfo();
  }

  noticiaPublicada;

  ngAfterViewChecked(){
    document.getElementById("titleDash").innerHTML=this._commonService.defineTitle(window.location.pathname);
    if(this._commonService.defineTitle(window.location.pathname)=='<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span>'){
      if(JSON.parse(sessionStorage.getItem('noticiaPublicada'))==1){
        this.noticiaPublicada=true;
      }else{
        this.noticiaPublicada=false;
      }
    }
    else{
      this.noticiaPublicada=false;
    }
    if(this._commonService.getReset()){
      this.getUser();
      this._commonService.setReset(false);
    }
  }

  getGrupoInfo(){
    this.grupoinfo=JSON.parse(localStorage.getItem("grupoInfo"));
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.grupoinfo=res[0];
      localStorage.setItem("grupoInfo",JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
    });
    this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
  }

  getUser(){
    let user = this._usuarioService.getUserLogged();
    if(!user){
      this.logout();
    }
    this._usuarioService.getFullUser(user.DNI).subscribe(result => {
      if(result.length>0){
        this.user=result[0];
        if(this.user.apellidoMaterno){
          this.user.nombreCompleto=this.user.nombre+ " " +this.user.apellidoPaterno + " " + this.user.apellidoMaterno;
        }else{
          this.user.nombreCompleto=this.user.nombre+ " " +this.user.apellidoPaterno;
        }
        if(this.user.nombre.includes(' ')){
          let string = this.user.nombre.split(' ');
          this.user.nombre= string[0];
        }
      }
      this.getPermisoHasUsuario(this.user.DNI);
    });
  }

  getPermisoHasUsuario(DNI){
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res)=>{
      if(res.length>0){
        this.permisoUsuario=res;
        for (let index = 0; index < this.permisoUsuario.length; index++) {
          switch (this.permisoUsuario[index].permiso_idPermiso) {
            case 1:
              this.permisos.noticiaPermiso=true;
              break;
            case 2:
              this.permisos.proyectoPermiso=true;
              break;
            case 3:
              this.permisos.publicacionPermiso=true;
              break;
            case 4:
              this.permisos.miembroPermiso=true;
              break;
            case 5:
              this.permisos.contenidoPermiso=true;
              break;
            case 6:
              this.permisos.analiticaPermiso=true;
              break;
            default:
              break;
          } 
        }
      }
    });
  }

  logout(){
    localStorage.setItem("sessionEnd",'1');
    this.idle.stop();
    this.timedOut = true;
    this._authService.logout();
    this._router.navigate(['/login']);
  }

  backToTop(){
    localStorage.setItem("sessionEnd",'1');
    this.idle.stop();
    this.timedOut = true;
    this._authService.logout();
    this._router.navigate(['/']);
  }

  enterAny;
  enterAnyway(){
    this.enterAny=false;
  }

  textChange(text){
    this.title=text;
  }

  private dialogRef: MatDialogRef<DialogIdle>

  openDialog() {
    this.dialogRef = this.dialog.open(DialogIdle,{
      width:"530px",
      id:"idleTimer",
      data: {title: "La sesión terminará pronto",
            text:"Presiona “Continuar” para seguir trabajando con normalidad.",
            cancel:"Cerrar sesión",
            yes:"Continuar",
            timer:this.counterDown}
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if(result){
        this._commonService.setEndSession('1');
        this.logout();
      }else if(result!=undefined){
        this._authService.refreshToken().subscribe((res)=>{});;
        this.stay();
      }
    });
  }

  openDialogLogOff() {
    this.dialogRef = this.dialog.open(DialogIdle,{
      width:"530px",
      id:"idleTimer",
      data: {title: "¿Estás seguro de que deseas cerrar la sesión?",
            text:"Los cambios sin guardar se perderán.",
            cancel:"Sí, cerrar sesión",
            yes:"No, cancelar"}
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.logout();
      }
    });
  }

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogIdle {
  constructor(
    public dialogRef: MatDialogRef<DialogIdle>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogLogOff {
  constructor(
    public dialogRef: MatDialogRef<DialogLogOff>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}