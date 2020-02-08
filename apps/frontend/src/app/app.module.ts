import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import {DatePipe} from '@angular/common';
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
          MatTabsModule } from '@angular/material';
import { HomeComponent } from './home/home.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { AboutComponent } from './about/about.component';
import { NewsComponent } from './news/news.component'; 
import { registerLocaleData } from '@angular/common';

import localePy from '@angular/common/locales/es-PY';
    import localePt from '@angular/common/locales/pt';
    import localeEn from '@angular/common/locales/en';
    import localeEsAr from '@angular/common/locales/es-AR';
import { DetailNewsComponent } from './detail-news/detail-news.component';
import { PublicationComponent } from './publication/publication.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
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
  ],
  providers: [DatePipe, {provide: LOCALE_ID, useValue: 'es-Ar'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
