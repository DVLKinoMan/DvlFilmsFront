export class FilmWatch {
    public id: string;
    public userId: number;
    public filmId: number;
    public watchedTime: Date;

    constructor(id: number, date: Date) {
        this.filmId = id;
        this.watchedTime = date;
    }
}