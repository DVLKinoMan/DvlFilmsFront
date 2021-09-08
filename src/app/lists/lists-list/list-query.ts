import { Filter, FilterOperator } from "src/app/common/filter";
import { Query } from "src/app/common/query";
import { ListFilterType } from "../enums";
import { ListType } from "../list.model";

export class ListsQuery extends Query {
    selectControlFlags: ListSelectControlFlags;
    listFilters: ListFilter[];

    constructor(filters: ListFilter[],
        currPage: number = 1,
        pageSize: number = 10,
        public orderBy: ListOrderBy = ListOrderBy.Id,
        public orderByAscending: boolean = true,
        controlFlags: ListSelectControlFlags = ListSelectControlFlags.Basic) {
        super(currPage, pageSize);
        this.selectControlFlags = controlFlags;
        this.listFilters = filters;
    }
}

export enum ListSelectControlFlags {
    Basic = 1
}

export enum ListOrderBy {
    Id,
    Name,
}

export abstract class ListFilter extends Filter {
    filterType: ListFilterType;
    constructor(filterType: ListFilterType, filterOperator: FilterOperator) {
        super(filterOperator);
        this.filterType = filterType;
    }

    public abstract ToString(): string;
}

export class ListIdFilter extends ListFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            'Id = ' + this.id;
    }
    id: number;
    constructor(id: number, filterOperator: FilterOperator = FilterOperator.None) {
        super(ListFilterType.Id, filterOperator);
        this.id = id;
    }
}

export class ListNameFilter extends ListFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "Name = '" + this.value + "'" : this.pattern ? "Name Contains '" + this.pattern + "'" : '');
    }
    value?: string;
    pattern?: string;
    constructor(value?: string, pattern?: string,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(ListFilterType.Name, filterOperator);
        this.value = value;
        this.pattern = pattern;
    }
}

export class ListUserNameFilter extends ListFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "User Name = '" + this.value + "'" : this.pattern ? "User Name Contains '" + this.pattern + "'" : '');
    }
    value?: string;
    pattern?: string;
    constructor(value?: string, pattern?: string,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(ListFilterType.UserName, filterOperator);
        this.value = value;
        this.pattern = pattern;
    }
}

export class ListTypeFilter extends ListFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            "List Type = " + ListType[this.type];
    }
    constructor(public type: ListType,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(ListFilterType.ListType, filterOperator);
    }
}
