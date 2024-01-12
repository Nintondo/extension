import { useCallback, useEffect, useState } from "react";

export function useDebounceCall(
  value: (...args: any[]) => Promise<void>,
  delay?: number
): (...args: any[]) => void {
  const [triggered, setTriggered] = useState<any[]>(undefined);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (triggered !== undefined) {
        await value(...triggered);
        return setTriggered(undefined);
      }
    }, delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, triggered]);
  return useCallback(
    (...args: any[]) => {
      setTriggered(args);
    },
    [setTriggered]
  );
}
