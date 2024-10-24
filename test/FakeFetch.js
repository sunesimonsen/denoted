class FakeResponse {
  ok = true;
  status = 200;
  headers = new Map();
  text = () => Promise.resolve(this.body);
  json = () => Promise.resolve(this.json || JSON.parse(this.body));
}

export class FakeFetch {
  response = new FakeResponse();

  fetch = (url, options) => {
    this.request = { url, options };
    return Promise.resolve(this.response);
  };
}
