import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Company } from "src/app/common/company";
import { Country } from "src/app/common/country";
import { Photo } from "src/app/common/photo";
import { CompaniesService } from "src/app/common/services/companies.service";
import { CountriesService } from "src/app/common/services/countries.service";
import { GenresService } from "src/app/common/services/genres.service";
import { PhotosService } from "src/app/common/services/photos.service";
import { Film } from "../film";
import { FilmGenre } from "../filmGenre";
import { FilmsService } from "../services/films.service";

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from "@angular/material/chips";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable } from "rxjs";
import { map, startWith } from 'rxjs/operators';
import { FilmAnotherNamesDialogComponent } from "./film-another-names/film-anotherNames.dialog.component";
import { FilmPhotosDialogComponent } from "../film-photos/film-photos.dialog.component";

@Component({
    selector: 'app-film-edit',
    templateUrl: './film-edit.dialog.component.html',
    styleUrls: ['./film-edit.dialog.component.css']
})

export class FilmEditDialogComponent {
    model: Film;
    anotherNames: string[];

    loading: boolean = true;
    showPhotos: number = 5;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    companies: Company[];
    companyCtrl = new FormControl();
    filteredCompanies: Observable<Company[]>;


    genres: FilmGenre[];
    genreCtrl = new FormControl();
    filteredGenres: Observable<FilmGenre[]>;

    countries: Country[];
    countryCtrl = new FormControl();
    filteredCountries: Observable<Country[]>;

