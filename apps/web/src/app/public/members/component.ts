import { Component, computed, inject, ChangeDetectionStrategy } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicMember } from "@gmcan/contracts/public";

type MemberDisplay = PublicMember & { prefix: string };
type MemberTypeGroup = { code: string; name: string; members: MemberDisplay[] };

@Component({
  selector: "app-members",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AvatarComponent, RouterLink, MatIcon, MatProgressSpinner, NewsComponent],
})
export default class MembersComponent {
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  private session = inject(SessionService);
  private seo = inject(SeoService);

  readonly language = this.session.language();
  private readonly memberTypes = this.lookup.memberTypes();
  private readonly prefixesMap = new Map(this.lookup.prefixes().map((prefix) => [prefix.code, prefix]));
  private readonly members = toSignal(this.memberService.listMembers());
  readonly vm = computed(() => {
    const members = this.members();
    if (!members) {
      return { loading: true, memberGroups: [] as MemberTypeGroup[] };
    }

    // oxlint-disable-next-line oxc/no-map-spread -- the members come from a signal, so each needs a copy
    const processed = members.map((member): MemberDisplay => {
      const prefixItem = member.prefixCode ? this.prefixesMap.get(member.prefixCode) : undefined;
      const prefix = prefixItem && prefixItem.label !== "none" && prefixItem.label !== "bach" ? prefixItem.label : "";
      return { ...member, prefix };
    });

    const memberGroups = this.memberTypes.map((memberType) => ({
      code: memberType.code,
      name: memberType.name,
      members: processed.filter((member) => member.memberTypeCode === memberType.code),
    }));

    return { loading: false, memberGroups };
  });

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language.members);
  }
}
