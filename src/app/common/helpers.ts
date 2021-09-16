import { Gender } from "../persons/enums";

export abstract class Helpers {
    public static getBetweenString(str: string, prevString: string, afterString: string): string {
        var firstIndex = str.indexOf(prevString) + prevString.length;
        var endIndex = str.substring(firstIndex).indexOf(afterString);
        return str.substring(firstIndex, endIndex < 0 ? undefined : firstIndex + endIndex);
    }

    public static getImdbTitle(url: string): string {
        return Helpers.getBetweenString(url, "title/", "/");
    }
}


export const Gender2StringMapping: Record<Gender, string> = {
    [Gender.Unknown]: "Unknown",
    [Gender.Male]: "Male",
    [Gender.Female]: "Female"
};