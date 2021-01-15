import { Component, OnInit, Inject } from '@angular/core';
import { EquipoService } from '../services/equipo.service';
import { Equipo } from '../models/equipo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  selector: 'app-add-equipo',
  templateUrl: './add-equipo.component.html',
  styleUrls: ['./add-equipo.component.scss']
})
export class AddEquipoComponent implements OnInit {

  equipo: Equipo;
  equipoForm: FormGroup;
  button_text="Guardar equipo";

  edit;
  openEraser(){}

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _equipoService: EquipoService,
  ) {
    this.equipo=new Equipo(null,'','','','','',1,null,null);
    this.equipoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      cpu: [''],
      gpu: [''],
      ram: [''],
      hd: [''],
    });
  }

  ngOnInit() {
  }

  submitEquipo(){
    if(this.equipoForm.valid){
      this._equipoService.addEquipo(this.equipo).subscribe((res)=>{
        if(res.status==1){
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
    this._snackBar.open("Equipo agregado exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel26>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel26,{
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
export class DialogCancel26 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel26>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}


