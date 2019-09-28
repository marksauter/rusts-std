import { assert, assert_eq, assert_ne, should_panic } from "../src/macros.test";
import * as macros from "../src/macros";

test("assert", () => {
  macros.assert(true);
  assert(true);
});

test("assert_panic", () => {
  should_panic(() => {
    macros.assert(false);
  });
});

test("debug_assert", () => {
  process.env.DEBUG = "*";
  macros.debug_assert(true);
  process.env.DEBUG = "";
  assert(true);
});

test("debug_assert_panic", () => {
  process.env.DEBUG = "*";
  should_panic(() => {
    macros.debug_assert(false);
  });
  process.env.DEBUG = "";
});

class NumberEqualator {
  a: number;

  constructor(a: number) {
    this.a = a;
  }

  eq(other: NumberEqualator): boolean {
    return this.a === other.a;
  }
}

test("assert_eq", () => {
  macros.assert_eq(1, 1);
  macros.assert_eq(new NumberEqualator(1), new NumberEqualator(1));
  assert(true);
});

test("assert_eq_panic", () => {
  should_panic(() => {
    macros.assert_eq(1, 2);
  });
  should_panic(() => {
    macros.assert_eq(new NumberEqualator(1), new NumberEqualator(2));
  });
});

test("assert_ne", () => {
  macros.assert_ne(1, 2);
  macros.assert_ne(new NumberEqualator(1), new NumberEqualator(2));
  assert(true);
});

test("assert_ne_panic", () => {
  should_panic(() => {
    macros.assert_ne(1, 1);
  });
  should_panic(() => {
    macros.assert_ne(new NumberEqualator(1), new NumberEqualator(1));
  });
});

test("debug_assert_eq", () => {
  process.env.DEBUG = "*";
  macros.debug_assert_eq(1, 1);
  macros.debug_assert_eq(new NumberEqualator(1), new NumberEqualator(1));
  process.env.DEBUG = "";
  assert(true);
});

test("debug_assert_eq_panic", () => {
  process.env.DEBUG = "*";
  should_panic(() => {
    macros.debug_assert_eq(1, 2);
  });
  should_panic(() => {
    macros.debug_assert_eq(new NumberEqualator(1), new NumberEqualator(2));
  });
  process.env.DEBUG = "";
});

test("debug_assert_ne", () => {
  process.env.DEBUG = "*";
  macros.debug_assert_ne(1, 2);
  macros.debug_assert_ne(new NumberEqualator(1), new NumberEqualator(2));
  process.env.DEBUG = "";
  assert(true);
});

test("debug_assert_ne_panic", () => {
  process.env.DEBUG = "*";
  should_panic(() => {
    macros.debug_assert_ne(1, 1);
  });
  should_panic(() => {
    macros.debug_assert_ne(new NumberEqualator(1), new NumberEqualator(1));
  });
  process.env.DEBUG = "";
});
