"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HowLongToBeatParser = exports.HowLongToBeatEntry = exports.HowLongToBeatService = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const date_fns_1 = require("date-fns");
const hltbsearch_1 = require("./hltbsearch");
class HowLongToBeatService {
    hltb = new hltbsearch_1.HltbSearch();
    constructor() { }
    /**
     * Get HowLongToBeatEntry from game id, by fetching the detail page like https://howlongtobeat.com/game.php?id=6974 and parsing it.
     * @param gameId the hltb internal gameid
     * @return Promise<HowLongToBeatEntry> the promise that, when fullfilled, returns the game
     */
    async detail(gameId) {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutSignal = setTimeout(() => {
            controller.abort();
        }, 10000);
        let detailPage = await this.hltb.detailHtml(gameId, signal);
        clearTimeout(timeoutSignal);
        let entry = HowLongToBeatParser.parseDetails(detailPage, gameId);
        return entry;
    }
}
exports.HowLongToBeatService = HowLongToBeatService;
/**
 * Encapsulates details of a game
 */
class HowLongToBeatEntry {
    id;
    title;
    description;
    imageUrl;
    platforms;
    genres;
    developers;
    publishers;
    releaseDate;
    timeLabels;
    gameplayMain;
    gameplayMainExtra;
    gameplayCompletionist;
    gameplayAllStyles;
    additionalContent;
    mainGame;
    constructor(id, title, description, imageUrl, platforms, genres, developers, publishers, releaseDate, timeLabels, gameplayMain, gameplayMainExtra, gameplayCompletionist, gameplayAllStyles, additionalContent, mainGame) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.platforms = platforms;
        this.genres = genres;
        this.developers = developers;
        this.publishers = publishers;
        this.releaseDate = releaseDate;
        this.timeLabels = timeLabels;
        this.gameplayMain = gameplayMain;
        this.gameplayMainExtra = gameplayMainExtra;
        this.gameplayCompletionist = gameplayCompletionist;
        this.gameplayAllStyles = gameplayAllStyles;
        this.additionalContent = additionalContent;
        this.mainGame = mainGame;
    }
}
exports.HowLongToBeatEntry = HowLongToBeatEntry;
/**
 * Internal helper class to parse html and create a HowLongToBeatEntry
 */
