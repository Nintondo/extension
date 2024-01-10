import { useEffect, useRef } from "react";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import QRCode from "qr-code-styling";
import s from "./styles.module.scss";
import CopyBtn from "@/ui/components/copy-btn";
import toast from "react-hot-toast";
import { t } from "i18next";

const qrCode = new QRCode({
  width: 250,
  height: 250,
  type: "svg",
  margin: 3,
  image: "/icon.ico",
  dotsOptions: {
    type: "extra-rounded",
    gradient: {
      type: "linear",
      rotation: 45,
      colorStops: [
        {
          color: "#E48F45",
          offset: 0,
        },
        {
          color: "#F5CCA0",
          offset: 5,
        },
      ],
    },
  },
  backgroundOptions: {
    color: "#2F2F2F00",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 5,
  },
});

const Receive = () => {
  const currentAccount = useGetCurrentAccount();
  const ref = useRef(null);

  useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  useEffect(() => {
    qrCode.update({
      data: currentAccount?.address,
    });
  }, [currentAccount?.address]);

  const onCopy = async () => {
    const newQr = new QRCode({
      ...qrCode._options,
      backgroundOptions: {
        color: "#000",
      },
    });
    const blob = await newQr.getRawData();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    toast.success("Copied");
  };

  return (
    <div className={s.receive}>
      <div>
        <div className="flex items-center flex-col p-3">
          <div title={t("receive.click_to_copy")} onClick={onCopy} ref={ref} />
        </div>
        <div className={s.accTitle}>{currentAccount?.name ?? "Account"}</div>
      </div>
      <div>
        <CopyBtn
          value={currentAccount?.address}
          className={s.copyButton}
          label={t("receive.copy_address")}
        />
        <p className="text-center opacity-80 text-xs">
          {currentAccount?.address}
        </p>
      </div>
    </div>
  );
};

export default Receive;
