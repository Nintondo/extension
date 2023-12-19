import { storageService } from "@/background/services";

export const tabCheckin = ({
  data: {
    params: { origin, name, icon },
  },
  session,
}) => {
  session.origin = origin;
  session.icon = icon;
  session.name = name;
};

export const getProviderState = async (req) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    session: { origin },
  } = req;

  const isUnlocked = storageService.appState.isUnlocked;
  const accounts: string[] = [];
  if (isUnlocked) {
    const currentAccount = await storageService.currentAccount;
    if (currentAccount) {
      accounts.push(currentAccount.address);
    }
  }
  return {
    network: "BELLS",
    isUnlocked,
    accounts,
  };
};

export const keepAlive = () => {
  return "ACK_KEEP_ALIVE_MESSAGE";
};
