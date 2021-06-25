import { FilmItem } from "../../person";

export interface PersonAwardResult {
    festivalId: number;
    festivalName: string;
    personId: number;
    awardName: string;
    result: string;
    resultDetails: PersonAwardResultDetail[];
}

export interface PersonAwardResultDetail {
    achievment: string;
    filmItem: FilmItem;
    sharedWithPeople: PersonItem[];
}

export interface PersonItem {
    imdbPageUrl: string;
    name: string;
    description: string;
}