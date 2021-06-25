import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotosService } from 'src/app/common/services/photos.service';
import { Filmography, Person } from '../person';
import { Gender, ZodiacSign } from '../person-query';
import { PersonFetcherService } from '../services/person-fetcher.service';
import { PersonsService } from '../services/persons.service';
import { PersonAlternateNamesDailogComponent } from './person-alternate-names/person-alternate-names.dialog.component';
import { PersonAwardsDialogComponent } from './person-awards/person-awards.dialog.component';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.css']
})

export class PersonEditComponent implements OnInit {
  model: Person;
  fetched?: Person;
  id: number;
  selectedZodiacSign: string;
  personForm: FormGroup;
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
    private fetcherService: PersonFetcherService,
    private photosService: PhotosService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public awardsDialog: MatDialog,
    public alternateNamesDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({
      sign: ''
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
      event.target.src = this.model.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
    else event.target.src = this.model.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
  }

  save() {
    var val = this.model.zodiacSign;
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

  fetchPersonFromImdb() {
    this.fetcherService.getByUrl(this.model.imdbPageUrl).subscribe(result => {
      this.fetched = result;
      this.model.filmographies = this.fetched.filmographies;
      let imdbPageUrls: string[] = [];
      this.fetched.filmographies?.forEach(function (value) {
        if (value.filmItem)
          imdbPageUrls.push(value.filmItem.imdbPageUrl);
      });

      var batch = 30;
      for (var i = 0; i < imdbPageUrls.length; i += batch)
        this.service.getPersonFilmItems(imdbPageUrls.slice(i, i + batch > imdbPageUrls.length ?
          imdbPageUrls.length - 1 : i + batch - 1
        )).subscribe(result => {
          if (this.model.filmographies)
            this.model.filmographies.forEach(function (value) {
              if (value.filmItem) {
                result.forEach(function (res) {
                  if (res.imdbPageUrl == value.filmItem?.imdbPageUrl) {
                    value.filmItem.id = res.id;
                    value.filmItem.photo = res.photo;
                    //todo use somehow photosService
                    if (value.filmItem.photo)
                      value.filmItem.photo.image = 'data:image/png;base64,'
                        + value.filmItem.photo.image;
                  }
                });
              }
            });
          this.loadFilmCategories();
          this.loadFilmItems();
        }, error => console.log(error));
    }, error => console.log(error));
  }

  loadPerson() {
    this.service.getById(this.id).subscribe(result => {
      this.photosService.fixImage(result.profilePicture);
      this.model = result;
      this.photosService.getPersonPhotos(this.id, 0, this.showPhotos).subscribe(result => {
        this.photosService.fixImages(result);
        this.model.photos = result;
      }, error => console.log(error));

      this.service.getFilmographies(this.id).subscribe(result => {
        this.photosService.fixImagesForFilmographies(result);
        this.model.filmographies = result;
        this.loadFilmCategories();
        this.loadFilmItems();
      }, error => console.log(error));
    }, error => console.log(error));

  }
}
