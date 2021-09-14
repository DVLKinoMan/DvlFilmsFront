import { Photo } from "../common/photo";

export class FilmWatch {
    public id: string;
    public userId: number;
    public filmId: number;
    public watchedTime: Date;
    public photo?: Photo;
    public name?: string;

    constructor(id: number, date: Date, name?: string, photo?: Photo) {
        this.filmId = id;
        this.watchedTime = date;
        this.photo = photo;
        this.name = name;
    }
}