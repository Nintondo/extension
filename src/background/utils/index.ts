import compose from "koa-compose";

export const underline2Camelcase = (str: string) => {
  return str.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
};

export const wait = (fn: () => void, ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve(true);
    }, ms);
  });
};

export default class PromiseFlow {
  private _tasks: compose.Middleware<any>[] = [];
  _context: any = {};
  requestedApproval = false;

  use(fn: compose.Middleware<any>): PromiseFlow {
    if (typeof fn !== "function") {
      throw new Error("promise need function to handle");
    }
    this._tasks.push(fn);

    return this;
  }

  callback() {
    return compose(this._tasks);
  }
}
