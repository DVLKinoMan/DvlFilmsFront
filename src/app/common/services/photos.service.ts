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

    fixImages(photos: Photo[]) {
        photos.forEach(function (photo) {
            if (photo?.image)
                photo.image = 'data:image/png;base64,' + photo.image;
        })
    }

    fixImage(photo?: Photo) {
        if (photo?.image)
            photo.image = 'data:image/png;base64,' + photo.image;
    }

    fixImagesForCast(castMembers?: FilmCastMember[]) {
        castMembers?.forEach(function (cast) {
            if (cast.profilePicture?.image)
                cast.profilePicture.image = 'data:image/png;base64,' + cast.profilePicture.image;
        })
    }

    fixImagesForFilmographies(filmographies?: Filmography[]) {
        filmographies?.forEach(function (value) {
            if (value.filmItem?.photo?.image)
                value.filmItem.photo.image = 'data:image/png;base64,' + value.filmItem.photo.image;
        });
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