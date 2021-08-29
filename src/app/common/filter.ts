export class Filter {
    filterOperator: FilterOperator;
    constructor(filterOperator: FilterOperator) {
        this.filterOperator = filterOperator;
    }
}

export enum FilterOperator {
    None,
    And,
    Or
}

interface IPatternString {
    Value?: string;
    Pattern?: string;
}