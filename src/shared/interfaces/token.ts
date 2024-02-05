export interface IToken {
  data: ITokenData;
  inscription_id: string;
  content_type: string;
  content_length: number;
  outpoint: string;
  owner: string;
  number: number;
}

export interface ITokenData {
  p: string;
  op: string;
  tick: string;
  max?: number;
  lim?: number;
  amt?: number;
}

export const fakeTokens: IToken[] = [
  {
    data: { p: "p1", op: "op1", tick: "tick1", max: 100, lim: 10, amt: 50 },
    inscription_id: "id123",
    content_type: "type1",
    content_length: 150,
    outpoint: "outpoint1",
    owner: "owner1",
    number: 1,
  },
  {
    data: { p: "p2", op: "op2", tick: "tick2", max: 200, lim: 20, amt: 100 },
    inscription_id: "id456",
    content_type: "type2",
    content_length: 250,
    outpoint: "outpoint2",
    owner: "owner2",
    number: 2,
  },
  {
    data: { p: "p3", op: "op3", tick: "tick3" },
    inscription_id: "id789",
    content_type: "type3",
    content_length: 350,
    outpoint: "outpoint3",
    owner: "owner3",
    number: 3,
  },
  {
    data: { p: "p4", op: "op4", tick: "tick4", max: 400, lim: 40, amt: 200 },
    inscription_id: "id101",
    content_type: "type4",
    content_length: 450,
    outpoint: "outpoint4",
    owner: "owner4",
    number: 4,
  },
  {
    data: { p: "p5", op: "op5", tick: "tick5", max: 500, lim: 50, amt: 250 },
    inscription_id: "id202",
    content_type: "type5",
    content_length: 550,
    outpoint: "outpoint5",
    owner: "owner5",
    number: 5,
  },
];
