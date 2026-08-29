/**
 * Money normalization utilities for via-app.
 *
 * NECESSITY: The backend serializes `*_cents` fields as integer cents
 * (e.g. 8250 == ৳82.50) and it has historically been possible for float
 * fields to arrive as JSON strings. Arithmetic directly on raw values can
 * produce bugs like `"82" + 40 === "8240"` (string concatenation) or
 * rendering 8250 as ৳8250 instead of ৳82.50.
 * LOGIC: Every monetary value passes through toNumber() before arithmetic,
 * and cent-based fields are converted to taka before display.
 * EDGE-CASE: toNumber() returns 0 for null, undefined, NaN, and Infinity.
 */

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** Converts backend integer cents to a taka float (8250 -> 82.5). */
export function centsToTaka(cents: number | string | null | undefined): number {
  return toNumber(cents) / 100;
}

/** Formats a taka amount with ৳, 2 decimals only when fractional, thousands grouping. */
export function formatTaka(value: number | string | null | undefined): string {
  const amount = toNumber(value);
  const formatted =
    amount % 1 === 0
      ? amount.toLocaleString("en-IN")
      : amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `৳${formatted}`;
}

/** Shortcut for cent-based backend fields: cents in, formatted ৳ out. */
export function formatCents(
  cents: number | string | null | undefined
): string {
  return formatTaka(centsToTaka(cents));
}

export function sum(
  values: Array<number | string | null | undefined>
): number {
  return values.reduce<number>((acc, value) => acc + toNumber(value), 0);
}