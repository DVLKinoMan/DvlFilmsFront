import { Helpers } from "../common/helpers";
import { Photo } from "../common/photo";
import { Gender, ZodiacSign } from "./enums";

export class Person {
    id: number;
    name: string;
    awardsInformationString?: string;
    biographyString: string;
    birthDate?: Date;
    birthPlace?: string;
    deathDate?: Date;
    deathPlace?: string;
    heightInMeters?: number;
    otherWork: string;
    profilePicture: Photo;
    imdbname: string;
    imdbPageUrl: string;
    sex?: Gender;
    age?: number;
    zodiacSign?: ZodiacSign;
    filmographies?: Filmography[];
    photos?: Photo[];
    alternateNames?: AlternateName[];

    isFavorite: boolean;
    addedDate?: Date;
    lastUpdatedDate?: Date;
}

export class AlternateName {
    id?: string;
    name: string;
    personId: number;
}

export class Filmography {
    id?: string;
    personId: number;
    year?: number;
    categoryName: string;
    description?: string;
    filmItem?: FilmItem;
    characters?: Character[];
}

export class FilmItem {
    id?: number;
    name: string;
    imdbPageUrl: string;
    description?: string;
    imdbTitle?: string;
    photo?: Photo;
    year?: number;
    filmItemWithNameAndUrlId?: string;
}

export class Character {
    id?: string;
    filmCastMemberId?: string;
    filmCharacterId?: string;
    personFilmogbraphyId?: string;
    name: string;
    imdbPageUrl?: string;
    description?: string;
}

export class PersonItem {
    id: string;
    imdbName: string;
}

// export class PersonItem {
//     id?: number;
//     name: string;
//     imdbPageUrl: string;
//     profilePicture?: Photo;
//     sex?: Gender;
// }