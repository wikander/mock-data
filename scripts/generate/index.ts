import * as path from "https://deno.land/std@0.100.0/path/mod.ts";

import { parseCount, parseMockItemConfig } from "./config.ts";
import {
  generateEnumValues,
  generateMockDate,
  generateMockEmail,
  generateMockName,
  generateMockSentence,
  generateMockUrl,
  generateMockWords,
  generateNumber,
  generateBoolean,
  generatePhoneNumber,
  generateEmpty,
  generateId,
  randomPick,
  generateNumberAsString,
  generateMockDateTime,
  generateEpoch,
} from "./generate.ts";

import {
  Count,
  ItemType,
  MockItemSubType,
  MockItemType,
  MockItemConfig,
  MockBluePrint,
  MockBluePrintType,
} from "./models.ts";

import { repeatFunc, getMockBluePrintType } from "./utils.ts";

const files = Deno.args;
for (let file of files) {
  const fileExt = path.extname(file);
  if (fileExt === ".json") {
    const filename = path.basename(file);
    const filepath = path.dirname(file);

    const newFilename = filename.replace(".blueprint.json", ".json");
    let output = "file";

    if (filename.endsWith(".stdout.json")) {
      output = "stdout";
      file = file.replace(".stdout.json", ".json");
    } else {
      console.info("Parsing input from ", path.join(filepath, filename));
    }

    const fileContent = await Deno.readTextFile(file);
    const mockBlueprint = JSON.parse(fileContent);

    const mockData = generateMockJson(mockBlueprint);

    if (output === "file") {
      await Deno.writeTextFile(
        path.join(filepath, newFilename),
        JSON.stringify(mockData, null, 2)
      );
      console.info("Wrote output to", path.join(filepath, newFilename));
    } else {
      console.log(JSON.stringify(mockData, null, 2));
    }
  } else {
    console.warn(`${file} is ignored, file extension must be json.`);
  }
}

function parentOrChild(parent: any, key?: string): any {
  let child: any = undefined;
  if (key !== undefined) {
    child = parent[key];
  }

  // if (typeof child === "object") {
  //   return child;
  // } else {
  //   return parent;
  // }
  return child ?? parent;
}

function generateMockJson(
  mockBluePrint: MockBluePrint,
  mockBluePrintKey?: string
): Record<string, any> | string | number | boolean | null {
  const mockBluePrintToUse = parentOrChild(mockBluePrint, mockBluePrintKey);
  console.log({ mockBluePrint, mockBluePrintKey, mockBluePrintToUse });
  switch (getMockBluePrintType(mockBluePrintToUse)) {
    case MockBluePrintType.Object:
      return generateMockObject(mockBluePrint, mockBluePrintKey);
    case MockBluePrintType.String:
      return generateMockItem(mockBluePrintToUse as string);
    case MockBluePrintType.Array:
      return generateMockJson(randomPick(mockBluePrintToUse as any[]));
    default:
      return mockBluePrint;
  }
}

function generateMockObject(
  mockBluePrint: any,
  mockBluePrintKey?: string
): Record<string, any> | null {
  let mockBluePrintToUse = JSON.parse(JSON.stringify(mockBluePrint));

  if (mockBluePrintKey !== undefined) {
    const recursiveCount = Number.parseInt(
      mockBluePrintToUse[mockBluePrintKey].__recursive,
      10
    );
    if (!Number.isNaN(recursiveCount)) {
      if (recursiveCount > 0) {
        const recursiveBluePrint = JSON.parse(JSON.stringify(mockBluePrint));
        recursiveBluePrint[mockBluePrintKey].__recursive = recursiveCount - 1;

        if (recursiveBluePrint[mockBluePrintKey].__repeat) {
          recursiveBluePrint.__repeat =
            recursiveBluePrint[mockBluePrintKey].__repeat;
        } else {
          delete recursiveBluePrint.__repeat;
        }

        return generateMockObject(recursiveBluePrint);
      } else {
        return mockBluePrintToUse[mockBluePrintKey].__repeat !== undefined
          ? []
          : null;
      }
    } else {
      mockBluePrintToUse = mockBluePrintToUse[mockBluePrintKey];
    }
  }

  if (mockBluePrintToUse.__repeat) {
    const repeat: Count = parseCount(mockBluePrintToUse.__repeat);

    delete mockBluePrintToUse.__repeat;

    return repeatFunc(
      repeat,
      generateMockObject,
      mockBluePrintToUse,
      mockBluePrintKey
    );
  } else {
    let mockObject: Record<string, any> = {};
    for (const key of Object.keys(mockBluePrintToUse)) {
      if (!key.startsWith("__comment")) {
        const mockJson = generateMockJson(mockBluePrintToUse, key);

        if (key.startsWith("<-")) {
          if (typeof mockJson === "object" && !Array.isArray(mockJson)) {
            mockObject = Object.assign({}, mockObject, mockJson);
          } else {
            throw new Error(
              "Merge with <- syntax only possible for nested objects."
            );
          }
        } else if (mockJson !== null) {
          mockObject[key] = mockJson;
        }
      }
    }

    return mockObject;
  }
}

function generateMockItem(mockBluePrint: string): ItemType {
  const mockItemConfig = parseMockItemConfig(mockBluePrint) as MockItemConfig;

  if (generateEmpty(mockItemConfig.nullable)) {
    return null;
  }

  switch (mockItemConfig.type) {
    case MockItemType.String:
      switch (mockItemConfig.subType) {
        case MockItemSubType.Words:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockWords,
            mockItemConfig.count
          );
        case MockItemSubType.Sentence:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockSentence,
            mockItemConfig.count
          );
        case MockItemSubType.Name:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockName,
            mockItemConfig.count
          );
        case MockItemSubType.DateTime:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockDateTime,
            mockItemConfig.count
          );
        case MockItemSubType.Date:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockDate,
            mockItemConfig.count
          );
        case MockItemSubType.Email:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockEmail,
            mockItemConfig.count
          );
        case MockItemSubType.Url:
          return repeatFunc(
            mockItemConfig.repeat,
            generateMockUrl,
            mockItemConfig.count
          );
        case MockItemSubType.Enum:
          return repeatFunc(
            mockItemConfig.repeat,
            generateEnumValues,
            mockItemConfig.count,
            mockItemConfig.enumValues
          );
        case MockItemSubType.Integer:
          return repeatFunc(
            mockItemConfig.repeat,
            generateNumberAsString,
            mockItemConfig.count
          );
        case MockItemSubType.Phone:
          return repeatFunc(
            mockItemConfig.repeat,
            generatePhoneNumber,
            mockItemConfig.count
          );
        case MockItemSubType.Id:
          return repeatFunc(
            mockItemConfig.repeat,
            generateId,
            mockItemConfig.count
          );
        default:
          throw new Error(
            `Should never happens. Config: ${JSON.stringify(mockItemConfig)}`
          );
      }
    case MockItemType.Number:
      switch (mockItemConfig.subType) {
        case MockItemSubType.Integer:
          return repeatFunc(
            mockItemConfig.repeat,
            generateNumber,
            mockItemConfig.count
          );
        case MockItemSubType.Enum:
          return repeatFunc(
            mockItemConfig.repeat,
            generateEnumValues,
            mockItemConfig.count,
            mockItemConfig.enumValues
          );
        case MockItemSubType.Epoch:
          return repeatFunc(
            mockItemConfig.repeat,
            generateEpoch,
            mockItemConfig.count
          );
        default:
          throw new Error("Should never happens");
      }
    case MockItemType.Boolean:
      return generateBoolean();
    default:
      throw new Error("Should never happens");
  }
}
