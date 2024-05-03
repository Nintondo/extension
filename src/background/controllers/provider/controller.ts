import { Psbt } from "belcoinjs-lib";
import { keyringService, storageService } from "../../services";
import "reflect-metadata/lite";
import type { AccountBalanceResponse, ApiUTXO } from "@/shared/interfaces/api";
import { fetchBELLMainnet } from "@/shared/utils";
import permission from "@/background/services/permission";
import type { SendBEL } from "@/background/services/keyring/types";
import { SignPsbtOptions } from "@/shared/interfaces/provider";

class ProviderController {
  connect = async () => {
    if (storageService.currentWallet === undefined) return undefined;
    const _account = storageService.currentAccount.address;
    const account = _account ? _account : "";
    // sessionService.broadcastEvent("accountsChanged", account);
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
    return "NINTONDO";
  };

  @Reflect.metadata("SAFE", true)
  getBalance = async ({ session: { origin } }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const account = storageService.currentAccount;
    if (!account) return null;
    const data = await fetchBELLMainnet<AccountBalanceResponse>({
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
  calculateFee = async ({
    session: { origin },
    data: {
      params: { hex, feeRate },
    },
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
  getPublicKey = async ({ session: { origin } }) => {
    if (!permission.siteIsConnected(origin)) return undefined;
    const _account = storageService.currentAccount;
    if (!_account) return undefined;
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
  createTx = async (data: any) => {
    const account = storageService.currentAccount;
    if (!account) return;
    const utxos = await fetchBELLMainnet<ApiUTXO[]>({
      path: `/address/${account.address}/utxo`,
    });
    const transactionData = { ...data.data.params, utxos } as SendBEL;
    transactionData.amount = transactionData.amount * 10 ** 8;
    const tx = await keyringService.sendBEL(transactionData);
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
  inscribeTransfer = async (data: { approvalRes }) => {
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
}

export default new ProviderController();
