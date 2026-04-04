import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { Evento } from "@app/shared/models/eventos";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { EventoService } from "@app/shared/services/evento.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-add-evento",
  templateUrl: "./add-evento.component.html",
  styleUrl: "./add-evento.component.scss",
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
    AsyncPipe,
  ],
})
export default class AddEventoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _eventoService = inject(EventoService);

  evento: Evento;
  public eventoForm: FormGroup;
  button_text = "Guardar evento";

  constructor() {
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

  ngOnInit(): void {
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

  isDirty(): boolean {
    return this.eventoForm.dirty;
  }

  submitEvento(): void {
    this._eventoService.addEvento(this.evento).subscribe((result: any) => {
      if (result.status == 1) {
        this.eventoForm.markAsPristine();
        this.return();
        this.openSnackBar();
      }
    });
  }

  return(): void {
    this._router.navigate(["dashboard/eventos"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Evento agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  notCanDo = false;
  openEraser() {}
  edit = false;
}
