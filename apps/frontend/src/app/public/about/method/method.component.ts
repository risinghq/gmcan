import { NgFor, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Languages } from "@app/shared/models/languages";
import { Method } from "@app/shared/models/method";
import { GLOBAL } from "@app/shared/services/global";
import { MethodsService } from "@app/shared/services/methods.service";

@Component({
  selector: "app-method",
  templateUrl: "./method.component.html",
  styleUrls: ["./method.component.scss"],
  imports: [NgFor, NgIf],
})
export default class MethodComponent implements OnInit {
  language: (typeof Languages)[number] = Languages[0];
  url: string;

  methods: Method[] = [];

  constructor(
    public _methodService: MethodsService,
    private titleService: Title,
  ) {
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
