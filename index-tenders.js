import { TendersService } from './src/tenders.js';

import { Elasticsearch } from './src/elasticsearch.js';

const elasticService = new Elasticsearch({
  indexName: 'tenders',
  apiKey: 'WmF1czVZNEJlSHJxcEVyNjBSVFE6UV9jN0ttUGlTUm1uUi0wdm1vOU1BQQ=='
});
// elasticService.deleteIndex();


const numberOfDays = 365;
const startFromOffset = (new Date()).getTime() / 1000 - 86400 * numberOfDays;

const tenderService = new TendersService(100);


let nextOffset = startFromOffset;
while (nextOffset) {
  const tendersList = await tenderService.getTenders(nextOffset);
  nextOffset = tendersList.nextOffset;

  const requests = tendersList.data.map(async ({ id }) => {
    const rawTender = await tenderService.getTenderById(id);
    const { tenderID, status, title, dateCreated, owner, value } = rawTender;

    return {
      id,
      tenderID,
      status,
      title,
      dateCreated,
      owner,
      value,
    }
  });

  const tenders = await Promise.all(requests);

  const elasticResponse = await elasticService.indexDocuments(tenders);

  console.log({
    numberReceived: tendersList.data.length,
    numberIndexed: elasticResponse.successful,
    nextOffset: tendersList.nextOffset ? (new Date(tendersList.nextOffset * 1000)).toISOString() : null,
  });
}




