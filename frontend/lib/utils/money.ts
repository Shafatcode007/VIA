/**
 * Money normalization utilities.
 *
 * NECESSITY: The backend historically could serialize Decimal fields as JSON
 * strings. Even with field_serializer, the frontend MUST defensively coerce
 * every monetary value before arithmetic to prevent string-concatenation
 * bugs like "82" + 40 === "8240".
 * LOGIC: All money arithmetic goes through toNumber() first.
 * EDGE-CASE: Returns 0 for null, undefined, NaN, Infinity.
 */

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function sum(values: Array<number | string | null | undefined>): number {
  return values.reduce<number>((acc, value) => acc + toNumber(value), 0)
}

export function formatTaka(value: number | string | null | undefined): string {
  const amount = toNumber(value)
  return `৳${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`
}
