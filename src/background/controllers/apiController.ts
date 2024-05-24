import type { ApiUTXO, ITransaction } from "@/shared/interfaces/api";
import { ApiOrdUTXO, Inscription } from "@/shared/interfaces/inscriptions";
import { IToken } from "@/shared/interfaces/token";
import { fetchBELLMainnet } from "@/shared/utils";

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
  getBELPrice(): Promise<{ bellscoin?: { usd: number } }>;
  getLastBlockBEL(): Promise<number>;
  getFees(): Promise<{ fast: number; slow: number }>;
  getInscriptions(address: string): Promise<Inscription[] | undefined>;
  getDiscovery(): Promise<Inscription[] | undefined>;
  getInscriptionCounter(
    address: string
  ): Promise<{ amount: number; count: number }>;
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

class ApiController implements IApiController {
  async getAccountBalance(address: string) {
    const data = await fetchBELLMainnet<
      { amount: number; count: number; balance: number } | undefined
    >({
      path: `/address/${address}/stats`,
    });

    return data.balance;
  }

  async getUtxos(address: string, params?: UtxoQueryParams) {
    console.log(params);
    const data = await fetchBELLMainnet<ApiUTXO[]>({
      path: `/address/${address}/utxo`,
      params: params as Record<string, string>,
    });
    return data;
  }

  async getOrdUtxos(address: string) {
    const data = await fetchBELLMainnet<ApiOrdUTXO[]>({
      path: `/address/${address}/ords`,
    });
    return data;
  }

  async getFees() {
    const data = await fetchBELLMainnet({
      path: "/fee-estimates",
    });
    return {
      slow: Number((data["6"] as number)?.toFixed(0)),
      fast: Number((data["2"] as number)?.toFixed(0)) + 1,
    };
  }

  async pushTx(rawTx: string) {
    const data = await fetchBELLMainnet<string>({
      path: "/tx",
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      json: false,
      body: rawTx,
    });
    return {
      txid: data,
    };
  }

  async getTransactions(address: string): Promise<ITransaction[] | undefined> {
    return await fetchBELLMainnet<ITransaction[]>({
      path: `/address/${address}/txs`,
      // path: `/address/TSofqS7nm8Vnk1fk8jU7YgqQcGuWA7wtnK/txs`,
    });
  }

  async getInscriptions(address: string): Promise<Inscription[] | undefined> {
    return await fetchBELLMainnet<Inscription[]>({
      path: `/address/${address}/ords`,
    });
  }

  async getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined> {
    try {
      return await fetchBELLMainnet<ITransaction[]>({
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
      return await fetchBELLMainnet<Inscription[]>({
        path: `/address/${address}/ords/chain/${location}`,
      });
    } catch (e) {
      return undefined;
    }
  }

  async getLastBlockBEL(): Promise<number> {
    return Number(
      await fetchBELLMainnet<string>({
        path: "/blocks/tip/height",
      })
    );
  }

  async getBELPrice(): Promise<{ bellscoin?: { usd: number } }> {
    return {
      bellscoin: {
        usd: (
          await fetchBELLMainnet<{ price_usd: number }>({
            path: "/last-price",
          })
        ).price_usd,
      },
    };
  }

  async getDiscovery(): Promise<Inscription[] | undefined> {
    return await fetchBELLMainnet<Inscription[]>({ path: "/discovery" });
  }

  async getInscriptionCounter(
    address: string
  ): Promise<{ amount: number; count: number }> {
    try {
      const result = await fetchBELLMainnet<
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
    return await fetchBELLMainnet<Inscription[]>({
      path: `/address/${address}/ords?search=${
        inscriptionId ?? inscriptionNumber
      }`,
    });
  }

  async getTokens(address: string): Promise<IToken[] | undefined> {
    return await fetchBELLMainnet<IToken[]>({
      path: `/address/${address}/tokens`,
    });
  }

  async getTransactionHex(txid: string): Promise<string> {
    return await fetchBELLMainnet<string>({
      path: "/tx/" + txid + "/hex",
      json: false,
    });
  }

  async getUtxoValues(outpoints: string[]): Promise<number[] | undefined> {
    const result = await fetchBELLMainnet<{ values: number[] }>({
      path: "/prev",
      body: JSON.stringify({ locations: outpoints }),
      method: "POST",
    });
    return result.values;
  }
}

export default new ApiController();
