import { Component, computed, inject, ChangeDetectionStrategy } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthzService } from "@app/shared/services/authz.service";
import { type DashboardCountItem, DashboardService } from "@app/shared/services/dashboard.service";
import { GLOBAL } from "@app/shared/services/global";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  type ChartDataset,
  type ChartOptions,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from "chart.js";
import { BaseChartDirective, provideCharts } from "ng2-charts";
import { EMPTY } from "rxjs";

const PALETTE = [
  "rgba(13,56,0,1)",
  "rgba(0,133,51,1)",
  "rgba(0,204,24,1)",
  "rgba(120,240,0,1)",
  "rgba(142,236,152,1)",
  "rgba(0,48,0,1)",
];

function chart(items: DashboardCountItem[], label: string, style: Partial<ChartDataset>) {
  return {
    total: items.reduce((sum, item) => sum + item.count, 0),
    labels: items.map((item) => item.label),
    datasets: [{ ...style, data: items.map((item) => item.count), label }] as ChartDataset[],
  };
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, RouterLinkActive, BaseChartDirective],
  providers: [
    provideCharts({
      registerables: [
        PieController,
        ArcElement,
        BarController,
        BarElement,
        CategoryScale,
        LinearScale,
        Legend,
        Tooltip,
      ],
    }),
  ],
})
export default class DashboardComponent {
  authz = inject(AuthzService);
  /** Only an analytics reader sees the charts, so nobody else asks for the summary. */
  private readonly summary = toSignal(this.authz.can("analytics.read") ? inject(DashboardService).getSummary() : EMPTY);

  readonly manualUrl = GLOBAL.app("grupo/get-manual");

  readonly members = computed(() =>
    chart(this.summary()?.membersByType ?? [], "Miembros", {
      backgroundColor: PALETTE,
      hoverBackgroundColor: PALETTE.map((color) => color.replace(",1)", ",0.8)")),
      borderWidth: 2,
    }),
  );

  readonly publications = computed(() =>
    chart(this.summary()?.publicationsByKind ?? [], "Cantidad", {
      backgroundColor: PALETTE,
      borderColor: PALETTE[0],
      borderWidth: 2,
    }),
  );

  readonly membersChartOptions: ChartOptions = { responsive: true };
  readonly publicationsChartOptions: ChartOptions = { responsive: true, indexAxis: "y" };
}
