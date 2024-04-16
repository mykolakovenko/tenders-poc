import axios from 'axios';


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

