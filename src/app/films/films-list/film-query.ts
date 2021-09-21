import { Filter, FilterOperator } from "src/app/common/filter";
import { Gender2StringMapping, Profession2StringMapping } from "src/app/common/helpers";
import { Query } from "src/app/common/query";
import { Gender } from "src/app/persons/enums";
import { FilmFilterType } from "../enums";

export class FilmsQuery extends Query {
    selectControlFlags: FilmSelectControlFlags;
    filmFilters: FilmFilter[];

    constructor(filters: FilmFilter[],
        currPage: number = 1,
        pageSize: number = 10,
        public orderBy: FilmOrderBy = FilmOrderBy.Id,
        public orderByAscending: boolean = true,
        controlFlags: FilmSelectControlFlags = FilmSelectControlFlags.Basic) {
        super(currPage, pageSize);
        this.selectControlFlags = controlFlags;
        this.filmFilters = filters;
    }
}

export enum FilmSelectControlFlags {
    Basic = 1,
    WithPhoto = 2
}

export enum FilmOrderBy {
    Id,
    Name,
    ReleaseDate,
    IMDBRating,
    DurationInMinutes,
    ImdbUserRatingsCount
}

export enum Profession {
    Act,
    Director,
    Writer
}

export abstract class FilmFilter extends Filter {
    filterType: FilmFilterType;
    constructor(filterType: FilmFilterType, filterOperator: FilterOperator) {
        super(filterOperator);
        this.filterType = filterType;
    }

    public abstract ToString(): string;
}

export class IdFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            'Id = ' + this.id;
    }
    id: number;
    constructor(id: number, filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.Id, filterOperator);
        this.id = id;
    }
}

export class NameFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "Name = '" + this.value + "'" : this.pattern ? "Name Contains '" + this.pattern + "'" : '');
    }
    value?: string;
    pattern?: string;
    constructor(value?: string, pattern?: string,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.Name, filterOperator);
        this.value = value;
        this.pattern = pattern;
    }
}

export class FavoritePersonsFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.gender ? "Fav Person Gender == '" + Gender2StringMapping[this.gender] + "'" : "") +
            (this.profession ? " Fav Person Profession '" + Profession2StringMapping[this.profession] + "'" : '') +
            (!this.gender && !this.profession ? "Fav Persons Filter" : "");
    }
    constructor(public userId: number, public gender?: Gender, public profession?: Profession,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.FavoritePersons, filterOperator);
    }
}

export class WatchedFilmFilter extends FilmFilter {
    //todo includingEnds not implemented
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "Have Watched " : "Have Not Watched") +
            (this.start && this.end ? " And My Rating Between [ " + this.start + ", " + this.end + " ]" :
                this.start ? " And My Rating >= " + this.start : this.end ? " And My Rating <= " + this.end : "");
    }
    constructor(public value: boolean,
        public start?: number,
        public end?: number,
        public includingEnds: boolean = true,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.WatchedFilms, filterOperator);
    }
}

export class FilmPersonListsFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.gender ? "Person List Gender == '" + Gender2StringMapping[this.gender] + "'" : "") +
            (this.profession ? " Person List Profession '" + Profession2StringMapping[this.profession] + "'" : '') +
            (!this.gender && !this.profession ? "Person List Filter" : "");
    }
    constructor(public listId: string, public userId: number, public gender?: Gender, public profession?: Profession,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.PersonLists, filterOperator);
    }
}