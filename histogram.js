import { Elasticsearch } from './src/elasticsearch.js';
import { argv } from 'node:process';


const msInDay = 86400000;

const elasticService = new Elasticsearch({
  indexName: 'tenders',
  apiKey: 'WmF1czVZNEJlSHJxcEVyNjBSVFE6UV9jN0ttUGlTUm1uUi0wdm1vOU1BQQ==' // Don't worry, it's local
});

const groupingInterval = argv[2] || 'month';
let startDate = new Date();

// Calculating report time window based on the grouping interval
switch (groupingInterval) {
  case 'year': startDate.setTime(Date.now() - 10 * 365 * msInDay); // last 10 year by year
    break;

  case 'month': startDate.setTime(Date.now() - 365 * msInDay); // last year by month
    break;

  case 'week': startDate.setTime(Date.now() - 60 * msInDay); // last 60 days by week
    break;

  default:
    throw new Error('Valid aggregation parameters are year, month, week');
}


const data = await elasticService.dateHistogram(startDate, groupingInterval);

console.log(data.aggregations.tendersPerMonth.buckets.map(item => ({
  month: item.key_as_string,
  averageTenderPrice: item.averageTenderPrice.value,
  tendersCount: item.doc_count,
})));

console.log(`Execution time: ${data.took}ms`);
