import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { PersonsService } from './persons/services/persons.service';
import { PersonFetcherService } from './persons/services/person-fetcher.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgImageFullscreenViewModule } from 'ng-image-fullscreen-view';

import { PersonComponent } from './persons/person-view/person.component';
import { PersonAwardsDialogComponent } from './persons/person-edit/person-awards/person-awards.dialog.component';
import { FilmsService } from './films/services/films.service';
import { FilmComponent } from './films/film-view/film.component';
import { PhotosService } from './common/services/photos.service';
import { FilmAnotherNamesDialogComponent } from './films/film-edit/film-another-names/film-anotherNames.dialog.component';
import { PersonAlternateNamesDailogComponent } from './persons/person-edit/person-alternate-names/person-alternate-names.dialog.component';
import { FilmAwardsDialogComponent } from './films/film-edit/film-awards/film-awards.dialog.component';
import { FilmCastAndCrewDialogComponent } from './films/film-edit/film-cast-crew/film-cast-crew.dialog.component';
import { PersonsComponent } from './persons/persons-list/persons.component';
import { FilmPhotosDialogComponent } from './films/film-photos/film-photos.dialog.component';
import { PersonPhotosDialogComponent } from './persons/person-photos/person-photos.dialog.component';
import { FilmEditDialogComponent } from './films/film-edit/film-edit.dialog.component';
import { CountriesService } from './common/services/countries.service';
import { CompaniesService } from './common/services/companies.service';
import { GenresService } from './common/services/genres.service';
import { FilmPersonDialogComponent } from './films/film-edit/film-person/film-person.dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    PersonsComponent,
    NavMenuComponent,
    PersonComponent,
    PersonPhotosDialogComponent,
    PersonAwardsDialogComponent,
    FilmComponent,
    FilmPhotosDialogComponent,
    FilmAnotherNamesDialogComponent,
    PersonAlternateNamesDailogComponent,
    FilmAwardsDialogComponent,
    FilmCastAndCrewDialogComponent,
    FilmEditDialogComponent,
    FilmPersonDialogComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: PersonsComponent, pathMatch: 'full' },
      { path: 'persons', component: PersonsComponent },
      { path: 'person/:id', component: PersonComponent },
      // { path: 'person/:id/awards', component: PersonAwardsComponent },
      { path: 'film/:id', component: FilmComponent },
    ]),
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
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
    MatToolbarModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatAutocompleteModule,
    NgImageFullscreenViewModule
  ],
  providers: [
    PersonsService,
    PersonFetcherService,
    FilmsService,
    PhotosService,
    CountriesService,
    CompaniesService,
    GenresService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }