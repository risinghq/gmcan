import { SlicePipe } from "@angular/common";
import { Component, computed, effect, inject, ChangeDetectionStrategy } from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { BreadcrumbComponent, type Crumb } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { originLabel, originRoute, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel } from "@app/shared/utils/date";
import type { PublicMember, PublicPublication } from "@gmcan/contracts/public";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";
import { map } from "rxjs";

type MemberDisplay = PublicMember & { prefix: string; tipoMiembro: string };

type PublicationDisplay = PublicPublication & {
  fecha: string;
  tipoPublicacion?: string;
  tipoTesis?: string;
  revista?: string;
  universidad?: string;
  evento?: string;
  ciudad?: string;
  pais?: string;
};

@Component({
  selector: "app-detail-member",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BreadcrumbComponent,
    AvatarComponent,
    MatProgressSpinner,
    IconComponent,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
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

  readonly publications = computed((): PublicationDisplay[] => {
    const pubTypesMap = new Map(this.lookup.publicationKinds().map((t) => [t.code, t]));
    const thesisTypesMap = new Map(this.lookup.thesisKinds().map((t) => [t.code, t]));
    const journalsMap = new Map(this.lookup.journals().map((j) => [j.id, j]));
    const universitiesMap = new Map(this.lookup.universities().map((u) => [u.id, u]));
    const eventsMap = new Map(this.lookup.events().map((e) => [e.id, e]));

    // oxlint-disable-next-line oxc/no-map-spread -- the publications come from a resource signal, so each needs a copy
    return (this.profile.value()?.publications ?? []).map((pub): PublicationDisplay => {
      const fecha = dateLabel(pub.publishedAt, "MMMM y", this.session.language().locale);

      const eventId = pub.subtype.kindCode === "conference_paper" ? pub.subtype.conferencePaper.eventId : null;
      const universityId = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.universityId : null;
      const thesisKindCode = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.thesisKindCode : null;
      const journalId = pub.subtype.kindCode === "journal_article" ? pub.subtype.journalArticle.journalId : null;
      const evento = eventId ? eventsMap.get(eventId) : undefined;

      return {
        ...pub,
        fecha,
        tipoPublicacion: pubTypesMap.get(pub.kindCode)?.name,
        tipoTesis: thesisKindCode ? thesisTypesMap.get(thesisKindCode)?.name : undefined,
        revista: journalId ? journalsMap.get(journalId)?.name : undefined,
        universidad: universityId ? (universitiesMap.get(universityId)?.name ?? undefined) : undefined,
        evento: evento?.name,
        ciudad: evento?.city ?? undefined,
        pais: evento?.country ?? undefined,
      };
    });
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
  expandedKey: string | null = null;

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

  toggleExpanded(section: string, index: number): void {
    const key = `${section}:${index}`;
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  isExpanded(section: string, index: number): boolean {
    return this.expandedKey === `${section}:${index}`;
  }

  expandLabel(section: string, index: number, seeMore: string, seeLess: string): string {
    return this.isExpanded(section, index) ? seeLess : seeMore;
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
