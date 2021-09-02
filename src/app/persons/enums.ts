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

export enum PersonFilterType {
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

export enum PersonIncludingProperty {
    Properties = 0,
    DetFestivalAwardsWithDetails = 1,
    DetExternalSites = 2,
    DetBiography = 4,
    DetPhotos = 8,
    DetOtherWorks = 16,
    DetPublicity = 32,
    DetNews = 64
}