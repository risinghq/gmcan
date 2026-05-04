import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import type { Group } from "@app/shared/models/group";
import { AuthzService } from "@app/shared/services/authz.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { BaseChartDirective } from "ng2-charts";

interface CountTypeItem {
  name?: string;
  total?: string | number;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  imports: [RouterLink, RouterLinkActive, BaseChartDirective],
})
export default class DashboardComponent implements OnInit {
  authz = inject(AuthzService);
  groupService = inject(GroupService);
  private http = inject(HttpClient);
  private uiState = inject(UiStateService);

  screenWidth = window.innerWidth;
  public url: string;
  public grupoinfo: Group;

  constructor() {
    this.url = GLOBAL.url;
    this.grupoinfo = this.uiState.groupInfo();
  }

  ngOnInit(): void {
    this.getGrupoInfo();
    this.getCountTypeMember();
  }

  getGrupoInfo(): void {
    this.grupoinfo = this.uiState.groupInfo();
  }

  total = 0;
  total2 = 0;

  getCountTypeMember(): void {
    this.http.get<CountTypeItem[]>(`${GLOBAL.url}api/members/count-by-type`).subscribe((res) => {
      if (res && res.length > 0) {
        const labels: string[] = [];
        const data: string[] = [];
        for (const item of res) {
          labels.push(String(item.name ?? ""));
          data.push(String(item.total ?? "0"));
          this.total += Number(item.total ?? 0);
        }
        this.chartLabels = labels;
        this.chartDatasets = [{ data, label: "Miembros" }];
      }
      this.getCountTypePublication();
    });
  }

  getCountTypePublication(): void {
    this.http.get<CountTypeItem[]>(`${GLOBAL.url}api/publications/count-by-type`).subscribe((res) => {
      if (res && res.length > 0) {
        const labels: string[] = [];
        const data: string[] = [];
        for (const item of res) {
          labels.push(String(item.name ?? ""));
          data.push(String(item.total ?? "0"));
          this.total2 += Number(item.total ?? 0);
        }
        data.push("0");
        this.chartLabels2 = labels;
        this.chartDatasets2 = [{ data, label: "Cantidad" }];
      }
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
