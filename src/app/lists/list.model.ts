import { Photo } from "../common/photo";

export class List {
    public createdDateTime: Date;
    public imdbPageUrl?: string;
    public items: ListItem[] = [];
    public name: string;
    public isPublic: boolean;
    public type: ListType;
    public user: ListCreator;
    public description?: string;
    public id?: string;
    public allowDuplicates: boolean;
    public itemsCount: number;

    constructor(
    ) {

    }
}

export class ListItem {
    public id?: string;
    public listId?: string;
    public description: string;;
    constructor(public itemId: number,
        public itemName: string,
        public index: number,
        public photo?: Photo
    ) {

    }
}

export class ListCreator {
    public id: number;
    public userName: string;
}

export enum ListType {
    Films,
    Persons
}