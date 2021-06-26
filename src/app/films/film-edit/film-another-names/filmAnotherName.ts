import { Country } from "../../film";

export interface FilmAnotherName {
    id: string;
    name: string;
    description?: string;
    country: Country;
}