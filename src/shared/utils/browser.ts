import type { StorageInterface } from "@/background/services/storage/types";
import browser from "webextension-polyfill";

export async function browserWindowsGetCurrent(params?: any) {
  return await browser.windows.getCurrent(params);
}

export async function browserWindowsCreate(
  params?: chrome.windows.CreateData
): Promise<chrome.windows.Window> {
  return browser.windows.create(params as any) as any;
}

export async function browserWindowsUpdate(
  windowId: number,
  updateInfo: browser.Windows.UpdateUpdateInfoType
) {
  return await browser.windows.update(windowId, updateInfo);
}

export async function browserWindowsRemove(windowId: number) {
  return await browser.windows.remove(windowId);
}

export async function browserStorageLocalGet<T>(val: any): Promise<T> {
  return (await browser.storage.local.get(val)) as T;
}

export async function browserStorageLocalSet(val: StorageInterface) {
  return await browser.storage.local.set(
    val as unknown as Record<string, unknown>
  );
}

export async function browserTabsGetCurrent() {
  return await browser.tabs.getCurrent();
}

export async function browserTabsQuery(params: any) {
  return await browser.tabs.query(params);
}

export async function browserTabsCreate(params: chrome.tabs.CreateProperties) {
  return await browser.tabs.create(params);
}

export async function browserTabsUpdate(tabId: number, params: any) {
  return await browser.tabs.update(tabId, params);
}

export function browserWindowsOnFocusChanged(listener: any) {
  if (browser.windows && browser.windows.onFocusChanged) {
    browser.windows.onFocusChanged.addListener(listener);
  }
}

export function browserWindowsOnRemoved(listener: any) {
  if (browser.windows && browser.windows.onFocusChanged) {
    browser.windows.onRemoved.addListener(listener);
  }
}

export function browserTabsOnUpdated(listener: any) {
  browser.tabs.onUpdated.addListener(listener);
}

export function browserTabsOnRemoved(listener: any) {
  browser.tabs.onRemoved.addListener(listener);
}

export function browserRuntimeOnConnect(listener: any) {
  browser.runtime.onConnect.addListener(listener);
}

export function browserRuntimeOnInstalled(listener: any) {
  browser.runtime.onInstalled.addListener(listener);
}

export function browserRuntimeConnect(connectInfo?: any) {
  return browser.runtime.connect(browser.runtime.id, connectInfo);
}

export default browser;
