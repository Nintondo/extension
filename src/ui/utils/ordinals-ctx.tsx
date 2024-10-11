import React, {
  useState,
  useCallback,
  useContext,
  createContext,
  FC,
} from "react";
import { useControllersState } from "../states/controllerState";
import { ContentInscription } from "@/shared/types/inscriptions";
import { Token } from "@/shared/types/token";
import { useGetCurrentAccount } from "../states/walletState";
import { ss } from ".";
import { Rune } from "@/shared/types/runes";

const useOrdinalsManager = (): OrdinalsManagerContextType | undefined => {
  const currentAccount = useGetCurrentAccount();
  const { apiController } = useControllersState(ss(["apiController"]));

  const [inscriptions, setInscriptions] = useState<
    ContentInscription[] | undefined
  >(undefined);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [runes, setRunes] = useState<Rune[]>([]);

  const [searchInscriptions, setSearchInscriptions] = useState<
    ContentInscription[] | undefined
  >(undefined);
  const [searchTokens, setSearchTokens] = useState<Token[] | undefined>(
    undefined
  );
  const [searchRunes, setSearchRunes] = useState<Rune[] | undefined>(undefined);

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

  const updateRunes = useCallback(async () => {
    if (!currentAccount?.address) return;
    setLoading(true);

    const response: Rune[] = [
      {
        runeGenesisLogo:
          "7fc58d5a392dab91b1d634f513b05fdf3619bd7a7a9ad373a421a78a25861f3ci0",
        runeBalance: {
          amount: "200",
          divisibility: 2,
          rune: "FRANK•FRANK•FRANK",
          runeid: "200:1",
          spacedRune: "",
          symbol: "$",
        },
      },
    ];

    setRunes(response);

    setLoading(false);
  }, [currentAccount?.address]);

  const resetProvider = useCallback(() => {
    setInscriptions(undefined);
    setSearchInscriptions(undefined);
    setSearchTokens(undefined);
    setSearchRunes(undefined);
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
    updateRunes,
    runes,
    setSearchRunes,
    searchRunes,
  };
};

interface OrdinalsManagerContextType {
  inscriptions: ContentInscription[] | undefined;
  loading: boolean;
  setCurrentPage: (page: number) => void;
  currentPage: number;
  tokens: Token[];
  setSearchInscriptions: (v: ContentInscription[] | undefined) => void;
  setSearchTokens: (v: Token[] | undefined) => void;
  searchInscriptions: ContentInscription[] | undefined;
  searchTokens: Token[] | undefined;
  updateTokens: () => Promise<void>;
  updateRunes: () => Promise<void>;
  setLoading: (value: boolean) => void;
  setInscriptions: (inscriptions?: ContentInscription[]) => void;
  updateInscriptions: (page: number) => Promise<void>;
  resetProvider: () => void;
  runes: Rune[];
  searchRunes: Rune[] | undefined;
  setSearchRunes: (v: Rune[] | undefined) => void;
}

const OrdinalsManagerContext = createContext<
  OrdinalsManagerContextType | undefined
>(undefined);

export const OrdinalsManagerProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ordinalsManager = useOrdinalsManager();

  return (
    <OrdinalsManagerContext.Provider value={ordinalsManager}>
      {children}
    </OrdinalsManagerContext.Provider>
  );
};

export const useOrdinalsManagerContext = (): OrdinalsManagerContextType => {
  const context = useContext(OrdinalsManagerContext);
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
      resetProvider: () => {},
      setInscriptions: () => {},
      setLoading: () => {},
      updateInscriptions: async () => {},
      updateTokens: async () => {},
      updateRunes: async () => {},
      runes: [],
      setSearchRunes: () => {},
      searchRunes: undefined,
    };
  }
  return context;
};
