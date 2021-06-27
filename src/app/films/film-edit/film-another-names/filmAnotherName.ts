import { Country } from "src/app/common/country";

export interface FilmAnotherName {
    id: string;
    name: string;
    description?: string;
    country: Country;
}