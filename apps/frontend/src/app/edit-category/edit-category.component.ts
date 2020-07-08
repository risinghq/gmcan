import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../models/dialogdata';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TipoNoticia } from '../models/tiponoticia';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TipoNoticiaService } from '../services/tiponoticia.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NoticiaService } from '../services/noticia.service';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: '../add-category/add-category.component.html',
  styleUrls: ['../add-category/add-category.component.scss']
})
export class EditCategoryComponent implements OnInit {
  category: TipoNoticia;
  public categoryForm: FormGroup;
  button_text="Actualizar categoría";
  edit=true;
  idCategory;
  agregar;
  eliminar;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    public _tipoNoticiaService:TipoNoticiaService,
    public _noticiaService:NoticiaService,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
  ) {
    this.categoryForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      nombreEN: ['', Validators.required]
    });
    this.category = new TipoNoticia(null,"","");
  }

  ngOnInit() {
    this.getCategory();
  }

  private dialogRef: MatDialogRef<DialogCancel2>;

  getCategory(){
    this._route.params.forEach((params:Params)=>{
      this.idCategory = params['id'];
      this._tipoNoticiaService.getTipoNews(this.idCategory).subscribe(result => {
        if(result[0]){
          this.category=result[0];
          localStorage.setItem("categoryEdit",JSON.stringify(this.category.nombre));
        }
        this.getRelatedNews();
      });
    });  
  }

  notCanDo;

  getRelatedNews(){
    this._noticiaService.getNoticiaTipo(this.idCategory).subscribe(result => {
      if(result.length>0){
        this.notCanDo=false;
      }else{
        this.notCanDo=true;
      }
    });
  }

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel2,{
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

  return(){
    if(!this.eliminar){
      this.agregar=false;
    }
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/noticias']);
  }

  submitCategory(){
    if(this.categoryForm.valid){      
      this._tipoNoticiaService.updateCategory(this.category).subscribe(result => {
        if(result.status==1){
          this.return();
          this.openSnackBar("Categoría actualizada exitosamente");
        } 
      });
    }
  }

  openSnackBar(text) {
    this._snackBar.open(text , null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  openEraser(){
    if(this.notCanDo){
      this.dialogRef = this.dialog.open(DialogCancel2,{
        width:"530px",
        id:"idleTimer",
        data: {title: "Eliminar categoría",
              text:"¿Estás seguro que deseas eliminar esta categoría?",
              cancel:"Sí, eliminar",
              yes:"No, cancelar"}
      });
  
      this.dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.eraseCategory();
        }
      }); 
    }
  }

  eraseCategory(){
    this._noticiaService.getNoticiaTipo(this.idCategory).subscribe(result => {
      if(result.length==0){
        this._tipoNoticiaService.deleteCategory(this.idCategory).subscribe(result => {
          if(result.status==1){
            this.eliminar=true;
            this.agregar=true;
            this.return();
            this.openSnackBar("Categoría eliminada exitosamente");
          }else{
            this.openSnackBar("Hubo un problema al eliminar");
          }
        });
      } 
    });
  }

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel2 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel2>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel2>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

