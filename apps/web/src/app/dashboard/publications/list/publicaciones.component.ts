import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-publicaciones",
  templateUrl: "./publicaciones.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./publicaciones.component.scss",
})
export default class PublicacionesComponent implements OnInit {
  ngOnInit() {}
}
