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


const routes: Routes = [
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
  {path:"**", component:NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
