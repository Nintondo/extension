/* eslint-disable @typescript-eslint/no-floating-promises */
import { useCallback, useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { useControllersState } from "@/ui/states/controllerState";
import Loading from "react-loading";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { Inscription } from "@/shared/interfaces/inscriptions";
import { t } from "i18next";
import { useDebounce } from "@/ui/hooks/debounce";
import { IToken } from "@/shared/interfaces/token";
import TokenCard from "@/ui/components/token-card";
import SearchField from "./search-field";
import MintTransferModal from "./mint-transfer-modal";
import SendTransferModal from "./send-transfer-modal";

const Inscriptions = () => {
  const {
    loadMoreInscriptions,
    inscriptions,
    currentPage,
    setCurrentPage,
    loading: managerLoading,
    tokens,
    active,
  } = useTransactionManagerContext();
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMoreInscriptions, setLoadingMoreInscriptions] =
    useState<boolean>(false);
  const currentAccount = useGetCurrentAccount();
  const [searchValue, setSearchValue] = useState<string>("");
  const [foundInscription, setFoundInscriptions] = useState<
    Inscription[] | undefined
  >(undefined);
  const [foundTokens, setFoundTokens] = useState<IToken[] | undefined>(
    undefined
  );
  const [selectedMintToken, setSelectedMintToken] = useState<
    IToken | undefined
  >(undefined);
  const [selectedSendToken, setSelectedSendToken] = useState<
    IToken | undefined
  >(undefined);

  const changePage = useCallback(
    async (page: number) => {
      if (!loadingMoreInscriptions) {
        if (
          inscriptions.length <= page * 6 &&
          page * 6 < (currentAccount?.inscriptionCounter ?? 0)
        ) {
          setLoadingMoreInscriptions(true);
          await loadMoreInscriptions();
          setLoadingMoreInscriptions(false);
        }
        setCurrentPage(page);
      }
    },
    [
      currentAccount?.inscriptionCounter,
      inscriptions.length,
      loadMoreInscriptions,
      loadingMoreInscriptions,
      setCurrentPage,
    ]
  );

  const searchInscription = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        setFoundInscriptions(undefined);
        return;
      }
      setLoading(true);
      const inscriptionNumber = Number(search);
      setFoundInscriptions(
        await apiController.getInscription(
          Number.isNaN(inscriptionNumber)
            ? {
                inscriptionId: search.trim(),
                address: currentAccount.address,
              }
            : { inscriptionNumber, address: currentAccount.address }
        )
      );
      setCurrentPage(1);
      setLoading(false);
    },
    [apiController, setCurrentPage, currentAccount.address]
  );

  const searchToken = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        setFoundTokens(undefined);
        return;
      }
      setLoading(true);
      setFoundTokens(
        tokens.filter((f) => f.tick.includes(search.trim().toLowerCase()))
      );
      setCurrentPage(1);
      setLoading(false);
    },
    [setCurrentPage, tokens]
  );

  const inscriptionDebounce = useDebounce(searchInscription, 200);
  const tokenDebounce = useDebounce(searchToken, 10);

  if (currentAccount?.inscriptionCounter === undefined && managerLoading)
    return <Loading />;

  if (active === "bel-20") {
    return (
      <div className={s.inscriptionDiv}>
        <div className="lex flex-col h-full w-full pb-8 overflow-hidden md:pb-16">
          <SearchField
            debounce={tokenDebounce}
            foundData={foundTokens}
            loading={loading}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            setFoundData={setFoundTokens}
            tokenSearch={true}
          />

          <div className="py-2 pt-4 overflow-y-auto gap-3 flex flex-col">
            {(foundTokens === undefined ? tokens : foundTokens).map(
              (f: IToken, i: number) => {
                return (
                  <div key={i}>
                    <TokenCard
                      openMintModal={(token) => {
                        setSelectedMintToken(token);
                      }}
                      openSendModal={(token) => {
                        setSelectedSendToken(token);
                      }}
                      token={f}
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>
        {(foundTokens === undefined && !tokens.length) ||
        (foundTokens !== undefined && !foundTokens.length) ? (
          <div className="flex w-full h-4/5 bottom-0 items-center justify-center absolute">
            <p>{t("inscriptions.tokens_not_found")}</p>
          </div>
        ) : undefined}
        <MintTransferModal
          selectedMintToken={selectedMintToken}
          setSelectedMintToken={setSelectedMintToken}
        />
        <SendTransferModal
          selectedSendToken={selectedSendToken}
          setSelectedSendToken={setSelectedSendToken}
        />
      </div>
    );
  }

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex flex-col h-full w-full pb-8 overflow-hidden md:pb-16">
        <SearchField
          debounce={inscriptionDebounce}
          foundData={foundInscription}
          loading={loading}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          setFoundData={setFoundInscriptions}
        />

        <div className={s.gridContainer}>
          {(foundInscription === undefined ? inscriptions : foundInscription)
            .slice((currentPage - 1) * 6, (currentPage - 1) * 6 + 6)
            .map((f, i) => (
              <InscriptionCard key={i} inscription={f} />
            ))}
        </div>
      </div>

      {!(
        (foundInscription === undefined &&
          !currentAccount?.inscriptionCounter) ||
        (foundInscription !== undefined && !foundInscription.length)
      ) ? (
        <div className="w-full absolute bottom-0 p-3 pb-4">
          <Pagination
            currentPage={currentPage}
            onPageChange={changePage}
            pageCount={Math.ceil(
              (foundInscription !== undefined
                ? foundInscription.length
                : currentAccount?.inscriptionCounter ?? 0) / 6
            )}
            visiblePageButtonsCount={5}
            leftBtnPlaceholder={"<"}
            rightBtnPlaceholder={">"}
            className={s.pagination}
          />
        </div>
      ) : (
        <div className="flex w-full h-4/5 bottom-0 items-center justify-center absolute">
          <p>{t("inscriptions.inscription_not_found")}</p>
        </div>
      )}
    </div>
  );
};

export default Inscriptions;
