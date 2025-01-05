class FakeResponse {
  ok = true;

  status = 200;

  headers = new Map();

  text = () => Promise.resolve(this.body);

  json = () => Promise.resolve(JSON.parse(this.body));
}

export class FakeFetch {
  response = new FakeResponse();

  fetch = (url, options) => {
    this.request = { url, options };

    return Promise.resolve(this.response);
  };

  respondWithJson(value) {
    this.respondWithText(JSON.stringify(value));
  }

  respondWithText(value) {
    this.response.body = value;
    this.response.ok = true;
    this.response.status = 200;
  }

  rejectWith(status) {
    this.response.ok = false;
    this.response.status = status;
  }
}
