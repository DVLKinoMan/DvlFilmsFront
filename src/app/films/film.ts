import { Character, Person, Photo } from "../persons/person";

export interface Film {
    id: number;
    sourceId?: number;
    imdbPageUrl: string;
    durationInMinutes?: number;
    description: string;
    name: string;
    awardsInformationString: string;
    imdbRating?: number;
    imdbUserRatingsCount?: number;
    releaseDate?: Date;
    tagline: string;
    photo?: Photo;
    boxOffice?: BoxOffice;
    genres?: string[];
    countries?: string[];
    writers?: Person[];
    directors?: Person[];
    cast?: Person[];
}

export interface BoxOffice {
    budget?: number;
    gross?: number;
    openingWeekend?: number;
}

export interface FilmCastMember {
    id?: number;
    name: string;
    imdbPageUrl: string;
    profilePicture: Photo;
    characters: Character[];
}