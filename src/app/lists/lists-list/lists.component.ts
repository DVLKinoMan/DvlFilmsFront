import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { FilterOperator } from 'src/app/common/filter';
import { List, ListType } from '../list.model';
import {
    ListFilter, ListIdFilter, ListNameFilter, ListOrderBy, ListSelectControlFlags, ListsQuery,
    ListTypeFilter, ListUserNameFilter
} from './list-query';
import { ListsService } from '../services/lists.service';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
    public lists: List[];
    defaultPageIndex: number = 0;
    defaultPageSize: number = 10;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    pageEvent: PageEvent;
    listOrderBy: ListOrderBy = ListOrderBy.Id;
    orderAscending: boolean = true;

    filterNames: string[] = [
        'Id', 'Name', 'UserName', 'ListType'
    ];
    listTypes: string[] = Object.keys(ListType).filter(val => isNaN(Number(val)));
    filterOperators: string[] = ['And', 'Or'];
    selectedFilter: string;
    idFilterForm: FormGroup;
    nameFilterForm: FormGroup;
    userNameFilterForm: FormGroup;
    listTypeFilterForm: FormGroup;
    filters: ListFilter[] = [];

    queryParams: Params;

    constructor(private service: ListsService,
        private formBuilder: FormBuilder,
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
        this.userNameFilterForm = this.formBuilder.group({
            filterOperator: 0,
            value: '',
            pattern: ''
        });
        this.listTypeFilterForm = this.formBuilder.group({
            filterOperator: 0,
            type: '',
        });
    }

    ngAfterViewInit() {

    }

    setPageLength() {
        var query: ListsQuery = new ListsQuery(this.filters);

        this.service.getCount(query).subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }

    getOrderBy<ListOrderBy>(sort: Sort) {
        switch (sort.active) {
            case 'id': return ListOrderBy.Id;
            case 'name': return ListOrderBy.Name;
            default: return ListOrderBy.Id;
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
            case 'Age': return this.userNameFilterForm;
            case 'ListType': return this.listTypeFilterForm;
            default: throw new Error('filterName not implemented');
        }
    }

    getFilter<ListFilter>(filterName: string) {
        switch (filterName) {
            case 'Id': return new ListIdFilter(this.idFilterForm.controls['id'].value,
                this.idFilterForm.controls["filterOperator"]?.value);
            case 'Name': return new ListNameFilter(this.nameFilterForm.controls['value']?.value,
                this.nameFilterForm.controls['pattern']?.value,
                this.nameFilterForm.controls['filterOperator']?.value);
            case 'UserName': return new ListUserNameFilter(this.nameFilterForm.controls['value']?.value,
                this.nameFilterForm.controls['pattern']?.value,
                this.nameFilterForm.controls['filterOperator']?.value);
            case 'ListType': return new ListTypeFilter(this.listTypeFilterForm.controls['listType'].value,
                this.listTypeFilterForm.controls['filterOperator']?.value);
            default: return new ListIdFilter(1);
        }
    }

    clearForm(filterName: string) {
        var form = this.getFilterForm(filterName);
        form.reset();
        if (form.controls['filterOperator'])
            form.removeControl('filterOperator');
    }

    sortChanged(sort: Sort) {
        this.listOrderBy = this.getOrderBy(sort);
        this.orderAscending = sort.direction == 'asc';
        this.loadData(true);
    }

    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.lists = [];
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

    getListsQuery(notFromRoute: boolean = false): [ListsQuery, boolean] {
        if (!notFromRoute) {
            var filtersString = this.queryParams['listFilters'];

            var controlFlags = this.queryParams['selectControlFlags'];
            var currPage = this.queryParams['currentPage'];
            var pageSize = this.queryParams['pageSize'];
            var orderBy = this.queryParams['orderBy'];
            var orderByAscending = this.queryParams['orderByAscending'];

            if (controlFlags && currPage && pageSize && orderBy && orderByAscending)
                return [new ListsQuery(
                    filtersString ? this.getListFilters(filtersString) : this.filters,
                    currPage,
                    pageSize,
                    orderBy,
                    orderByAscending,
                    controlFlags), true];
        }

        return [new ListsQuery(
            this.filters,
            this.pageEvent.pageIndex + 1,
            this.pageEvent.pageSize,
            this.listOrderBy,
            this.orderAscending,
            ListSelectControlFlags.Basic), false];
    }

    getListFilters(obj: any): ListFilter[] {
        let array: ListFilter[] = [];
        if (typeof obj == 'string')
            array.push(this.getListFilter(obj));
        else
            for (var i = 0; i < obj.length; i++)
                array.push(this.getListFilter(obj[i]));

        return array;
    }

    getListFilter(str: string): ListFilter {
        var json = JSON.parse(str);
        for (var propName in json) {
            if (propName == 'filterType')
                switch (json[propName]) {
                    case 0: return new ListIdFilter(json['id'], json['filterOperator']);
                    case 1: return new ListNameFilter(json['value'], json['pattern'],
                        json['filterOperator']);
                    case 2: return new ListUserNameFilter(json['value'], json['pattern'],
                        json['filterOperator']);
                    case 3: return new ListTypeFilter(json['listType'], json['filterOperator']);
                    default: throw console.error('not implemented');
                }
        }
        throw console.error('not implemented');
    }

    loadData(notFromRoute: boolean = false) {
        var [query, fromRoute] = this.getListsQuery(notFromRoute);
        if (!fromRoute) {
            var params = new HttpParams();
            query.listFilters.forEach(function (value) {
                params = params.append('listFilters', JSON.stringify(value, (key, val) => {
                    if (val === null || (typeof val === 'string' && val === ''))
                        return undefined;
                    return val;
                }));
            });
            this.router.navigate(['/lists'],
                {
                    queryParams: {
                        listFilters: params.getAll('listFilters'),
                        currentPage: query.currentPage,
                        orderBy: query.orderBy,
                        orderByAscending: query.orderByAscending,
                        pageSize: query.pageSize,
                        selectControlFlags: query.selectControlFlags
                    }
                });
            return;
        }
        this.filters = query.listFilters;

        this.service.getList(query).subscribe(result => {
            this.lists = result;
        }, error => console.error(error));
    }
}
