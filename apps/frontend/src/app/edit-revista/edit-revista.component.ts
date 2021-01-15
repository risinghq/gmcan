import { Component, OnInit, Inject } from '@angular/core';
import { Revista } from '../models/revista';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RevistaService } from '../services/revista.service';
import { CommonService } from '../services/common.service';
import { PublicacionService } from '../services/publicacion.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  selector: 'app-edit-revista',
  templateUrl: '../add-revista/add-revista.component.html',
  styleUrls: ['../add-revista/add-revista.component.scss']
})
export class EditRevistaComponent implements OnInit {

  revista: Revista;
  public revistaForm: FormGroup;
  button_text="Actualizar revista"
  edit=true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _revistaService: RevistaService,
    private _commonService: CommonService,
    private _publicacionService: PublicacionService,
  ) {
    this.revista=new Revista(null,'');
    this.revistaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ngOnInit() {
    this.getRevista();
  }

  getRevista(){
    this._route.params.forEach((params:Params)=>{
      let idRevista=params['id'];
      this._revistaService.getRevista(idRevista).subscribe(result => {
        if(result){
          this.revista=result[0];
          localStorage.setItem("revistaEdit",JSON.stringify(this.revista.nombre));
          this.getPublicacionRevista(idRevista);
        } 
      });
    });
  }

  notCanDo

  getPublicacionRevista(idRevista){
    this._publicacionService.getPublicacionesRevista(idRevista).subscribe(result => {
      if(result.length==0){
        this.notCanDo=true;
      } 
    });
  }

  agregar;

  submitRevista(){
    this._revistaService.updateRevista(this.revista).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar("Revista actualizada exitosamente");
        this.agregar=true;
      } 
    });
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/articulos']);
  }

  private dialogRef: MatDialogRef<DialogCancel9>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel9,{
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

  private dialogRef2: MatDialogRef<DialogErase3>;

  openEraser(){
    if(this.notCanDo){
    this.dialogRef2 = this.dialog.open(DialogErase3,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar noticia",
        text:"¿Estás seguro que deseas eliminar esta noticia?",
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

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  eraseNews(){
    if(this.notCanDo){
      this._revistaService.deleteRevista(this.revista.idRevista).subscribe(result => {
        if(result.status==1){
          this.agregar=true;
          this.return();
          this.openSnackBar("Revista eliminada exitosamente");
        }else{
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }


}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel9 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel9>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase3 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase3>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
