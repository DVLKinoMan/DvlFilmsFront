import { Gender, ZodiacSign } from "../persons/enums";

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

export const ZodiacSign2StringMapping: Record<ZodiacSign, string> = {
    [ZodiacSign.Aquarius]: "Aquarius",
    [ZodiacSign.Aries]: "Aries",
    [ZodiacSign.Cancer]: "Cancer",
    [ZodiacSign.Capricorn]: "Capricorn",
    [ZodiacSign.Gemini]: "Gemini",
    [ZodiacSign.Leo]: "Leo",
    [ZodiacSign.Libra]: "Libra",
    [ZodiacSign.Pisces]: "Pisces",
    [ZodiacSign.Sagittarius]: "Sagittarius",
    [ZodiacSign.Scorpio]: "Scorpio",
    [ZodiacSign.Taurus]: "Taurus",
    [ZodiacSign.Virgo]: "Virgo"
};