import {
  Count,
  MockItemConfig,
  MockItemSubType,
  MockItemSubTypeMap,
  MockItemTypeMap,
  MockItemType,
} from "./models.ts";

const defaultMockItemConfig = {
  type: MockItemType.None,
  subType: MockItemSubType.None,
  count: { min: 1, max: 2 },
  enumValues: [],
};
export function parseCount(countString: string): Count {
  const counts: number[] = JSON.parse(countString);

  if (counts.length < 1) {
    throw new Error("To few count parameters");
  } else if (counts.length === 1) {
    counts.push(counts[0] + 1);
  }

  if (counts[0] >= counts[1]) {
    throw new Error("Counts must be strictly increasing");
  }

  return {
    min: counts[0],
    max: counts[1],
  };
}

export function parseMockItemConfig(rawMockItemConfig: string): MockItemConfig {
  const cleanRawMockItemConfig = rawMockItemConfig.replace(/'/g, '"');
  let parts = cleanRawMockItemConfig.split(".");

  let repeat;

  if (parts[0].startsWith("*")) {
    repeat = parseCount(parts[0].substring(1));
    parts = parts.slice(1);
  }

  let nullable;

  if (parts[0].startsWith("?")) {
    nullable = parseCount(parts[0].substring(1));
    parts = parts.slice(1);
  }

  if (parts.length === 1) {
    return Object.assign({}, defaultMockItemConfig, {
      type: getMockItemType(parts[0], rawMockItemConfig),
    });
  } else if (parts.length < 3) {
    throw new Error(
      `Mock item config: wrong syntax, config is too short: ${parts.length}`
    );
  }

  const count = parseCount(parts[2]);
  const type = getMockItemType(parts[0], rawMockItemConfig);
  const subType = getMockSubItemType(parts[1], rawMockItemConfig);

  const enumValues: any[] = [];

  if (subType === MockItemSubType.Enum) {
    if (parts.length > 3) {
      enumValues.push(...(JSON.parse(parts[3]) as any[]));
    } else {
      throw new Error(
        "If sub type is Enum, the 4th config should be the enum values (string or number) in an array"
      );
    }
  }

  return {
    type,
    subType,
    count,
    enumValues,
    repeat,
    nullable,
  };
}

function getMockItemType(key: string, rawMockItemConfig: string): MockItemType {
  const mockItemType = MockItemTypeMap.get(key);

  if (mockItemType === undefined) {
    throw new Error(`Invalid config, bad item type in: ${rawMockItemConfig}`);
  } else {
    return mockItemType;
  }
}

function getMockSubItemType(
  key: string,
  rawMockItemConfig: string
): MockItemSubType {
  const mockSubItemType = MockItemSubTypeMap.get(key);

  if (mockSubItemType === undefined) {
    throw new Error(
      `Invalid config, bad sub item type in: ${rawMockItemConfig}`
    );
  } else {
    return mockSubItemType;
  }
}
