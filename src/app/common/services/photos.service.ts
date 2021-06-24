import { Injectable } from "@angular/core";
import { Photo } from "src/app/common/photo";
import { FilmCastMember } from "../../films/film";
import { Filmography } from "../../persons/person";

@Injectable({
    providedIn: 'root',
})

export class PhotosService {
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
}