class HowLongToBeatParser {
    static excludedFields = [];
    /**
     * Parses the passed html to generate an HowLongToBeatyEntry.
     * All the dirty DOM parsing and element traversing is done here.
     * @param html the html as basis for the parsing. taking directly from the response of the hltb detail page
     * @param id the hltb internal id
     * @return HowLongToBeatEntry representing the page
     */
    static parseDetails(html, id) {
        const $ = cheerio_1.default.load(html);
        const liElements = $("div[class*=GameStats_game_times__] li");
        const gameName = $("div[class*=GameHeader_profile_header__]")
            .first()
            .text()
            .trim();
        const gameDescription = !this.excludedFields.includes("description")
            ? $(".in.back_primary.shadow_box div[class*=GameSummary_large__]")
                .first()
                .text()
                .replace(/\s*\.\.\.Read More/, "")
            : undefined;
        const imageUrl = !this.excludedFields.includes("image-url")
            ? $("div[class*=GameHeader_game_image__]")
                .first()
                .find("img")
                .attr("src")
                ?.trim() ?? ""
            : undefined;
        let timeLabels; // = new Array<string[]>();
        let gameplayMain; // = 0;
        let gameplayMainExtra; // = 0;
        let gameplayComplete; // = 0;
        let gameplayAllStyles; // = 0;
        let platforms = !HowLongToBeatParser.excludedFields.includes("platforms")
            ? []
            : undefined;
        let genres = !HowLongToBeatParser.excludedFields.includes("genres") ? [] : undefined;
        let developers = !HowLongToBeatParser.excludedFields.includes("developers")
            ? []
            : undefined;
        let publishers = !HowLongToBeatParser.excludedFields.includes("publishers")
            ? []
            : undefined;
        let firstRelease;
        let releases = [];
        // Parses platforms, genres, developers, publishers and release years
        $("div[class*=GameSummary_profile_info__]").each(function () {
            const metaData = $(this).text();
            // console.log(metaData)
            // Parses the platforms
            if (!HowLongToBeatParser.excludedFields.includes("platforms")) {
                if (metaData.includes("Platforms:")) {
                    platforms = metaData
                        .replace(/\n/g, "")
                        .replace("Platforms:", "")
                        .split(",")
                        .map((data) => data.trim());
                    return;
                }
                else if (metaData.includes("Platform:")) {
                    platforms = metaData
                        .replace(/\n/g, "")
                        .replace("Platform:", "")
                        .split(",")
                        .map((data) => data.trim());
                    return;
                }
            }
            // Parses the genres
            if (!HowLongToBeatParser.excludedFields.includes("genres")) {
                if (metaData.includes("Genres:")) {
                    genres = metaData
                        .replace(/\n/g, "")
                        .replace("Genres:", "")
                        .split(",")
                        .map((data) => data.trim());
                    return;
                }
                else if (metaData.includes("Genre:")) {
                    genres = metaData
                        .replace(/\n/g, "")
                        .replace("Genre:", "")
                        .split(",")
                        .map((data) => data.trim());
                    return;
                }
            }
            // Parses the developers
            if (!HowLongToBeatParser.excludedFields.includes("developers")) {
                if (metaData.includes("Developers:")) {
                    developers = metaData
                        .replace(/\n/g, "")
                        .replace("Developers:", "")
                        .split(",")
                        .map((data) => data.trim());
                    return;
                }
                else if (metaData.includes("Developer:")) {
                    developers = metaData
                        .replace(/\n/g, "")
                        .replace("Developer:", "")
                        .split("ʢ")
                        .map((data) => data.trim());
                    return;
                }
            }
            // Parses the publisherss
            if (!HowLongToBeatParser.excludedFields.includes("publishers")) {
                if (metaData.includes("Publishers:")) {
                    publishers = metaData
                        .replace(/\n/g, "")
                        .replace("Publishers:", "")
                        .split(",")
                        .map((data) => data.trim());
                    return;
                }
                else if (metaData.includes("Publisher:")) {
                    publishers = metaData
                        .replace(/\n/g, "")
                        .replace("Publisher:", "")
                        .split("ʢ")
                        .map((data) => data.trim());
                    return;
                }
            }
            // Parses every release date as a string in an array
            if (!HowLongToBeatParser.excludedFields.includes("release-date")) {
                if (metaData.includes("JP:")) {
                    const dateString = metaData.replace(/\n/g, "").replace("JP:", "");
                    releases.push(dateString);
                }
                if (metaData.includes("NA:")) {
                    const dateString = metaData.replace(/\n/g, "").replace("NA:", "");
                    releases.push(dateString);
                }
                if (metaData.includes("EU:")) {
                    const dateString = metaData.replace(/\n/g, "").replace("EU:", "");
                    releases.push(dateString);
                }
                firstRelease = HowLongToBeatParser.findFirstRelease(releases);
            }
        });
        if (genres !== undefined) {
            genres = HowLongToBeatParser.formatGenres(genres);
        }
        // Parses time
        if (!HowLongToBeatParser.excludedFields.includes("time")) {
            timeLabels = new Array();
            liElements.each(function () {
                let type = $(this).find("h4").text();
                let time = HowLongToBeatParser.parseTime($(this).find("h5").text());
                if (!HowLongToBeatParser.excludedFields.includes("time-main") &&
                    (type.startsWith("Main Story") ||
                        type.startsWith("Single-Player") ||
                        type.startsWith("Solo"))) {
                    gameplayMain = time;
                    timeLabels?.push(["gameplayMain", type]);
                }
                else if (!HowLongToBeatParser.excludedFields.includes("time-extra") &&
                    (type.startsWith("Main + Sides") || type.startsWith("Co-Op"))) {
                    gameplayMainExtra = time;
                    timeLabels.push(["gameplayMainExtra", type]);
                }
                else if (!HowLongToBeatParser.excludedFields.includes("time-completionist") &&
                    (type.startsWith("Completionist") || type.startsWith("Vs."))) {
                    gameplayComplete = time;
                    timeLabels?.push(["gameplayComplete", type]);
                }
                else if (!HowLongToBeatParser.excludedFields.includes("time-all-styles") &&
                    type.startsWith("All Styles")) {
                    gameplayAllStyles = time;
                    timeLabels?.push(["gameplayAllStyles", type]);
                }
            });
        }
        // Parses DLCs (or main game if a DLC is being scraped)
        let additionalContent;
        let mainGame;
        $("tbody.spreadsheet").each(function () {
            const table = $(this).closest("table");
            const tableHead = table.children().first();
            const tableHeadRow = tableHead.children().first();
            const tableTitle = tableHeadRow.children().first();
            if (!HowLongToBeatParser.excludedFields.includes("dlc") &&
                tableTitle.text().trim().includes("Additional Content")) {
                additionalContent = [];
                $(this)
                    .find("a")
                    .each(function () {
                    const content = $(this).text().trim();
                    additionalContent?.push(content);
                });
            }
            else if (tableTitle.text().trim().includes("Main Game")) {
                mainGame = $(this).find("a").first().text().trim();
            }
        });
        return new HowLongToBeatEntry(id, gameName, gameDescription, imageUrl, platforms, genres, developers, publishers, firstRelease, timeLabels, gameplayMain, gameplayMainExtra, gameplayComplete, gameplayAllStyles, additionalContent, mainGame);
    }
    // Replaces some genres with more appropriate values (for me at least)
    // It also prevents the duplication of the genre 'Side scrolling' and different values for RPG games
    static formatGenres(genres) {
        let formattedGenres = [];
        formattedGenres = genres.map((genre) => {
            if (genre.toLowerCase() === "platform") {
                return "Platformer";
            }
            else if (genre.toLowerCase() === "side" ||
                genre.toLowerCase() === "scrolling") {
                return "Side scrolling";
            }
            else if (genre.toLowerCase() === "role-playing" ||
                genre.toLowerCase() === "role playing") {
                return "RPG";
            }
            return genre;
        });
        // Removes duplicates and returns the arrray with unique strings
        return [...new Set(formattedGenres)];
    }
    /**
     * Utility method used for parsing an array of strings
     * representing dates to find the earliest release date
     * and return it as a string in yyyy-MM-dd fomrmat
     *
     * @param releases representing the release years in different regions
     * @returns the first release year formatted yyyy-MM-dd
     */
    static findFirstRelease(releases) {
        // Define regular expressions for matching the date formats
        const fullDateFormatRegex = /^[a-zA-Z]+\s+\d{2},\s+\d{4}$/; // Example: "January 1, 2022"
        const yearOnlyFormatRegex = /^\d{4}$/; // Example: "2022"
        // Converts date strings in the releases array to Date objects
        const releasesDates = releases.map((dateString) => {
            if (fullDateFormatRegex.test(dateString.trim())) {
                return (0, date_fns_1.parse)(dateString.trim(), "MMMM dd, yyyy", new Date());
            }
            else if (yearOnlyFormatRegex.test(dateString.trim())) {
                return (0, date_fns_1.parse)(dateString.trim(), "yyyy", new Date());
            }
            // If the date cannot be parsed, an arbitrary date 100 years from the current date is returned
            return (0, date_fns_1.add)(new Date(), { years: 100 });
        });
        // Finds the earliest Date
        if (releasesDates.length > 0) {
            const firstReleaseDate = releasesDates.reduce((earliest, current) => {
                return current < earliest ? current : earliest;
            });
            return (0, date_fns_1.format)(firstReleaseDate, "yyyy-MM-dd");
        }
        // Formats thec date to yyyy-MM-dd string
        return "";
    }
    /**
     * Utility method used for parsing a given input text (like
     * &quot;44&#189;&quot;) as double (like &quot;44.5&quot;). The input text
     * represents the amount of hours needed to play this game.
     *
     * @param text
     *            representing the hours
     * @return the pares time as double
     */
    static parseTime(text) {
        // '65&#189; Hours/Mins'; '--' if not known
        if (text.startsWith("--")) {
            return 0;
        }
        if (text.indexOf(" - ") > -1) {
            return HowLongToBeatParser.handleRange(text);
        }
        return HowLongToBeatParser.getTime(text);
    }
    /**
     * Parses a range of numbers and creates the average.
     * @param text
     *            like '5 Hours - 12 Hours' or '2½ Hours - 33½ Hours'
     * @return the arithmetic median of the range
     */
    static handleRange(text) {
        let range = text.split(" - ");
        let d = (HowLongToBeatParser.getTime(range[0]) +
            HowLongToBeatParser.getTime(range[1])) /
            2;
        return d;
    }
    /**
     * Parses a string to get a number
     * @param text,
     *            can be '12 Hours' or '5½ Hours' or '50 Mins'
     * @return the ttime, parsed from text
     */
    static getTime(text) {
        //check for Mins, then assume 1 hour at least
        const timeUnit = text.substring(text.indexOf(" ") + 1).trim();
        if (timeUnit === "Mins") {
            return 1;
        }
        let time = text.substring(0, text.indexOf(" "));
        if (time.indexOf("½") > -1) {
            return 0.5 + parseInt(time.substring(0, text.indexOf("½")));
        }
        return parseInt(time);
    }
}
exports.HowLongToBeatParser = HowLongToBeatParser;
//# sourceMappingURL=howlongtobeat.js.map