import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import type { ResearchLine } from "@app/shared/models/research-line";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService, type ProjectBody } from "@app/shared/services/project.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { toIsoDate } from "@app/shared/utils/date";
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIcon,
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
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private snackBar = inject(MatSnackBar);
  lookup = inject(LookupService);
  private projectService = inject(ProjectService);

  terminado = false;
  edit = false;
  button_text = "Guardar proyecto";
  memberOptions: MemberOption[] = [];
  researchLines: ResearchLine[] = [];
  proyectoForm: FormGroup;
  get monedas() {
    return this.lookup.currencies();
  }
  get fundingSources() {
    return this.lookup.fundingSources();
  }

  disableSelect = false;
  openEraser() {}
  projectEnd() {}

  miembrosProyecto: ProjectMemberRow[] = [];

  constructor() {
    this.proyectoForm = this.formBuilder.group({
      title: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      code: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      startDate: [null, [Validators.required]],
      researchLineId: ["", [Validators.required]],
      fundingSourceCode: ["", [Validators.required]],
      currencyCode: ["", [Validators.required]],
      description: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      fundedAmountMinor: ["", [Validators.required, SpaceValidator.cannotContainSpace]],
      endDate: [null],
    });
  }

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    this.researchLines = data["researchLines"] as ResearchLine[];
    const members = (data["members"] as AdminMemberListItem[]).toSorted((a, b) =>
      a.firstName.localeCompare(b.firstName),
    );
    this.memberOptions = members.map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}${m.maternalName ? " " + m.maternalName : ""}`.trim(),
    }));
    this.miembrosProyecto = [this.newMemberRow()];
    this.setupMemberFilters();
  }

  isDirty(): boolean {
    return this.proyectoForm.dirty;
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
    this.router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(): void {
    this.snackBar.open("Proyecto agregado exitosamente", undefined, {
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

  selectMember(option: MemberOption | { value?: string } | string, i: number): void {
    if (typeof option === "string") {
      const found = this.memberOptions.find((m) => m.name === option) ?? null;
      this.miembrosProyecto[i].memberId = found?.id ?? null;
      this.miembrosProyecto[i].name = option;
      this.miembrosProyecto[i].myControl.setValue(option);
    } else if ("id" in option) {
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

    this.projectService
      .createProject(this.buildProjectBody())
      .pipe(
        switchMap((result) => {
          if (!result.id) return of(result);
          const projectId = result.id;
          const memberIds = [
            ...new Set(this.miembrosProyecto.map((row) => row.memberId).filter((id): id is number => id != null)),
          ];
          if (memberIds.length === 0) return of(result);
          return forkJoin(memberIds.map((memberId) => this.projectService.addProjectMember(projectId, memberId))).pipe(
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
    this.snackBar.open(value, undefined, {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  private buildProjectBody(): ProjectBody {
    const form = this.proyectoForm.getRawValue() as {
      title: string;
      code: string;
      startDate: Date | null;
      researchLineId: number;
      fundingSourceCode: "vrip" | "none";
      currencyCode: "pen" | "usd";
      description: string;
      fundedAmountMinor: string;
      endDate: Date | null;
    };

    return {
      code: form.code,
      fundedAmountMinor: Number(form.fundedAmountMinor),
      startDate: toIsoDate(form.startDate ?? new Date()),
      endDate: form.endDate ? toIsoDate(form.endDate) : undefined,
      researchLineId: form.researchLineId,
      currencyCode: form.currencyCode,
      fundingSourceCode: form.fundingSourceCode,
      translations: { es: { title: form.title, description: form.description } },
    };
  }

  button_text2 = "";
}
