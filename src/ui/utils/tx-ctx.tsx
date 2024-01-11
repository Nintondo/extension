/* eslint-disable react-hooks/rules-of-hooks */
import { ITransaction } from "@/shared/interfaces/api";
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  FC,
} from "react";
import { useGetCurrentAccount } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import { useUpdateCurrentAccountBalance } from "../hooks/wallet";
import { useDebounceCall } from "../hooks/debounce";

const useTransactionManager = (): TransactionManagerContextType | undefined => {
  const currentAccount = useGetCurrentAccount();

  const [lastBlock, setLastBlock] = useState<number>(0);
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const [feeRates, setFeeRates] = useState<{
    fast: number;
    slow: number;
  }>();

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const updateAccountBalance = useUpdateCurrentAccountBalance();

  const udpateTransactions = useCallback(
    async (force?: boolean) => {
      const receivedTransactions = await apiController.getTransactions(
        currentAccount?.address ?? ""
      );
      if (receivedTransactions !== undefined) {
        if (
          transactions.length > 0 &&
          transactions[0].txid !== receivedTransactions[0].txid &&
          !force
        ) {
          const oldTxidIndex = receivedTransactions.findIndex(
            (f) => f.txid === transactions[0].txid
          );
          setTransactions([
            ...receivedTransactions.slice(0, oldTxidIndex),
            ...transactions,
          ]);
        } else setTransactions(receivedTransactions);
      }
    },
    [apiController, transactions, currentAccount?.address]
  );

  const updateLastBlock = useCallback(async () => {
    setLastBlock(await apiController.getLastBlockBEL());
  }, [apiController]);

  const updateAll = useCallback(
    async (force = false) => {
      await Promise.all([updateAccountBalance(), udpateTransactions(force)]);
    },
    [updateAccountBalance, udpateTransactions]
  );

  const trottledUpdate = useDebounceCall(updateAll, 300);

  const loadMore = useCallback(async () => {
    if (
      !transactions.length ||
      transactions
        .map((i) => i.txid)
        .includes(transactions[transactions.length - 1].txid) ||
      transactions.length > 50
    )
      return;
    const additionalTransactions = await apiController.getPaginatedTransactions(
      currentAccount?.address,
      transactions[transactions.length - 1].txid ?? ""
    );
    if (!additionalTransactions) return;
    if (additionalTransactions.length > 0) {
      setTransactions((prev) => [...prev, ...additionalTransactions]);
    }
  }, [transactions, apiController, currentAccount?.address]);

  const updateFeeRates = useCallback(async () => {
    setFeeRates(await apiController.getFees());
  }, [apiController]);

  useEffect(() => {
    if (!currentAccount?.address) return;
    if (currentPrice) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const data = await apiController.getBELPrice();
      if (data.bellscoin) {
        setCurrentPrice(data.bellscoin.usd);
      }
      await updateLastBlock();
    })();
  }, [updateLastBlock, apiController, currentAccount?.address, currentPrice]);

  useEffect(() => {
    if (!currentAccount?.address) return;
    const interval = setInterval(async () => {
      await Promise.all([
        updateAccountBalance(),
        udpateTransactions(),
        updateLastBlock(),
        updateFeeRates(),
      ]);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [
    updateAccountBalance,
    udpateTransactions,
    updateLastBlock,
    updateFeeRates,
    currentAccount?.address,
  ]);

  if (!currentAccount) return undefined;

  return {
    lastBlock,
    transactions,
    currentPrice,
    loadMore,
    trottledUpdate,
    feeRates,
  };
};

interface TransactionManagerContextType {
  lastBlock: number;
  transactions: ITransaction[];
  currentPrice: number | undefined;
  loadMore: () => Promise<void>;
  trottledUpdate: (force?: boolean) => void;
  feeRates?: {
    fast: number;
    slow: number;
  };
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

export const useTransactionManagerContext = () => {
  const context = useContext(TransactionManagerContext);
  if (!context) {
    throw new Error(
      "useTransactionManagerContext must be used within a TransactionManagerProvider"
    );
  }
  return context;
};
