import http from 'http';

import Interceptor from './index';

const host = 'localhost';
const port = 8080;

const requestListener: http.RequestListener = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  switch (req.url) {
    case '/api/v1/status':
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true }));
      return;
    case '/api/v1/users':
      res.statusCode = 200;
      res.end(JSON.stringify({ name: 'John Doe' }));
      return;
    default:
      res.statusCode = 404;
      res.end('Not found');
  }
};

const server = http.createServer(requestListener);
const api = 'http://localhost:8080/api/v1/status';

describe('Interceptor', () => {
  beforeAll((done) => {
    server.listen(port, host, () => done());
  });

  afterAll((done) => {
    server.close(() => done());
  });

  it('returns successful callback', (done) => {
    const interceptor = new Interceptor({ timeout: 3000 });
    interceptor.register(api, (err, res) => {
      interceptor.unregister();

      expect(err).toBeUndefined();
      expect(res).toBe(JSON.stringify({ ok: true }));
      done();
    });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', api);
    xhr.send();
  });

  it('times out', (done) => {
    const interceptor = new Interceptor({ timeout: 0 });
    interceptor.register(api, (err, res) => {
      interceptor.unregister();

      expect(err).toBeTruthy();
      expect(res).toBeUndefined();
      done();
    });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', api);
    xhr.send();
  });

  it('matches regexp', (done) => {
    const interceptor = new Interceptor();
    interceptor.register(/users/, (err, res) => {
      interceptor.unregister();

      expect(err).toBeUndefined();
      expect(res).toBe(JSON.stringify({ name: 'John Doe' }));
      done();
    });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8080/api/v1/users');
    xhr.send();
  });

  it('listens for multiple results', (done) => {
    const interceptor = new Interceptor();
    const iterations = 2;
    let currentCount = 0;

    interceptor.register(api, (err, res) => {
      currentCount++;

      expect(err).toBeUndefined();
      expect(res).toBeTruthy();

      if (currentCount === iterations) {
        interceptor.unregister();
        done();
      }
    });

    for (let i = 0; i < iterations; i++) {
      setTimeout(() => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', api);
        xhr.send();
      }, i * 1000);
    }
  });
});