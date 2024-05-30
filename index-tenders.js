import { TendersService } from './src/tenders.js';

import { Elasticsearch } from './src/elasticsearch.js';
const apiKey = 'WmF1czVZNEJlSHJxcEVyNjBSVFE6UV9jN0ttUGlTUm1uUi0wdm1vOU1BQQ==';

const tendersElasticService = new Elasticsearch({ indexName: 'tenders_with_parties', apiKey });
const suppliersElasticService = new Elasticsearch({ indexName: 'suppliers', apiKey });
const procuringEntitiesElasticService = new Elasticsearch({ indexName: 'procuring_entities', apiKey });

console.time('ExecutionTime');

const numberOfDays = 365;
const startFromOffset = (new Date()).getTime() / 1000 - 86400 * numberOfDays;

const tenderService = new TendersService(100);

const mapEntity = (rawEntity) => {
  if (!rawEntity) {
    return null;
  }

  return {
    id: rawEntity.identifier.id,
    name: rawEntity.name,
    identifier: `${rawEntity.identifier.scheme}-${rawEntity.identifier.id}`,
    address: rawEntity.address,
    contactPoint: rawEntity.contactPoint,
  };
}


let nextOffset = startFromOffset;
while (nextOffset) {
  const tendersList = await tenderService.getTenders(nextOffset);
  nextOffset = tendersList.nextOffset;

  const requests = tendersList.data.map(async ({ id }) => {
    const rawTender = await tenderService.getTenderById(id);
    const { tenderID, status, title, dateCreated, owner, value, procuringEntity: procuringEntityRaw } = rawTender;

    const suppliers = [];
    if (rawTender.contracts && rawTender.contracts[0]?.suppliers) {
      rawTender.contracts[0].suppliers.forEach(rawSupplier => {
        const supplier = mapEntity(rawSupplier);
        if (supplier) {
          suppliers.push(supplier);
        }
      });
    }

    return {
      id,
      tenderID,
      status,
      title,
      dateCreated,
      owner,
      value,
      procuringEntity: mapEntity(procuringEntityRaw),
      suppliers,
    }
  });

  const tenders = await Promise.all(requests);


  let suppliers = [];
  const procuringEntities = [];
  tenders.forEach(tender => {
    suppliers = suppliers.concat(tender.suppliers);
    procuringEntities.push(tender.procuringEntity);
  })


  const elasticResponse = await Promise.all([
    tendersElasticService.indexDocuments(tenders),
    suppliersElasticService.indexDocuments(suppliers),
    procuringEntitiesElasticService.indexDocuments(procuringEntities),
  ])

  console.log({
    tendersReceived: tendersList.data.length,
    tendersIndexed: elasticResponse[0].successful,
    suppliersIndexed: elasticResponse[1].successful,
    procuringEntitiesIndexed: elasticResponse[2].successful,
    nextOffset: tendersList.nextOffset ? (new Date(tendersList.nextOffset * 1000)).toISOString() : null,
  });
}

console.timeEnd('ExecutionTime');
