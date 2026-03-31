import { Component, OnInit, Inject } from '@angular/core';
import { FuenteFinanciamientoService } from '../services/fuentefinanciamiento.service';
import { FuenteFinanciamiento } from '../models/fuentefinanciamiento';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  standalone: false,
  selector: 'app-add-fuente',
  templateUrl: './add-fuente.component.html',
  styleUrls: ['./add-fuente.component.scss']
})
export class AddFuenteComponent implements OnInit {

  fuente: FuenteFinanciamiento;
  public fuenteForm: FormGroup;
  button_text="Guardar fuente"

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
    private _commonService: CommonService,
  ) {
    this.fuente=new FuenteFinanciamiento(null,'');
    this.fuenteForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {
  }

  agregar;
  notCanDo;
  openEraser(){}
  edit;

  submitFuente(){
    this._fuenteFinanciamientoService.addFuenteFinanciamiento(this.fuente).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar();
        this.agregar=true;
      } 
    });
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/proyectos-ejecucion']);
  }

  openSnackBar() {
    this._snackBar.open("Fuente agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel18>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel18,{
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
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel18 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel18>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
