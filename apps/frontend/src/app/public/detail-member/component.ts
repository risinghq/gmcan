import { DatePipe, SlicePipe, TitleCasePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { Languages } from "@app/shared/models/languages";
import type { Member } from "@app/shared/models/member";
import type { Publication } from "@app/shared/models/publication";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { SessionService } from "@app/shared/services/session.service";
import { parseLocalDate } from "@app/shared/utils/date";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

type MemberDisplay = Member & { active: string; prefix: string; tipoMiembro: string };

type PublicationDisplay = Publication & {
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
  ],
})
export default class DetailMemberComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titlecasePipe = inject(TitleCasePipe);
  private readonly datePipe = inject(DatePipe);
  private readonly memberService = inject(MemberService);
  private readonly lookup = inject(LookupService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly previousService = inject(PreviousPageService);
  private readonly session = inject(SessionService);
  private readonly browser = inject(BrowserService);
  private readonly titleService = inject(Title);

  public usuario: MemberDisplay | null = null;
  public publicaciones: PublicationDisplay[] = [];
  public cargado = false;
  public previouspage = "";
  public previouslink: string | null = null;
  public url: string;
  page = 1;
  pageSize = 5;

  language: (typeof Languages)[number] = Languages[0];

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.previouslink = this.navigationHistory.previousUrl();
    this.previouspage = this.previousService.getPreviousPage(this.previouslink ?? "");
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

    const prefijos = this.lookup.prefijos();
    const prefijosMap = new Map(prefijos.map((p) => [p.idPrefijo, p]));
    const memberTypes = this.lookup.memberTypes();
    const memberTypesMap = new Map(memberTypes.map((t) => [t.id, t]));
    const pubTypes = this.lookup.publicationTypes();
    const pubTypesMap = new Map(pubTypes.map((t) => [t.id, t]));
    const thesisTypes = this.lookup.thesisTypes();
    const thesisTypesMap = new Map(thesisTypes.map((t) => [t.id, t]));
    const journals = this.lookup.journals();
    const journalsMap = new Map(journals.map((j) => [j.id, j]));
    const universities = this.lookup.universities();
    const universitiesMap = new Map(universities.map((u) => [u.id, u]));
    const events = this.lookup.events();
    const eventsMap = new Map(events.map((e) => [e.id, e]));

    this.memberService.getMemberProfile(id).subscribe((res) => {
      if (!res?.member) return;

      const m = res.member;
      const prefijo = m.prefixId ? prefijosMap.get(m.prefixId) : undefined;
      const prefix = prefijo && prefijo.nombre !== "Ninguno" && prefijo.nombre !== "Bachiller" ? prefijo.nombre : "";
      const memberType = memberTypesMap.get(m.memberTypeId);
      const active =
        m.status === 1
          ? (this.language.detailMemberText?.[0]?.activeMember ?? "")
          : (this.language.detailMemberText?.[0]?.oldMember ?? "");

      this.usuario = { ...m, active, prefix, tipoMiembro: memberType?.nameSingular ?? "" };
      this.titleService.setTitle("GMCAN | " + m.firstName + " " + m.lastName);

      this.publicaciones = (res.publications ?? []).map((pub): PublicationDisplay => {
        const d = parseLocalDate(pub.publishedAt);
        const fecha = d ? (this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM y", "es") ?? "") ?? "") : "";

        const evento = pub.eventId ? eventsMap.get(pub.eventId) : undefined;

        return Object.assign({} as PublicationDisplay, pub, {
          fecha,
          tipoPublicacion: pubTypesMap.get(pub.typeId)?.name,
          tipoTesis: pub.thesisTypeId ? thesisTypesMap.get(pub.thesisTypeId)?.name : undefined,
          revista: pub.journalId ? journalsMap.get(pub.journalId)?.name : undefined,
          universidad: pub.universityId ? (universitiesMap.get(pub.universityId)?.name ?? undefined) : undefined,
          evento: evento?.name,
          ciudad: evento?.city ?? undefined,
          pais: evento?.country ?? undefined,
        });
      });

      this.cargado = true;
    });
  }

  return(): void {
    this.router.navigate([this.previouslink ?? "/home"]);
  }

  profile(memberId: number | undefined): void {
    if (!memberId) return;
    this.router.navigate(["/home/detail-member/" + memberId]);
    this.loadProfile();
  }
}
