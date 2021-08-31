import { Photo } from "src/app/common/photo";
import { Gender } from "src/app/persons/enums";
import { Character } from "src/app/persons/person";

export class FilmCastMember {
    id?: string;
    personId?: number;
    filmId: number;
    personItemWithNameAndUrlId?: string;
    episodesNumberInformation?: string;
    name: string;
    imdbPageUrl: string;
    profilePicture: Photo;
    characters: Character[];
    gender: Gender;
    index?: number;
}