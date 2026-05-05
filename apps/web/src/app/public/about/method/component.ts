import { Component, OnInit, inject } from "@angular/core";
import { Languages } from "@app/shared/models/languages";
import { Method } from "@app/shared/models/method";
import { GLOBAL } from "@app/shared/services/global";
import { MethodsService } from "@app/shared/services/methods.service";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-method",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [],
})
export default class MethodComponent implements OnInit {
  private methodService = inject(MethodsService);
  private seo = inject(SeoService);
  private session = inject(SessionService);

  language: (typeof Languages)[number] = Languages[0];
  url: string;

  methods: Method[] = [];

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.seo.setPageTitle("GMCAN | " + this.language.methods);
    this.loadMethods();
  }

  loadMethods(): void {
    this.methodService.list().subscribe((res: Method[]) => {
      this.methods = res;
    });
  }
}
