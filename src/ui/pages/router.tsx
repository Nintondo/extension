import { createHashRouter, Navigate } from "react-router-dom";

import Wallet from "@/ui/pages/main/wallet";

import Login from "@/ui/pages/main/login";
import CreatePassword from "@/ui/pages/main/create-password";
import CreateNewAccount from "@/ui/pages/main/new-account";
import SwitchAccount from "@/ui/pages/main/switch-account";
import PagesLayout from "@/ui/components/layout";
import ChangePassword from "./main/security/change-password";
import Receive from "./main/receive";
import SwitchWallet from "./main/switch-wallet";
import NewWallet from "./main/new-wallet";
import NewMnemonic from "./main/new-wallet/new-mnemonic";
import RestoreMnemonic from "./main/new-wallet/restore-mnemonic";
import RestorePrivKey from "./main/new-wallet/restore-priv-key";
import Settings from "./main/settings";
import ShowPk from "@/ui/pages/main/switch-account/show-pk";
import ShowMnemonic from "./main/switch-wallet/show-mnemonic";
import ChangeAddrType from "@/ui/pages/main/change-addr-type";
import TransactionInfo from "./main/transaction-info";
import FinalleSend from "./main/send/finalle-send";
import CreateSend from "./main/send/create-send";
import ConfirmSend from "./main/send/confirm-send";
import Connect from "./provider/connect";
import Sign from "./provider/sign";
import SignTx from "./provider/sign-tx";
import CreateTx from "./provider/create-tx/component";
import ConnectedSites from "./main/connected-sites";
import Language from "./main/language";
import Security from "./main/security";
import Advanced from "./main/security/advanced";
import Discover from "./main/discover";

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
  { path: "home", element: <Wallet /> },
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
      { path: "discover", element: <Discover /> },
    ],
  },
  {
    path: "provider",
    children: [
      { path: "connect", element: <Connect /> },
      { path: "signMessage", element: <Sign /> },
      { path: "signTx", element: <SignTx /> },
      { path: "createTx", element: <CreateTx /> },
    ],
  },
  { path: "*", element: <Navigate to={"/home"} /> },
]);
