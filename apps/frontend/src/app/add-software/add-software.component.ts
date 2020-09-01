import { Component, OnInit, Inject } from '@angular/core';
import { Software } from '../models/software';
import { SoftwareService } from '../services/software.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';

@Component({
  selector: 'app-add-software',
  templateUrl: './add-software.component.html',
  styleUrls: ['./add-software.component.scss']
})
export class AddSoftwareComponent implements OnInit {

  software: Software;
  softwareForm: FormGroup;
  button_text="Guardar software";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _softwareService: SoftwareService,
  ) {
    this.software=new Software(null,'','','',1,null,null);
    this.softwareForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      descripcionEN: ['', Validators.required],
      moreInfo: ['']
    });
  }

  ngOnInit() {
  }

  submitSoftware(){
    this._softwareService.addSoftware(this.software).subscribe((res)=>{
      if(res.status==1){
        this.agregar=true;
        this.return();
        this.openSnackBar();
      }
    });
  }
  
  agregar;

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/contenidos']);
  }

  openSnackBar() {
    this._snackBar.open("Software agregado exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel28>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel28,{
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
export class DialogCancel28 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel28>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
