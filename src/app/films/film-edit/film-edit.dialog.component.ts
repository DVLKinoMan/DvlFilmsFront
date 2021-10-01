import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Company } from "src/app/common/company";
import { Country } from "src/app/common/country";
import { Photo } from "src/app/common/photo";
import { CompaniesService } from "src/app/common/services/companies.service";
import { CountriesService } from "src/app/common/services/countries.service";
import { GenresService } from "src/app/common/services/genres.service";
import { PhotosService } from "src/app/common/services/photos.service";
import { Film, FilmPerson } from "../film";
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
import { Gender } from "src/app/persons/enums";
import { FilmCastAndCrewDialogComponent } from "./film-cast-crew/film-cast-crew.dialog.component";
import { FilmCastMember } from "./film-cast-crew/filmCastMember";
import { FilmCrewMember, Profession } from "./film-cast-crew/filmCrewMember";
import { FilmPersonDialogComponent } from "./film-person/film-person.dialog.component";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { FilmFetcherService } from "../services/film-fetcher.service";
import { MovieIncludingProperty } from "../enums";
import { PersonsService } from "src/app/persons/services/persons.service";

@Component({
    selector: 'app-film-edit',
    templateUrl: './film-edit.dialog.component.html',
    styleUrls: ['./film-edit.dialog.component.css']
})

export class FilmEditDialogComponent {
    model: Film;
    dbFilm: Film;
    anotherNames: string[];

    crew: FilmCrewMember[];

    cast: FilmCastMember[];
    castItemsPerPage: number = 5;
    castCurrPage: number = 0;
    castPagesLength: number = 0;
    allCast: FilmCastMember[];
    leftCastArrowDisabled: boolean = true;
    rightCastArrowDisabled: boolean = false;

