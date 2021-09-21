import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { ListsQuery } from "../lists-list/list-query";
import { List, ListItem } from "../list.model";

@Injectable({
    providedIn: 'root',
})

export class ListsService {
    //todo find a better way to have an address
    baseUrl = "https://localhost:44338";

    constructor(
        private http: HttpClient,
        //@Inject('BASE_URL') private baseUrl: string
    ) {

    }
    // get<Person>(id : number): Observable<Person>{
    //     // var url = this.baseUrl + "api/Persons/" + id;
    //     return this.http.get<Person>(url);
    // }

    getCount(query: ListsQuery): Observable<number> {
        var url = this.baseUrl + "/Lists/Count";

        let params = new HttpParams();
        query.listFilters.forEach(function (value) {
            params = params.append('listFilters', JSON.stringify(value, (key, val) => {
                if (val === null || (typeof val === 'string' && val === ''))
                    return undefined;
                return val;
            }));
        });

        return this.http.get<number>(url, { params: params });
    }

    getList(query: ListsQuery): Observable<List[]> {
        var url = this.baseUrl + "/Lists/List";

        let params = new HttpParams();
        query.listFilters.forEach(function (value) {
            params = params.append('listFilters', JSON.stringify(value, (key, val) => {
                if (val === null || (typeof val === 'string' && val === ''))
                    return undefined;
                return val;
            }));
        });

        params = params.append("selectControlFlags", query.selectControlFlags);
        params = params.append("currentPage", query.currentPage);
        params = params.append("pageSize", query.pageSize);
        params = params.append("orderBy", query.orderBy);
        params = params.append("orderByAscending", query.orderByAscending);

        return this.http.get<List[]>(url, {
            params: params,
        });
    }

    getMyPersonLists(): Observable<List[]> {
        var url = this.baseUrl + "/Lists/ListPersons";
        return this.http.get<List[]>(url);
    }

    getById(id: string, curPage: number, itemsPerPage: number): Observable<List> {
        var url = this.baseUrl + "/Lists/Get/" + id;

        return this.http.get<List>(url, {
            params: {
                pageIndex: curPage - 1,
                pageSize: itemsPerPage
            }
        });
    }

    getListItemsCount(id: string): Observable<number> {
        var url = this.baseUrl + "/Lists/Get/" + id + "/Count";

        return this.http.get<number>(url);
    }

    update(list: List): Observable<List> {
        var url = this.baseUrl + "/lists/Update";

        return this.http.post<List>(url, list);
    }

    add(list: List): Observable<List> {
        var url = this.baseUrl + "/lists/add";

        return this.http.post<List>(url, list);
    }

    getPersons(name: string, take: number, exactMatch: boolean): Observable<List[]> {
        var url = this.baseUrl + "/Lists/Search";

        var params = new HttpParams();
        params = params.append("name", name);
        params = params.append("take", take);
        params = params.append("exactMatch", exactMatch);

        return this.http.get<List[]>(url, {
            params: params
        });
    }

    getFilmItems(imdbTitles: string[]): Observable<ListItem[]> {
        var url = this.baseUrl + "/Lists/Get/Film/Items";
        return this.http.get<ListItem[]>(url, {
            params: {
                imdbTitles: imdbTitles
            }
        });
    }

    getPersonItems(imdbNames: string[]): Observable<ListItem[]> {
        var url = this.baseUrl + "/Lists/Get/Person/Items";
        return this.http.get<ListItem[]>(url, {
            params: {
                imdbNames: imdbNames
            }
        });
    }

    canEdit(listId: string): Observable<boolean> {
        var url = this.baseUrl + "/Lists/CanEdit/" + listId;
        return this.http.get<boolean>(url);
    }
}