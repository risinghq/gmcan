import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from "@angular/material/table";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import type { JournalItem } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { ListTable, byName } from "@app/shared/tables/list-table";

import { type PublicationRow, publicationRows, publicationSearchText, publicationSort } from "../publication-row";

/** Every journal article, and the journals an article cites. */
@Component({
  selector: "app-articulos",
  templateUrl: "./articulos.component.html",
  styleUrl: "./articulos.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabGroup,
    MatTab,
    MatIcon,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
  ],
})
export default class ArticulosComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly lookup = inject(LookupService);
  private readonly tabState = inject(TabStateService);

  readonly displayedColumns = ["titulo", "primerAutor", "publicacion", "DOI"];
  readonly displayedColumns2 = ["nombre"];
  readonly articles = new ListTable<PublicationRow>({ search: publicationSearchText, sort: publicationSort });
  readonly journals = new ListTable<JournalItem>({ sort: byName });
  selectedTab = this.tabState.articleTab();
  private readonly publications = toSignal(
    inject(PublicationService).listPublications({ kindCode: "journal_article" }),
    {
      initialValue: [],
    },
  );

  private readonly articlesSort = viewChild.required("articlesSort", { read: MatSort });
  private readonly articlesPaginator = viewChild.required("articlesPaginator", { read: MatPaginator });
  private readonly journalsSort = viewChild.required("journalsSort", { read: MatSort });
  private readonly journalsPaginator = viewChild.required("journalsPaginator", { read: MatPaginator });

  constructor() {
    effect(() => this.articles.show(publicationRows(this.publications(), this.lookup)));
    effect(() => this.journals.show(this.lookup.journals()));
  }

  ngAfterViewInit(): void {
    this.articles.attach(this.articlesSort(), this.articlesPaginator());
    this.journals.attach(this.journalsSort(), this.journalsPaginator());
  }

  changedTab(event: number): void {
    this.tabState.articleTab.set(event);
  }

  addRevista(): void {
    this.router.navigate(["dashboard/add-revista"]);
  }

  editRevista(id: number): void {
    this.router.navigate(["dashboard/edit-revista/" + id]);
  }

  addArticle(): void {
    this.router.navigate(["dashboard/add-article/"], { queryParams: { returnTo: "articulos" } });
  }

  editArticulo(id: number): void {
    this.router.navigate(["dashboard/edit-article/" + id], { queryParams: { returnTo: "articulos" } });
  }
}
