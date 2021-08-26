import { FormGroupDirective } from "@angular/forms";

export class Photo {
    public id?: string;
    public imdbPageUrl: string;
    public image: string;
    get imageString(): string {
        return 'data:image/png;base64,' + this.image;
    }
    public title: string;
}
