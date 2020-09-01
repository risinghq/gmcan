import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import {DatePipe, TitleCasePipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import  {MatSidenavModule,
          MatToolbarModule,
          MatIconModule,
          MatListModule,
          MatButtonModule,
          MatFormFieldModule,
          MatInputModule,
          MatProgressSpinnerModule,
          MatTabsModule,
          MatDialogModule,
          MatMenuModule,
          MatChipsModule,
          MatTableModule,
          MatPaginatorModule,
          MatSnackBarModule,
          MatSortModule,
          MatCardModule,
          MatSelectModule,
          MatCheckboxModule,
          MatDatepickerModule,
          MatAutocompleteModule, 
          MatProgressBarModule} from '@angular/material';
import { HomeComponent } from './home/home.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { AboutComponent } from './about/about.component';
import { NewsComponent } from './news/news.component'; 
import { registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AutosizeModule} from 'ngx-autosize';

import localePy from '@angular/common/locales/es-PY';
    import localePt from '@angular/common/locales/pt';
    import localeEn from '@angular/common/locales/en';
    import localeEsAr from '@angular/common/locales/es-AR';
import { DetailNewsComponent } from './detail-news/detail-news.component';
import { PublicationComponent } from './publication/publication.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MembersComponent } from './members/members.component';
import { DetailMemberComponent } from './detail-member/detail-member.component';
import { JoinUsComponent, EmailExitoso } from './join-us/join-us.component';
import { MainNewsComponent } from './main-news/main-news.component';
import { ProjectsComponent } from './projects/projects.component';
import { LocalDatePipe } from './services/localdatepipe';
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
import { LogHomeComponent, DialogIdle } from './log-home/log-home.component';
import { NoticiasComponent } from './noticias/noticias.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { PublicacionesComponent } from './publicaciones/publicaciones.component';
import { PerfilComponent } from './perfil/perfil.component';
import { MiembrosComponent } from './miembros/miembros.component';
import { ContenidosComponent, DialogPreview3, DialogPreview6 } from './contenidos/contenidos.component';
import { AuthGuard } from './guards/auth.guard';
import { RandomGuard } from './guards/random.guard';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from './services/auth.service';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'angular2-moment';
import { AddCategoryComponent, DialogCancel } from './add-category/add-category.component';
import { EditCategoryComponent, DialogCancel2, DialogErase } from './edit-category/edit-category.component';
import { AddNewsComponent, DialogCancel3, DialogPublish, DialogPreview } from './add-news/add-news.component'; // optional, provides moment-style pipes for date formatting
import { MomentDateModule } from '@angular/material-moment-adapter';
import { CKEditorModule } from 'ckeditor4-angular';
import { EditNewsComponent, DialogCancel4, DialogPreview2, DialogPublish2, DialogPublish3, DialogErase2 } from './edit-news/edit-news.component';
import { AddMemberComponent, DialogReturn } from './add-member/add-member.component';
import { DeactivateGuard } from './guards/deactivate-guard';
import { EditMemberComponent, DialogReturn2, DialogCancel5 } from './edit-member/edit-member.component';
import { AddMemberGuard } from './guards/change-addmember-guard';
import { EditMemberGuard } from './guards/change-editmember-guard';
import { EditCategoryGuard } from './guards/editcategory.guard';
import { AddNewsGuard } from './guards/addnews.guard';
import { EditNewsGuard } from './guards/editnews.guard';
import { ArticulosComponent } from './articulos/articulos.component';
import { TesisComponent } from './tesis/tesis.component';
import { EventosComponent } from './eventos/eventos.component';
import { AddArticleComponent, DialogCancel12 } from './add-article/add-article.component';
import { AddRevistaComponent, DialogCancel6 } from './add-revista/add-revista.component';
import { AddRevistaGuard } from './guards/addrevista.guard';
import { AddUniversidadComponent, DialogCancel7 } from './add-universidad/add-universidad.component';
import { AddUniversidadGuard } from './guards/adduniversidad.guard';
import { AddEventoComponent, DialogCancel8 } from './add-evento/add-evento.component';
import { AddEventoGuard } from './guards/addevento.guard';
import { EditRevistaComponent, DialogCancel9, DialogErase3 } from './edit-revista/edit-revista.component';
import { EditRevistaGuard } from './guards/editrevista.guard';
import { EditUniversidadComponent, DialogErase4, DialogCancel10 } from './edit-universidad/edit-universidad.component';
import { EditUniversidadGuard } from './guards/edituniversidad.guard';
import { EditEventoComponent, DialogErase5, DialogCancel11 } from './edit-evento/edit-evento.component';
import { EditEventoGuard } from './guards/editevento.guard';
import { AddArticleGuard } from './guards/addarticle.guard';
import { EditArticleComponent, DialogCancel13, DialogErase6 } from './edit-article/edit-article.component';
import { EditArticleGuard } from './guards/editarticle.guard';
import { AddTesisComponent, DialogCancel14 } from './add-tesis/add-tesis.component';
import { AddTesisGuard } from './guards/addtesis.guard';
import { EditTesisComponent, DialogCancel15, DialogErase7 } from './edit-tesis/edit-tesis.component';
import { AddResumenComponent, DialogCancel16 } from './add-resumen/add-resumen.component';
import { AddResumenGuard } from './guards/addresumen.guard';
import { EditTesisGuard } from './guards/edittesis.guard';
import { EditResumenComponent, DialogErase8, DialogCancel17 } from './edit-resumen/edit-resumen.component';
import { EditResumenGuard } from './guards/editresumen.guard';
import { MyArticleComponent } from './my-article/my-article.component';
import { MyThesisComponent } from './my-thesis/my-thesis.component';
import { MyResumenesComponent } from './my-resumenes/my-resumenes.component';
import { AddFuenteComponent, DialogCancel18 } from './add-fuente/add-fuente.component';
import { AddFuenteGuard } from './guards/addfuente.guard';
import { EditFuenteComponent, DialogCancel19, DialogErase9 } from './edit-fuente/edit-fuente.component';
import { EditFuenteGuard } from './guards/editfuente.guard';
import { AddProyectoComponent, DialogCancel20 } from './add-proyecto/add-proyecto.component';
import { AddProyectoGuard } from './guards/addproyecto.guard';
import { EditProyectoComponent, DialogCancel21, DialogErase10 } from './edit-proyecto/edit-proyecto.component';
import { EditProyectoGuard } from './guards/editproyecto.guard';
import { AddLineaComponent, DialogCancel22 } from './add-linea/add-linea.component';
import { EditLineaComponent, DialogErase11, DialogCancel23 } from './edit-linea/edit-linea.component';
import { AddLineGuard } from './guards/addline.guard';
import { AddMethodComponent, DialogCancel24, DialogPreview4 } from './add-method/add-method.component';
import { EditLineGuard } from './guards/editline.guard';
import { AddMethodGuard } from './guards/addmethod.guard';
import { EditMethodComponent, DialogCancel25, DialogErase12, DialogPreview5 } from './edit-method/edit-method.component';
import { EditMethodGuard } from './guards/editmethod.guard';
import { AddEquipoComponent, DialogCancel26 } from './add-equipo/add-equipo.component';
import { AddEquipoGuard } from './guards/addequipo.guard';
import { EditEquipoComponent, DialogCancel27, DialogErase13 } from './edit-equipo/edit-equipo.component';
import { AddSoftwareComponent, DialogCancel28 } from './add-software/add-software.component';
import { EditEquipoGuard } from './guards/editequipo.guard';
import { AddSoftwareGuard } from './guards/addsoftware.guard';
import { EditSoftwareComponent, DialogCancel29, DialogErase14 } from './edit-software/edit-software.component';
import { EditSoftwareGuard } from './guards/editsoftware.guard';

    // registrar los locales con el nombre que quieras utilizar a la hora de proveer
registerLocaleData(localePy, 'es');
registerLocaleData(localePt, 'pt');
registerLocaleData(localeEn, 'en')
registerLocaleData(localeEsAr, 'es-Ar');

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MantenimientoComponent,
    AboutComponent,
    NewsComponent,
    DetailNewsComponent,
    PublicationComponent,
    MembersComponent,
    DetailMemberComponent,
    JoinUsComponent,
    EmailExitoso,
    MainNewsComponent,
    ProjectsComponent,
    LocalDatePipe,
    AboutUsComponent,
    LinesInvestigationComponent,
    MethodComponent,
    FacilitiesComponent,
    WorksComponent,
    GlobalSearchComponent,
    NotFoundComponent,
    LoginComponent,
    DashboardComponent,
    LandingComponent,
    ChangePassComponent,
    LogHomeComponent,
    NoticiasComponent,
    ProyectosComponent,
    PublicacionesComponent,
    PerfilComponent,
    MiembrosComponent,
    ContenidosComponent,
    DialogIdle,
    AddCategoryComponent,
    DialogCancel, DialogCancel2,
    EditCategoryComponent,
    DialogErase,
    AddNewsComponent,
    DialogCancel3,
    DialogPublish,
    DialogPreview,
    EditNewsComponent,
    DialogCancel4,
    DialogPreview2,
    DialogPublish2,
    DialogPublish3,
    DialogErase2,
    AddMemberComponent,
    EditMemberComponent,
    DialogReturn,
    DialogReturn2,
    DialogCancel5,
    ArticulosComponent,
    TesisComponent,
    EventosComponent,
    AddArticleComponent,
    AddRevistaComponent,
    DialogCancel6,
    AddUniversidadComponent,
    DialogCancel7,
    AddEventoComponent,
    DialogCancel8,
    EditRevistaComponent,
    DialogCancel9,
    DialogErase3,
    EditUniversidadComponent,
    DialogErase4,
    DialogCancel10,
    EditEventoComponent,
    DialogErase5, 
    DialogCancel11,
    DialogCancel12,
    EditArticleComponent,
    DialogCancel13,
    DialogErase6,
    AddTesisComponent,
    DialogCancel14, EditTesisComponent, DialogCancel15, DialogErase7, AddResumenComponent, DialogCancel16, EditResumenComponent,
    DialogErase8, DialogCancel17, MyArticleComponent, MyThesisComponent, MyResumenesComponent, AddFuenteComponent, DialogCancel18, EditFuenteComponent,
    DialogCancel19, DialogErase9, AddProyectoComponent, DialogCancel20, EditProyectoComponent,DialogCancel21, DialogErase10, DialogPreview3, AddLineaComponent, DialogCancel22, EditLineaComponent,
    DialogErase11, DialogCancel23, AddMethodComponent, DialogCancel24, EditMethodComponent, DialogCancel25, DialogErase12, DialogPreview4, DialogPreview5, AddEquipoComponent, DialogCancel26, EditEquipoComponent,
    DialogCancel27,DialogErase13, AddSoftwareComponent, DialogCancel28, EditSoftwareComponent , DialogCancel29, DialogErase14, DialogPreview6
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgbModule,
    FormsModule, ReactiveFormsModule,
    MatDialogModule,
    AutosizeModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MomentDateModule,
    MatSelectModule,
    MatSortModule,
    CKEditorModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatProgressBarModule
  ],
  exports:[LocalDatePipe],
  entryComponents:[EmailExitoso, DialogIdle, DialogCancel, DialogCancel2, DialogErase, DialogCancel3,DialogPublish, DialogPreview, DialogCancel4,DialogPreview2, DialogPublish2,
    DialogPublish3, DialogErase2, DialogReturn, DialogReturn2, DialogCancel5, DialogCancel6, DialogCancel7, DialogCancel8, DialogCancel9, DialogErase3, DialogErase4, DialogCancel10,
    DialogErase5, DialogCancel11, DialogCancel12, DialogCancel13, DialogErase6, DialogCancel14, DialogCancel15, DialogErase7, DialogCancel16, DialogErase8, DialogCancel17, DialogCancel18, DialogCancel19, DialogErase9,
    DialogCancel20,DialogCancel21, DialogErase10, DialogPreview3,DialogCancel22, DialogErase11, DialogCancel23, DialogCancel24, DialogCancel25, DialogErase12, DialogPreview4, DialogPreview5, DialogCancel26, DialogCancel27,
    DialogErase13,DialogCancel28, DialogCancel29, DialogErase14, DialogPreview6],
  providers: [DatePipe, TitleCasePipe, {provide: LOCALE_ID, useValue: "es-Ar"}, AuthGuard,
  DeactivateGuard, 
  AddMemberGuard, EditMemberGuard, EditCategoryGuard, AddNewsGuard,
  EditNewsGuard, AddRevistaGuard, AddUniversidadGuard, AddEventoGuard,
  EditRevistaGuard, EditUniversidadGuard,
  EditEventoGuard, AddArticleGuard, EditArticleGuard, AddTesisGuard, 
  EditTesisGuard, AddResumenGuard, EditResumenGuard, AddFuenteGuard, EditFuenteGuard,
  AddProyectoGuard, EditProyectoGuard, AddLineGuard, EditLineGuard, AddMethodGuard, EditMethodGuard,
  AddEquipoGuard, EditEquipoGuard,AddSoftwareGuard, EditSoftwareGuard,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
