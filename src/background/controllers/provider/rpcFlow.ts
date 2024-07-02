import { notificationService, storageService } from "@/background/services";
import PromiseFlow, { underline2Camelcase } from "@/background/utils";
import { EVENTS } from "@/shared/constant";
import eventBus from "@/shared/eventBus";
import { ethErrors } from "eth-rpc-errors";
import providerController from "./controller";
import { permissionService } from "@/background/services";

const isSignApproval = (type: string) => {
  const SIGN_APPROVALS = [
    "SignText",
    "signPsbt",
    "SignAllPsbtInputs",
    "InscribeTransfer",
    "multiPsbtSign",
    "switchNetwork",
  ];
  return SIGN_APPROVALS.includes(type);
};

const flow = new PromiseFlow();
const flowContext = flow
  .use(async (ctx, next) => {
    const {
      data: { method },
    } = ctx.request;
    ctx.mapMethod = underline2Camelcase(method);

    if (!providerController[ctx.mapMethod as keyof typeof providerController]) {
      throw ethErrors.rpc.methodNotFound({
        message: `method [${method}] doesn't has corresponding handler`,
        data: ctx.request.data,
      });
    }

    return next();
  })
  .use(async (ctx, next) => {
    const { mapMethod } = ctx;
    if (
      !Reflect.getMetadata("SAFE", providerController, mapMethod) &&
      !Reflect.getMetadata("CONNECTED", providerController, mapMethod)
    ) {
      if (!storageService.appState.isUnlocked) {
        ctx.request.requestedApproval = true;
        await notificationService.requestApproval({ lock: true });
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    const { mapMethod } = ctx;
    if (Reflect.getMetadata("CONNECTED", providerController, mapMethod)) {
      if (!permissionService.siteIsConnected(ctx.request.session.origin)) {
        throw ethErrors.provider.disconnected();
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check connect
    const {
      request: {
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    if (
      !Reflect.getMetadata("SAFE", providerController, mapMethod) &&
      !Reflect.getMetadata("CONNECTED", providerController, mapMethod)
    ) {
      if (!permissionService.siteIsConnected(origin)) {
        ctx.request.requestedApproval = true;
        await notificationService.requestApproval(
          {
            params: {
              method: "connect",
              data: {},
              session: { origin, name, icon },
            },
          },
          { route: "/provider/connect" }
        );
        permissionService.addConnectedSite(origin, name, icon);
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check need approval
    const {
      request: {
        data: { params, method },
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    const [approvalType, condition = () => {}] =
      Reflect.getMetadata("APPROVAL", providerController, mapMethod) || [];

    if (approvalType && (!condition || !condition(ctx.request))) {
      ctx.request.requestedApproval = true;
      // eslint-disable-next-line
      ctx.approvalRes = await notificationService.requestApproval(
        {
          approvalComponent: approvalType,
          params: {
            method,
            data: params,
            session: { origin, name, icon },
          },
          origin,
        },
        { route: `/provider/${method}` }
      );
    }
    return next();
  })
  .use(async (ctx) => {
    const { approvalRes, mapMethod, request } = ctx;
    // process request
    const [approvalType] =
      Reflect.getMetadata("APPROVAL", providerController, mapMethod) || [];

    const { uiRequestComponent, ...rest } = approvalRes || {};
    const {
      session: { origin },
    } = request;
    const requestDefer = Promise.resolve(
      providerController[mapMethod as keyof typeof providerController]({
        ...request,
        approvalRes,
      })
    );

    requestDefer
      .then((result) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: true,
              data: result,
            },
          });
        }
        return result;
      })
      .catch((e: any) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: false,
              errorMsg: JSON.stringify(e),
            },
          });
        }
      });
    async function requestApprovalLoop({ uiRequestComponent, ...rest }: any) {
      ctx.request.requestedApproval = true;
      const res = await notificationService.requestApproval({
        approvalComponent: uiRequestComponent,
        params: rest,
        origin,
        approvalType,
      });
      if (res.uiRequestComponent) {
        return await requestApprovalLoop(res);
      } else {
        return res;
      }
    }
    if (uiRequestComponent) {
      ctx.request.requestedApproval = true;
      return await requestApprovalLoop({ uiRequestComponent, ...rest });
    }

    return requestDefer;
  })
  .callback();

export default (request: any) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.requestedApproval) {
      flow.requestedApproval = false;
      notificationService.unLock();
    }
  });
};
