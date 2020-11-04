import { Component, OnInit, Inject } from '@angular/core';
import { Evento } from '../models/eventos';
import { EventoService } from '../services/evento.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../models/dialogdata';

@Component({
  selector: 'app-add-evento',
  templateUrl: './add-evento.component.html',
  styleUrls: ['./add-evento.component.scss']
})
export class AddEventoComponent implements OnInit {

  evento: Evento;
  public eventoForm: FormGroup;
  button_text="Guardar evento"

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _eventoService: EventoService,
    private _commonService: CommonService,
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
  }

  agregar;

  submitEvento(){
    this._eventoService.addEvento(this.evento).subscribe(result => {
      if(result.status==1){
        this.return();
        this.openSnackBar();
        this.agregar=true;
      } 
    });
  }

  return(){
    this._commonService.setEndSession('0');
    this._router.navigate(['dashboard/eventos']);
  }

  openSnackBar() {
    this._snackBar.open("Evento agregado exitosamente", null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private dialogRef: MatDialogRef<DialogCancel8>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel8,{
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

  notCanDo;
  openEraser(){}
  edit;

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/dialog-options.html',
})
export class DialogCancel8 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel8>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      dialogRef.disableClose = true;
    }
}
