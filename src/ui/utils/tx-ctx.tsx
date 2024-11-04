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
import { useGetCurrentAccount } from "../states/walletState";
import { ss, useUpdateFunction } from ".";

const isProxy = (obj: any) => {
  return "__isProxy" in obj;
};

const useTransactionManager = (): TransactionManagerContextType | undefined => {
  const currentAccount = useGetCurrentAccount();
  const [lastBlock, setLastBlock] = useState<number>();
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

  const updateTransactions = useUpdateFunction(
    setTransactions,
    apiController.getTransactions,
    "txid"
  );

  const updateLastBlock = useCallback(async () => {
    const data = await apiController.getLastBlockBEL();
    if (data) setLastBlock(data);
  }, [apiController]);

  const updateFeeRates = useCallback(async () => {
    setFeeRates(await apiController.getFees());
  }, [apiController]);

  const loadMoreTransactions = useCallback(async () => {
    if (!currentAccount || !currentAccount.address || !transactions) return;
    if (transactions.length < 50) return;
    const additionalTransactions = await apiController.getPaginatedTransactions(
      currentAccount.address,
      transactions[transactions.length - 1]?.txid
    );
    if (!additionalTransactions) return;
    if (additionalTransactions.length > 0) {
      setTransactions((prev) => [...(prev ?? []), ...additionalTransactions]);
    }
  }, [transactions, apiController, currentAccount]);

  useEffect(() => {
    if (currentAccount?.address) {
      setTransactions(undefined);
      updateAccountBalance();
      updateTransactions(currentAccount.address, true);
    }
  }, [currentAccount?.address]);

  useEffect(() => {
    if (currentPrice || !isProxy(apiController)) return;

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
  }, [updateLastBlock, apiController.getBELPrice, currentPrice]);

  useEffect(() => {
    if (!currentAccount?.address) return;
    const interval1 = setInterval(async () => {
      await updateAccountBalance();
    }, 3000);
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

  useEffect(() => {
    if (!isProxy(apiController)) return;

    updateFeeRates();
  }, [updateFeeRates, apiController]);

  if (!currentAccount) return undefined;

  return {
    lastBlock,
    transactions,
    currentPrice,
    loadMoreTransactions,
    feeRates,
    updateTransactions,
  };
};

interface TransactionManagerContextType {
  lastBlock?: number;
  transactions: ITransaction[] | undefined;
  currentPrice: number | undefined;
  loadMoreTransactions: () => Promise<void>;
  feeRates?: {
    fast: number;
    slow: number;
  };
  updateTransactions: (address: string, reset?: boolean) => Promise<void>;
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
        feeRates: {
          slow: 0,
          fast: 0,
        },
        lastBlock: 0,
        loadMoreTransactions: async () => {},
        updateTransactions: async () => {},
      };
    }
    return context;
  };
