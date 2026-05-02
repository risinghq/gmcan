import { Component, OnInit, inject } from "@angular/core";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { Languages } from "@app/shared/models/languages";
import { GroupService } from "@app/shared/services/group.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-works",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
})
export default class WorksComponent implements OnInit {
  private groupService = inject(GroupService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  public info: Group;
  language: (typeof Languages)[number] = Languages[0];
  constructor() {
    this.info = createGroup();
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.futureWorks);
    this.getGroupInfo();
  }

  getGroupInfo(): void {
    this.groupService.getGroup().subscribe((res: Group) => {
      this.info = res;
    });
  }
}
