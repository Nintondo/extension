import { NETOWRKS } from "@/shared/constant";
import s from "./styles.module.scss";
import cn from "classnames";
import { useAppState } from "@/ui/states/appState";
import { Network } from "belcoinjs-lib";
import { useControllersState } from "@/ui/states/controllerState";
import { useWalletState } from "@/ui/states/walletState";

const NetworkSettings = () => {
  const { network, updateAppState } = useAppState((v) => ({
    network: v.network,
    updateAppState: v.updateAppState,
    password: v.password,
  }));

  const { updateWalletState, selectedWallet, wallets } = useWalletState(
    (v) => ({
      updateWalletState: v.updateWalletState,
      selectedWallet: v.selectedWallet,
      wallets: v.wallets,
    })
  );

  const { walletController, apiController } = useControllersState((v) => ({
    walletController: v.walletController,
    apiController: v.apiController,
  }));

  const switchNetwork = async (network: Network) => {
    if (selectedWallet === undefined) return;
    const updatedWallets = wallets;
    await Promise.all([
      updateAppState({ network }),
      walletController.switchNetwork(network),
      apiController.setTestnet(
        network.pubKeyHash === 33 && network.scriptHash === 22
      ),
    ]);
    updatedWallets[selectedWallet].accounts =
      await walletController.loadAccountsData(
        selectedWallet,
        updatedWallets[selectedWallet].accounts
      );
    await updateWalletState({ wallets: updatedWallets });
  };

  return (
    <div className={s.allTypes}>
      {NETOWRKS.map((i, f) => (
        <div
          key={f}
          className={cn(s.network, {
            [s.selected]:
              network?.pubKeyHash === i.network.pubKeyHash &&
              network?.scriptHash === i.network.scriptHash,
          })}
          onClick={async () => {
            await switchNetwork(i.network);
          }}
        >
          <p className={s.title}>{i.name.replace(/ \(.*\)$/, "")}</p>
        </div>
      ))}
    </div>
  );
};

export default NetworkSettings;
