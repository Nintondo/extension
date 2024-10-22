import { useEffect, useRef } from "react";
import QRCode from "qr-code-styling";
import s from "./styles.module.scss";
import CopyBtn from "@/ui/components/copy-btn";
import toast from "react-hot-toast";
import { t } from "i18next";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import cn from "classnames";

const qrCode = new QRCode({
  width: 250,
  height: 250,
  type: "svg",
  margin: 3,
  image: "/logo-48.png",
  dotsOptions: {
    type: "extra-rounded",
    color: "#ced4da",
    gradient: {
      colorStops: [
        {
          color: "#ced4da",
          offset: 0,
        },
        {
          color: "#e9ecef",
          offset: 50,
        },
      ],
      type: "linear",
    },
  },
  backgroundOptions: {
    color: "#ffffff00",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 5,
    imageSize: 0.3,
  },
});

const Receive = () => {
  const currentAccount = useGetCurrentAccount();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
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
    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    }
    toast.success("Copied");
  };

  return (
    <div className={s.receive}>
      <div className={s.container}>
        <div title={t("receive.click_to_copy")} onClick={onCopy} ref={ref} />
        <div
          className="text-center opacity-80 text-xs text-ellipsis w-full break-all line-clamp-1"
          title={currentAccount?.address}
        >
          {currentAccount?.address}
        </div>
      </div>

      <CopyBtn
        value={currentAccount?.address}
        className={cn(s.copyButton, "bottom-btn")}
        label={t("receive.copy_address")}
      />
    </div>
  );
};

export default Receive;
