import { FC, useState } from "react";
import cn from "classnames";
import { TailSpin } from "react-loading-icons";

export type IframeProps = {
  preview: string;
  size: keyof typeof SIZES;
};

const SIZES = {
  default: "w-36 h-36",
  big: "w-[318px] h-[318px]",
};

const Iframe: FC<IframeProps> = ({ preview, size }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl bg-black relative">
      {!loaded && (
        <div
          className={cn(
            "bg-input-bg flex justify-center items-center inset-0 absolute"
          )}
        >
          <TailSpin />
        </div>
      )}

      <iframe
        id="frame"
        onClick={(e) => e.preventDefault()}
        className={cn(SIZES[size])}
        src={preview}
        sandbox="allow-scripts"
        scrolling="no"
        onLoad={() => {
          setLoaded(true);
        }}
      />
    </div>
  );
};

export default Iframe;
// export default memo(Iframe, (p, n) => {
//   return p.preview === n.preview;
// });
