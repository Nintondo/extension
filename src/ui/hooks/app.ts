import { useCallback } from "react";
import { useAppState } from "../states/appState";

export const useUpdateAddressBook = () => {
  const { updateAppState, addressBook } = useAppState((v) => ({
    updateAppState: v.updateAppState,
    addressBook: v.addressBook,
  }));

  return useCallback(
    async (address?: string) => {
      if (!address) return;
      if (addressBook.length >= 6) addressBook.splice(5, 1);
      if (addressBook.includes(address.trim())) return;
      addressBook.unshift(address.trim() ?? "");
      await updateAppState({ addressBook: addressBook });
    },
    [addressBook, updateAppState]
  );
};
