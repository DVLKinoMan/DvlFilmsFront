import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
    FilmOrderBy,
    IdFilter, NameFilter, FilmFilter, FilmSelectControlFlags, FilmsQuery, FavoritePersonsFilter, Profession, WatchedFilmFilter, FilmPersonListsFilter, FilmGenresFilter, ImdbRatingFilter, ImdbRatingsCountFilter, ReleaseDateFilter, TvFilter, ShowEverythingFilter, FilmPersonFilter, HasVideoFilter
} from './film-query';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { PhotosService } from 'src/app/common/services/photos.service';
import { FilterOperator } from 'src/app/common/filter';
import { Film } from '../film';
import { FilmsService } from '../services/films.service';
import { FilmBuiltInListsService } from '../services/filmBuiltInLists.service';
import { MatDialog } from '@angular/material/dialog';
import { FilmWatchHistoryDialogComponent } from '../film-edit/film-watch-history/film-watch-history.dialog.component';
import { Gender2StringMapping, Profession2StringMapping } from 'src/app/common/helpers';
import { Gender } from 'src/app/persons/enums';
import { AuthService } from 'src/app/auth/auth.service';
import { List } from 'src/app/lists/list.model';
import { ListsService } from 'src/app/lists/services/lists.service';
import { FilmGenre } from '../filmGenre';
import { GenresService } from 'src/app/common/services/genres.service';
import { FilmOrderBy2StringMapping } from '../helpers';
import { FilmFilterType } from '../enums';
import { Person } from 'src/app/persons/person';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { PersonsService } from 'src/app/persons/services/persons.service';
import { FilmEditDialogComponent } from '../film-edit/film-edit.dialog.component';
import { UserRole } from 'src/app/auth/user.model';

@Component({
    selector: 'app-films',
    templateUrl: './films.component.html',
    styleUrls: ['./films.component.css']
})
export class FilmsComponent implements OnInit {
    public films: Film[];
    defaultPageIndex: number = 0;
    defaultPageSize: number = 50;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    pageEvent: PageEvent;
    filmOrderBy: FilmOrderBy = FilmOrderBy.Id;
    orderAscending: boolean = true;

    filterNames: string[];
    filterOperators: string[] = ['And', 'Or'];
    selectedFilter: string;
    idFilterForm: FormGroup;
    nameFilterForm: FormGroup;
    favoritePersonsFilterForm: FormGroup;
    watchedFilmsFilterForm: FormGroup;
    personsListFilterForm: FormGroup;
    genresFilterForm: FormGroup;
    imdbRatingsFilterForm: FormGroup;
    imdbRatingsCountFilterForm: FormGroup;
    releaseDateFilterForm: FormGroup;
    tvFilterForm: FormGroup;
    personFilterForm: FormGroup;
    filters: FilmFilter[] = [];

    queryParams: Params;

    isAuthenticated = false;
    canEdit = false;
    showEverything = false;
    hasVideo?: boolean = true;
    profession2StringMapping = Profession2StringMapping;
    gender2StringMapping = Gender2StringMapping;
    genders: Gender[] = [Gender.Unknown, Gender.Male, Gender.Female];
    professions: Profession[] = [Profession.Act, Profession.Director, Profession.Writer];
    orderBys: FilmOrderBy[] = [FilmOrderBy.ReleaseDate, FilmOrderBy.IMDBRating, FilmOrderBy.Name,
    FilmOrderBy.ImdbUserRatingsCount, FilmOrderBy.DurationInMinutes, FilmOrderBy.Id];
    filmOrderBy2StringMapping = FilmOrderBy2StringMapping;
    myLists: List[] = [];

    allGenres: FilmGenre[] = [];
    tvDescriptions: string[] = [];

    filteredPersons: Observable<Person[]>;
    personsCtrl = new FormControl();
    showPersons = 10;
    @ViewChild('personInput') personInput: ElementRef<HTMLInputElement>;

