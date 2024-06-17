import { NETOWRKS } from "@/shared/constant";
import s from "./styles.module.scss";
import cn from "classnames";
import { useAppState } from "@/ui/states/appState";
import { useSwitchNetwork } from "@/ui/hooks/wallet";

const NetworkSettings = () => {
  const { network } = useAppState((v) => ({
    network: v.network,
  }));
  const switchNetwork = useSwitchNetwork();

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
