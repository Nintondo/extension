export interface RuneBalance {
  amount: string;
  runeid: string;
  rune: string;
  spacedRune: string;
  symbol: string;
  divisibility: number;
}

export interface Rune {
  runeBalance: RuneBalance;
  runeGenesisLogo?: string;
}
