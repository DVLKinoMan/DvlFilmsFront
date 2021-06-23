export class Query {
    currentPage: number;
    pageSize: number;
    constructor(currPage: number = 1, pageSize: number = 10) {
        this.currentPage = currPage;
        this.pageSize = pageSize;
    }
}

export class PersonsQuery extends Query {
    selectControlFlags: PersonSelectControlFlags;
    personFilters: PersonFilter[];

    constructor(filters: PersonFilter[],
        currPage: number = 1,
        pageSize: number = 10,
        public orderBy: PersonOrderBy = PersonOrderBy.Id,
        public orderByAscending: boolean = true,
        controlFlags: PersonSelectControlFlags = PersonSelectControlFlags.Basic) {
        super(currPage, pageSize);
        this.selectControlFlags = controlFlags;
        this.personFilters = filters;
    }
}

export enum PersonSelectControlFlags {
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

export enum PersonOrderBy {
    Id,
    Name,
    BirthDate,
    HeightInMeters,
    Age
}

export class Filter {
    filterOperator: FilterOperator;
    constructor(filterOperator: FilterOperator) {
        this.filterOperator = filterOperator;
    }
}

export abstract class PersonFilter extends Filter {
    filterType: PersonFilterType;
    constructor(filterType: PersonFilterType, filterOperator: FilterOperator) {
        super(filterOperator);
        this.filterType = filterType;
    }

    public abstract ToString(): string;
}

enum PersonFilterType {
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

export enum FilterOperator {
    None,
    And,
    Or
}

export enum Gender {
    Unknown,
    Male,
    Female
}

export enum ZodiacSign {
    Aquarius,
    Pisces,
    Aries,
    Taurus,
    Gemini,
    Cancer,
    Leo,
    Virgo,
    Libra,
    Scorpio,
    Sagittarius,
    Capricorn
}

interface IPatternString {
    Value?: string;
    Pattern?: string;
}

export class IdFilter extends PersonFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            'Id = ' + this.id;
    }
    id: number;
    constructor(id: number, filterOperator: FilterOperator = FilterOperator.None) {
        super(PersonFilterType.Id, filterOperator);
        this.id = id;
    }
}

export class NameFilter extends PersonFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "Name = '" + this.value + "'" : this.pattern ? "Name Contains '" + this.pattern + "'" : '');
    }
    value?: string;
    pattern?: string;
    constructor(value?: string, pattern?: string,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(PersonFilterType.Name, filterOperator);
        this.value = value;
        this.pattern = pattern;
    }
}

export class AgeFilter extends PersonFilter {
    //todo includingEnds not implemented
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            (this.value ? "Age = " + this.value :
                this.start && this.end ? "Age Between [ " + this.start + ", " + this.end + " ]" :
                    this.start ? "Age >= " + this.start : "Age <= " + this.end);
    }
    value?: number;
    start?: number;
    end?: number;
    includingEnds: boolean = true;
    constructor(value?: number, start?: number, end?: number,
        includingEnds: boolean = true,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(PersonFilterType.Age, filterOperator);
        this.value = value;
        this.start = start;
        this.end = end;
        this.includingEnds = includingEnds;
    }
}

export class GenderFilter extends PersonFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            "Gender = " + Gender[this.gender];
    }
    gender: Gender;
    constructor(gender: Gender,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(PersonFilterType.Gender, filterOperator);
        this.gender = gender;
    }
}

export class ZodiacSignFilter extends PersonFilter {
    public ToString(): string {
        return (this.filterOperator != FilterOperator.None ? FilterOperator[this.filterOperator] + ' ' : '') +
            "Zodiac Sign = " + ZodiacSign[this.sign];
    }
    sign: ZodiacSign;
    constructor(sign: ZodiacSign,
        filterOperator: FilterOperator = FilterOperator.None) {
        super(PersonFilterType.ZodiacSign, filterOperator);
        this.sign = sign;
    }
}
