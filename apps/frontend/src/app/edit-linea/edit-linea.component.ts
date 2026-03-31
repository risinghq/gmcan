import { Component, OnInit, Inject } from '@angular/core';
import { lineasInvestigacion } from '../models/lineaInvestigacion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../services/common.service';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { GLOBAL } from '../services/global';
import { ProyectoService } from '../services/proyecto.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';
import { SpaceValidator } from '../services/spacevalidator';

@Component({
  standalone: false,
  selector: 'app-edit-linea',
  templateUrl: '../add-linea/add-linea.component.html',
  styleUrls: ['../add-linea/add-linea.component.scss']
})
export class EditLineaComponent implements OnInit {

  button_text="Actualizar información";
  lineaInvestigacion: lineasInvestigacion;
  public lineaForm: FormGroup;
  url;
  edit=true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _lineaInvestigacionService: LineasInvestigacionService,
    private _proyectoService: ProyectoService,
  ) {
    this.lineaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      nombreEN: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcion: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: ['', [Validators.required, SpaceValidator.cannotContainSpace]],
    });
    this.lineaInvestigacion= new lineasInvestigacion(null,'','',null,'','',1,null,null,null,null);
    this.url=GLOBAL.url;
  }

  ngOnInit() {
    this.getLinea();
  }

  getLinea(){
    this._route.params.forEach((params:Params)=>{
      let idLineaInvestigacion=params['id'];
      this._lineaInvestigacionService.getLineaInvestigacion(idLineaInvestigacion).subscribe(result => {
        if(result.length>0){
          this.lineaInvestigacion=result[0];
          localStorage.setItem("lineaInvestigacionEdit",JSON.stringify(this.lineaInvestigacion.nombre));
          this._proyectoService.getProyectosLinea(idLineaInvestigacion,1).subscribe(result => {
            if(result==0){
              this.notCanDo=true;
            }else{
              this.notCanDo=false;
            }
          });
          this._proyectoService.getProyectosLinea(idLineaInvestigacion,0).subscribe(result => {
            if(result==0){
              this.notCanDo=true;
            }else{
              this.notCanDo=false;
            }
          });
        }
      });
    })
  }

  submitLinea(){
    this._lineaInvestigacionService.updateLinea(this.lineaInvestigacion).subscribe(result => {
      if(result.status==1){
        if(this.fileData){
          this._lineaInvestigacionService.uploadLineaFoto(this.fileData, this.lineaInvestigacion.idLineasInvestigacion).subscribe(res => {
          }) 
        }
        this.agregar=true;
        this.return();
        this.openSnackBar("Linea de investigación actualizada exitosamente");
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

  fileData: File = null;
  previewUrl:any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];  
    this.preview();
  }

  preview() {
    // Show preview 
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
 
    var reader = new FileReader();      
    reader.readAsDataURL(this.fileData); 
    reader.onload = (_event) => {
      this.previewUrl = reader.result; 
    }
  }

  notCanDo

  eraseLinea(){
    if(this.notCanDo){
      this._lineaInvestigacionService.deleteLinea(this.lineaInvestigacion.idLineasInvestigacion).subscribe(result => {
        if(result.status==1){
          this.agregar=true;
          this.return();
          this.openSnackBar("Evento eliminado exitosamente");
        }else{
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }

  private dialogRef: MatDialogRef<DialogCancel23>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel23,{
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

  private dialogRef2: MatDialogRef<DialogErase11>;

  openEraser(){
    if(this.notCanDo){
    this.dialogRef2 = this.dialog.open(DialogErase11,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar línea de investigación",
        text:"¿Estás seguro que deseas eliminar esta línea?",
        cancel:"Sí, eliminar",
        yes:"No, cancelar"}
      });  
      this.dialogRef2.afterClosed().subscribe(result => {
        if(result){
          this.eraseLinea();
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
export class DialogCancel23 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel23>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  standalone: false,
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase11 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase11>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}