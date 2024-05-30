import cheerio from "cheerio";
import { parse, format, add } from "date-fns";

import { HltbSearch } from "./hltbsearch";

export class HowLongToBeatService {
  private hltb: HltbSearch = new HltbSearch();

  constructor() {}

  /**
   * Get HowLongToBeatEntry from game id, by fetching the detail page like https://howlongtobeat.com/game.php?id=6974 and parsing it.
   * @param gameId the hltb internal gameid
   * @return Promise<HowLongToBeatEntry> the promise that, when fullfilled, returns the game
   */
  async detail(gameId: string): Promise<HowLongToBeatEntry> {
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

  /* Search method commented out, I don't need it personally and I won't update it

  async search(query: string, signal?: AbortSignal): Promise<Array<HowLongToBeatEntry>> {
    let searchTerms = query.split(' ');
    let search = await this.hltb.search(
      searchTerms,
      signal
    );
    // console.log(`Found ${search.count} results`);
    let hltbEntries = new Array<HowLongToBeatEntry>();
    for (const resultEntry of search.data) {
      hltbEntries.push(new HowLongToBeatEntry(
        '' + resultEntry.game_id, // game id is now a number, but I want to keep the model stable
        resultEntry.game_name,
        '', // no description
        resultEntry.profile_platform ? resultEntry.profile_platform.split(', ') : [],
        [["Main", "Main"] , ["Main + Extra", "Main + Extra"], ["Completionist", "Completionist"]],
        Math.round(resultEntry.comp_main / 3600),
        Math.round(resultEntry.comp_plus / 3600),
        Math.round(resultEntry.comp_100 / 3600),
        HowLongToBeatService.calcDistancePercentage(resultEntry.game_name, query),
        query
      ));
    }
    return hltbEntries;
  }
  */

  /**
   * Calculates the similarty of two strings based on the levenshtein distance in relation to the string lengths.
   * It is used to see how similar the search term is to the game name. This, of course has only relevance if the search term is really specific and matches the game name as good as possible.
   * When using a proper search index, this would be the ranking/rating and much more sophisticated than this helper.
   * @param text the text to compare to
   * @param term the string of which the similarity is wanted
   */
  /*
  static calcDistancePercentage(text: string, term: string): number {
    let longer: string = text.toLowerCase().trim();
    let shorter: string = term.toLowerCase().trim();
    if (longer.length < shorter.length) {
      // longer should always have
      // greater length
      let temp: string = longer;
      longer = shorter;
      shorter = temp;
    }
    let longerLength: number = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    let distance = levenshtein.get(longer, shorter);
    return Math.round(((longerLength - distance) / longerLength) * 100) / 100;
  }
  */
}

/**
 * Encapsulates details of a game
 */
export class HowLongToBeatEntry {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly platforms?: string[],
    public readonly genres?: string[],
    public readonly developers?: string[],
    public readonly publishers?: string[],
    public readonly releaseDate?: string,
    public readonly timeLabels?: Array<string[]>,
    public readonly gameplayMain?: number,
    public readonly gameplayMainExtra?: number,
    public readonly gameplayCompletionist?: number,
    public readonly gameplayAllStyles?: number,
    public readonly additionalContent?: string[],
    public readonly mainGame?: string,
  ) {}
}

/**
 * Internal helper class to parse html and create a HowLongToBeatEntry
 */
export class HowLongToBeatParser {
  private static excludedFields: string[] = [];

