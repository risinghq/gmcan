import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { createProject } from "@app/shared/models/factories";
import type { Member } from "@app/shared/models/member";
import type { Project } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { ProjectService, type ProjectBody } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { AutosizeModule } from "ngx-autosize";
import { forkJoin, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { startWith, map } from "rxjs/operators";

interface MemberOption {
  id: number;
  name: string;
}

interface ProjectMemberRow {
  id: number;
  memberId: number | null;
  name: string;
  myControl: FormControl<string>;
  filteredOptions?: Observable<MemberOption[]>;
}

@Component({
  selector: "app-add-proyecto",
  templateUrl: "./add-proyecto.component.html",
  styleUrl: "./add-proyecto.component.scss",
  providers: [provideNativeDateAdapter()],
  imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    AutosizeModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatAutocompleteTrigger,
    MatAutocomplete,
    AsyncPipe,
  ],
})
export default class AddProyectoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _memberService = inject(MemberService);
  private _researchLinesService = inject(ResearchLinesService);
  lookup = inject(LookupService);
  private _projectService = inject(ProjectService);
  dialog = inject(MatDialog);

  terminado = false;
  edit = false;
  button_text = "Guardar proyecto";
  memberOptions: MemberOption[] = [];
  researchLines: ResearchLine[] = [];
  proyecto: Project & { startDateObj?: Date; endDateObj?: Date };
  proyectoForm: FormGroup;
  get monedas() {
    return this.lookup.monedas();
  }
  get fundingSources() {
    return this.lookup.fundingSources();
  }
  url: string;

  disableSelect = false;
  openEraser() {}
  projectEnd() {}

  miembrosProyecto: ProjectMemberRow[] = [];

  constructor() {
    this.proyectoForm = this.formBuilder.group({
      título: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      títuloEN: [""],
      codigo: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaInicio: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      researchLineId: ["", [Validators.required]],
      fundingSourceId: ["", [Validators.required]],
      currencyId: ["", [Validators.required]],
      descripcion: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      descripcionEN: [""],
      montoFinanciado: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fechaFin: [""],
    });
    this.proyecto = { ...createProject() };
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.loadResearchLines();
  }

  isDirty(): boolean {
    return this.proyectoForm.dirty;
  }

  loadResearchLines(): void {
    this._researchLinesService.listAdmin().subscribe((result: ResearchLine[]) => {
      if (result) {
        this.researchLines = result;
        this.loadMembers();
      }
    });
  }

  loadMembers(): void {
    this._memberService.listAdminMembers().subscribe((result: Member[]) => {
      if (result) {
        const sortedMembers = result.toSorted((a, b) => a.firstName.localeCompare(b.firstName));
        this.memberOptions = sortedMembers.map((m) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}${m.maternalName ? " " + m.maternalName : ""}`.trim(),
        }));
        this.miembrosProyecto = [this.newMemberRow()];
        this.setupMemberFilters();
      }
    });
  }

  private newMemberRow(): ProjectMemberRow {
    return {
      id: this.miembrosProyecto.length + 1,
      memberId: null,
      name: "",
      myControl: new FormControl<string>("", { nonNullable: true }),
    };
  }

  private setupMemberFilters(): void {
    for (const row of this.miembrosProyecto) {
      row.filteredOptions = row.myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterMembers(v ?? "")),
      );
    }
  }

  private filterMembers(value: string): MemberOption[] {
    const lower = value.toLowerCase();
    return this.memberOptions.filter((m) => m.name.toLowerCase().includes(lower));
  }

  return(): void {
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(): void {
    this._snackBar.open("Proyecto agregado exitosamente", undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  addAnotherMember(): void {
    const row = this.newMemberRow();
    row.filteredOptions = row.myControl.valueChanges.pipe(
      startWith(""),
      map((v) => this.filterMembers(v ?? "")),
    );
    this.miembrosProyecto.push(row);
  }

  removeAnotherMember(i: number): void {
    if (i === 0 && this.miembrosProyecto.length === 1) {
      this.miembrosProyecto[0] = this.newMemberRow();
      this.miembrosProyecto[0].filteredOptions = this.miembrosProyecto[0].myControl.valueChanges.pipe(
        startWith(""),
        map((v) => this.filterMembers(v ?? "")),
      );
    } else {
      this.miembrosProyecto.splice(i, 1);
    }
  }

  selectMember(option: MemberOption | { value?: string }, i: number): void {
    if ("id" in option) {
      this.miembrosProyecto[i].memberId = option.id;
      this.miembrosProyecto[i].name = option.name;
      this.miembrosProyecto[i].myControl.setValue(option.name);
    } else {
      const name = (option as { value?: string }).value ?? "";
      const found = this.memberOptions.find((m) => m.name === name) ?? null;
      this.miembrosProyecto[i].memberId = found?.id ?? null;
      this.miembrosProyecto[i].name = name;
    }
  }

  submitProyecto(): void {
    if (!this.proyectoForm.valid) return;

    const startDate = new Date(this.proyecto.startDateObj ?? new Date()).toLocaleDateString("sv");
    const endDate = this.proyecto.endDateObj ? new Date(this.proyecto.endDateObj).toLocaleDateString("sv") : undefined;

    const body: ProjectBody = {
      title: this.proyecto.title,
      titleEN: this.proyecto.titleEN ?? undefined,
      code: this.proyecto.code,
      fundedAmount: this.proyecto.fundedAmount,
      description: this.proyecto.description,
      descriptionEN: this.proyecto.descriptionEN ?? undefined,
      startDate,
      endDate,
      researchLineId: this.proyecto.researchLineId,
      currencyId: this.proyecto.currencyId,
      fundingSourceId: this.proyecto.fundingSourceId,
    };

    this._projectService
      .createProject(body)
      .pipe(
        switchMap((result) => {
          if (!result.id) return of(result);
          const projectId = result.id;
          const memberIds = [
            ...new Set(this.miembrosProyecto.map((row) => row.memberId).filter((id): id is number => id != null)),
          ];
          if (memberIds.length === 0) return of(result);
          return forkJoin(memberIds.map((memberId) => this._projectService.addProjectMember(projectId, memberId))).pipe(
            map(() => result),
          );
        }),
      )
      .subscribe({
        next: (result) => {
          if (!result.id) return;
          this.proyectoForm.markAsPristine();
          this.return();
          this.openSnackBar();
        },
        error: () => {
          this.openSnackBarError("No se pudo completar el registro de miembros del proyecto");
        },
      });
  }

  openSnackBarError(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  button_text2 = "";
}
