/**
 * Takes care about the http connection and response handling
 */
export declare class HltbSearch {
    static BASE_URL: string;
    static DETAIL_URL: string;
    static SEARCH_URL: string;
    static IMAGE_URL: string;
    detailHtml(gameId: string, signal?: AbortSignal): Promise<string>;
}
