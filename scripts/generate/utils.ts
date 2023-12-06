import { randomInt } from "https://deno.land/x/vegas@v1.2.1/mod.ts";
import { Count, MockBluePrint, MockBluePrintType } from "./models.ts";

export function arrayOf(count: number): null[] {
  return new Array(count).fill(null);
}

export function repeatFunc(
  count: Count | undefined,
  func: (...args: any[]) => any,
  ...args: any[]
): any[] | any {
  if (count) {
    const rep = arrayOf(randomInt(count.min, count.max));
    return rep.map(() => func(...args));
  } else {
    return func(...args);
  }
}

export function getMockBluePrintType(
  mockBluePrint: MockBluePrint
): MockBluePrintType {
  let mockBluePrintType = MockBluePrintType.Other;

  switch (typeof mockBluePrint) {
    case "object":
      mockBluePrintType = MockBluePrintType.Object;
      break;
    case "string":
      mockBluePrintType = MockBluePrintType.String;
      break;
    default:
      mockBluePrintType = MockBluePrintType.Other;
      break;
  }

  if (
    mockBluePrintType === MockBluePrintType.Object &&
    Array.isArray(mockBluePrint)
  ) {
    if (mockBluePrint.length > 0) {
      mockBluePrintType = MockBluePrintType.Array;
    } else {
      mockBluePrintType = MockBluePrintType.Other;
    }
  }

  if (
    mockBluePrintType === MockBluePrintType.Object &&
    mockBluePrint === null
  ) {
    mockBluePrintType = MockBluePrintType.Other;
  }
  return mockBluePrintType;
}

export function capitalize(str: string): string {
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
