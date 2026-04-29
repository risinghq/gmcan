import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, viewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from "@angular/material/table";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import type { About } from "@app/shared/models/about";
import type { Equipment } from "@app/shared/models/equipment";
import { createGroup, type Group } from "@app/shared/models/factories";
import { Languages } from "@app/shared/models/languages";
import type { Method } from "@app/shared/models/method";
import type { ResearchLine } from "@app/shared/models/research-line";
import type { Software } from "@app/shared/models/software";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-contenidos",
  templateUrl: "./contenidos.component.html",
  styleUrl: "./contenidos.component.scss",
  imports: [
    MatTabGroup,
    MatTab,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    MatIcon,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    AutosizeModule,
  ],
})
export default class ContenidosComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _researchLinesService = inject(ResearchLinesService);
  private _metodosService = inject(MethodsService);
  private _groupService = inject(GroupService);
  private _tabState = inject(TabStateService);

  public Editor = ClassicEditor;
  displayedColumns: string[] = ["nombre"];
  displayedColumns2: string[] = ["nombre"];
  url: string;
  aboutUs: About;
  public descripcionForm: FormGroup;
  public objetivosForm: FormGroup;
  public serviciosForm: FormGroup;
  facilidadesRecursosForm: FormGroup;
  trabajosFuturosForm: FormGroup;
  footerForm: FormGroup;
  presentacionForm: FormGroup;
  publicacionesForm: FormGroup;
  proyectosForm: FormGroup;
  dataSource: MatTableDataSource<ResearchLine> = new MatTableDataSource<ResearchLine>([]);
  dataSource2: MatTableDataSource<Method> = new MatTableDataSource<Method>([]);
  dataSource3: MatTableDataSource<Equipment> = new MatTableDataSource<Equipment>([]);
  dataSource4: MatTableDataSource<Software> = new MatTableDataSource<Software>([]);
  group: Group;

  constructor() {
    this.aboutUs = {
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
    this.group = createGroup();
    this.descripcionForm = this.formBuilder.group({
      descriptionES: ["", Validators.required],
      descriptionEN: ["", Validators.required],
      photo: ["", Validators.required],
    });
    this.objetivosForm = this.formBuilder.group({
      objectivesES: ["", Validators.required],
      objectivesEN: ["", Validators.required],
    });
    this.serviciosForm = this.formBuilder.group({
      servicesES: ["", Validators.required],
      servicesEN: ["", Validators.required],
    });
    this.facilidadesRecursosForm = this.formBuilder.group({
      facilitiesES: ["", Validators.required],
      facilitiesEN: ["", Validators.required],
      facilitiesPhoto: ["", Validators.required],
    });
    this.trabajosFuturosForm = this.formBuilder.group({
      futureWorkES: ["", Validators.required],
      futureWorkEN: ["", Validators.required],
    });
    this.footerForm = this.formBuilder.group({
      email: ["", Validators.required],
      phone: ["", Validators.required],
    });
    this.presentacionForm = this.formBuilder.group({
      summaryES: ["", Validators.required],
      summaryEN: ["", Validators.required],
    });
    this.publicacionesForm = this.formBuilder.group({
      publicationsSectionES: ["", Validators.required],
      publicationsSectionEN: ["", Validators.required],
    });
    this.proyectosForm = this.formBuilder.group({
      projectsSectionES: ["", Validators.required],
      projectsSectionEN: ["", Validators.required],
    });
    this.url = GLOBAL.url;
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  readonly paginator3 = viewChild.required(MatPaginator);
  readonly sort3 = viewChild.required(MatSort);

  readonly paginator4 = viewChild.required(MatPaginator);
  readonly sort4 = viewChild.required(MatSort);

  selectedTab = 0;
  displayedNotFound = false;
  displayedNotFound2 = false;
  displayedNotFound3 = false;
  displayedNotFound4 = false;

  ngOnInit(): void {
    this.selectedTab = this._tabState.contenidosTab();
    this._groupService.listGroups().subscribe((res) => {
      if (res.length > 0) {
        this.group = res[0];
        this.getContenidos();
        this.getEquipos();
        this.getSoftware();
      }
    });
    this.getLineasInvestigación();
    this.getMetodos();
  }

  changedTab(event: number): void {
    this._tabState.contenidosTab.set(event);
  }

  getLineasInvestigación(): void {
    this._researchLinesService.listAdmin().subscribe((res: ResearchLine[]) => {
      if (res.length > 0) {
        res.sort((a, b) => (a.name > b.name ? 1 : b.name < a.name ? -1 : 0));
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.matSort();
        this.dataSource.paginator = this.paginator();
      }
    });
  }

  addLinea(): void {
    this._router.navigate(["dashboard/add-linea"]);
  }

  addMethod(): void {
    this._router.navigate(["dashboard/add-method"]);
  }

  addEquipo(): void {
    this._router.navigate(["dashboard/add-equipo"]);
  }

  addSoftware(): void {
    this._router.navigate(["dashboard/add-software"]);
  }

  editLinea(id: number): void {
    this._router.navigate(["dashboard/edit-linea/" + id]);
  }

  editMethod(id: number): void {
    this._router.navigate(["dashboard/edit-method/" + id]);
  }

  editEquipo(id: number): void {
    this._router.navigate(["dashboard/edit-equipo/" + id]);
  }

  editSoftware(id: number): void {
    this._router.navigate(["dashboard/edit-software/" + id]);
  }

  getMetodos(): void {
    this._metodosService.listAdmin().subscribe((res: Method[]) => {
      if (res.length > 0) {
        res.sort((a, b) => (a.name > b.name ? 1 : b.name < a.name ? -1 : 0));
        this.dataSource2 = new MatTableDataSource(res);
        this.dataSource2.sort = this.sort2();
        this.dataSource2.paginator = this.paginator2();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.displayedNotFound = this.dataSource.filteredData.length === 0;
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    this.displayedNotFound2 = this.dataSource2.filteredData.length === 0;
  }

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
    this.displayedNotFound3 = this.dataSource3.filteredData.length === 0;
  }

  applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
    this.displayedNotFound4 = this.dataSource4.filteredData.length === 0;
  }

  getContenidos(): void {
    this._groupService.listAbout(this.group.id).subscribe((res: About[]) => {
      if (res.length > 0) {
        this.aboutUs = res[0];
      }
    });
  }

  submitQuienesSomos(): void {
    this._groupService
      .updateAboutDescription(this.aboutUs.id, {
        descriptionES: this.aboutUs.descriptionES,
        descriptionEN: this.aboutUs.descriptionEN,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          if (this.fileData) {
            this._groupService.uploadAboutPhoto(this.aboutUs.id, this.fileData).subscribe(() => {});
          }
          this.openSnackBar("Contenido actualizado exitosamente");
        }
      });
  }

  submitObjetivos(): void {
    this._groupService
      .updateAboutObjectives(this.aboutUs.id, {
        objectivesES: this.aboutUs.objectivesES ?? undefined,
        objectivesEN: this.aboutUs.objectivesEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          this.openSnackBar("Contenido actualizado exitosamente");
        }
      });
  }

  submitServicios(): void {
    this._groupService
      .updateAboutServices(this.aboutUs.id, {
        servicesES: this.aboutUs.servicesES ?? undefined,
        servicesEN: this.aboutUs.servicesEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          this.openSnackBar("Contenido actualizado exitosamente");
        }
      });
  }

  submitFacilidadesyRecursos(): void {
    this._groupService
      .updateFacilities(this.group.id, {
        facilitiesES: this.group.facilitiesES ?? undefined,
        facilitiesEN: this.group.facilitiesEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          if (this.fileData2) {
            this._groupService.uploadFile(this.group.id, "facilities", this.fileData2).subscribe(() => {});
          }
          this.openSnackBar("Información actualizada exitosamente");
        }
      });
  }

  submitTrabajosFuturos(): void {
    this._groupService
      .updateFutureWork(this.group.id, {
        futureWorkES: this.group.futureWorkES ?? undefined,
        futureWorkEN: this.group.futureWorkEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          this.openSnackBar("Información actualizada exitosamente");
        }
      });
  }

  submitSeccionInfo(): void {
    this._groupService
      .updateInfo(this.group.id, {
        email: this.group.email ?? undefined,
        phone: this.group.phone ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          if (this.fileData3) {
            this._groupService.uploadFile(this.group.id, "header", this.fileData3).subscribe(() => {});
          }
          if (this.fileData4) {
            this._groupService.uploadFile(this.group.id, "footer", this.fileData4).subscribe(() => {});
          }
          this.openSnackBar("Información actualizada exitosamente");
        }
      });
  }

  submitSeccionPresentacion(): void {
    this._groupService
      .updateSummary(this.group.id, {
        summaryES: this.group.summaryES,
        summaryEN: this.group.summaryEN,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          this.openSnackBar("Información actualizada exitosamente");
        }
      });
  }

  submitSeccionPublicaciones(): void {
    this._groupService
      .updatePublicationsSection(this.group.id, {
        publicationsSectionES: this.group.publicationsSectionES ?? undefined,
        publicationsSectionEN: this.group.publicationsSectionEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          this.openSnackBar("Información actualizada exitosamente");
        }
      });
  }

  submitSeccionProyectos(): void {
    this._groupService
      .updateProjectsSection(this.group.id, {
        projectsSectionES: this.group.projectsSectionES ?? undefined,
        projectsSectionEN: this.group.projectsSectionEN ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          this.openSnackBar("Información actualizada exitosamente");
        }
      });
  }

  getEquipos(): void {
    this._groupService.listEquipment(this.group.id).subscribe((res) => {
      const items = res as Equipment[];
      if (items.length > 0) {
        items.sort((a, b) => (a.name > b.name ? 1 : b.name < a.name ? -1 : 0));
        this.dataSource3 = new MatTableDataSource(items);
        this.dataSource3.sort = this.sort3();
        this.dataSource3.paginator = this.paginator3();
      }
    });
  }

  getSoftware(): void {
    this._groupService.listSoftware(this.group.id).subscribe((res) => {
      const items = res as Software[];
      if (items.length > 0) {
        items.sort((a, b) => ((a.name ?? "") > (b.name ?? "") ? 1 : (b.name ?? "") < (a.name ?? "") ? -1 : 0));
        this.dataSource4 = new MatTableDataSource(items);
        this.dataSource4.sort = this.sort4();
        this.dataSource4.paginator = this.paginator4();
      }
    });
  }

  openSnackBar(value: string): void {
    this._snackBar.open(value, undefined, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  fileData: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileData2: File | null = null;
  previewUrl2: string | ArrayBuffer | null = null;
  fileData3: File | null = null;
  previewUrl3: string | ArrayBuffer | null = null;
  fileData4: File | null = null;
  previewUrl4: string | ArrayBuffer | null = null;

  fileProgress(fileInput: Event, id: number): void {
    const target = fileInput.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    if (!file) return;
    switch (id) {
      case 1:
        this.fileData = file;
        this.preview(id);
        break;
      case 2:
        this.fileData2 = file;
        this.preview(id);
        break;
      case 3:
        this.fileData3 = file;
        this.preview(id);
        break;
      case 4:
        this.fileData4 = file;
        this.preview(id);
        break;
    }
  }

  preview(id: number): void {
    switch (id) {
      case 1:
        if (this.fileData) this.readImageFile(this.fileData, (url) => (this.previewUrl = url));
        break;
      case 2:
        if (this.fileData2) this.readImageFile(this.fileData2, (url) => (this.previewUrl2 = url));
        break;
      case 3:
        if (this.fileData3) this.readImageFile(this.fileData3, (url) => (this.previewUrl3 = url));
        break;
      case 4:
        if (this.fileData4) this.readImageFile(this.fileData4, (url) => (this.previewUrl4 = url));
        break;
    }
  }

  private readImageFile(file: File, onLoad: (url: string | ArrayBuffer | null) => void): void {
    if (!file.type.match(/image\/*/)) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", () => onLoad(reader.result));
  }

  private previewDialog?: MatDialogRef<DialogPreview3>;

  previewAboutUs(value: number): void {
    const about: About = JSON.parse(JSON.stringify(this.aboutUs));
    localStorage.setItem("langLocale", "0");
    if (value === 1) {
      about.objectivesES = about.objectivesEN;
      about.servicesES = about.servicesEN;
      about.descriptionES = about.descriptionEN;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog = this.dialog.open(DialogPreview3, {
      width: "871px",
      id: "previewAboutUs",
      data: about,
    });
    this.previewDialog.afterClosed().subscribe(() => {});
  }

  private previewDialog2?: MatDialogRef<DialogPreview6>;

  previewTrabajosFuturos(value: number): void {
    const group: Group = JSON.parse(JSON.stringify(this.group));
    localStorage.setItem("langLocale", "0");
    if (value === 1) {
      group.futureWorkES = group.futureWorkEN;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog2 = this.dialog.open(DialogPreview6, {
      width: "871px",
      id: "previewTrabajosFuturos",
      data: group,
    });
    this.previewDialog2.afterClosed().subscribe(() => {});
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/about-us.html",
  styleUrl: "../../../public/about/about-us/component.scss",
  imports: [MatDialogClose],
})
export class DialogPreview3 {
  dialogRef = inject<MatDialogRef<DialogPreview3>>(MatDialogRef);
  aboutus = inject<About>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url: string;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (localStorage.getItem("langLocale") === "0") {
      this.language = Languages[0];
    } else {
      this.language = Languages[1];
    }
    const services = document.getElementById("services");
    const whoAre = document.getElementById("whoAre");
    const objectives = document.getElementById("objectives");
    if (services) services.innerHTML = this.aboutus.servicesES ?? "";
    if (whoAre) whoAre.innerHTML = this.aboutus.descriptionES ?? "";
    if (objectives) objectives.innerHTML = this.aboutus.objectivesES ?? "";
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/trabajos-futuros.html",
  styleUrl: "../../../public/about/works/component.scss",
  imports: [MatDialogClose],
})
export class DialogPreview6 {
  dialogRef = inject<MatDialogRef<DialogPreview6>>(MatDialogRef);
  aboutus = inject<Group>(MAT_DIALOG_DATA);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);

  url: string;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (localStorage.getItem("langLocale") === "0") {
      this.language = Languages[0];
    } else {
      this.language = Languages[1];
    }
    const works = document.getElementById("works");
    if (works) {
      works.innerHTML = this.aboutus.futureWorkES ?? "";
    }
  }
}
