import { Component, OnInit, Inject } from '@angular/core';
import { Method } from '../models/method';
import { MethodsService } from '../services/methods.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { GLOBAL } from '../services/global';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { Languages } from '../models/languages';

@Component({
  selector: 'app-add-method',
  templateUrl: './add-method.component.html',
  styleUrls: ['./add-method.component.scss']
})
export class AddMethodComponent implements OnInit {

  button_text="Guardar método";
  metodo: Method
  public methodForm: FormGroup;
  url;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _methodService: MethodsService,
  ) {
    this.methodForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      nombreEN: ['', Validators.required],
      descripcion: ['', Validators.required],
      descripcionEN: ['', Validators.required],
    });
    this.metodo= new Method(null,'','','','','',1);
    this.url=GLOBAL.url;
  }

  ngOnInit() {
  }

  submitMethod(){
    if(this.methodForm.valid){
      this._methodService.addMetodo(this.metodo).subscribe(result => {
        if(result.status==1){
          if(this.fileData){
            this._methodService.uploadMetodoFoto(this.fileData, result.idMetodo).subscribe(res => {
            }) 
          }
          this.agregar=true;
          this.return();
          this.openSnackBar();
        }
      });
    }
  }

  agregar;

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/contenidos']);
  }

  openSnackBar() {
    this._snackBar.open("Método agregado exitosamente", null, {
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

  private dialogRef: MatDialogRef<DialogCancel24>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel24,{
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

  private previewDialog: MatDialogRef<DialogPreview4>

  previewMethod(value){
    let method= JSON.parse(JSON.stringify(this.metodo));
    localStorage.setItem("langLocale",'0')
    method.foto=this.previewUrl;
    if(value==1){
      method.nombre=method.nombreEN;
      method.descripcion=method.descripcionEN;
      localStorage.setItem("langLocale",'1')
    }
    this.previewDialog = this.dialog.open(DialogPreview4,{
      width:'871px',
      id:'previewMethod',
      data: method
    });

    this.previewDialog.afterClosed().subscribe(result => {
      if(!result){        
      }
    });
  }

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel24 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel24>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/method-preview.html',
  styleUrls: ['../method/method.component.scss'],
})
export class DialogPreview4 {
  url;
  language;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview4>,
    @Inject(MAT_DIALOG_DATA) public method) {
      this.url=GLOBAL.url;
    }

    ngOnInit(){
      if(localStorage.getItem('langLocale')=='0'){
        this.language=Languages[0];
      }else{
        this.language=Languages[1];
      }
      document.getElementById("descripcion").innerHTML=this.method.descripcion;
    }
}

