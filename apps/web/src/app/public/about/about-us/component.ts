import { Component, OnInit, inject } from "@angular/core";
import type { About } from "@app/shared/models/about";
import { Languages } from "@app/shared/models/languages";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { map, switchMap } from "rxjs";

@Component({
  selector: "app-about-us",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [],
})
export default class AboutUsComponent implements OnInit {
  private groupService = inject(GroupService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  url: string;
  language: (typeof Languages)[number] = Languages[0];
  aboutus: About | null = null;

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.loadAboutUs();
    this.seo.setPageTitle("GMCAN | " + this.language.who);
  }

  loadAboutUs(): void {
    this.groupService
      .getGroup()
      .pipe(
        switchMap((group) => this.groupService.listPublicAbout(group.id)),
        map((res: About[]) => res[0] ?? null),
      )
      .subscribe((about) => {
        this.aboutus = about;
      });
  }
}
