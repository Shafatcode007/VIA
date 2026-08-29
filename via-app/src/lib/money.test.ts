import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toNumber,
  centsToTaka,
  formatTaka,
  formatCents,
  sum,
} from "./money.ts";

test("toNumber coerces string prices", () => {
  assert.equal(toNumber("82"), 82);
  assert.equal(toNumber("82.5"), 82.5);
  assert.equal(toNumber(40), 40);
});

test("toNumber returns 0 for null/undefined/NaN", () => {
  assert.equal(toNumber(null), 0);
  assert.equal(toNumber(undefined), 0);
  assert.equal(toNumber("abc"), 0);
});

test("centsToTaka converts backend cents to taka", () => {
  assert.equal(centsToTaka(8250), 82.5);
  assert.equal(centsToTaka("8250"), 82.5);
  assert.equal(centsToTaka(0), 0);
});

test("sum never string-concatenates", () => {
  assert.equal(sum(["82", 40, "17.5"]), 139.5);
  assert.equal(sum([]), 0);
  assert.equal(sum([null, undefined]), 0);
});

test("formatTaka renders whole and decimal amounts", () => {
  assert.equal(formatTaka(82), "৳82");
  assert.equal(formatTaka(82.5), "৳82.50");
  assert.equal(formatTaka(0), "৳0");
});

test("formatCents renders cart/order totals correctly", () => {
  assert.equal(formatCents(8250), "৳82.50");
  assert.equal(formatCents(0), "৳0");
});