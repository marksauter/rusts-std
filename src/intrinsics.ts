import { U64_MAX, INFINITY, assert } from "./internal";

export function integer(n: number): number {
  return floor(n);
}

export function i64(n: number): number {
  return round(n);
}

export function u64(n: number): number {
  assert(n >= 0 && n <= U64_MAX);
  return floor(n);
}

export const is_nan = isNaN;

export function is_infinite(x: number): boolean {
  return abs(x) === INFINITY;
}

export function is_finite(x: number): boolean {
  return abs(x) < INFINITY;
}

export function is_normal(x: number): boolean {
  return x !== 0 && !is_infinite(x) && !is_nan(x);
}

export const abs = Math.abs;

export function minnum(x: number, y: number): number {
  if (is_nan(x)) {
    return y;
  } else if (is_nan(y)) {
    return x;
  } else {
    return x <= y ? x : y;
  }
}

export function maxnum(x: number, y: number): number {
  if (is_nan(x)) {
    return y;
  } else if (is_nan(y)) {
    return x;
  } else {
    return x <= y ? y : x;
  }
}

export const floor = Math.floor;

export const ceil = Math.ceil;

export const round = Math.round;

export function clamp_u64(n: number): number {
  let min = 0;
  let max = U64_MAX;
  if (n < min) {
    return min;
  } else if (n > max) {
    return max;
  } else {
    return n;
  }
}

export function u64_saturating_add(left: number, right: number): number {
  return clamp_u64(integer(left) + integer(right));
}

export function u64_saturating_sub(left: number, right: number): number {
  return clamp_u64(integer(left) - integer(right));
}

export function u64_saturating_mul(left: number, right: number): number {
  return clamp_u64(integer(left) * integer(right));
}

export function u64_saturating_div(left: number, right: number): number {
  return clamp_u64(integer(left) / integer(right));
}
