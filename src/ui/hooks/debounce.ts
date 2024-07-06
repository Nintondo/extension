import { useCallback, useEffect, useState } from "react";

export function useDebounceCall<T>(
  value: (...args: T[]) => Promise<void>,
  delay?: number
): (...args: T[]) => void {
  const [triggered, setTriggered] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (triggered !== undefined) {
        setTriggered(undefined);
        const copy = [...triggered];
        await value(...copy);
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

export function useDebounce<D, T extends (...args: D[]) => void>(
  value: T,
  delay?: number
): T {
  const [debouncedValue, setDebouncedValue] = useState<D[] | undefined>(
    undefined
  );

  useEffect(() => {
    if (debouncedValue) {
      const timer = setTimeout(() => value(...debouncedValue), delay || 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [debouncedValue, delay, value]);

  return useCallback((...v: D[]) => {
    setDebouncedValue(v);
  }, []) as T;
}
