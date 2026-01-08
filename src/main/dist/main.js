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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
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
    const program = new commander_1.Command();
    program
        .option("--exclude <fields>", "Exclude specific fields from output JSON")
        .option("--include <fields>", "Include specific fields from output JSON");
    program.parse(process.argv);
    const options = program.opts();
    if (options.exclude && options.include) {
        console.log("Error: the --include and --exclude options are mutually exclusive");
        process.exit(1);
    }
    if (options.exclude) {
        howlongtobeat_1.HowLongToBeatParser.excludeFields(options.exclude);
    }
    else if (options.include) {
        howlongtobeat_1.HowLongToBeatParser.includeFields(options.include);
    }
    const gameId = readlineSync.question("Enter game ID: ");
    try {
        const response = await hltbService.detail(gameId);
        console.log();
        console.log(response);
        const formattedJsonResponse = JSON.stringify(response, null, 2);
        const fileName = response.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, "");
        const filePath = `..\\..\\..\\json_outputs\\${fileName}.json`;
        fs.writeFileSync(filePath, formattedJsonResponse);
        console.log(`JSON response has been written to ${fileName}.json`);
        copy_paste_1.default.copy(fileName);
        console.log("fileName has been copied to clipboard");
    }
    catch (error) {
        // Handle errors, including abort error
        throw error;
    }
    console.log("\nKindly brought to you by lily inc.\nThanks for choosing our software!");
}
main();
//# sourceMappingURL=main.js.map