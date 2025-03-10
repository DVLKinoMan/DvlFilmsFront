import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { FilmItem, Filmography, Person, PersonItem } from "../person";
import { Observable } from "rxjs";
import { PersonsQuery } from "../persons-list/person-query";
import { PersonAwardResult } from "../person-edit/person-awards/personAwardResult";
import { Helpers } from "src/app/common/helpers";
import { FilmPerson } from "src/app/films/film";
import { Profession } from "src/app/films/film-edit/film-cast-crew/filmCrewMember";
import { QueryListResult } from "src/app/common/queryListResult";

@Injectable({
    providedIn: 'root',
})

export class PersonsService {
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

    getList(query: PersonsQuery): Observable<QueryListResult<Person>> {
        var url = this.baseUrl + "/Persons/List";

        let params = new HttpParams();
        query.personFilters.forEach(function (value) {
            params = params.append('personFilters', JSON.stringify(value, (key, val) => {
                if (val === null || (typeof val === 'string' && val === ''))
                    return undefined;
                return val;
            }));
        });
        // var str = typeof query.personFilters == "string" ? query.personFilters : JSON.stringify(query.personFilters);

        // params = params.append("personFilters", str);
        params = params.append("selectControlFlags", query.selectControlFlags);
        params = params.append("currentPage", query.currentPage);
        params = params.append("pageSize", query.pageSize);
        params = params.append("orderBy", query.orderBy);
        params = params.append("orderByAscending", query.orderByAscending);

        return this.http.get<QueryListResult<Person>>(url, {
            params: params,
        });
    }

    getById(id: number): Observable<Person> {
        var url = this.baseUrl + "/Persons/Get/" + id;

        return this.http.get<Person>(url);
    }

    update(person: Person): Observable<Person> {
        var url = this.baseUrl + "/Persons/Update";

        return this.http.post<Person>(url, person);
    }

    getFilmographies(personId: number): Observable<Filmography[]> {
        var url = this.baseUrl + "/Persons/Get/" + personId + "/Filmographies";

        return this.http.get<Filmography[]>(url);
    }

    getPersonFilmItems(titles: string[]): Observable<FilmItem[]> {
        var url = this.baseUrl + "/Films/Get/PersonFilmItems";
        let params = new HttpParams();
        titles.forEach(function (title) {
            params = params.append("imdbTitles", title);
        })
        return this.http.get<FilmItem[]>(url, { params: params });
    }

    getAwards(personId: number): Observable<PersonAwardResult[]> {
        var url = this.baseUrl + "/Persons/Get/" + personId + "/Awards";

        return this.http.get<PersonAwardResult[]>(url);
    }

    getPersons(name: string, take: number, exactMatch: boolean): Observable<Person[]> {
        var url = this.baseUrl + "/Persons/Search";

        var params = new HttpParams();
        params = params.append("name", name);
        params = params.append("take", take);
        params = params.append("exactMatch", exactMatch);

        return this.http.get<Person[]>(url, {
            params: params
        })
    }

    getPersonsWithImdbNames(imdbNames: string[]): Observable<Person[]> {
        var url = this.baseUrl + "/Persons/Get/PersonsWithImdbNames";
        let params = new HttpParams();
        imdbNames.forEach(function (name) {
            params = params.append("imdbNames", name);
        })
        return this.http.get<Person[]>(url, { params: params });
    }

    getPersonItemsWithNameAndUrlsWithImdbNames(imdbNames: string[]): Observable<PersonItem[]> {
        var url = this.baseUrl + "/Persons/Get/PersonItemWithNameAndUrls";
        let params = new HttpParams();
        imdbNames.forEach(function (name) {
            params = params.append("imdbNames", name);
        })
        return this.http.get<PersonItem[]>(url, { params: params });
    }

    getProfessions(): Observable<Profession[]> {
        var url = this.baseUrl + "/Persons/Get/Professions";

        return this.http.get<Profession[]>(url);
    }
}