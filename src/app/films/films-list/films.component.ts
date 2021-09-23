import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FilmOrderBy,
    IdFilter, NameFilter, FilmFilter, FilmSelectControlFlags, FilmsQuery, FavoritePersonsFilter, Profession, WatchedFilmFilter, FilmPersonListsFilter, FilmGenresFilter, ImdbRatingFilter, ImdbRatingsCountFilter, ReleaseDateFilter
} from './film-query';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
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
    filters: FilmFilter[] = [];

    queryParams: Params;

    isAuthenticated = false;
    profession2StringMapping = Profession2StringMapping;
    gender2StringMapping = Gender2StringMapping;
    genders: Gender[] = [Gender.Unknown, Gender.Male, Gender.Female];
    professions: Profession[] = [Profession.Act, Profession.Director, Profession.Writer];
    myLists: List[] = [];

    allGenres: FilmGenre[] = [];

    constructor(private service: FilmsService,
        private formBuilder: FormBuilder,
        private photosService: PhotosService,
        private builtInListsService: FilmBuiltInListsService,
        private listsService: ListsService,
        private genresService: GenresService,
        private watchHistoryDialog: MatDialog,
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router) { }

    ngOnInit(): void {
        this.filterNames = ['Id', 'Name', 'Genres', 'ImdbRating', 'ImdbRatingsCount', 'ReleaseDate'];
        this.loadGenres();
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
            value: '',
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
        this.authService.user.subscribe(user => {
            this.isAuthenticated = !!user;
            if (this.isAuthenticated) {
                this.loadMyLists();
                this.filterNames.push("FavPersons");
                this.filterNames.push("WatchedFilms");
                this.filterNames.push("PersonLists");
            }
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

    getOrderBy<FilmOrderBy>(sort: Sort) {
        switch (sort.active) {
            case 'id': return FilmOrderBy.Id;
            case 'name': return FilmOrderBy.Name;
            case 'releaseDate': return FilmOrderBy.ReleaseDate;
            case 'imdbRating': return FilmOrderBy.IMDBRating;
            case 'durationInMinutes': return FilmOrderBy.DurationInMinutes;
            case 'imdbUserRatingsCount': return FilmOrderBy.ImdbUserRatingsCount;
            default: return FilmOrderBy.Id;
        }
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
            default: return new IdFilter(1);
        }
    }

    clearForm(filterName: string) {
        var form = this.getFilterForm(filterName);
        form.reset();
        if (form.controls['filterOperator'])
            form.removeControl('filterOperator');
    }

    sortChanged(sort: Sort) {
        this.filmOrderBy = this.getOrderBy(sort);
        this.orderAscending = sort.direction == 'asc';
        this.loadData(true);
    }

    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.films = [];
        this.loadData(true);
        return event;
    }

    addFilter() {
        if (!this.selectedFilter)
            return;

        this.filters.push(this.getFilter(this.selectedFilter));
        this.clearForm(this.selectedFilter);
        this.selectedFilter = 'none';
    }

    clearFilters() {
        this.filters = [];
    }

    deleteFilter(index: number) {
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

    getFilmsQuery(notFromRoute: boolean = false): [FilmsQuery, boolean] {
        if (!notFromRoute) {
            var filtersString = this.queryParams['filmFilters'];

            var controlFlags = this.queryParams['selectControlFlags'];
            var currPage = this.queryParams['currentPage'];
            var pageSize = this.queryParams['pageSize'];
            var orderBy = this.queryParams['orderBy'];
            var orderByAscending = this.queryParams['orderByAscending'];

            if (controlFlags && currPage && pageSize && orderBy && orderByAscending)
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
        this.films = [];

        this.service.getList(query).subscribe(result => {
            this.films = result;
        }, error => console.error(error));
    }
}
