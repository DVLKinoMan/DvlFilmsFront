import { Person } from "../persons/person";
import { Photo } from "../common/photo";
import { FilmAnotherName } from "./film-edit/film-another-names/filmAnotherName";

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
    photos?: Photo[];
    anotherNames?: FilmAnotherName[];
    companies?: Company[];
}

export interface Country {
    id: number;
    name: string;
}

export interface BoxOffice {
    budget?: number;
    gross?: number;
    openingWeekend?: number;
}

export interface Company {
    id?: string;
    name: string;
}