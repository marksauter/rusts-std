import { Option, Some, None, range, checked_add, checked_mul } from "../src/std";
import { assert, assert_eq, should_panic } from "../src/macros.test";

describe("Slice", () => {
  test("position", () => {
    let b = [1, 2, 3, 5, 5];
    assert_eq(b.iter().position((v: number) => v === 9), None());
    assert_eq(b.iter().position((v: number) => v === 5), Some(3));
    assert_eq(b.iter().position((v: number) => v === 3), Some(2));
    assert_eq(b.iter().position((v: number) => v === 0), None());
  });

  test("rposition", () => {
    let b = [1, 2, 3, 5, 5];
    assert_eq(b.iter().rposition((v: number) => v === 9), None());
    assert_eq(b.iter().rposition((v: number) => v === 5), Some(4));
    assert_eq(b.iter().rposition((v: number) => v === 3), Some(2));
    assert_eq(b.iter().rposition((v: number) => v === 0), None());
  });

  test("iterator_nth", () => {
    let v = [0, 1, 2, 3, 4];
    for (let i of range(0, v.len())) {
      assert_eq(
        v
          .iter()
          .nth_back(i)
          .unwrap(),
        v[v.len() - i - 1]
      );
    }
    assert_eq(v.iter().nth_back(v.len()), None());

    let iter = v.iter();
    assert_eq(iter.nth_back(2).unwrap(), v[2]);
    assert_eq(iter.nth_back(1).unwrap(), v[0]);
  });

  test("iterator_count", () => {
    let v = [0, 1, 2, 3, 4];
    assert_eq(v.iter().count(), 5);

    let iter2 = v.iter();
    iter2.next();
    iter2.next();
    assert_eq(iter2.count(), 3);
  });

  test("find_rfind", () => {
    let v = [0, 1, 2, 3, 4, 5];
    let iter = v.iter();
    let i = v.len();
    let find = iter.rfind(() => true);
    while (find.is_some()) {
      let elt = find.unwrap();
      i -= 1;
      assert_eq(elt, v[i]);
      find = iter.rfind(() => true);
    }
    assert_eq(i, 0);
    assert_eq(v.iter().rfind((x: number) => x <= 3), Some(3));
  });

  test("iterator_folds", () => {
    let a = [1, 2, 3, 4, 5]; // len>4 so the unroll is used.
    assert_eq(a.iter().fold(0, (acc: number, x: number) => 2 * acc + x), 57);
    assert_eq(a.iter().rfold(0, (acc: number, x: number) => 2 * acc + x), 129);
    let fold = (acc: number, x: number): Option<number> => {
      let mul = checked_mul(acc, 2);
      if (mul.is_none()) {
        return None();
      }
      return checked_add(mul.unwrap(), x);
    };
    assert_eq(a.iter().try_fold<number, Option<number>>(0, Option, fold), Some(57));
    assert_eq(a.iter().try_rfold<number, Option<number>>(0, Option, fold), Some(129));

    // short-circuiting try_fold, through other methods
    a = [0, 1, 2, 3, 5, 5, 5, 7, 8, 9];
    let iter = a.iter();
    assert_eq(iter.position((x: number) => x === 3), Some(3));
    assert_eq(iter.rfind((x: number) => x === 5), Some(5));
    assert_eq(iter.len(), 2);
  });
});
