import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { AboutComponent } from './about/about.component';


const routes: Routes = [
  {path:"", component:HomeComponent},
  {path:"publications", component:MantenimientoComponent},
  {path:"news", component:MantenimientoComponent},
  {path:"members", component:MantenimientoComponent},
  {path:"about-us", component:AboutComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
