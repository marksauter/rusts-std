import { assert, assert_eq, assert_ne, should_panic } from "../src/macros.test";
import { Option, Some, SomeVariant, None, NoneVariant } from "../src/option";
import { Result, Less, Equal, Greater } from "../src/std";

describe("Option", () => {
  test("option_dance", () => {
    let x = Some(undefined);
    let y = Some(5);
    let y2 = 0;
    for (let _x of x) {
      y2 = y.take().unwrap();
    }
    assert_eq(y2, 5);
    assert(y.is_none());
  });

  test("option_too_much_dance", () => {
    let A = {};
    let y = Some(A);
    let _y2 = y.take().unwrap();
    should_panic(() => {
      y.take().unwrap();
    });
  });

  test("eq", () => {
    let x = Some(0);
    let y = Some(5);
    assert_ne(x, y);
    x.replace(5);
    assert_eq(x, y);
  });

  test("cmp", () => {
    let x = Some(0);
    let y = Some(5);
    assert_eq(x.cmp(x), Equal);
    assert_eq(x.cmp(y), Less);
    assert_eq(y.cmp(x), Greater);

    x = None();
    y = None();
    assert_eq(x.cmp(y), Equal);
  });

  test("clone", () => {
    let x = Some(1);
    let y = x.clone();
    // Compare by reference
    assert(x !== y);
    // Compare by value
    assert_eq(x, y);

    x = None();
    y = x.clone();
    // Compare by reference
    assert(x !== y);
    // Compare by value
    assert_eq(x, y);
  });

  test("fmt_debug", () => {
    let x = Some(1);
    assert_eq(x.fmt_debug(), "Some(1)");

    let y = None();
    assert_eq(y.fmt_debug(), "None");
  });

  test("match", () => {
    let x = Some(1);
    assert_eq(x.match(), SomeVariant(1));

    let y = None();
    assert_eq(y.match(), NoneVariant());
  });

  test("and", () => {
    let x = Some(1);
    assert_eq(x.and(Some(2)), Some(2));
    assert_eq(x.and(None<number>()), None());

    let y: Option<number> = None();
    assert_eq(y.and(Some(2)), None());
    assert_eq(y.and(None<number>()), None());
  });

  test("and_then", () => {
    let x = Some(1);
    assert_eq(x.and_then((a: number) => Some(a + 1)), Some(2));
    assert_eq(x.and_then(() => None<number>()), None());

    let y: Option<number> = None();
    assert_eq(y.and_then((a: number) => Some(a + 1)), None());
    assert_eq(y.and_then(() => None<number>()), None());
  });

  test("filter", () => {
    let x = Some(1);
    assert_eq(x.filter((t: number) => t === 1), Some(1));
    assert_eq(x.filter((t: number) => t === 2), None());

    let y: Option<number> = None();
    assert_eq(y.filter((t: number) => t === 1), None());
  });

  test("or", () => {
    let x = Some(1);
    assert_eq(x.or(Some(2)), Some(1));
    assert_eq(x.or(None()), Some(1));

    let y: Option<number> = None();
    assert_eq(y.or(Some(2)), Some(2));
    assert_eq(y.or(None()), None());
  });

  test("or_else", () => {
    let x = Some(1);
    assert_eq(x.or_else(() => Some(2)), Some(1));
    assert_eq(x.or_else(() => None()), Some(1));

    let y: Option<number> = None();
    assert_eq(y.or_else(() => Some(2)), Some(2));
    assert_eq(y.or_else(() => None()), None());
  });

  test("xor", () => {
    let x1 = Some(1);
    let x2 = Some(2);
    let y: Option<number> = None();

    assert_eq(x1.xor(x2), None());
    assert_eq(x1.xor(y), Some(1));
    assert_eq(x2.xor(y), Some(2));
    assert_eq(y.xor(x1), Some(1));
  });

  test("get_or_insert", () => {
    let x = Some(1);
    assert_eq(x.get_or_insert(2), 1);

    let y: Option<number> = None();
    assert_eq(y.get_or_insert(2), 2);
  });

  test("get_or_insert_with", () => {
    let x = Some(1);
    assert_eq(x.get_or_insert_with(() => 2), 1);

    let y: Option<number> = None();
    assert_eq(y.get_or_insert_with(() => 2), 2);
  });

  test("expect", () => {
    assert_eq(Some(1).expect("unreachable error"), 1);
  });

  test("expect_panic", () => {
    should_panic(() => {
      None().expect("reachable error");
    }, new Error("reachable error"));
  });

  test("unwrap", () => {
    assert_eq(Some(1).unwrap(), 1);
    let s = Some("hello").unwrap();
    assert_eq(s, "hello");
  });

  test("unwrap_panic1", () => {
    let x: Option<number> = None();
    should_panic(() => {
      x.unwrap();
    });
  });

  test("unwrap_panic2", () => {
    let x: Option<string> = None();
    should_panic(() => {
      x.unwrap();
    });
  });

  test("unwrap_or", () => {
    let x = Some(1);
    assert_eq(x.unwrap_or(2), 1);

    let y: Option<number> = None();
    assert_eq(y.unwrap_or(2), 2);
  });

  test("unwrap_or_else", () => {
    let x = Some(1);
    assert_eq(x.unwrap_or_else(() => 2), 1);

    let y: Option<number> = None();
    assert_eq(y.unwrap_or_else(() => 2), 2);
  });

  test("map", () => {
    let x = Some(1);
    assert_eq(x.map((t: number) => `${t}`), Some("1"));

    let y: Option<number> = None();
    assert_eq(y.map((t: number) => `${t}`), None());
  });

  test("map_or", () => {
    let x = Some(1);
    assert_eq(x.map_or("number", (t: number) => `${t}`), "1");

    let y: Option<number> = None();
    assert_eq(y.map_or("number", (t: number) => `${t}`), "number");
  });

  test("map_or_else", () => {
    let x = Some(1);
    assert_eq(x.map_or_else(() => "number", (t: number) => `${t}`), "1");

    let y: Option<number> = None();
    assert_eq(y.map_or_else(() => "number", (t: number) => `${t}`), "number");
  });

  test("ok_or", () => {
    let x = Some(1);
    assert_eq(x.ok_or("error"), Result.Ok(1));

    let y: Option<number> = None();
    assert_eq(y.ok_or("error"), Result.Err("error"));
  });

  test("ok_or_else", () => {
    let x = Some(1);
    assert_eq(x.ok_or_else(() => "error"), Result.Ok(1));

    let y: Option<number> = None();
    assert_eq(y.ok_or_else(() => "error"), Result.Err("error"));
  });

  test("iter", () => {
    let val = 5;

    let x = Some(val);
    let it = x.iter();

    assert_eq(it.next().value, Some(val));
    assert(it.next().value.is_none());
  });

  test("replace", () => {
    let x = Some(2);
    let old = x.replace(5);

    assert_eq(x, Some(5));
    assert_eq(old, Some(2));

    x = None();
    old = x.replace(3);

    assert_eq(x, Some(3));
    assert_eq(old, None());
  });

  test("transpose", () => {
    let x1: Option<Result<number, string>> = Some(Result.Ok(1));
    assert_eq(x1.transpose(), Result.Ok(Some(1)));
    let x2: Option<Result<number, string>> = Some(Result.Err("error"));
    assert_eq(x2.transpose(), Result.Err(Some("error")));
    let x3: Option<number> = Some(1);
    assert_eq(x3.transpose(), Result.Ok(Some(1)));

    let y = None();
    assert_eq(y.transpose(), Result.Ok(None()));
  });
});
