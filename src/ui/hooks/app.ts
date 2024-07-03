import { useAppState } from "../states/appState";
import { ss } from "../utils";

export const useUpdateAddressBook = () => {
  const { updateAppState, addressBook } = useAppState(
    ss(["updateAppState", "addressBook"])
  );

  return async (address?: string) => {
    if (!address) return;
    if (addressBook.length >= 6) addressBook.splice(5, 1);
    if (addressBook.includes(address.trim())) return;
    addressBook.unshift(address.trim() ?? "");
    await updateAppState({ addressBook: addressBook }, true);
  };
};
