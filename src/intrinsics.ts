import { U64_MAX, assert } from "./internal";

export function integer(n: number): number {
  return Math.floor(n);
}

export function i64(n: number): number {
  return Math.round(n);
}

export function u64(n: number): number {
  assert(n >= 0 && n <= U64_MAX);
  return Math.floor(n);
}

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
