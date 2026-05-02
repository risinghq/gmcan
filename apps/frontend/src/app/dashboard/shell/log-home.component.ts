import { Component, OnInit, HostListener, inject } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDrawerContainer, MatDrawer } from "@angular/material/sidenav";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DialogIdle } from "@app/shared/modals/dialog-idle.component";
import { createGroup, type Group } from "@app/shared/models/factories";
import type { Member } from "@app/shared/models/member";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { MemberService } from "@app/shared/services/member.service";
import { SessionService } from "@app/shared/services/session.service";

@Component({
  selector: "app-log-home",
  templateUrl: "./log-home.component.html",
  styleUrl: "./log-home.component.scss",
  imports: [
    MatDrawerContainer,
    MatDrawer,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterOutlet,
  ],
})
export default class LogHomeComponent implements OnInit {
  authService = inject(AuthService);
  memberService = inject(MemberService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private commonService = inject(CommonService);
  private groupService = inject(GroupService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  user: Member | null = null;
  screenWidth: number;
  public url: string;
  public grupoinfo: Group;

  title = "Dashboard";
  dashboardTitle = "Dashboard";
  private static readonly DETAIL_NEWS_TITLE =
    '<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span>';

  constructor() {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
    this.url = GLOBAL.url;
    this.grupoinfo = createGroup();
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: UIEvent): void {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
  }

  ngOnInit(): void {
    this.titleService.setTitle("GMCAN | Administrador");
    this.getGrupoInfo();
    this.syncToolbarState();
  }

  noticiaPublicada = false;

  ngAfterViewChecked(): void {
    this.syncToolbarState();
    if (this.commonService.getReset()) {
      this.getUser();
      this.commonService.setReset(false);
    }
  }

  getGrupoInfo(): void {
    this.grupoinfo = this.session.groupInfo();
    this.groupService.getGroup().subscribe((group: Group) => {
      this.grupoinfo = group;
      this.session.setGroupInfo(group);
      (this.grupoinfo as any).logoHeader = this.url + "api/group/" + group.id + "/files/header";
      this.getUser();
    });
    if (this.grupoinfo.id) {
      (this.grupoinfo as any).logoHeader = this.url + "api/group/" + this.grupoinfo.id + "/files/header";
    }
  }

  getUser(): void {
    const user = this.authService.getUser();
    if (user == null) {
      this.logout();
    } else {
      this.user = user;
      this.memberService.getMemberFull(user.id).subscribe((result) => {
        if (result) {
          this.user = result;
        }
      });
    }
  }

  get userDisplayName(): string {
    if (!this.user) return "";
    const parts = [this.user.firstName, this.user.lastName, this.user.maternalName].filter(Boolean);
    return parts.join(" ");
  }

  logout(): void {
    this.session.beginSessionEnd();
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }

  backToTop(): void {
    this.session.beginSessionEnd();
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/"]);
    });
  }

  enterAny: boolean;
  enterAnyway(): void {
    this.enterAny = false;
  }

  textChange(text: string): void {
    this.title = text;
  }

  private dialogRef?: MatDialogRef<DialogIdle>;

  openDialogLogOff(): void {
    this.dialogRef = this.dialog.open(DialogIdle, {
      width: "530px",
      id: "idleTimer",
      data: {
        title: "¿Estás seguro de que deseas cerrar la sesión?",
        text: "Los cambios sin guardar se perderán.",
        cancel: "Sí, cerrar sesión",
        yes: "No, cancelar",
      },
    });

    this.dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.logout();
      }
    });
  }

  private syncToolbarState(): void {
    const currentTitle = this.commonService.defineTitle(window.location.pathname);
    this.dashboardTitle = currentTitle;
    this.noticiaPublicada =
      currentTitle === LogHomeComponent.DETAIL_NEWS_TITLE ? this.session.noticiaPublicada() : false;
  }
}
