/**
 * String-based decimal arithmetic for Canton amounts.
 *
 * Canton uses Numeric 10 (up to 10 decimal places). USDCx has 6 meaningful decimals.
 * ALL arithmetic is pure string manipulation — NO floating point.
 */

const AMOUNT_RE = /^\d+(\.\d+)?$/;

/**
 * Validate that a string is a valid non-negative decimal amount.
 */
export function isValidAmount(s: string): boolean {
  return AMOUNT_RE.test(s);
}

/**
 * Parse an amount string into integer and fractional digit arrays.
 * Returns [intDigits, fracDigits] where each is a number[].
 */
function parse(s: string): [number[], number[]] {
  const dot = s.indexOf(".");
  const intPart = dot === -1 ? s : s.slice(0, dot);
  const fracPart = dot === -1 ? "" : s.slice(dot + 1);
  return [
    intPart.split("").map(Number),
    fracPart.split("").map(Number),
  ];
}

/**
 * Normalise two amount strings so their fractional parts have equal length.
 * Returns [aParts, bParts, fracLen].
 */
function align(a: string, b: string): [number[], number[], number[], number[], number] {
  const [aInt, aFrac] = parse(a);
  const [bInt, bFrac] = parse(b);
  const fracLen = Math.max(aFrac.length, bFrac.length);
  while (aFrac.length < fracLen) aFrac.push(0);
  while (bFrac.length < fracLen) bFrac.push(0);
  // Also align integer parts to equal length by prepending zeros
  const intLen = Math.max(aInt.length, bInt.length);
  while (aInt.length < intLen) aInt.unshift(0);
  while (bInt.length < intLen) bInt.unshift(0);
  return [aInt, aFrac, bInt, bFrac, fracLen];
}

/**
 * Strip trailing zeros from fractional part and leading zeros from integer part.
 */
function formatResult(intDigits: number[], fracDigits: number[]): string {
  // Remove trailing zeros from fraction
  while (fracDigits.length > 0 && fracDigits[fracDigits.length - 1] === 0) {
    fracDigits.pop();
  }
  // Remove leading zeros from integer (keep at least one)
  while (intDigits.length > 1 && intDigits[0] === 0) {
    intDigits.shift();
  }
  const intStr = intDigits.join("");
  return fracDigits.length > 0 ? `${intStr}.${fracDigits.join("")}` : intStr;
}

/**
 * Compare two decimal amount strings.
 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
 */
export function compareAmounts(a: string, b: string): -1 | 0 | 1 {
  const [aInt, aFrac, bInt, bFrac] = align(a, b);

  // Compare integer parts digit by digit
  for (let i = 0; i < aInt.length; i++) {
    if (aInt[i] < bInt[i]) return -1;
    if (aInt[i] > bInt[i]) return 1;
  }

  // Compare fractional parts digit by digit
  for (let i = 0; i < aFrac.length; i++) {
    if (aFrac[i] < bFrac[i]) return -1;
    if (aFrac[i] > bFrac[i]) return 1;
  }

  return 0;
}

/**
 * Add two decimal amount strings. Returns the sum as a string.
 */
export function addAmounts(a: string, b: string): string {
  const [aInt, aFrac, bInt, bFrac, fracLen] = align(a, b);

  // Combine into single digit arrays (integer + fractional)
  const aAll = [...aInt, ...aFrac];
  const bAll = [...bInt, ...bFrac];

  const result: number[] = new Array(aAll.length).fill(0);
  let carry = 0;

  for (let i = aAll.length - 1; i >= 0; i--) {
    const sum = aAll[i] + bAll[i] + carry;
    result[i] = sum % 10;
    carry = Math.floor(sum / 10);
  }

  if (carry > 0) {
    result.unshift(carry);
  }

  // Split back into integer and fractional parts
  const intDigits = result.slice(0, result.length - fracLen);
  const fracDigits = result.slice(result.length - fracLen);

  return formatResult(
    intDigits.length === 0 ? [0] : intDigits,
    fracDigits,
  );
}

/**
 * Subtract b from a. Both must be valid amounts and a >= b.
 * Throws if a < b.
 */
export function subtractAmounts(a: string, b: string): string {
  if (compareAmounts(a, b) < 0) {
    throw new Error(`Cannot subtract: ${a} < ${b}`);
  }

  const [aInt, aFrac, bInt, bFrac, fracLen] = align(a, b);

  const aAll = [...aInt, ...aFrac];
  const bAll = [...bInt, ...bFrac];

  const result: number[] = new Array(aAll.length).fill(0);
  let borrow = 0;

  for (let i = aAll.length - 1; i >= 0; i--) {
    let diff = aAll[i] - bAll[i] - borrow;
    if (diff < 0) {
      diff += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result[i] = diff;
  }

  const intDigits = result.slice(0, result.length - fracLen);
  const fracDigits = result.slice(result.length - fracLen);

  return formatResult(
    intDigits.length === 0 ? [0] : intDigits,
    fracDigits,
  );
}

/**
 * Pad (or truncate) a decimal string to exactly N decimal places.
 * Default: 10 (Canton Numeric 10).
 */
export function toCantonAmount(s: string, decimals = 10): string {
  const dot = s.indexOf(".");
  const intPart = dot === -1 ? s : s.slice(0, dot);
  const fracPart = dot === -1 ? "" : s.slice(dot + 1);

  const padded = fracPart.padEnd(decimals, "0").slice(0, decimals);
  return `${intPart}.${padded}`;
}
