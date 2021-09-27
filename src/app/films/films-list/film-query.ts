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
    ReleaseDate,
    IMDBRating,
    Name,
    ImdbUserRatingsCount,
    DurationInMinutes,
    Id
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
            (this.gender ? "Fav Person Gender = '" + Gender2StringMapping[this.gender] + "'" : "") +
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
            (!this.value ? "Have Not Watched " : "Have Watched") +
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
            (this.gender ? "Person List Gender = '" + Gender2StringMapping[this.gender] + "'" : "") +
            (this.profession ? " Person List Profession '" + Profession2StringMapping[this.profession] + "'" : '') +
            (!this.gender && !this.profession ? "Person List Filter" : "");
    }
    constructor(public listId: string, public userId: number, public gender?: Gender, public profession?: Profession,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.PersonLists, filterOperator);
    }
}

export class FilmGenresFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            ("Genres: " + this.genreNames.join(", "));
    }
    constructor(public genreIds: number[],
        public genreNames: string[],
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.Genres, filterOperator);
    }
}

export class ImdbRatingFilter extends FilmFilter {
    //todo includingEnds not implemented
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.exactValue ? "Imdb Rating = " + this.exactValue :
                (this.start && this.end ? "Imdb Rating Between [ " + this.start + ", " + this.end + " ]" :
                    this.start ? "Imdb Rating >= " + this.start : this.end ? "Imdb Rating <= " + this.end : ""));
    }
    constructor(public exactValue: number,
        public start?: number,
        public end?: number,
        public includingEnds: boolean = true,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.ImdbRating, filterOperator);
    }
}

export class ImdbRatingsCountFilter extends FilmFilter {
    //todo includingEnds not implemented
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.exactValue ? "Imdb Ratings Count = " + this.exactValue :
                (this.start && this.end ? "Imdb Ratings Count Between [ " + this.start + ", " + this.end + " ]" :
                    this.start ? "Imdb Ratings Count >= " + this.start : this.end ? "Imdb Ratings Count <= " + this.end : ""));
    }
    constructor(public exactValue: number,
        public start?: number,
        public end?: number,
        public includingEnds: boolean = true,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.ImdbRatingsCount, filterOperator);
    }
}

export class ReleaseDateFilter extends FilmFilter {
    //todo includingEnds not implemented
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.exactValue ? "Release Date = " + this.exactValue :
                (this.start && this.end ? "Release Date Between [ " + this.start + ", " + this.end + " ]" :
                    this.start ? "Release Date  >= " + this.start : this.end ? "Release Date <= " + this.end : ""));
    }
    constructor(public exactValue: Date,
        public start?: Date,
        public end?: Date,
        public includingEnds: boolean = true,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.ReleaseDate, filterOperator);
    }
}

export class TvFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "TvDescription = '" + this.value + "'" :
                this.hasTvDescription ? "Has Tv Description" : "Hasn't Tv Description");
    }
    constructor(public hasTvDescription: boolean, public value?: string,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.TvDescription, filterOperator);
    }
}

export class ShowEverythingFilter extends FilmFilter {

    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.show == true ? "Show Everything" : "Do not show Eveyrthing");
    }
    constructor(public show: boolean,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.ShowEverything, filterOperator);
    }
}

export class FilmPersonFilter extends FilmFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "Person Name = '" + this.value + "' " :
                this.pattern ? "Person Pattern = '" + this.pattern + "' " : "") +
            (!this.personId && this.gender ? "And Person Gender = '" + Gender2StringMapping[this.gender] + "' " : "") +
            (this.profession ? "And Person Profession '" + Profession2StringMapping[this.profession] + "' " : '');
    }
    constructor(public personId?: number, public value?: string, public pattern?: string, public gender?: Gender, public profession?: Profession,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(FilmFilterType.Person, filterOperator);
    }
}