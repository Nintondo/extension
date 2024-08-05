import type { ITransaction } from "@/shared/interfaces/api";
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  FC,
} from "react";
import { useControllersState } from "../states/controllerState";
import { useUpdateCurrentAccountBalance } from "../hooks/wallet";
import { useDebounceCall } from "../hooks/debounce";
import { useGetCurrentAccount } from "../states/walletState";
import { ss, useUpdateFunction } from ".";

const useTransactionManager = (): TransactionManagerContextType | undefined => {
  const currentAccount = useGetCurrentAccount();
  const [lastBlock, setLastBlock] = useState<number>(0);
  const { apiController } = useControllersState(ss(["apiController"]));
  const [feeRates, setFeeRates] = useState<{
    fast: number;
    slow: number;
  }>();

  const [transactions, setTransactions] = useState<ITransaction[] | undefined>(
    undefined
  );

  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const updateAccountBalance = useUpdateCurrentAccountBalance();

  const [transactionTxIds, setTransactionTxIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const updateTransactions = useUpdateFunction(
    setTransactions,
    apiController.getTransactions,
    transactions,
    "txid"
  );

  const updateLastBlock = useCallback(async () => {
    const data = await apiController.getLastBlockBEL();
    if (data) setLastBlock(data);
  }, [apiController]);

  const updateFeeRates = useCallback(async () => {
    setFeeRates(await apiController.getFees());
  }, [apiController]);

  const updateAll = useCallback(
    async (force = false) => {
      if (!currentAccount?.address) return;
      setLoading(true);
      if (force) {
        setTransactions(undefined);
        setTransactionTxIds([]);
      }
      await Promise.all([
        updateAccountBalance(),
        updateTransactions(currentAccount.address, force),
        updateFeeRates(),
      ]);
      setLoading(false);
    },
    [
      updateAccountBalance,
      updateTransactions,
      updateFeeRates,
      currentAccount?.address,
    ]
  );

  const trottledUpdate = useDebounceCall(updateAll, 300);

  const loadMoreTransactions = useCallback(async () => {
    if (!currentAccount || !currentAccount.address || !transactions) return;
    if (
      transactions.length < 50 ||
      transactionTxIds.includes(transactions[transactions.length - 1]?.txid)
    )
      return;
    const additionalTransactions = await apiController.getPaginatedTransactions(
      currentAccount.address,
      transactions[transactions.length - 1]?.txid
    );
    setTransactionTxIds([
      ...transactionTxIds,
      transactions[transactions.length - 1]?.txid,
    ]);
    if (!additionalTransactions) return;
    if (additionalTransactions.length > 0) {
      setTransactions((prev) => [...(prev ?? []), ...additionalTransactions]);
    }
  }, [transactions, apiController, transactionTxIds, currentAccount]);

  useEffect(() => {
    if (!currentAccount?.address) return;
    if (currentPrice) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const [data] = await Promise.all([
        apiController.getBELPrice(),
        updateLastBlock(),
      ]);
      if (data?.bellscoin) {
        setCurrentPrice(data.bellscoin.usd);
      }
    })();
  }, [updateLastBlock, apiController, currentAccount?.address, currentPrice]);

  useEffect(() => {
    if (!currentAccount?.address) return;
    const interval1 = setInterval(async () => {
      await updateAccountBalance();
    }, 2000);
    const interval2 = setInterval(async () => {
      await Promise.all([
        updateTransactions(currentAccount.address!),
        updateLastBlock(),
        updateFeeRates(),
      ]);
    }, 10000);
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?.address]);

  if (!currentAccount) return undefined;

  return {
    lastBlock,
    transactions,
    currentPrice,
    loadMoreTransactions,
    trottledUpdate,
    feeRates,
    loading,
    clearTransactions: () => {
      setTransactions(undefined);
    },
  };
};

interface TransactionManagerContextType {
  lastBlock: number;
  transactions: ITransaction[] | undefined;
  currentPrice: number | undefined;
  loadMoreTransactions: () => Promise<void>;
  trottledUpdate: (force?: boolean) => void;
  loading: boolean;
  feeRates?: {
    fast: number;
    slow: number;
  };
  clearTransactions: () => void;
}

const TransactionManagerContext = createContext<
  TransactionManagerContextType | undefined
>(undefined);

export const TransactionManagerProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const transactionManager = useTransactionManager();

  return (
    <TransactionManagerContext.Provider value={transactionManager}>
      {children}
    </TransactionManagerContext.Provider>
  );
};

export const useTransactionManagerContext =
  (): TransactionManagerContextType => {
    const context = useContext(TransactionManagerContext);
    if (!context) {
      return {
        transactions: undefined,
        currentPrice: undefined,
        trottledUpdate: () => {},
        loading: false,
        feeRates: {
          slow: 0,
          fast: 0,
        },
        clearTransactions: () => {},
        lastBlock: 0,
        loadMoreTransactions: async () => {},
      };
    }
    return context;
  };
