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
}

export interface Photo{
    // Id: guid;
    imdbpageUrl: string;
    image: string;
    title: string;
}