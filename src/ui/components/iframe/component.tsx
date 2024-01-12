import { FC, memo, useMemo } from "react";
import cn from "classnames";

export type IframeProps = {
  preview: string;
  size: keyof typeof SIZES;
};

const SIZES = {
  default: "w-36 h-36",
  big: "w-[302px] h-[302px]",
};

const Iframe: FC<IframeProps> = ({ preview, size }) => {
  return useMemo(
    () => (
      <iframe
        onClick={(e) => e.preventDefault()}
        className={cn(
          "pointer-events-none overflow-hidden rounded-xl",
          SIZES[size]
        )}
        src={preview}
        sandbox="allow-scripts"
        scrolling="no"
      />
    ),
    [preview, size]
  );
};

export default memo(Iframe, (p, n) => {
  return p.preview === n.preview;
});
