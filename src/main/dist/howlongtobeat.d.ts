export declare class HowLongToBeatService {
    private hltb;
    constructor();
    /**
     * Get HowLongToBeatEntry from game id, by fetching the detail page like https://howlongtobeat.com/game.php?id=6974 and parsing it.
     * @param gameId the hltb internal gameid
     * @return Promise<HowLongToBeatEntry> the promise that, when fullfilled, returns the game
     */
    detail(gameId: string): Promise<HowLongToBeatEntry>;
}
/**
 * Encapsulates details of a game
 */
export declare class HowLongToBeatEntry {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly imageUrl: string;
    readonly platforms: string[];
    readonly genres: string[];
    readonly developers: string[];
    readonly publishers: string[];
    readonly released: string;
    readonly timeLabels: Array<string[]>;
    readonly gameplayMain: number;
    readonly gameplayMainExtra: number;
    readonly gameplayCompletionist: number;
    readonly gameplayAllStyles: number;
    readonly additionalContent: string[];
    readonly mainGame: string;
    constructor(id: string, title: string, description: string, imageUrl: string, platforms: string[], genres: string[], developers: string[], publishers: string[], released: string, timeLabels: Array<string[]>, gameplayMain: number, gameplayMainExtra: number, gameplayCompletionist: number, gameplayAllStyles: number, additionalContent: string[], mainGame: string);
}
/**
 * Internal helper class to parse html and create a HowLongToBeatEntry
 */
export declare class HowLongToBeatParser {
    /**
     * Parses the passed html to generate an HowLongToBeatyEntry.
     * All the dirty DOM parsing and element traversing is done here.
     * @param html the html as basis for the parsing. taking directly from the response of the hltb detail page
     * @param id the hltb internal id
     * @return HowLongToBeatEntry representing the page
     */
    static parseDetails(html: string, id: string): HowLongToBeatEntry;
    private static formatGenres;
    /**
     * Utility method used for parsing an array of strings
     * representing dates to find the earliest release date
     * and return it as a string in yyyy-MM-dd fomrmat
     *
     * @param releases representing the release years in different regions
     * @returns the first release year formatted yyyy-MM-dd
     */
    private static findFirstRelease;
    /**
     * Utility method used for parsing a given input text (like
     * &quot;44&#189;&quot;) as double (like &quot;44.5&quot;). The input text
     * represents the amount of hours needed to play this game.
     *
     * @param text
     *            representing the hours
     * @return the pares time as double
     */
    private static parseTime;
    /**
     * Parses a range of numbers and creates the average.
     * @param text
     *            like '5 Hours - 12 Hours' or '2½ Hours - 33½ Hours'
     * @return the arithmetic median of the range
     */
    private static handleRange;
    /**
     * Parses a string to get a number
     * @param text,
     *            can be '12 Hours' or '5½ Hours' or '50 Mins'
     * @return the ttime, parsed from text
     */
    private static getTime;
}
