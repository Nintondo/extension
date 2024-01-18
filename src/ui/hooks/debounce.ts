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

export function useDebounce<T extends (...args: any) => void>(
  value: T,
  delay?: number
): T {
  const [debouncedValue, setDebouncedValue] = useState(undefined);

  useEffect(() => {
    if (debouncedValue) {
      const timer = setTimeout(() => value(...debouncedValue), delay || 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [debouncedValue, delay, value]);

  return useCallback((...v: any[]) => {
    setDebouncedValue(v);
  }, []) as T;
}
