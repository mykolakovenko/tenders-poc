import { Client } from '@elastic/elasticsearch';

export class Elasticsearch {
  #indexName;
  #client;

  constructor({ indexName, apiKey }) {
    this.#indexName = indexName;

    this.#client = new Client({
      node: 'https://localhost:9200/',
      auth: {
        apiKey,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  indexDocuments(documentsList) {
    return this.#client.helpers.bulk({
      datasource: documentsList,
      onDocument: (doc) => ({ index: { _index: this.#indexName }}),
    });
  }

  // Simple fuzzy search
  query(query) {
    return this.#client.search({
      index: this.#indexName,
      query: {
        query_string: {
          query: `${query}~2`,
        },
      },
    });
  }

  dateHistogram(startFromDate, groupingInterval = 'month') {
    return this.#client.search({
      index: this.#indexName,
      size: 0,
      query: {
        range: {
          dateCreated: {
            gte: startFromDate,
          },
        },
      },
      aggregations: {
        tendersPerMonth: {
          date_histogram: {
            field: 'dateCreated',           // The field that contains the date
            calendar_interval: groupingInterval,  // Use 'calendar_interval' for consistent month intervals
            format: 'yyyy-MM-dd',        // Format the date key as you prefer
            min_doc_count: 1,
          },
          aggs: {
            averageTenderPrice: {
              avg: {
                field: 'value.amount'        // The field that contains the price you want to average
              },
            },
          },
        },
      },
    })
  }

  deleteIndex() {
    return this.#client.indices.delete({ index: this.#indexName })
  }
}
