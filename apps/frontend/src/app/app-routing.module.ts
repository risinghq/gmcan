import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { AboutComponent } from './about/about.component';
import { DetailNewsComponent } from './detail-news/detail-news.component';
import { PublicationComponent } from './publication/publication.component';
import { MembersComponent } from './members/members.component';
import { DetailMemberComponent } from './detail-member/detail-member.component';
import { JoinUsComponent } from './join-us/join-us.component';
import { MainNewsComponent } from './main-news/main-news.component';
import { ProjectsComponent } from './projects/projects.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { LinesInvestigationComponent } from './lines-investigation/lines-investigation.component';
import { MethodComponent } from './method/method.component';
import { FacilitiesComponent } from './facilities/facilities.component';
import { WorksComponent } from './works/works.component';
import { GlobalSearchComponent } from './global-search/global-search.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingComponent } from './landing/landing.component';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { LogHomeComponent } from './log-home/log-home.component';
import { MiembrosComponent } from './miembros/miembros.component';
import { PublicacionesComponent } from './publicaciones/publicaciones.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { NoticiasComponent } from './noticias/noticias.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ContenidosComponent } from './contenidos/contenidos.component';
import { AddCategoryComponent } from './add-category/add-category.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { AddNewsComponent } from './add-news/add-news.component';
import { EditNewsComponent } from './edit-news/edit-news.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { DeactivateGuard } from './guards/deactivate-guard';
import { EditMemberComponent } from './edit-member/edit-member.component';
import { AddMemberGuard } from './guards/change-addmember-guard';
import { EditMemberGuard } from './guards/change-editmember-guard';
import { EditCategoryGuard } from './guards/editcategory.guard';
import { EditNewsGuard } from './guards/editnews.guard';
import { AddNewsGuard } from './guards/addnews.guard';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {path:"home",component:LandingComponent,children:[
    {path:"", component:HomeComponent},
    {path:"publications", component:PublicationComponent},
    {path:"news", component:MainNewsComponent},
    {path:"members", component:MembersComponent},
    {path:"projects", component:ProjectsComponent},
    {path:"about-us", component:AboutComponent, children: [
      {path: '', component: AboutUsComponent},
      {path: 'about', component: AboutUsComponent},
      {path: 'lines-investigation', component: LinesInvestigationComponent},
      {path: 'methods', component: MethodComponent},
      {path: 'facilities-resources', component: FacilitiesComponent},
      {path: 'works', component: WorksComponent}
    ]},
    {path:"detail-news/:id", component:DetailNewsComponent},
    {path:"detail-member/:id", component:DetailMemberComponent},
    {path:"search/:id", component:GlobalSearchComponent},
    {path:"join-us", component:JoinUsComponent},
  ]},
  {path:"login", component:LoginComponent},
  {path:"dashboard", component:LogHomeComponent, children: [
    {path: '', component: DashboardComponent},
    {path: 'miembros-activos', component: MiembrosComponent},
    {path: 'miembros-antiguos', component: MiembrosComponent},
    {path: 'add-member', component: AddMemberComponent, canDeactivate: [AddMemberGuard]},
    {path: 'edit-member/:id', component: EditMemberComponent , canDeactivate: [EditMemberGuard]},
    {path: 'publicaciones', component: PublicacionesComponent},
    {path: 'proyectos', component: ProyectosComponent},
    {path: 'noticias', component: NoticiasComponent},
    {path: 'add-news', component: AddNewsComponent, canDeactivate:[AddNewsGuard]},
    {path: 'edit-news/:id', component: EditNewsComponent, canDeactivate:[EditNewsGuard]},
    {path: 'add-category', component: AddCategoryComponent, canDeactivate: [DeactivateGuard]},
    {path: 'edit-category/:id', component: EditCategoryComponent, canDeactivate: [EditCategoryGuard]},
    {path: 'perfil', component: PerfilComponent},
    {path: 'contenidos', component: ContenidosComponent},
  ]},
  {path:"recover/:id", component:ChangePassComponent},
  {path:"**", component:NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
