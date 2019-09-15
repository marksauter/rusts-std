import { isPartialEq } from "./cmp";

export function assert(expr: boolean) {
  expect(expr).toBe(true);
}

export function assert_eq(left: any, right: any) {
  if (isPartialEq(left)) {
    expect(left.eq(right)).toBe(true);
  } else {
    expect(left).toEqual(right);
  }
}

export function assert_ne(left: any, right: any) {
  if (isPartialEq(left)) {
    expect(left.eq(right)).toBe(false);
  } else {
    expect(left).not.toEqual(right);
  }
}

export function should_panic(f: Function, error?: Error) {
  if (error) {
    expect(f).toThrowError(error);
  } else {
    expect(f).toThrow();
  }
}

test("assert", () => {
  assert(true);
});

class NumberEqualator {
  a: { b: { c: number } };

  constructor(c: number) {
    this.a = { b: { c } };
  }

  eq(other: NumberEqualator): boolean {
    return this.a.b.c === other.a.b.c;
  }
}

test("assert_eq", () => {
  assert_eq(1, 1);
  assert_eq(new NumberEqualator(1), new NumberEqualator(1));
});

test("assert_ne", () => {
  assert_ne(1, 2);
  assert_ne(new NumberEqualator(1), new NumberEqualator(2));
});

test("should_panic", () => {
  let f = () => {
    throw new Error("panic!");
  };
  should_panic(f);
});
