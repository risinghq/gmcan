import { SlicePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import type { Member } from "@app/shared/models/member";
import type { News } from "@app/shared/models/news";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import { forkJoin } from "rxjs";

type NewsDisplay = News & { nombreTipoNoticia: string; fechaFormateada: string; autor: string };

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrl: "./news.component.scss",
  imports: [SlicePipe],
})
export default class NewsComponent implements OnInit {
  _newsService = inject(NewsService);
  _memberService = inject(MemberService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  lookup = inject(LookupService);
  private _browser = inject(BrowserService);
  private _navigationHistory = inject(NavigationHistoryService);
  private _session = inject(SessionService);

  public noticias: NewsDisplay[] = [];
  public noticiaPrincipal: NewsDisplay | null = null;
  url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  numberShown = 5;

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.numberShown = this._browser.innerWidth() >= 1300 ? 10 : 5;
  }

  public title = "";
  public idNoticiaE = 0;
  language: any = {};

  ngOnInit(): void {
    this.language = this._session.language();
    this.numberShown = this._browser.innerWidth() >= 1300 ? 10 : 5;
    this.idNoticiaE = Number(this._route.snapshot.params["id"]) || 0;
    this.loadNoticias();
  }

  ngDoCheck(): void {
    this.title = this.language.news;
    if (this._router.url.includes("/detail-news")) {
      this.title = this.language.moreNews;
    }
  }

  loadNoticias(): void {
    forkJoin({
      news: this._newsService.listNews(),
      members: this._memberService.listMembers(),
    }).subscribe(({ news, members }) => {
      const membersMap = new Map((members as Member[]).map((m) => [m.id, m]));
      const newsTypesMap = new Map(this.lookup.newsTypes().map((t) => [t.id, t]));

      const enriched = (news as News[])
        .filter((n) => n.status !== 0 && n.id !== this.idNoticiaE)
        .toSorted((a, b) => {
          const left = new Date(a.publishedAt ?? "").getTime();
          const right = new Date(b.publishedAt ?? "").getTime();
          return right - left;
        })
        .map((n): NewsDisplay => {
          const d = new Date(n.publishedAt ?? "");
          if (String(d) !== "Invalid Date") {
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          }
          const fechaFormateada =
            String(d) === "Invalid Date"
              ? ""
              : (new Intl.DateTimeFormat("es", { month: "long", day: "2-digit", year: "numeric" }).format(d) ?? "");

          const newsType = n.newsTypeId ? newsTypesMap.get(n.newsTypeId) : undefined;
          const member = n.authorId ? membersMap.get(n.authorId) : undefined;
          const autor = member ? `${member.firstName} ${member.lastName}`.trim() : "";

          return Object.assign({} as NewsDisplay, n, {
            nombreTipoNoticia: newsType?.name ?? "",
            fechaFormateada,
            autor,
          });
        });

      this.noticiaPrincipal = enriched[0] ?? null;
      this.noticias = enriched.slice(1);
    });
  }

  detalleNoticia(noticia: NewsDisplay): void {
    this._router.navigate(["/home/detail-news/" + noticia.id]);
    this.scroll();
  }

  scroll(): void {
    this._browser.scrollIntoViewById("main-toolbar");
  }
}
