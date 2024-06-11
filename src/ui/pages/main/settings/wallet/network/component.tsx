import { NETOWRKS } from "@/shared/constant";
import s from "./styles.module.scss";
import cn from "classnames";
import { useAppState } from "@/ui/states/appState";

const NetworkSettings = () => {
  const { network, updateAppState } = useAppState();

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
            await updateAppState({ network: i.network });
            window.location.reload();
          }}
        >
          <p className={s.title}>{i.name.replace(/ \(.*\)$/, "")}</p>
        </div>
      ))}
    </div>
  );
};

export default NetworkSettings;
