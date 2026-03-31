import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

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
import { AddArticleGuard } from "./guards/addarticle.guard";
import { AddEquipoGuard } from "./guards/addequipo.guard";
import { AddEventoGuard } from "./guards/addevento.guard";
import { AddFuenteGuard } from "./guards/addfuente.guard";
import { AddLineGuard } from "./guards/addline.guard";
import { AddMethodGuard } from "./guards/addmethod.guard";
import { AddNewsGuard } from "./guards/addnews.guard";
import { AddProyectoGuard } from "./guards/addproyecto.guard";
import { AddResumenGuard } from "./guards/addresumen.guard";
import { AddRevistaGuard } from "./guards/addrevista.guard";
import { AddSoftwareGuard } from "./guards/addsoftware.guard";
import { AddTesisGuard } from "./guards/addtesis.guard";
import { AddUniversidadGuard } from "./guards/adduniversidad.guard";
import { AddMemberGuard } from "./guards/change-addmember-guard";
import { EditMemberGuard } from "./guards/change-editmember-guard";
import { DeactivateGuard } from "./guards/deactivate-guard";
import { EditArticleGuard } from "./guards/editarticle.guard";
import { EditCategoryGuard } from "./guards/editcategory.guard";
import { EditEquipoGuard } from "./guards/editequipo.guard";
import { EditEventoGuard } from "./guards/editevento.guard";
import { EditFuenteGuard } from "./guards/editfuente.guard";
import { EditLineGuard } from "./guards/editline.guard";
import { EditMethodGuard } from "./guards/editmethod.guard";
import { EditNewsGuard } from "./guards/editnews.guard";
import { EditProyectoGuard } from "./guards/editproyecto.guard";
import { EditResumenGuard } from "./guards/editresumen.guard";
import { EditRevistaGuard } from "./guards/editrevista.guard";
import { EditSoftwareGuard } from "./guards/editsoftware.guard";
import { EditTesisGuard } from "./guards/edittesis.guard";
import { EditUniversidadGuard } from "./guards/edituniversidad.guard";
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

const routes: Routes = [
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
      { path: "add-member", component: AddMemberComponent, canDeactivate: [AddMemberGuard] },
      { path: "edit-member/:id", component: EditMemberComponent, canDeactivate: [EditMemberGuard] },
      { path: "publicaciones", component: PublicacionesComponent },
      { path: "proyectos-ejecucion", component: ProyectosComponent },
      { path: "proyectos-concluidos", component: ProyectosComponent },
      { path: "add-project", component: AddProyectoComponent, canDeactivate: [AddProyectoGuard] },
      {
        path: "edit-project/:id",
        component: EditProyectoComponent,
        canDeactivate: [EditProyectoGuard],
      },
      { path: "add-fuente", component: AddFuenteComponent, canDeactivate: [AddFuenteGuard] },
      { path: "edit-fuente/:id", component: EditFuenteComponent, canDeactivate: [EditFuenteGuard] },
      { path: "noticias", component: NoticiasComponent },
      { path: "add-news", component: AddNewsComponent, canDeactivate: [AddNewsGuard] },
      { path: "edit-news/:id", component: EditNewsComponent, canDeactivate: [EditNewsGuard] },
      { path: "add-category", component: AddCategoryComponent, canDeactivate: [DeactivateGuard] },
      {
        path: "edit-category/:id",
        component: EditCategoryComponent,
        canDeactivate: [EditCategoryGuard],
      },
      { path: "perfil", component: PerfilComponent },
      { path: "contenidos", component: ContenidosComponent },
      { path: "add-linea", component: AddLineaComponent, canDeactivate: [AddLineGuard] },
      { path: "edit-linea/:id", component: EditLineaComponent, canDeactivate: [EditLineGuard] },
      { path: "add-method", component: AddMethodComponent, canDeactivate: [AddMethodGuard] },
      { path: "edit-method/:id", component: EditMethodComponent, canDeactivate: [EditMethodGuard] },
      { path: "add-equipo", component: AddEquipoComponent, canDeactivate: [AddEquipoGuard] },
      { path: "edit-equipo/:id", component: EditEquipoComponent, canDeactivate: [EditEquipoGuard] },
      { path: "add-software", component: AddSoftwareComponent, canDeactivate: [AddSoftwareGuard] },
      {
        path: "edit-software/:id",
        component: EditSoftwareComponent,
        canDeactivate: [EditSoftwareGuard],
      },
      { path: "articulos", component: ArticulosComponent },
      { path: "add-article", component: AddArticleComponent, canDeactivate: [AddArticleGuard] },
      {
        path: "edit-article/:id",
        component: EditArticleComponent,
        canDeactivate: [EditArticleGuard],
      },
      { path: "add-revista", component: AddRevistaComponent, canDeactivate: [AddRevistaGuard] },
      {
        path: "edit-revista/:id",
        component: EditRevistaComponent,
        canDeactivate: [EditRevistaGuard],
      },
      { path: "tesis", component: TesisComponent },
      { path: "add-thesis", component: AddTesisComponent, canDeactivate: [AddTesisGuard] },
      { path: "edit-thesis/:id", component: EditTesisComponent, canDeactivate: [EditTesisGuard] },
      {
        path: "add-universidad",
        component: AddUniversidadComponent,
        canDeactivate: [AddUniversidadGuard],
      },
      {
        path: "edit-universidad/:id",
        component: EditUniversidadComponent,
        canDeactivate: [EditUniversidadGuard],
      },
      { path: "eventos", component: EventosComponent },
      { path: "add-resumen", component: AddResumenComponent, canDeactivate: [AddResumenGuard] },
      {
        path: "edit-resumen/:id",
        component: EditResumenComponent,
        canDeactivate: [EditResumenGuard],
      },
      { path: "add-evento", component: AddEventoComponent, canDeactivate: [AddEventoGuard] },
      { path: "edit-evento/:id", component: EditEventoComponent, canDeactivate: [EditEventoGuard] },
      { path: "my-articles", component: MyArticleComponent },
      { path: "my-thesis", component: MyThesisComponent },
      { path: "my-abstracts", component: MyResumenesComponent },
      { path: "**", component: NotFoundComponent },
    ],
  },
  { path: "reset-password", component: ChangePassComponent },
  { path: "**", component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
