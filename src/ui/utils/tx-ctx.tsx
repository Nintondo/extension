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
  useRef,
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
  const [currentPage, setCurrentPage] = useState<number>(1);

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
          } else if (currentValue.length < 50 || force)
            onUpdate(receivedItems ?? []);
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

  const forceUpdateInscriptions = useCallback(async () => {
    await updateInscriptions(true);
    setCurrentPage(1);
    setInscriptionTxIds([]);
  }, [updateInscriptions]);

  const updateLastBlock = useCallback(async () => {
    setLastBlock(await apiController.getLastBlockBEL());
  }, [apiController]);

  const updateFeeRates = useCallback(async () => {
    setFeeRates(await apiController.getFees());
  }, [apiController]);

  const updateAll = useCallback(
    async (force = false) => {
      await Promise.all([
        updateAccountBalance(),
        udpateTransactions(force),
        updateInscriptions(force),
        updateFeeRates(),
      ]);
    },
    [
      updateAccountBalance,
      udpateTransactions,
      updateInscriptions,
      updateFeeRates,
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
      inscriptions.length < 60 ||
      inscriptionTxIds.includes(inscriptions[inscriptions.length - 1].txid)
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

  const inscriptionIntervalUpdate = useCallback(async () => {
    if (!currentAccount?.address) return;

    const updateInscriptions = (
      receivedInscriptions: Inscription[],
      index: number
    ) => {
      const updatedInscriptions = [...inscriptions];
      updatedInscriptions.splice(
        index,
        receivedInscriptions.length,
        ...receivedInscriptions
      );
      setInscriptions(updatedInscriptions);
    };

    const fetchInscriptions = async (
      address: string,
      txId: string,
      callbackIndex: number
    ) => {
      const receivedInscriptions = await apiController.getPaginatedInscriptions(
        address,
        txId
      );
      if (receivedInscriptions.length) {
        const index =
          receivedInscriptions.length === 60
            ? (callbackIndex + 1) * 60 - (callbackIndex ? 1 : 0)
            : (callbackIndex + 1) * 60 - callbackIndex;
        updateInscriptions(receivedInscriptions, index);
      }
      return receivedInscriptions.length;
    };

    if (currentPage > 10) {
      const chainIndex = Math.floor(currentPage / 10) - 1;
      let inscriptionLength = await fetchInscriptions(
        currentAccount.address,
        inscriptionTxIds[chainIndex],
        chainIndex
      );
      if (!inscriptionLength) {
        const txIdIndex = inscriptions.findIndex(
          (f) => f.txid === inscriptionTxIds[chainIndex]
        );
        for (let i = 1; i <= 3; i++) {
          inscriptionLength = await fetchInscriptions(
            currentAccount.address,
            inscriptions[txIdIndex - i].txid,
            i
          );
          if (inscriptionLength) {
            const updatedInscriptionTxIds = [...inscriptionTxIds];
            updatedInscriptionTxIds.splice(
              chainIndex,
              1,
              inscriptions[txIdIndex - i].txid
            );
            setInscriptionTxIds(updatedInscriptionTxIds);
            return;
          }
        }
      }
    } else {
      const receivedInscriptions = await apiController.getInscriptions(
        currentAccount.address
      );
      setInscriptions([
        ...receivedInscriptions,
        ...inscriptions.slice(receivedInscriptions.length),
      ]);
    }
  }, [
    inscriptionTxIds,
    inscriptions,
    currentPage,
    currentAccount?.address,
    apiController,
  ]);

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
        inscriptionIntervalUpdate(),
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
    inscriptionIntervalUpdate,
    currentAccount?.address,
  ]);

  const inscriptionIntervalUpdateRef = useRef(inscriptionIntervalUpdate);
  inscriptionIntervalUpdateRef.current = inscriptionIntervalUpdate;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!(currentPage % 10)) inscriptionIntervalUpdateRef.current();
  }, [currentPage]);

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
    resetTransactions: () => {
      setTransactions([]);
      setInscriptions([]);
    },
    setCurrentPage,
    currentPage,
    forceUpdateInscriptions,
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
  setCurrentPage: (page: number) => void;
  currentPage: number;
  forceUpdateInscriptions: () => Promise<void>;
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
      setCurrentPage: () => {},
      currentPage: 1,
      forceUpdateInscriptions: () => {},
    };
  }
  return context;
};
