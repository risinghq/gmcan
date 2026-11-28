import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import type { IconName } from "@app/shared/components/icon/icons";
import type { Capability } from "@app/shared/models/capabilities";
import { AuthzService } from "@app/shared/services/authz.service";
import { type DashboardCountItem, DashboardService } from "@app/shared/services/dashboard.service";
import { GLOBAL } from "@app/shared/services/global";
import { ArcElement, type ChartDataset, type ChartOptions, PieController, Tooltip } from "chart.js";
import { BaseChartDirective, provideCharts } from "ng2-charts";
import { EMPTY } from "rxjs";

const PALETTE = [
  "rgba(13,56,0,1)",
  "rgba(0,107,46,1)",
  "rgba(0,163,58,1)",
  "rgba(92,214,92,1)",
  "rgba(179,237,176,1)",
  "rgba(118,140,122,1)",
];

interface Action {
  path: string;
  icon: IconName;
  title: string;
  text: string;
  capability?: Capability;
}

const ACTIONS: Action[] = [
  {
    path: "/dashboard/news",
    icon: "news",
    title: "Gestionar noticias",
    text: "Puedes crear, editar o eliminar una noticia.",
    capability: "news.write",
  },
  {
    path: "/dashboard/miembros-activos",
    icon: "users",
    title: "Gestionar miembros del grupo",
    text: "Puedes crear, editar o eliminar a un miembro del grupo.",
    capability: "members.read",
  },
  {
    path: "/dashboard/articulos",
    icon: "article",
    title: "Gestionar publicaciones",
    text: "Puedes crear, editar o eliminar una publicación del grupo.",
    capability: "publications.write",
  },
  {
    path: "/dashboard/proyectos-ejecucion",
    icon: "briefcase",
    title: "Gestionar proyectos",
    text: "Puedes crear, editar o eliminar un proyecto del grupo.",
    capability: "projects.write",
  },
  {
    path: "/dashboard/contenidos",
    icon: "file-description",
    title: "Gestionar contenidos",
    text: "Puedes modificar algunos contenidos de la plataforma.",
    capability: "content.write",
  },
  {
    path: "/dashboard/perfil",
    icon: "user",
    title: "Gestionar perfil",
    text: "Puedes actualizar tu información personal.",
  },
];

function chart(items: DashboardCountItem[], label: string, style: Partial<ChartDataset>) {
  return {
    total: items.reduce((sum, item) => sum + item.count, 0),
    legend: items.map((item, index) => ({ ...item, color: PALETTE[index % PALETTE.length] })),
    labels: items.map((item) => item.label),
    datasets: [{ ...style, data: items.map((item) => item.count), label }] as ChartDataset[],
  };
}

function bars(items: DashboardCountItem[]) {
  const longest = Math.max(1, ...items.map((item) => item.count));
  return {
    total: items.reduce((sum, item) => sum + item.count, 0),
    rows: items.map((item) => ({ ...item, share: (item.count / longest) * 100 })),
  };
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, BaseChartDirective],
  providers: [
    provideCharts({
      registerables: [PieController, ArcElement, Tooltip],
    }),
  ],
})
export default class DashboardComponent {
  private readonly authz = inject(AuthzService);

  readonly analytics = computed(() => this.authz.can("analytics.read"));
  readonly actions = computed(() =>
    ACTIONS.filter((action) => !action.capability || this.authz.can(action.capability)),
  );

  /** Only an analytics reader sees the charts, so nobody else asks for the summary. */
  private readonly summary = toSignal(this.analytics() ? inject(DashboardService).getSummary() : EMPTY);

  readonly manualUrl = GLOBAL.app("grupo/get-manual");
  readonly googleAnalyticsUrl = "https://analytics.google.com/analytics/web/?authuser=2#/a181640955p250909666/admin";
  readonly hotjarUrl = "https://insights.hotjar.com/login?next=%2Fsites%2F2066869%2Fdashboard";

  readonly members = computed(() =>
    chart(this.summary()?.membersByType ?? [], "Miembros", {
      backgroundColor: PALETTE,
      hoverBackgroundColor: PALETTE.map((color) => color.replace(",1)", ",0.8)")),
      borderWidth: 2,
    }),
  );

  readonly publications = computed(() => bars(this.summary()?.publicationsByKind ?? []));

  readonly membersChartOptions: ChartOptions = { responsive: true };
}
