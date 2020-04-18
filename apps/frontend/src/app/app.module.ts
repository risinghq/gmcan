import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import {DatePipe, TitleCasePipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
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
          MatCardModule } from '@angular/material';
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
    GlobalSearchComponent
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
    MatCardModule
  ],
  exports:[LocalDatePipe],
  entryComponents:[EmailExitoso],
  providers: [DatePipe, TitleCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
