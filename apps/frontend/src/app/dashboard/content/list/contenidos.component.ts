import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, Inject, ViewChild } from "@angular/core";
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
import type { SobreNosotros } from "@app/shared/models/aboutus";
import type { Equipo } from "@app/shared/models/equipo";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
import type { Method } from "@app/shared/models/method";
import type { Software } from "@app/shared/models/software";
import { AboutUsService } from "@app/shared/services/aboutus.service";
import { CommonService } from "@app/shared/services/common.service";
import { EquipoService } from "@app/shared/services/equipo.service";
import { GLOBAL } from "@app/shared/services/global";
import { GrupoService } from "@app/shared/services/grupo.service";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { SoftwareService } from "@app/shared/services/software.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ClassicEditor } from "ckeditor5";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-contenidos",
  templateUrl: "./contenidos.component.html",
  styleUrls: ["./contenidos.component.scss"],
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
  public Editor = ClassicEditor;
  displayedColumns: string[] = ["nombre"];
  displayedColumns2: string[] = ["nombre"];
  url: string;
  aboutUs: SobreNosotros;
  public descripcionForm: FormGroup;
  public objetivosForm: FormGroup;
  public serviciosForm: FormGroup;
  facilidadesRecursosForm: FormGroup;
  trabajosFuturosForm: FormGroup;
  footerForm: FormGroup;
  presentacionForm: FormGroup;
  publicacionesForm: FormGroup;
  proyectosForm: FormGroup;
  lineasInvestigaciones: Array<LineasInvestigacion> = [];
  dataSource: MatTableDataSource<LineasInvestigacion> = new MatTableDataSource<LineasInvestigacion>([]);
  dataSource2: MatTableDataSource<Method> = new MatTableDataSource<Method>([]);
  dataSource3: MatTableDataSource<Equipo> = new MatTableDataSource<Equipo>([]);
  dataSource4: MatTableDataSource<Software> = new MatTableDataSource<Software>([]);
  facilidadesRecursos: Grupo;
  trabajosFuturos: Grupo;
  informacionExtra: Grupo;

  constructor(
    private _aboutService: AboutUsService,
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _lineasInvestigaciónService: LineasInvestigacionService,
    private _metodosService: MethodsService,
    private _grupoService: GrupoService,
    private _equipoService: EquipoService,
    private _softwareService: SoftwareService,
    private _tabState: TabStateService,
  ) {
    this.aboutUs = {
      idSobreNosotros: 0,
      quienesSomos: "",
      quienesSomosEN: "",
      foto: "",
      objetivos: "",
      objetivosEN: "",
      servicios: "",
      serviciosEN: "",
      grupo_idGrupo: 0,
    };
    this.facilidadesRecursos = createGrupo();
    this.trabajosFuturos = createGrupo();
    this.informacionExtra = createGrupo();
    this.descripcionForm = this.formBuilder.group({
      quienesSomos: ["", Validators.required],
      quienesSomosEN: ["", Validators.required],
      foto: ["", Validators.required],
    });
    this.objetivosForm = this.formBuilder.group({
      objetivos: ["", Validators.required],
      objetivosEN: ["", Validators.required],
    });
    this.serviciosForm = this.formBuilder.group({
      servicios: ["", Validators.required],
      serviciosEN: ["", Validators.required],
    });
    this.facilidadesRecursosForm = this.formBuilder.group({
      facilidadesRecursos: ["", Validators.required],
      facilidadesRecursosEN: ["", Validators.required],
      facilidadesRecursosFoto: ["", Validators.required],
    });
    this.trabajosFuturosForm = this.formBuilder.group({
      trabajosFuturos: ["", Validators.required],
      trabajosFuturosEN: ["", Validators.required],
    });
    this.trabajosFuturosForm = this.formBuilder.group({
      trabajosFuturos: ["", Validators.required],
      trabajosFuturosEN: ["", Validators.required],
    });
    this.footerForm = this.formBuilder.group({
      correo: ["", Validators.required],
      telefono: ["", Validators.required],
    });
    this.presentacionForm = this.formBuilder.group({
      quienesSomosResumen: ["", Validators.required],
      quienesSomosResumenEN: ["", Validators.required],
    });
    this.publicacionesForm = this.formBuilder.group({
      seccionPublicaciones: ["", Validators.required],
      seccionPublicacionesEN: ["", Validators.required],
    });
    this.proyectosForm = this.formBuilder.group({
      seccionProyectos: ["", Validators.required],
      seccionProyectosEN: ["", Validators.required],
    });
    this.url = GLOBAL.url;
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  @ViewChild(MatPaginator, { static: true }) paginator2!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort2!: MatSort;

  @ViewChild(MatPaginator, { static: true }) paginator3!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort3!: MatSort;

  @ViewChild(MatPaginator, { static: true }) paginator4!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort4!: MatSort;

  selectedTab = 0;
  displayedNotFound = false;
  displayedNotFound2 = false;
  displayedNotFound3 = false;
  displayedNotFound4 = false;

  ngOnInit(): void {
    this.selectedTab = this._tabState.contenidosTab();
    this.getContenidos();
    this.getLineasInvestigación();
    this.getMetodos();
    this.getFacilidadesyRecursos();
    this.getEquipos();
    this.getSoftware();
    this.getTrabajosFuturos();
    this.getInformaciónExtra();
  }

  changedTab(event: number): void {
    this._tabState.contenidosTab.set(event);
  }

  getLineasInvestigación(): void {
    this._lineasInvestigaciónService.getLineasInvestigacion().subscribe((res: LineasInvestigacion[]) => {
      if (res.length > 0) {
        res.sort((a: LineasInvestigacion, b: LineasInvestigacion) =>
          (a.nombre ?? "") > (b.nombre ?? "") ? 1 : (b.nombre ?? "") < (a.nombre ?? "") ? -1 : 0,
        );
        this.lineasInvestigaciones = res;
        this.dataSource = new MatTableDataSource(this.lineasInvestigaciones);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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
    this._metodosService.getMethods().subscribe((res: Method[]) => {
      if (res.length > 0) {
        res.sort((a: Method, b: Method) =>
          (a.nombre ?? "") > (b.nombre ?? "") ? 1 : (b.nombre ?? "") < (a.nombre ?? "") ? -1 : 0,
        );
        this.dataSource2 = new MatTableDataSource(res);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    if (this.dataSource.filteredData.length == 0) {
      this.displayedNotFound = true;
    } else {
      this.displayedNotFound = false;
    }
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    if (this.dataSource2.filteredData.length == 0) {
      this.displayedNotFound2 = true;
    } else {
      this.displayedNotFound2 = false;
    }
  }

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
    if (this.dataSource3.filteredData.length == 0) {
      this.displayedNotFound3 = true;
    } else {
      this.displayedNotFound3 = false;
    }
  }

  applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
    if (this.dataSource.filteredData.length == 0) {
      this.displayedNotFound4 = true;
    } else {
      this.displayedNotFound4 = false;
    }
  }

  getFacilidadesyRecursos(): void {
    this._grupoService.getFacilidadesRecursos().subscribe((res: Grupo[]) => {
      if (res.length > 0) {
        this.facilidadesRecursos = res[0];
      }
    });
  }

  submitFacilidadesyRecursos(): void {
    this._grupoService.updateRecursos(this.facilidadesRecursos).subscribe((res: any) => {
      if (res.status == 1) {
        if (this.fileData2) {
          this._grupoService
            .uploadFacilidadesFoto(this.fileData2, this.facilidadesRecursos.idGrupo ?? 0)
            .subscribe((_res: any) => {});
        }
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  getTrabajosFuturos(): void {
    this._grupoService.getTrabajosFuturos().subscribe((res: Grupo[]) => {
      if (res.length > 0) {
        this.trabajosFuturos = res[0];
      }
    });
  }

  submitTrabajosFuturos(): void {
    this._grupoService.updateTrabajosFuturos(this.trabajosFuturos).subscribe((res: any) => {
      if (res.status == 1) {
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  getInformaciónExtra(): void {
    this._grupoService.getGrupoInfo().subscribe((res: Grupo[]) => {
      if (res.length > 0) {
        this.informacionExtra = res[0];
      }
    });
  }

  submitSeccionInfo(): void {
    this._grupoService.updateSeccionInfo(this.informacionExtra).subscribe((res: any) => {
      if (res.status == 1) {
        if (this.fileData3) {
          this._grupoService
            .uploadHeaderLogo(this.fileData3, this.informacionExtra.idGrupo ?? 0)
            .subscribe((_res: any) => {});
        }
        if (this.fileData4) {
          this._grupoService
            .uploadFooterLogo(this.fileData4, this.informacionExtra.idGrupo ?? 0)
            .subscribe((_res: any) => {});
        }
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  submitSeccionPresentacion(): void {
    this._grupoService.updateSeccionPresentacion(this.informacionExtra).subscribe((res: any) => {
      if (res.status == 1) {
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  submitSeccionPublicaciones(): void {
    this._grupoService.updateSeccionPublicaciones(this.informacionExtra).subscribe((res: any) => {
      if (res.status == 1) {
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  submitSeccionProyectos(): void {
    this._grupoService.updateSeccionProyectos(this.informacionExtra).subscribe((res: any) => {
      if (res.status == 1) {
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  getEquipos(): void {
    this._equipoService.getEquipos().subscribe((res: Equipo[]) => {
      if (res.length > 0) {
        res.sort((a: Equipo, b: Equipo) =>
          (a.nombre ?? "") > (b.nombre ?? "") ? 1 : (b.nombre ?? "") < (a.nombre ?? "") ? -1 : 0,
        );
        this.dataSource3 = new MatTableDataSource(res);
        this.dataSource3.sort = this.sort3;
        this.dataSource3.paginator = this.paginator3;
      }
    });
  }

  getSoftware(): void {
    this._softwareService.getSoftware().subscribe((res: Software[]) => {
      if (res.length > 0) {
        res.sort((a: Software, b: Software) =>
          (a.nombre ?? "") > (b.nombre ?? "") ? 1 : (b.nombre ?? "") < (a.nombre ?? "") ? -1 : 0,
        );
        this.dataSource4 = new MatTableDataSource(res);
        this.dataSource4.sort = this.sort4;
        this.dataSource4.paginator = this.paginator4;
      }
    });
  }

  getContenidos(): void {
    this._aboutService.getAboutUsInfo().subscribe((res: SobreNosotros[]) => {
      if (res.length > 0) {
        this.aboutUs = res[0];
      }
    });
  }

  submitQuienesSomos(): void {
    this._aboutService.updateDescripcion(this.aboutUs).subscribe((res: any) => {
      if (res.status == 1) {
        if (this.fileData) {
          this._aboutService
            .uploadGrupoFoto(this.fileData, this.aboutUs.idSobreNosotros ?? 0)
            .subscribe((_res: any) => {});
        }
        this.openSnackBar("Contenido actualizado exitosamente");
      }
    });
  }

  submitObjetivos(): void {
    this._aboutService.updateObjetivos(this.aboutUs).subscribe((res: any) => {
      if (res.status == 1) {
        this.openSnackBar("Contenido actualizado exitosamente");
      }
    });
  }

  submitServicios(): void {
    this._aboutService.updateServicios(this.aboutUs).subscribe((res: any) => {
      if (res.status == 1) {
        this.openSnackBar("Contenido actualizado exitosamente");
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
      default:
        break;
    }
  }

  preview(id: number): void {
    switch (id) {
      case 1:
        if (!this.fileData) return;
        const mimeType = this.fileData.type;
        if (mimeType.match(/image\/*/) == null) {
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(this.fileData);
        reader.addEventListener("load", (_event) => {
          this.previewUrl = reader.result;
        });
        break;
      case 2:
        if (!this.fileData2) return;
        const mimeType2 = this.fileData2.type;
        if (mimeType2.match(/image\/*/) == null) {
          return;
        }
        const reader2 = new FileReader();
        reader2.readAsDataURL(this.fileData2);
        reader2.addEventListener("load", (_event) => {
          this.previewUrl2 = reader2.result;
        });
        break;
      case 3:
        if (!this.fileData3) return;
        const mimeType3 = this.fileData3.type;
        if (mimeType3.match(/image\/*/) == null) {
          return;
        }
        const reader3 = new FileReader();
        reader3.readAsDataURL(this.fileData3);
        reader3.addEventListener("load", (_event) => {
          this.previewUrl3 = reader3.result;
        });
        break;
      case 4:
        if (!this.fileData4) return;
        const mimeType4 = this.fileData4.type;
        if (mimeType4.match(/image\/*/) == null) {
          return;
        }
        const reader4 = new FileReader();
        reader4.readAsDataURL(this.fileData4);
        reader4.addEventListener("load", (_event) => {
          this.previewUrl4 = reader4.result;
        });
        break;
      default:
        break;
    }
  }

  private previewDialog?: MatDialogRef<DialogPreview3>;

  previewAboutUs(value: number): void {
    const aboutus: SobreNosotros = JSON.parse(JSON.stringify(this.aboutUs));
    localStorage.setItem("langLocale", "0");
    if (value == 1) {
      aboutus.objetivos = aboutus.objetivosEN;
      aboutus.servicios = aboutus.serviciosEN;
      aboutus.quienesSomos = aboutus.quienesSomosEN;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog = this.dialog.open(DialogPreview3, {
      width: "871px",
      id: "previewAboutUs",
      data: aboutus,
    });

    this.previewDialog.afterClosed().subscribe(() => {});
  }

  private previewDialog2?: MatDialogRef<DialogPreview6>;

  previewTrabajosFuturos(value: number): void {
    const aboutus: Grupo = JSON.parse(JSON.stringify(this.trabajosFuturos));
    localStorage.setItem("langLocale", "0");
    if (value == 1) {
      aboutus.trabajosFuturos = aboutus.trabajosFuturosEN;
      localStorage.setItem("langLocale", "1");
    }
    this.previewDialog = this.dialog.open(DialogPreview6, {
      width: "871px",
      id: "previewTrabajosFuturos",
      data: aboutus,
    });

    this.previewDialog.afterClosed().subscribe(() => {});
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/about-us.html",
  styleUrls: ["../../../public/about/about-us/about-us.component.scss"],
  imports: [MatDialogClose],
})
export class DialogPreview3 {
  url: string;
  language: (typeof Languages)[number] = Languages[0];
  constructor(
    public dialogRef: MatDialogRef<DialogPreview3>,
    @Inject(MAT_DIALOG_DATA) public aboutus: SobreNosotros,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (localStorage.getItem("langLocale") == "0") {
      this.language = Languages[0];
    } else {
      this.language = Languages[1];
    }
    const services = document.getElementById("services");
    const whoAre = document.getElementById("whoAre");
    const objectives = document.getElementById("objectives");
    if (services) services.innerHTML = this.aboutus.servicios ?? "";
    if (whoAre) whoAre.innerHTML = this.aboutus.quienesSomos ?? "";
    if (objectives) objectives.innerHTML = this.aboutus.objetivos ?? "";
  }
}

@Component({
  selector: "dialog-content-example-dialog",
  templateUrl: "../../../shared/modals/trabajos-futuros.html",
  styleUrls: ["../../../public/about/works/works.component.scss"],
  imports: [MatDialogClose],
})
export class DialogPreview6 {
  url: string;
  language: (typeof Languages)[number] = Languages[0];
  constructor(
    public dialogRef: MatDialogRef<DialogPreview6>,
    @Inject(MAT_DIALOG_DATA) public aboutus: Grupo,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (localStorage.getItem("langLocale") == "0") {
      this.language = Languages[0];
    } else {
      this.language = Languages[1];
    }
    const works = document.getElementById("works");
    if (works) {
      works.innerHTML = this.aboutus.trabajosFuturos ?? "";
    }
  }
}
