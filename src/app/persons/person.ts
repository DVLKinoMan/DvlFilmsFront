export interface Person{
    id: number;
    name: string;
    awardsInformationString?: string;
    biographyString: string;
    birthDate?: Date; 
    birthPlace?: string;
    deathDate?: Date; 
    deathPlace?: string;
    heightInMeters?: number; 
    otherWork: string;
    profilePicture: Photo; 
    imdbname: string;
    imdbpageMoreBiographyUrl: string;
    imdbpageRelatedNewsArticlesUrl: string;
    imdbpageUrl: string;
    imdbpageRealUrl: string;
    imdbpageMorePhotosUrl: string;
    imdbpageMoreOfficialSitesUrl: string;
    imdbpageMoreAwardsUrl: string;
    imdbpageMoreOtherWorksUrl: string; 
    imdbpageMorePublicityListingsUrl: string; 
    sex: number;
}

export interface Photo{
    // Id: guid;
    // imdbpageUrl: string;
    image: string;
    title: string;
}