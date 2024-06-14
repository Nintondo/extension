import type { ApiUTXO, ITransaction } from "@/shared/interfaces/api";
import { ApiOrdUTXO, Inscription } from "@/shared/interfaces/inscriptions";
import { IToken } from "@/shared/interfaces/token";
import { fetchBELLMainnet, fetchProps } from "@/shared/utils";
import { storageService } from "../services";
import { networks } from "belcoinjs-lib";

export interface UtxoQueryParams {
  hex?: boolean;
  amount?: number;
}

export interface IApiController {
  getAccountBalance(address: string): Promise<number | undefined>;
  getUtxos(
    address: string,
    params?: UtxoQueryParams
  ): Promise<ApiUTXO[] | undefined>;
  getOrdUtxos(address: string): Promise<ApiOrdUTXO[] | undefined>;
  pushTx(rawTx: string): Promise<{ txid: string } | undefined>;
  getTransactions(address: string): Promise<ITransaction[] | undefined>;
  getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined>;
  getPaginatedInscriptions(
    address: string,
    location: string
  ): Promise<Inscription[] | undefined>;
  getBELPrice(): Promise<{ bellscoin?: { usd: number } } | undefined>;
  getLastBlockBEL(): Promise<number | undefined>;
  getFees(): Promise<{ fast: number; slow: number } | undefined>;
  getInscriptions(address: string): Promise<Inscription[] | undefined>;
  getDiscovery(): Promise<Inscription[] | undefined>;
  getInscriptionCounter(
    address: string
  ): Promise<{ amount: number; count: number } | undefined>;
  getInscription({
    inscriptionNumber,
    inscriptionId,
    address,
  }: {
    inscriptionNumber?: number;
    inscriptionId?: string;
    address: string;
  }): Promise<Inscription[] | undefined>;
  getTokens(address: string): Promise<IToken[] | undefined>;
  getTransactionHex(txid: string): Promise<string | undefined>;
  getUtxoValues(outpoints: string[]): Promise<number[] | undefined>;
}

type FetchType = <T>(
  props: Omit<fetchProps, "testnet">
) => Promise<T | undefined>;

class ApiController implements IApiController {
  private fetch: FetchType = async (p: Omit<fetchProps, "testnet">) => {
    try {
      return await fetchBELLMainnet({
        ...p,
        testnet:
          storageService.appState.network.pubKeyHash ===
            networks.testnet.pubKeyHash &&
          storageService.appState.network.scriptHash ===
            networks.testnet.scriptHash,
      });
    } catch {
      return;
    }
  };

  async getAccountBalance(address: string) {
    const data = await this.fetch<
      { amount: number; count: number; balance: number } | undefined
    >({
      path: `/address/${address}/stats`,
    });

    return data?.balance;
  }

  async getUtxos(address: string, params?: UtxoQueryParams) {
    const data = await this.fetch<ApiUTXO[]>({
      path: `/address/${address}/utxo`,
      params: params as Record<string, string>,
    });
    return data;
  }

  async getOrdUtxos(address: string) {
    const data = await this.fetch<ApiOrdUTXO[]>({
      path: `/address/${address}/ords`,
    });
    return data;
  }

  async getFees() {
    const data = await this.fetch<Record<string, number>>({
      path: "/fee-estimates",
    });
    if (data) {
      return {
        slow: "6" in data ? Number(data["6"].toFixed(0)) : 0,
        fast: "2" in data ? Number(data["2"].toFixed(0)) + 1 : 0,
      };
    }
  }

  async pushTx(rawTx: string) {
    const data = await this.fetch<string>({
      path: "/tx",
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      json: false,
      body: rawTx,
    });
    if (data) {
      return {
        txid: data,
      };
    }
  }

  async getTransactions(address: string): Promise<ITransaction[] | undefined> {
    return await this.fetch<ITransaction[]>({
      path: `/address/${address}/txs`,
      // path: `/address/TSofqS7nm8Vnk1fk8jU7YgqQcGuWA7wtnK/txs`,
    });
  }

  async getInscriptions(address: string): Promise<Inscription[] | undefined> {
    return await this.fetch<Inscription[]>({
      path: `/address/${address}/ords`,
    });
  }

  async getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined> {
    try {
      return await this.fetch<ITransaction[]>({
        path: `/address/${address}/txs/chain/${txid}`,
      });
    } catch (e) {
      return undefined;
    }
  }

  async getPaginatedInscriptions(
    address: string,
    location: string
  ): Promise<Inscription[] | undefined> {
    try {
      return await this.fetch<Inscription[]>({
        path: `/address/${address}/ords/chain/${location}`,
      });
    } catch (e) {
      return undefined;
    }
  }

  async getLastBlockBEL() {
    const data = await this.fetch<string>({
      path: "/blocks/tip/height",
    });
    if (data) {
      return Number(data);
    }
  }

  async getBELPrice() {
    const data = await this.fetch<{ price_usd: number }>({
      path: "/last-price",
    });
    if (!data) {
      return undefined;
    }
    return {
      bellscoin: {
        usd: data.price_usd,
      },
    };
  }

  async getDiscovery(): Promise<Inscription[] | undefined> {
    return await this.fetch<Inscription[]>({ path: "/discovery" });
  }

  async getInscriptionCounter(
    address: string
  ): Promise<{ amount: number; count: number } | undefined> {
    try {
      const result = await this.fetch<
        { amount: number; count: number } | undefined
      >({
        path: `/address/${address}/stats`,
      });
      return result;
    } catch {
      return { amount: 0, count: 0 };
    }
  }

  async getInscription({
    inscriptionNumber,
    inscriptionId,
    address,
  }: {
    inscriptionNumber?: number;
    inscriptionId?: string;
    address: string;
  }): Promise<Inscription[] | undefined> {
    return await this.fetch<Inscription[]>({
      path: `/address/${address}/ords?search=${
        inscriptionId ?? inscriptionNumber
      }`,
    });
  }

  async getTokens(address: string): Promise<IToken[] | undefined> {
    return await this.fetch<IToken[]>({
      path: `/address/${address}/tokens`,
    });
  }

  async getTransactionHex(txid: string) {
    return await this.fetch<string>({
      path: "/tx/" + txid + "/hex",
      json: false,
    });
  }

  async getUtxoValues(outpoints: string[]) {
    const result = await this.fetch<{ values: number[] }>({
      path: "/prev",
      body: JSON.stringify({ locations: outpoints }),
      method: "POST",
    });
    return result?.values;
  }
}

export default new ApiController();
