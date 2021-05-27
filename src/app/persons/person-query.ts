export class PersonsQuery{
  selectControlFlags: PersonSelectControlFlags;
  personFilters: PersonFilter[];
  constructor(controlFlags: PersonSelectControlFlags, filters: PersonFilter[]){
      this.selectControlFlags = controlFlags;
      this.personFilters = filters;
  }
}

enum PersonSelectControlFlags
    {
        Basic = 1,
        WithPhoto = 2,
        WithAlternateNames = 4,
        WithExternalSites = 8,
        WithFestivalAwardResults = 16,
        WithPersonFilmography = 32,
        WithKnownForItems = 64,
        WithOtherWorks = 128,
        WithRelatedNews = 256
    }

export class Filter{
    filterOperator: FilterOperator;
    constructor(filterOperator: FilterOperator){
        this.filterOperator = filterOperator;
    }
}

export class PersonFilter extends Filter{
    filterType: PersonFilterType;
    constructor(filterType: PersonFilterType, filterOperator: FilterOperator){
        super(filterOperator);
        this.filterType = filterType;
    }
}

enum PersonFilterType
{
    Id,
    Name,
    Height,
    OtherWork,
    ZodiacSign,
    Birth,
    Death,
    Age,
    Gender,
    Film
}

export enum FilterOperator
{
    None,
    And,
    Or
}

interface IPatternString
    {
        Value?: string;
        Pattern?: string;
    }

export class IdFilter extends PersonFilter{
    id: number;
    constructor(id:number, filterOperator: FilterOperator = FilterOperator.None){
        super(PersonFilterType.Id, filterOperator);
        this.id = id;
    }
}

export class NameFilter extends PersonFilter{
    value?: string;
    pattern?: string;
    constructor( value?:string, pattern?:string,
        filterOperator: FilterOperator = FilterOperator.None){
        super(PersonFilterType.Name, filterOperator);
        this.value = value;
        this.pattern = pattern;
    }
}
