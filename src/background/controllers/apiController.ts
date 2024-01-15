import type {
  AccountBalanceResponse,
  ApiUTXO,
  ITransaction,
} from "@/shared/interfaces/api";
import { ApiOrdUTXO, Inscription } from "@/shared/interfaces/inscriptions";
import { fetchBELLMainnet } from "@/shared/utils";

export interface IApiController {
  getAccountBalance(address: string): Promise<number | undefined>;
  getUtxos(address: string): Promise<ApiUTXO[] | undefined>;
  getOrdUtxos(address: string): Promise<ApiOrdUTXO[] | undefined>;
  pushTx(rawTx: string): Promise<{ txid: string } | undefined>;
  getTransactions(address: string): Promise<ITransaction[] | undefined>;
  getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined>;
  getBELPrice(): Promise<{ bellscoin?: { usd: number } }>;
  getLastBlockBEL(): Promise<number>;
  getFees(): Promise<{ fast: number; slow: number }>;
  getInscriptions(address: string): Promise<Inscription[] | undefined>;
}

class ApiController implements IApiController {
  async getAccountBalance(address: string) {
    const data = await fetchBELLMainnet<AccountBalanceResponse>({
      path: `/address/${address}`,
    });

    if (!data) return undefined;

    return (
      data.chain_stats.funded_txo_sum -
      data.chain_stats.spent_txo_sum +
      data.mempool_stats.funded_txo_sum -
      data.mempool_stats.spent_txo_sum
    );
  }

  async getUtxos(address: string) {
    const data = await fetchBELLMainnet<ApiUTXO[]>({
      path: `/address/${address}/utxo`,
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
      slow: Number((data["6"] as number).toFixed(0)),
      fast: Number((data["2"] as number).toFixed(0)) + 1,
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
    return (
      await fetchBELLMainnet<Inscription[]>({
        path: `/address/${address}/ords`,
      })
    ).map((f) => ({
      ...f,
      preview: `https://bellinals.nintondo.io/preview/${f.inscription_id}`,
      content: `https://bellinals.nintondo.io/content/${f.inscription_id}`,
      offset: 0,
    }));
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

  async getLastBlockBEL(): Promise<number> {
    return Number(
      await fetchBELLMainnet<string>({
        path: "/blocks/tip/height",
      })
    );
  }

  async getBELPrice() {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bellscoin&vs_currencies=usd"
    );
    return (await res.json()) as { bellscoin?: { usd: number } };
  }
}

export default new ApiController();
