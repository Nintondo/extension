import { useCallback, useEffect, useState } from "react";

export function useDebounceCall(
  value: () => Promise<void>,
  delay?: number
): () => void {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const timer = setTimeout(async () => {
      if (triggered) {
        await value();
        return setTriggered(false);
      }
    }, delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, triggered]);
  return useCallback(() => {
    setTriggered(true);
  }, [setTriggered]);
}
