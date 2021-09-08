import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotosService } from 'src/app/common/services/photos.service';
import { Filmography, Person } from '../person';
import { PersonsService } from '../services/persons.service';
import { PersonAlternateNamesDailogComponent } from '../person-edit/person-alternate-names/person-alternate-names.dialog.component';
import { PersonAwardsDialogComponent } from '../person-edit/person-awards/person-awards.dialog.component';
import { formatDate } from '@angular/common';
import { Gender } from '../enums';
import { PersonPhotosDialogComponent } from '../person-photos/person-photos.dialog.component';
import { PersonEditDialogComponent } from '../person-edit/person-edit.dialog.component';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserRole } from 'src/app/auth/user.model';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})

export class PersonComponent implements OnInit {
  private userSub: Subscription;

  model: Person;
  id: number;
  selectedZodiacSign: string;
  editMode: boolean = false;

  selectedFilmographyCatName: string = "";
  filmographyCategoryNames: string[] = [];

  selectedFlmSortBy: string = 'Year';
  sortChoicesForFilms: string[] = ['Year'];
  sortAscending: boolean;

  filmographies: Filmography[];

  // zodiacSigns: any[] = Object.keys(ZodiacSign).filter(e => !isNaN(+e)).map(o => { return { index: +o, name: ZodiacSign[+o] } });
  public genders = Object.keys(Gender).filter(e => !isNaN(+e)).map(o => { return { index: +o, name: Gender[+o] } });
  // genders: string[] = Object.keys(Gender).filter(val => isNaN(Number(val)));

  showPhotos: number = 5;

  constructor(private service: PersonsService,
    private photosService: PhotosService,
    private route: ActivatedRoute,
    private router: Router,
    public awardsDialog: MatDialog,
    public alternateNamesDialog: MatDialog,
    public personEditDialog: MatDialog,
    public photosDialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      if (user.role == UserRole.Admin)
        this.editMode = true;
      this.editMode = false;
    });
    this.route.queryParams.subscribe(
      params => {
        this.selectedFilmographyCatName = params['flmCatName'];
        this.selectedFlmSortBy = params['flmSortBy'] ? params['flmSortBy'] : this.selectedFlmSortBy;
        this.sortAscending = params['flmSortAscending'] === "true" ? true : false;
      }
    );
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.loadPerson();
    });
  }

  setDefaultProfilePicture(event: any) {
    if (typeof this.model.sex == "string")
      event.target.src = this.model.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    else event.target.src = this.model.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
  }

  openAwardsDialog() {
    const dialogRef = this.awardsDialog.open(PersonAwardsDialogComponent, {
      width: '800px',
      data: { personId: this.id, personName: this.model.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openAlternateNamesDialog() {
    const dialogRef = this.alternateNamesDialog.open(PersonAlternateNamesDailogComponent, {
      width: '400px',
      data: { personName: this.model.name, alternateNames: this.model.alternateNames }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openEditDialog() {
    const dialogRef = this.personEditDialog.open(PersonEditDialogComponent, {
      width: '1000px',
      data: { personName: this.model.name, personId: this.model.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openPhotosDialog() {
    const dialogRef = this.photosDialog.open(PersonPhotosDialogComponent, {
      width: '1000px',
      data: { personName: this.model.name, personId: this.model.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  sortingChanged() {
    this.sortAscending = !this.sortAscending;
    this.loadFilmItems();
  }

  changeQueryParams() {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {
          flmCatName: this.selectedFilmographyCatName,
          flmSortBy: this.selectedFlmSortBy,
          flmSortAscending: this.sortAscending
        },
        replaceUrl: true,
        queryParamsHandling: 'merge'
      });
  }

  loadFilmCategories() {
    this.selectedFilmographyCatName ??= this.model.filmographies?.[0].categoryName ?? "";
    this.filmographyCategoryNames =
      [...new Set((this.model.filmographies?.map(item => item.categoryName) ?? [])
        // .concat(this.fetched?.filmographies?.map(item => item.categoryName) ?? [])
      )];
  }

  loadFilmItems() {
    if (this.model.filmographies) {
      let items: Filmography[] = [];
      let catName = this.selectedFilmographyCatName;
      this.model.filmographies.forEach(function (val) {
        if (val.categoryName == catName)
          items.push(val);
      });
      items.sort((a, b) => {
        switch (this.selectedFlmSortBy) {
          case 'Year':
            return this.sortAscending ? (a.year && (!b.year || a.year < b.year) ? -1 : 1)
              : (b.year && (!a.year || a.year < b.year) ? 1 : -1);
          default: throw new Error("Sorting is not Implemented");
        }
      });
      this.filmographies = items;
      this.changeQueryParams();
    }
  }

  formatDate(dateTime: Date | undefined): string | undefined {
    if (dateTime)
      return formatDate(dateTime, 'yyyy-MM-dd', 'en-US');

    return undefined;
  }

  loadPerson() {
    this.service.getById(this.id).subscribe(result => {
      this.model = result;

      this.photosService.getPersonPhotos(this.id, 0, this.showPhotos).subscribe(result => {
        this.model.photos = result;
      }, error => console.log(error));

      this.service.getFilmographies(this.id).subscribe(result => {
        this.model.filmographies = result;
        this.loadFilmCategories();
        this.loadFilmItems();
      }, error => console.log(error));
    }, error => console.log(error));

  }
}
