import { storageService } from "@/background/services";

export const getProviderState = async () => {
  const isUnlocked = storageService.appState.isUnlocked;
  const accounts: string[] = [];
  if (isUnlocked) {
    const address = storageService.currentAccount?.address;
    if (address) {
      accounts.push(address);
    }
  }
  return {
    network: "NINTONDO",
    isUnlocked,
    accounts,
  };
};

export const keepAlive = () => {
  return "ACK_KEEP_ALIVE_MESSAGE";
};
