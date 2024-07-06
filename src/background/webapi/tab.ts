import {
  browserTabsOnUpdated,
  browserTabsOnRemoved,
  browserTabsCreate,
} from "@/shared/utils/browser";
import { EventEmitter } from "events";

export const tabEvent = new EventEmitter();

browserTabsOnUpdated((tabId: number, changeInfo: { url?: string }) => {
  if (changeInfo.url) {
    tabEvent.emit("tabUrlChanged", tabId, changeInfo.url);
  }
});

// window close will trigger this event also
browserTabsOnRemoved((tabId: number) => {
  tabEvent.emit("tabRemove", tabId);
});

export const createTab = async (url: string): Promise<number | undefined> => {
  const tab = await browserTabsCreate({
    active: true,
    url,
  });

  return tab?.id;
};

export const openIndexPage = (route = ""): Promise<number | undefined> => {
  const url = `index.html${route && `#${route}`}`;

  return createTab(url);
};

export const queryCurrentActiveTab = async function () {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs) return resolve({});
      const [activeTab] = tabs;
      const { id, title, url } = activeTab;
      const { origin, protocol } = url
        ? new URL(url)
        : { origin: null, protocol: null };

      if (!origin || origin === "null") {
        resolve({});
        return;
      }

      resolve({ id, title, origin, protocol, url });
    });
  });
};
