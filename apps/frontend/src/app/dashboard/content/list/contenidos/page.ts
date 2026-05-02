import { Component, OnInit } from "@angular/core";
import { MatTab, MatTabGroup } from "@angular/material/tabs";

import { ContenidosState } from "./state";
import { ContenidosAboutTab } from "./tabs/about";
import { ContenidosFutureTab } from "./tabs/future";
import { ContenidosLinesTab } from "./tabs/lines";
import { ContenidosOtherTab } from "./tabs/other";
import { ContenidosResourcesTab } from "./tabs/resources";

@Component({
  selector: "app-contenidos-page",
  templateUrl: "./page.html",
  providers: [ContenidosState],
  imports: [
    MatTabGroup,
    MatTab,
    ContenidosAboutTab,
    ContenidosLinesTab,
    ContenidosResourcesTab,
    ContenidosFutureTab,
    ContenidosOtherTab,
  ],
})
export default class ContenidosPage implements OnInit {
  constructor(readonly state: ContenidosState) {}

  ngOnInit(): void {
    this.state.init();
    this.state.getLineasInvestigacion();
    this.state.getMetodos();
  }
}
