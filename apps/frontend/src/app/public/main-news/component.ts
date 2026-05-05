import { NgClass, SlicePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import type { News } from "@app/shared/models/news";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

type NewsDisplay = News & { nombreTipoNoticia: string; fechaFormateada: string; autor: string };
type NewsTypeFilter = { id: number; name: string };

@Component({
  selector: "app-main-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [
    MatIcon,
    MatProgressSpinner,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NgClass,
    SlicePipe,
  ],
})
export default class MainNewsComponent implements OnInit {
  newsService = inject(NewsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  public allNoticias: NewsDisplay[] = [];
  public noticias: NewsDisplay[] = [];
  public tiponoticias: NewsTypeFilter[] = [];
  public screenWidth: number;
  url: string;

  constructor() {
    this.screenWidth = this.browser.innerWidth();
    this.url = GLOBAL.url;
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this.browser.innerWidth();
  }

  public categorySelected = -1;
  public categoryNombre = "";
  public page = 1;
  public pageSize = 10;
  language: any = {};
  allCharged = false;

  ngOnInit(): void {
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | " + this.language.news);
    this.categoryNombre = this.language.newsText[0].categoryTitle;
    this.loadNews();
  }

  loadNews(): void {
    this.allCharged = false;
    this.newsService.listNews().subscribe((news) => {
      const enriched = (news as News[])
        .filter((n) => n.status !== 0)
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

          return Object.assign({} as NewsDisplay, n, {
            nombreTipoNoticia: n.newsTypeName ?? "",
            fechaFormateada,
            autor: n.authorName ?? "",
          });
        });

      this.allNoticias = enriched;

      const categories = new Map<number, NewsTypeFilter>();
      for (const item of enriched) {
        if (item.newsTypeId && item.nombreTipoNoticia && !categories.has(item.newsTypeId)) {
          categories.set(item.newsTypeId, { id: item.newsTypeId, name: item.nombreTipoNoticia });
        }
      }
      this.tiponoticias = [...categories.values()].toSorted((a, b) => (a.name > b.name ? 1 : -1));

      this.applyFilter();
      this.allCharged = true;
    });
  }

  applyFilter(): void {
    if (this.categorySelected === -1) {
      this.noticias = this.allNoticias;
    } else {
      this.noticias = this.allNoticias.filter((n) => n.newsTypeId === this.categorySelected);
    }
  }

  selectCategory(id: number, nombre: string): void {
    this.categorySelected = id;
    this.categoryNombre = nombre;
    this.applyFilter();
    this.page = 1;
  }

  detalleNoticia(noticia: NewsDisplay): void {
    this.router.navigate(["/home/detail-news/" + noticia.id], { queryParams: { from: "news" } });
    this.scroll();
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
