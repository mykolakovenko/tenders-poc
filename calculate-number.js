import { TendersService } from './src/tenders.js';

const numberOfDays = 1;
const startFromOffset = (new Date()).getTime() / 1000 - 86400 * numberOfDays;

const tenderService = new TendersService();
let result = 0;

let nextOffset = startFromOffset;
while (nextOffset) {
  const response = await tenderService.getTenders(nextOffset);
  console.log({
    number: response.data.length,
    nextOffset: response.nextOffset ? (new Date(response.nextOffset * 1000)).toISOString() : null,
  });

  result += response.data.length;
  nextOffset = response.nextOffset;
}

console.log(`number of updated tenders over last ${numberOfDays} day(s) is ${result}`);

