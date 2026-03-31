import { DatePipe, TitleCasePipe } from "@angular/common";
import { registerLocaleData } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import localeEn from "@angular/common/locales/en";
import localeEsAr from "@angular/common/locales/es-AR";
import localePy from "@angular/common/locales/es-PY";
import localePt from "@angular/common/locales/pt";
import { NgModule, LOCALE_ID, provideZonelessChangeDetection } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MomentDateModule } from "@angular/material-moment-adapter";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { BrowserModule, Meta } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from "ng2-charts";
import { AutosizeModule } from "ngx-autosize";

import { AboutUsComponent } from "./about-us/about-us.component";
import { AboutComponent } from "./about/about.component";
import { AddArticleComponent, DialogCancel12 } from "./add-article/add-article.component";
import { AddCategoryComponent, DialogCancel } from "./add-category/add-category.component";
import { AddEquipoComponent, DialogCancel26 } from "./add-equipo/add-equipo.component";
import { AddEventoComponent, DialogCancel8 } from "./add-evento/add-evento.component";
import { AddFuenteComponent, DialogCancel18 } from "./add-fuente/add-fuente.component";
import { AddLineaComponent, DialogCancel22 } from "./add-linea/add-linea.component";
import { AddMemberComponent, DialogReturn } from "./add-member/add-member.component";
import { AddMethodComponent, DialogCancel24, DialogPreview4 } from "./add-method/add-method.component";
import { AddNewsComponent, DialogCancel3, DialogPublish, DialogPreview } from "./add-news/add-news.component";
import { AddProyectoComponent, DialogCancel20 } from "./add-proyecto/add-proyecto.component";
import { AddResumenComponent, DialogCancel16 } from "./add-resumen/add-resumen.component";
import { AddRevistaComponent, DialogCancel6 } from "./add-revista/add-revista.component";
import { AddSoftwareComponent, DialogCancel28 } from "./add-software/add-software.component";
import { AddTesisComponent, DialogCancel14 } from "./add-tesis/add-tesis.component";
import { AddUniversidadComponent, DialogCancel7 } from "./add-universidad/add-universidad.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ArticulosComponent } from "./articulos/articulos.component";
import { ChangePassComponent } from "./change-pass/change-pass.component";
import { ContenidosComponent, DialogPreview3, DialogPreview6 } from "./contenidos/contenidos.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DetailMemberComponent } from "./detail-member/detail-member.component";
import { DetailNewsComponent } from "./detail-news/detail-news.component";
import { EditArticleComponent, DialogCancel13, DialogErase6 } from "./edit-article/edit-article.component";
import { EditCategoryComponent, DialogCancel2, DialogErase } from "./edit-category/edit-category.component";
import { EditEquipoComponent, DialogCancel27, DialogErase13 } from "./edit-equipo/edit-equipo.component";
import { EditEventoComponent, DialogErase5, DialogCancel11 } from "./edit-evento/edit-evento.component";
import { EditFuenteComponent, DialogCancel19, DialogErase9 } from "./edit-fuente/edit-fuente.component";
import { EditLineaComponent, DialogErase11, DialogCancel23 } from "./edit-linea/edit-linea.component";
import { EditMemberComponent, DialogReturn2, DialogCancel5 } from "./edit-member/edit-member.component";
import {
  EditMethodComponent,
  DialogCancel25,
  DialogErase12,
  DialogPreview5,
} from "./edit-method/edit-method.component";
import {
  EditNewsComponent,
  DialogCancel4,
  DialogPreview2,
  DialogPublish2,
  DialogPublish3,
  DialogErase2,
} from "./edit-news/edit-news.component";
import { EditProyectoComponent, DialogCancel21, DialogErase10 } from "./edit-proyecto/edit-proyecto.component";
import { EditResumenComponent, DialogErase8, DialogCancel17 } from "./edit-resumen/edit-resumen.component";
import { EditRevistaComponent, DialogCancel9, DialogErase3 } from "./edit-revista/edit-revista.component";
import { EditSoftwareComponent, DialogCancel29, DialogErase14 } from "./edit-software/edit-software.component";
import { EditTesisComponent, DialogCancel15, DialogErase7 } from "./edit-tesis/edit-tesis.component";
import { EditUniversidadComponent, DialogErase4, DialogCancel10 } from "./edit-universidad/edit-universidad.component";
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
import { AuthGuard } from "./guards/auth.guard";
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
import { JoinUsComponent, EmailExitoso } from "./join-us/join-us.component";
import { LandingComponent } from "./landing/landing.component";
import { LinesInvestigationComponent } from "./lines-investigation/lines-investigation.component";
import { LogHomeComponent, DialogIdle, DialogLogOff } from "./log-home/log-home.component";
import { LoginComponent } from "./login/login.component";
import { MainNewsComponent } from "./main-news/main-news.component";
import { MantenimientoComponent } from "./mantenimiento/mantenimiento.component";
import { MembersComponent } from "./members/members.component";
import { MethodComponent } from "./method/method.component";
import { MiembrosComponent } from "./miembros/miembros.component";
import { MyArticleComponent } from "./my-article/my-article.component";
import { MyResumenesComponent } from "./my-resumenes/my-resumenes.component";
import { MyThesisComponent } from "./my-thesis/my-thesis.component";
import { NewsComponent } from "./news/news.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { NoticiasComponent } from "./noticias/noticias.component";
import { PerfilComponent } from "./perfil/perfil.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ProyectosComponent } from "./proyectos/proyectos.component";
import { PublicacionesComponent } from "./publicaciones/publicaciones.component";
import { PublicationComponent } from "./publication/publication.component";
import { LocalDatePipe } from "./services/localdatepipe";
import { SessionService } from "./services/session.service";
import { TesisComponent } from "./tesis/tesis.component";
import { TokenInterceptor } from "./token.interceptor";
import { WorksComponent } from "./works/works.component";

