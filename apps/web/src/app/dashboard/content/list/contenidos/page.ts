import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { RouterLink } from "@angular/router";

import { ContentTableComponent } from "./content-table.component";
import { ContenidosState } from "./state";

@Component({
  selector: "app-contenidos-page",
  templateUrl: "./page.html",
  styleUrl: "./page.scss",
  providers: [ContenidosState],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatTabGroup, MatTab, RouterLink, ContentTableComponent],
})
export default class ContenidosPage implements OnInit {
  constructor(readonly state: ContenidosState) {}

  ngOnInit(): void {
    this.state.init();
  }
}
