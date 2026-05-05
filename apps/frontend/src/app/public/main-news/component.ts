import { NgClass, SlicePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

type NewsDisplay = PublicNewsListItem & { nombreTipoNoticia: string; fechaFormateada: string; autor: string };
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
  lookup = inject(LookupService);
  router = inject(Router);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  public noticias: NewsDisplay[] = [];
  public tiponoticias: NewsTypeFilter[] = [];
  public screenWidth: number;
  public total = 0;
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
    this.tiponoticias = this.lookup.newsTypes().toSorted((a, b) => (a.name > b.name ? 1 : -1));
    this.loadNews();
  }

  loadNews(): void {
    this.allCharged = false;
    this.newsService
      .listNews({
        status: 1,
        newsTypeId: this.categorySelected === -1 ? undefined : this.categorySelected,
        sortBy: "publishedAt",
        sortOrder: "desc",
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe((response) => {
        this.noticias = response.items.map((n): NewsDisplay => {
          const d = new Date(n.publishedAt ?? "");
          if (String(d) !== "Invalid Date") {
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          }
          const fechaFormateada =
            String(d) === "Invalid Date"
              ? ""
              : (new Intl.DateTimeFormat("es", { month: "long", day: "2-digit", year: "numeric" }).format(d) ?? "");

          return Object.assign({} as NewsDisplay, n, {
            nombreTipoNoticia: n.newsTypeName,
            fechaFormateada,
            autor: n.authorName,
          });
        });
        this.total = response.total;
        this.allCharged = true;
      });
  }

  selectCategory(id: number, nombre: string): void {
    this.categorySelected = id;
    this.categoryNombre = nombre;
    this.page = 1;
    this.loadNews();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadNews();
    this.scroll();
  }

  detalleNoticia(noticia: NewsDisplay): void {
    this.router.navigate(["/home/detail-news/" + noticia.id], { queryParams: { from: "news" } });
    this.scroll();
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
