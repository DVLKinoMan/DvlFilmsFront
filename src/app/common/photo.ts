
export class Photo {
    // Id: guid;
    public imdbPageUrl: string;
    public image: string;
    get imageString(): string {
        return 'data:image/png;base64,' + this.image;
    }
    public title: string;
}
