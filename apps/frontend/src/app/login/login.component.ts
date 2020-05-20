import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { Grupo } from '../models/grupo';
import { GrupoService } from '../services/grupo.service';
import { GLOBAL } from '../services/global';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public  grupoinfo:Grupo;
  public  url;
  public loginForm:FormGroup;
  public emailForm:FormGroup;
  public previouslink;
  constructor(
    public _usuarioService: UsuarioService,
    public _grupoService: GrupoService,
    public fb:FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public _emailService: EmailService,
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.emailForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
    });
    this.grupoinfo = new Grupo(null,'','','','','','','','','','','','','','',null,null);
    this.url=GLOBAL.url;
  }
  error;
  language;

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.getGrupoInfo();
    this.previouslink=sessionStorage.getItem("previous-page");
  }

  getGrupoInfo(){
    this.grupoinfo=JSON.parse(localStorage.getItem("grupoInfo"));
    this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
  }

  login(){
    if(!this.loginForm.invalid){
      let user={
        correo:this.loginForm.controls.correo.value,
        password:this.loginForm.controls.password.value
      }
      this._usuarioService.login(user).subscribe((res)=>{
        if(res.state==0){
          this.error=this.language.loginText[0].error;
        }else{
          localStorage.setItem("user",JSON.stringify(res.user));
          localStorage.setItem("token",JSON.stringify(res.token));
          this._router.navigate(['/dashboard']);
        }
      });
    }
  }
  recoverValue=false;

  change(){
    this.recoverValue=!this.recoverValue;
  }

  recover(){
    let user={
      correo:this.emailForm.controls.correo.value
    }  
    this._emailService.recoverEmail(user).subscribe((res)=>{      
      if(res){
        if(res.state==0){
          this.error="El correo no se encuentra registrado en la base de datos"
        }
      }
      else{
        this.error=null;
      }
    });
  }
  return(){
    this._router.navigate([this.previouslink]);
  }

}
