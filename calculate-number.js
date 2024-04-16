import axios from 'axios';

const numberOfDays = 365;

const startFromOffset = (new Date()).getTime() / 1000 - 86400 * numberOfDays;

const getTenders = async (offset) => {
  const response = await axios.get(`https://public-api.prozorro.gov.ua/api/2.5/tenders?limit=1000&offset=${offset}`);

  const number = response.data.data.length;
  if (number === 0) {
    return { number }
  }

  const nextOffset = response.data.next_page.offset;

  return { number, nextOffset };
}

let result = 0;

let nextOffset = startFromOffset;
while (nextOffset) {
  const response = await getTenders(nextOffset);
  console.log({
    number: response.number,
    nextOffset: response.nextOffset ? (new Date(response.nextOffset * 1000)).toISOString() : null,
  });

  result += response.number;
  nextOffset = response.nextOffset;
}

console.log(`number of updated tenders over last ${numberOfDays} day(s) is ${result}`);
