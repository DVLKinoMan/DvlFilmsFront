import { Gender, ZodiacSign } from "./person-query";

export interface Person{
    id: number;
    name: string;
    awardsInformationString?: string;
    biographyString: string;
    birthDate?: Date; 
    birthPlace?: string;
    deathDate?: Date; 
    deathPlace?: string;
    heightInMeters?: number; 
    otherWork: string;
    profilePicture: Photo; 
    imdbname: string;
    imdbpageUrl: string;
    sex?: Gender;
    age?: number;
    zodiacSign?: ZodiacSign;
    filmographies?: Filmography[];
}

export interface Photo{
    // Id: guid;
    imdbPageUrl: string;
    image: string;
    title: string;
}

export interface Filmography{
    year?: number;
    categoryName: string;
    description?: string;
    filmItem?: FilmItem;
    characters?: Character[];
}

export interface FilmItem{
    id: number;
    name: string;
    imdbPageUrl: string;
    photo?: Photo;
}

export interface Character{
    name: string;
    imdbPageUrl?: string;
    description?: string;
}