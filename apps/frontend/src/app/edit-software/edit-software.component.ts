import { Component, OnInit, Inject } from '@angular/core';
import { Software } from '../models/software';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { SoftwareService } from '../services/software.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';

@Component({
  selector: 'app-edit-software',
  templateUrl: '../add-software/add-software.component.html',
  styleUrls: ['../add-software/add-software.component.scss']
})
export class EditSoftwareComponent implements OnInit {

  edit=true
  software: Software;
  softwareForm: FormGroup;
  button_text="Actualizar información";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _softwareService: SoftwareService,
  ) {
    this.software=new Software(null,'','','','',1,null,null);
    this.softwareForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      descripcionEN: ['', Validators.required],
      moreInfo: ['']
    });
  }

  ngOnInit() {
    this.getSoftware();
  }

  getSoftware(){
    this._route.params.forEach((params:Params)=>{
      let idSoftware=params['id'];
      this._softwareService.getSoftwareId(idSoftware).subscribe(result => {
        if(result.length>0){
          this.software=result[0];
          localStorage.setItem("softwareEdit",JSON.stringify(this.software.nombre));
        } 
      });
    });
  }

  submitSoftware(){
    this._softwareService.updateSoftware(this.software).subscribe((res)=>{
      if(res.status==1){
        this.agregar=true;
        this.return();
        this.openSnackBar("Software actualizado exitosamente");
      }
    });
  }
  
  agregar;

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/contenidos']);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel29>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel29,{
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

  private dialogRef2: MatDialogRef<DialogErase14>;

  openEraser(){
    this.dialogRef2 = this.dialog.open(DialogErase14,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar software",
        text:"¿Estás seguro que deseas eliminar este software?",
        cancel:"Sí, eliminar",
        yes:"No, cancelar"}
      });  
    this.dialogRef2.afterClosed().subscribe(result => {
      if(result){
        this.eraseSoftware();
      }
    }); 
  }

  eraseSoftware(){
    this._softwareService.deleteSoftware(this.software.idSoftware).subscribe(result => {
      if(result.status==1){
        this.agregar=true;
        this.return();
        this.openSnackBar("Software eliminado exitosamente");
      }else{
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }


}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel29 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel29>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase14 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase14>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

