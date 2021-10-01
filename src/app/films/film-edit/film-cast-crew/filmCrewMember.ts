export interface FilmCrewMember {
    id?: string;
    filmCrewMemberId?: string;
    name: string;
    description?: string;
    imdbPageUrl: string;
    imdbName: string;
    profession: string;
    filmId: number;
    proffessionId: number;
}

export interface Profession {
    id: number;
    name: string;
}