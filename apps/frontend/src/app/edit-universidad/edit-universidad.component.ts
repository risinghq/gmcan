import { Component, OnInit, Inject } from '@angular/core';
import { Universidad } from '../models/universidad';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UniversidadService } from '../services/universidad.service';
import { CommonService } from '../services/common.service';
import { PublicacionService } from '../services/publicacion.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  standalone: false,
  selector: 'app-edit-universidad',
  templateUrl: '../add-universidad/add-universidad.component.html',
  styleUrls: ['../add-universidad/add-universidad.component.scss']
})
export class EditUniversidadComponent implements OnInit {

  universidad: Universidad;
  public universidadForm: FormGroup;
  button_text="Guardar universidad";
  edit=true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _universidadService: UniversidadService,
    private _commonService: CommonService,
    private _publicacionService: PublicacionService
  ) {
    this.universidad=new Universidad(null,'','',null,null);
    this.universidadForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {
    this.getUniversidad();
  }

  notCanDo

  getUniversidad(){
    this._route.params.forEach((params:Params)=>{
      let idUniversidad=params['id'];
      this._universidadService.getUniversidad(idUniversidad).subscribe(result => {
        if(result){
          this.universidad=result[0];
          localStorage.setItem("universidadEdit",JSON.stringify(this.universidad.nombre));
          this.getPublicacionUniversidad(idUniversidad);
        } 
      });
    });
  }

  getPublicacionUniversidad(idUniversidad){
    this._publicacionService.getPublicacionesUniversidad(idUniversidad).subscribe(result => {
      if(result.length==0){
        this.notCanDo=true;
      } 
    });
  }

  agregar;

  submitUniversidad(){
    this._universidadService.updateUniversidad(this.universidad).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar("Universidad actualizada exitosamente");
        this.agregar=true;
      } 
    });
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/tesis']);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  private dialogRef: MatDialogRef<DialogCancel10>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel10,{
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

  private dialogRef2: MatDialogRef<DialogErase4>;

  openEraser(){
    if(this.notCanDo){
      this.dialogRef2 = this.dialog.open(DialogErase4,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar universidad",
        text:"¿Estás seguro que deseas eliminar esta universidad?",
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
      this._universidadService.deleteUniversidad(this.universidad.idUniversidad).subscribe(result => {
        if(result.status==1){
          this.agregar=true;
          this.return();
          this.openSnackBar("Universidad eliminada exitosamente");
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
export class DialogCancel10 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel10>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase4 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase4>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}