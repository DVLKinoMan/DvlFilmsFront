import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Person } from "../person";
import { Observable } from "rxjs";
import { PersonsQuery } from "../person-query";

@Injectable({
    providedIn: 'root',
  })
  
export class PersonsService {
    //todo find a better way to have an address
    baseUrl = "https://localhost:44338";

    constructor(
        private http: HttpClient,
        //@Inject('BASE_URL') private baseUrl: string
        ){

        }
        // get<Person>(id : number): Observable<Person>{
        //     // var url = this.baseUrl + "api/Persons/" + id;
        //     return this.http.get<Person>(url);
        // }

        getCount(query: PersonsQuery): Observable<number>{
            var url = this.baseUrl + "/Persons/Count";

            let params = new HttpParams();
            query.personFilters.forEach(function(value){
                params = params.append('personFilters',  JSON.stringify(value, (key, val) => {
                    if (val === null || (typeof val === 'string' && val ===''))
                        return undefined;
                      return val;
                  }));
            });

            return this.http.get<number>(url, {params: params});
        }

        getList(query: PersonsQuery): Observable<Person[]>{
            var url = this.baseUrl + "/Persons/List";

            let params = new HttpParams();
            query.personFilters.forEach(function(value){
                params = params.append('personFilters',  JSON.stringify(value, (key, val) => {
                    if (val === null || (typeof val === 'string' && val ===''))
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

            return this.http.get<Person[]>(url, {
                params: params,
            });
        }

        getById(id: number) : Observable<Person>{
            var url = this.baseUrl + "/Persons/Get/"+id;
            
            return this.http.get<Person>(url);
        }
}