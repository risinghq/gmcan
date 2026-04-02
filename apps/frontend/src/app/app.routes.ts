import { Routes } from "@angular/router";

import { AboutUsComponent } from "./about-us/about-us.component";
import { AboutComponent } from "./about/about.component";
import { AddArticleComponent } from "./add-article/add-article.component";
import { AddCategoryComponent } from "./add-category/add-category.component";
import { AddEquipoComponent } from "./add-equipo/add-equipo.component";
import { AddEventoComponent } from "./add-evento/add-evento.component";
import { AddFuenteComponent } from "./add-fuente/add-fuente.component";
import { AddLineaComponent } from "./add-linea/add-linea.component";
import { AddMemberComponent } from "./add-member/add-member.component";
import { AddMethodComponent } from "./add-method/add-method.component";
import { AddNewsComponent } from "./add-news/add-news.component";
import { AddProyectoComponent } from "./add-proyecto/add-proyecto.component";
import { AddResumenComponent } from "./add-resumen/add-resumen.component";
import { AddRevistaComponent } from "./add-revista/add-revista.component";
import { AddSoftwareComponent } from "./add-software/add-software.component";
import { AddTesisComponent } from "./add-tesis/add-tesis.component";
import { AddUniversidadComponent } from "./add-universidad/add-universidad.component";
import { ArticulosComponent } from "./articulos/articulos.component";
import { ChangePassComponent } from "./change-pass/change-pass.component";
import { ContenidosComponent } from "./contenidos/contenidos.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DetailMemberComponent } from "./detail-member/detail-member.component";
import { DetailNewsComponent } from "./detail-news/detail-news.component";
import { EditArticleComponent } from "./edit-article/edit-article.component";
import { EditCategoryComponent } from "./edit-category/edit-category.component";
import { EditEquipoComponent } from "./edit-equipo/edit-equipo.component";
import { EditEventoComponent } from "./edit-evento/edit-evento.component";
import { EditFuenteComponent } from "./edit-fuente/edit-fuente.component";
import { EditLineaComponent } from "./edit-linea/edit-linea.component";
import { EditMemberComponent } from "./edit-member/edit-member.component";
import { EditMethodComponent } from "./edit-method/edit-method.component";
import { EditNewsComponent } from "./edit-news/edit-news.component";
import { EditProyectoComponent } from "./edit-proyecto/edit-proyecto.component";
import { EditResumenComponent } from "./edit-resumen/edit-resumen.component";
import { EditRevistaComponent } from "./edit-revista/edit-revista.component";
import { EditSoftwareComponent } from "./edit-software/edit-software.component";
import { EditTesisComponent } from "./edit-tesis/edit-tesis.component";
import { EditUniversidadComponent } from "./edit-universidad/edit-universidad.component";
import { EventosComponent } from "./eventos/eventos.component";
import { FacilitiesComponent } from "./facilities/facilities.component";
import { GlobalSearchComponent } from "./global-search/global-search.component";
import { canDeactivateGuard } from "./guards/deactivate.guard";
import { HomeComponent } from "./home/home.component";
import { JoinUsComponent } from "./join-us/join-us.component";
import { LandingComponent } from "./landing/landing.component";
import { LinesInvestigationComponent } from "./lines-investigation/lines-investigation.component";
import { LogHomeComponent } from "./log-home/log-home.component";
import { LoginComponent } from "./login/login.component";
import { MainNewsComponent } from "./main-news/main-news.component";
import { MantenimientoComponent } from "./mantenimiento/mantenimiento.component";
import { MembersComponent } from "./members/members.component";
import { MethodComponent } from "./method/method.component";
import { MiembrosComponent } from "./miembros/miembros.component";
import { MyArticleComponent } from "./my-article/my-article.component";
import { MyResumenesComponent } from "./my-resumenes/my-resumenes.component";
import { MyThesisComponent } from "./my-thesis/my-thesis.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { NoticiasComponent } from "./noticias/noticias.component";
import { PerfilComponent } from "./perfil/perfil.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ProyectosComponent } from "./proyectos/proyectos.component";
import { PublicacionesComponent } from "./publicaciones/publicaciones.component";
import { PublicationComponent } from "./publication/publication.component";
import { TesisComponent } from "./tesis/tesis.component";
import { WorksComponent } from "./works/works.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "home" },
  {
    path: "home",
    component: LandingComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "publications", component: PublicationComponent },
      { path: "news", component: MainNewsComponent },
      { path: "members", component: MembersComponent },
      { path: "projects", component: ProjectsComponent },
      {
        path: "about-us",
        component: AboutComponent,
        children: [
          { path: "", component: AboutUsComponent },
          { path: "about", component: AboutUsComponent },
          { path: "lines-investigation", component: LinesInvestigationComponent },
          { path: "methods", component: MethodComponent },
          { path: "facilities-resources", component: FacilitiesComponent },
          { path: "works", component: WorksComponent },
        ],
      },
      { path: "detail-news/:id", component: DetailNewsComponent },
      { path: "detail-member/:id", component: DetailMemberComponent },
      { path: "search/:id", component: GlobalSearchComponent },
      { path: "join-us", component: JoinUsComponent },
    ],
  },
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: LogHomeComponent,
    children: [
      { path: "", component: DashboardComponent },
      { path: "miembros-activos", component: MiembrosComponent },
      { path: "miembros-antiguos", component: MiembrosComponent },
      { path: "add-member", component: AddMemberComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-member/:id", component: EditMemberComponent, canDeactivate: [canDeactivateGuard] },
      { path: "publicaciones", component: PublicacionesComponent },
      { path: "proyectos-ejecucion", component: ProyectosComponent },
      { path: "proyectos-concluidos", component: ProyectosComponent },
      { path: "add-project", component: AddProyectoComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-project/:id", component: EditProyectoComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-fuente", component: AddFuenteComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-fuente/:id", component: EditFuenteComponent, canDeactivate: [canDeactivateGuard] },
      { path: "noticias", component: NoticiasComponent },
      { path: "add-news", component: AddNewsComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-news/:id", component: EditNewsComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-category", component: AddCategoryComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-category/:id", component: EditCategoryComponent, canDeactivate: [canDeactivateGuard] },
      { path: "perfil", component: PerfilComponent },
      { path: "contenidos", component: ContenidosComponent },
      { path: "add-linea", component: AddLineaComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-linea/:id", component: EditLineaComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-method", component: AddMethodComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-method/:id", component: EditMethodComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-equipo", component: AddEquipoComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-equipo/:id", component: EditEquipoComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-software", component: AddSoftwareComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-software/:id", component: EditSoftwareComponent, canDeactivate: [canDeactivateGuard] },
      { path: "articulos", component: ArticulosComponent },
      { path: "add-article", component: AddArticleComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-article/:id", component: EditArticleComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-revista", component: AddRevistaComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-revista/:id", component: EditRevistaComponent, canDeactivate: [canDeactivateGuard] },
      { path: "tesis", component: TesisComponent },
      { path: "add-thesis", component: AddTesisComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-thesis/:id", component: EditTesisComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-universidad", component: AddUniversidadComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-universidad/:id", component: EditUniversidadComponent, canDeactivate: [canDeactivateGuard] },
      { path: "eventos", component: EventosComponent },
      { path: "add-resumen", component: AddResumenComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-resumen/:id", component: EditResumenComponent, canDeactivate: [canDeactivateGuard] },
      { path: "add-evento", component: AddEventoComponent, canDeactivate: [canDeactivateGuard] },
      { path: "edit-evento/:id", component: EditEventoComponent, canDeactivate: [canDeactivateGuard] },
      { path: "my-articles", component: MyArticleComponent },
      { path: "my-thesis", component: MyThesisComponent },
      { path: "my-abstracts", component: MyResumenesComponent },
      { path: "**", component: NotFoundComponent },
    ],
  },
  { path: "reset-password", component: ChangePassComponent },
  { path: "mantenimiento", component: MantenimientoComponent },
  { path: "**", component: NotFoundComponent },
];
