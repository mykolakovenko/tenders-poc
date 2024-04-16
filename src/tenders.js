import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 20,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: ({ response }) => response.status === 429,
});


export class TendersService {
  #prozorroApiUrl = 'https://public-api.prozorro.gov.ua/api/2.5';
  #pageSize

  constructor(pageSize = 1000) {
    this.#pageSize = pageSize;
  }

  async getTenders(offset) {
    const response = await axios.get(`${this.#prozorroApiUrl}/tenders?limit=${this.#pageSize}&offset=${offset}`);
    const { data } = response.data;

    if (data.length === 0) {
      return { data }
    }

    const nextOffset = response.data.next_page.offset;
    return { data, nextOffset };
  }

  async getTenderById(id) {
    const { data } = await axios.get(`${this.#prozorroApiUrl}/tenders/${id}`);

    return data.data;
  }
}