    constructor(private service: FilmsService,
        private formBuilder: FormBuilder,
        private photosService: PhotosService,
        private personsService: PersonsService,
        private builtInListsService: FilmBuiltInListsService,
        private listsService: ListsService,
        private genresService: GenresService,
        private watchHistoryDialog: MatDialog,
        private addDialog: MatDialog,
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router) {
        this.filteredPersons = this.personsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((person: string) => this.personsService.getPersons(person, this.showPersons, false))
        );
    }

    ngOnInit(): void {
        this.filterNames = ['Name', 'Type', 'Genres', 'Person', 'ImdbRating', 'ImdbRatingsCount', 'ReleaseDate', 'Id',];
        this.loadGenres();
        this.loadTvDescriptions();
        this.pageEvent = new PageEvent();
        this.pageEvent.pageIndex = this.defaultPageIndex;
        this.pageEvent.pageSize = this.defaultPageSize;
        this.route.queryParams.subscribe(
            params => {
                this.queryParams = params;
                this.loadData();
                this.setPageLength();
            }
        );
        this.idFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            id: [null, Validators.required]
        });
        this.nameFilterForm = this.formBuilder.group({
            filterOperator: 0,
            value: '',
            pattern: ''
        });
        this.favoritePersonsFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            gender: '',
            profession: 0
        });
        this.watchedFilmsFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            value: false,
            start: '',
            end: ''
        });
        this.imdbRatingsFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            exactValue: '',
            start: '',
            end: ''
        });
        this.imdbRatingsCountFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            exactValue: '',
            start: '',
            end: ''
        });
        this.releaseDateFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            exactValue: '',
            start: '',
            end: ''
        });
        this.personsListFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            listId: '',
            gender: '',
            profession: 0
        });
        this.genresFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            genres: '',
        })
        this.tvFilterForm = this.formBuilder.group({
            filterOperator: 0,
            hasTvDescription: false,
            value: ''
        });
        this.personFilterForm = this.formBuilder.group({
            filterOperator: [0, Validators.required],
            personId: '',
            value: '',
            pattern: '',
            gender: '',
            profession: 0
        });
        this.authService.user.subscribe(user => {
            this.isAuthenticated = !!user;
            if (this.isAuthenticated) {
                this.loadMyLists();
                this.filterNames.push("FavPersons");
                this.filterNames.push("WatchedFilms");
                this.filterNames.push("PersonLists");
            }
            this.canEdit = user && user.role == UserRole.Admin
        });
    }

    public getYear(date: Date) {
        if (typeof date == "string")
            return date ? new Date(date).getFullYear() : null;
        return date ? date.getFullYear() : null;
    }

    ngAfterViewInit() {

    }

    loadMyLists() {
        this.listsService.getMyPersonLists().subscribe(res => {
            this.myLists = res;
        }, error => console.log(error));
    }

    loadGenres() {
        this.genresService.getAllGenres().subscribe(res => {
            this.allGenres = res;
        }, error => console.log(error));
    }

    loadTvDescriptions() {
        this.service.getTvDescriptions().subscribe(res => {
            this.tvDescriptions = res;
        }, error => console.log(error));
    }

    addToWatch(film: Film) {
        this.builtInListsService.addToWatched(film.id).subscribe(res => {
            film.haveSeen = true;
        }, error => {
            console.log(error);
        });
    }

    removeFromWatched(film: Film) {
        this.builtInListsService.deleteFromWatched(film.id).subscribe(res => {
            film.haveSeen = false;
        }, error => {
            console.log(error);
        });
    }

    openWatchHistory(film: Film) {
        const dialogRef = this.watchHistoryDialog.open(FilmWatchHistoryDialogComponent, {
            width: '600px',
            data: { filmId: film.id, filmName: film.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const index = this.films.indexOf(film);
                if (index >= 0)
                    this.films[index].haveSeen = false;
            }
            console.log('The dialog was closed');
        });
    }

    addToWantToWatch(film: Film) {
        this.builtInListsService.addToWantToSee(film.id).subscribe(res => {
            film.wantToSee = true;
        }, error => {
            console.log(error);
        });
    }

    removeFromWantToWatch(film: Film) {
        this.builtInListsService.deleteFromWantToSee(film.id).subscribe(res => {
            film.wantToSee = false;
        }, error => {
            console.log(error);
        });
    }

    addToFavorite(film: Film) {
        this.builtInListsService.addToFavorites(film.id).subscribe(res => {
            film.isFavorite = true;
        }, error => {
            console.log(error);
        });
    }

    removeFromFavorite(film: Film) {
        this.builtInListsService.deleteFromFavorites(film.id).subscribe(res => {
            film.isFavorite = false;
        }, error => {
            console.log(error);
        });
    }

    setPageLength() {
        var query: FilmsQuery = new FilmsQuery(this.filters);

        this.service.getCount(query).subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }

    filterChanged(filterName: string) {
        var form = this.getFilterForm(filterName);
        if (form == this.favoritePersonsFilterForm)
            form.get('profession')?.setValue(0);
        if (form == this.personsListFilterForm)
            form.get('profession')?.setValue(0);
        if (this.filters.length != 0) {
            form.addControl('filterOperator', new FormControl());
            form.get('filterOperator')?.setValue(1);
        }
    }

    getFilterForm<FormGroup>(filterName: string) {
        switch (filterName) {
            case 'Id': return this.idFilterForm;
            case 'Name': return this.nameFilterForm;
            case 'FavPersons': return this.favoritePersonsFilterForm;
            case 'WatchedFilms': return this.watchedFilmsFilterForm;
            case 'PersonLists': return this.personsListFilterForm;
            case 'Genres': return this.genresFilterForm;
            case 'ImdbRating': return this.imdbRatingsFilterForm;
            case 'ImdbRatingsCount': return this.imdbRatingsCountFilterForm;
            case 'ReleaseDate': return this.releaseDateFilterForm;
            case 'Type': return this.tvFilterForm;
            case 'Person': return this.personFilterForm;
            default: throw new Error('filterName not implemented');
        }
    }

    getFilter<FilmFilter>(filterName: string) {
        switch (filterName) {
            case 'Id': return new IdFilter(this.idFilterForm.controls['id'].value,
                this.idFilterForm.controls["filterOperator"]?.value);
            case 'Name': return new NameFilter(this.nameFilterForm.controls['value']?.value,
                this.nameFilterForm.controls['pattern']?.value,
                this.nameFilterForm.controls['filterOperator']?.value);
            case 'FavPersons': return new FavoritePersonsFilter(0,
                this.favoritePersonsFilterForm.controls['gender']?.value,
                this.favoritePersonsFilterForm.controls['profession']?.value,
                this.favoritePersonsFilterForm.controls['filterOperator']?.value);
            case 'WatchedFilms': return new WatchedFilmFilter(this.watchedFilmsFilterForm['value']?.value ||
                this.watchedFilmsFilterForm.controls['start']?.value != undefined || this.watchedFilmsFilterForm.controls['end']?.value != undefined,
                this.watchedFilmsFilterForm.controls['start']?.value,
                this.watchedFilmsFilterForm.controls['end']?.value,
                true,
                this.watchedFilmsFilterForm.controls['filterOperator']?.value);
            case 'PersonLists': return new FilmPersonListsFilter(this.personsListFilterForm.controls['listId']?.value,
                0,
                this.personsListFilterForm.controls['gender']?.value,
                this.personsListFilterForm.controls['profession']?.value,
                this.personsListFilterForm.controls['filterOperator']?.value);
            case 'Person': return new FilmPersonFilter(this.personFilterForm.controls['personId']?.value,
                this.personFilterForm.controls['value']?.value,
                this.personFilterForm.controls['pattern']?.value,
                this.personFilterForm.controls['gender']?.value,
                this.personFilterForm.controls['profession']?.value,
                this.personFilterForm.controls['filterOperator']?.value);
            case 'Genres': return new FilmGenresFilter(this.genresFilterForm.controls['genres']?.value.map((g: FilmGenre) => g.id),
                this.genresFilterForm.controls['genres']?.value.map((g: FilmGenre) => g.name),
                this.genresFilterForm.controls['filterOperator']?.value);
            case 'ImdbRating': return new ImdbRatingFilter(this.imdbRatingsFilterForm.controls['exactValue']?.value,
                this.imdbRatingsFilterForm.controls['start']?.value,
                this.imdbRatingsFilterForm.controls['end']?.value,
                true,
                this.imdbRatingsFilterForm.controls['filterOperator']?.value);
            case 'ImdbRatingsCount': return new ImdbRatingsCountFilter(this.imdbRatingsCountFilterForm.controls['exactValue']?.value,
                this.imdbRatingsCountFilterForm.controls['start']?.value,
                this.imdbRatingsCountFilterForm.controls['end']?.value,
                true,
                this.imdbRatingsCountFilterForm.controls['filterOperator']?.value);
            case 'ReleaseDate': return new ReleaseDateFilter(this.releaseDateFilterForm.controls['exactValue']?.value,
                this.releaseDateFilterForm.controls['start']?.value,
                this.releaseDateFilterForm.controls['end']?.value,
                true,
                this.releaseDateFilterForm.controls['filterOperator']?.value);
            case 'Type': return new TvFilter(this.tvFilterForm.controls['hasTvDescrption']?.value ||
                this.tvFilterForm.controls['value']?.value != undefined,
                this.tvFilterForm.controls['value']?.value,
                this.tvFilterForm.controls['filterOperator']?.value);
            default: return new IdFilter(1);
        }
    }

    clearForm(filterName: string) {
        var form = this.getFilterForm(filterName);
        form.reset();
        if (form.controls['filterOperator'])
            form.removeControl('filterOperator');
    }

    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.films = [];
        this.loadData(true);
        return event;
    }

    setDefaultProfilePicture(event: any, person: Person) {
        if (typeof person.sex == "string")
            event.target.src = person.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    selectedPerson(event: MatAutocompleteSelectedEvent): void {
        this.personInput.nativeElement.value = '';
        this.personsCtrl.setValue(null);
        this.personFilterForm.controls["personId"].setValue(event.option.value.id);
        this.personFilterForm.controls["value"].setValue(event.option.value.name);
        this.personFilterForm.controls["pattern"].setValue(event.option.value.name);
    }

    addFilter() {
        if (!this.selectedFilter)
            return;

        var filter = this.getFilter(this.selectedFilter);
        if (filter.filterType == FilmFilterType.TvDescription) {
            this.showEverything = true;
            this.hasVideo = false;
            this.onChangeShowEverything();
            this.onChangeHasVideo();
        }
        this.filters.push(filter);
        this.clearForm(this.selectedFilter);
        this.selectedFilter = 'none';
    }

    clearFilters() {
        this.filters = [];
        this.showEverything = false;
        this.hasVideo = true;
        this.onChangeHasVideo();
        this.onChangeShowEverything();
    }

    onChangeShowEverything() {
        // this.showEverything = !this.showEverything;
        var filter = this.filters.find(filter => filter.filterType == FilmFilterType.ShowEverything);
        if (filter) {
            var k = filter as ShowEverythingFilter;
            k.show = this.showEverything;
        }
        else this.filters.push(new ShowEverythingFilter(this.showEverything, this.filters.length == 0 ? FilterOperator.None : FilterOperator.And));
    }

    onChangeHasVideo() {
        var filter = this.filters.find(filter => filter.filterType == FilmFilterType.HasVideo);
        if (filter) {
            var k = filter as HasVideoFilter;
            k.value = this.hasVideo;
        }
        else this.filters.push(new HasVideoFilter(this.hasVideo, this.filters.length == 0 ? FilterOperator.None : FilterOperator.And));
    }

    deleteFilter(index: number) {
        if (this.filters[index].filterType == FilmFilterType.ShowEverything) {
            this.showEverything = false;
            this.onChangeShowEverything();
            return;
        }
        if (this.filters[index].filterType == FilmFilterType.HasVideo) {
            this.hasVideo = null;
            this.onChangeHasVideo();
            return;
        }
        this.filters.splice(index, 1);
        if (index == 0 && this.filters.length > 0)
            this.filters[0].filterOperator = FilterOperator.None;
    }

    searchButtonClick() {
        this.pageEvent.pageIndex = 0;
        this.paginator.pageIndex = 0;
        this.loadData(true);
        this.setPageLength();
    }

    addNewFilmClick() {
        const dialogRef = this.addDialog.open(FilmEditDialogComponent, {
            width: '1000px',
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
            console.log('The dialog was closed');
        });
    }

    getFilmsQuery(notFromRoute: boolean = false): [FilmsQuery, boolean] {
        if (!notFromRoute) {
            var filtersString = this.queryParams['filmFilters'];

            var controlFlags = this.queryParams['selectControlFlags'];
            var currPage = this.queryParams['currentPage'];
            var pageSize = this.queryParams['pageSize'];
            var orderBy = this.queryParams['orderBy'] ? this.orderBys[this.queryParams['orderBy']] : FilmOrderBy.Id;
            var orderByAscending = this.queryParams['orderByAscending'] === "true" ? true : false;

            if (controlFlags && currPage && pageSize)
                return [new FilmsQuery(
                    filtersString ? this.getFilmFilters(filtersString) : this.filters,
                    currPage,
                    pageSize,
                    orderBy,
                    orderByAscending,
                    controlFlags), true];
        }

        return [new FilmsQuery(
            this.filters,
            this.pageEvent.pageIndex + 1,
            this.pageEvent.pageSize,
            this.filmOrderBy,
            this.orderAscending,
            FilmSelectControlFlags.WithPhoto), false];
    }

    getFilmFilters(obj: any): FilmFilter[] {
        let array: FilmFilter[] = [];
        if (typeof obj == 'string')
            array.push(this.getFilmFilter(obj));
        else
            for (var i = 0; i < obj.length; i++)
                array.push(this.getFilmFilter(obj[i]));

        return array;
    }

    getFilmFilter(str: string): FilmFilter {
        var json = JSON.parse(str);
        for (var propName in json) {
            if (propName == 'filterType')
                switch (json[propName]) {
                    case 0: return new IdFilter(json['id'], json['filterOperator']);
                    case 1: return new NameFilter(json['value'], json['pattern'],
                        json['filterOperator']);
                    case 2: return new FavoritePersonsFilter(json['userId'], json['gender'], json['profession'],
                        json['filterOperator']);
                    case 3: return new WatchedFilmFilter(json['value'], json['start'], json['end'], json['includingEnds'],
                        json['filterOperator']);
                    case 4: return new FilmPersonListsFilter(json['listId'], json['userId'], json['gender'], json['profession'],
                        json['filterOperator']);
                    case 5: return new FilmGenresFilter(json['genreIds'], json['genreNames'], json['filterOperator']);
                    case 6: return new ImdbRatingFilter(json['exactValue'], json['start'], json['end'], json['includingEnds'],
                        json['filterOperator']);
                    case 7: return new ImdbRatingsCountFilter(json['exactValue'], json['start'], json['end'], json['includingEnds'],
                        json['filterOperator']);
                    case 8: return new ReleaseDateFilter(json['exactValue'], json['start'], json['end'], json['includingEnds'],
                        json['filterOperator']);
                    case 9: return new TvFilter(json['hasTvDescription'], json['value'], json['filterOperator']);
                    case 10: return new ShowEverythingFilter(json['show'], json['filterOperator']);
                    case 11: return new FilmPersonFilter(json['personId'], json['value'], json['pattern'], json['gender'], json['profession'],
                        json['filterOperator']);
                    case 12: return new HasVideoFilter(json['value'], json['filterOperator']);
                    default: throw console.error('not implemented');
                }
        }
        throw console.error('not implemented');
    }

    loadData(notFromRoute: boolean = false) {
        var [query, fromRoute] = this.getFilmsQuery(notFromRoute);
        if (!fromRoute) {
            var params = new HttpParams();
            query.filmFilters.forEach(function (value) {
                params = params.append('filmFilters', JSON.stringify(value, (key, val) => {
                    if (val === null || (typeof val === 'string' && val === ''))
                        return undefined;
                    return val;
                }));
            });
            this.router.navigate(['/films'],
                {
                    queryParams: {
                        filmFilters: params.getAll('filmFilters'),
                        currentPage: query.currentPage,
                        orderBy: query.orderBy,
                        orderByAscending: query.orderByAscending,
                        pageSize: query.pageSize,
                        selectControlFlags: query.selectControlFlags
                    }
                });
            return;
        }
        this.filters = query.filmFilters;
        var showFilter = this.filters.find(filter => filter.filterType == FilmFilterType.ShowEverything);
        if (showFilter) {
            var k = showFilter as ShowEverythingFilter;
            this.showEverything = k.show;
        }
        this.onChangeShowEverything();
        var hasVideo = this.filters.find(filter => filter.filterType == FilmFilterType.HasVideo);
        if (hasVideo) {
            var k2 = hasVideo as HasVideoFilter;
            this.hasVideo = k2.value;
        }
        this.onChangeHasVideo();
        this.orderAscending = query.orderByAscending;
        this.filmOrderBy = query.orderBy;
        this.films = [];

        this.service.getList(query).subscribe(result => {
            this.films = result;
        }, error => console.error(error));
    }
}
