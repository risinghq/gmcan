import { Component, OnInit, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Languages } from "@app/shared/models/languages";
import { Method } from "@app/shared/models/method";
import { GLOBAL } from "@app/shared/services/global";
import { MethodsService } from "@app/shared/services/methods.service";

@Component({
  selector: "app-method",
  templateUrl: "./method.component.html",
  styleUrls: ["./method.component.scss"],
  imports: [],
})
export default class MethodComponent implements OnInit {
  _methodService = inject(MethodsService);
  private titleService = inject(Title);

  language: (typeof Languages)[number] = Languages[0];
  url: string;

  methods: Method[] = [];

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.language = JSON.parse(localStorage.getItem("language") ?? JSON.stringify(Languages[0]));
    this.titleService.setTitle("GMCAN | " + this.language.methods);
    this.getMethods();
  }

  ngAfterViewChecked(): void {
    if (this.methods) {
      for (let index = 0; index < this.methods.length; index++) {
        const descripcion = document.getElementById("descripcion" + index);
        if (descripcion) {
          descripcion.innerHTML = this.methods[index].descripcion ?? "";
        }
      }
    }
  }

  getMethods(): void {
    this._methodService.getMethods().subscribe((res: unknown) => {
      this.methods = res as Method[];
    });
  }
}
