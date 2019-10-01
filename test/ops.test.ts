import { assert, assert_eq } from "../src/macros.test";
import { range, range_from, range_inclusive } from "../src/ops_range";
import { EPSILON, Some, None } from "../src/std";

describe("Range", () => {
  test("simple", () => {
    let r = range(2, 10);
    let count = 0;
    for (let n of r) {
      assert(n >= 2 && n < 10);
      count += 1;
    }
    assert_eq(count, 8);
  });

  test("is_empty", () => {
    assert(!range(0, 10).is_empty());
    assert(range(-0, 0).is_empty());
    assert(range(10, 0).is_empty());

    assert(!range(-Infinity, Infinity).is_empty());
    assert(range(EPSILON, NaN).is_empty());
    assert(range(NaN, EPSILON).is_empty());
    assert(range(NaN, NaN).is_empty());
  });

  test("nth", () => {
    let it = range(0, 3);
    assert_eq(it.nth(0), Some(0));
    assert_eq(it.nth(0), Some(1));
    assert_eq(it.nth(0), Some(2));
    assert_eq(it.nth(0), None());

    it = range(0, 3);
    assert_eq(it.clone().nth(0), Some(0));
    assert_eq(it.clone().nth(1), Some(1));
    assert_eq(it.clone().nth(2), Some(2));
    assert_eq(it.clone().nth(3), None());
    assert_eq(it.clone().nth(42), None());
  });
});

describe("RangeFrom", () => {
  // TODO: uncomment after done fixing Take.
  // test("simple", () => {
  //   let r = range_from(2);
  //   let count = 0;
  //   for (let [i, ri] of r.take(10).enumerate()) {
  //     assert_eq(ri, i + 2);
  //     assert(ri >= 2 && ri < 12);
  //     count += 1;
  //   }
  //   assert_eq(count, 10);
  // });
});

describe("RangeInclusive", () => {
  test("simple", () => {
    let r = range_inclusive(1, 2);
    assert_eq(r.next(), Some(1));
    assert_eq(r.next(), Some(2));
    assert_eq(r.next(), None());

    r = range_inclusive(127, 127);
    assert_eq(r.next(), Some(127));
    assert_eq(r.next(), None());

    r = range_inclusive(-128, -128);
    assert_eq(r.next_back(), Some(-128));
    assert_eq(r.next_back(), None());

    // degenerate
    r = range_inclusive(1, -1);
    assert_eq(r.size_hint(), [0, Some(0)]);
    assert_eq(r.next(), None());
  });
});
