import { SlicePipe } from "@angular/common";
import { Component, computed, effect, inject, ChangeDetectionStrategy } from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { BackLinkComponent } from "@app/shared/components/back-link.component";
import { BreadcrumbComponent, type Crumb } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { PublicationItemComponent } from "@app/shared/components/publication-item.component";
import { publicationDisplay } from "@app/shared/publication-display";
import { originLabel, originRoute, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import type { PublicMember } from "@gmcan/contracts/public";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";
import { map } from "rxjs";

type MemberDisplay = PublicMember & { prefix: string; tipoMiembro: string };

@Component({
  selector: "app-detail-member",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BackLinkComponent,
    BreadcrumbComponent,
    AvatarComponent,
    MatProgressSpinner,
    IconComponent,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    PublicationItemComponent,
    RouterLink,
    SlicePipe,
  ],
})
export default class DetailMemberComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly memberService = inject(MemberService);
  private readonly lookup = inject(LookupService);
  private readonly session = inject(SessionService);
  private readonly browser = inject(BrowserService);
  private readonly seo = inject(SeoService);

  private readonly memberId = toSignal(this.route.paramMap.pipe(map((params) => Number(params.get("id")))));

  private readonly profile = rxResource({
    params: () => this.memberId() || undefined,
    stream: ({ params }) => this.memberService.getMemberProfile(params),
  });

  readonly loading = this.profile.isLoading;

  readonly member = computed((): MemberDisplay | null => {
    const m = this.profile.value()?.member;
    if (!m) return null;
    const prefijo = m.prefixCode ? this.lookup.prefixes().find((p) => p.code === m.prefixCode) : undefined;
    const prefix = prefijo && prefijo.label !== "none" && prefijo.label !== "bach" ? prefijo.label : "";
    const memberType = this.lookup.memberTypes().find((t) => t.code === m.memberTypeCode);
    return { ...m, prefix, tipoMiembro: memberType?.nameSingular ?? "" };
  });

  readonly publications = computed(() => {
    const enrich = publicationDisplay(this.lookup, this.session.language().locale);
    return (this.profile.value()?.publications ?? []).map(enrich);
  });

  readonly language = this.session.language();

  private readonly origin = parsePublicOrigin(this.route.snapshot.queryParamMap.get("from"));
  readonly previouslink = originRoute(this.origin);
  private readonly previouspage = originLabel(this.origin, this.language);

  protected readonly trail = computed((): Crumb[] => {
    const m = this.member();
    const name = m ? [m.prefix, m.firstName, m.lastName, m.maternalName].filter(Boolean).join(" ") : "";
    const current = { label: name };
    return this.previouslink === "/" ? [current] : [{ label: this.previouspage, link: this.previouslink }, current];
  });

  page = 1;
  pageSize = 5;

  constructor() {
    effect(() => {
      const m = this.member();
      if (!m) return;
      const name = [m.firstName, m.lastName, m.maternalName].filter(Boolean).join(" ");
      this.seo.setPageTitle("GMCAN | " + name);
      if (m.bio) this.seo.setDescription(m.bio);
      this.seo.setImage(m.photoUrl);
      this.seo.setStructuredData({
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        image: m.photoUrl || undefined,
        jobTitle: m.tipoMiembro || undefined,
        description: m.bio || undefined,
        affiliation: { "@type": "ResearchOrganization", name: "GMCAN", url: GLOBAL.appUrl },
      });
    });
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
