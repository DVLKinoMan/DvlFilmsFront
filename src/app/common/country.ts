export interface Country {
    id: number;
    name: string;
}

export interface FilmCountry {
    id: number;
    name: string;
    filmCountryId?: string;
    filmId?: number;
}