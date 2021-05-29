import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonsService } from './persons/services/persons.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    AppComponent,
    PersonsComponent,
    NavMenuComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: PersonsComponent, pathMatch: 'full' },
      { path: 'persons', component: PersonsComponent }
    ]),
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule
  ],
  providers: [
    PersonsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
