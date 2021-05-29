export class Query{
    currentPage: number;
    pageSize: number;
    constructor(currPage: number = 1, pageSize: number = 10){
        this.currentPage = currPage;
        this.pageSize = pageSize;
    }
}

export class PersonsQuery extends Query{
  selectControlFlags: PersonSelectControlFlags;
  personFilters: PersonFilter[];

  constructor(filters: PersonFilter[], 
    currPage: number = 1,
    pageSize: number = 10,
    public orderBy: PersonOrderBy = PersonOrderBy.Id,
    public orderByAscending: boolean = true,
    controlFlags: PersonSelectControlFlags = PersonSelectControlFlags.Basic){
      super(currPage, pageSize);
      this.selectControlFlags = controlFlags;
      this.personFilters = filters;
  }
}

export enum PersonSelectControlFlags
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

export enum PersonOrderBy
{ 
    Id,
    Name,
    BirthDate,
    HeightInMeters,
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

export class AgeFilter extends PersonFilter{
    value?: number;
    start?: number;
    end?: number;
    includingEnds: boolean = true;
    constructor( value?:number, start?: number, end?: number,
        includingEnds: boolean = true,
        filterOperator: FilterOperator = FilterOperator.None){
        super(PersonFilterType.Age, filterOperator);
        this.value = value;
        this.start = start;
        this.end = end;
        this.includingEnds = includingEnds;
    }
}