  /**
   * Parses the passed html to generate an HowLongToBeatyEntry.
   * All the dirty DOM parsing and element traversing is done here.
   * @param html the html as basis for the parsing. taking directly from the response of the hltb detail page
   * @param id the hltb internal id
   * @return HowLongToBeatEntry representing the page
   */
  static parseDetails(html: string, id: string): HowLongToBeatEntry {
    const $ = cheerio.load(html);
    const liElements = $("div[class*=GameStats_game_times__] li");

    const gameName = $("div[class*=GameHeader_profile_header__]")
      .first()
      .text()
      .trim();

    const gameDescription: string | undefined = !this.excludedFields.includes(
      "description",
    )
      ? $(".in.back_primary.shadow_box div[class*=GameSummary_large__]")
          .first()
          .text()
          .replace(/\s*\.\.\.Read More/, "")
      : undefined;

    const imageUrl: string | undefined = !this.excludedFields.includes(
      "image-url",
    )
      ? $("div[class*=GameHeader_game_image__]")
          .first()
          .find("img")
          .attr("src")
          ?.trim() ?? ""
      : undefined;

    let timeLabels: Array<string[]> | undefined; // = new Array<string[]>();
    let gameplayMain: number | undefined; // = 0;
    let gameplayMainExtra: number | undefined; // = 0;
    let gameplayComplete: number | undefined; // = 0;
    let gameplayAllStyles: number | undefined; // = 0;
    let platforms: string[] | undefined =
      !HowLongToBeatParser.excludedFields.includes("platforms")
        ? []
        : undefined;
    let genres: string[] | undefined =
      !HowLongToBeatParser.excludedFields.includes("genres") ? [] : undefined;
    let developers: string[] | undefined =
      !HowLongToBeatParser.excludedFields.includes("developers")
        ? []
        : undefined;
    let publishers: string[] | undefined =
      !HowLongToBeatParser.excludedFields.includes("publishers")
        ? []
        : undefined;
    let firstRelease: string | undefined;
    let releases: string[] = [];

    // Parses platforms, genres, developers, publishers and release years
    $("div[class*=GameSummary_profile_info__]").each(function (this: Element) {
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
        } else if (metaData.includes("Platform:")) {
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
        } else if (metaData.includes("Genre:")) {
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
        } else if (metaData.includes("Developer:")) {
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
        } else if (metaData.includes("Publisher:")) {
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
      timeLabels = new Array<string[]>();
      liElements.each(function (this: Element) {
        let type: string = $(this).find("h4").text();
        let time: number = HowLongToBeatParser.parseTime(
          $(this).find("h5").text(),
        );
        if (
          !HowLongToBeatParser.excludedFields.includes("time-main") &&
          (type.startsWith("Main Story") ||
            type.startsWith("Single-Player") ||
            type.startsWith("Solo"))
        ) {
          gameplayMain = time;
          timeLabels?.push(["gameplayMain", type]);
        } else if (
          !HowLongToBeatParser.excludedFields.includes("time-extra") &&
          (type.startsWith("Main + Sides") || type.startsWith("Co-Op"))
        ) {
          gameplayMainExtra = time;
          timeLabels!.push(["gameplayMainExtra", type]);
        } else if (
          !HowLongToBeatParser.excludedFields.includes("time-completionist") &&
          (type.startsWith("Completionist") || type.startsWith("Vs."))
        ) {
          gameplayComplete = time;
          timeLabels?.push(["gameplayComplete", type]);
        } else if (
          !HowLongToBeatParser.excludedFields.includes("time-all-styles") &&
          type.startsWith("All Styles")
        ) {
          gameplayAllStyles = time;
          timeLabels?.push(["gameplayAllStyles", type]);
        }
      });
    }

    // Parses DLCs (or main game if a DLC is being scraped)
    let additionalContent: string[] | undefined;
    let mainGame: string | undefined;

    $("tbody.spreadsheet").each(function (this: Element) {
      const table = $(this).closest("table");
      const tableHead = table.children().first();
      const tableHeadRow = tableHead.children().first();
      const tableTitle = tableHeadRow.children().first();

      if (
        !HowLongToBeatParser.excludedFields.includes("dlc") &&
        tableTitle.text().trim().includes("Additional Content")
      ) {
        additionalContent = [];
        $(this)
          .find("a")
          .each(function (this: Element) {
            const content = $(this).text().trim();
            additionalContent?.push(content);
          });
      } else if (tableTitle.text().trim().includes("Main Game")) {
        mainGame = $(this).find("a").first().text().trim();
      }
    });

    return new HowLongToBeatEntry(
      id,
      gameName,
      gameDescription,
      imageUrl,
      platforms,
      genres,
      developers,
      publishers,
      firstRelease,
      timeLabels,
      gameplayMain,
      gameplayMainExtra,
      gameplayComplete,
      gameplayAllStyles,
      additionalContent,
      mainGame,
    );
  }

  // Replaces some genres with more appropriate values (for me at least)
  // It also prevents the duplication of the genre 'Side scrolling' and different values for RPG games
  private static formatGenres(genres: string[]) {
    let formattedGenres: string[] = [];

    formattedGenres = genres.map((genre) => {
      if (genre.toLowerCase() === "platform") {
        return "Platformer";
      } else if (
        genre.toLowerCase() === "side" ||
        genre.toLowerCase() === "scrolling"
      ) {
        return "Side scrolling";
      } else if (
        genre.toLowerCase() === "role-playing" ||
        genre.toLowerCase() === "role playing"
      ) {
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
  private static findFirstRelease(releases: string[]) {
    // Define regular expressions for matching the date formats
    const fullDateFormatRegex = /^[a-zA-Z]+\s+\d{2},\s+\d{4}$/; // Example: "January 1, 2022"
    const yearOnlyFormatRegex = /^\d{4}$/; // Example: "2022"

    // Converts date strings in the releases array to Date objects
    const releasesDates = releases.map((dateString) => {
      if (fullDateFormatRegex.test(dateString.trim())) {
        return parse(dateString.trim(), "MMMM dd, yyyy", new Date());
      } else if (yearOnlyFormatRegex.test(dateString.trim())) {
        return parse(dateString.trim(), "yyyy", new Date());
      }
      // If the date cannot be parsed, an arbitrary date 100 years from the current date is returned
      return add(new Date(), { years: 100 });
    });

    // Finds the earliest Date
    if (releasesDates.length > 0) {
      const firstReleaseDate = releasesDates.reduce((earliest, current) => {
        return current < earliest ? current : earliest;
      });
      return format(firstReleaseDate, "yyyy-MM-dd");
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
  private static parseTime(text: string): number {
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
  private static handleRange(text: string): number {
    let range: Array<string> = text.split(" - ");
    let d: number =
      (HowLongToBeatParser.getTime(range[0]) +
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
  private static getTime(text: string): number {
    //check for Mins, then assume 1 hour at least
    const timeUnit = text.substring(text.indexOf(" ") + 1).trim();
    if (timeUnit === "Mins") {
      return 1;
    }
    let time: string = text.substring(0, text.indexOf(" "));
    if (time.indexOf("½") > -1) {
      return 0.5 + parseInt(time.substring(0, text.indexOf("½")));
    }
    return parseInt(time);
  }
}
