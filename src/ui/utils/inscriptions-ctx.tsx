/* eslint-disable react-hooks/rules-of-hooks */
import React, {
  useState,
  useCallback,
  useContext,
  createContext,
  FC,
} from "react";
import { useControllersState } from "../states/controllerState";
import { ContentInscription } from "@/shared/interfaces/inscriptions";
import { IToken } from "@/shared/interfaces/token";
import { useGetCurrentAccount } from "../states/walletState";
import { ss } from ".";

const useInscriptionManager = ():
  | InscriptionsManagerContextType
  | undefined => {
  const currentAccount = useGetCurrentAccount();
  const { apiController } = useControllersState(ss(["apiController"]));

  const [inscriptions, setInscriptions] = useState<
    ContentInscription[] | undefined
  >(undefined);
  const [tokens, setTokens] = useState<IToken[]>([]);

  const [searchInscriptions, setSearchInscriptions] = useState<
    ContentInscription[] | undefined
  >(undefined);
  const [searchTokens, setSearchTokens] = useState<IToken[] | undefined>(
    undefined
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const updateTokens = useCallback(async () => {
    if (!currentAccount?.address) return;
    setLoading(true);
    const tokens = await apiController.getTokens(currentAccount.address);
    setTokens(tokens ?? []);
    setLoading(false);
  }, [apiController, currentAccount?.address]);

  const updateInscriptions = useCallback(
    async (page: number) => {
      if (!currentAccount?.address) return;
      setLoading(true);
      const response = await apiController.getContentPaginatedInscriptions(
        currentAccount.address,
        page
      );
      if (!response || !response.inscriptions.length) {
        setInscriptions([]);
      } else {
        setInscriptions(response.inscriptions);
        setCurrentPage(page);
      }
      setLoading(false);
    },
    [apiController, currentAccount?.address]
  );

  const resetProvider = useCallback(() => {
    setInscriptions(undefined);
    setSearchInscriptions(undefined);
    setSearchTokens(undefined);
    setCurrentPage(1);
  }, []);

  if (!currentAccount) return undefined;

  return {
    inscriptions,
    loading,
    setCurrentPage,
    currentPage,
    tokens,
    setSearchInscriptions,
    setSearchTokens,
    searchInscriptions,
    searchTokens,
    updateTokens,
    setLoading,
    setInscriptions,
    updateInscriptions,
    resetProvider,
  };
};

interface InscriptionsManagerContextType {
  inscriptions: ContentInscription[] | undefined;
  loading: boolean;
  setCurrentPage: (page: number) => void;
  currentPage: number;
  tokens: IToken[];
  setSearchInscriptions: (v: ContentInscription[] | undefined) => void;
  setSearchTokens: (v: IToken[] | undefined) => void;
  searchInscriptions: ContentInscription[] | undefined;
  searchTokens: IToken[] | undefined;
  updateTokens: () => Promise<void>;
  setLoading: (value: boolean) => void;
  setInscriptions: (inscriptions?: ContentInscription[]) => void;
  updateInscriptions: (page: number) => Promise<void>;
  resetProvider: () => void;
}

const InscriptionManagerContext = createContext<
  InscriptionsManagerContextType | undefined
>(undefined);

export const InscriptionManagerProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const inscriptionManager = useInscriptionManager();

  return (
    <InscriptionManagerContext.Provider value={inscriptionManager}>
      {children}
    </InscriptionManagerContext.Provider>
  );
};

export const useInscriptionManagerContext = () => {
  const context = useContext(InscriptionManagerContext);
  if (!context) {
    return {
      inscriptions: undefined,
      loading: false,
      setCurrentPage: () => {},
      currentPage: 1,
      tokens: [],
      setSearchInscriptions: () => {},
      setSearchTokens: () => {},
      searchInscriptions: undefined,
      searchTokens: undefined,
      updateInscriptions: () => {},
      resetProvider: () => {},
      updateTokens: () => {},
    };
  }
  return context;
};
