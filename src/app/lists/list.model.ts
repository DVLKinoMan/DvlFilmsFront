import { Photo } from "../common/photo";

export class List {
    public createdDateTime: Date;
    public _imdbPageUrl?: string;
    public items: ListItem[];

    constructor(
        public name: string,
        public isPublic: boolean,
        public listType: ListType,
        public user: ListCreator,
        public description?: string,
        public id?: string,
    ) {

    }
}

export class ListItem {
    public id?: string;
    public listId?: string;
    public itemId: number;
    public photo?: Photo;
    public itemName: string;
    public description: string;
    public index: number;
}

export class ListCreator {
    public id: number;
    public userName: string;
}

export enum ListType {
    Films,
    Persons
}