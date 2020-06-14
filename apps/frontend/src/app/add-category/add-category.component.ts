import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../models/dialogdata';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoNoticia } from '../models/tiponoticia';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text="Agregar categoría"
  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    public _tipoNoticiaService:TipoNoticiaService,
    private _snackBar: MatSnackBar
  ) {
    this.categoryForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      nombreEN: ['', Validators.required]
    });
    this.category = new TipoNoticia(null,"","");
  }

  ngOnInit() {
  }

  private dialogRef: MatDialogRef<DialogCancel>

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel,{
      width:"530px",
      id:"idleTimer",
      data: {title: "¿Estás seguro que deseas volver sin guardar?",
            text:"La información no se guardará",
            cancel:"Sí, volver",
            yes:"No, mantenerme aquí"}
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.return();
      }
    });
  }

  return(){
    this._router.navigate(['dashboard/noticias']);
  }

  submitCategory(){
    if(this.categoryForm.valid){
      this._tipoNoticiaService.addCategory(this.category).subscribe(result => {
        if(result.status==1){
          this.return();
          this.openSnackBar();
        } 
      });
    }
  }

  openSnackBar() {
    this._snackBar.open("Categoría agregada exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