    loading: boolean = true;
    showPhotos: number = 5;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    professions: Profession[];

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
        public dialogRef: MatDialogRef<FilmEditDialogComponent>,
        private filmService: FilmsService,
        private personService: PersonsService,
        private filmFetcherService: FilmFetcherService,
        private photosService: PhotosService,
        private companiesService: CompaniesService,
        private genresService: GenresService,
        private countriesService: CountriesService,
        public anotherNamesDialog: MatDialog,
        public photosDialog: MatDialog,
        public castAndCrewDialog: MatDialog,
        public personDialog: MatDialog
    ) {
        if (!data.film)
            this.loadFilm();
        else {
            this.model = data.film;
            this.data.filmName = data.film.name;
            this.model.directors.sort((d1, d2) => d1.index - d2.index);
            this.model.writers.sort((d1, d2) => d1.index - d2.index);
        }
        this.loadCompanies();
        this.loadCountries();
        this.loadGenres();
        this.loadProfessions();
    }

    setDefaultPersonPhoto(event: any, person: FilmPerson) {
        if (typeof person.sex == "string")
            event.target.src = person?.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person?.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    openCastAndCrewDialog() {
        const dialogRef = this.castAndCrewDialog.open(FilmCastAndCrewDialogComponent, {
            width: '900px',
            data: {
                filmId: this.model.id,
                filmName: this.model.name,
                cast: JSON.parse(JSON.stringify(this.model.cast)),
                crew: JSON.parse(JSON.stringify(this.model.crew)),
                editMode: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                this.allCast = result.cast;
                this.model.cast = result.cast;
                this.crew = result.crew;
                this.model.crew = result.crew;
                this.loadCastPage();
            }
        });
    }

    openAnotherNamesDialog() {
        const dialogRef = this.anotherNamesDialog.open(FilmAnotherNamesDialogComponent, {
            width: '800px',
            data: {
                filmName: this.model.name,
                filmId: this.model.id,
                editMode: true,
                anotherNames: JSON.parse(JSON.stringify(this.model.anotherNames)),
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.model.anotherNames = result;
                this.anotherNames = [...new Set(this.model.anotherNames?.map(item => item.name))];
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

    removeDirector(director: FilmPerson) {
        if (!this.model.directors)
            return;

        const index = this.model.directors.indexOf(director);

        if (index >= 0)
            this.model.directors.splice(index, 1);
    }

    removeWriter(director: FilmPerson) {
        if (!this.model.writers)
            return;

        var dir = this.model.writers.find(dir => dir.name == director.name);
        if (!dir)
            return;
        const index = this.model.writers.indexOf(dir);

        if (index >= 0)
            this.model.writers.splice(index, 1);
    }

    addDirectorClicked() {
        const dialogRef = this.personDialog.open(FilmPersonDialogComponent, {
            width: '500px',
            data: { title: "Add Director" }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                const p: FilmPerson = {
                    id: result.id,
                    name: result.name,
                    filmId: this.model.id,
                    imdbPageUrl: result.imdbPageUrl,
                    imdbName: result.imdbName,
                    profilePicture: result.profilePicture,
                    sex: result.sex,
                    index: this.model.directors.length
                };

                this.model.directors?.push(result);
                this.model.directors.sort((d1, d2) => d1.index - d2.index);
            }
        });
    }

    addWriterClicked() {
        const dialogRef = this.personDialog.open(FilmPersonDialogComponent, {
            width: '500px',
            data: { title: "Add Writer" }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                const p: FilmPerson = {
                    id: result.id,
                    name: result.name,
                    filmId: this.model.id,
                    imdbPageUrl: result.imdbPageUrl,
                    imdbName: result.imdbName,
                    profilePicture: result.profilePicture,
                    sex: result.sex,
                    index: this.model.writers.length
                };

                this.model.writers?.push(p);
                this.model.writers.sort((d1, d2) => d1.index - d2.index);
            }
        });
    }

    dropWriter(event: CdkDragDrop<FilmPerson[]>) {
        moveItemInArray(this.model.writers, event.previousIndex, event.currentIndex);
        this.model.writers.forEach((wr, ind) => {
            wr.index = ind + 1;
        });
    }

    dropDirector(event: CdkDragDrop<FilmPerson[]>) {
        moveItemInArray(this.model.directors, event.previousIndex, event.currentIndex);
        this.model.directors.forEach((dr, ind) => {
            dr.index = ind + 1;
        });
    }

    fetchFilm() {
        this.loading = true;
        this.filmFetcherService.getByUrl(this.model.imdbPageUrl,
            MovieIncludingProperty.DetAkasAndReleaseDates | MovieIncludingProperty.DetFullCastAndCrew).subscribe(res => {
                this.loading = false;
                this.dbFilm = this.model;
                this.model = res;
                this.mergeCast();
                this.mergeCrew();
                this.mergeDirectors();
                this.mergeWriters();
                this.mergeCountries();
                this.mergeCompanies();
                this.mergeGenres();
                this.mergeAnotherNames();
            }, error => {
                console.log(error);
                this.loading = false;
            });
    }

    restoreFilm() {
        this.model = this.dbFilm;
        this.allCast = this.model.cast;
        this.loadCastPage();
        this.crew = this.model.crew;
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

    onCloseClick(res: boolean) {
        this.dialogRef.close(res);
    }

    onSaveClick() {
        this.loading = true;
        this.filmService.update(this.model)
            .subscribe(res => {
                this.loading = false;
                this.onCloseClick(true);
            }, error => {
                this.loading = false;
                console.log(error);
            });
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

    castPageArrowClicked(right: boolean) {
        this.castCurrPage = right ? this.castCurrPage + 1 : this.castCurrPage - 1;
        this.cast = this.allCast.slice(this.castCurrPage * this.castItemsPerPage,
            this.castCurrPage * this.castItemsPerPage + this.castItemsPerPage);
        this.leftCastArrowDisabled = this.castCurrPage < 1;
        this.rightCastArrowDisabled = this.castCurrPage >= this.castPagesLength - 1;
    }

    loadFilm() {
        if (this.data.filmId)
            this.filmService.getById(this.data.filmId).subscribe(result => {
                this.data.filmName = result.name;
                this.model = result;
                this.loading = false;
                this.model.directors.sort((d1, d2) => d1.index - d2.index);
                this.model.writers.sort((d1, d2) => d1.index - d2.index);
                this.loadFilmAnotherNames();
                this.loadCast();
                this.loadCrew();
                this.photosService.getFilmPhotos(this.model.id, 0, this.showPhotos)
                    .subscribe(result => {
                        this.model.photos = result;
                    }, error => console.log(error));
            }, error => console.log(error));
    }

    mergeGenres() {
        if (!this.dbFilm)
            return;

        this.model.genres.forEach(g => {
            g.filmId = this.dbFilm.id;
            var dbG = this.dbFilm.genres?.find(g1 => g1.name == g.name);
            if (dbG) {
                g.id = dbG.id;
                g.filmGenreId = dbG.filmGenreId;
            }
            else {
                var g1 = this.genres?.find(g2 => g.name == g2.name);
                if (g1)
                    g.id = g1.id;
            }
        })
    }

    mergeCompanies() {
        if (!this.dbFilm)
            return;

        this.model.companies.forEach(company => {
            company.filmId = this.dbFilm.id;
            var dbC = this.dbFilm.companies?.find(c => c.name == company.name);
            if (dbC) {
                company.id = dbC.id;
                company.filmCompanyId = dbC.filmCompanyId;
            }
            else {
                var g1 = this.companies?.find(g2 => company.name == g2.name);
                if (g1)
                    company.id = g1.id;
            }
        })
    }

    mergeCountries() {
        if (!this.dbFilm)
            return;

        this.model.countries.forEach(country => {
            country.filmId = this.dbFilm.id;
            var dbC = this.dbFilm.countries?.find(c => c.name == country.name);
            if (dbC) {
                country.id = dbC.id;
                country.filmCountryId = dbC.filmCountryId;
            }
            else {
                var g1 = this.countries?.find(g2 => country.name == g2.name);
                if (g1)
                    country.id = g1.id;
            }
        });
    }

    mergeAnotherNames() {
        if (!this.dbFilm)
            return;

        this.anotherNames = [...new Set(this.model.anotherNames.map(item => item.name))];
        this.model.anotherNames.forEach(anotherName => {
            anotherName.filmId = this.dbFilm.id;
            var dbAnotherName = this.dbFilm.anotherNames?.find(c => c.name == anotherName.name && c.country.name == anotherName.country.name);
            if (dbAnotherName) {
                anotherName.id = dbAnotherName.id;
                anotherName.country.id = dbAnotherName.country.id;
            }
            else {
                var c1 = this.countries?.find(c => anotherName.country.name == c.name);
                if (c1)
                    anotherName.country.id = c1.id;
            }
        });
    }

    mergeWriters() {
        if (!this.dbFilm)
            return;

        var newWriters: string[] = [];
        this.model.writers.forEach(wr => {
            var dbWr = this.dbFilm.writers?.find(w => w.imdbName == wr.imdbName);
            wr.filmId = this.dbFilm.id;
            if (dbWr) {
                wr.id = dbWr.id;
                wr.filmPersonId = dbWr.filmPersonId;
                wr.personItemWithNameAndUrlId = dbWr.personItemWithNameAndUrlId;
                wr.profilePicture = dbWr.profilePicture;
                wr.sex = dbWr.sex;
            }
            else newWriters.push(wr.imdbName);
        });

        if (newWriters.length != 0) {
            var chunks = 50;
            for (var i = 0; i < newWriters.length; i += chunks + 1) {
                var chunkedNames = newWriters.slice(i, i + chunks);
                this.personService.getPersonsWithImdbNames(chunkedNames).subscribe(res => {
                    res.forEach(r => {
                        var c1 = this.model.writers.find(c => c.imdbName == r.imdbname);
                        if (c1) {
                            c1.sex = r.sex;
                            c1.profilePicture = r.profilePicture;
                            c1.name = r.name;
                        }
                    });
                }, error => console.log(error));
            }
            for (var i = 0; i < newWriters.length; i += chunks + 1) {
                var chunkedNames = newWriters.slice(i, i + chunks);
                this.personService.getPersonItemsWithNameAndUrlsWithImdbNames(chunkedNames).subscribe(res => {
                    res.forEach(r => {
                        var c1 = this.model.writers?.find(c => c.imdbName == r.imdbName);
                        if (c1)
                            c1.personItemWithNameAndUrlId = r.id;
                    });
                }, error => console.log(error));
            }
        }
    }

    mergeDirectors() {
        if (!this.dbFilm)
            return;

        var newDirectors: string[] = [];
        this.model.directors.forEach(wr => {
            var dbWr = this.dbFilm.directors?.find(w => w.imdbName == wr.imdbName);
            wr.filmId = this.dbFilm.id;
            if (dbWr) {
                wr.id = dbWr.id;
                wr.filmPersonId = dbWr.filmPersonId;
                wr.personItemWithNameAndUrlId = dbWr.personItemWithNameAndUrlId;
                wr.profilePicture = dbWr.profilePicture;
                wr.sex = dbWr.sex;
            }
            else newDirectors.push(wr.imdbName);
        });

        if (newDirectors.length != 0) {
            var chunks = 50;
            for (var i = 0; i < newDirectors.length; i += chunks + 1) {
                var chunkedNames = newDirectors.slice(i, i + chunks);
                this.personService.getPersonsWithImdbNames(chunkedNames).subscribe(res => {
                    res.forEach(r => {
                        var c1 = this.model.directors?.find(c => c.imdbName == r.imdbname);
                        if (c1) {
                            c1.sex = r.sex;
                            c1.profilePicture = r.profilePicture;
                            c1.name = r.name;
                        }
                    });
                }, error => console.log(error));
            }
            for (var i = 0; i < newDirectors.length; i += chunks + 1) {
                var chunkedNames = newDirectors.slice(i, i + chunks);
                this.personService.getPersonItemsWithNameAndUrlsWithImdbNames(chunkedNames).subscribe(res => {
                    res.forEach(r => {
                        var c1 = this.model.writers?.find(c => c.imdbName == r.imdbName);
                        if (c1)
                            c1.personItemWithNameAndUrlId = r.id;
                    });
                }, error => console.log(error));
            }
        }
    }

    mergeCast() {
        if (!this.dbFilm)
            return;

        var newCast: string[] = [];
        this.model.cast.forEach(c => {
            c.filmId = this.dbFilm.id;
            var dbCast = this.dbFilm.cast?.find(c1 => c1.imdbName == c.imdbName);
            if (dbCast) {
                c.gender = dbCast.gender;
                c.id = dbCast.id;
                c.personId = dbCast.personId;
                c.personItemWithNameAndUrlId = dbCast.personItemWithNameAndUrlId;
                c.profilePicture = dbCast.profilePicture;
                c.characters.forEach(ch => {
                    ch.filmCastMemberId = dbCast.id;
                    var dbCh = dbCast.characters?.find(ch1 => ch1.name == ch.name);
                    if (dbCh) {
                        ch.id = dbCh.id;
                        ch.filmCharacterId = dbCh.filmCharacterId;
                        ch.personFilmogbraphyId = dbCh.personFilmogbraphyId;
                    }
                });
            }
            else newCast.push(c.imdbName);
        });

        this.allCast = this.model.cast;

        if (newCast.length != 0) {
            var chunks = 50;
            for (var i = 0; i < newCast.length; i += chunks + 1) {
                var chunkedNames = newCast.slice(i, i + chunks);
                this.personService.getPersonsWithImdbNames(chunkedNames).subscribe(res => {
                    res.forEach(r => {
                        var c1 = this.model.cast?.find(c => c.imdbName == r.imdbname);
                        if (c1) {
                            c1.personId = r.id;
                            c1.gender = r.sex;
                            c1.profilePicture = r.profilePicture;
                            c1.name = r.name;
                        }
                    });
                    // if (i + chunks + 1 >= newCast.length) {
                    //     this.allCast = this.model.cast;
                    // }
                    this.loadCastPage();
                }, error => console.log(error));
            }
            //todo: if casts where found it is not necessary to fetch this
            for (var i = 0; i < newCast.length; i += chunks + 1) {
                var chunkedNames = newCast.slice(i, i + chunks);
                this.personService.getPersonItemsWithNameAndUrlsWithImdbNames(chunkedNames).subscribe(res => {
                    res.forEach(r => {
                        var c1 = this.model.cast?.find(c => c.imdbName == r.imdbName);
                        if (c1)
                            c1.personItemWithNameAndUrlId = r.id;
                    });
                    this.loadCastPage();
                }, error => console.log(error));
            }
        }
    }

    mergeCrew() {
        if (!this.dbFilm)
            return;

        var newCrew: string[] = [];
        this.model.crew.forEach(c => {
            c.filmId = this.dbFilm.id;
            var dbCrew = this.dbFilm.crew?.find(c1 => c1.imdbName == c.imdbName);
            var prof = this.professions.find(p => p.name == c.name);
            if (prof)
                c.proffessionId = prof.id;
            if (dbCrew) {
                c.id = dbCrew.id;
                c.filmCrewMemberId = dbCrew.filmCrewMemberId;
                if (c.profession == dbCrew.profession)
                    c.proffessionId = dbCrew.proffessionId;
            }
            else newCrew.push(c.imdbName);
        });

        this.crew = this.model.crew;

        if (newCrew.length != 0) {
            //todo
        }
    }

    loadCast() {
        this.filmService.getCast(this.model.id).subscribe(result => {
            this.allCast = result;
            this.model.cast = result;
            this.loadCastPage();
        }, error => console.log(error));
    }

    loadCastPage() {
        this.cast = this.allCast.slice(0, this.castItemsPerPage);
        this.castPagesLength = Math.floor(this.allCast.length / this.castItemsPerPage) +
            (this.allCast.length % this.castItemsPerPage > 0 ? 1 : 0);
        this.leftCastArrowDisabled = true;
        this.rightCastArrowDisabled = this.castPagesLength <= 1;
    }

    loadCrew() {
        this.filmService.getCrew(this.model.id).subscribe(result => {
            this.crew = result;
            this.model.crew = result;
        }, error => console.error(error));
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

    loadProfessions() {
        this.personService.getProfessions().subscribe(res => {
            this.professions = res;
        }, error => console.log(error));
    }
}

export interface DialogData {
    filmId?: number;
    filmName: string;
    //todo this film doesn't needed
    film?: Film;
}