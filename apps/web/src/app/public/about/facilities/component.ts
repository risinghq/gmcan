import { Component, computed, inject, input, ChangeDetectionStrategy } from "@angular/core";
import type { FacilitiesData } from "@app/public/about/data";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-facilities",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export default class FacilitiesComponent {
  private seo = inject(SeoService);
  private session = inject(SessionService);

  readonly language = this.session.language;
  readonly facilities = input.required<FacilitiesData>();
  readonly grupo = computed(() => this.facilities().group);
  readonly software = computed(() => this.facilities().software);
  readonly machines = computed(() =>
    this.facilities().equipment.map((machine) => ({
      id: machine.id,
      name: machine.name,
      specs: [
        { label: "CPU", value: machine.cpu },
        { label: "RAM", value: machine.ram },
        { label: "GPU", value: machine.gpu },
        { label: "HD", value: machine.storage },
      ].filter((spec) => spec.value),
    })),
  );

  constructor() {
    this.seo.setPageTitle("GMCAN | " + this.language().resources);
  }
}
