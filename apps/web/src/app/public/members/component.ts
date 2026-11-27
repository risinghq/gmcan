import { Component, computed, inject, ChangeDetectionStrategy } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { MemberRowComponent } from "@app/shared/components/member-row.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicMember } from "@gmcan/contracts/public";

type MemberTypeGroup = { code: string; name: string; members: PublicMember[] };

@Component({
  selector: "app-members",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BreadcrumbComponent, MemberRowComponent, MatProgressSpinner, NewsComponent],
})
export default class MembersComponent {
  private memberService = inject(MemberService);
  lookup = inject(LookupService);
  private session = inject(SessionService);

  readonly language = this.session.language();
  private readonly memberTypes = this.lookup.memberTypes();
  private readonly members = toSignal(this.memberService.listMembers());
  readonly vm = computed(() => {
    const members = this.members();
    if (!members) {
      return { loading: true, memberGroups: [] as MemberTypeGroup[] };
    }

    const memberGroups = this.memberTypes.map((memberType) => ({
      code: memberType.code,
      name: memberType.name,
      members: members.filter((member) => member.memberTypeCode === memberType.code),
    }));

    return { loading: false, memberGroups };
  });
}
