
export enum FilmFilterType {
    Id,
    Name,
    FavoritePersons,
    WatchedFilms,
    PersonLists,
    Genres,
    ImdbRating,
    ImdbRatingsCount,
    ReleaseDate,
    TvDescription,
    ShowEverything,
    Person
}

export enum MovieIncludingProperty {
    Properties = 0,
    DetAkasAndReleaseDates = 1,
    DetFestivalAwardsWithDetails = 2,
    DetCompaniesCredits = 4,
    DetConnections = 8,
    DetExternalReviews = 16,
    DetExternalSites = 32,
    DetFAQs = 64,
    DetFilmingLocations = 128,
    DetFullCastAndCrew = 256,
    DetGoofs = 512,
    DetParentGuides = 1024,
    DetPhotos = 2048,
    DetPlot = 4096,
    DetPlotKeywords = 8192,
    DetQuotes = 16_384,
    DetRatings = 32_768,
    DetSoundtracks = 65_536,
    DetTaglines = 131_072,
    DetTechSpecs = 262_144,
    DetTrivias = 524_288,
    DetUserReviews = 1_048_576
}