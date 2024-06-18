import { ethErrors } from "eth-rpc-errors";

import type { NintondoProvider } from "./index";

class PushEventHandlers {
  provider: NintondoProvider;

  constructor(provider: NintondoProvider) {
    this.provider = provider;
  }

  _emit(event: string, data: any) {
    if (this.provider._initialized) {
      this.provider.emit(event, data);
    }
  }

  connect = (data: any) => {
    if (!this.provider._isConnected) {
      this.provider._isConnected = true;
      this.provider._state.isConnected = true;
      this._emit("connect", data);
    }
  };

  unlock = () => {
    this.provider._isUnlocked = true;
    this.provider._state.isUnlocked = true;
  };

  lock = () => {
    this.provider._isUnlocked = false;
  };

  disconnect = () => {
    this.provider._isConnected = false;
    this.provider._state.isConnected = false;
    this.provider._state.accounts = null;
    this.provider._selectedAddress = null;
    const disconnectError = ethErrors.provider.disconnected();

    this._emit("accountsChanged", []);
    this._emit("disconnect", disconnectError);
    this._emit("close", disconnectError);
  };

  accountsChanged = (accounts?: { address: string }) => {
    if (accounts?.address === this.provider._selectedAddress) {
      return;
    }

    this.provider._selectedAddress = accounts?.address ?? null;
    this.provider._state.accounts = accounts?.address
      ? [accounts.address]
      : null;
    this._emit("accountsChanged", accounts);
  };

  networkChanged = ({ network }: { network: string }) => {
    if (network !== this.provider._network) {
      this.provider._network = network;
      this._emit("networkChanged", network);
    }
  };
}

export default PushEventHandlers;
