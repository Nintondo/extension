/* eslint-disable react-hooks/rules-of-hooks */
import type { ITransaction } from "@/shared/interfaces/api";
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  FC,
  SetStateAction,
  Dispatch,
} from "react";
import { useGetCurrentAccount } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import { useUpdateCurrentAccountBalance } from "../hooks/wallet";
import { useDebounceCall } from "../hooks/debounce";
import { Inscription } from "@/shared/interfaces/inscriptions";

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
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const updateAccountBalance = useUpdateCurrentAccountBalance();

  const [transactionTxIds, setTransactionTxIds] = useState<string[]>([]);
  const [inscriptionTxIds, setInscriptionTxIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inscriptionCounter, setInscriptionCounter] = useState<
    number | undefined
  >(undefined);

  const updateFn = <T,>(
    onUpdate: Dispatch<SetStateAction<T[]>>,
    retrieveFn: (address: string) => Promise<T[]>,
    currentValue: T[],
    compareKey: keyof T
  ) => {
    return useCallback(
      async (force?: boolean) => {
        if (!currentValue.length) setLoading(true);
        const receivedItems = await retrieveFn(currentAccount?.address ?? "");
        if (receivedItems !== undefined) {
          if (
            currentValue.length > 0 &&
            currentValue[0][compareKey] !== receivedItems[0][compareKey] &&
            !force
          ) {
            const oldIndex = receivedItems.findIndex(
              (f) => f[compareKey] === currentValue[0][compareKey]
            );
            onUpdate([...receivedItems.slice(0, oldIndex), ...currentValue]);
          } else if (currentValue.length < 50) onUpdate(receivedItems ?? []);
        }
        setLoading(false);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [onUpdate, retrieveFn, currentValue, currentAccount?.address]
    );
  };

  const udpateTransactions = updateFn(
    setTransactions,
    apiController.getTransactions,
    transactions,
    "txid"
  );

  const updateInscriptions = updateFn(
    setInscriptions,
    apiController.getInscriptions,
    inscriptions,
    "inscription_id"
  );

  const updateLastBlock = useCallback(async () => {
    setLastBlock(await apiController.getLastBlockBEL());
  }, [apiController]);

  const updateFeeRates = useCallback(async () => {
    setFeeRates(await apiController.getFees());
  }, [apiController]);

  const updateInscriptionCounter = useCallback(async () => {
    if (!currentAccount?.address) return;
    setInscriptionCounter(
      await apiController.getInscriptionCounter(currentAccount?.address)
    );
  }, [apiController, currentAccount?.address]);

  const updateAll = useCallback(
    async (force = false) => {
      await Promise.all([
        updateAccountBalance(),
        udpateTransactions(force),
        updateInscriptions(force),
        updateFeeRates(),
        updateInscriptionCounter(),
      ]);
    },
    [
      updateAccountBalance,
      udpateTransactions,
      updateInscriptions,
      updateFeeRates,
      updateInscriptionCounter,
    ]
  );

  const trottledUpdate = useDebounceCall(updateAll, 300);

  const loadMoreTransactions = useCallback(async () => {
    if (
      transactions.length < 50 ||
      transactionTxIds.includes(transactions[transactions.length - 1]?.txid)
    )
      return;
    const additionalTransactions = await apiController.getPaginatedTransactions(
      currentAccount?.address,
      transactions[transactions.length - 1]?.txid
    );
    setTransactionTxIds([
      ...transactionTxIds,
      transactions[transactions.length - 1]?.txid,
    ]);
    if (!additionalTransactions) return;
    if (additionalTransactions.length > 0) {
      setTransactions((prev) => [...prev, ...additionalTransactions]);
    }
  }, [transactions, apiController, currentAccount?.address, transactionTxIds]);

  const loadMoreInscriptions = useCallback(async () => {
    if (
      inscriptions.length < 50 ||
      inscriptionTxIds.includes(inscriptions[inscriptionTxIds.length - 1].txid)
    )
      return;

    const additionalInscriptions = await apiController.getPaginatedInscriptions(
      currentAccount?.address,
      inscriptions[inscriptions.length - 1]?.txid
    );
    setInscriptionTxIds([
      ...inscriptionTxIds,
      inscriptions[inscriptions.length - 1]?.txid,
    ]);
    if (!additionalInscriptions) return;
    if (additionalInscriptions.length > 0) {
      setInscriptions((prev) => [...prev, ...additionalInscriptions]);
    }
  }, [apiController, currentAccount, inscriptions, inscriptionTxIds]);

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
        updateInscriptions(),
        updateLastBlock(),
        updateFeeRates(),
        updateInscriptionCounter(),
      ]);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [
    updateAccountBalance,
    udpateTransactions,
    updateInscriptions,
    updateLastBlock,
    updateFeeRates,
    updateInscriptionCounter,
    currentAccount?.address,
  ]);

  if (!currentAccount) return undefined;

  return {
    lastBlock,
    transactions,
    inscriptions,
    currentPrice,
    loadMoreTransactions,
    loadMoreInscriptions,
    trottledUpdate,
    feeRates,
    loading,
    inscriptionCounter,
    resetTransactions: () => {
      setTransactions([]);
      setInscriptions([]);
      setInscriptionCounter(0);
    },
  };
};

interface TransactionManagerContextType {
  lastBlock: number;
  transactions: ITransaction[];
  inscriptions: Inscription[];
  currentPrice: number | undefined;
  loadMoreTransactions: () => Promise<void>;
  loadMoreInscriptions: () => Promise<void>;
  trottledUpdate: (force?: boolean) => void;
  loading: boolean;
  feeRates?: {
    fast: number;
    slow: number;
  };
  resetTransactions: () => void;
  inscriptionCounter?: number;
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
    return {
      lastBlock: undefined,
      transactions: [],
      inscriptions: [],
      currentPrice: undefined,
      loadMoreTransactions: () => {},
      loadMoreInscriptions: () => {},
      trottledUpdate: () => {},
      loading: false,
      feeRates: {
        slow: 0,
        fast: 0,
      },
      resetTransactions: () => {},
      inscriptionCounter: 0,
    };
  }
  return context;
};
