import { PartialEq, isPartialEq, format } from "./internal";

declare global {
  namespace jest {
    interface Matchers<R> {
      assert(fmt_str?: string, ...fmt_args: any[]): CustomMatcherResult;
    }
  }
}

expect.extend({
  assert(expr: boolean, fmt_str?: string, ...fmt_args: any[]) {
    return {
      pass: expr,
      message: () => format(fmt_str || "assertion failed", ...fmt_args)
    };
  }
});

export function assert(expr: boolean, fmt_str?: string, ...fmt_args: any[]) {
  expect(expr).assert(fmt_str, ...fmt_args);
}

export function assert_eq<T extends PartialEq>(left: T, right: T): void;
export function assert_eq<T>(left: T, right: T): void;
export function assert_eq(left: any, right: any) {
  if (isPartialEq(left) && isPartialEq(right)) {
    expect(left.eq(right)).assert(
      `assertion failed: \`(left == right)\`
 left: \`{:?}\`,
right: \`{:?}\``,
      left,
      right
    );
  } else {
    expect(left).toEqual(right);
  }
}

export function assert_ne<T extends PartialEq>(left: T, right: T): void;
export function assert_ne<T>(left: T, right: T): void;
export function assert_ne(left: any, right: any) {
  if (isPartialEq(left) && isPartialEq(right)) {
    expect(left.ne(right)).assert(
      `assertion failed: \`(left != right)\`
 left: \`{:?}\`,
right: \`{:?}\``,
      left,
      right
    );
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
