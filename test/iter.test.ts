import {
  Self,
  IteratorBase,
  DoubleEndedIterator,
  Option,
  Some,
  None,
  Result,
  Ok,
  Err,
  Ordering,
  Less,
  Equal,
  Greater,
  empty,
  once,
  repeat,
  repeat_with,
  successors,
  once_with,
  ImplPartialEq,
  ImplEq,
  ImplPartialOrd,
  ImplOrd,
  cmp,
  range,
  range_inclusive,
  range_from,
  checked_add,
  i8_checked_add,
  i8_checked_mul,
  i8_checked_div,
  u8_checked_add,
  u8_checked_div,
  U64_MAX,
  I64_MAX,
  I64_MIN
} from "../src/std";
import { assert, assert_eq, should_panic } from "../src/macros.test";

describe("Iterator", () => {
  test("lt", () => {
    let empty: number[] = [];
    let xs = [1, 2, 3];
    let ys = [1, 2, 0];

    assert(!xs.iter().lt(ys.iter()));
    assert(!xs.iter().le(ys.iter()));
    assert(xs.iter().gt(ys.iter()));
    assert(xs.iter().ge(ys.iter()));

    assert(ys.iter().lt(xs.iter()));
    assert(ys.iter().le(xs.iter()));
    assert(!ys.iter().gt(xs.iter()));
    assert(!ys.iter().ge(xs.iter()));

    assert(empty.iter().lt(xs.iter()));
    assert(empty.iter().le(xs.iter()));
    assert(!empty.iter().gt(xs.iter()));
    assert(!empty.iter().ge(xs.iter()));

    // Sequence with NaN
    let u = [1, 2];
    let v = [0 / 0, 3];

    assert(!u.iter().lt(v.iter()));
    assert(!u.iter().le(v.iter()));
    assert(!u.iter().gt(v.iter()));
    assert(!u.iter().ge(v.iter()));

    let a = [0 / 0];
    let b = [1];
    let c = [2];

    assert(a.iter().lt(b.iter()) == a[0] < b[0]);
    assert(a.iter().le(b.iter()) == a[0] <= b[0]);
    assert(a.iter().gt(b.iter()) == a[0] > b[0]);
    assert(a.iter().ge(b.iter()) == a[0] >= b[0]);

    assert(c.iter().lt(b.iter()) == c[0] < b[0]);
    assert(c.iter().le(b.iter()) == c[0] <= b[0]);
    assert(c.iter().gt(b.iter()) == c[0] > b[0]);
    assert(c.iter().ge(b.iter()) == c[0] >= b[0]);
  });

  test("multi_iter", () => {
    let xs = [1, 2, 3, 4];
    let ys = [4, 3, 2, 1];
    assert(xs.iter().eq(ys.iter().rev()));
    assert(xs.iter().lt(xs.iter().skip(2)));
  });

  test("counter_from_iter", () => {
    let it = range_from(0)
      .step_by(5)
      .take(10);
    let xs: number[] = it.collect();
    assert_eq(xs, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45]);
  });

  test("iterator_chain", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let expected = [0, 1, 2, 3, 4, 5, 30, 40, 50, 60];
    {
      let ys = [30, 40, 50, 60];
      let it = xs.iter().chain(ys);
      let i = 0;
      for (let x of it) {
        assert_eq(x, expected[i]);
        i += 1;
      }
      assert_eq(i, expected.len());
    }

    {
      let ys = range_from(30)
        .step_by(10)
        .take(4);
      let it = xs
        .iter()
        .cloned()
        .chain(ys);
      let i = 0;
      for (let x of it) {
        assert_eq(x, expected[i]);
        i += 1;
      }
      assert_eq(i, expected.len());
    }
  });

  test("iterator_chain_nth", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [30, 40, 50, 60];
    let zs: number[] = [];
    let expected = [0, 1, 2, 3, 4, 5, 30, 40, 50, 60];
    for (let [i, x] of expected.iter().enumerate()) {
      assert_eq(
        Some(x),
        xs
          .iter()
          .chain(ys)
          .nth(i)
      );
    }
    assert_eq(
      zs
        .iter()
        .chain(xs)
        .nth(0),
      Some(0)
    );

    let it = xs.iter().chain(zs);
    assert_eq(it.nth(5), Some(5));
    assert_eq(it.next(), None());
  });

  test("iterator_chain_nth_back", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [30, 40, 50, 60];
    let zs: number[] = [];
    let expected = [0, 1, 2, 3, 4, 5, 30, 40, 50, 60];
    for (let [i, x] of expected
      .iter()
      .rev()
      .enumerate()) {
      assert_eq(
        Some(x),
        xs
          .iter()
          .chain(ys)
          .nth_back(i)
      );
    }
    assert_eq(
      zs
        .iter()
        .chain(xs)
        .nth_back(0),
      Some(5)
    );

    let it = xs.iter().chain(zs);
    assert_eq(it.nth_back(5), Some(0));
    assert_eq(it.next(), None());
  });

  test("iterator_chain_last", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [30, 40, 50, 60];
    let zs: number[] = [];
    assert_eq(
      xs
        .iter()
        .chain(ys)
        .last(),
      Some(60)
    );
    assert_eq(
      zs
        .iter()
        .chain(ys)
        .last(),
      Some(60)
    );
    assert_eq(
      ys
        .iter()
        .chain(zs)
        .last(),
      Some(60)
    );
    assert_eq(
      zs
        .iter()
        .chain(zs)
        .last(),
      None()
    );
  });

  test("iterator_chain_count", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [30, 40, 50, 60];
    let zs: number[] = [];
    assert_eq(
      xs
        .iter()
        .chain(ys)
        .count(),
      10
    );
    assert_eq(
      zs
        .iter()
        .chain(ys)
        .count(),
      4
    );
  });

  test("iterator_chain_find", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [30, 40, 50, 60];
    let iter = xs.iter().chain(ys);
    assert_eq(iter.find((i: number) => i === 4), Some(4));
    assert_eq(iter.next(), Some(5));
    assert_eq(iter.find((i: number) => i === 40), Some(40));
    assert_eq(iter.next(), Some(50));
    assert_eq(iter.find((i: number) => i === 100), None());
    assert_eq(iter.next(), None());
  });

  test("iterator_chain_size_hint", () => {
    class Iter extends DoubleEndedIterator<undefined> {
      Self!: Iter;
      Item!: undefined;

      is_empty: boolean;

      constructor(is_empty: boolean) {
        super();
        this.is_empty = is_empty;
      }

      next(): Option<this["Item"]> {
        if (this.is_empty) {
          this.is_empty = false;
          return None();
        } else {
          this.is_empty = true;
          return Some(undefined);
        }
      }

      size_hint(): [number, Option<number>] {
        if (this.is_empty) {
          return [0, Some(0)];
        } else {
          return [1, Some(1)];
        }
      }

      next_back(): Option<this["Item"]> {
        return this.next();
      }
    }

    // this chains an iterator of length 0 with an iterator of length 1,
    // so after calling `.next()` once, the iterator is empty and the
    // state is `ChainState.Back`. `.size_hint()` should now disregard
    // the size hint of the left iterator
    {
      let iter = new Iter(true).chain(once(undefined));
      assert_eq(iter.next(), Some(undefined));
      assert_eq(iter.size_hint(), [0, Some(0)]);
    }

    {
      let iter = once(undefined).chain(new Iter(true));
      assert_eq(iter.next_back(), Some(undefined));
      assert_eq(iter.size_hint(), [0, Some(0)]);
    }
  });

  test("zip_nth", () => {
    let xs = [0, 1, 2, 4, 5];
    let ys = [10, 11, 12];

    let it = xs.iter().zip(ys.iter());
    assert_eq(it.nth(0), Some<[number, number]>([0, 10]));
    assert_eq(it.nth(1), Some<[number, number]>([2, 12]));
    assert_eq(it.nth(0), None());

    it = xs.iter().zip(ys.iter());
    assert_eq(it.nth(3), None());

    it = ys.iter().zip(xs.iter());
    assert_eq(it.nth(3), None());
  });

  test("zip_nth_side_effects", () => {
    let a: number[] = [];
    let b: number[] = [];
    let value = [1, 2, 3, 4, 5, 6]
      .iter()
      .cloned()
      .map((n: number) => {
        a.push(n);
        return n * 10;
      })
      .zip(
        [2, 3, 4, 5, 6, 7, 8]
          .iter()
          .cloned()
          .map(n => {
            b.push(n * 100);
            return n * 1000;
          })
      )
      .skip(1)
      .nth(3);
    assert_eq(value, Some<[number, number]>([50, 6000]));
    assert_eq(a, [1, 2, 3, 4, 5]);
    assert_eq(b, [200, 300, 400, 500, 600]);
  });

  test("iterator_step_by", () => {
    {
      let it = range_from(0)
        .step_by(1)
        .take(3);
      assert_eq(it.next(), Some(0));
      assert_eq(it.next(), Some(1));
      assert_eq(it.next(), Some(2));
      assert_eq(it.next(), None());
    }
    {
      let it = range_from(0)
        .step_by(3)
        .take(4);
      assert_eq(it.next(), Some(0));
      assert_eq(it.next(), Some(3));
      assert_eq(it.next(), Some(6));
      assert_eq(it.next(), Some(9));
      assert_eq(it.next(), None());
    }
    {
      let it = range(0, 3).step_by(1);
      assert_eq(it.next_back(), Some(2));
      assert_eq(it.next_back(), Some(1));
      assert_eq(it.next_back(), Some(0));
      assert_eq(it.next_back(), None());
    }
    {
      let it = range(0, 11).step_by(3);
      assert_eq(it.next_back(), Some(9));
      assert_eq(it.next_back(), Some(6));
      assert_eq(it.next_back(), Some(3));
      assert_eq(it.next_back(), Some(0));
      assert_eq(it.next_back(), None());
    }
  });

  test("iterator_step_by_nth", () => {
    let it = range(0, 16).step_by(5);
    assert_eq(it.nth(0), Some(0));
    assert_eq(it.nth(0), Some(5));
    assert_eq(it.nth(0), Some(10));
    assert_eq(it.nth(0), Some(15));
    assert_eq(it.nth(0), None());

    it = range(0, 18).step_by(5);
    assert_eq(it.clone().nth(0), Some(0));
    assert_eq(it.clone().nth(1), Some(5));
    assert_eq(it.clone().nth(2), Some(10));
    assert_eq(it.clone().nth(3), Some(15));
    assert_eq(it.clone().nth(4), None());
    assert_eq(it.clone().nth(42), None());
  });

  test("iterator_step_by_nth_overflow", () => {
    // TODO: check to see if this test is actually doing anything...

    class Test extends IteratorBase<number> {
      Item!: number;
      0: number;
      constructor(v: number) {
        super();
        this[0] = v;
      }
      next(): Option<this["Item"]> {
        return Some<number>(21);
      }
      nth(n: number): Option<this["Item"]> {
        this[0] += n + 1;
        return Some<number>(42);
      }
    }

    let it = new Test(0);
    let root = U64_MAX >> ((64 * 8) / 2);
    let n = root + 20;
    it.step_by(n).nth(n);
    assert_eq(it[0], n * n);

    // large step
    it = new Test(0);
    it.step_by(U64_MAX).nth(5);
    assert_eq(it[0], U64_MAX * 5);

    // n + 1 overflows
    it = new Test(0);
    it.step_by(2).nth(U64_MAX);
    assert_eq(it[0], U64_MAX * 2);

    // n + 1 overflows
    it = new Test(0);
    it.step_by(1).nth(U64_MAX);
    assert_eq(it[0], U64_MAX * 1);
  });

  test("iterator_step_by_nth_try_fold", () => {
    let it1 = range_from(0).step_by(10);
    assert_eq(it1.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(it1.next(), Some(60));
    assert_eq(it1.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(it1.next(), Some(90));

    it1 = range_from(100).step_by(10);
    assert_eq(it1.try_fold<number, Option<number>>(50, Option, i8_checked_add), None());
    assert_eq(it1.next(), Some(110));

    let it2 = range_inclusive(100, 100).step_by(10);
    assert_eq(it2.next(), Some(100));
    assert_eq(it2.try_fold<number, Option<number>>(0, Option, i8_checked_add), Some(0));
  });

  test("step_by_zero", () => {
    should_panic(() => {
      let it = range_from(0).step_by(0);
    });
  });

  test("step_by_size_hint", () => {
    class StubSizeHint extends IteratorBase<undefined> {
      Item!: undefined;
      0: number;
      1: Option<number>;
      constructor(x: number, y: Option<number>) {
        super();
        this[0] = x;
        this[1] = y;
      }
      next(): Option<this["Item"]> {
        this[0] -= 1;
        if (this[1].is_some()) {
          let upper = this[1].unwrap();
          this[1].replace(upper - 1);
        }
        return Some(undefined);
      }
      size_hint(): [number, Option<number>] {
        return [this[0], this[1]];
      }
    }

    // The two checks in each case are needed because the logic
    // is different before the first call to `next()`.

    let it = new StubSizeHint(10, Some(10)).step_by(1);
    assert_eq(it.size_hint(), [10, Some(10)]);
    it.next();
    assert_eq(it.size_hint(), [9, Some(9)]);

    // exact multiple
    it = new StubSizeHint(10, Some(10)).step_by(3);
    assert_eq(it.size_hint(), [4, Some(4)]);
    it.next();
    assert_eq(it.size_hint(), [3, Some(3)]);

    // larger base range, but not enough to get another element
    it = new StubSizeHint(12, Some(12)).step_by(3);
    assert_eq(it.size_hint(), [4, Some(4)]);
    it.next();
    assert_eq(it.size_hint(), [3, Some(3)]);

    // smaller base range, so fewer resulting elements
    it = new StubSizeHint(9, Some(9)).step_by(3);
    assert_eq(it.size_hint(), [3, Some(3)]);
    it.next();
    assert_eq(it.size_hint(), [2, Some(2)]);

    // infinite upper bound
    it = new StubSizeHint(U64_MAX, None<number>()).step_by(1);
    assert_eq(it.size_hint(), [U64_MAX, None<number>()]);
    it.next();
    assert_eq(it.size_hint(), [U64_MAX, None<number>()]);

    // still infinite with larger step
    it = new StubSizeHint(7, None()).step_by(3);
    assert_eq(it.size_hint(), [3, None<number>()]);
    it.next();
    assert_eq(it.size_hint(), [2, None<number>()]);

    {
      let a = [1, 2, 3, 4, 5];
      let it = a.iter().step_by(2);
      assert_eq(it.len(), 3);
    }

    // TODO: makes this work
    // Cannot be TrustedLen as a step greater than one makes an iterator
    // with (U64_MAX, None()) no longer meet the safety requirements
    // trait TrustedLenCheck { fn test(self) -> bool; }
    // impl<T:Iterator> TrustedLenCheck for T {
    //     default fn test(self) -> bool { false }
    // }
    // impl<T:TrustedLen> TrustedLenCheck for T {
    //     fn test(self) -> bool { true }
    // }
    // assert(TrustedLenCheck::test(a.iter()));
    // assert(!TrustedLenCheck::test(a.iter().step_by(1)));
  });

  test("filter_map", () => {
    let it = range_from(0)
      .step_by(1)
      .take(10)
      .filter_map((x: number) => (x % 2 === 0 ? Some(x * x) : None<number>()));
    assert_eq(it.collect(), [0 * 0, 2 * 2, 4 * 4, 6 * 6, 8 * 8]);
  });

  test("iterator_enumerate", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().enumerate();
    for (let [i, x] of it) {
      assert_eq(i, x);
    }
  });

  test("iterator_enumerate_nth", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    for (let [i, x] of xs.iter().enumerate()) {
      assert_eq(i, x);
    }

    let it = xs.iter().enumerate();
    let nth = it.nth(0);
    while (nth.is_some()) {
      let [i, x] = nth.unwrap();
      assert_eq(i, x);
      nth = it.nth(0);
    }

    it = xs.iter().enumerate();
    nth = it.nth(1);
    while (nth.is_some()) {
      let [i, x] = nth.unwrap();
      assert_eq(i, x);
      nth = it.nth(1);
    }

    let [i, x] = xs
      .iter()
      .enumerate()
      .nth(3)
      .unwrap();
    assert_eq(i, x);
    assert_eq(i, 3);
  });

  test("iterator_enumerate_nth_back", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().enumerate();
    let nth = it.nth_back(0);
    while (nth.is_some()) {
      let [i, x] = nth.unwrap();
      assert_eq(i, x);
      nth = it.nth_back(0);
    }

    it = xs.iter().enumerate();
    nth = it.nth_back(1);
    while (nth.is_some()) {
      let [i, x] = nth.unwrap();
      assert_eq(i, x);
      nth = it.nth_back(1);
    }

    let [i, x] = xs
      .iter()
      .enumerate()
      .nth_back(3)
      .unwrap();
    assert_eq(i, x);
    assert_eq(i, 2);
  });

  test("iterator_enumerate_count", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    assert_eq(
      xs
        .iter()
        .enumerate()
        .count(),
      6
    );
  });

  test("iterator_enumerate_fold", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().enumerate();
    // steal a couple to get an interesting offset
    assert_eq(it.next(), Some<[number, number]>([0, 0]));
    assert_eq(it.next(), Some<[number, number]>([1, 1]));
    let i = it.fold<number>(2, (i: number, [j, x]: [number, number]) => {
      assert_eq(i, j);
      assert_eq(x, xs[j]);
      return i + 1;
    });
    assert_eq(i, xs.len());

    it = xs.iter().enumerate();
    assert_eq(it.next(), Some<[number, number]>([0, 0]));
    i = it.rfold(xs.len() - 1, (i: number, [j, x]: [number, number]) => {
      assert_eq(i, j);
      assert_eq(x, xs[j]);
      return i - 1;
    });
    assert_eq(i, 0);
  });

  test("iterator_filter_count", () => {
    let xs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    assert_eq(
      xs
        .iter()
        .filter((x: number) => x % 2 === 0)
        .count(),
      5
    );
  });

  test("iterator_filter_fold", () => {
    let xs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let ys = [0, 2, 4, 6, 8];
    let it = xs.iter().filter((x: number) => x % 2 === 0);
    let i = it.fold<number>(0, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());

    it = xs.iter().filter((x: number) => x % 2 === 0);
    i = it.rfold(ys.len(), (i: number, x: number) => {
      assert_eq(x, ys[i - 1]);
      return i - 1;
    });
    assert_eq(i, 0);
  });

  test("iterator_peekable", () => {
    let xs = [0, 1, 2, 3, 4, 5];

    let it = xs
      .iter()
      .cloned()
      .peekable();
    assert_eq(it.len(), 6);
    assert_eq(it.peek().unwrap(), 0);
    assert_eq(it.len(), 6);
    assert_eq(it.next().unwrap(), 0);
    assert_eq(it.len(), 5);
    assert_eq(it.next().unwrap(), 1);
    assert_eq(it.len(), 4);
    assert_eq(it.next().unwrap(), 2);
    assert_eq(it.len(), 3);
    assert_eq(it.peek().unwrap(), 3);
    assert_eq(it.len(), 3);
    assert_eq(it.peek().unwrap(), 3);
    assert_eq(it.len(), 3);
    assert_eq(it.next().unwrap(), 3);
    assert_eq(it.len(), 2);
    assert_eq(it.next().unwrap(), 4);
    assert_eq(it.len(), 1);
    assert_eq(it.peek().unwrap(), 5);
    assert_eq(it.len(), 1);
    assert_eq(it.next().unwrap(), 5);
    assert_eq(it.len(), 0);
    assert(it.peek().is_none());
    assert_eq(it.len(), 0);
    assert(it.next().is_none());
    assert_eq(it.len(), 0);

    it = xs
      .iter()
      .cloned()
      .peekable();
    assert_eq(it.len(), 6);
    assert_eq(it.peek().unwrap(), 0);
    assert_eq(it.len(), 6);
    assert_eq(it.next_back().unwrap(), 5);
    assert_eq(it.len(), 5);
    assert_eq(it.next_back().unwrap(), 4);
    assert_eq(it.len(), 4);
    assert_eq(it.next_back().unwrap(), 3);
    assert_eq(it.len(), 3);
    assert_eq(it.peek().unwrap(), 0);
    assert_eq(it.len(), 3);
    assert_eq(it.peek().unwrap(), 0);
    assert_eq(it.len(), 3);
    assert_eq(it.next_back().unwrap(), 2);
    assert_eq(it.len(), 2);
    assert_eq(it.next_back().unwrap(), 1);
    assert_eq(it.len(), 1);
    assert_eq(it.peek().unwrap(), 0);
    assert_eq(it.len(), 1);
    assert_eq(it.next_back().unwrap(), 0);
    assert_eq(it.len(), 0);
    assert(it.peek().is_none());
    assert_eq(it.len(), 0);
    assert(it.next_back().is_none());
    assert_eq(it.len(), 0);
  });

  test("iterator_peekable_count", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [10];
    let zs: number[] = [];

    assert_eq(
      xs
        .iter()
        .peekable()
        .count(),
      6
    );

    let it = xs.iter().peekable();
    assert_eq(it.peek(), Some(0));
    assert_eq(it.count(), 6);

    assert_eq(
      ys
        .iter()
        .peekable()
        .count(),
      1
    );

    it = ys.iter().peekable();
    assert_eq(it.peek(), Some(10));
    assert_eq(it.count(), 1);

    assert_eq(
      zs
        .iter()
        .peekable()
        .count(),
      0
    );

    it = zs.iter().peekable();
    assert_eq(it.peek(), None());
  });

  test("iterator_peekable_nth", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().peekable();

    assert_eq(it.peek(), Some(0));
    assert_eq(it.nth(0), Some(0));
    assert_eq(it.peek(), Some(1));
    assert_eq(it.nth(1), Some(2));
    assert_eq(it.peek(), Some(3));
    assert_eq(it.nth(2), Some(5));
    assert_eq(it.next(), None());
  });

  test("iterator_peekable_last", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let ys = [0];

    let it = xs.iter().peekable();
    assert_eq(it.peek(), Some(0));
    assert_eq(it.last(), Some(5));

    it = ys.iter().peekable();
    assert_eq(it.peek(), Some(0));
    assert_eq(it.last(), Some(0));

    it = ys.iter().peekable();
    assert_eq(it.next(), Some(0));
    assert_eq(it.peek(), None());
    assert_eq(it.last(), None());
  });

  test("iterator_peekable_fold", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().peekable();
    assert_eq(it.peek(), Some(0));
    let i = it.fold<number>(0, (i: number, x: number) => {
      assert_eq(x, xs[i]);
      return i + 1;
    });
    assert_eq(i, xs.len());
  });

  test("iterator_peekable_rfold", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().peekable();
    assert_eq(it.peek(), Some(0));
    let i = it.rfold<number>(0, (i: number, x: number) => {
      assert_eq(x, xs[xs.len() - 1 - i]);
      return i + 1;
    });
    assert_eq(i, xs.len());
  });

  class CycleIter<T> extends IteratorBase<T> {
    Self!: CycleIter<T>;

    Item!: T;

    index: number;
    data: T[];

    constructor(index: number, data: T[]) {
      super();
      this.index = index;
      this.data = data;
    }

    next(): Option<this["Item"]> {
      let elt = this.data[this.index];
      this.index += 1;
      this.index %= 1 + this.data.len();
      return elt !== undefined ? Some(elt) : None();
    }
  }

  function cycle<T>(data: T[]): CycleIter<T> {
    return new CycleIter(0, data);
  }

  test("iterator_peekable_remember_peek_none_1", () => {
    // Check that the loop using .peek() terminates
    let data = [1, 2, 3];
    let iter = cycle(data).peekable();

    let n = 0;
    let next = iter.next();
    while (next.is_some()) {
      let is_the_last = iter.peek().is_none();
      assert_eq(is_the_last, n === data.len() - 1);
      n += 1;
      if (n > data.len()) {
        break;
      }
      next = iter.next();
    }
    assert_eq(n, data.len());
  });

  test("iterator_peekable_remember_peek_none_2", () => {
    let data = [0];
    let iter = cycle(data).peekable();
    iter.next();
    assert_eq(iter.peek(), None());
    assert_eq(iter.last(), None());
  });

  test("iterator_peekable_remember_peek_none_3", () => {
    let data = [0];
    let iter = cycle(data).peekable();
    iter.peek();
    assert_eq(iter.nth(0), Some(0));

    iter = cycle(data).peekable();
    iter.next();
    assert_eq(iter.peek(), None());
    assert_eq(iter.nth(0), None());
  });

  test("iterator_take_while", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19];
    let ys = [0, 1, 2, 3, 5, 13];
    let it = xs.iter().take_while((x: number) => x < 15);
    let i = 0;
    for (let x of it) {
      assert_eq(x, ys[i]);
      i += 1;
    }
    assert_eq(i, ys.len());
  });

  test("iterator_skip_while", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19];
    let ys = [15, 16, 17, 19];
    let it = xs.iter().skip_while((x: number) => x < 15);
    let i = 0;
    for (let x of it) {
      assert_eq(x, ys[i]);
      i += 1;
    }
    assert_eq(i, ys.len());
  });

  test("iterator_skip_while_fold", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19];
    let ys = [15, 16, 17, 19];
    let it = xs.iter().skip_while((x: number) => x < 15);
    let i = it.fold<number>(0, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());

    it = xs.iter().skip_while((x: number) => x < 15);
    assert_eq(it.next(), Some(ys[0])); // process skips before folding
    i = it.fold<number>(1, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());
  });

  test("iterator_skip", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19, 20, 30];
    let ys = [13, 15, 16, 17, 19, 20, 30];
    let it = xs.iter().skip(5);
    let i = 0;
    let next = it.next();
    while (next.is_some()) {
      let x = next.unwrap();
      assert_eq(x, ys[i]);
      i += 1;
      assert_eq(it.len(), xs.len() - 5 - i);
      next = it.next();
    }
    assert_eq(i, ys.len());
    assert_eq(it.len(), 0);
  });

  test("iterator_skip_doubleended", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19, 20, 30];
    {
      let it = xs
        .iter()
        .rev()
        .skip(5);
      assert_eq(it.next(), Some(15));
      assert_eq(it.rev().next(), Some(0));
      assert_eq(it.next(), Some(13));
      assert_eq(it.rev().next(), Some(1));
      assert_eq(it.next(), Some(5));
      assert_eq(it.rev().next(), Some(2));
      assert_eq(it.next(), Some(3));
      assert_eq(it.next(), None());
    }
    {
      let it = xs
        .iter()
        .rev()
        .skip(5)
        .rev();
      assert_eq(it.next(), Some(0));
      assert_eq(it.rev().next(), Some(15));
    }
    let it_base = xs.iter();
    {
      let it = it_base.skip(5).rev();
      assert_eq(it.next(), Some(30));
      assert_eq(it.next(), Some(20));
      assert_eq(it.next(), Some(19));
      assert_eq(it.next(), Some(17));
      assert_eq(it.next(), Some(16));
      assert_eq(it.next(), Some(15));
      assert_eq(it.next(), Some(13));
      assert_eq(it.next(), None());
    }
    // make sure the skipped parts have not been consumed
    assert_eq(it_base.next(), Some(0));
    assert_eq(it_base.next(), Some(1));
    assert_eq(it_base.next(), Some(2));
    assert_eq(it_base.next(), Some(3));
    assert_eq(it_base.next(), Some(5));
    assert_eq(it_base.next(), None());
    {
      let it = xs
        .iter()
        .skip(5)
        .rev();
      assert_eq(it.last(), Some(13));
    }
  });

  test("iterator_skip_nth", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19, 20, 30];

    let it = xs.iter().skip(0);
    assert_eq(it.nth(0), Some(0));
    assert_eq(it.nth(1), Some(2));

    it = xs.iter().skip(5);
    assert_eq(it.nth(0), Some(13));
    assert_eq(it.nth(1), Some(16));

    it = xs.iter().skip(12);
    assert_eq(it.nth(0), None());
  });

  test("iterator_skip_count", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19, 20, 30];

    assert_eq(
      xs
        .iter()
        .skip(0)
        .last(),
      Some(30)
    );
    assert_eq(
      xs
        .iter()
        .skip(1)
        .last(),
      Some(30)
    );
    assert_eq(
      xs
        .iter()
        .skip(11)
        .last(),
      Some(30)
    );
    assert_eq(
      xs
        .iter()
        .skip(12)
        .last(),
      None()
    );
    assert_eq(
      xs
        .iter()
        .skip(13)
        .last(),
      None()
    );

    let it = xs.iter().skip(5);
    assert_eq(it.next(), Some(13));
    assert_eq(it.last(), Some(30));
  });

  test("iterator_skip_last", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19, 20, 30];

    assert_eq(
      xs
        .iter()
        .skip(0)
        .last(),
      Some(30)
    );
    assert_eq(
      xs
        .iter()
        .skip(1)
        .last(),
      Some(30)
    );
    assert_eq(
      xs
        .iter()
        .skip(11)
        .last(),
      Some(30)
    );
    assert_eq(
      xs
        .iter()
        .skip(12)
        .last(),
      None()
    );
    assert_eq(
      xs
        .iter()
        .skip(13)
        .last(),
      None()
    );

    let it = xs.iter().skip(5);
    assert_eq(it.next(), Some(13));
    assert_eq(it.last(), Some(30));
  });

  test("iterator_skip_fold", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19, 20, 30];
    let ys = [13, 15, 16, 17, 19, 20, 30];

    let it = xs.iter().skip(5);
    let i = it.fold<number>(0, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());

    it = xs.iter().skip(5);
    assert_eq(it.next(), Some(ys[0])); // process skips before folding
    i = it.fold<number>(1, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());

    it = xs.iter().skip(5);
    i = it.rfold(ys.len(), (i: number, x: number) => {
      i -= 1;
      assert_eq(x, ys[i]);
      return i;
    });
    assert_eq(i, 0);

    it = xs.iter().skip(5);
    assert_eq(it.next(), Some(ys[0])); // process skips before folding
    i = it.rfold(ys.len(), (i: number, x: number) => {
      i -= 1;
      assert_eq(x, ys[i]);
      return i;
    });
    assert_eq(i, 1);
  });

  test("iterator_take", () => {
    let xs = [0, 1, 2, 3, 5, 13, 15, 16, 17, 19];
    let ys = [0, 1, 2, 3, 5];

    let it = xs.iter().take(ys.len());
    let i = 0;
    assert_eq(it.len(), ys.len());
    let next = it.next();
    while (next.is_some()) {
      let x = next.unwrap();
      assert_eq(x, ys[i]);
      i += 1;
      assert_eq(it.len(), ys.len() - i);
      next = it.next();
    }
    assert_eq(i, ys.len());
    assert_eq(it.len(), 0);

    it = xs.iter().take(ys.len());
    i = 0;
    assert_eq(it.len(), ys.len());
    next = it.next_back();
    while (next.is_some()) {
      let x = next.unwrap();
      i += 1;
      assert_eq(x, ys[ys.len() - i]);
      assert_eq(it.len(), ys.len() - i);
      next = it.next_back();
    }
    assert_eq(i, ys.len());
    assert_eq(it.len(), 0);
  });

  test("iterator_take_nth", () => {
    let xs = [0, 1, 2, 4, 5];
    let it = xs.iter();
    {
      let take = it.take(3);
      let i = 0;
      let nth = take.nth(0);
      while (nth.is_some()) {
        let x = nth.unwrap();
        assert_eq(x, i);
        i += 1;
        nth = take.nth(0);
      }
    }
    assert_eq(it.nth(1), Some(5));
    assert_eq(it.nth(0), None());

    xs = [0, 1, 2, 3, 4];
    let take = xs.iter().take(7);
    let i = 1;
    let nth = it.nth(1);
    while (nth.is_some()) {
      let x = nth.unwrap();
      assert_eq(x, i);
      i += 2;
      nth = take.nth(1);
    }
  });

  test("iterator_take_nth_back", () => {
    let xs = [0, 1, 2, 4, 5];
    let it = xs.iter();
    {
      let take = it.take(3);
      let i = 0;
      let nth_back = take.nth_back(0);
      while (nth_back.is_some()) {
        let x = nth_back.unwrap();
        i += 1;
        assert_eq(x, 3 - i);
        nth_back = take.nth_back(0);
      }
    }

    assert_eq(it.nth_back(0), None());

    xs = [0, 1, 2, 3, 4];
    let take = xs.iter().take(7);
    assert_eq(take.nth_back(1), Some(3));
    assert_eq(take.nth_back(1), Some(1));
    assert_eq(take.nth_back(1), None());
  });

  test("iterator_take_short", () => {
    let xs = [0, 1, 2, 3];

    let it = xs.iter().take(5);
    let i = 0;
    assert_eq(it.len(), xs.len());
    let next = it.next();
    while (next.is_some()) {
      let x = next.unwrap();
      assert_eq(x, xs[i]);
      i += 1;
      assert_eq(it.len(), xs.len() - i);
      next = it.next();
    }
    assert_eq(i, xs.len());
    assert_eq(it.len(), 0);

    it = xs.iter().take(5);
    i = 0;
    assert_eq(it.len(), xs.len());
    next = it.next_back();
    while (next.is_some()) {
      let x = next.unwrap();
      i += 1;
      assert_eq(x, xs[xs.len() - i]);
      assert_eq(it.len(), xs.len() - i);
      next = it.next_back();
    }
    assert_eq(i, xs.len());
    assert_eq(it.len(), 0);
  });

  test("iterator_scan", () => {
    class NumberRef {
      public n: number;
      constructor(n: number) {
        this.n = n;
      }
    }
    // test the type inference
    const add = (old: NumberRef, v: number): Option<string> => {
      old.n += v;
      return Some(old.n.toString());
    };
    let xs = [0, 1, 2, 3, 4];
    let ys = ["0", "1", "3", "6", "10"];

    let it = xs.iter().scan(new NumberRef(0), add);
    let i = 0;
    for (let x of it) {
      assert_eq(x, ys[i]);
      i += 1;
    }
    assert_eq(i, ys.len());
  });

  test("iterator_flat_map", () => {
    let xs = [0, 3, 6];
    let ys = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let it = xs.iter().flat_map_down((x: number) =>
      range_from(x)
        .step_by(1)
        .take(3)
    );
    let i = 0;
    for (let x of it) {
      assert_eq(x, ys[i]);
      i += 1;
    }
    assert_eq(i, ys.len());
  });

  test("iterator_flat_map_fold", () => {
    let xs = [0, 3, 6];
    let ys = [1, 2, 3, 4, 5, 6, 7];
    let it = xs.iter().flat_map((x: number) => range(x, x + 3));
    assert_eq(it.next(), Some(0));
    assert_eq(it.next_back(), Some(8));
    let i = it.fold<number>(0, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());

    it = xs.iter().flat_map((x: number) => range(x, x + 3));
    assert_eq(it.next(), Some(0));
    assert_eq(it.next_back(), Some(8));
    i = it.rfold(ys.len(), (i: number, x: number) => {
      assert_eq(x, ys[i - 1]);
      return i - 1;
    });
    assert_eq(i, 0);
  });

  test("iterator_flatten", () => {
    let xs = [0, 3, 6];
    let ys = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let it = xs
      .iter()
      .map((x: number) =>
        range_from(x)
          .step_by(1)
          .take(3)
      )
      .flatten();
    let i = 0;
    for (let x of it) {
      assert_eq(x, ys[i]);
      i += 1;
    }
    assert_eq(i, ys.len());
  });

  test("iterator_flatten_fold", () => {
    let xs = [0, 3, 6];
    let ys = [1, 2, 3, 4, 5, 6, 7];
    let it = xs
      .iter()
      .map((x: number) => range(x, x + 3))
      .flatten();
    assert_eq(it.next(), Some(0));
    assert_eq(it.next_back(), Some(8));
    let i = it.fold<number>(0, (i: number, x: number) => {
      assert_eq(x, ys[i]);
      return i + 1;
    });
    assert_eq(i, ys.len());

    it = xs
      .iter()
      .map((x: number) => range(x, x + 3))
      .flatten();
    assert_eq(it.next(), Some(0));
    assert_eq(it.next_back(), Some(8));
    i = it.rfold(ys.len(), (i: number, x: number) => {
      assert_eq(x, ys[i - 1]);
      return i - 1;
    });
    assert_eq(i, 0);
  });

  test("inspect", () => {
    let xs = [1, 2, 3, 4];
    let n = 0;

    let ys = xs
      .iter()
      .cloned()
      .inspect(_ => (n += 1))
      .collect();
    assert_eq(n, xs.len());
    assert_eq(xs, ys);
  });

  test("inspect_fold", () => {
    let xs = [1, 2, 3, 4];
    let n = 0;
    {
      let it = xs.iter().inspect(_ => (n += 1));
      let i = it.fold<number>(0, (i: number, x: number) => {
        assert_eq(x, xs[i]);
        return i + 1;
      });
      assert_eq(i, xs.len());
    }
    assert_eq(n, xs.len());

    n = 0;
    {
      let it = xs.iter().inspect(_ => (n += 1));
      let i = it.rfold(xs.len(), (i, x) => {
        assert_eq(x, xs[i - 1]);
        return i - 1;
      });
      assert_eq(i, 0);
    }
    assert_eq(n, xs.len());
  });

  test("cycle", () => {
    let cycle_len = 3;
    let it = range_from(0)
      .step_by(1)
      .take(cycle_len)
      .cycle();
    assert_eq(it.size_hint(), [U64_MAX, None<number>()]);
    for (let [i, x] of it.take(100).enumerate()) {
      assert_eq(i % cycle_len, x);
    }

    it = range_from(0)
      .step_by(1)
      .take(0)
      .cycle();
    assert_eq(it.size_hint(), [0, Some(0)]);
    assert_eq(it.next(), None());

    assert_eq(
      empty<number>()
        .cycle()
        .fold<number>(0, (acc: number, x: number) => acc + x),
      0
    );

    assert_eq(
      once(1)
        .cycle()
        .skip(1)
        .take(4)
        .fold<number>(0, (acc: number, x: number) => acc + x),
      4
    );

    assert_eq(
      range(0, 10)
        .cycle()
        .take(5)
        .sum(),
      10
    );
    assert_eq(
      range(0, 10)
        .cycle()
        .take(15)
        .sum(),
      55
    );
    assert_eq(
      range(0, 10)
        .cycle()
        .take(25)
        .sum(),
      100
    );

    let iter = range(0, 10).cycle();
    iter.nth(14);
    assert_eq(iter.take(8).sum(), 38);

    iter = range(0, 10).cycle();
    iter.nth(9);
    assert_eq(iter.take(3).sum(), 3);
  });

  test("iterator_nth", () => {
    let v = [0, 1, 2, 3, 4];
    for (let i of range(0, v.len())) {
      assert_eq(
        v
          .iter()
          .nth(i)
          .unwrap(),
        v[i]
      );
    }
    assert_eq(v.iter().nth(v.len()), None());
  });

  test("iterator_nth_back", () => {
    let v = [0, 1, 2, 3, 4];
    for (let i of range(0, v.len())) {
      assert_eq(
        v
          .iter()
          .nth_back(i)
          .unwrap(),
        v[v.len() - 1 - i]
      );
    }
    assert_eq(v.iter().nth_back(v.len()), None());
  });

  test("iterator_rev_nth_back", () => {
    let v = [0, 1, 2, 3, 4];
    for (let i of range(0, v.len())) {
      assert_eq(
        v
          .iter()
          .rev()
          .nth_back(i)
          .unwrap(),
        v[i]
      );
    }
    assert_eq(
      v
        .iter()
        .rev()
        .nth_back(v.len()),
      None()
    );
  });

  test("iterator_rev_nth", () => {
    let v = [0, 1, 2, 3, 4];
    for (let i of range(0, v.len())) {
      assert_eq(
        v
          .iter()
          .rev()
          .nth(i)
          .unwrap(),
        v[v.len() - 1 - i]
      );
    }
    assert_eq(
      v
        .iter()
        .rev()
        .nth(v.len()),
      None()
    );
  });

  test("iterator_last", () => {
    let v = [0, 1, 2, 3, 4];
    assert_eq(
      v
        .iter()
        .last()
        .unwrap(),
      4
    );
    assert_eq(
      v
        .slice(0, 1)
        .iter()
        .last()
        .unwrap(),
      0
    );
  });

  test("iterator_len", () => {
    let v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert_eq(
      v
        .slice(0, 4)
        .iter()
        .count(),
      4
    );
    assert_eq(
      v
        .slice(0, 10)
        .iter()
        .count(),
      10
    );
    assert_eq(
      v
        .slice(0, 0)
        .iter()
        .count(),
      0
    );
  });

  test("iterator_sum", () => {
    let v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert_eq(
      v
        .slice(0, 4)
        .iter()
        .cloned()
        .sum(),
      6
    );
    assert_eq(
      v
        .iter()
        .cloned()
        .sum(),
      55
    );
    assert_eq(
      v
        .slice(0, 0)
        .iter()
        .cloned()
        .sum(),
      0
    );
  });

  // TODO: fix try_sum and test here...

  test("iterator_product", () => {
    let v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert_eq(
      v
        .slice(0, 4)
        .iter()
        .cloned()
        .product(),
      0
    );
    assert_eq(
      v
        .slice(1, 5)
        .iter()
        .cloned()
        .product(),
      24
    );
    assert_eq(
      v
        .slice(0, 0)
        .iter()
        .cloned()
        .product(),
      1
    );
  });

  // test("iterator_product_result", () => {
  //   let v: [Result<number, undefined>] = [Ok(1), Ok(2), Ok(3), Ok(4)];
  //   assert_eq(v.iter().cloned().product(), Ok(24));
  //   let v: [Result<number, undefined>] = [Ok(1), Err(undefined), Ok(3), Ok(4)];
  //   assert_eq(v.iter().cloned().product(), Err(undefined));
  // })

  // test("iterator_product_option", () => {
  //   let v: [Option<number>] = [Some(1), Some(2), Some(3), Some(4)];
  //   assert_eq(v.iter().cloned().product(), Some(24));
  //   let v: [Option<number>] = [Some(1), None(), Some(3), Some(4)];
  //   assert_eq(v.iter().cloned().product(), None());
  // })

  class Mod3 extends ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(Self)))) {
    Self!: Mod3;

    0: number;

    constructor(n: number) {
      super();
      this[0] = n;
    }

    eq(other: Mod3): boolean {
      return this[0] % 3 === other[0] % 3;
    }

    partial_cmp(other: Mod3): Option<Ordering> {
      return Some(this.cmp(other));
    }

    cmp(other: Mod3): Ordering {
      return cmp(this[0] % 3, other[0] % 3);
    }
  }

  function mod3(n: number): Mod3 {
    return new Mod3(n);
  }

  test("iterator_max", () => {
    let v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert_eq(
      v
        .slice(0, 4)
        .iter()
        .cloned()
        .max(),
      Some(3)
    );
    assert_eq(
      v
        .iter()
        .cloned()
        .max(),
      Some(10)
    );
    assert_eq(
      v
        .slice(0, 0)
        .iter()
        .cloned()
        .max(),
      None()
    );
    assert_eq(
      v
        .iter()
        .cloned()
        .map(mod3)
        .max()
        .map((x: Mod3) => x[0]),
      Some(8)
    );
  });

  test("iterator_min", () => {
    let v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert_eq(
      v
        .slice(0, 4)
        .iter()
        .cloned()
        .min(),
      Some(0)
    );
    assert_eq(
      v
        .iter()
        .cloned()
        .min(),
      Some(0)
    );
    assert_eq(
      v
        .slice(0, 0)
        .iter()
        .cloned()
        .min(),
      None()
    );
    assert_eq(
      v
        .iter()
        .cloned()
        .map(mod3)
        .min()
        .map((x: Mod3) => x[0]),
      Some(0)
    );
  });

  test("iterator_size_hint", () => {
    let c = range_from(0).step_by(1);
    let v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let v2 = [10, 11, 12];
    let vi = v.iter();

    assert_eq(range_from(0).size_hint(), [U64_MAX, None<number>()]);
    assert_eq(c.size_hint(), [U64_MAX, None<number>()]);
    assert_eq(vi.clone().size_hint(), [10, Some(10)]);

    assert_eq(
      c
        .clone()
        .take(5)
        .size_hint(),
      [5, Some(5)]
    );
    assert_eq(
      c
        .clone()
        .skip(5)
        .size_hint()[1],
      None()
    );
    assert_eq(
      c
        .clone()
        .take_while(() => false)
        .size_hint(),
      [0, None<number>()]
    );
    assert_eq(
      c
        .clone()
        .skip_while(() => false)
        .size_hint(),
      [0, None<number>()]
    );
    assert_eq(
      c
        .clone()
        .enumerate()
        .size_hint(),
      [U64_MAX, None<number>()]
    );
    assert_eq(
      c
        .clone()
        .chain(vi.clone().cloned())
        .size_hint(),
      [U64_MAX, None<number>()]
    );
    assert_eq(
      c
        .clone()
        .zip(vi.clone())
        .size_hint(),
      [10, Some(10)]
    );
    assert_eq(
      c
        .clone()
        .scan(0, () => Some(0))
        .size_hint(),
      [0, None<number>()]
    );
    assert_eq(
      c
        .clone()
        .filter(() => false)
        .size_hint(),
      [0, None<number>()]
    );
    assert_eq(
      c
        .clone()
        .map(() => 0)
        .size_hint(),
      [U64_MAX, None<number>()]
    );
    assert_eq(c.filter_map(() => Some(0)).size_hint(), [0, None<number>()]);

    assert_eq(
      vi
        .clone()
        .take(5)
        .size_hint(),
      [5, Some(5)]
    );
    assert_eq(
      vi
        .clone()
        .take(12)
        .size_hint(),
      [10, Some(10)]
    );
    assert_eq(
      vi
        .clone()
        .skip(3)
        .size_hint(),
      [7, Some(7)]
    );
    assert_eq(
      vi
        .clone()
        .skip(12)
        .size_hint(),
      [0, Some(0)]
    );
    assert_eq(
      vi
        .clone()
        .take_while(() => false)
        .size_hint(),
      [0, Some(10)]
    );
    assert_eq(
      vi
        .clone()
        .skip_while(() => false)
        .size_hint(),
      [0, Some(10)]
    );
    assert_eq(
      vi
        .clone()
        .enumerate()
        .size_hint(),
      [10, Some(10)]
    );
    assert_eq(
      vi
        .clone()
        .chain(v2)
        .size_hint(),
      [13, Some(13)]
    );
    assert_eq(
      vi
        .clone()
        .zip(v2.iter())
        .size_hint(),
      [3, Some(3)]
    );
    assert_eq(
      vi
        .clone()
        .scan(0, () => Some(0))
        .size_hint(),
      [0, Some(10)]
    );
    assert_eq(
      vi
        .clone()
        .filter(() => false)
        .size_hint(),
      [0, Some(10)]
    );
    assert_eq(
      vi
        .clone()
        .map(i => i + 1)
        .size_hint(),
      [10, Some(10)]
    );
    assert_eq(vi.filter_map(() => Some(0)).size_hint(), [0, Some(10)]);
  });

  test("collect", () => {
    let a = [1, 2, 3, 4, 5];
    let b = a
      .iter()
      .cloned()
      .collect();
    assert_eq(a, b);
  });

  test("all", () => {
    let v = [1, 2, 3, 4, 5];
    assert(v.iter().all((x: number) => x < 10));
    assert(!v.iter().all((x: number) => x % 2 === 0));
    assert(!v.iter().all((x: number) => x > 100));
    assert(
      v
        .slice(0, 0)
        .iter()
        .all(() => {
          throw new Error("");
        })
    );
  });

  test("any", () => {
    let v = [1, 2, 3, 4, 5];
    assert(v.iter().any((x: number) => x < 10));
    assert(v.iter().any((x: number) => x % 2 === 0));
    assert(!v.iter().any((x: number) => x > 100));
    assert(
      !v
        .slice(0, 0)
        .iter()
        .any(() => {
          throw new Error("");
        })
    );
  });

  test("find", () => {
    let v = [1, 3, 9, 27, 103, 14, 11];
    assert_eq(
      v
        .iter()
        .find((x: number) => (x & 1) === 0)
        .unwrap(),
      14
    );
    assert_eq(
      v
        .iter()
        .find((x: number) => x % 3 === 0)
        .unwrap(),
      3
    );
    assert(
      v
        .iter()
        .find((x: number) => x % 12 === 0)
        .is_none()
    );
  });

  test("find_map", () => {
    const half_if_even = (x: number): Option<number> => {
      if (x % 2 === 0) {
        return Some(x / 2);
      } else {
        return None();
      }
    };

    let xs: number[] = [];
    assert_eq(xs.iter().find_map(half_if_even), None());
    xs = [3, 5];
    assert_eq(xs.iter().find_map(half_if_even), None());
    xs = [4, 5];
    assert_eq(xs.iter().find_map(half_if_even), Some(2));
    xs = [3, 6];
    assert_eq(xs.iter().find_map(half_if_even), Some(3));

    xs = [1, 2, 3, 4, 5, 6, 7];
    let iter = xs.iter();
    assert_eq(iter.find_map(half_if_even), Some(1));
    assert_eq(iter.find_map(half_if_even), Some(2));
    assert_eq(iter.find_map(half_if_even), Some(3));
    assert_eq(iter.next(), Some(7));
  });

  test("position", () => {
    let v = [1, 3, 9, 27, 103, 14, 11];
    assert_eq(
      v
        .iter()
        .position((x: number) => (x & 1) === 0)
        .unwrap(),
      5
    );
    assert_eq(
      v
        .iter()
        .position((x: number) => x % 3 === 0)
        .unwrap(),
      1
    );
    assert(
      v
        .iter()
        .position((x: number) => x % 12 === 0)
        .is_none()
    );
  });

  test("count", () => {
    let xs = [1, 2, 2, 1, 5, 9, 0, 2];
    assert_eq(
      xs
        .iter()
        .filter((x: number) => x === 2)
        .count(),
      3
    );
    assert_eq(
      xs
        .iter()
        .filter((x: number) => x === 5)
        .count(),
      1
    );
    assert_eq(
      xs
        .iter()
        .filter((x: number) => x === 95)
        .count(),
      0
    );
  });

  test("max_by_key", () => {
    let xs = [-3, 0, 1, 5, -10];
    assert_eq(
      xs
        .iter()
        .max_by_key((x: number) => Math.abs(x))
        .unwrap(),
      -10
    );
  });

  test("max_by", () => {
    let xs = [-3, 0, 1, 5, -10];
    assert_eq(
      xs
        .iter()
        .max_by((x: number, y: number) => cmp(Math.abs(x), Math.abs(y)))
        .unwrap(),
      -10
    );
  });

  test("min_by_key", () => {
    let xs = [-3, 0, 1, 5, -10];
    assert_eq(
      xs
        .iter()
        .min_by_key((x: number) => Math.abs(x))
        .unwrap(),
      0
    );
  });

  test("min_by", () => {
    let xs = [-3, 0, 1, 5, -10];
    assert_eq(
      xs
        .iter()
        .min_by((x: number, y: number) => cmp(Math.abs(x), Math.abs(y)))
        .unwrap(),
      0
    );
  });

  //   // TODO: look into test_by_ref

  test("rev", () => {
    let xs = [2, 4, 6, 8, 10, 12, 14, 16];
    let it = xs.iter();
    it.next();
    it.next();
    assert_eq(
      it
        .rev()
        .cloned()
        .collect(),
      [16, 14, 12, 10, 8, 6]
    );
  });

  test("cloned", () => {
    let xs = [2, 4, 6, 8];

    let it = xs.iter().cloned();
    assert_eq(it.len(), 4);
    assert_eq(it.next(), Some(2));
    assert_eq(it.len(), 3);
    assert_eq(it.next(), Some(4));
    assert_eq(it.len(), 2);
    assert_eq(it.next_back(), Some(8));
    assert_eq(it.len(), 1);
    assert_eq(it.next_back(), Some(6));
    assert_eq(it.len(), 0);
    assert_eq(it.next_back(), None());
  });

  test("cloned_side_effects", () => {
    let count = 0;
    {
      let iter = [1, 2, 3]
        .iter()
        .map((x: number) => {
          count += 1;
          return x;
        })
        .cloned()
        .zip([1].iter());
      for (let _ of iter) {
      }
    }
    assert_eq(count, 2);
  });

  test("double_ended_map", () => {
    let xs = [1, 2, 3, 4, 5, 6];
    let it = xs.iter().map((x: number) => x * -1);
    assert_eq(it.next(), Some(-1));
    assert_eq(it.next(), Some(-2));
    assert_eq(it.next_back(), Some(-6));
    assert_eq(it.next_back(), Some(-5));
    assert_eq(it.next(), Some(-3));
    assert_eq(it.next_back(), Some(-4));
    assert_eq(it.next(), None());
  });

  test("double_ended_enumerate", () => {
    let xs = [1, 2, 3, 4, 5, 6];
    let it = xs
      .iter()
      .cloned()
      .enumerate();
    assert_eq(it.next(), Some<[number, number]>([0, 1]));
    assert_eq(it.next(), Some<[number, number]>([1, 2]));
    assert_eq(it.next_back(), Some<[number, number]>([5, 6]));
    assert_eq(it.next_back(), Some<[number, number]>([4, 5]));
    assert_eq(it.next_back(), Some<[number, number]>([3, 4]));
    assert_eq(it.next_back(), Some<[number, number]>([2, 3]));
    assert_eq(it.next(), None<[number, number]>());
  });

  test("double_ended_zip", () => {
    let xs = [1, 2, 3, 4, 5, 6];
    let ys = [1, 2, 3, 7];
    let a = xs.iter().cloned();
    let b = ys.iter().cloned();
    let it = a.zip(b);
    assert_eq(it.next(), Some<[number, number]>([1, 1]));
    assert_eq(it.next(), Some<[number, number]>([2, 2]));
    assert_eq(it.next_back(), Some<[number, number]>([4, 7]));
    assert_eq(it.next_back(), Some<[number, number]>([3, 3]));
    assert_eq(it.next(), None());
  });

  test("double_ended_filter", () => {
    let xs = [1, 2, 3, 4, 5, 6];
    let it = xs.iter().filter(x => (x & 1) === 0);
    assert_eq(it.next_back().unwrap(), 6);
    assert_eq(it.next_back().unwrap(), 4);
    assert_eq(it.next().unwrap(), 2);
    assert_eq(it.next_back(), None());
  });

  test("double_ended_filter_map", () => {
    let xs = [1, 2, 3, 4, 5, 6];
    let it = xs.iter().filter_map(x => ((x & 1) === 0 ? Some(x * 2) : None<number>()));
    assert_eq(it.next_back().unwrap(), 12);
    assert_eq(it.next_back().unwrap(), 8);
    assert_eq(it.next().unwrap(), 4);
    assert_eq(it.next_back(), None());
  });

  test("double_ended_chain", () => {
    let xs = [1, 2, 3, 4, 5];
    let ys = [7, 9, 11];
    let it = xs
      .iter()
      .chain(ys)
      .rev();
    assert_eq(it.next().unwrap(), 11);
    assert_eq(it.next().unwrap(), 9);
    assert_eq(it.next_back().unwrap(), 1);
    assert_eq(it.next_back().unwrap(), 2);
    assert_eq(it.next_back().unwrap(), 3);
    assert_eq(it.next_back().unwrap(), 4);
    assert_eq(it.next_back().unwrap(), 5);
    assert_eq(it.next_back().unwrap(), 7);
    assert_eq(it.next_back(), None());

    // TODO: make sure this works after integrating FusedIterator
    // test that .chain() is well behaved with an unfused iterator
    class CrazyIterator extends DoubleEndedIterator<number> {
      Self!: CrazyIterator;
      Item!: number;
      0: boolean;
      constructor(b: boolean = false) {
        super();
        this[0] = b;
      }
      next(): Option<number> {
        if (this[0]) {
          return Some(99);
        } else {
          this[0] = true;
          return None();
        }
      }
      next_back(): Option<number> {
        return this.next();
      }
    }

    assert_eq(
      new CrazyIterator()
        .chain(range(0, 10))
        .rev()
        .last(),
      Some(0)
    );
    assert(
      range(0, 10)
        .chain(new CrazyIterator())
        .rev()
        .any((i: number) => i === 0)
    );
  });

  test("rposition", () => {
    const f = (xy: [number, string]): boolean => {
      let [_x, y] = xy;
      return y === "b";
    };
    const g = (xy: [number, string]): boolean => {
      let [_x, y] = xy;
      return y === "d";
    };
    let v: [number, string][] = [[0, "a"], [1, "b"], [2, "c"], [3, "b"]];

    assert_eq(v.iter().rposition(f), Some(3));
    assert(
      v
        .iter()
        .rposition(g)
        .is_none()
    );
  });

  test("rev_rposition", () => {
    let v = [0, 0, 1, 1];
    assert_eq(
      v
        .iter()
        .rev()
        .rposition((x: number) => x === 1),
      Some(1)
    );
  });

  test("rposition_panic", () => {
    let v = [[0, 0], [0, 0], [0, 0], [0, 0]];
    let i = 0;
    should_panic(() => {
      v.iter().rposition(_elt => {
        if (i === 2) {
          throw new Error("");
        }
        i += 1;
        return false;
      });
    });
  });

  test("double_ended_flat_map", () => {
    let u = [0, 1];
    let v = [5, 6, 7, 8];
    let it = u.iter().flat_map((x: number) => v.slice(x, v.len()));
    assert_eq(it.next_back().unwrap(), 8);
    assert_eq(it.next().unwrap(), 5);
    assert_eq(it.next_back().unwrap(), 7);
    assert_eq(it.next_back().unwrap(), 6);
    assert_eq(it.next_back().unwrap(), 8);
    assert_eq(it.next().unwrap(), 6);
    assert_eq(it.next_back().unwrap(), 7);
    assert_eq(it.next_back(), None());
    assert_eq(it.next(), None());
    assert_eq(it.next_back(), None());
  });

  test("double_ended_flatten", () => {
    let u = [0, 1];
    let v = [5, 6, 7, 8];
    let it = u
      .iter()
      .map((x: number) => v.slice(x, v.len()))
      .flatten();
    assert_eq(it.next_back().unwrap(), 8);
    assert_eq(it.next().unwrap(), 5);
    assert_eq(it.next_back().unwrap(), 7);
    assert_eq(it.next_back().unwrap(), 6);
    assert_eq(it.next_back().unwrap(), 8);
    assert_eq(it.next().unwrap(), 6);
    assert_eq(it.next_back().unwrap(), 7);
    assert_eq(it.next_back(), None());
    assert_eq(it.next(), None());
    assert_eq(it.next_back(), None());
  });

  test("double_ended_range", () => {
    assert_eq(
      range(11, 14)
        .rev()
        .collect(),
      [13, 12, 11]
    );
    for (let _ of range(10, 0).rev()) {
      throw new Error("unreachable");
    }
  });

  test("range", () => {
    assert_eq(range(0, 5).collect(), [0, 1, 2, 3, 4]);
    assert_eq(range(-10, -1).collect(), [-10, -9, -8, -7, -6, -5, -4, -3, -2]);
    assert_eq(
      range(0, 5)
        .rev()
        .collect(),
      [4, 3, 2, 1, 0]
    );
    assert_eq(range(200, -5).count(), 0);
    assert_eq(
      range(200, -5)
        .rev()
        .count(),
      0
    );
    assert_eq(range(200, 200).count(), 0);
    assert_eq(
      range(200, 200)
        .rev()
        .count(),
      0
    );

    assert_eq(range(0, 100).size_hint(), [100, Some(100)]);
    assert_eq(range(-10, -1).size_hint(), [9, Some(9)]);
    assert_eq(range(-1, -10).size_hint(), [0, Some(0)]);

    assert_eq(range(-70, 58).size_hint(), [128, Some(128)]);
    assert_eq(range(-128, 127).size_hint(), [255, Some(255)]);
    assert_eq(range(-2, Number.MAX_VALUE).size_hint(), [
      Number.MAX_VALUE + 2,
      Some(Number.MAX_VALUE + 2)
    ]);
  });

  test("range_exhaustion", () => {
    let r = range(10, 10);
    assert(r.is_empty());
    assert_eq(r.next(), None());
    assert_eq(r.next_back(), None());
    assert_eq(r, range(10, 10));

    r = range(10, 12);
    assert_eq(r.next(), Some(10));
    assert_eq(r.next(), Some(11));
    assert(r.is_empty());
    assert_eq(r, range(12, 12));
    assert_eq(r.next(), None());

    r = range(10, 12);
    assert_eq(r.next_back(), Some(11));
    assert_eq(r.next_back(), Some(10));
    assert(r.is_empty());
    assert_eq(r, range(10, 10));
    assert_eq(r.next_back(), None());

    r = range(100, 10);
    assert(r.is_empty());
    assert_eq(r.next(), None());
    assert_eq(r.next_back(), None());
    assert_eq(r, range(100, 10));
  });

  test("range_inclusive_exhaustion", () => {
    let r = range_inclusive(10, 10);
    assert_eq(r.next(), Some(10));
    assert(r.is_empty());
    assert_eq(r.next(), None());
    assert_eq(r.next(), None());

    r = range_inclusive(10, 10);
    assert_eq(r.next_back(), Some(10));
    assert(r.is_empty());
    assert_eq(r.next_back(), None());

    r = range_inclusive(10, 12);
    assert_eq(r.next(), Some(10));
    assert_eq(r.next(), Some(11));
    assert_eq(r.next(), Some(12));
    assert(r.is_empty());
    assert_eq(r.next(), None());

    r = range_inclusive(10, 12);
    assert_eq(r.next_back(), Some(12));
    assert_eq(r.next_back(), Some(11));
    assert_eq(r.next_back(), Some(10));
    assert(r.is_empty());
    assert_eq(r.next_back(), None());

    r = range_inclusive(10, 12);
    assert_eq(r.nth(2), Some(12));
    assert(r.is_empty());
    assert_eq(r.next(), None());

    r = range_inclusive(10, 12);
    assert_eq(r.nth(5), None());
    assert(r.is_empty());
    assert_eq(r.next(), None());

    r = range_inclusive(100, 10);
    assert_eq(r.next(), None());
    assert(r.is_empty());
    assert_eq(r.next(), None());
    assert_eq(r.next(), None());
    assert_eq(r, range_inclusive(100, 10));

    r = range_inclusive(100, 10);
    assert_eq(r.next_back(), None());
    assert(r.is_empty());
    assert_eq(r.next_back(), None());
    assert_eq(r.next_back(), None());
    assert_eq(r, range_inclusive(100, 10));
  });

  test("range_nth", () => {
    assert_eq(range(10, 15).nth(0), Some(10));
    assert_eq(range(10, 15).nth(1), Some(11));
    assert_eq(range(10, 15).nth(4), Some(14));
    assert_eq(range(10, 15).nth(5), None());

    let r = range(10, 20);
    assert_eq(r.nth(2), Some(12));
    assert_eq(r, range(13, 20));
    assert_eq(r.nth(2), Some(15));
    assert_eq(r, range(16, 20));
    assert_eq(r.nth(10), None());
    assert_eq(r, range(20, 20));
  });

  test("range_nth_back", () => {
    assert_eq(range(10, 15).nth_back(0), Some(14));
    assert_eq(range(10, 15).nth_back(1), Some(13));
    assert_eq(range(10, 15).nth_back(4), Some(10));
    assert_eq(range(10, 15).nth_back(5), None());
    assert_eq(range(-120, 80).nth_back(199), Some(-120));

    let r = range(10, 20);
    assert_eq(r.nth_back(2), Some(17));
    assert_eq(r, range(10, 17));
    assert_eq(r.nth_back(2), Some(14));
    assert_eq(r, range(10, 14));
    assert_eq(r.nth_back(10), None());
    assert_eq(r, range(10, 10));
  });

  test("range_from_nth", () => {
    assert_eq(range_from(10).nth(0), Some(10));
    assert_eq(range_from(10).nth(1), Some(11));
    assert_eq(range_from(10).nth(4), Some(14));

    let r = range_from(10);
    assert_eq(r.nth(2), Some(12));
    assert_eq(r, range_from(13));
    assert_eq(r.nth(2), Some(15));
    assert_eq(r, range_from(16));
    assert_eq(r.nth(10), Some(26));
    assert_eq(r, range_from(27));

    assert_eq(range_from(0).size_hint(), [U64_MAX, None<number>()]);
  });

  test("range_from_take", () => {
    let it = range_from(0).take(3);
    assert_eq(it.next(), Some(0));
    assert_eq(it.next(), Some(1));
    assert_eq(it.next(), Some(2));
    assert_eq(it.next(), None());
    assert_eq(
      range_from(0)
        .take(3)
        .size_hint(),
      [3, Some(3)]
    );
    assert_eq(
      range_from(0)
        .take(0)
        .size_hint(),
      [0, Some(0)]
    );
    assert_eq(
      range_from(0)
        .take(U64_MAX)
        .size_hint(),
      [U64_MAX, Some(U64_MAX)]
    );
  });

  test("range_from_take_collect", () => {
    let v = range_from(0)
      .take(3)
      .collect();
    assert_eq(v, [0, 1, 2]);
  });

  test("range_inclusive_nth", () => {
    assert_eq(range_inclusive(10, 15).nth(0), Some(10));
    assert_eq(range_inclusive(10, 15).nth(1), Some(11));
    assert_eq(range_inclusive(10, 15).nth(5), Some(15));
    assert_eq(range_inclusive(10, 15).nth(6), None());

    let r = range_inclusive(10, 20);
    assert_eq(r.nth(2), Some(12));
    assert_eq(r, range_inclusive(13, 20));
    assert_eq(r.nth(2), Some(15));
    assert_eq(r, range_inclusive(16, 20));
    assert_eq(r.is_empty(), false);
    assert_eq(r.nth(10), None());
    assert_eq(r.is_empty(), true);
  });

  test("range_inclusive_nth_back", () => {
    assert_eq(range_inclusive(10, 15).nth_back(0), Some(15));
    assert_eq(range_inclusive(10, 15).nth_back(1), Some(14));
    assert_eq(range_inclusive(10, 15).nth_back(5), Some(10));
    assert_eq(range_inclusive(10, 15).nth_back(6), None());
    assert_eq(range_inclusive(-120, 80).nth_back(200), Some(-120));

    let r = range_inclusive(10, 20);
    assert_eq(r.nth_back(2), Some(18));
    assert_eq(r, range_inclusive(10, 17));
    assert_eq(r.nth_back(2), Some(15));
    assert_eq(r, range_inclusive(10, 14));
    assert_eq(r.is_empty(), false);
    assert_eq(r.nth_back(10), None());
    assert_eq(r.is_empty(), true);
  });

  test("range_step", () => {
    assert_eq(
      range(0, 20)
        .step_by(5)
        .collect(),
      [0, 5, 10, 15]
    );
    assert_eq(
      range(1, 21)
        .rev()
        .step_by(5)
        .collect(),
      [20, 15, 10, 5]
    );
    assert_eq(
      range(1, 21)
        .rev()
        .step_by(6)
        .collect(),
      [20, 14, 8, 2]
    );
    assert_eq(
      range(200, 255)
        .step_by(50)
        .collect(),
      [200, 250]
    );
    assert_eq(
      range(200, -5)
        .step_by(1)
        .collect(),
      []
    );
    assert_eq(
      range(200, 200)
        .step_by(1)
        .collect(),
      []
    );

    assert_eq(
      range(0, 20)
        .step_by(1)
        .size_hint(),
      [20, Some(20)]
    );
    assert_eq(
      range(0, 20)
        .step_by(21)
        .size_hint(),
      [1, Some(1)]
    );
    assert_eq(
      range(0, 20)
        .step_by(5)
        .size_hint(),
      [4, Some(4)]
    );
    assert_eq(
      range(1, 21)
        .rev()
        .step_by(5)
        .size_hint(),
      [4, Some(4)]
    );
    assert_eq(
      range(1, 21)
        .rev()
        .step_by(6)
        .size_hint(),
      [4, Some(4)]
    );
    assert_eq(
      range(20, -5)
        .step_by(1)
        .size_hint(),
      [0, Some(0)]
    );
    assert_eq(
      range(20, 20)
        .step_by(1)
        .size_hint(),
      [0, Some(0)]
    );
    // FIXME
    // assert_eq(range(I64_MIN, I64_MAX).step_by(1).size_hint(), [U64_MAX, Some(U64_MAX)]);
  });

  test("step_by_skip", () => {
    assert_eq(
      range(0, 640)
        .step_by(128)
        .skip(1)
        .collect(),
      [128, 256, 384, 512]
    );
    assert_eq(
      range_inclusive(0, 50)
        .step_by(10)
        .nth(3),
      Some(30)
    );
    assert_eq(
      range_inclusive(200, 255)
        .step_by(10)
        .nth(3),
      Some(230)
    );
  });

  test("range_inclusive_step", () => {
    assert_eq(
      range_inclusive(0, 50)
        .step_by(10)
        .collect(),
      [0, 10, 20, 30, 40, 50]
    );
    assert_eq(
      range_inclusive(0, 5)
        .step_by(1)
        .collect(),
      [0, 1, 2, 3, 4, 5]
    );
    assert_eq(
      range_inclusive(200, 255)
        .step_by(10)
        .collect(),
      [200, 210, 220, 230, 240, 250]
    );
    assert_eq(
      range_inclusive(250, 255)
        .step_by(1)
        .collect(),
      [250, 251, 252, 253, 254, 255]
    );
  });

  test("range_last_max", () => {
    assert_eq(range(0, 20).last(), Some(19));
    assert_eq(range(-20, 0).last(), Some(-1));
    assert_eq(range(5, 5).last(), None());

    assert_eq(range(0, 20).max(), Some(19));
    assert_eq(range(-20, 0).max(), Some(-1));
    assert_eq(range(5, 5).max(), None());
  });

  test("range_inclusive_last_max", () => {
    assert_eq(range_inclusive(0, 20).last(), Some(20));
    assert_eq(range_inclusive(-20, 0).last(), Some(0));
    assert_eq(range_inclusive(5, 5).last(), Some(5));
    let r = range_inclusive(10, 10);
    r.next();
    assert_eq(r.last(), None());

    assert_eq(range_inclusive(0, 20).max(), Some(20));
    assert_eq(range_inclusive(-20, 0).max(), Some(0));
    assert_eq(range_inclusive(5, 5).max(), Some(5));
    r = range_inclusive(10, 10);
    r.next();
    assert_eq(r.max(), None());
  });

  test("range_min", () => {
    assert_eq(range(0, 20).min(), Some(0));
    assert_eq(range(-20, 0).min(), Some(-20));
    assert_eq(range(5, 5).min(), None());
  });

  test("range_inclusive_min", () => {
    assert_eq(range_inclusive(0, 20).min(), Some(0));
    assert_eq(range_inclusive(-20, 0).min(), Some(-20));
    assert_eq(range_inclusive(5, 5).min(), Some(5));
    let r = range_inclusive(10, 10);
    r.next();
    assert_eq(r.min(), None());
  });

  test("range_inclusive_folds", () => {
    assert_eq(range_inclusive(1, 10).sum(), 55);
    assert_eq(
      range_inclusive(1, 10)
        .rev()
        .sum(),
      55
    );

    let it = range_inclusive(44, 50);
    assert_eq(it.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(it, range_inclusive(47, 50));
    assert_eq(it.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(it, range_inclusive(50, 50));
    assert_eq(it.try_fold<number, Option<number>>(0, Option, i8_checked_add), Some(50));
    assert(it.is_empty());
    assert_eq(it.try_fold<number, Option<number>>(0, Option, i8_checked_add), Some(0));
    assert(it.is_empty());

    it = range_inclusive(40, 47);
    assert_eq(it.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(it, range_inclusive(40, 44));
    assert_eq(it.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(it, range_inclusive(40, 41));
    assert_eq(it.try_rfold<number, Option<number>>(0, Option, i8_checked_add), Some(81));
    assert(it.is_empty());
    assert_eq(it.try_rfold<number, Option<number>>(0, Option, i8_checked_add), Some(0));
    assert(it.is_empty());

    it = range_inclusive(10, 20);
    assert_eq(
      it.try_fold<number, Option<number>>(0, Option, (a: number, b: number) => Some(a + b)),
      Some(165)
    );
    assert(it.is_empty());
    assert_eq(
      it.try_fold<number, Option<number>>(0, Option, (a: number, b: number) => Some(a + b)),
      Some(0)
    );
    assert(it.is_empty());

    it = range_inclusive(10, 20);
    assert_eq(
      it.try_rfold<number, Option<number>>(0, Option, (a: number, b: number) => Some(a + b)),
      Some(165)
    );
    assert(it.is_empty());
    assert_eq(
      it.try_rfold<number, Option<number>>(0, Option, (a: number, b: number) => Some(a + b)),
      Some(0)
    );
    assert(it.is_empty());
  });

  test("range_size_hint", () => {
    assert_eq(range(0, 0).size_hint(), [0, Some(0)]);
    assert_eq(range(0, 100).size_hint(), [100, Some(100)]);
    assert_eq(range(0, U64_MAX).size_hint(), [U64_MAX, Some(U64_MAX)]);

    assert_eq(range(0, 0).size_hint(), [0, Some(0)]);
    assert_eq(range(0, 100).size_hint(), [100, Some(100)]);
    assert_eq(range(0, U64_MAX).size_hint(), [U64_MAX, Some(U64_MAX)]);
    // FIXME
    // assert_eq(range(0, U64_MAX + 1).size_hint(), [U64_MAX, None<number>()]);

    assert_eq(range(0, 0).size_hint(), [0, Some(0)]);
    assert_eq(range(-100, 100).size_hint(), [200, Some(200)]);
    // FIXME
    // assert_eq(range(I64_MIN, I64_MAX).size_hint(), [U64_MAX, Some(U64_MAX)]);
  });

  test("range_inclusive_size_hint", () => {
    assert_eq(range_inclusive(1, 0).size_hint(), [0, Some(0)]);
    assert_eq(range_inclusive(0, 0).size_hint(), [1, Some(1)]);
    assert_eq(range_inclusive(0, 100).size_hint(), [101, Some(101)]);
    // FIXME
    // assert_eq(range_inclusive(0, U64_MAX - 1).size_hint(), [U64_MAX, Some(U64_MAX)]);
    assert_eq(range_inclusive(0, U64_MAX).size_hint(), [U64_MAX, None<number>()]);

    assert_eq(range_inclusive(0, -1).size_hint(), [0, Some(0)]);
    assert_eq(range_inclusive(0, 0).size_hint(), [1, Some(1)]);
    assert_eq(range_inclusive(-100, 100).size_hint(), [201, Some(201)]);
    // FIXME
    // assert_eq(range_inclusive(I64_MIN, I64_MAX - 1).size_hint(), [U64_MAX, Some(U64_MAX)]);
    assert_eq(range_inclusive(I64_MIN, I64_MAX).size_hint(), [U64_MAX, None<number>()]);
  });

  test("repeat", () => {
    let it = repeat(42);
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), Some(42));
    assert_eq(repeat(42).size_hint(), [U64_MAX, None<number>()]);
  });

  test("repeat_take", () => {
    let it = repeat(42).take(3);
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), None());
    assert_eq(
      repeat(42)
        .take(3)
        .size_hint(),
      [3, Some(3)]
    );
    assert_eq(
      repeat(42)
        .take(0)
        .size_hint(),
      [0, Some(0)]
    );
    assert_eq(
      repeat(42)
        .take(U64_MAX)
        .size_hint(),
      [U64_MAX, Some(U64_MAX)]
    );
  });

  test("repeat_take_collect", () => {
    let v = repeat(42)
      .take(3)
      .collect();
    assert_eq(v, [42, 42, 42]);
  });

  test("repeat_with", () => {
    class NotClone {
      0: number;
      constructor(n: number) {
        this[0] = n;
      }
    }
    let it = repeat_with(() => new NotClone(42));
    assert_eq(it.next(), Some(new NotClone(42)));
    assert_eq(it.next(), Some(new NotClone(42)));
    assert_eq(it.next(), Some(new NotClone(42)));
    assert_eq(repeat_with(() => new NotClone(42)).size_hint(), [U64_MAX, None<number>()]);
  });

  test("repeat_with_take", () => {
    let it = repeat_with(() => 42).take(3);
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), None());
    assert_eq(
      repeat_with(() => 42)
        .take(3)
        .size_hint(),
      [3, Some(3)]
    );
    assert_eq(
      repeat_with(() => 42)
        .take(0)
        .size_hint(),
      [0, Some(0)]
    );
    assert_eq(
      repeat_with(() => 42)
        .take(U64_MAX)
        .size_hint(),
      [U64_MAX, Some(U64_MAX)]
    );
  });

  test("repeat_with_take_collect", () => {
    let curr = 1;
    let v = repeat_with(() => {
      let tmp = curr;
      curr *= 2;
      return tmp;
    })
      .take(5)
      .collect();
    assert_eq(v, [1, 2, 4, 8, 16]);
  });

  test("successors", () => {
    let powers_of_10 = successors(Some(1), (n: number) => i8_checked_mul(n, 10));
    assert_eq(powers_of_10.collect(), [1, 10, 100]);
    assert_eq(powers_of_10.next(), None());

    let empty = successors(None<number>(), () => {
      throw new Error("unimplemented");
    });
    assert_eq(empty.next(), None<number>());
    assert_eq(empty.next(), None<number>());
  });

  test("fuse", () => {
    let it = range(0, 3);
    assert_eq(it.len(), 3);
    assert_eq(it.next(), Some(0));
    assert_eq(it.len(), 2);
    assert_eq(it.next(), Some(1));
    assert_eq(it.len(), 1);
    assert_eq(it.next(), Some(2));
    assert_eq(it.len(), 0);
    assert_eq(it.next(), None());
    assert_eq(it.len(), 0);
    assert_eq(it.next(), None());
    assert_eq(it.len(), 0);
    assert_eq(it.next(), None());
    assert_eq(it.len(), 0);
  });

  test("fuse_nth", () => {
    let xs = [0, 1, 2];
    let it = xs.iter();

    assert_eq(it.len(), 3);
    assert_eq(it.nth(2), Some(2));
    assert_eq(it.len(), 0);
    assert_eq(it.nth(2), None());
    assert_eq(it.len(), 0);
  });

  test("fuse_last", () => {
    let xs = [0, 1, 2];
    let it = xs.iter();

    assert_eq(it.len(), 3);
    assert_eq(it.last(), Some(2));
  });

  test("fuse_count", () => {
    let xs = [0, 1, 2];
    let it = xs.iter();

    assert_eq(it.len(), 3);
    assert_eq(it.count(), 3);
    // Cant' check len now because count consumes.
  });

  // FIXME Need to implement FusedIterator to adapters
  // test("fuse_fold", () => {
  //   let xs = [0, 1, 2];
  //   let it = xs.iter(); // `FusedIterator`
  //   let i = it.fuse().fold<number>(0, (i: number, x: number) => {
  //     assert_eq(x, xs[i]);
  //     return i + 1;
  //   });
  //   assert_eq(i, xs.len());
  //
  //   it = xs.iter(); // `FusedIterator`
  //   i = it.fuse().rfold(xs.len(), (i: number, x: number) => {
  //     assert_eq(x, xs[i - 1]);
  //     return i - 1;
  //   })
  //   assert_eq(i, 0);
  //
  //   let it2 = xs.iter().scan(undefined, (_, x: number) => Some(x)); `!FusedIterator`
  //   i = it2.fuse().fold<number>(0, (i: number, x: number) => {
  //     assert_eq(x, xs[i]);
  //     return i + 1;
  //   })
  //   assert_eq(i, xs.len());
  // });

  test("once", () => {
    let it = once(42);
    assert_eq(it.next(), Some(42));
    assert_eq(it.next(), None());
  });

  test("once_with", () => {
    let count = 0;
    let it = once_with(() => {
      count += 1;
      return 42;
    });

    assert_eq(count, 0);
    assert_eq(it.next(), Some(42));
    assert_eq(count, 1);
    assert_eq(it.next(), None());
    assert_eq(count, 1);
    assert_eq(it.next(), None());
    assert_eq(count, 1);
  });

  test("empty", () => {
    let it = empty<number>();
    assert_eq(it.next(), None<number>());
  });

  test("chain_fold", () => {
    let xs = [1, 2, 3];
    let ys = [1, 2, 0];

    let iter = xs.iter().chain(ys);
    iter.next();
    let result: number[] = [];
    iter.fold(undefined, (_: undefined, elt: number) => {
      result.push(elt);
      return undefined;
    });
    assert_eq(result, [2, 3, 1, 2, 0]);
  });

  test("rev_try_folds", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      range(1, 10)
        .rev()
        .try_fold<number, Option<number>>(7, Option, f),
      range(1, 10).try_rfold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(1, 10)
        .rev()
        .try_rfold<number, Option<number>>(7, Option, f),
      range(1, 10).try_fold<number, Option<number>>(7, Option, f)
    );

    let a = [10, 20, 30, 40, 100, 60, 70, 80, 90];
    let iter = a.iter().rev();
    assert_eq(
      iter.try_fold<number, Option<number>>(0, Option, (acc: number, x: number) =>
        i8_checked_add(acc, x)
      ),
      None()
    );
    assert_eq(iter.next(), Some(70));
    iter = a.iter().rev();
    assert_eq(
      iter.try_rfold<number, Option<number>>(0, Option, (acc: number, x: number) =>
        i8_checked_add(acc, x)
      ),
      None()
    );
    assert_eq(iter.next_back(), Some(60));
  });

  test("cloned_try_folds", () => {
    let a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      a
        .iter()
        .cloned()
        .try_fold<number, Option<number>>(7, Option, f),
      a.iter().try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      a
        .iter()
        .cloned()
        .try_rfold<number, Option<number>>(7, Option, f),
      a.iter().try_rfold<number, Option<number>>(7, Option, f)
    );

    a = [10, 20, 30, 40, 100, 60, 70, 80, 90];
    let iter = a.iter().cloned();
    assert_eq(
      iter.try_fold<number, Option<number>>(0, Option, (acc: number, x: number) =>
        i8_checked_add(acc, x)
      ),
      None()
    );
    assert_eq(iter.next(), Some(60));
    iter = a.iter().cloned();
    assert_eq(
      iter.try_rfold<number, Option<number>>(0, Option, (acc: number, x: number) =>
        i8_checked_add(acc, x)
      ),
      None()
    );
    assert_eq(iter.next_back(), Some(70));
  });

  test("chain_try_folds", () => {
    let c = () => range(0, 10).chain(range(10, 20));

    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      c().try_fold<number, Option<number>>(7, Option, f),
      range(0, 20).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      c().try_rfold<number, Option<number>>(7, Option, f),
      range(0, 20)
        .rev()
        .try_fold<number, Option<number>>(7, Option, f)
    );
    {
      let iter = c();
      assert_eq(iter.position((x: number) => x === 5), Some(5));
      assert_eq(iter.next(), Some(6)); // stopped in front, state Both
      assert_eq(iter.position((x: number) => x === 13), Some(6));
      assert_eq(iter.next(), Some(14)); // stopped in back, state Back
      assert_eq(
        iter.try_fold<number, Option<number>>(0, Option, (acc: number, x: number) => Some(acc + x)),
        Some(range(15, 20).sum())
      );
    }
    {
      let iter = c().rev(); // use reve to access try_rfold
      assert_eq(iter.position((x: number) => x === 15), Some(4));
      assert_eq(iter.next(), Some(14)); // stopped in back, state Both
      assert_eq(iter.position((x: number) => x === 5), Some(8));
      assert_eq(iter.next(), Some(4)); // stopped in front, state Front
      assert_eq(
        iter.try_fold<number, Option<number>>(0, Option, (acc: number, x: number) => Some(acc + x)),
        Some(range(0, 4).sum())
      );
    }
    {
      let iter = c();
      iter.rev().nth(14); // skip the last 15, ending in state Front
      assert_eq(
        iter.try_fold<number, Option<number>>(7, Option, f),
        range(0, 5).try_fold<number, Option<number>>(7, Option, f)
      );
    }
    {
      let iter = c();
      iter.nth(14); // skip the first 15, ending in state Back
      assert_eq(
        iter.try_fold<number, Option<number>>(7, Option, f),
        range(15, 20).try_fold<number, Option<number>>(7, Option, f)
      );
    }
  });

  test("map_try_folds", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      range(0, 10)
        .map((x: number) => x + 3)
        .try_fold<number, Option<number>>(7, Option, f),
      range(3, 13).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(0, 10)
        .map((x: number) => x + 3)
        .try_rfold<number, Option<number>>(7, Option, f),
      range(3, 13).try_rfold<number, Option<number>>(7, Option, f)
    );

    let iter = range(0, 40).map((x: number) => x + 10);
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(20));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(46));
  });

  test("filter_try_folds", () => {
    let p = (x: number) => 0 <= x && x < 10;
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      range(-10, 20)
        .filter(p)
        .try_fold<number, Option<number>>(7, Option, f),
      range(0, 10).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(-10, 20)
        .filter(p)
        .try_rfold<number, Option<number>>(7, Option, f),
      range(0, 10).try_rfold<number, Option<number>>(7, Option, f)
    );

    let iter = range(0, 40).filter((x: number) => x % 2 === 1);
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(25));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(31));
  });

  test("filter_map_try_folds", () => {
    let mp = (x: number) => (0 <= x && x < 10 ? Some(x * 2) : None<number>());
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      range(-9, 20)
        .filter_map(mp)
        .try_fold<number, Option<number>>(7, Option, f),
      range(0, 10)
        .map((x: number) => 2 * x)
        .try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(-9, 20)
        .filter_map(mp)
        .try_rfold<number, Option<number>>(7, Option, f),
      range(0, 10)
        .map((x: number) => 2 * x)
        .try_rfold<number, Option<number>>(7, Option, f)
    );

    let iter = range(0, 40).filter_map((x: number) =>
      x % 2 === 1 ? None<number>() : Some(x * 2 + 10)
    );
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(38));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(78));
  });

  test("enumerate_try_folds", () => {
    let f = (acc: number, [i, x]: [number, number]) => i8_checked_add(2 * acc, x / (i + 1) + i);
    assert_eq(
      range(9, 18)
        .enumerate()
        .try_fold<number, Option<number>>(7, Option, f),
      range(0, 9)
        .map((i: number): [number, number] => [i, i + 9])
        .try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(9, 18)
        .enumerate()
        .try_rfold<number, Option<number>>(7, Option, f),
      range(0, 9)
        .map((i: number): [number, number] => [i, i + 9])
        .try_rfold<number, Option<number>>(7, Option, f)
    );

    let iter = range(100, 200).enumerate();
    let g = (acc: number, [i, x]: [number, number]): Option<number> => {
      let div = u8_checked_div(x, i + 1);
      if (div.is_none()) {
        return None();
      }
      return u8_checked_add(acc, div.unwrap());
    };
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, g), None());
    assert_eq(iter.next(), Some<[number, number]>([7, 107]));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, g), None());
    assert_eq(iter.next_back(), Some<[number, number]>([11, 111]));
  });

  test("peek_try_folds", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);

    assert_eq(
      range(1, 20)
        .peekable()
        .try_fold<number, Option<number>>(7, Option, f),
      range(1, 20).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(1, 20)
        .peekable()
        .try_rfold<number, Option<number>>(7, Option, f),
      range(1, 20).try_rfold<number, Option<number>>(7, Option, f)
    );

    {
      let iter = range(1, 20).peekable();
      assert_eq(iter.peek(), Some(1));
      assert_eq(
        iter.try_fold<number, Option<number>>(7, Option, f),
        range(1, 20).try_fold<number, Option<number>>(7, Option, f)
      );

      iter = range(1, 20).peekable();
      assert_eq(iter.peek(), Some(1));
      assert_eq(
        iter.try_rfold<number, Option<number>>(7, Option, f),
        range(1, 20).try_rfold<number, Option<number>>(7, Option, f)
      );
    }

    {
      let iter = [100, 20, 30, 40, 50, 60, 70]
        .iter()
        .cloned()
        .peekable();
      assert_eq(iter.peek(), Some(100));
      assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
      assert_eq(iter.peek(), Some(40));

      iter = [100, 20, 30, 40, 50, 60, 70]
        .iter()
        .cloned()
        .peekable();
      assert_eq(iter.peek(), Some(100));
      assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
      assert_eq(iter.peek(), Some(100));
      assert_eq(iter.next_back(), Some(50));
    }

    {
      let iter = range(2, 5).peekable();
      assert_eq(iter.peek(), Some(2));
      assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Err(2));
      assert_eq(iter.peek(), Some(3));
      assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Err(3));
      assert_eq(iter.peek(), Some(4));
      assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Err(4));
      assert_eq(iter.peek(), None());
      assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Ok(undefined));

      iter = range(2, 5).peekable();
      assert_eq(iter.peek(), Some(2));
      assert_eq(
        iter.try_rfold<undefined, Result<undefined, number>>(
          undefined,
          Result,
          (_: undefined, x: number) => Err(x)
        ),
        Err(4)
      );
      assert_eq(iter.peek(), Some(2));
      assert_eq(
        iter.try_rfold<undefined, Result<undefined, number>>(
          undefined,
          Result,
          (_: undefined, x: number) => Err(x)
        ),
        Err(3)
      );
      assert_eq(iter.peek(), Some(2));
      assert_eq(
        iter.try_rfold<undefined, Result<undefined, number>>(
          undefined,
          Result,
          (_: undefined, x: number) => Err(x)
        ),
        Err(2)
      );
      assert_eq(iter.peek(), None());
      assert_eq(
        iter.try_rfold<undefined, Result<undefined, number>>(
          undefined,
          Result,
          (_: undefined, x: number) => Err(x)
        ),
        Ok(undefined)
      );
    }
  });

  test("skip_while_try_fold", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    let p = (x: number) => x % 10 <= 5;
    assert_eq(
      range(1, 20)
        .skip_while(p)
        .try_fold<number, Option<number>>(7, Option, f),
      range(6, 20).try_fold<number, Option<number>>(7, Option, f)
    );
    let iter = range(1, 20).skip_while(p);
    assert_eq(iter.nth(5), Some(11));
    assert_eq(
      iter.try_fold<number, Option<number>>(7, Option, f),
      range(12, 20).try_fold<number, Option<number>>(7, Option, f)
    );

    iter = range(0, 50).skip_while((x: number) => x % 20 < 15);
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(23));
  });

  test("take_while_folds", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    let p = (x: number) => x !== 10;
    assert_eq(
      range(1, 20)
        .take_while(p)
        .try_fold<number, Option<number>>(7, Option, f),
      range(1, 10).try_fold<number, Option<number>>(7, Option, f)
    );
    let iter = range(1, 20).take_while(p);
    assert_eq(
      iter.try_fold<number, Option<number>>(0, Option, (x: number, y: number) => Some(x + y)),
      Some(range(1, 10).sum())
    );
    assert_eq(iter.next(), None()); // flag should be set
    iter = range(1, 20).take_while(p);
    assert_eq(iter.fold<number>(0, (x: number, y: number) => x + y), range(1, 10).sum());

    iter = range(10, 50).take_while((x: number) => x !== 40);
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(20));
  });

  test("skip_try_folds", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      range(1, 20)
        .skip(9)
        .try_fold<number, Option<number>>(7, Option, f),
      range(10, 20).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(1, 20)
        .skip(9)
        .try_rfold<number, Option<number>>(7, Option, f),
      range(10, 20).try_rfold<number, Option<number>>(7, Option, f)
    );

    let iter = range(0, 30).skip(10);
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(20));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(24));
  });

  test("skip_nth_back", () => {
    let xs = [0, 1, 2, 3, 4, 5];
    let it = xs.iter().skip(2);
    assert_eq(it.nth_back(0), Some(5));
    assert_eq(it.nth_back(1), Some(3));
    assert_eq(it.nth_back(0), Some(2));
    assert_eq(it.nth_back(0), None());

    let ys = [2, 3, 4, 5];
    let ity = ys.iter();
    it = xs.iter().skip(2);
    assert_eq(it.nth_back(1), ity.nth_back(1));
    assert_eq(it.clone().nth(0), ity.clone().nth(0));
    assert_eq(it.nth_back(0), ity.nth_back(0));
    assert_eq(it.clone().nth(0), ity.clone().nth(0));
    assert_eq(it.nth_back(0), ity.nth_back(0));
    assert_eq(it.clone().nth(0), ity.clone().nth(0));
    assert_eq(it.nth_back(0), ity.nth_back(0));
    assert_eq(it.clone().nth(0), ity.clone().nth(0));

    it = xs.iter().skip(2);
    assert_eq(it.nth_back(4), None());
    assert_eq(it.nth_back(0), None());

    let iter = xs.iter();
    iter.skip(2).nth_back(3);
    assert_eq(iter.next_back(), Some(1));

    iter = xs.iter();
    iter.skip(2).nth_back(10);
    assert_eq(iter.next_back(), Some(1));
  });

  test("take_try_folds", () => {
    let f = (acc: number, x: number) => checked_add(2 * acc, x);
    assert_eq(
      range(10, 30)
        .take(10)
        .try_fold<number, Option<number>>(7, Option, f),
      range(10, 20).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(10, 30)
        .take(10)
        .try_rfold<number, Option<number>>(7, Option, f),
      range(10, 20).try_rfold<number, Option<number>>(7, Option, f)
    );

    let iter = range(10, 30).take(20);
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(20));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(24));

    iter = range(2, 20).take(3);
    assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Err(2));
    assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Err(3));
    assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Err(4));
    assert_eq(iter.try_for_each<Result<undefined, any>>(Result, Err), Ok(undefined));

    let iter2 = range(2, 20)
      .take(3)
      .rev();
    assert_eq(iter2.try_for_each<Result<undefined, any>>(Result, Err), Err(4));
    assert_eq(iter2.try_for_each<Result<undefined, any>>(Result, Err), Err(3));
    assert_eq(iter2.try_for_each<Result<undefined, any>>(Result, Err), Err(2));
    assert_eq(iter2.try_for_each<Result<undefined, any>>(Result, Err), Ok(undefined));
  });

  test("flat_map_try_folds", () => {
    let f = (acc: number, x: number) => checked_add((acc * 2) / 3, x);
    let mr = (x: number) => range(5 * x, 5 * x + 5);
    assert_eq(
      range(0, 10)
        .flat_map(mr)
        .try_fold<number, Option<number>>(7, Option, f),
      range(0, 50).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(0, 10)
        .flat_map(mr)
        .try_rfold<number, Option<number>>(7, Option, f),
      range(0, 50).try_rfold<number, Option<number>>(7, Option, f)
    );
    let iter = range(0, 10).flat_map(mr);
    iter.next();
    iter.next_back(); // have front and back iters progress
    assert_eq(
      iter.try_rfold<number, Option<number>>(7, Option, f),
      range(1, 49).try_rfold<number, Option<number>>(7, Option, f)
    );

    iter = range(0, 10).flat_map((x: number) => range(4 * x, 4 * x + 4));
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(17));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(35));
  });

  test("flatten_try_folds", () => {
    let f = (acc: number, x: number) => checked_add((acc * 2) / 3, x);
    let mr = (x: number) => range(5 * x, 5 * x + 5);
    assert_eq(
      range(0, 10)
        .map(mr)
        .flatten()
        .try_fold<number, Option<number>>(7, Option, f),
      range(0, 50).try_fold<number, Option<number>>(7, Option, f)
    );
    assert_eq(
      range(0, 10)
        .map(mr)
        .flatten()
        .try_rfold<number, Option<number>>(7, Option, f),
      range(0, 50).try_rfold<number, Option<number>>(7, Option, f)
    );
    let iter = range(0, 10)
      .map(mr)
      .flatten();
    iter.next();
    iter.next_back(); // have front and back iters progress
    assert_eq(
      iter.try_rfold<number, Option<number>>(7, Option, f),
      range(1, 49).try_rfold<number, Option<number>>(7, Option, f)
    );

    iter = range(0, 10)
      .map((x: number) => range(4 * x, 4 * x + 4))
      .flatten();
    assert_eq(iter.try_fold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next(), Some(17));
    assert_eq(iter.try_rfold<number, Option<number>>(0, Option, i8_checked_add), None());
    assert_eq(iter.next_back(), Some(35));
  });

  test("functor_laws", () => {
    // identity:
    const identity = <T>(x: T): T => x;
    assert_eq(
      range(0, 10)
        .map(identity)
        .sum(),
      range(0, 10).sum()
    );

    // composition
    const f = (x: number) => x + 3;
    const g = (x: number) => x * 2;
    const h = (x: number) => g(f(x));
    assert_eq(
      range(0, 10)
        .map(f)
        .map(g)
        .sum(),
      range(0, 10)
        .map(h)
        .sum()
    );
  });

  test("monad_laws_left_identity", () => {
    const f = (x: number) => {
      return range(0, 10).map((y: number) => x * y);
    };
    assert_eq(
      once(42)
        .flat_map(f)
        .sum(),
      f(42).sum()
    );
  });

  test("monad_laws_right_identity", () => {
    assert_eq(
      range(0, 10)
        .flat_map((x: number) => once(x))
        .sum(),
      range(0, 10).sum()
    );
  });

  test("monad_laws_associativity", () => {
    let f = (x: number) => range(0, x);
    let g = (x: number) => range(0, x).rev();
    assert_eq(
      range(0, 10)
        .flat_map(f)
        .flat_map(g)
        .sum(),
      range(0, 10)
        .flat_map((x: number) => f(x).flat_map(g))
        .sum()
    );
  });

  test("is_sorted", () => {
    assert([1, 2, 2, 9].iter().is_sorted());
    assert(![1, 3, 2].iter().is_sorted());
    assert([0].iter().is_sorted());
    assert(empty<number>().is_sorted());
    assert(![0.0, 1.0, NaN].iter().is_sorted());
    assert([-2, -1, 0, 3].iter().is_sorted());
    assert(![-2, -1, 0, 3].iter().is_sorted_by_key((n: number) => Math.abs(n)));
    assert(!["c", "bb", "aaa"].iter().is_sorted());
    assert(["c", "bb", "aaa"].iter().is_sorted_by_key((s: string) => s.len()));
  });

  test("partition", () => {
    const check = (xs: number[], p: (x: number) => boolean, left: number[], right: number[]) => {
      let [a, b] = xs.iter().partition(p);
      assert_eq(left, a);
      assert_eq(right, b);
      // assert(xs.slice(0, i).iter().all(p));
      // assert(!xs.slice(0, i).iter().any(p));
      // assert(xs.iter().is_partitioned(p));
      // if (i === 0 || i === xs.len()) {
      //   assert(xs.iter().rev().is_partitioned(p));
      // } else {
      //   assert(!xs.iter().rev().is_partitioned(p));
      // }
    };

    check([], () => true, [], []);
    check([], () => false, [], []);

    check([0], () => true, [0], []);
    check([0], () => false, [], [0]);

    check([-1, 1], (x: number) => x > 0, [1], [-1]);
    check([-1, 1], (x: number) => x < 0, [-1], [1]);

    let xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    check(xs, (x: number) => true, xs, []);
    check(xs, (x: number) => false, [], xs);
    check(xs, (x: number) => x % 2 === 0, [0, 2, 4, 6, 8], [1, 3, 5, 7, 9]); // evens
    check(xs, (x: number) => x % 2 === 1, [1, 3, 5, 7, 9], [0, 2, 4, 6, 8]); // odds
    check(xs, (x: number) => x % 3 === 0, [0, 3, 6, 9], [1, 2, 4, 5, 7, 8]); // multiple of 3
    check(xs, (x: number) => x % 4 === 0, [0, 4, 8], [1, 2, 3, 5, 6, 7, 9]); // multiple of 4
    check(xs, (x: number) => x % 5 === 0, [0, 5], [1, 2, 3, 4, 6, 7, 8, 9]); // multiple of 5
    check(xs, (x: number) => x < 3, [0, 1, 2], [3, 4, 5, 6, 7, 8, 9]); // small
    check(xs, (x: number) => x > 6, [7, 8, 9], [0, 1, 2, 3, 4, 5, 6]); // large
  });
});
