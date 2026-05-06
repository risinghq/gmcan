import { Component, OnInit, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import type { Group } from "@app/shared/models/group";
import { AuthzService } from "@app/shared/services/authz.service";
import { DashboardService } from "@app/shared/services/dashboard.service";
import { GroupService } from "@app/shared/services/group.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  imports: [RouterLink, RouterLinkActive, BaseChartDirective],
})
export default class DashboardComponent implements OnInit {
  authz = inject(AuthzService);
  groupService = inject(GroupService);
  private dashboardService = inject(DashboardService);
  private uiState = inject(UiStateService);

  screenWidth = window.innerWidth;
  public grupoinfo: Group;

  constructor() {
    this.grupoinfo = this.uiState.groupInfo();
  }

  ngOnInit(): void {
    this.getGrupoInfo();
    this.loadDashboardSummary();
  }

  getGrupoInfo(): void {
    this.grupoinfo = this.uiState.groupInfo();
  }

  total = 0;
  total2 = 0;

  loadDashboardSummary(): void {
    this.dashboardService.getSummary().subscribe((summary) => {
      this.total = summary.membersByType.reduce((sum, item) => sum + item.count, 0);
      this.chartLabels = summary.membersByType.map((item) => item.label);
      this.chartDatasets = [{ data: summary.membersByType.map((item) => item.count), label: "Miembros" }];

      this.total2 = summary.publicationsByKind.reduce((sum, item) => sum + item.count, 0);
      this.chartLabels2 = summary.publicationsByKind.map((item) => item.label);
      this.chartDatasets2 = [{ data: summary.publicationsByKind.map((item) => item.count), label: "Cantidad" }];
    });
  }

  public chartType: any = "pie";

  public chartDatasets: Array<any> = [
    {
      data: [],
      label: "Miembros",
      backgroundColor: [
        "rgba(13,56,0,1)",
        "rgba(0,133,51,1)",
        "rgba(0,204,24,1)",
        "rgba(120,240,0,1)",
        "rgba(142,236,152,1)",
        "rgba(0,48,0,1)",
      ],
      hoverBackgroundColor: [
        "rgba(13,56,0,0.8)",
        "rgba(0,133,51,0.8)",
        "rgba(0,204,24,0.8)",
        "rgba(120,240,0,0.8)",
        "rgba(142,236,152,0.8)",
        "rgba(0,48,0,0.8)",
      ],
      borderWidth: 2,
    },
  ];

  public chartLabels: string[] = [];

  public chartOptions: any = {
    responsive: true,
  };
  public chartClicked(_e: any): void {}
  public chartHovered(_e: any): void {}

  public chartType2: any = "bar";

  public chartDatasets2: Array<any> = [
    {
      data: [],
      label: "Cantidad",
      backgroundColor: [
        "rgba(13,56,0,1)",
        "rgba(0,133,51,1)",
        "rgba(0,204,24,1)",
        "rgba(120,240,0,1)",
        "rgba(142,236,152,1)",
        "rgba(0,48,0,1)",
      ],
      borderColor: [
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
        "rgba(13,56,0,1)",
      ],
      borderWidth: 2,
    },
  ];

  public chartLabels2: string[] = [];

  public chartOptions2: any = {
    responsive: true,
    indexAxis: "y",
  };
  public chartClicked2(_e: any): void {}
  public chartHovered2(_e: any): void {}
}
