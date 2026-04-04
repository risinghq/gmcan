import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass, AsyncPipe } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
import type { Evento } from "@app/shared/models/eventos";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EventoService } from "@app/shared/services/evento.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-edit-evento",
  templateUrl: "../add/add-evento.component.html",
  styleUrls: ["../add/add-evento.component.scss"],
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatAutocompleteTrigger,
    MatLabel,
    MatAutocomplete,
    MatOption,
    NgClass,
    AsyncPipe,
  ],
})
export default class EditEventoComponent implements OnInit, HasUnsavedChanges {
  evento: Evento;
  public eventoForm: FormGroup;
  button_text = "Actualizar evento";
  edit = true;

  constructor(
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _eventoService: EventoService,
    private _publicacionService: PublicacionService,
  ) {
    this.evento = { idEvento: 0, nombre: "", paisEN: "", pais: "", ciudad: "", ciudadEN: "" };
    this.eventoForm = this.formBuilder.group({
      nombre: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      pais: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      paisEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudad: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      ciudadEN: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
    });
  }

  ciudadesControl = new FormControl<string>("");
  ciudades: Array<any> = [];
  filteredOptions!: Observable<any>;
  filteredOptions1!: Observable<any>;
  ciudadesENControl = new FormControl<string>("");
  ciudadesEN: Array<any> = [];
  filteredOptions2!: Observable<any>;
  paisControl = new FormControl<string>("");
  pais: Array<any> = [];
  filteredOptions3!: Observable<any>;
  paisENControl = new FormControl<string>("");
  paisEN: Array<any> = [];

  private _filter(value: string): any {
    const filterValue = value.toLowerCase();
    return this.ciudades.filter((ciudad) => ciudad.ciudad.toLowerCase().includes(filterValue));
  }
  private _filter1(value: string): any {
    const filterValue1 = value.toLowerCase();
    return this.ciudadesEN.filter((ciudadEN) => ciudadEN.ciudadEN.toLowerCase().includes(filterValue1));
  }
  private _filter2(value: string): any {
    const filterValue2 = value.toLowerCase();
    return this.pais.filter((pais) => pais.pais.toLowerCase().includes(filterValue2));
  }
  private _filter3(value: string): any {
    const filterValue3 = value.toLowerCase();
    return this.paisEN.filter((paisEN) => paisEN.paisEN.toLowerCase().includes(filterValue3));
  }

  setFilters() {
    this.filteredOptions = this.ciudadesControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value ?? "")),
    );
  }

  setFilters1() {
    this.filteredOptions1 = this.ciudadesENControl.valueChanges.pipe(
      startWith(""),
      map((value1) => this._filter1(value1 ?? "")),
    );
  }

  setFilters2() {
    this.filteredOptions2 = this.paisControl.valueChanges.pipe(
      startWith(""),
      map((value2) => this._filter2(value2 ?? "")),
    );
  }

  setFilters3() {
    this.filteredOptions3 = this.paisENControl.valueChanges.pipe(
      startWith(""),
      map((value3) => this._filter3(value3 ?? "")),
    );
  }

  getCiudad(): void {
    this._eventoService.getCiudades().subscribe((res: any[]) => {
      this.ciudades = res;
    });
  }

  getCiudadEN(): void {
    this._eventoService.getCiudadesEN().subscribe((res: any[]) => {
      this.ciudadesEN = res;
    });
  }

  getPais(): void {
    this._eventoService.getPais().subscribe((res: any[]) => {
      this.pais = res;
    });
  }

  getPaisEN(): void {
    this._eventoService.getPaisEN().subscribe((res: any[]) => {
      this.paisEN = res;
    });
  }

  ngOnInit(): void {
    this.getEvento();
    this.getCiudad();
    this.getCiudadEN();
    this.getPais();
    this.getPaisEN();
    this.setFilters();
    this.setFilters1();
    this.setFilters2();
    this.setFilters3();
  }

  getEvento(): void {
    this._route.params.forEach((params: Params) => {
      let idEvento = params["id"];
      this._eventoService.getEvento(idEvento).subscribe((result: Evento[]) => {
        if (result) {
          this.evento = result[0];
          localStorage.setItem("eventoEdit", JSON.stringify(this.evento.nombre));
          this.getPublicacionEvento(idEvento);
        }
      });
    });
  }

  isDirty(): boolean {
    return this.eventoForm.dirty;
  }

  notCanDo = false;

  getPublicacionEvento(idEvento: number): void {
    this._publicacionService.getPublicacionesEvento(idEvento).subscribe((result: any[]) => {
      if (result.length == 0) {
        this.notCanDo = true;
      }
    });
  }

  submitEvento(): void {
    this._eventoService.updateEvento(this.evento).subscribe((result: any) => {
      if (result.status == 1) {
        this.eventoForm.markAsPristine();
        this.return();
        this.openSnackBar("Evento actualizado exitosamente");
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/eventos"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase5>;

  openEraser(): void {
    if (this.notCanDo) {
      this.dialogRef2 = this.dialog.open(DialogErase5, {
        width: "530px",
        id: "idleTimer",
        data: {
          title: "Eliminar evento",
          text: "¿Estás seguro que deseas eliminar este evento?",
          cancel: "Sí, eliminar",
          yes: "No, cancelar",
        },
      });
      this.dialogRef2.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.eraseNews();
        }
      });
    }
  }

  eraseNews(): void {
    if (this.notCanDo) {
      this._eventoService.deleteEvento(this.evento.idEvento ?? 0).subscribe((result: any) => {
        if (result.status == 1) {
          this.eventoForm.markAsPristine();
          this.return();
          this.openSnackBar("Evento eliminado exitosamente");
        } else {
          this.openSnackBar("Hubo un problema al eliminar");
        }
      });
    }
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase5 {
  constructor(
    public dialogRef: MatDialogRef<DialogErase5>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }
}
