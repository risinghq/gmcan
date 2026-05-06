import { inject, Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import type {
  About,
  AboutSectionContent,
  HomeServicesTeaserContent,
  LocalizedAboutSectionContent,
  LocalizedHomeServicesTeaserContent,
} from "@app/shared/models/about";
import type { Equipment } from "@app/shared/models/equipment";
import { createGroup, type Group } from "@app/shared/models/factories";
import type { Method } from "@app/shared/models/method";
import type { ResearchLine } from "@app/shared/models/research-line";
import type { Software } from "@app/shared/models/software";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SessionService } from "@app/shared/services/session.service";
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
  private readonly session = inject(SessionService);

  readonly files = new ContenidosFiles();
  readonly Editor = ClassicEditor;
  readonly url = GLOBAL.url;

  readonly displayedColumns: string[] = ["nombre"];
  readonly displayedColumns2: string[] = ["nombre"];
  selectedTab = 0;

  aboutUs: About = {
    id: 0,
    description: "",
    objectivesContent: { introParagraphs: [], items: [] },
    servicesContent: { introParagraphs: [], items: [] },
    homeServicesTeaserContent: { paragraphs: [] },
    asset: null,
    groupId: 0,
    createdAt: null,
    updatedAt: null,
  };
  locale: "es" | "en" = "es";
  group: Group = createGroup();

  descripcionForm: FormGroup = this.formBuilder.group({
    description: ["", Validators.required],
    asset: ["", Validators.required],
  });
  objetivosForm: FormGroup = this.formBuilder.group({
    objectives: ["", Validators.required],
  });
  serviciosForm: FormGroup = this.formBuilder.group({
    services: ["", Validators.required],
  });
  facilidadesRecursosForm: FormGroup = this.formBuilder.group({
    facilities: ["", Validators.required],
  });
  trabajosFuturosForm: FormGroup = this.formBuilder.group({
    futureWork: ["", Validators.required],
  });
  footerForm: FormGroup = this.formBuilder.group({
    email: ["", Validators.required],
    phone: ["", Validators.required],
  });
  presentacionForm: FormGroup = this.formBuilder.group({
    summary: ["", Validators.required],
  });
  publicacionesForm: FormGroup = this.formBuilder.group({
    publicationsSection: ["", Validators.required],
  });
  proyectosForm: FormGroup = this.formBuilder.group({
    projectsSection: ["", Validators.required],
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
    this.locale = this.session.language().locale === "en" ? "en" : "es";
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
    this.groupService.listAdminAbout(this.group.id).subscribe((res) => {
      if (res.length > 0) {
        this.aboutUs = this.normalizeAbout(res[0]);
      }
    });
  }

  submitQuienesSomos(): void {
    this.groupService
      .updateAboutDescription(this.aboutUs.id, {
        description: this.aboutUs.description,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          const file = this.files.get("about");
          if (file) this.groupService.uploadAboutAsset(this.aboutUs.id, file).subscribe();
          this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
        }
      });
  }

  submitObjetivos(): void {
    const objectivesContent = this.buildLocalizedSectionContent(this.aboutUs.objectivesContent);
    this.groupService
      .updateAboutObjectives(this.aboutUs.id, {
        objectivesContent,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
      });
  }

  submitServicios(): void {
    const servicesContent = this.buildLocalizedSectionContent(this.aboutUs.servicesContent);
    this.groupService
      .updateAboutServices(this.aboutUs.id, {
        servicesContent,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
      });
  }

  submitHomeServicesTeaser(): void {
    const homeServicesTeaserContent = this.buildLocalizedHomeTeaserContent(this.aboutUs.homeServicesTeaserContent);
    this.groupService
      .updateAboutHomeServicesTeaser(this.aboutUs.id, {
        homeServicesTeaserContent,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.CONTENT_UPDATED_MESSAGE);
      });
  }

  submitFacilidadesyRecursos(): void {
    this.groupService
      .updateFacilities(this.group.id, {
        facilities: this.group.facilities ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) {
          const file = this.files.get("fac");
          if (file) this.groupService.uploadAsset(this.group.id, "facilities", file).subscribe();
          this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
        }
      });
  }

  submitTrabajosFuturos(): void {
    this.groupService
      .updateFutureWork(this.group.id, {
        futureWork: this.group.futureWork ?? undefined,
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
          if (headFile) this.groupService.uploadAsset(this.group.id, "header", headFile).subscribe();
          if (footFile) this.groupService.uploadAsset(this.group.id, "footer", footFile).subscribe();
          this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
        }
      });
  }

  submitSeccionPresentacion(): void {
    this.groupService.updateSummary(this.group.id, { summary: this.group.summary }).subscribe((res) => {
      if (res.status === 1) this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
    });
  }

  submitSeccionPublicaciones(): void {
    this.groupService
      .updatePublicationsSection(this.group.id, {
        publicationsSection: this.group.publicationsSection ?? undefined,
      })
      .subscribe((res) => {
        if (res.status === 1) this.openSnackBar(ContenidosState.INFO_UPDATED_MESSAGE);
      });
  }

  submitSeccionProyectos(): void {
    this.groupService
      .updateProjectsSection(this.group.id, {
        projectsSection: this.group.projectsSection ?? undefined,
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

  previewAbout(): void {
    const about = structuredClone(this.aboutUs);
    const data: PreviewAboutData = { about };
    this.dialog.open(DialogAboutPreview, { width: "871px", id: "previewAboutUs", data }).afterClosed().subscribe();
  }

  previewFuture(): void {
    const group = structuredClone(this.group);
    const data: PreviewFutureData = { group };
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

  private normalizeAbout(raw: About): About {
    const objectivesAny = raw.objectivesContent as unknown as
      | AboutSectionContent
      | LocalizedAboutSectionContent
      | undefined;
    const servicesAny = raw.servicesContent as unknown as
      | AboutSectionContent
      | LocalizedAboutSectionContent
      | undefined;
    const teaserAny = raw.homeServicesTeaserContent as unknown as
      | HomeServicesTeaserContent
      | LocalizedHomeServicesTeaserContent
      | undefined;
    const objectivesContent =
      objectivesAny && "es" in objectivesAny
        ? objectivesAny[this.locale]
        : (objectivesAny ?? { introParagraphs: [], items: [] });
    const servicesContent =
      servicesAny && "es" in servicesAny
        ? servicesAny[this.locale]
        : (servicesAny ?? { introParagraphs: [], items: [] });
    const homeServicesTeaserContent =
      teaserAny && "es" in teaserAny ? teaserAny[this.locale] : (teaserAny ?? { paragraphs: [] });
    return {
      ...raw,
      objectivesContent,
      servicesContent,
      homeServicesTeaserContent,
    };
  }

  addSectionParagraph(section: "objectives" | "services"): void {
    const content = section === "objectives" ? this.aboutUs.objectivesContent : this.aboutUs.servicesContent;
    content.introParagraphs.push("");
  }

  removeSectionParagraph(section: "objectives" | "services", index: number): void {
    const content = section === "objectives" ? this.aboutUs.objectivesContent : this.aboutUs.servicesContent;
    content.introParagraphs.splice(index, 1);
  }

  addSectionItem(section: "objectives" | "services"): void {
    const content = section === "objectives" ? this.aboutUs.objectivesContent : this.aboutUs.servicesContent;
    content.items.push("");
  }

  removeSectionItem(section: "objectives" | "services", index: number): void {
    const content = section === "objectives" ? this.aboutUs.objectivesContent : this.aboutUs.servicesContent;
    content.items.splice(index, 1);
  }

  addTeaserParagraph(): void {
    this.aboutUs.homeServicesTeaserContent.paragraphs.push("");
  }

  removeTeaserParagraph(index: number): void {
    this.aboutUs.homeServicesTeaserContent.paragraphs.splice(index, 1);
  }

  private buildLocalizedSectionContent(value: AboutSectionContent): LocalizedAboutSectionContent {
    const normalized = {
      introParagraphs: value.introParagraphs.map((item) => item.trim()).filter((item) => item.length > 0),
      items: value.items.map((item) => item.trim()).filter((item) => item.length > 0),
    };
    return { es: normalized, en: normalized };
  }

  private buildLocalizedHomeTeaserContent(value: HomeServicesTeaserContent): LocalizedHomeServicesTeaserContent {
    const normalized = {
      paragraphs: value.paragraphs.map((item) => item.trim()).filter((item) => item.length > 0),
    };
    return { es: normalized, en: normalized };
  }
}
