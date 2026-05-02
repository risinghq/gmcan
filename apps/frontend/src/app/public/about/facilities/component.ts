import { Component, OnInit, inject } from "@angular/core";
import { MatChip, MatChipSet } from "@angular/material/chips";
import type { Equipment } from "@app/shared/models/equipment";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import type { Software } from "@app/shared/models/software";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { forkJoin, map, switchMap } from "rxjs";

@Component({
  selector: "app-facilities",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatChipSet, MatChip],
})
export default class FacilitiesComponent implements OnInit {
  private groupService = inject(GroupService);
  private browser = inject(BrowserService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  equipos: Equipment[] = [];
  software: Software[] = [];
  url: string;
  grupo: Group;

  public page1 = 1;
  public pageSize = 5;
  public page2 = 1;

  constructor() {
    this.url = GLOBAL.url;
    this.grupo = createGroup();
  }

  language: any = { locale: "es", resources: "Facilidades y recursos" };

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.resources);
    this.loadData();
  }

  loadData(): void {
    this.groupService
      .getGroup()
      .pipe(
        switchMap((group) =>
          forkJoin({
            equipment: this.groupService.listEquipment(group.id),
            software: this.groupService.listSoftware(group.id),
          }).pipe(
            map(({ equipment, software }) => ({
              group,
              equipment: equipment as Equipment[],
              software: software as Software[],
            })),
          ),
        ),
      )
      .subscribe(({ group, equipment, software }) => {
        this.grupo = group;
        if (this.language.locale === "en" && group.facilitiesEN) {
          this.grupo = { ...group, facilitiesES: group.facilitiesEN };
        }
        this.equipos = equipment;
        this.software = software;
      });
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
