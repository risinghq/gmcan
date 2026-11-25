import { inject, Injectable } from "@angular/core";
import { primaryName } from "@app/shared/forms/locale-form";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

import { ContentTable } from "./table";

/** A stored tab index past this one falls back to it. */
const LAST_TAB = 3;

@Injectable()
export class ContenidosState {
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly methodsService = inject(MethodsService);
  private readonly groupService = inject(GroupService);
  private readonly tabState = inject(TabStateService);

  selectedTab = 0;

  readonly lines = new ContentTable("/dashboard/add-linea", "/dashboard/edit-linea");
  readonly methods = new ContentTable("/dashboard/add-method", "/dashboard/edit-method");
  readonly equipment = new ContentTable("/dashboard/add-equipo", "/dashboard/edit-equipo");
  readonly software = new ContentTable("/dashboard/add-software", "/dashboard/edit-software");

  init(): void {
    this.selectedTab = Math.min(this.tabState.contenidosTab(), LAST_TAB);
    this.researchLinesService
      .listAdmin()
      .subscribe((rows) =>
        this.lines.show(rows.map(({ id, translations }) => ({ id, name: primaryName(translations) }))),
      );
    this.methodsService
      .listAdmin()
      .subscribe((rows) =>
        this.methods.show(rows.map(({ id, translations }) => ({ id, name: primaryName(translations) }))),
      );
    this.groupService.listGroups().subscribe((groups) => {
      const group = groups[0];
      if (!group) return;
      this.groupService
        .listEquipment(group.id)
        .subscribe((rows) => this.equipment.show(rows.map(({ id, name }) => ({ id, name }))));
      this.groupService
        .listSoftware(group.id)
        .subscribe((rows) =>
          this.software.show(rows.map(({ id, translations }) => ({ id, name: primaryName(translations) }))),
        );
    });
  }

  setTab(index: number): void {
    this.selectedTab = index;
    this.tabState.contenidosTab.set(index);
  }
}
