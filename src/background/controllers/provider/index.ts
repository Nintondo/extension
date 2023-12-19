import { ethErrors } from "eth-rpc-errors";
import * as internalMethod from "./internalMethod";
import rpcFlow from "./rpcFlow";
import { sessionService, storageService } from "@/background/services";
import { tabEvent } from "@/background/webapi";

tabEvent.on("tabRemove", (id) => {
  sessionService.deleteSession(id);
});

export default async (req) => {
  const {
    data: { method },
  } = req;

  if (internalMethod[method]) {
    return internalMethod[method](req);
  }

  const hasVault = (await storageService.getLocalValues()).enc !== undefined;
  if (!hasVault) {
    throw ethErrors.provider.userRejectedRequest({
      message: "wallet must has at least one account",
    });
  }
  return rpcFlow(req);
};
