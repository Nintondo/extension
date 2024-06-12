class ReadyPromise {
  private _allCheck: boolean[] = [];
  private _tasks: {
    resolve(value: unknown): void;
    fn(): Promise<any>;
  }[] = [];

  constructor(count: number) {
    this._allCheck = [...Array(count)];
  }

  check = (index: number) => {
    this._allCheck[index - 1] = true;
    this._proceed();
  };

  uncheck = (index: number) => {
    this._allCheck[index - 1] = false;
  };

  private _proceed = () => {
    if (this._allCheck.some((_) => !_)) {
      return;
    }

    while (this._tasks.length) {
      const data = this._tasks.shift();
      if (!data) return;
      const { resolve, fn } = data;
      resolve(fn());
    }
  };

  call = (fn: () => Promise<void>) => {
    return new Promise((resolve) => {
      this._tasks.push({
        fn,
        resolve,
      });

      this._proceed();
    });
  };
}

export default ReadyPromise;
