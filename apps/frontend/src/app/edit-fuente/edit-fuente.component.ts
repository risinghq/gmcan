import { Component, OnInit, Inject } from '@angular/core';
import { FuenteFinanciamiento } from '../models/fuentefinanciamiento';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuenteFinanciamientoService } from '../services/fuentefinanciamiento.service';
import { CommonService } from '../services/common.service';
import { ProyectoService } from '../services/proyecto.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  standalone: false,
  selector: 'app-edit-fuente',
  templateUrl: '../add-fuente/add-fuente.component.html',
  styleUrls: ['../add-fuente/add-fuente.component.scss']
})
export class EditFuenteComponent implements OnInit {

  fuente: FuenteFinanciamiento;
  public fuenteForm: FormGroup;
  button_text="Actualizar información";
  edit=true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fuenteFinanciamientoService: FuenteFinanciamientoService,
    private _commonService: CommonService,
    private _proyectoService: ProyectoService,
  ) {
    this.fuente=new FuenteFinanciamiento(null,'');
    this.fuenteForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {
    this.getFuente();
  }

  getFuente(){
    this._route.params.forEach((params:Params)=>{
      let idFuente=params['id'];
      this._fuenteFinanciamientoService.getFuenteFinanciamiento(idFuente).subscribe(result => {
        if(result.length>0){
          this.fuente=result[0];
          localStorage.setItem("fuenteEdit",JSON.stringify(this.fuente.nombre));
          this.getFuenteProyecto(this.fuente)
        }
      });
    })
  }

  notCanDo=false;

  getFuenteProyecto(fuente){
    this._proyectoService.getProyectoFuente(fuente.idFuenteFinanciamiento).subscribe(result => {
      if(result.length==0){
        this.notCanDo=true;
      }
    });
  }

  agregar;

  submitFuente(){
    if(this.fuenteForm.valid){
      this._fuenteFinanciamientoService.updateFuenteFinanciamiento(this.fuente).subscribe(result => {
        if(result.status==1){
          this.return();
          this.openSnackBar("Fuente de financiamiento actualizada exitosamente");
          this.agregar=true;
        } 
      });
    }
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/proyectos-ejecucion']);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel19>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel19,{
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

  private dialogRef2: MatDialogRef<DialogErase9>;

  openEraser(){
    if(this.notCanDo){
    this.dialogRef2 = this.dialog.open(DialogErase9,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar fuente de financiamiento",
        text:"¿Estás seguro que deseas eliminar esta fuente?",
        cancel:"Sí, eliminar",
        yes:"No, cancelar"}
      });  
      this.dialogRef2.afterClosed().subscribe(result => {
        if(result){
          this.eraseNews();
        }
      }); 
    }
  }

  eraseNews(){
    if(this.notCanDo){
      this._fuenteFinanciamientoService.deleteFuenteFinanciamiento(this.fuente.idFuenteFinanciamiento).subscribe(result => {
        if(result.status==1){
          this.agregar=true;
          this.return();
          this.openSnackBar("Fuente de financiamiento eliminada exitosamente");
        }else{
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }


}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel19 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel19>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase9 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase9>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
