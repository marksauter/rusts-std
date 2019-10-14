import { i64, integer, Option, Some, None, I64_MAX, I64_MIN, U64_MAX, abs } from "../internal";

export function approx_eq(a: number, b: number): boolean {
  return abs(a - b) <= 1.0e-6;
}

export function is_i8(a: number): boolean {
  return a >= -128 && a <= 127;
}

export function is_u8(a: number): boolean {
  return a >= 0 && a <= 255;
}

export function is_i64(a: number): boolean {
  return a >= I64_MIN && a <= I64_MAX;
}

export function is_u64(a: number): boolean {
  return a >= 0 && a <= U64_MAX;
}

export function i8_checked_add(a: number, b: number): Option<number> {
  let c = a + b;
  let overflow = !is_i8(c) || a !== c - b || b !== c - a;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function u8_checked_add(a: number, b: number): Option<number> {
  let c = a + b;
  let overflow = !is_u8(c) || a !== c - b || b !== c - a;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function checked_add(a: number, b: number): Option<number> {
  let c = a + b;
  let overflow = a !== c - b || b !== c - a;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function i64_checked_add(a: number, b: number): Option<number> {
  a = i64(a);
  b = i64(b);
  let c = a + b;
  let overflow = !is_i64(c) || a !== c - b || b !== c - a;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function u64_checked_add(a: number, b: number): Option<number> {
  a = integer(a);
  b = integer(b);
  let c = a + b;
  let overflow = !is_u64(c) || a !== c - b || b !== c - a;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function i8_checked_sub(a: number, b: number): Option<number> {
  let c = a - b;
  let overflow = !is_i8(c) || a !== c + b || b !== a - c;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function u8_checked_sub(a: number, b: number): Option<number> {
  let c = a - b;
  let overflow = !is_u8(c) || a !== c + b || b !== a - c;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function checked_sub(a: number, b: number): Option<number> {
  let c = a - b;
  let overflow = a !== c + b || b !== a - c;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function i64_checked_sub(a: number, b: number): Option<number> {
  a = i64(a);
  b = i64(b);
  let c = a - b;
  let overflow = !is_i64(c) || a !== c + b || b !== a - c;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function u64_checked_sub(a: number, b: number): Option<number> {
  a = integer(a);
  b = integer(b);
  let c = a - b;
  let overflow = !is_u64(c) || a !== c + b || b !== a - c;
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function checked_mul(a: number, b: number): Option<number> {
  let c = a * b;
  let overflow = c !== 0 && (!approx_eq(a, c / b) || !approx_eq(b, c / a));
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function i8_checked_mul(a: number, b: number): Option<number> {
  a = integer(a);
  b = integer(b);
  let c = a * b;
  let overflow = c !== 0 && (!is_i8(c) || !approx_eq(a, c / b) || !approx_eq(b, c / a));
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function u8_checked_mul(a: number, b: number): Option<number> {
  a = integer(a);
  b = integer(b);
  let c = a * b;
  let overflow = c !== 0 && (!is_u8(c) || !approx_eq(a, c / b) || !approx_eq(b, c / a));
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function i64_checked_mul(a: number, b: number): Option<number> {
  a = i64(a);
  b = i64(b);
  let c = a * b;
  let overflow = c !== 0 && (!is_i64(c) || !approx_eq(a, c / b) || !approx_eq(b, c / a));
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function u64_checked_mul(a: number, b: number): Option<number> {
  a = integer(a);
  b = integer(b);
  let c = a * b;
  let overflow = c !== 0 && (!is_u64(c) || !approx_eq(a, c / b) || !approx_eq(b, c / a));
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function checked_div(a: number, b: number): Option<number> {
  if (b === 0) {
    return None();
  }
  let c = a / b;
  let overflow = c !== 0 && (!approx_eq(a, c * b) || !approx_eq(b, a / c));
  if (overflow) {
    return None();
  } else {
    return Some(c);
  }
}

export function i8_checked_div(a: number, b: number): Option<number> {
  if (b === 0) {
    return None();
  }
  a = integer(a);
  b = integer(b);
  let c = a / b;
  let overflow = c !== 0 && (!is_i8(c) || !approx_eq(a, c * b) || !approx_eq(b, a / c));
  if (overflow) {
    return None();
  } else {
    return Some(integer(c));
  }
}

export function u8_checked_div(a: number, b: number): Option<number> {
  if (b === 0) {
    return None();
  }
  a = integer(a);
  b = integer(b);
  let c = a / b;
  let overflow = c !== 0 && (!is_u8(c) || !approx_eq(a, c * b) || !approx_eq(b, a / c));
  if (overflow) {
    return None();
  } else {
    return Some(integer(c));
  }
}

export function i64_checked_div(a: number, b: number): Option<number> {
  if (b === 0) {
    return None();
  }
  a = i64(a);
  b = i64(b);
  let c = a / b;
  let overflow = c !== 0 && (!is_i64(c) || !approx_eq(a, c * b) || !approx_eq(b, a / c));
  if (overflow) {
    return None();
  } else {
    return Some(integer(c));
  }
}

export function u64_checked_div(a: number, b: number): Option<number> {
  if (b === 0) {
    return None();
  }
  a = integer(a);
  b = integer(b);
  let c = a / b;
  let overflow = c !== 0 && (!is_u64(c) || !approx_eq(a, c * b) || !approx_eq(b, a / c));
  if (overflow) {
    return None();
  } else {
    return Some(integer(c));
  }
}
