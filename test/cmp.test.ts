import { assert, assert_eq } from "../src/macros.test";
import {
  Ordering,
  Less,
  Equal,
  Greater,
  Reverse,
  eq,
  ne,
  lt,
  le,
  ge,
  gt,
  max,
  min,
  clamp
} from "../src/cmp";
import { Option, Some, None } from "../src/std";

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  eq(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  cmp(other: Point): Ordering {
    if (this.y < other.y || (this.y === other.y && this.x < other.x)) {
      return Less;
    } else if (this.y > other.y || (this.y === other.y && this.x > other.x)) {
      return Greater;
    } else {
      return Equal;
    }
  }

  partial_cmp(other: Point): Option<Ordering> {
    return Some(this.cmp(other));
  }
}

describe("Eq", () => {
  test("eq_and_ne", () => {
    assert(eq(null, null));
    assert(eq(NaN, NaN));
    assert(eq(1, 1));
    assert(eq([1, 2], [1, 2]));
    assert(eq({ a: 1 }, { a: 1 }));
    assert(eq(new Point(1, 1), new Point(1, 1)));

    assert(ne(1, 2));
    assert(ne([1, 2], [2, 1]));
    assert(ne({ a: 1 }, { a: 2 }));
    assert(ne(new Point(1, 1), new Point(2, 2)));
  });
});

describe("Ordering", () => {
  test("get", () => {
    assert_eq(Less.get(), -1);
    assert_eq(Equal.get(), 0);
    assert_eq(Greater.get(), 1);
  });

  test("reverse", () => {
    assert_eq(Less.reverse(), Greater);
    assert_eq(Equal.reverse(), Equal);
    assert_eq(Greater.reverse(), Less);
  });

  test("then", () => {
    assert_eq(Less.then(Less), Less);
    assert_eq(Less.then(Equal), Less);
    assert_eq(Less.then(Greater), Less);
    assert_eq(Equal.then(Less), Less);
    assert_eq(Equal.then(Equal), Equal);
    assert_eq(Equal.then(Greater), Greater);
    assert_eq(Greater.then(Less), Greater);
    assert_eq(Greater.then(Equal), Greater);
    assert_eq(Greater.then(Greater), Greater);
  });

  test("then_with", () => {
    assert_eq(Less.then_with(() => Greater), Less);
    assert_eq(Equal.then_with(() => Less), Less);
    assert_eq(Equal.then_with(() => Equal), Equal);
    assert_eq(Equal.then_with(() => Greater), Greater);
    assert_eq(Greater.then_with(() => Less), Greater);
  });
});

describe("Ord", () => {
  test("partial_cmp", () => {
    let p1 = new Point(1, 1);
    let p2 = new Point(2, 2);

    assert(lt(1, 2));
    assert(lt(p1, p2));

    assert(le(1, 1));
    assert(le(1, 2));
    assert(le(p1, p2));
    assert(le(p1, new Point(1, 1)));

    assert(ge(1, 1));
    assert(ge(2, 1));
    assert(ge(p2, p1));
    assert(ge(p2, new Point(2, 2)));

    assert(gt(2, 1));
    assert(gt(p2, p1));
  });

  test("cmp", () => {
    let p1 = new Point(1, 1);
    let p2 = new Point(2, 2);
    let p3 = new Point(3, 3);

    assert_eq(max(1, 2), 2);
    assert_eq(max(p1, p2), p2);

    assert_eq(min(1, 2), 1);
    assert_eq(min(p1, p2), p1);

    assert_eq(clamp(1, 5, 10), 5);
    assert_eq(clamp(7, 5, 10), 7);
    assert_eq(clamp(15, 5, 10), 10);
    assert_eq(clamp(new Point(0, 0), p1, p2), p1);
    assert_eq(clamp(p2, p1, p3), p2);
    assert_eq(clamp(new Point(4, 4), p1, p2), p2);
  });

  test("Reverse", () => {
    let r1 = new Reverse(new Point(1, 1));
    let r2 = new Reverse(new Point(2, 2));

    assert(gt(r1, r2));

    assert(ge(r1, r2));
    assert(ge(r1, new Reverse(new Point(1, 1))));

    assert(le(r2, r1));
    assert(le(r2, new Reverse(new Point(2, 2))));

    assert(lt(r2, r1));
  });
});