    @ViewChild('genreInput') genreInput: ElementRef<HTMLInputElement>;
    @ViewChild('companyInput') companyInput: ElementRef<HTMLInputElement>;
    @ViewChild('countryInput') countryInput: ElementRef<HTMLInputElement>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
        private filmService: FilmsService,
        private photosService: PhotosService,
        private companiesService: CompaniesService,
        private genresService: GenresService,
        private countriesService: CountriesService,
        public anotherNamesDialog: MatDialog,
        public photosDialog: MatDialog
    ) {
        if (!data.film)
            this.loadFilm();
        else {
            this.model = data.film;
            this.data.filmName = data.film.name;
        }
        this.loadCompanies();
        this.loadCountries();
        this.loadGenres();
    }

    openAnotherNamesDialog() {
        this.anotherNamesDialog.open(FilmAnotherNamesDialogComponent, {
            width: '800px',
            data: {
                filmName: this.model.name,
                filmId: this.model.id,
                editMode: true
            }
        });
    }

    openPhotosDialog() {
        const dialogRef = this.photosDialog.open(FilmPhotosDialogComponent, {
            width: '1000px',
            data: { filmId: this.model.id, filmName: this.model.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    onFileSelected() {
        const inputNode: any = document.querySelector('#file');

        if (typeof (FileReader) !== 'undefined') {
            const reader = new FileReader();

            reader.onload = (e: any) => {
                if (this.model.photo)
                    this.model.photo.image = e.target.result;
                else {
                    this.model.photo = new Photo;
                    this.model.photo.image = e.target.result;
                }
            };

            reader.readAsDataURL(inputNode.files[0]);
        }
    }

    onCloseClick() {

    }

    addGenreToModel(value: string) {
        var genre = this.genres.find(g => g.name == value);

        if (!genre || this.model.genres?.find(g => g.id == genre?.id))
            return;

        if (!this.model.genres)
            this.model.genres = [];
        this.model.genres.push(genre);
    }

    addGenre(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        this.addGenreToModel(value);
        event.chipInput!.clear();
        this.genreCtrl.setValue(null);
    }

    removeGenre(genre: FilmGenre): void {
        if (!this.model.genres)
            return;

        const index = this.model.genres.indexOf(genre);

        if (index >= 0)
            this.model.genres.splice(index, 1);
    }

    selectedGenre(event: MatAutocompleteSelectedEvent): void {
        this.addGenreToModel(event.option.viewValue);
        this.genreInput.nativeElement.value = '';
        this.genreCtrl.setValue(null);
    }

    private _filterGenres(value: string): FilmGenre[] {
        const filterValue = value.toLowerCase();

        return this.genres.filter(genre => genre.name.toLowerCase().includes(filterValue));
    }


    addCompanyToModel(value: string) {
        var company = this.companies.find(g => g.name == value);

        if (!company || this.model.companies?.find(g => g.id == company?.id))
            return;

        if (!this.model.companies)
            this.model.companies = [];
        this.model.companies.push(company);
    }

    addCompany(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        this.addCompanyToModel(value);
        event.chipInput!.clear();
        this.companyCtrl.setValue(null);
    }

    removeCompany(company: Company): void {
        if (!this.model.companies)
            return;

        const index = this.model.companies.indexOf(company);

        if (index >= 0)
            this.model.companies.splice(index, 1);
    }

    selectedCompany(event: MatAutocompleteSelectedEvent): void {
        this.addCompanyToModel(event.option.viewValue);
        this.companyInput.nativeElement.value = '';
        this.companyCtrl.setValue(null);
    }

    private _filterCompanies(value: string): Company[] {
        const filterValue = value.toLowerCase();

        return this.companies.filter(company => company.name.toLowerCase().includes(filterValue));
    }

    addCountryToModel(value: string) {
        var country = this.countries.find(c => c.name == value);

        if (!country || this.model.countries?.find(c => c.id == country?.id))
            return;

        if (!this.model.countries)
            this.model.countries = [];
        this.model.countries.push(country);
    }

    addCountry(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        this.addCountryToModel(value);
        event.chipInput!.clear();
        this.countryCtrl.setValue(null);
    }

    removeCountry(country: Country): void {
        if (!this.model.countries)
            return;

        const index = this.model.countries.indexOf(country);

        if (index >= 0)
            this.model.countries.splice(index, 1);
    }

    selectedCountry(event: MatAutocompleteSelectedEvent): void {
        this.addCountryToModel(event.option.viewValue);
        this.countryInput.nativeElement.value = '';
        this.countryCtrl.setValue(null);
    }

    private _filterCountries(value: string): Country[] {
        const filterValue = value.toLowerCase();

        return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
    }

    loadFilm() {
        if (this.data.filmId)
            this.filmService.getById(this.data.filmId).subscribe(result => {
                this.photosService.fixImage(result.photo);
                this.data.filmName = result.name;
                this.model = result;
                this.loading = false;
                this.loadFilmAnotherNames();
                this.photosService.getFilmPhotos(this.model.id, 0, this.showPhotos)
                    .subscribe(result => {
                        this.photosService.fixImages(result);
                        this.model.photos = result;
                    }, error => console.log(error));
            }, error => console.log(error));
    }

    loadFilmAnotherNames() {
        this.filmService.getAnotherNames(this.model.id).subscribe(result => {
            this.model.anotherNames = result;
            this.anotherNames = [...new Set(result.map(item => item.name))];
        }, error => console.log(error));
    }

    loadCountries() {
        this.countriesService.getAllCountries().subscribe(result => {
            this.countries = result;
            this.filteredCountries = this.countryCtrl.valueChanges.pipe(
                startWith(null),
                map((country: string | null) => country ? this._filterCountries(country)
                    : this.countries.slice()));
        });
    }

    loadCompanies() {
        this.companiesService.getAllCompanies().subscribe(result => {
            this.companies = result;
            this.filteredCompanies = this.companyCtrl.valueChanges.pipe(
                startWith(null),
                map((company: string | null) => company && company.length >= 4
                    ? this._filterCompanies(company)
                    : []));
        });
    }

    loadGenres() {
        this.genresService.getAllGenres().subscribe(result => {
            this.genres = result;
            this.filteredGenres = this.genreCtrl.valueChanges.pipe(
                startWith(null),
                map((genre: string | null) => genre ? this._filterGenres(genre)
                    : this.genres.slice()));
        });
    }
}

export interface DialogData {
    filmId?: number;
    filmName: string;
    //todo this film doesn't needed
    film?: Film;
}