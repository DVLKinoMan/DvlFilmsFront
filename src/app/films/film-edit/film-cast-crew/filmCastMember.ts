import { Photo } from "src/app/common/photo";
import { Character } from "src/app/persons/person";
import { Gender } from "src/app/persons/person-query";

export interface FilmCastMember {
    id?: number;
    name: string;
    imdbPageUrl: string;
    profilePicture: Photo;
    characters: Character[];
    gender: Gender;
}