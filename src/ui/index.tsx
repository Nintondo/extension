import ReactDOM from "react-dom/client";
import "./index.global.scss";
import App from "./App";
import { StrictMode } from "react";
import "../shared/locales/i18n";
import { TransactionManagerProvider } from "./utils/tx-ctx";
import { OrdinalsManagerProvider } from "./utils/ordinals-ctx";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <TransactionManagerProvider>
      <OrdinalsManagerProvider>
        <App />
      </OrdinalsManagerProvider>
    </TransactionManagerProvider>
  </StrictMode>
);
