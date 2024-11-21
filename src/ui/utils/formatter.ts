export function nFormatter(num: number | string) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
  ];
  lookup.reverse();
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item =
    lookup.find((item) => Number(num) >= item.value) ??
    lookup[lookup.length - 1];
  const v = parseFloat((Number(num) / item.value).toFixed(8))
    .toString()
    .replace(regexp, "");

  return `${v} ${item.symbol}`;
}
