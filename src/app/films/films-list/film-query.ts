import { Filter, FilterOperator } from "src/app/common/filter";
import { Query } from "src/app/common/query";
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