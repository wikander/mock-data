import * as path from "https://deno.land/std@0.100.0/path/mod.ts";

import { parseMockItemConfig } from "./config.ts";
import { MockBluePrintType, MockItemConfig, MockItemType } from "./models.ts";
import { capitalize, getMockBluePrintType } from "./utils.ts";

const INDENT = "  ";

const files = Deno.args;
for (let file of files) {
  const fileContent = await Deno.readTextFile(file);
  const mockBlueprint = JSON.parse(fileContent);

  const filename = path.basename(file);

  const modelName = filename.replace(".blueprint.json", "");

  console.log(toTypescriptModel(startGenerateModel(mockBlueprint, modelName)));
}

function toTypescriptModel(model: Model): string {
  const singularName = model.name.map((n: Name) => n.name).join();
  let pluralName = null;

  if (model.repeating) {
    pluralName = singularName + model.name[model.name.length - 1].ending;
  }

  let typescriptModel = `${
    pluralName ? `type ${pluralName} = ${singularName}[];\n\n` : ""
  }interface ${singularName} {`;

  const typescriptProps: string[] = [];
  for (let key of Object.keys(model.props)) {
    if (isModel(model.props[key])) {
      throw new Error("NIY");
    } else {
      typescriptProps.push(toTypescriptProp(key, model.props[key] as PropConf));
    }
  }

  typescriptModel += `\n${typescriptProps.join(",\n")}\n}`;

  return typescriptModel;
}

function toTypescriptProp(prop: string, propConf: PropConf): string {
  return `${INDENT}${prop}${
    propConf.nullable ? "?" : ""
  }: ${mapToTypescriptTypes(propConf.type)}${propConf.repeating ? "[]" : ""}`;
}

function mapToTypescriptTypes(type: MockItemType): string {
  switch (type) {
    case MockItemType.String:
      return "string";
    case MockItemType.Number:
      return "number";
    case MockItemType.Boolean:
      return "boolean";
    default:
      return "any";
  }
}

function startGenerateModel(mockBlueprint: any, modelName: string): Model {
  const type = getMockBluePrintType(mockBlueprint);

  if (type === MockBluePrintType.Object) {
    return generateObjectModel(mockBlueprint, [{ name: modelName }]);
  } else {
    throw new RangeError("Root blueprint must be an pbject");
  }
}

function generateModel(mockBlueprint: any, names: Name[]): Model | PropConf {
  switch (getMockBluePrintType(mockBlueprint)) {
    case MockBluePrintType.Object:
      return generateObjectModel(mockBlueprint, names);
    case MockBluePrintType.String:
      return generateItemModel(mockBlueprint as string);
    case MockBluePrintType.Array:
      throw new Error();
    default:
      throw new Error();
  }
}

function depluralizeLast(names: Name[]): void {
  const last = names[names.length - 1];
  const name = last.name;
  if (name.endsWith("es")) {
    last.name = last.name.substring(0, last.name.length - 2) + "(e)";
    last.ending = "s";
  } else if (name.endsWith("s")) {
    last.name = last.name.substring(0, last.name.length - 1);
    last.ending = "s";
  }
}

function generateObjectModel(mockBlueprint: any, names: Name[]): Model {
  let repeating = false;

  if (mockBlueprint.hasOwnProperty("__repeat")) {
    repeating = true;
    depluralizeLast(names);
  }

  const model: Model = {
    name: names.map((name: Name) => {
      name.name = capitalize(name.name);
      return name;
    }),
    props: {},
    repeating,
  };
  for (const key of Object.keys(mockBlueprint)) {
    if (!key.startsWith("__")) {
      model.props[key] = generateModel(mockBlueprint[key], [
        ...names,
        { name: key },
      ]);
    }
  }

  return model;
}

function generateItemModel(mockBlueprint: string): PropConf {
  const mockItemConfig = parseMockItemConfig(mockBlueprint) as MockItemConfig;
  return {
    type: mockItemConfig.type,
    repeating: !!mockItemConfig.repeat,
    nullable: !!mockItemConfig.nullable,
  };
}

interface Model {
  name: Name[];
  repeating: boolean;
  props: Record<string, PropConf | Model>;
}

interface PropConf {
  type: MockItemType;
  repeating: boolean;
  nullable: boolean;
}

interface Name {
  name: string;
  ending?: string;
}

function isModel(toBeDetermined: Model | PropConf): toBeDetermined is Model {
  if ((toBeDetermined as Model).name) {
    return true;
  }
  return false;
}
