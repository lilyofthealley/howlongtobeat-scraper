
import { HowLongToBeatService } from "./howlongtobeat";
import * as readlineSync from 'readline-sync';
import * as fs from 'fs';
import copyPaste from 'copy-paste';

/**
 * Asks the user for an hltb game id as input.
 * Calls the detail method of an HowLongToBeatService that returns a Promise<HowLongToBeatEntry>
 * Then it writes the response in a JSON file in the json_outputs dir found in the root dir using the game title as filename.
 */
async function main() {
    const hltbService = new HowLongToBeatService();
    const gameId = readlineSync.question('Enter game ID: ');

    try {
        const response = await hltbService.detail(gameId);
        console.log(response);
        const formattedJsonResponse = JSON.stringify(response, null, 2);
        const fileName: string = response.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '');    
        const filePath: string = `..\\..\\..\\json_outputs\\${fileName}.json`;

        fs.writeFileSync(filePath, formattedJsonResponse);
        console.log('JSON response has been written to response.json');

        copyPaste.copy(fileName);
        console.log('fileName has been copied to clipboard');

    } catch (error) {
        // Handle errors, including abort error
        throw error;
    }
    console.log('\nKindly brought to you by lily inc.\nThanks for choosing our software!')
}

main();