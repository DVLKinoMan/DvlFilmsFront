import { Person } from "../persons/person";
import { Photo } from "../common/photo";
import { FilmAnotherName } from "./film-edit/film-another-names/filmAnotherName";
import { Company } from "../common/company";
import { FilmGenre } from "./filmGenre";
import { FilmCountry } from "../common/country";
import { FilmCastMember } from "./film-edit/film-cast-crew/filmCastMember";
import { FilmCrewMember } from "./film-edit/film-cast-crew/filmCrewMember";
import { Gender } from "../persons/enums";

export interface Film {
    id: number;
    sourceId?: number;
    imdbPageUrl: string;
    durationInMinutes?: number;
    description: string;
    name: string;
    imdbTitle: string;
    awardsInformationString: string;
    imdbRating?: number;
    myRating: number;
    imdbUserRatingsCount?: number;
    releaseDate?: Date;
    tagline: string;
    tvDescription?: string;

    photo?: Photo;
    boxOffice?: BoxOffice;
    genres?: FilmGenre[];
    countries?: FilmCountry[];
    writers?: FilmPerson[];
    directors?: FilmPerson[];
    cast?: FilmCastMember[];
    crew?: FilmCrewMember[];
    photos?: Photo[];
    anotherNames?: FilmAnotherName[];
    companies?: Company[];

    haveSeen: boolean;
    wantToSee: boolean;
    isFavorite: boolean;
}

export interface BoxOffice {
    id: string;
    budget?: number;
    gross?: number;
    openingWeekend?: number;
    imdbPageBoxOfficeUrl?: string;
}

export class FilmPerson {
    id?: number;
    filmPersonId?: string;
    filmId: number;
    name: string;
    imdbPageUrl: string;
    profilePicture: Photo;
    sex?: Gender;
    personItemWithNameAndUrlId?: string;
    index: number;
}