import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../models/grupo';
import { GLOBAL } from '../services/global';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent implements OnInit {

  public passwordForm:FormGroup;
  public  grupoinfo:Grupo;
  public url;

  constructor(
    public fb:FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public _usuarioService: UsuarioService,
    public  _grupoService: GrupoService,
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.url=GLOBAL.url;
    this.grupoinfo= new Grupo(0,'','','','','','','','','','','','','','','','','','','','','','','','',null,null);
  }

  public user:any;
  language;
  passwordSame;

  ngOnInit() {
    this.checkStatus();
  }
  status=false;

  checkStatus(){
    this._route.params.forEach((params:Params)=>{
      let token = params['id'];
      let str=token.split("&",2);
      this.user={
        token:str[0].replace(/slash/g, "/"),
        correo:str[1]
      }
      localStorage.setItem("JWT_TOKEN",this.user.token)
      this._usuarioService.checkStatus(this.user)
      .subscribe((res)=>{
        if(res.state==1){
          this.status=true;
          this.getGrupoInfo();
          this.language=JSON.parse(localStorage.getItem("language"));
          this.getId();
        }else{
          this._router.navigate(['/error']);
        }
      });
    }); 
  }

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.grupoinfo=res[0];
      localStorage.setItem("grupoInfo",JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
    });
  }

  getId(){
    this._route.params.forEach((params:Params)=>{
      let token = params['id'];
      let str=token.split("&",2);
      this.user={
        token:str[0].replace(/slash/g, "/"),
        correo:str[1]
      }
    }); 
  }

  verifyEqual(){
    if(this.passwordForm.controls.password.value===this.passwordForm.controls.newPassword.value){
      this.passwordSame=false;
    }else{
      this.passwordSame=true;
    }
    return this.passwordSame;
  }

  succesful=false;

  resetPassword(){
    if(!this.verifyEqual()){
      let usuario={
        correo:this.user.correo,
        token:this.user.token,
        password:this.passwordForm.controls.password.value
      }
      this._usuarioService.changePassword(usuario).subscribe((res)=>{
        if(res.state==1){
          this.succesful=true;
        }
      });
    }
  }

  return(){
    this._router.navigate(['/login']);
  }

}
