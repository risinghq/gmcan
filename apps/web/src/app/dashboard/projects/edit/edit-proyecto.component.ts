import { CdkScrollable } from "@angular/cdk/scrolling";
import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
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
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import { DialogData } from "@app/shared/models/dialogdata";
import type { Project } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import { HasUnsavedChanges } from "@app/shared/models/unsaved-changes";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { ProjectService, type ProjectBody } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SpaceValidator } from "@app/shared/services/spacevalidator";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { parseLocalDate, requireLocalDate, toIsoDate } from "@app/shared/utils/date";
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
export default class EditProyectoComponent implements OnInit, HasUnsavedChanges {
  formBuilder = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private memberService = inject(MemberService);
  private researchLinesService = inject(ResearchLinesService);
  lookup = inject(LookupService);
  private projectService = inject(ProjectService);
  dialog = inject(MatDialog);
  private tabState = inject(TabStateService);

  edit = true;
  terminado = false;
  button_text = "Actualizar información";
  button_text2 = "Concluir proyecto";
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
  private projectId = 0;
  private projectStatus: Project["statusCode"] | null = null;

  miembrosProyecto: ProjectMemberRow[] = [];
  private originalMemberIds: number[] = [];

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
    const resolved = this.route.snapshot.data["project"] as Project;
    this.bindProject(resolved);
    this.loadResearchLines();
    this.loadProjectMembers(this.projectId);
  }

  isDirty(): boolean {
    return this.proyectoForm.dirty;
  }

  private bindProject(result: Project): void {
    this.projectId = result.id;
    this.projectStatus = result.statusCode;
    this.proyectoForm.patchValue({
      title: result.title,
      code: result.code,
      startDate: requireLocalDate(result.startDate, "project.startDate"),
      researchLineId: result.researchLineId,
      fundingSourceCode: result.fundingSourceCode,
      currencyCode: result.currencyCode,
      description: result.description,
      fundedAmountMinor: result.fundedAmountMinor,
      endDate: parseLocalDate(result.endDate ?? undefined) ?? null,
    });
    if (result.statusCode === "completed") {
      this.terminado = true;
      this.disableSelect = true;
      this.button_text2 = "Reactivar proyecto";
      this.proyectoForm.disable();
      this.proyectoForm.controls["endDate"]?.enable();
    }
  }

  loadResearchLines(): void {
    this.researchLinesService.listAdmin().subscribe((result: ResearchLine[]) => {
      if (result) {
        this.researchLines = result;
        this.loadMembers();
      }
    });
  }

  loadMembers(): void {
    this.memberService.listAdminMembers().subscribe((result: AdminMemberListItem[]) => {
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
    this.projectService.getProjectMembers(projectId).subscribe((members) => {
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

  return(): void {
    this.tabState.projectTab.set(0);
    this.router.navigate(["dashboard/proyectos-ejecucion"]);
  }

  openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  submitProyecto(): void {
    if (!this.proyectoForm.valid) return;

    this.projectService.updateProject(this.projectId, this.buildProjectBody()).subscribe((res) => {
      if (res.status === 1) {
        const newMemberIds = this.miembrosProyecto.filter((r) => r.memberId != null).map((r) => r.memberId as number);
        const toRemove = this.originalMemberIds.filter((id) => !newMemberIds.includes(id));
        const toAdd = newMemberIds.filter((id) => !this.originalMemberIds.includes(id));
        for (const memberId of toRemove) {
          this.projectService.removeProjectMember(this.projectId, memberId).subscribe();
        }
        for (const memberId of toAdd) {
          this.projectService.addProjectMember(this.projectId, memberId).subscribe();
        }
        this.proyectoForm.markAsPristine();
        this.return();
        this.openSnackBar("Proyecto actualizado exitosamente");
      }
    });
  }

  projectEnd(): void {
    const newStatus = this.projectStatus === "active" ? "completed" : "active";
    this.projectService
      .updateProject(this.projectId, this.buildProjectBody({ statusCode: newStatus }))
      .subscribe((result) => {
        if (result.status === 1) {
          this.proyectoForm.markAsPristine();
          this.return();
          this.openSnackBar(
            newStatus === "completed" ? "Proyecto concluido exitosamente" : "Proyecto reactivado exitosamente",
          );
        }
      });
  }

  eraseProject(): void {
    this.projectService.deleteProject(this.projectId).subscribe((result) => {
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

  private buildProjectBody(extra: Partial<ProjectBody> = {}): ProjectBody {
    const form = this.proyectoForm.getRawValue() as {
      title: string;
      code: string;
      startDate: Date | null;
      researchLineId: number;
      fundingSourceCode: "vrip" | "none";
      currencyCode: "pen" | "usd";
      description: string;
      fundedAmountMinor: number | string;
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
      ...extra,
    };
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/dialog-options.html",
  changeDetection: ChangeDetectionStrategy.Eager,
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
