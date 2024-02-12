import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import s from "./styles.module.scss";
import cn from "classnames";
import { ChevronLeftIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useWalletState } from "@/ui/states/walletState";
import { useControllersState } from "@/ui/states/controllerState";
import { t } from "i18next";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import Select from "../select";

interface IRouteTitle {
  route: string;
  title: string;
  action?: {
    icon: React.ReactNode;
    link?: string;
  };
  backAction?: () => void;
  disableBack?: boolean;
}

export default function PagesLayout() {
  const { stateController } = useControllersState((v) => ({
    stateController: v.stateController,
  }));

  const currentRoute = useLocation();
  const navigate = useNavigate();
  const { wallets } = useWalletState((v) => ({ wallets: v.wallets }));
  const { active, setActive } = useTransactionManagerContext();

  const defaultTitles: IRouteTitle[] = useMemo(
    () => [
      {
        route: "/pages/switch-account",
        title: t("components.layout.switch_account"),
        action: {
          icon: <PlusCircleIcon className="w-8 h-8" />,
          link: "/pages/create-new-account",
        },
      },
      {
        route: "/pages/change-addr-type",
        title: t("components.layout.change_address_type"),
      },
      {
        route: "/pages/create-new-account",
        title: t("components.layout.create_new_account"),
      },
      {
        route: "/pages/change-password",
        title: t("components.layout.change_password"),
      },
      {
        route: "/pages/security",
        title: t("components.layout.security"),
      },
      {
        route: "/pages/receive",
        title: t("components.layout.receive_bel"),
      },
      {
        route: "/pages/switch-wallet",
        title: t("components.layout.switch_wallet"),
        action: {
          icon: <PlusCircleIcon className="w-8 h-8" />,
          link: "/pages/create-new-wallet",
        },
      },
      {
        route: "/pages/restore-mnemonic",
        title: t("components.layout.restore_from_mnemonic"),
      },
      {
        route: "/pages/restore-priv-key",
        title: t("components.layout.restore_from_private_key"),
      },
      {
        route: "/pages/send",
        title: t("components.layout.send"),
      },
      {
        route: "/pages/transaction-info/@",
        title: t("components.layout.transaction_info"),
      },
      {
        route: "/pages/settings",
        title: t("components.layout.settings"),
      },
      {
        route: "/pages/advanced",
        title: t("components.layout.advanced"),
      },
      {
        route: "/pages/show-mnemonic/@",
        title: t("components.layout.show_mnemonic"),
      },
      {
        route: "/pages/show-pk/@",
        title: t("components.layout.show_private_key"),
      },
      {
        route: "/pages/discover",
        title: t("components.layout.discover"),
      },
      {
        route: "/pages/connected-sites",
        title: t("components.layout.connected_sites"),
      },
      {
        route: "/pages/language",
        title: t("components.layout.change_language"),
      },
      {
        route: "/pages/inscriptions",
        title: t("components.layout.inscriptions"),
        action: {
          icon: (
            <Select
              values={[{ name: "NFTs" }, { name: "bel-20" }]}
              selected={{ name: active }}
              setSelected={(v) => setActive(v.name)}
              displayCheckIcon={false}
              className="w-20.5"
            />
          ),
        },
      },
    ],
    [active, setActive]
  );

  const routeTitles = useMemo(
    () =>
      [
        ...defaultTitles,
        {
          route: "/pages/create-new-wallet",
          title: t("components.layout.create_new_wallet"),
          disableBack: wallets.length <= 0,
        },
        {
          route: "/pages/new-mnemonic",
          title: t("components.layout.create_new_wallet"),
          backAction: async () => {
            if (await stateController.getPendingWallet()) {
              await stateController.clearPendingWallet();
            }
            navigate(-1);
          },
        },
        {
          backAction: () => {
            navigate("/home");
          },
          route: "/pages/finalle-send/@",
          title: t("components.layout.send"),
        },
        {
          backAction: () => {
            navigate("/pages/create-send", {
              state: currentRoute.state,
            });
          },
          route: "/pages/confirm-send",
          title: t("components.layout.send"),
        },
        {
          route: "/pages/inscription-details",
          title:
            t("inscription_details.title") + ` #${currentRoute.state?.number}`,
        },
        {
          route: "/pages/create-send",
          title: t("components.layout.send"),
          backAction: () => {
            navigate("/home");
          },
        },
      ] as IRouteTitle[],
    [navigate, stateController, currentRoute, wallets.length, defaultTitles]
  );

  const currentRouteTitle = useMemo(
    () =>
      routeTitles.find((i) => {
        if (i.route.includes("@")) {
          return currentRoute.pathname.includes(
            i.route.slice(0, i.route.length - 1)
          );
        }
        return currentRoute.pathname === i.route;
      }),
    [currentRoute, routeTitles]
  );

  return (
    <div className={s.layout}>
      {
        <div className={s.header}>
          {!currentRouteTitle?.disableBack ? (
            <div
              className={cn(s.controlElem, s.back)}
              onClick={() => {
                if (currentRouteTitle?.backAction)
                  currentRouteTitle.backAction();
                else navigate(-1);
              }}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </div>
          ) : undefined}

          <div className={cn(s.controlElem, s.title)}>
            {currentRouteTitle?.title}
          </div>

          {currentRouteTitle?.action ? (
            currentRouteTitle?.action.link ? (
              <Link
                className={cn(s.controlElem, s.addNew)}
                to={currentRouteTitle.action.link}
              >
                {currentRouteTitle.action.icon}
              </Link>
            ) : (
              currentRouteTitle.action.icon
            )
          ) : undefined}
        </div>
      }
      <div className={s.contentDiv}>
        <Outlet />
      </div>
    </div>
  );
}
