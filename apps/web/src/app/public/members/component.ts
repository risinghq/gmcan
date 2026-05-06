import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { Languages } from "@app/shared/models/languages";
import type { Member } from "@app/shared/models/member";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SessionService } from "@app/shared/services/session.service";

type MemberDisplay = Member & { prefix: string };
type MemberTypeGroup = { code: string; name: string; members: MemberDisplay[] };

@Component({
  selector: "app-members",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatIcon, MatTabGroup, MatTab, MatProgressSpinner, NewsComponent],
})
export default class MembersComponent implements OnInit {
  private router = inject(Router);
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  public cargado = false;
  public tipoMiembros: MemberTypeGroup[] = [];
  public membrosNoActivos: MemberDisplay[] = [];
  language: (typeof Languages)[number] = Languages[0];
  allCharged = false;

  constructor() {}

  ngOnInit(): void {
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | " + this.language.members);
    this.cargado = true;
    this.tipoMiembros = this.lookup.memberTypes().map((t) => ({ code: t.code, name: t.name, members: [] }));
    this.getMembers();
  }

  getMembers(): void {
    this.memberService.listMembers().subscribe((res: Member[]) => {
      if (res) {
        const prefijos = this.lookup.prefixes();
        const prefijosMap = new Map(prefijos.map((p) => [p.code, p]));

        const processed = res.map((m): MemberDisplay => {
          const asset = m.asset ?? "/img/placeholders/user.png";
          const prefijo = m.prefixCode ? prefijosMap.get(m.prefixCode) : undefined;
          const prefix = prefijo && prefijo.label !== "none" && prefijo.label !== "bach" ? prefijo.label : "";
          return { ...m, asset, prefix };
        });

        for (const tipoMiembro of this.tipoMiembros) {
          tipoMiembro.members = processed.filter((m) => m.memberTypeCode === tipoMiembro.code && m.isActive === 1);
        }
        this.membrosNoActivos = processed.filter((m) => m.isActive !== 1);
        this.allCharged = true;
      }
    });
  }

  profile(member: MemberDisplay): void {
    this.router.navigate(["/home/detail-member/" + member.id], { queryParams: { from: "members" } });
  }
}
