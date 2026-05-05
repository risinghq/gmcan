import { Directive, HostBinding, HostListener, Input, OnChanges } from "@angular/core";

@Directive({
  selector: "img[appImg]",
  standalone: true,
})
export class AppImgDirective implements OnChanges {
  @Input() appImg: string | null = null;
  @Input() fallbackSrc: string = "/img/placeholders/user.png";

  @HostBinding("src") src: string = this.fallbackSrc;

  ngOnChanges(): void {
    this.src = this.appImg ?? this.fallbackSrc;
  }

  @HostListener("error")
  onError(): void {
    this.src = this.fallbackSrc;
  }
}
