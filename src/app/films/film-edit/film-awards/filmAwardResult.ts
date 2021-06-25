import { PersonItem } from "src/app/persons/person-edit/person-awards/personAwardResult";

export interface FilmAwardResult {
    festivalId: number;
    festivalName: string;
    filmId: number;
    awardName: string;
    result: string;
    year?: number;
    resultDetails: FilmAwardResultDetail[];
}

export interface FilmAwardResultDetail {
    awardDescription: string;
    awardDetailNote: string;
    awardReceivers: PersonItem[];
}