import type {
  ApiUTXO,
  IAccountStats,
  ITransaction,
} from "@/shared/interfaces/api";
import {
  ApiOrdUTXO,
  ContentDetailedInscription,
  ContentInscriptionResopnse,
  Inscription,
} from "@/shared/interfaces/inscriptions";
import { IToken } from "@/shared/interfaces/token";
import { customFetch, fetchProps } from "@/shared/utils";
import { storageService } from "../services";
import { networks } from "belcoinjs-lib";
import { DEFAULT_FEES } from "@/shared/constant";

export interface UtxoQueryParams {
  hex?: boolean;
  amount?: number;
}

export interface IApiController {
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
  getAccountStats(address: string): Promise<IAccountStats | undefined>;
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
  getContentPaginatedInscriptions(
    address: string,
    page: number
  ): Promise<ContentInscriptionResopnse | undefined>;
  searchContentInscriptionByInscriptionId(
    inscriptionId: string
  ): Promise<ContentDetailedInscription | undefined>;
  searchContentInscriptionByInscriptionNumber(
    address: string,
    number: number
  ): Promise<ContentInscriptionResopnse | undefined>;
  getLocationByInscriptionId(
    inscriptionId: string
  ): Promise<{ location: string; owner: string } | undefined>;
}

type FetchType = <T>(
  props: Omit<fetchProps, "testnet">
) => Promise<T | undefined>;

class ApiController implements IApiController {
  private fetch: FetchType = async (p: Omit<fetchProps, "testnet">) => {
    try {
      return await customFetch({
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

  async getUtxos(address: string, params?: UtxoQueryParams) {
    const data = await this.fetch<ApiUTXO[]>({
      path: `/address/${address}/utxo`,
      params: params as Record<string, string>,
      service: "electrs",
    });
    return data;
  }

  async getOrdUtxos(address: string) {
    const data = await this.fetch<ApiOrdUTXO[]>({
      path: `/address/${address}/ords`,
      service: "electrs",
    });
    return data;
  }

  async getFees() {
    const data = await this.fetch<Record<string, number>>({
      path: "/fee-estimates",
      service: "electrs",
    });
    if (data) {
      return {
        slow: "6" in data ? Number(data["6"].toFixed(0)) : DEFAULT_FEES.slow,
        fast:
          "2" in data ? Number(data["2"].toFixed(0)) + 1 : DEFAULT_FEES.fast,
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
      service: "electrs",
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
      service: "electrs",
    });
  }

  async getInscriptions(address: string): Promise<Inscription[] | undefined> {
    return await this.fetch<Inscription[]>({
      path: `/address/${address}/ords`,
      service: "electrs",
    });
  }

  async getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined> {
    try {
      return await this.fetch<ITransaction[]>({
        path: `/address/${address}/txs/chain/${txid}`,
        service: "electrs",
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
        service: "electrs",
      });
    } catch (e) {
      return undefined;
    }
  }

  async getLastBlockBEL() {
    const data = await this.fetch<string>({
      path: "/blocks/tip/height",
      service: "electrs",
    });
    if (data) {
      return Number(data);
    }
  }

  async getBELPrice() {
    const data = await this.fetch<{ price_usd: number }>({
      path: "/last-price",
      service: "electrs",
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

  async getAccountStats(address: string): Promise<IAccountStats | undefined> {
    try {
      return await this.fetch({
        path: `/address/${address}/stats`,
        service: "electrs",
      });
    } catch {
      return { amount: 0, count: 0, balance: 0 };
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
      service: "electrs",
    });
  }

  async getTokens(address: string): Promise<IToken[] | undefined> {
    return await this.fetch<IToken[]>({
      path: `/address/${address}/tokens`,
      service: "electrs",
    });
  }

  async getTransactionHex(txid: string) {
    return await this.fetch<string>({
      path: "/tx/" + txid + "/hex",
      json: false,
      service: "electrs",
    });
  }

  async getUtxoValues(outpoints: string[]) {
    const result = await this.fetch<{ values: number[] }>({
      path: "/prev",
      body: JSON.stringify({ locations: outpoints }),
      method: "POST",
      service: "electrs",
    });
    return result?.values;
  }

  async getContentPaginatedInscriptions(address: string, page: number) {
    return await this.fetch<ContentInscriptionResopnse>({
      path: `/search?account=${address}&page_size=6&page=${page}`,
      service: "content",
    });
  }

  async searchContentInscriptionByInscriptionId(inscriptionId: string) {
    return await this.fetch<ContentDetailedInscription>({
      path: `/${inscriptionId}/info`,
      service: "content",
    });
  }

  async searchContentInscriptionByInscriptionNumber(
    address: string,
    number: number
  ) {
    return await this.fetch<ContentInscriptionResopnse>({
      path: `/search?account=${address}&page_size=6&page=1&from=${number}&to=${number}`,
      service: "content",
    });
  }

  async getLocationByInscriptionId(inscriptionId: string) {
    return await this.fetch<{ location: string; owner: string }>({
      path: `/${inscriptionId}/owner`,
      service: "history",
    });
  }
}

export default new ApiController();
