import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonsService } from './persons/services/persons.service';
import { PersonFetcherService } from './persons/services/person-fetcher.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PersonPhotosComponent } from './persons/person-photos/person-photos.component';
import { PersonEditComponent } from './persons/person-edit/person-edit.component';
import { PersonAwardsComponent } from './persons/person-awards/person-awards.component';
import { FilmsService } from './films/services/films.service';
import { FilmEditComponent } from './films/film-edit/film-edit.component';
import { PhotosService } from './common/services/photos.service';
import { FilmPhotosComponent } from './films/film-photos/film-photos.component';

@NgModule({
  declarations: [
    AppComponent,
    PersonsComponent,
    NavMenuComponent,
    PersonEditComponent,
    PersonPhotosComponent,
    PersonAwardsComponent,
    FilmEditComponent,
    FilmPhotosComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: PersonsComponent, pathMatch: 'full' },
      { path: 'persons', component: PersonsComponent },
      { path: 'person/:id', component: PersonEditComponent },
      { path: 'person/:id/photos', component: PersonPhotosComponent },
      { path: 'film/:id/photos', component: FilmPhotosComponent },
      { path: 'person/:id/awards', component: PersonAwardsComponent },
      { path: 'film/:id', component: FilmEditComponent }
    ]),
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule
  ],
  providers: [
    PersonsService,
    PersonFetcherService,
    FilmsService,
    PhotosService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
