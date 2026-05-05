import { Component, OnInit, HostListener, inject } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDrawerContainer, MatDrawer } from "@angular/material/sidenav";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NavigationEnd } from "@angular/router";
import type { ToolbarBadge } from "@app/dashboard/dashboard.resolvers";
import { DialogIdle } from "@app/shared/modals/dialog-idle.component";
import { createGroup, type Group } from "@app/shared/models/factories";
import type { Member } from "@app/shared/models/member";
import { AuthService } from "@app/shared/services/auth.service";
import { AuthzService } from "@app/shared/services/authz.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { filter } from "rxjs";

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
  authz = inject(AuthzService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  private groupService = inject(GroupService);
  private uiState = inject(UiStateService);
  private titleService = inject(Title);

  user: Member | null = null;
  screenWidth: number;
  public url: string;
  public grupoinfo: Group;

  dashboardTitle = "Dashboard";
  toolbarBadge: ToolbarBadge | null = null;

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
    this.syncToolbarTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.syncToolbarTitle());
    if (this.uiState.profileUpdated()) {
      this.getUser();
      this.uiState.setProfileUpdated(false);
    }
  }

  getGrupoInfo(): void {
    this.grupoinfo = this.uiState.groupInfo();
    this.groupService.getGroup().subscribe((group: Group) => {
      this.grupoinfo = group;
      this.uiState.setGroupInfo(group);
      this.getUser();
    });
  }

  getUser(): void {
    this.authService.tryRestoreSession().subscribe((user) => {
      if (!user) {
        this.logout();
        return;
      }
      this.user = user;
    });
  }

  get userDisplayName(): string {
    if (!this.user) return "";
    const parts = [this.user.firstName, this.user.lastName, this.user.maternalName].filter(Boolean);
    return parts.join(" ");
  }

  logout(): void {
    this.uiState.beginSessionEnd();
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }

  backToTop(): void {
    this.uiState.beginSessionEnd();
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/"]);
    });
  }

  enterAny: boolean;
  enterAnyway(): void {
    this.enterAny = false;
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

  private syncToolbarTitle(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    this.dashboardTitle = (route.title as string) ?? "Dashboard";
    this.toolbarBadge = (route.data["toolbarBadge"] as ToolbarBadge | undefined) ?? null;
  }
}
