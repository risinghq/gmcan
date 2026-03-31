import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { DialogData } from "../models/dialogdata";
import { Evento } from "../models/eventos";
import { CommonService } from "../services/common.service";
import { EventoService } from "../services/evento.service";
import { SpaceValidator } from "../services/spacevalidator";

@Component({
  standalone: false,
  selector: "app-add-evento",
  templateUrl: "./add-evento.component.html",
  styleUrls: ["./add-evento.component.scss"],
})
export class AddEventoComponent implements OnInit {
  evento: Evento;
  public eventoForm: FormGroup;
  button_text = "Guardar evento";

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _eventoService: EventoService,
    private _commonService: CommonService,
  ) {
    this.evento = new Evento(null, "", "", "", "", "");
    this.eventoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      pais: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      paisEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudad: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudadEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ciudadesControl = new FormControl();
  ciudades: Array<any> = [];
  filteredOptions: Observable<any>;
  filteredOptions1: Observable<any>;
  ciudadesENControl = new FormControl();
  ciudadesEN: Array<any> = [];
  filteredOptions2: Observable<any>;
  paisControl = new FormControl();
  pais: Array<any> = [];
  filteredOptions3: Observable<any>;
  paisENControl = new FormControl();
  paisEN: Array<any> = [];

  private _filter(value): any {
    const filterValue = value.toLowerCase();
    return this.ciudades.filter((ciudad) => ciudad.ciudad.toLowerCase().includes(filterValue));
  }
  private _filter1(value): any {
    const filterValue1 = value.toLowerCase();
    return this.ciudadesEN.filter((ciudadEN) => ciudadEN.ciudadEN.toLowerCase().includes(filterValue1));
  }
  private _filter2(value): any {
    const filterValue2 = value.toLowerCase();
    return this.pais.filter((pais) => pais.pais.toLowerCase().includes(filterValue2));
  }
  private _filter3(value): any {
    const filterValue3 = value.toLowerCase();
    return this.paisEN.filter((paisEN) => paisEN.paisEN.toLowerCase().includes(filterValue3));
  }

  ngOnInit() {
    this.getCiudad();
    this.getCiudadEN();
    this.getPais();
    this.getPaisEN();
    this.setFilters();
    this.setFilters1();
    this.setFilters2();
    this.setFilters3();
  }

  setFilters() {
    this.filteredOptions = this.ciudadesControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value)),
    );
  }

  setFilters1() {
    this.filteredOptions1 = this.ciudadesENControl.valueChanges.pipe(
      startWith(""),
      map((value1) => this._filter1(value1)),
    );
  }

  setFilters2() {
    this.filteredOptions2 = this.paisControl.valueChanges.pipe(
      startWith(""),
      map((value2) => this._filter2(value2)),
    );
  }

  setFilters3() {
    this.filteredOptions3 = this.paisENControl.valueChanges.pipe(
      startWith(""),
      map((value3) => this._filter3(value3)),
    );
  }

  getCiudad() {
    this._eventoService.getCiudades().subscribe((res) => {
      this.ciudades = res;
    });
  }

  getCiudadEN() {
    this._eventoService.getCiudadesEN().subscribe((res) => {
      this.ciudadesEN = res;
    });
  }

  getPais() {
    this._eventoService.getPais().subscribe((res) => {
      this.pais = res;
    });
  }

  getPaisEN() {
    this._eventoService.getPaisEN().subscribe((res) => {
      this.paisEN = res;
    });
  }

  agregar;

  submitEvento() {
    this._eventoService.addEvento(this.evento).subscribe((result) => {
      if (result.status == 1) {
        this.return();
        this.openSnackBar();
        this.agregar = true;
      }
    });
  }

  return() {
    this._commonService.setEndSession("0");
    this._router.navigate(["dashboard/eventos"]);
  }

  openSnackBar() {
    this._snackBar.open("Evento agregado exitosamente", null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef: MatDialogRef<DialogCancel8>;

  openDialog() {
    this.dialogRef = this.dialog.open(DialogCancel8, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "¿Estás seguro que deseas volver sin guardar?",
        text: "La información no se guardará",
        cancel: "Sí, volver",
        yes: "No, mantenerme aquí",
      },
    });
  }

  canDeactivate(): Observable<boolean> {
    if (!this.agregar) {
      this.openDialog();
      return this.dialogRef.afterClosed().pipe(
        map((result) => {
          return result === true;
        }),
      );
    } else {
      return;
    }
  }

  notCanDo;
  openEraser() {}
  edit;
}

@Component({
  standalone: false,
  selector: "dialog-content-example-dialog",
  templateUrl: "../modals/dialog-options.html",
})
export class DialogCancel8 {
  constructor(
    public dialogRef: MatDialogRef<DialogCancel8>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
