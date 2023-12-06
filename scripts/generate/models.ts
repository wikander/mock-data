export interface MockItemConfig {
  type: MockItemType;
  subType: MockItemSubType;
  count: Count;
  enumValues: string[] | number[];
  repeat?: Count;
  nullable?: Count;
}

export type ItemType = string | number | string[] | number[] | boolean | null;

export interface Count {
  min: number;
  max: number;
}

export enum MockItemType {
  None,
  String,
  Number,
  Boolean,
}

export enum MockItemSubType {
  None,
  Words,
  Sentence,
  Name,
  Date,
  DateTime,
  Integer,
  Enum,
  Email,
  Url,
  Phone,
  Id,
  Epoch,
}

export enum MockBluePrintType {
  Object,
  Array,
  String,
  Other,
}

export type MockBluePrint =
  | Record<string, any>
  | string
  | Record<string, any>[]
  | string[];

export const MockItemTypeMap: Map<string, MockItemType> = new Map<
  string,
  MockItemType
>();

MockItemTypeMap.set("s", MockItemType.String);
MockItemTypeMap.set("n", MockItemType.Number);
MockItemTypeMap.set("b", MockItemType.Boolean);

export const MockItemSubTypeMap: Map<string, MockItemSubType> = new Map<
  string,
  MockItemSubType
>();

MockItemSubTypeMap.set("w", MockItemSubType.Words);
MockItemSubTypeMap.set("s", MockItemSubType.Sentence);
MockItemSubTypeMap.set("n", MockItemSubType.Name);
MockItemSubTypeMap.set("d", MockItemSubType.DateTime);
MockItemSubTypeMap.set("D", MockItemSubType.Date);
MockItemSubTypeMap.set("i", MockItemSubType.Integer);
MockItemSubTypeMap.set("e", MockItemSubType.Email);
MockItemSubTypeMap.set("enum", MockItemSubType.Enum);
MockItemSubTypeMap.set("www", MockItemSubType.Url);
MockItemSubTypeMap.set("p", MockItemSubType.Phone);
MockItemSubTypeMap.set("id", MockItemSubType.Id);
MockItemSubTypeMap.set("epoch", MockItemSubType.Epoch);
