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
import { IToken } from "@/shared/interfaces/token";

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

  const [transactions, setTransactions] = useState<ITransaction[] | undefined>(
    undefined
  );
  const [inscriptions, setInscriptions] = useState<Inscription[] | undefined>(
    undefined
  );
  const [tokens, setTokens] = useState<IToken[]>([]);

  const [searchInscriptions, setSearchInscriptions] = useState<
    Inscription[] | undefined
  >(undefined);
  const [searchTokens, setSearchTokens] = useState<IToken[] | undefined>(
    undefined
  );

  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const updateAccountBalance = useUpdateCurrentAccountBalance();

  const [transactionTxIds, setTransactionTxIds] = useState<string[]>([]);
  const [inscriptionLocations, setInscriptionLocations] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const updateFn = <T,>(
    onUpdate: Dispatch<SetStateAction<T[] | undefined>>,
    retrieveFn: (address: string) => Promise<T[] | undefined>,
    currentValue: T[] | undefined,
    compareKey: keyof T
  ) => {
    return useCallback(
      async (force?: boolean) => {
        const receivedItems = await retrieveFn(currentAccount?.address ?? "");
        if (receivedItems !== undefined) {
          if (
            (currentValue ?? []).length > 0 &&
            (currentValue ?? [])[0][compareKey] !==
              receivedItems[0][compareKey] &&
            !force
          ) {
            const oldIndex = receivedItems.findIndex(
              (f) => f[compareKey] === (currentValue ?? [])[0][compareKey]
            );
            onUpdate([
              ...receivedItems.slice(0, oldIndex),
              ...(currentValue ?? []),
            ]);
          } else if ((currentValue ?? []).length < 50 || force)
            onUpdate(receivedItems ?? []);
        }
      },
      [onUpdate, retrieveFn, compareKey, currentValue]
    );
  };

  const updateTransactions = updateFn(
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
    setInscriptionLocations([]);
  }, [updateInscriptions]);

  const updateLastBlock = useCallback(async () => {
    const data = await apiController.getLastBlockBEL();
    if (data) setLastBlock(data);
  }, [apiController]);

  const updateFeeRates = useCallback(async () => {
    setFeeRates(await apiController.getFees());
  }, [apiController]);

  const updateTokens = useCallback(async () => {
    if (!currentAccount?.address) return;
    const tokens = await apiController.getTokens(currentAccount.address);
    setTokens(tokens ?? []);
  }, [apiController, currentAccount?.address]);

  const updateAll = useCallback(
    async (force = false) => {
      setLoading(true);
      if (force) {
        setInscriptions(undefined);
        setTransactions(undefined);
      }
      await Promise.all([
        updateAccountBalance(),
        updateTransactions(force),
        updateInscriptions(force),
        updateFeeRates(),
        updateTokens(),
      ]);
      setLoading(false);
    },
    [
      updateAccountBalance,
      updateTransactions,
      updateInscriptions,
      updateFeeRates,
      updateTokens,
    ]
  );

  const throttleUpdate = useDebounceCall(updateAll, 300);

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

  const loadMoreInscriptions = useCallback(async () => {
    if (!currentAccount || !currentAccount.address || !inscriptions) return;
    const inc = inscriptions[inscriptions.length - 1];

    if (
      (inscriptions.length < 60 && inscriptionLocations.length) ||
      inscriptionLocations.includes(
        `${inc.txid}:${inc.vout}:${inc.offset}:${inc.inscription_number}`
      )
    )
      return;

    const additionalInscriptions = await apiController.getPaginatedInscriptions(
      currentAccount?.address,
      `${inc.txid}:${inc.vout}:${inc.offset}:${inc.inscription_number}`
    );
    setInscriptionLocations([
      ...inscriptionLocations,
      `${inc.txid}:${inc.vout}:${inc.offset}:${inc.inscription_number}`,
    ]);
    if (!additionalInscriptions) return;
    if (additionalInscriptions.length > 0) {
      setInscriptions((prev) => [...(prev ?? []), ...additionalInscriptions]);
    }
  }, [apiController, currentAccount, inscriptions, inscriptionLocations]);

  const inscriptionIntervalUpdate = useCallback(async () => {
    if (!currentAccount?.address) return;

    const updateInscriptions = (
      receivedInscriptions: Inscription[],
      index: number
    ) => {
      const updatedInscriptions = [...(inscriptions ?? [])];
      updatedInscriptions.splice(
        index,
        receivedInscriptions.length,
        ...receivedInscriptions
      );
      setInscriptions(updatedInscriptions);
    };

    const fetchAndUpdateInscriptions = async (
      location: string,
      index: number
    ) => {
      if (!currentAccount || !currentAccount.address) return;
      const receivedInscriptions = await apiController.getPaginatedInscriptions(
        currentAccount.address,
        location
      );
      if (receivedInscriptions?.length) {
        updateInscriptions(receivedInscriptions, index);
        return true;
      }
      return false;
    };

    if (currentPage > 10 && inscriptions && inscriptions.length) {
      const chainIndex = Math.floor(currentPage / 10) - 1;
      let isUpdated = await fetchAndUpdateInscriptions(
        inscriptionLocations[chainIndex],
        chainIndex * 10
      );
      if (!isUpdated) {
        const txIdIndex = inscriptions.findIndex(
          (f) => f.txid === inscriptionLocations[chainIndex]
        );
        for (let i = 1; i <= 3; i++) {
          const inc = inscriptions[txIdIndex - i];

          isUpdated = await fetchAndUpdateInscriptions(
            `${inc.txid}:${inc.vout}:${inc.offset}`,
            txIdIndex - i
          );
          if (isUpdated) {
            const updatedInscriptionTxIds = [...inscriptionLocations];
            updatedInscriptionTxIds.splice(
              chainIndex,
              updatedInscriptionTxIds.length - 1
            );
            updatedInscriptionTxIds.push(inscriptions[txIdIndex - i].txid);
            setInscriptionLocations(updatedInscriptionTxIds);
            return;
          }
        }
        await forceUpdateInscriptions();
      }
    } else {
      const receivedInscriptions = await apiController.getInscriptions(
        currentAccount.address
      );
      if (!receivedInscriptions) return;
      if (!inscriptionLocations.length) {
        setInscriptions(receivedInscriptions);
      } else {
        setInscriptions([
          ...receivedInscriptions,
          ...(inscriptions ?? []).slice(
            receivedInscriptions?.length,
            (inscriptions ?? []).length
          ),
        ]);
      }
    }
  }, [
    inscriptionLocations,
    inscriptions,
    currentPage,
    apiController,
    forceUpdateInscriptions,
    currentAccount,
  ]);

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
    const interval = setInterval(async () => {
      await Promise.all([
        updateTransactions(),
        updateLastBlock(),
        inscriptionIntervalUpdate(),
        updateFeeRates(),
        updateTokens(),
      ]);
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [
    updateTransactions,
    updateLastBlock,
    inscriptionIntervalUpdate,
    updateFeeRates,
    updateTokens,
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
    trottledUpdate: throttleUpdate,
    feeRates,
    loading,
    setCurrentPage,
    currentPage,
    tokens,
    forceUpdateInscriptions,
    setSearchInscriptions,
    setSearchTokens,
    searchInscriptions,
    searchTokens,
  };
};

interface TransactionManagerContextType {
  lastBlock: number;
  transactions: ITransaction[] | undefined;
  inscriptions: Inscription[] | undefined;
  currentPrice: number | undefined;
  loadMoreTransactions: () => Promise<void>;
  loadMoreInscriptions: () => Promise<void>;
  trottledUpdate: (force?: boolean) => void;
  loading: boolean;
  feeRates?: {
    fast: number;
    slow: number;
  };
  setCurrentPage: (page: number) => void;
  currentPage: number;
  tokens: IToken[];
  forceUpdateInscriptions: () => Promise<void>;
  setSearchInscriptions: (v: Inscription[] | undefined) => void;
  setSearchTokens: (v: IToken[] | undefined) => void;
  searchInscriptions: Inscription[] | undefined;
  searchTokens: IToken[] | undefined;
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
      transactions: undefined,
      inscriptions: undefined,
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
      tokens: [],
      forceUpdateInscriptions: () => {},
      setSearchInscriptions: () => {},
      setSearchTokens: () => {},
      searchInscriptions: undefined,
      searchTokens: undefined,
    };
  }
  return context;
};
