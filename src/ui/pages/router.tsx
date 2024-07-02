import { createHashRouter, Navigate } from "react-router-dom";

import Wallet from "@/ui/pages/main/wallet";

import Login from "@/ui/pages/main/login";
import CreatePassword from "@/ui/pages/main/create-password";
import CreateNewAccount from "@/ui/pages/main/new-account";
import SwitchAccount from "@/ui/pages/main/switch-account";
import PagesLayout from "@/ui/components/layout";
import Receive from "./main/receive";
import SwitchWallet from "./main/switch-wallet";
import NewWallet from "./main/new-wallet";
import NewMnemonic from "./main/new-wallet/new-mnemonic";
import RestoreMnemonic from "./main/new-wallet/restore-mnemonic";
import RestorePrivKey from "./main/new-wallet/restore-priv-key";
import Settings from "./main/settings";
import ShowPk from "@/ui/pages/main/switch-account/show-pk";
import ShowMnemonic from "./main/switch-wallet/show-mnemonic";
import ChangeAddrType from "@/ui/pages/main/settings/change-addr-type";
import TransactionInfo from "./main/transaction-info";
import FinalleSend from "./main/send/finalle-send";
import CreateSend from "./main/send/create-send";
import ConfirmSend from "./main/send/confirm-send";
import Connect from "./provider/connect";
import SignMessage from "./provider/sign-message";
import CreateTx from "./provider/create-tx/component";
import ConnectedSites from "./main/settings/connected-sites";
import Language from "./main/settings/language";
import InscriptionDetails from "./main/inscription-details";
import Inscriptions from "./main/inscriptions";
import SignPsbt from "./provider/sign-psbt";
import RestoreMnemonicOrdinals from "./main/new-wallet/restore-mnemonic-ordinals";
import TokensComponent from "./main/tokens/component";
import InscribeTransfer from "./provider/inscribe-transfer";
import MultiPsbtSign from "./provider/multi-psbt-sign";
import ChangePassword from "./main/settings/security/change-password";
import Security from "./main/settings/security";
import Advanced from "./main/settings/security/advanced";
import WalletSettings from "./main/settings/wallet/component";
import NetworkSettings from "./main/settings/wallet/network/component";
import Home from "./main/home";
import SwitchNetwork from "./provider/switch-network";

export const guestRouter = createHashRouter([
  {
    path: "account",
    children: [
      { path: "login", element: <Login /> },
      { path: "create-password", element: <CreatePassword /> },
    ],
  },
  { path: "*", element: <Navigate to={"/account/login"} /> },
]);

export const authenticatedRouter = createHashRouter([
  { path: "/", element: <Home /> },
  {
    path: "home",
    element: <Wallet />,
  },
  {
    path: "pages",
    element: <PagesLayout />,
    children: [
      { path: "settings", element: <Settings /> },
      { path: "switch-account", element: <SwitchAccount /> },
      { path: "create-new-account", element: <CreateNewAccount /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "receive", element: <Receive /> },
      { path: "switch-wallet", element: <SwitchWallet /> },
      { path: "create-new-wallet", element: <NewWallet /> },
      { path: "new-mnemonic", element: <NewMnemonic /> },
      { path: "restore-mnemonic", element: <RestoreMnemonic /> },
      { path: "restore-ordinals", element: <RestoreMnemonicOrdinals /> },
      { path: "restore-priv-key", element: <RestorePrivKey /> },
      { path: "show-pk/:accId", element: <ShowPk /> },
      { path: "show-mnemonic/:walletId", element: <ShowMnemonic /> },
      { path: "change-addr-type", element: <ChangeAddrType /> },
      { path: "transaction-info/:txId", element: <TransactionInfo /> },
      { path: "finalle-send/:txId", element: <FinalleSend /> },
      { path: "create-send", element: <CreateSend /> },
      { path: "confirm-send", element: <ConfirmSend /> },
      { path: "connected-sites", element: <ConnectedSites /> },
      { path: "language", element: <Language /> },
      { path: "security", element: <Security /> },
      { path: "advanced", element: <Advanced /> },
      { path: "inscription-details", element: <InscriptionDetails /> },
      { path: "inscriptions", element: <Inscriptions /> },
      { path: "wallet-settings", element: <WalletSettings /> },
      { path: "network-settings", element: <NetworkSettings /> },
      {
        path: "bel-20",
        element: <TokensComponent />,
      },
    ],
  },
  {
    path: "provider",
    children: [
      { path: "connect", element: <Connect /> },
      { path: "signMessage", element: <SignMessage /> },
      { path: "createTx", element: <CreateTx /> },
      { path: "signPsbt", element: <SignPsbt /> },
      { path: "inscribeTransfer", element: <InscribeTransfer /> },
      { path: "multiPsbtSign", element: <MultiPsbtSign /> },
      { path: "switchNetwork", element: <SwitchNetwork /> },
    ],
  },
  { path: "*", element: <Navigate to={"/"} /> },
]);
