import { Component, OnInit, HostListener, inject, ChangeDetectionStrategy, computed, signal } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import {
  MatListItem,
  MatListItemIcon,
  MatListItemTitle,
  MatListSubheaderCssMatStyler,
  MatNavList,
} from "@angular/material/list";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDrawerContainer, MatDrawer } from "@angular/material/sidenav";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NavigationEnd } from "@angular/router";
import type { ToolbarBadge } from "@app/dashboard/dashboard.resolvers";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { confirmAction } from "@app/shared/forms/confirm-dialog.component";
import type { Group } from "@app/shared/models/factories";
import { deepestChild, deriveFromRoute, routeTitle } from "@app/shared/routing/derived-data";
import { AuthService } from "@app/shared/services/auth.service";
import { AuthzService } from "@app/shared/services/authz.service";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { UiStateService } from "@app/shared/services/ui-state.service";
import { filter } from "rxjs";

import { DASHBOARD_NAV, visibleNav } from "./nav";

@Component({
  selector: "app-log-home",
  templateUrl: "./log-home.component.html",
  styleUrl: "./log-home.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AvatarComponent,
    MatDrawerContainer,
    MatDrawer,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListSubheaderCssMatStyler,
    MatDivider,
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

  readonly user = this.authService.user;
  readonly userDisplayName = computed(() => {
    const user = this.user();
    if (!user) return "";
    return [user.firstName, user.lastName, user.maternalName].filter(Boolean).join(" ");
  });
  screenWidth: number;
  public url: string;
  readonly grupoinfo = this.uiState.groupInfo;
  readonly nav = computed(() => visibleNav(DASHBOARD_NAV, (capability) => this.authz.can(capability)));

  readonly dashboardTitle = signal("Dashboard");
  readonly toolbarBadge = signal<ToolbarBadge | null>(null);

  constructor() {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
    this.url = GLOBAL.url;
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: UIEvent): void {
    this.screenWidth = window.innerWidth;
    this.enterAny = this.screenWidth < 960;
  }

  ngOnInit(): void {
    this.getGrupoInfo();
    this.syncToolbarTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.syncToolbarTitle());
  }

  private getGrupoInfo(): void {
    this.groupService.getGroup().subscribe((group: Group) => {
      this.uiState.setGroupInfo(group);
      this.restoreSession();
    });
  }

  private restoreSession(): void {
    this.authService.tryRestoreSession().subscribe((user) => {
      if (!user) this.logout();
    });
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

  async openDialogLogOff(): Promise<void> {
    const confirmed = await confirmAction(this.dialog, {
      title: "¿Estás seguro de que deseas cerrar la sesión?",
      text: "Los cambios sin guardar se perderán.",
      confirm: "Sí, cerrar sesión",
      dismiss: "No, cancelar",
    });
    if (confirmed) this.logout();
  }

  private syncToolbarTitle(): void {
    const route = deepestChild(this.router.routerState.snapshot.root);
    this.dashboardTitle.set(routeTitle(route) ?? "Dashboard");
    this.toolbarBadge.set(deriveFromRoute<ToolbarBadge>(route, "toolbarBadge") ?? null);
  }
}
