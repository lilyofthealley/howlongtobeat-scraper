"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const howlongtobeat_1 = require("./howlongtobeat");
const readlineSync = __importStar(require("readline-sync"));
const fs = __importStar(require("fs"));
const copy_paste_1 = __importDefault(require("copy-paste"));
/**
 * Asks the user for an hltb game id as input.
 * Calls the detail method of an HowLongToBeatService that returns a Promise<HowLongToBeatEntry>
 * Then it writes the response in a JSON file in the json_outputs dir found in the root dir using the game title as filename.
 */
async function main() {
    const hltbService = new howlongtobeat_1.HowLongToBeatService();
    const gameId = readlineSync.question('Enter game ID: ');
    try {
        const response = await hltbService.detail(gameId);
        console.log(response);
        const formattedJsonResponse = JSON.stringify(response, null, 2);
        const fileName = response.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '');
        const filePath = `..\\..\\..\\json_outputs\\${fileName}.json`;
        fs.writeFileSync(filePath, formattedJsonResponse);
        console.log('JSON response has been written to response.json');
        copy_paste_1.default.copy(fileName);
        console.log('fileName has been copied to clipboard');
    }
    catch (error) {
        // Handle errors, including abort error
        throw error;
    }
    console.log('\nKindly brought to you by lily inc.\nThanks for choosing our software!');
}
main();
//# sourceMappingURL=main.js.map