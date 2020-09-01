import { Component, OnInit, Inject } from '@angular/core';
import { Evento } from '../models/eventos';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventoService } from '../services/evento.service';
import { CommonService } from '../services/common.service';
import { PublicacionService } from '../services/publicacion.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';

@Component({
  selector: 'app-edit-evento',
  templateUrl: '../add-evento/add-evento.component.html',
  styleUrls: ['../add-evento/add-evento.component.scss']
})
export class EditEventoComponent implements OnInit {

  evento: Evento;
  public eventoForm: FormGroup;
  button_text="Actualizar evento"
  edit= true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _eventoService: EventoService,
    private _commonService: CommonService,
    private _publicacionService: PublicacionService
  ) {
    this.evento=new Evento(null,'','','','','');
    this.eventoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      pais: ['', Validators.required],
      paisEN: ['', Validators.required],
      ciudad: ['', Validators.required],
      ciudadEN: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getEvento();
  }

  getEvento(){
    this._route.params.forEach((params:Params)=>{
      let idEvento=params['id'];
      this._eventoService.getEvento(idEvento).subscribe(result => {
        if(result){
          this.evento=result[0];
          localStorage.setItem("eventoEdit",JSON.stringify(this.evento.nombre));
          this.getPublicacionEvento(idEvento);
        } 
      });
    });
  }

  notCanDo

  getPublicacionEvento(idEvento){
    this._publicacionService.getPublicacionesEvento(idEvento).subscribe(result => {
      if(result.length==0){
        this.notCanDo=true;
      } 
    });
  }


  agregar;

  submitEvento(){
    this._eventoService.updateEvento(this.evento).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar("Evento actualizado exitosamente");
        this.agregar=true;
      } 
    });
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/eventos']);
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  private dialogRef: MatDialogRef<DialogCancel11>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel11,{
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

  private dialogRef2: MatDialogRef<DialogErase5>;

  openEraser(){
    if(this.notCanDo){
    this.dialogRef2 = this.dialog.open(DialogErase5,{
      width:"530px",
      id:"idleTimer",
      data: {title: "Eliminar evento",
        text:"¿Estás seguro que deseas eliminar este evento?",
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
      this._eventoService.deleteEvento(this.evento.idEvento).subscribe(result => {
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


}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel11 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel11>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogErase5 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase5>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}