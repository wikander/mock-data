import {
  randomInt,
  randomPick,
  randomSample,
} from "https://deno.land/x/vegas@v1.3.0/mod.ts";

import { EMAIL_DOMAINS, TOP_DOMAINS } from "./domains.ts";
import { Count, ItemType } from "./models.ts";
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from "./names.ts";
import { PHONE_PREFIX } from "./phone-prefix.ts";
import { arrayOf, capitalize, repeatFunc } from "./utils.ts";
import { WORDS } from "./words.ts";

export { randomPick };

export function generateEnumValues(count: Count, enumValues: any[]): ItemType {
  const generated = randomSample(enumValues, randomInt(count.min, count.max));
  if (count.min === 1 && count.max === 2) {
    return generated[0];
  } else {
    return generated;
  }
}

export function generateBoolean(): boolean {
  return randomPick([true, false]);
}

export function generatePhoneNumber(count: Count): string {
  return randomPick(PHONE_PREFIX) + generateNumber(count);
}

export function generateEmpty(count?: Count): boolean {
  if (count === undefined) {
    return false;
  }

  const probabilityOfEmpty = randomInt(count.min, count.max);
  const answer = randomInt(1, 101);

  return answer < probabilityOfEmpty ? true : false;
}

export function generateNumber(count: Count): number {
  const numberOfDigits = randomInt(count.min, count.max);

  const first = randomPick([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  let rest: number[] = [];
  if (numberOfDigits > 1) {
    rest = arrayOf(numberOfDigits - 1).map(() =>
      randomPick([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    );
  }

  return Number.parseInt([first, ...rest].join(""));
}

export function generateNumberAsString(count: Count): string {
  return "" + generateNumber(count);
}

function generateJsDate(count: Count): Date {
  const now = new Date();
  const millisNow = now.getTime();
  const day = 86400000;

  return new Date(
    millisNow - randomInt(count.min, count.max) * day - randomInt(1, day)
  );
}

export function generateMockDate(count: Count): string {
  const d = generateJsDate(count);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.toISOString();
}

export function generateEpoch(count: Count): number {
  return generateJsDate(count).getTime();
}

export function generateMockDateTime(count: Count): string {
  return generateJsDate(count).toISOString();
}

export function generateMockName(count: Count): string {
  if (randomPick([true, false])) {
    return `${randomSample(
      [...MALE_NAMES],
      randomInt(count.min, count.max)
    ).join(" ")} ${randomPick(SURNAMES)}`;
  } else {
    return `${randomSample(
      [...FEMALE_NAMES],
      randomInt(count.min, count.max)
    ).join(" ")} ${randomPick(SURNAMES)}`;
  }
}

export function generateMockWords(count: Count): string {
  const parts = randomSample(WORDS, randomInt(count.min, count.max));
  return capitalize(parts.join(" "));
}

export function generateMockSentence(count: Count): string {
  return repeatFunc(count, createSentence, { min: 3, max: 5 }).join(" ");
}

export function generateId(count: Count): string {
  return repeatFunc(count, () => crypto.randomUUID()).join(",");
}

function createSentence(count: Count): string {
  return generateMockWords(count) + ".";
}

export function generateMockEmail(count: Count): string {
  return `${generateMockName(count)
    .toLowerCase()
    .replace(/ /g, ".")}@${randomPick(EMAIL_DOMAINS)}`;
}

export function generateMockUrl(count: Count): string {
  return `https://www.${generateMockWords(count)
    .toLowerCase()
    .replace(/ /g, "-")}${randomPick(TOP_DOMAINS)}`;
}
