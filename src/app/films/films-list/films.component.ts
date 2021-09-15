import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FilmOrderBy,
    IdFilter, NameFilter, FilmFilter, FilmSelectControlFlags, FilmsQuery
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

    filterNames: string[] = [
        'Id', 'Name'
    ];
    filterOperators: string[] = ['And', 'Or'];
    selectedFilter: string;
    idFilterForm: FormGroup;
    nameFilterForm: FormGroup;
    filters: FilmFilter[] = [];

    queryParams: Params;

    constructor(private service: FilmsService,
        private formBuilder: FormBuilder,
        private photosService: PhotosService,
        private builtInListsService: FilmBuiltInListsService,
        private watchHistoryDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
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
    }

    public getYear(date: Date) {
        if (typeof date == "string")
            return new Date(date).getFullYear();
        return date.getFullYear();
    }

    ngAfterViewInit() {

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
        if (this.filters.length != 0) {
            var form = this.getFilterForm(filterName);
            form.addControl('filterOperator', new FormControl());
            form.get('filterOperator')?.setValue(1);
        }
    }

    getFilterForm<FormGroup>(filterName: string) {
        switch (filterName) {
            case 'Id': return this.idFilterForm;
            case 'Name': return this.nameFilterForm;
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

        this.service.getList(query).subscribe(result => {
            this.films = result;
        }, error => console.error(error));
    }
}
