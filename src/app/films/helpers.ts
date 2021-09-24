import { PersonOrderBy } from "../persons/persons-list/person-query";
import { FilmOrderBy } from "./films-list/film-query";

export const FilmOrderBy2StringMapping: Record<FilmOrderBy, string> = {
    [FilmOrderBy.Id]: "Id",
    [FilmOrderBy.Name]: "Name",
    [FilmOrderBy.ReleaseDate]: "Release Date",
    [FilmOrderBy.IMDBRating]: "Imdb Rating",
    [FilmOrderBy.DurationInMinutes]: "Duration",
    [FilmOrderBy.ImdbUserRatingsCount]: "Imdb User Ratings Count"
};

export const PersonOrderBy2StringMapping: Record<PersonOrderBy, string> = {
    [PersonOrderBy.Name]: "Name",
    [PersonOrderBy.Age]: "Age",
    [PersonOrderBy.BirthDate]: "Birth Date",
    [PersonOrderBy.Id]: "Id",
    [PersonOrderBy.HeightInMeters]: "Height",
};