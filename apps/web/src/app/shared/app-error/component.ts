import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

@Component({
  selector: "app-app-error",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [RouterLink],
})
export default class AppErrorComponent {
  private route = inject(ActivatedRoute);
  readonly code = computed(() => this.route.snapshot.queryParamMap.get("code") ?? "internal_error");
}
