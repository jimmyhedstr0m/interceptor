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
    const responseUrl = (event.currentTarget as any).responseURL.replace(window.origin, '');
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

export default class Interceptor {
  private static url: string | RegExp = '';

  public static register(targetUrl: string | RegExp, options: Options | undefined, cb: Callback) {
    const currentOptions = options || defaultOptions;
    let timer: ReturnType<typeof setTimeout> | undefined;

    this.url = targetUrl;

    function callback(err: any, res: any) {
      clearTimeout(timer);
      timer = undefined;

      cb(err, res);
    }

    listeners.push({
      targetUrl: targetUrl,
      cb: callback
    });

    timer = setTimeout(() => {
      timer = undefined;
      cb(targetUrl + ' timed out', undefined);
    }, currentOptions.timeout);
  }

  public static unregister() {
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i].targetUrl === this.url) {
        listeners.splice(i, 1);
        return;
      }
    }
  }
}