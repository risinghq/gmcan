import { SlicePipe } from "@angular/common";
import { Component, computed, effect, inject, input, ChangeDetectionStrategy } from "@angular/core";
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
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { personName } from "@app/shared/utils/person-name";
import type { PublicMember, PublicMemberProfile } from "@gmcan/contracts/public";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

type MemberDisplay = PublicMember & { name: string; tipoMiembro: string };

@Component({
  selector: "app-detail-member",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BackLinkComponent,
    BreadcrumbComponent,
    AvatarComponent,
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
  private readonly lookup = inject(LookupService);
  private readonly session = inject(SessionService);
  private readonly browser = inject(BrowserService);
  private readonly seo = inject(SeoService);

  readonly profile = input.required<PublicMemberProfile>();

  readonly member = computed((): MemberDisplay => {
    const m = this.profile().member;
    const memberType = this.lookup.memberTypes().find((t) => t.code === m.memberTypeCode);
    return { ...m, name: this.lookup.memberName(m), tipoMiembro: memberType?.nameSingular ?? "" };
  });

  readonly publications = computed(() => {
    const enrich = publicationDisplay(this.lookup, this.session.language().locale);
    return this.profile().publications.map(enrich);
  });

  readonly language = this.session.language();

  private readonly origin = parsePublicOrigin(this.route.snapshot.queryParamMap.get("from"));
  readonly previouslink = originRoute(this.origin);
  private readonly previouspage = originLabel(this.origin, this.language);

  protected readonly trail = computed((): Crumb[] => {
    const current = { label: this.member().name };
    return this.previouslink === "/" ? [current] : [{ label: this.previouspage, link: this.previouslink }, current];
  });

  page = 1;
  pageSize = 5;

  constructor() {
    effect(() => {
      const m = this.member();
      const name = personName(m);
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
