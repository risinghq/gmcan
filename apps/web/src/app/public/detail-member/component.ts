import { DatePipe, SlicePipe, TitleCasePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { Languages } from "@app/shared/models/languages";
import type { Member } from "@app/shared/models/member";
import type { PublicPublication } from "@gmcan/contracts/public";
import { getPublicOriginInfo, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { BrowserService } from "@app/shared/services/browser.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { SessionService } from "@app/shared/services/session.service";
import { parseLocalDate } from "@app/shared/utils/date";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

type MemberDisplay = Member & { active: string; prefix: string; tipoMiembro: string };

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
  imports: [
    MatProgressSpinner,
    MatIcon,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NewsComponent,
    SlicePipe,
    RouterLink,
  ],
})
export default class DetailMemberComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titlecasePipe = inject(TitleCasePipe);
  private readonly datePipe = inject(DatePipe);
  private readonly memberService = inject(MemberService);
  private readonly lookup = inject(LookupService);
  private readonly session = inject(SessionService);
  private readonly browser = inject(BrowserService);
  private readonly titleService = inject(Title);

  public usuario: MemberDisplay | null = null;
  public publicaciones: PublicationDisplay[] = [];
  public cargado = false;
  public previouspage = "Inicio";
  public previouslink = "/home";
  page = 1;
  pageSize = 5;

  language: (typeof Languages)[number] = Languages[0];

  constructor() {}

  ngOnInit(): void {
    this.language = this.session.language();
    const origin = parsePublicOrigin(this.route);
    const originInfo = getPublicOriginInfo(origin);
    this.previouslink = originInfo.route;
    this.previouspage = originInfo.label;
    this.loadProfile();
  }

  expandedKey: string | null = null;

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

  private loadProfile(): void {
    const id = Number(this.route.snapshot.params["id"]);
    if (!id) return;

    const prefijos = this.lookup.prefixes();
    const prefijosMap = new Map(prefijos.map((p) => [p.code, p]));
    const memberTypes = this.lookup.memberTypes();
    const memberTypesMap = new Map(memberTypes.map((t) => [t.code, t]));
    const pubTypes = this.lookup.publicationKinds();
    const pubTypesMap = new Map(pubTypes.map((t) => [t.code, t]));
    const thesisTypes = this.lookup.thesisKinds();
    const thesisTypesMap = new Map(thesisTypes.map((t) => [t.code, t]));
    const journals = this.lookup.journals();
    const journalsMap = new Map(journals.map((j) => [j.id, j]));
    const universities = this.lookup.universities();
    const universitiesMap = new Map(universities.map((u) => [u.id, u]));
    const events = this.lookup.events();
    const eventsMap = new Map(events.map((e) => [e.id, e]));

    this.memberService.getMemberProfile(id).subscribe((res) => {
      if (!res?.member) return;

      const m = res.member;
      const prefijo = m.prefixCode ? prefijosMap.get(m.prefixCode) : undefined;
      const prefix = prefijo && prefijo.label !== "none" && prefijo.label !== "bach" ? prefijo.label : "";
      const memberType = memberTypesMap.get(m.memberTypeCode);
      const active =
        m.isActive === 1
          ? (this.language.detailMemberText?.[0]?.activeMember ?? "")
          : (this.language.detailMemberText?.[0]?.oldMember ?? "");

      this.usuario = { ...m, active, prefix, tipoMiembro: memberType?.nameSingular ?? "" };
      this.titleService.setTitle("GMCAN | " + m.firstName + " " + m.lastName);

      this.publicaciones = (res.publications ?? []).map((pub): PublicationDisplay => {
        const d = parseLocalDate(pub.publishedAt);
        const fecha = d ? (this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM y", "es") ?? "") ?? "") : "";

        const eventId = pub.subtype.kindCode === "conference_paper" ? pub.subtype.conferencePaper.eventId : null;
        const universityId = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.universityId : null;
        const thesisKindCode = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.thesisKindCode : null;
        const journalId = pub.subtype.kindCode === "journal_article" ? pub.subtype.journalArticle.journalId : null;
        const evento = eventId ? eventsMap.get(eventId) : undefined;

        return Object.assign({} as PublicationDisplay, pub, {
          fecha,
          tipoPublicacion: pubTypesMap.get(pub.kindCode)?.name,
          tipoTesis: thesisKindCode ? thesisTypesMap.get(thesisKindCode)?.name : undefined,
          revista: journalId ? journalsMap.get(journalId)?.name : undefined,
          universidad: universityId ? (universitiesMap.get(universityId)?.name ?? undefined) : undefined,
          evento: evento?.name,
          ciudad: evento?.city ?? undefined,
          pais: evento?.country ?? undefined,
        });
      });

      this.cargado = true;
    });
  }

  return(): void {
    this.router.navigateByUrl(this.previouslink);
  }

  profile(memberId: number | undefined): void {
    if (!memberId) return;
    const origin = parsePublicOrigin(this.route);
    this.router.navigate(["/home/detail-member/" + memberId], { queryParams: { from: origin } });
    this.loadProfile();
  }
}