registerLocaleData(localePy, "es");
registerLocaleData(localePt, "pt");
registerLocaleData(localeEn, "en");
registerLocaleData(localeEsAr, "es-Ar");

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
    DialogCancel,
    DialogCancel2,
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
    DialogLogOff,
    DialogCancel14,
    EditTesisComponent,
    DialogCancel15,
    DialogErase7,
    AddResumenComponent,
    DialogCancel16,
    EditResumenComponent,
    DialogErase8,
    DialogCancel17,
    MyArticleComponent,
    MyThesisComponent,
    MyResumenesComponent,
    AddFuenteComponent,
    DialogCancel18,
    EditFuenteComponent,
    DialogCancel19,
    DialogErase9,
    AddProyectoComponent,
    DialogCancel20,
    EditProyectoComponent,
    DialogCancel21,
    DialogErase10,
    DialogPreview3,
    AddLineaComponent,
    DialogCancel22,
    EditLineaComponent,
    DialogErase11,
    DialogCancel23,
    AddMethodComponent,
    DialogCancel24,
    EditMethodComponent,
    DialogCancel25,
    DialogErase12,
    DialogPreview4,
    DialogPreview5,
    AddEquipoComponent,
    DialogCancel26,
    EditEquipoComponent,
    DialogCancel27,
    DialogErase13,
    AddSoftwareComponent,
    DialogCancel28,
    EditSoftwareComponent,
    DialogCancel29,
    DialogErase14,
    DialogPreview6,
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
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    AutosizeModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    NgIdleKeepaliveModule.forRoot(),
    HttpClientModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MomentDateModule,
    MatSelectModule,
    MatSortModule,
    CKEditorModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    BaseChartDirective,
  ],
  exports: [LocalDatePipe],
  providers: [
    provideZonelessChangeDetection(),
    provideCharts(withDefaultRegisterables()),
    DatePipe,
    TitleCasePipe,
    {
      provide: LOCALE_ID,
      deps: [SessionService],
      useFactory: (sessionService) => sessionService.locale,
    },
    AuthGuard,
    Meta,
    DeactivateGuard,
    AddMemberGuard,
    EditMemberGuard,
    EditCategoryGuard,
    AddNewsGuard,
    EditNewsGuard,
    AddRevistaGuard,
    AddUniversidadGuard,
    AddEventoGuard,
    EditRevistaGuard,
    EditUniversidadGuard,
    EditEventoGuard,
    AddArticleGuard,
    EditArticleGuard,
    AddTesisGuard,
    EditTesisGuard,
    AddResumenGuard,
    EditResumenGuard,
    AddFuenteGuard,
    EditFuenteGuard,
    AddProyectoGuard,
    EditProyectoGuard,
    AddLineGuard,
    EditLineGuard,
    AddMethodGuard,
    EditMethodGuard,
    AddEquipoGuard,
    EditEquipoGuard,
    AddSoftwareGuard,
    EditSoftwareGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
