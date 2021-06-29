import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Photo } from "src/app/common/photo";
import { FilmCastMember } from "src/app/films/film-edit/film-cast-crew/filmCastMember";
import { Filmography } from "../../persons/person";

@Injectable({
    providedIn: 'root',
})

export class PhotosService {
    //todo find a better way to have an address
    baseUrl = "https://localhost:44338";

    constructor(
        private http: HttpClient,
        //@Inject('BASE_URL') private baseUrl: string
    ) {

    }

    getImdbFullScreenPhotos(photos: Photo[]): object[] {
        var fullScreenPhotos = photos.map(function (ph) {
            var str = ph.imdbPageUrl;
            var url = str.substring(0, str.lastIndexOf("_V1_") + 4) + str.substring(str.lastIndexOf("."));
            return { image: url, title: ph.title };
        });
        return fullScreenPhotos;
    }

    getPersonPhotos(personId: number, skip?: number, take?: number): Observable<Photo[]> {
        var url = this.baseUrl + "/Persons/Get/" + personId + "/Photos";
        var params = new HttpParams();
        if (skip)
            params = params.append('skip', skip)
        if (take)
            params = params.append('take', take);

        return this.http.get<Photo[]>(url, { params: params });
    }

    getPersonPhotosCount(personId: number): Observable<number> {
        var url = this.baseUrl + "/Persons/Get/" + personId + "/Photos/Count";

        return this.http.get<number>(url);
    }

    getFilmPhotos(filmId: number, skip?: number, take?: number): Observable<Photo[]> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/Photos";
        var params = new HttpParams();
        if (skip)
            params = params.append('skip', skip)
        if (take)
            params = params.append('take', take);

        return this.http.get<Photo[]>(url, { params: params });
    }

    getFilmPhotosCount(filmId: number): Observable<number> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/Photos/Count";

        return this.http.get<number>(url);
    }
}