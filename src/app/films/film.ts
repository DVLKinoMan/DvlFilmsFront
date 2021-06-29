import { Person } from "../persons/person";
import { Photo } from "../common/photo";
import { FilmAnotherName } from "./film-edit/film-another-names/filmAnotherName";
import { Company } from "../common/company";
import { FilmGenre } from "./filmGenre";
import { Country } from "../common/country";
import { FilmCastMember } from "./film-edit/film-cast-crew/filmCastMember";
import { FilmCrewMember } from "./film-edit/film-cast-crew/filmCrewMember";

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
    genres?: FilmGenre[];
    countries?: Country[];
    writers?: Person[];
    directors?: Person[];
    cast?: FilmCastMember[];
    crew?: FilmCrewMember[];
    photos?: Photo[];
    anotherNames?: FilmAnotherName[];
    companies?: Company[];
}

export interface BoxOffice {
    budget?: number;
    gross?: number;
    openingWeekend?: number;
}