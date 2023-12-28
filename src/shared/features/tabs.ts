import { useCallback, useEffect, useState } from "react";
import browser, {
  browserTabsCreate,
  browserTabsGetCurrent,
  browserTabsQuery,
  browserTabsUpdate,
} from "@/shared/utils/browser";

export const openExtensionInTab = async () => {
  const url = browser.runtime.getURL("index.html");
  return await browserTabsCreate({ url });
};

export const extensionIsInTab = async () => {
  return Boolean(await browserTabsGetCurrent());
};

export const focusExtensionTab = async () => {
  const tab = await browserTabsGetCurrent();
  if (tab && tab?.id !== browser.tabs.TAB_ID_NONE && tab.id) {
    await browserTabsUpdate(tab.id, { active: true });
  }
};

export const useExtensionIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false);
  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInTab();
      setIsInTab(inTab);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    init();
  }, []);
  return isInTab;
};

export const useOpenExtensionInTab = () => {
  return useCallback(async () => {
    await openExtensionInTab();
    window.close();
  }, []);
};

export const getCurrentTab = async () => {
  const tabs = await browserTabsQuery({ active: true, currentWindow: true });
  return tabs[0];
};
