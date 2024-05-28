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
          color: "#f4a261",
          offset: 0,
        },
        {
          color: "#8d99ae",
          offset: 5,
        },
      ],
    },
  },
  qrOptions: {
    errorCorrectionLevel: "H",
    typeNumber: 4,
  },
  backgroundOptions: {
    color: "#ffffff00",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 5,
    imageSize: 0.25,
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
      <div className="flex items-center flex-col gap-3 p-3 h-3/4 justify-center">
        <div title={t("receive.click_to_copy")} onClick={onCopy} ref={ref} />
        <div className="text-center opacity-80 text-xs">
          {currentAccount?.address}
        </div>
      </div>

      <div>
        <CopyBtn
          value={currentAccount?.address}
          className={s.copyButton}
          label={t("receive.copy_address")}
        />
      </div>
    </div>
  );
};

export default Receive;
