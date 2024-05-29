"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HltbSearch = void 0;
const axios_1 = __importDefault(require("axios"));
const user_agents_1 = __importDefault(require("user-agents"));
/**
 * Takes care about the http connection and response handling
 */
class HltbSearch {
    static BASE_URL = 'https://howlongtobeat.com/';
    static DETAIL_URL = `${HltbSearch.BASE_URL}game/`;
    static SEARCH_URL = `${HltbSearch.BASE_URL}api/search`;
    static IMAGE_URL = `${HltbSearch.BASE_URL}games/`;
    /*
    payload: any = {
      "searchType": "games",
      "searchTerms": [
  
      ],
      "searchPage": 1,
      "size": 20,
      "searchOptions": {
        "games": {
          "userId": 0,
          "platform": "",
          "sortCategory": "popular",
          "rangeCategory": "main",
          "rangeTime": {
            "min": 0,
            "max": 0
          },
          "gameplay": {
            "perspective": "",
            "flow": "",
            "genre": ""
          },
          "modifier": ""
        },
        "users": {
          "sortCategory": "postcount"
        },
        "filter": "",
        "sort": 0,
        "randomizer": 0
      }
    }
    */
    async detailHtml(gameId, signal) {
        try {
            const result = await axios_1.default.get(`${HltbSearch.DETAIL_URL}${gameId}`, {
                headers: {
                    'User-Agent': new user_agents_1.default().toString(),
                    'origin': 'https://howlongtobeat.com',
                    'referer': 'https://howlongtobeat.com'
                },
                timeout: 20000,
                signal,
            });
            return result.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response && error.response.status !== 200) {
                throw new Error(`Got non-200 status code from howlongtobeat.com [${error.response.status}] ${JSON.stringify(error.response)}`);
            }
            else {
                throw error;
            }
        }
    }
}
exports.HltbSearch = HltbSearch;
//# sourceMappingURL=hltbsearch.js.map