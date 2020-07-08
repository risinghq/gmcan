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
          MatDatepickerModule } from '@angular/material';
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
import { ContenidosComponent } from './contenidos/contenidos.component';
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
    DialogCancel5
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
    MatCheckboxModule
  ],
  exports:[LocalDatePipe],
  entryComponents:[EmailExitoso, DialogIdle, DialogCancel, DialogCancel2, DialogErase, DialogCancel3,DialogPublish, DialogPreview, DialogCancel4,DialogPreview2, DialogPublish2,
    DialogPublish3, DialogErase2, DialogReturn, DialogReturn2, DialogCancel5],
  providers: [DatePipe, TitleCasePipe, {provide: LOCALE_ID, useValue: "es-Ar"}, AuthGuard,
  DeactivateGuard, 
  AddMemberGuard,
  EditMemberGuard,
  EditCategoryGuard,
  AddNewsGuard,
  EditNewsGuard,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
