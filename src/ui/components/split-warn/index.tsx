import { SPLITTER_URL } from "@/shared/constant";
import { browserTabsCreate } from "@/shared/utils/browser";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";

interface Props {
  extraWidth?: boolean;
  message: string;
}

export default function SplitWarn({ extraWidth = false, message }: Props) {
  const currentAccount = useGetCurrentAccount();

  const isShowWarn =
    currentAccount?.inscriptionBalance &&
    currentAccount.inscriptionCounter &&
    (currentAccount.inscriptionBalance * 10 ** 8) /
      currentAccount.inscriptionCounter >
      100_000;

  if (!isShowWarn) return;

  return (
    <div
      className="text-black bg-orange-400 py-1 flex items-center gap-2 w-full px-3 cursor-pointer hover:underline"
      style={
        extraWidth
          ? {
              margin: "0 -1rem",
              width: "120%",
            }
          : undefined
      }
      onClick={async () => {
        await browserTabsCreate({
          url: SPLITTER_URL,
          active: true,
        });
      }}
    >
      <ExclamationTriangleIcon className="size-4 min-w-4" strokeWidth={2} />
      <span className="font-medium break-words">{message}</span>
    </div>
  );
}
