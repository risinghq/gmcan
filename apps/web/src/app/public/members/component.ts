import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
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
export default class MembersComponent {
  private router = inject(Router);
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  readonly language = this.session.language();
  private readonly memberTypes = this.lookup.memberTypes();
  private readonly prefixesMap = new Map(this.lookup.prefixes().map((prefix) => [prefix.code, prefix]));
  private readonly members = toSignal(this.memberService.listMembers());
  readonly vm = computed(() => {
    const members = this.members();
    if (!members) {
      return { loading: true, memberGroups: [] as MemberTypeGroup[], inactiveMembers: [] as MemberDisplay[] };
    }

    const processed = members.map((member): MemberDisplay => {
      const prefixItem = member.prefixCode ? this.prefixesMap.get(member.prefixCode) : undefined;
      const prefix = prefixItem && prefixItem.label !== "none" && prefixItem.label !== "bach" ? prefixItem.label : "";
      return { ...member, prefix };
    });

    const memberGroups = this.memberTypes.map((memberType) => ({
      code: memberType.code,
      name: memberType.name,
      members: processed.filter((member) => member.memberTypeCode === memberType.code && member.isActive === 1),
    }));

    return {
      loading: false,
      memberGroups,
      inactiveMembers: processed.filter((member) => member.isActive !== 1),
    };
  });

  constructor() {
    this.titleService.setTitle("GMCAN | " + this.language.members);
  }

  profile(member: MemberDisplay): void {
    this.router.navigate(["/home/detail-member/" + member.id], { queryParams: { from: "members" } });
  }
}
