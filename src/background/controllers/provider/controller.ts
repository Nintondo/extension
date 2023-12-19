import { Psbt } from "belcoinjs-lib";
import { keyringService, sessionService, storageService } from "../../services";
import "reflect-metadata";
import { AccountBalanceResponse, ApiUTXO } from "@/shared/interfaces/api";
import { fetchTDCMainnet } from "@/shared/utils";
import permission from "@/background/services/permission";
import { SendTDC } from "@/background/services/keyring/types";

class ProviderController {
  connect = async () => {
    if (storageService.currentWallet === undefined) return undefined;
    const _account = await storageService.currentWallet.accounts[0];
    const account = _account ? _account.address : "";
    sessionService.broadcastEvent("accountsChanged", account);
    return account;
  };

  @Reflect.metadata("SAFE", true)
  getAccounts = async () => {
    if (storageService.currentWallet === undefined) return undefined;
    const _account = storageService.currentWallet.accounts[0];
    const account = _account ? _account.address : "";
    return account;
  };

  @Reflect.metadata("SAFE", true)
  getNetwork = async () => {
    return "BELLS";
  };

  @Reflect.metadata("SAFE", true)
  getBalance = async ({ session: { origin } }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const account = storageService.currentAccount;
    if (!account) return null;
    const data = await fetchTDCMainnet<AccountBalanceResponse>({
      path: `/address/${account.address}`,
    });

    if (!data) return undefined;

    return (
      (data.chain_stats.funded_txo_sum -
        data.chain_stats.spent_txo_sum +
        data.mempool_stats.funded_txo_sum -
        data.mempool_stats.spent_txo_sum) /
      10 ** 8
    );
  };

  @Reflect.metadata("SAFE", true)
  getAccountName = async ({ session: { origin } }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const account = storageService.currentAccount;
    if (!account) return null;
    return account.name;
  };

  @Reflect.metadata("SAFE", true)
  isConnected = async ({ session: { origin } }) => {
    return permission.siteIsConnected(origin);
  };

  @Reflect.metadata("SAFE", true)
  getAccount = async ({ session: { origin } }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    if (storageService.currentWallet === undefined) return undefined;
    const _account = storageService.currentWallet.accounts[0];
    const account = _account ? _account.address : "";
    return account;
  };

  @Reflect.metadata("SAFE", true)
  getPublicKey = async ({ session: { origin } }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const _account = storageService.currentWallet.accounts[0];
    if (!_account) return undefined;
    return keyringService.exportPublicKey(_account.address);
  };

  @Reflect.metadata("APPROVAL", [
    "SignText",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (req: any) => {
      // console.log(req);
    },
  ])
  signMessage = async ({
    data: {
      params: { text },
    },
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
    (req: any) => {
      // console.log(req);
    },
  ])
  createTx = async (data) => {
    const account = storageService.currentAccount;
    if (!account) return;
    const utxos = await fetchTDCMainnet<ApiUTXO[]>({
      path: `/address/${account.address}/utxo`,
    });
    const transactionData = { ...(data as any).data.params, utxos } as SendTDC;
    transactionData.amount = transactionData.amount * 10 ** 8;
    const tx = await keyringService.sendTDC(transactionData);
    const psbt = Psbt.fromHex(tx);
    return psbt.extractTransaction().toHex();
  };

  @Reflect.metadata("APPROVAL", [
    "SignTx",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (req: any) => {
      // console.log(req);
    },
  ])
  signTx = async ({
    data: {
      params: { hex },
    },
  }) => {
    const psbt = Psbt.fromHex(hex);
    keyringService.signTransaction(psbt);
    return psbt.toHex();
  };
}

export default new ProviderController();
