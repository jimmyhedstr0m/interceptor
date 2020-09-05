export type Callback = (err: any, res: any) => void;

export interface CustomXMLHttpRequest extends XMLHttpRequest {
  realOpen: typeof XMLHttpRequest.prototype.open;
  realSend: typeof XMLHttpRequest.prototype.send;
}

export interface Listener {
  targetUrl: string | RegExp;
  cb: Callback;
}

export interface Options {
  timeout: number;
}