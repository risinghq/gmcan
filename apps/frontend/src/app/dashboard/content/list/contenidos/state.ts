import { inject, Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import type { About } from "@app/shared/models/about";
import type { Equipment } from "@app/shared/models/equipment";
import { createGroup, type Group } from "@app/shared/models/factories";
import type { Method } from "@app/shared/models/method";
import type { ResearchLine } from "@app/shared/models/research-line";
import type { Software } from "@app/shared/models/software";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { ClassicEditor } from "ckeditor5";

import { DialogAboutPreview } from "./dialogs/about";
import { DialogFuturePreview } from "./dialogs/future";
import { ContenidosFiles, type FileSlot } from "./files";
import { type PreviewAboutData, type PreviewFutureData } from "./models";
import { applyTableFilter, attachTable, makeDataSource } from "./table";

@Injectable()
export class ContenidosState {
  private static readonly CONTENT_UPDATED_MESSAGE = "Contenido actualizado exitosamente";
  private static readonly INFO_UPDATED_MESSAGE = "Información actualizada exitosamente";

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly methodsService = inject(MethodsService);
  private readonly groupService = inject(GroupService);
  private readonly tabState = inject(TabStateService);

  readonly files = new ContenidosFiles();
  readonly Editor = ClassicEditor;
  readonly url = GLOBAL.url;

  readonly displayedColumns: string[] = ["nombre"];
  readonly displayedColumns2: string[] = ["nombre"];
  selectedTab = 0;

  aboutUs: About = {
    id: 0,
    descriptionES: "",
    descriptionEN: "",
    objectivesES: null,
    objectivesEN: null,
    servicesES: null,
    servicesEN: null,
    photo: null,
    groupId: 0,
    createdAt: null,
    updatedAt: null,
  };
  group: Group = createGroup();

  descripcionForm: FormGroup = this.formBuilder.group({
    descriptionES: ["", Validators.required],
    descriptionEN: ["", Validators.required],
    photo: ["", Validators.required],
  });
  objetivosForm: FormGroup = this.formBuilder.group({
    objectivesES: ["", Validators.required],
    objectivesEN: ["", Validators.required],
  });
  serviciosForm: FormGroup = this.formBuilder.group({
    servicesES: ["", Validators.required],
    servicesEN: ["", Validators.required],
  });
  facilidadesRecursosForm: FormGroup = this.formBuilder.group({
    facilitiesES: ["", Validators.required],
    facilitiesEN: ["", Validators.required],
    facilitiesPhoto: ["", Validators.required],
  });
  trabajosFuturosForm: FormGroup = this.formBuilder.group({
    futureWorkES: ["", Validators.required],
    futureWorkEN: ["", Validators.required],
  });
  footerForm: FormGroup = this.formBuilder.group({
    email: ["", Validators.required],
    phone: ["", Validators.required],
  });
  presentacionForm: FormGroup = this.formBuilder.group({
    summaryES: ["", Validators.required],
    summaryEN: ["", Validators.required],
  });
  publicacionesForm: FormGroup = this.formBuilder.group({
    publicationsSectionES: ["", Validators.required],
    publicationsSectionEN: ["", Validators.required],
  });
  proyectosForm: FormGroup = this.formBuilder.group({
    projectsSectionES: ["", Validators.required],
    projectsSectionEN: ["", Validators.required],
  });

  dataSource = new MatTableDataSource<ResearchLine>([]);
  dataSource2 = new MatTableDataSource<Method>([]);
  dataSource3 = new MatTableDataSource<Equipment>([]);
  dataSource4 = new MatTableDataSource<Software>([]);

  displayedNotFound = false;
  displayedNotFound2 = false;
  displayedNotFound3 = false;
  displayedNotFound4 = false;

  init(): void {
    this.selectedTab = this.tabState.contenidosTab();
    this.groupService.listGroups().subscribe((res) => {
      if (res.length > 0) {
        this.group = res[0];
        this.getContenidos();
        this.getEquipos();
        this.getSoftware();
      }
    });
  }

  setTab(index: number): void {
    this.selectedTab = index;
    this.tabState.contenidosTab.set(index);
  }

  connectTable1(sort: MatSort, paginator: MatPaginator): void {
    attachTable(this.dataSource, sort, paginator);
  }
  connectTable2(sort: MatSort, paginator: MatPaginator): void {
    attachTable(this.dataSource2, sort, paginator);
  }
  connectTable3(sort: MatSort, paginator: MatPaginator): void {
    attachTable(this.dataSource3, sort, paginator);
  }
  connectTable4(sort: MatSort, paginator: MatPaginator): void {
    attachTable(this.dataSource4, sort, paginator);
  }

  getLineasInvestigacion(): void {
    this.researchLinesService.listAdmin().subscribe((res) => {
      if (res.length > 0) {
        this.dataSource = makeDataSource(res, (item) => item.name);
      }
    });
  }

  getMetodos(): void {
    this.methodsService.listAdmin().subscribe((res) => {
      if (res.length > 0) {
        this.dataSource2 = makeDataSource(res, (item) => item.name);
      }
    });
  }

  applyFilter(event: Event): void {
    this.displayedNotFound = applyTableFilter(event, this.dataSource);
  }
  applyFilter2(event: Event): void {
    this.displayedNotFound2 = applyTableFilter(event, this.dataSource2);
  }
  applyFilter3(event: Event): void {
    this.displayedNotFound3 = applyTableFilter(event, this.dataSource3);
  }
  applyFilter4(event: Event): void {
    this.displayedNotFound4 = applyTableFilter(event, this.dataSource4);
  }

  fileProgress(fileInput: Event, slot: FileSlot): void {
    const target = fileInput.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.files.set(slot, file);
    this.files.updatePreview(slot);
  }

  getContenidos(): void {
    this.groupService.listAbout(this.group.id).subscribe((res) => {
      if (res.length > 0) {
        this.aboutUs = res[0];
      }
    });
  }

  submitQuienesSomos(): void {
    this.groupService
      .updateAboutDescription(this.aboutUs.id, {
        descriptionES: this.aboutUs.descriptionES,
        descriptionEN: this.aboutUs.descriptionEN,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          const file = this.files.get("about");
          if (file) this.groupService.uploadAboutPhoto(this.aboutUs.id, file).subscribe();
          this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
        }
      });
  }

  submitObjetivos(): void {
    this.groupService
      .updateAboutObjectives(this.aboutUs.id, {
        objectivesES: this.aboutUs.objectivesES ?? undefined,
        objectivesEN: this.aboutUs.objectivesEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
      });
  }

  submitServicios(): void {
    this.groupService
      .updateAboutServices(this.aboutUs.id, {
        servicesES: this.aboutUs.servicesES ?? undefined,
        servicesEN: this.aboutUs.servicesEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
      });
  }

  submitFacilidadesyRecursos(): void {
    this.groupService
      .updateFacilities(this.group.id, {
        facilitiesES: this.group.facilitiesES ?? undefined,
        facilitiesEN: this.group.facilitiesEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          const file = this.files.get("fac");
          if (file) this.groupService.uploadFile(this.group.id, "facilities", file).subscribe();
          this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
        }
      });
  }

  submitTrabajosFuturos(): void {
    this.groupService
      .updateFutureWork(this.group.id, {
        futureWorkES: this.group.futureWorkES ?? undefined,
        futureWorkEN: this.group.futureWorkEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
      });
  }

  submitSeccionInfo(): void {
    this.groupService
      .updateInfo(this.group.id, {
        email: this.group.email ?? undefined,
        phone: this.group.phone ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          const headFile = this.files.get("head");
          const footFile = this.files.get("foot");
          if (headFile) this.groupService.uploadFile(this.group.id, "header", headFile).subscribe();
          if (footFile) this.groupService.uploadFile(this.group.id, "footer", footFile).subscribe();
          this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
        }
      });
  }

  submitSeccionPresentacion(): void {
    this.groupService
      .updateSummary(this.group.id, { summaryES: this.group.summaryES, summaryEN: this.group.summaryEN })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
      });
  }

  submitSeccionPublicaciones(): void {
    this.groupService
      .updatePublicationsSection(this.group.id, {
        publicationsSectionES: this.group.publicationsSectionES ?? undefined,
        publicationsSectionEN: this.group.publicationsSectionEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
      });
  }

  submitSeccionProyectos(): void {
    this.groupService
      .updateProjectsSection(this.group.id, {
        projectsSectionES: this.group.projectsSectionES ?? undefined,
        projectsSectionEN: this.group.projectsSectionEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
      });
  }

  getEquipos(): void {
    this.groupService.listEquipment(this.group.id).subscribe((res) => {
      const items = res as Equipment[];
      if (items.length > 0) this.dataSource3 = makeDataSource(items, (item) => item.name);
    });
  }

  getSoftware(): void {
    this.groupService.listSoftware(this.group.id).subscribe((res) => {
      const items = res as Software[];
      if (items.length > 0) this.dataSource4 = makeDataSource(items, (item) => item.name ?? "");
    });
  }

  previewAbout(languageIndex: 0 | 1): void {
    const about = structuredClone(this.aboutUs);
    if (languageIndex === 1) {
      about.objectivesES = about.objectivesEN;
      about.servicesES = about.servicesEN;
      about.descriptionES = about.descriptionEN;
    }
    const data: PreviewAboutData = { about, languageIndex };
    this.dialog.open(DialogAboutPreview, { width: "871px", id: "previewAboutUs", data }).afterClosed().subscribe();
  }

  previewFuture(languageIndex: 0 | 1): void {
    const group = structuredClone(this.group);
    if (languageIndex === 1) group.futureWorkES = group.futureWorkEN;
    const data: PreviewFutureData = { group, languageIndex };
    this.dialog
      .open(DialogFuturePreview, { width: "871px", id: "previewTrabajosFuturos", data })
      .afterClosed()
      .subscribe();
  }

  addLinea(): void {
    this.router.navigate(["dashboard/add-linea"]);
  }
  addMethod(): void {
    this.router.navigate(["dashboard/add-method"]);
  }
  addEquipo(): void {
    this.router.navigate(["dashboard/add-equipo"]);
  }
  addSoftware(): void {
    this.router.navigate(["dashboard/add-software"]);
  }
  editLinea(id: number): void {
    this.router.navigate(["dashboard/edit-linea/" + id]);
  }
  editMethod(id: number): void {
    this.router.navigate(["dashboard/edit-method/" + id]);
  }
  editEquipo(id: number): void {
    this.router.navigate(["dashboard/edit-equipo/" + id]);
  }
  editSoftware(id: number): void {
    this.router.navigate(["dashboard/edit-software/" + id]);
  }

  private openSnackBar(value: string): void {
    this.snackBar.open(value, undefined, { duration: 2000, horizontalPosition: "right", verticalPosition: "top" });
  }
}
