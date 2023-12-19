import Message from ".";

export default class BroadcastChannelMessage extends Message {
  private _channel: BroadcastChannel;

  constructor(name?: string) {
    super();
    if (!name) {
      throw new Error("the broadcastChannel name is missing");
    }

    this._channel = new BroadcastChannel(name);
  }

  connect = () => {
    this._channel.onmessage = ({ data: { type, data } }) => {
      if (type === "message") {
        this.emit("message", data);
      } else if (type === "response") {
        this.onResponse(data);
      }
    };

    return this;
  };

  listen = (listenCallback: CallableFunction) => {
    this.listenCallback = listenCallback;

    this._channel.onmessage = ({ data: { type, data } }) => {
      if (type === "request") {
        this.onRequest(data);
      }
    };

    return this;
  };

  send = (type: string, data: any) => {
    this._channel.postMessage({
      type,
      data,
    });
  };

  dispose = () => {
    this._dispose();
    this._channel.close();
  };
}
