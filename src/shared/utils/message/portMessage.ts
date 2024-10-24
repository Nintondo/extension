import { browserRuntimeConnect } from "../browser";
import Message from "./message";

class PortMessage extends Message {
  port: any | null = null;
  listenCallback: any = undefined;

  constructor(port?: any) {
    super();

    if (port) {
      this.port = port;
    }
  }

  connect(name?: string) {
    this.port = browserRuntimeConnect(name ? { name } : undefined);
    this.port.onMessage.addListener(
      async ({ _type_, data }: { _type_: string; data: any }) => {
        if (_type_ === `${this._EVENT_PRE}message`) {
          this.emit("message", data);
          return;
        }

        if (_type_ === `${this._EVENT_PRE}response`) {
          await this.onResponse(data);
        }
      }
    );

    return this;
  }

  async listen(listenCallback: any) {
    if (!this.port) return;
    this.listenCallback = listenCallback;
    this.port.onMessage.addListener(
      async ({ _type_, data }: { _type_: string; data: any }) => {
        if (_type_ === `${this._EVENT_PRE}request`) {
          await this.onRequest(data);
        }
      }
    );

    return this;
  }

  send(type: string, data: any) {
    if (!this.port) return;
    try {
      this.port.postMessage({ _type_: `${this._EVENT_PRE}${type}`, data });
    } catch (e) {
      console.error(e);
    }
  }

  dispose() {
    this._dispose();
    this.port?.disconnect();
  }
}

export default PortMessage;
