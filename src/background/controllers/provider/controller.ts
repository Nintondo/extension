import { Network, Psbt } from "belcoinjs-lib";
import { keyringService, sessionService, storageService } from "../../services";
import "reflect-metadata/lite";
import permission from "@/background/services/permission";
import type { SendBEL } from "@/background/services/keyring/types";
import { SignPsbtOptions } from "@/shared/interfaces/provider";
import apiController from "../apiController";
import { IAccount } from "@/shared/interfaces";

class ProviderController {
  connect = async () => {
    if (
      storageService.currentWallet === undefined ||
      !storageService.currentAccount
    )
      return undefined;
    const account = storageService.currentAccount.address;
    return account ?? "";
  };

  @Reflect.metadata("SAFE", true)
  getVersion = async () => {
    return process.env.VERSION ?? "0.0.1";
  };

  @Reflect.metadata("SAFE", true)
  getNetwork = async () => {
    return storageService.appState.network;
  };

  @Reflect.metadata("SAFE", true)
  getBalance = async ({
    session: { origin },
  }: {
    session: { origin: string };
  }) => {
    if (!permission.siteIsConnected(origin)) return;
    if (!storageService.currentAccount?.address) return;
    if (storageService.currentAccount.balance !== undefined)
      return storageService.currentAccount.balance;
    return (
      await apiController.getAccountStats(storageService.currentAccount.address)
    )?.balance;
  };

  @Reflect.metadata("SAFE", true)
  getAccountName = async ({
    session: { origin },
  }: {
    session: { origin: string };
  }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const account = storageService.currentAccount;
    if (!account) return null;
    return account.name;
  };

  @Reflect.metadata("SAFE", true)
  isConnected = async ({
    session: { origin },
  }: {
    session: { origin: string };
  }) => {
    return permission.siteIsConnected(origin);
  };

  @Reflect.metadata("SAFE", true)
  getAccount = async ({
    session: { origin },
  }: {
    session: { origin: string };
  }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    if (storageService.currentAccount?.address === undefined) return undefined;
    return storageService.currentAccount.address;
  };

  @Reflect.metadata("SAFE", true)
  calculateFee = async ({
    session: { origin },
    data: {
      params: { hex, feeRate },
    },
  }: {
    session: { origin: string };
    data: {
      params: { hex: string; feeRate: number };
    };
  }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const psbt = Psbt.fromHex(hex);
    (psbt as any).__CACHE.__UNSAFE_SIGN_NONSEGWIT = true;

    keyringService.signPsbt(psbt);
    let txSize = psbt.extractTransaction(true).toBuffer().length;
    psbt.data.inputs.forEach((v) => {
      if (v.finalScriptWitness) {
        txSize -= v.finalScriptWitness.length * 0.75;
      }
    });
    const fee = Math.ceil(txSize * feeRate);
    return fee;
  };

  @Reflect.metadata("SAFE", true)
  getPublicKey = async ({
    session: { origin },
  }: {
    session: { origin: string };
  }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const _account = storageService.currentAccount;
    if (!_account || !_account.address) return undefined;
    return keyringService.exportPublicKey(_account.address);
  };

  @Reflect.metadata("APPROVAL", [
    "SignText",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_req: any) => {},
  ])
  signMessage = async ({
    data: {
      params: { text },
    },
  }: {
    data: {
      params: { text: string };
    };
  }) => {
    const account = storageService.currentAccount;
    if (!account || !account.address) return;
    const message = keyringService.signMessage({
      from: account.address,
      data: text,
    });
    return message;
  };

  @Reflect.metadata("APPROVAL", [
    "CreateTx",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_req: any) => {},
  ])
  createTx = async ({ data: { params } }: { data: { params: SendBEL } }) => {
    const account = storageService.currentAccount;
    if (!account) return;
    const tx = await keyringService.sendBEL(params);
    const psbt = Psbt.fromHex(tx);
    return psbt.extractTransaction().toHex();
  };

  @Reflect.metadata("APPROVAL", [
    "signPsbt",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_req: any) => {},
  ])
  signPsbt = async (data: {
    data: {
      params: {
        psbtBase64: string;
        options?: SignPsbtOptions;
      };
    };
  }) => {
    const psbt = Psbt.fromBase64(data.data.params.psbtBase64);
    await keyringService.signPsbtWithoutFinalizing(
      psbt,
      data.data.params.options?.toSignInputs
    );
    return psbt.toBase64();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Reflect.metadata("APPROVAL", ["inscribeTransfer", (_req: any) => {}])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inscribeTransfer = async (data: {
    approvalRes: { mintedAmount: number };
  }) => {
    return { mintedAmount: data.approvalRes?.mintedAmount };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Reflect.metadata("APPROVAL", ["multiPsbtSign", (_req: any) => {}])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  multiPsbtSign = async (data: {
    data: {
      params: { data: { psbtBase64: string; options?: SignPsbtOptions }[] };
    };
  }) => {
    return await Promise.all(
      data.data.params.data.map(async (f) => {
        const psbt = Psbt.fromBase64(f.psbtBase64);
        await keyringService.signPsbtWithoutFinalizing(
          psbt,
          f.options?.toSignInputs
        );
        return psbt.toBase64();
      })
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Reflect.metadata("APPROVAL", ["switchNetwork", (_req: any) => {}])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  switchNetwork = async (data: {
    data: {
      params: { data: Network };
    };
  }) => {
    if (!storageService.currentWallet || !storageService.currentAccount) {
      return;
    }
    const network = data.data.params.data;
    keyringService.switchNetwork(network);
    await storageService.updateAppState({ network });
    const wallets = storageService.walletState.wallets;
    const wallet = keyringService.getKeyringByIndex(
      storageService.currentWallet.id
    );
    const addresses = wallet.getAccounts();
    const accounts = storageService.currentWallet.accounts;
    const switchedAccounts = addresses.map(
      (i, idx): IAccount => ({
        id: idx,
        address: i,
        name: accounts[idx] ? accounts[idx].name : `Account ${idx + 1}`,
      })
    );
    wallets[storageService.currentWallet.id].accounts = switchedAccounts;
    await storageService.updateWalletState({ wallets });
    sessionService.broadcastEvent("networkChanged", {
      network,
      account: storageService.currentAccount,
    });
    return network;
  };
}

export default new ProviderController();
