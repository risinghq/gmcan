import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EmailBody } from '../models/emailBody';
import { EmailService } from '../services/email.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GLOBAL } from '../services/global';
import { Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-join-us',
  templateUrl: './join-us.component.html',
  styleUrls: ['./join-us.component.scss']
})
export class JoinUsComponent implements OnInit {
  public user:FormGroup;
  public validation =true;
  public email: EmailBody
  constructor(
    public fb:FormBuilder,
    public _emailService: EmailService,
    public dialog: MatDialog
  ) {
    this.user = this.fb.group({
      nombre: ['', Validators.required],
      razon: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required]
    });
   }

  language;

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.email = new EmailBody("","","","");
  }

  sendEmail(){
    if(!this.user.invalid){
        this.email.nombre=this.user.controls.nombre.value;
        this.email.razon=this.user.controls.razon.value; 
        this.email.correo=this.user.controls.correo.value;
        this.email.telefono=this.user.controls.telefono.value;
        this._emailService.sendEmail(this.email).subscribe((res)=>{
          this.openDialog();
        });
      }
  }


  openDialog(): void {
    let width = '913px';
    if(window.innerWidth<960){
      width= '312px';
    }
    const dialogRef = this.dialog.open(EmailExitoso, {
      disableClose: true,
      width: width,
      position: {top: '170px'},
      id: 'joinUs',
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}


@Component({
  selector: 'exitoso-dialog',
  templateUrl: '../modals/email-exitoso.html',
})
export class EmailExitoso {
  public  url;
  grupoLogo;
  grupoInfo;
  screenWidth: number;
  language;
  constructor(
    public dialogRef: MatDialogRef<EmailExitoso>,
    public _route: ActivatedRoute,
    public _router: Router,
    ) {
      this.language=JSON.parse(localStorage.getItem("language"));
      this.screenWidth = window.innerWidth;
      this.url=GLOBAL.url;
      this.grupoInfo=JSON.parse(localStorage.getItem("grupoInfo"));
      this.grupoLogo=this.grupoInfo.logoHeader;
      this.grupoLogo=this.url+'grupo/get-image-grupo/'+this.grupoLogo;
    }

  onNoClick(): void {
    this._router.navigate(['/']);
    this.dialogRef.close();
  }

}
