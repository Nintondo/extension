import { NETOWRKS } from "@/shared/constant";
import s from "./styles.module.scss";
import { useAppState } from "@/ui/states/appState";
import { useSwitchNetwork } from "@/ui/hooks/wallet";
import { ss } from "@/ui/utils";
import Tile from "@/ui/components/tile";

const NetworkSettings = () => {
  const { network } = useAppState(ss(["network"]));
  const switchNetwork = useSwitchNetwork();

  return (
    <div className={s.allTypes}>
      {NETOWRKS.map((i, f) => (
        <Tile
          key={f}
          label={i.name.replace(/ \(.*\)$/, "")}
          onClick={async () => {
            await switchNetwork(i.network);
          }}
          selected={
            network?.pubKeyHash === i.network.pubKeyHash &&
            network?.scriptHash === i.network.scriptHash
          }
        />
      ))}
    </div>
  );
};

export default NetworkSettings;
