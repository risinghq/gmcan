import { SlicePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
  type WritableSignal,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { BreadcrumbComponent } from "@app/shared/components/breadcrumb.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { NewsMetaComponent } from "@app/shared/components/news-meta.component";
import { ProjectMembersComponent } from "@app/shared/components/project-members.component";
import { PublicationItemComponent } from "@app/shared/components/publication-item.component";
import { SearchBoxComponent } from "@app/shared/components/search-box.component";
import { publicationDisplay } from "@app/shared/publication-display";
import { originRoute, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { BrowserService } from "@app/shared/services/browser.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel, dateText } from "@app/shared/utils/date";
import {
  NgbPagination,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
} from "@ng-bootstrap/ng-bootstrap/pagination";
import { map } from "rxjs";

import type { GlobalSearchViewModel } from "./types";

type ProjectDisplay = GlobalSearchViewModel["projects"][number] & { fechaI: string; fechaF: string; moneda?: string };
type NewsDisplay = GlobalSearchViewModel["news"][number] & { nombreTipoNoticia?: string; fechaFormateada: string };

const EMPTY: GlobalSearchViewModel = { publications: [], members: [], news: [], projects: [] };

@Component({
  selector: "app-global-search",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PublicationItemComponent,
    SearchBoxComponent,
    ProjectMembersComponent,
    BreadcrumbComponent,
    AvatarComponent,
    RouterLink,
    IconComponent,
    NewsMetaComponent,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    SlicePipe,
  ],
})
export default class GlobalSearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lookup = inject(LookupService);
  private readonly browser = inject(BrowserService);
  private readonly seo = inject(SeoService);

  protected readonly language = inject(SessionService).language;
  protected readonly query = signal("");
  protected readonly pageSize = 5;
  protected readonly previouslink = originRoute(parsePublicOrigin(this.route.snapshot.queryParamMap.get("from")));

  /** The route reuses this component for the next search, so results come from the resolver each time. */
  private readonly results = toSignal(this.route.data.pipe(map((data) => data["search"] as GlobalSearchViewModel)), {
    initialValue: EMPTY,
  });

  protected readonly publicaciones = computed(() =>
    this.results().publications.map(publicationDisplay(this.lookup, this.language().locale)),
  );
  protected readonly proyectos = computed(() => this.results().projects.map((project) => this.toProject(project)));
  protected readonly miembros = computed(() => this.results().members);
  protected readonly noticias = computed(() => this.results().news.map((news) => this.toNews(news)));

  protected readonly page1 = linkedSignal({ source: this.results, computation: () => 1 });
  protected readonly page2 = linkedSignal({ source: this.results, computation: () => 1 });
  private readonly expandedKey = linkedSignal<GlobalSearchViewModel, string | null>({
    source: this.results,
    computation: () => null,
  });

  protected readonly publicationExpanded = signal(true);
  protected readonly projectExpanded = signal(true);
  protected readonly memberExpanded = signal(true);
  protected readonly newsExpanded = signal(true);

  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      const nombre = params["id"] as string;
      this.seo.setPageTitle("GMCAN | " + nombre);
      this.query.set(nombre);
    });
  }

  searchGlobal(value: string): void {
    if (!value.trim()) return;
    const origin = parsePublicOrigin(this.route.snapshot.queryParamMap.get("from"));
    this.router.navigate(["/search/" + value], { queryParams: { from: origin } });
  }

  toggleExpanded(section: string, index: number): void {
    const key = `${section}:${index}`;
    this.expandedKey.update((current) => (current === key ? null : key));
  }

  isExpanded(section: string, index: number): boolean {
    return this.expandedKey() === `${section}:${index}`;
  }

  expandLabel(section: string, index: number, seeMore: string, seeLess: string): string {
    return this.isExpanded(section, index) ? seeLess : seeMore;
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }

  toggleSection(section: WritableSignal<boolean>): void {
    section.update((expanded) => !expanded);
  }

  private toProject(project: GlobalSearchViewModel["projects"][number]): ProjectDisplay {
    return {
      ...project,
      moneda: this.lookup.currencies().find((currency) => currency.code === project.currencyCode)?.symbol,
      fechaI: dateLabel(project.startDate, "MMMM, y", this.language().locale),
      fechaF: dateLabel(project.endDate, "MMMM, y", this.language().locale),
    };
  }

  private toNews(news: GlobalSearchViewModel["news"][number]): NewsDisplay {
    return {
      ...news,
      nombreTipoNoticia: this.lookup.newsKinds().find((kind) => kind.code === news.newsKindCode)?.name,
      fechaFormateada: dateText(news.publishedAt, "longDate", this.language().locale),
    };
  }
}
