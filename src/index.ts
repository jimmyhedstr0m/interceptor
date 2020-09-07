import { Callback, CustomXMLHttpRequest, Listener, Options } from './types';

const urlQueue: string[] = [];
const listeners: Listener[] = [];

(XMLHttpRequest.prototype as CustomXMLHttpRequest).realOpen = XMLHttpRequest.prototype.open;
(XMLHttpRequest.prototype as CustomXMLHttpRequest).realSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method: string, requestUrl: string) {
  urlQueue.push(requestUrl);
  (this as CustomXMLHttpRequest).realOpen(method, requestUrl);
}

XMLHttpRequest.prototype.send = function (value) {
  function isMatch(currentUrl: string, targetUrl: string | RegExp) {
    return typeof targetUrl === 'string'
      ? currentUrl === targetUrl
      : new RegExp(targetUrl).test(currentUrl);
  }

  function onEvent(event: ProgressEvent<XMLHttpRequestEventTarget>) {
    const responseUrl = (event.currentTarget as any).responseURL;
    const queueLength = urlQueue.length;

    for (let i = 0; i < queueLength; i++) {
      if (urlQueue[i] === responseUrl) {
        urlQueue.splice(i, 1);

        for (let j = 0; j < listeners.length; j++) {
          if (isMatch(responseUrl, listeners[j].targetUrl)) {
            const callback = listeners[j].cb;
            const response = (event.currentTarget as any).response;
            if (event.type === 'abort' || event.type === 'error' || (event.currentTarget as any).status >= 400) {
              callback(response, undefined);
            } else {
              callback(undefined, response);
            }

            break;
          }
        }
        return;
      }
    }
  }

  this.addEventListener('abort', onEvent);
  this.addEventListener('error', onEvent);
  this.addEventListener('loadend', onEvent);
  (this as CustomXMLHttpRequest).realSend(value);
}

const defaultOptions: Options = {
  timeout: 30000
};

export class Interceptor {
  private url: string | RegExp = '';
  private options: Options;

  constructor(options?: Options) {
    this.options = options || defaultOptions;
  }

  public register(targetUrl: string | RegExp, cb: Callback) {
    let timer: ReturnType<typeof setTimeout>;

    this.url = targetUrl;

    function callback(err: any, res: any) {
      clearTimeout(timer);

      cb(err, res);
    }

    listeners.push({
      targetUrl: targetUrl,
      cb: callback
    });

    timer = setTimeout(() => cb(targetUrl + ' timed out', undefined), this.options.timeout);
  }

  public unregister() {
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i].targetUrl === this.url) {
        listeners.splice(i, 1);
        return;
      }
    }
  }
}