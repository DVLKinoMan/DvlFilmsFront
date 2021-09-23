import { FilmOrderBy } from "./films-list/film-query";

export const FilmOrderBy2StringMapping: Record<FilmOrderBy, string> = {
    [FilmOrderBy.Id]: "Id",
    [FilmOrderBy.Name]: "Name",
    [FilmOrderBy.ReleaseDate]: "Release Date",
    [FilmOrderBy.IMDBRating]: "Imdb Rating",
    [FilmOrderBy.DurationInMinutes]: "Duration",
    [FilmOrderBy.ImdbUserRatingsCount]: "Imdb User Ratings Count"
};