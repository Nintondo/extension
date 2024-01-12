import { memo, useMemo } from "react";

export type IframeProps = { preview: string; className?: string };

const Iframe = ({ preview }: IframeProps) => {
  return useMemo(
    () => (
      // <div className={cn(className)}>
      <iframe
        onClick={(e) => e.preventDefault()}
        className={"pointer-events-none w-full h-full"}
        src={preview}
        sandbox="allow-scripts"
        scrolling="no"
      ></iframe>
      // </div>
    ),
    [preview]
  );
};

export default memo(Iframe, (p, n) => {
  return p.preview === n.preview;
});
