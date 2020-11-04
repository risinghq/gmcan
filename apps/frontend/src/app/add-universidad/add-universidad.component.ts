import { Component, OnInit, Inject } from '@angular/core';
import { Universidad } from '../models/universidad';
import { UniversidadService } from '../services/universidad.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';

@Component({
  selector: 'app-add-universidad',
  templateUrl: './add-universidad.component.html',
  styleUrls: ['./add-universidad.component.scss']
})
export class AddUniversidadComponent implements OnInit {

  universidad: Universidad;
  public universidadForm: FormGroup;
  button_text="Guardar universidad";
  notCanDo;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _universidadService: UniversidadService,
    private _commonService: CommonService,
  ) {
    this.universidad=new Universidad(null,'','',null,null);
    this.universidadForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      nombreEN: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  agregar;

  submitUniversidad(){
    this._universidadService.addUniversidad(this.universidad).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar();
        this.agregar=true;
      } 
    });
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/tesis']);
  }

  openSnackBar() {
    this._snackBar.open("Universidad agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  private dialogRef: MatDialogRef<DialogCancel7>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel7,{
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

  openEraser(){}
  edit;

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel7 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel7>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
