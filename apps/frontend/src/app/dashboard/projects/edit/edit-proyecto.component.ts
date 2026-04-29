import { CdkScrollable } from "@angular/cdk/scrolling";
import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteTrigger, MatAutocomplete } from "@angular/material/autocomplete";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from "@angular/material/dialog";
import { MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogData } from "@app/shared/models/dialogdata";
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
import { TabStateService } from "@app/shared/services/tab-state.service";
import { AutosizeModule } from "ngx-autosize";
import { Observable } from "rxjs";
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
  selector: "app-edit-proyecto",
  templateUrl: "../add/add-proyecto.component.html",
  styleUrl: "../add/add-proyecto.component.scss",
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
export default class EditProyectoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _memberService = inject(MemberService);
  private _researchLinesService = inject(ResearchLinesService);
  lookup = inject(LookupService);
  private _projectService = inject(ProjectService);
  dialog = inject(MatDialog);
  private _tabState = inject(TabStateService);

  edit = true;
  terminado = false;
  button_text = "Actualizar información";
  button_text2 = "Concluir proyecto";
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

  miembrosProyecto: ProjectMemberRow[] = [];
  private originalMemberIds: number[] = [];

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
    this.loadProject();
  }

  isDirty(): boolean {
    return this.proyectoForm.dirty;
  }

  loadProject(): void {
    const id = Number(this._route.snapshot.params["id"]);
    this._projectService.getProject(id).subscribe((result: Project) => {
      if (result) {
        const d = new Date(result.startDate ?? new Date());
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        this.proyecto = {
          ...result,
          startDateObj: d,
          endDateObj: result.endDate
            ? (() => {
                const e = new Date(result.endDate!);
                e.setMinutes(e.getMinutes() + e.getTimezoneOffset());
                return e;
              })()
            : undefined,
        };
        localStorage.setItem("proyectoEdit", JSON.stringify(result.title ?? ""));
        if (result.status === 0) {
          this.terminado = true;
          this.disableSelect = true;
          this.button_text2 = "Reactivar proyecto";
          this.proyectoForm.disable();
          this.proyectoForm.controls["fechaFin"]?.enable();
        }
        this.loadResearchLines();
        this.loadProjectMembers(id);
      }
    });
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
        result.sort((a, b) => a.firstName.localeCompare(b.firstName));
        this.memberOptions = result.map((m) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}${m.maternalName ? " " + m.maternalName : ""}`.trim(),
        }));
      }
    });
  }

  loadProjectMembers(projectId: number): void {
    this._projectService.getProjectMembers(projectId).subscribe((members) => {
      const rows = members as { memberId: number; name: string }[];
      this.originalMemberIds = rows.map((r) => r.memberId);
      if (rows.length > 0) {
        this.miembrosProyecto = rows.map((r, i) => {
          const row: ProjectMemberRow = {
            id: i + 1,
            memberId: r.memberId,
            name: r.name,
            myControl: new FormControl<string>(r.name, { nonNullable: true }),
          };
          row.filteredOptions = row.myControl.valueChanges.pipe(
            startWith(r.name),
            map((v) => this.filterMembers(v ?? "")),
          );
          return row;
        });
      } else {
        this.miembrosProyecto = [this.newMemberRow()];
      }
    });
  }

  private newMemberRow(): ProjectMemberRow {
    const row: ProjectMemberRow = {
      id: this.miembrosProyecto.length + 1,
      memberId: null,
      name: "",
      myControl: new FormControl<string>("", { nonNullable: true }),
    };
    row.filteredOptions = row.myControl.valueChanges.pipe(
      startWith(""),
      map((v) => this.filterMembers(v ?? "")),
    );
    return row;
  }

  private filterMembers(value: string): MemberOption[] {
    const lower = value.toLowerCase();
    return this.memberOptions.filter((m) => m.name.toLowerCase().includes(lower));
  }

  addAnotherMember(): void {
    this.miembrosProyecto.push(this.newMemberRow());
  }

  removeAnotherMember(i: number): void {
    if (i === 0 && this.miembrosProyecto.length === 1) {
      this.miembrosProyecto[0] = this.newMemberRow();
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

  return(): void {
    this._tabState.projectTab.set(0);
    this._router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
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

    this._projectService.updateProject(this.proyecto.id, body).subscribe((res) => {
      if (res.status === 1) {
        const newMemberIds = this.miembrosProyecto.filter((r) => r.memberId != null).map((r) => r.memberId as number);
        const toRemove = this.originalMemberIds.filter((id) => !newMemberIds.includes(id));
        const toAdd = newMemberIds.filter((id) => !this.originalMemberIds.includes(id));
        for (const memberId of toRemove) {
          this._projectService.removeProjectMember(this.proyecto.id, memberId).subscribe(() => {});
        }
        for (const memberId of toAdd) {
          this._projectService.addProjectMember(this.proyecto.id, memberId).subscribe(() => {});
        }
        this.proyectoForm.markAsPristine();
        this.return();
        this.openSnackBar("Proyecto actualizado exitosamente");
      }
    });
  }

  projectEnd(): void {
    const newStatus = this.proyecto.status === 1 ? 0 : 1;
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
      status: newStatus,
    };
    this._projectService.updateProject(this.proyecto.id, body).subscribe((result) => {
      if (result.status === 1) {
        this.proyectoForm.markAsPristine();
        this.return();
        this.openSnackBar(newStatus === 0 ? "Proyecto concluido exitosamente" : "Proyecto reactivado exitosamente");
      }
    });
  }

  eraseProject(): void {
    this._projectService.deleteProject(this.proyecto.id).subscribe((result) => {
      if (result.status === 1) {
        this.proyectoForm.markAsPristine();
        this.return();
        this.openSnackBar("Proyecto eliminado exitosamente");
      } else {
        this.openSnackBar("Hubo un problema al eliminar");
      }
    });
  }

  private dialogRef2?: MatDialogRef<DialogErase10>;

  openEraser(): void {
    this.dialogRef2 = this.dialog.open(DialogErase10, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "Eliminar proyecto",
        text: "¿Estás seguro que deseas eliminar este proyecto?",
        cancel: "Sí, eliminar",
        yes: "No, cancelar",
      },
    });
    this.dialogRef2.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eraseProject();
      }
    });
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogErase10 {
  dialogRef = inject<MatDialogRef<DialogErase10>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  constructor() {
    const dialogRef = this.dialogRef;

    dialogRef.disableClose = true;
  }
}
