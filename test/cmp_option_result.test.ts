import { assert, assert_eq, assert_ne, should_panic } from "../src/macros.test";
import {
  Option,
  Some,
  SomeVariant,
  None,
  NoneVariant,
  Result,
  Ok,
  OkVariant,
  Err,
  ErrVariant,
  ImplOrd,
  ImplPartialOrd,
  ImplEq,
  ImplPartialEq,
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
  cmp,
  max,
  max_by,
  max_by_key,
  min,
  min_by,
  min_by_key,
  clamp
} from "../src/cmp_option_result";
import { Self, abs, format } from "../src/std";

class Point extends ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(Self)))) {
  public Self!: Point;

  x: number;
  y: number;
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  abs(): Point {
    return new Point(abs(this.x), abs(this.y));
  }

  neg(): Point {
    return new Point(-this.x, -this.y);
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

  fmt_debug(): string {
    return format("Point({:?},{:?})", this.x, this.y);
  }
}

describe("Eq", () => {
  test("eq_and_ne", () => {
    assert(eq(null, null));
    assert(eq(1, 1));
    assert(eq([1, 2], [1, 2]));
    assert(eq({ a: 1 }, { a: 1 }));
    assert(eq(new Point(1, 1), new Point(1, 1)));

    assert(ne(NaN, NaN));
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
    assert(p1.lt(p2));

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

  test("ord_max_min", () => {
    assert_eq(max(1, 2), 2);
    assert_eq(max(2, 1), 2);
    assert_eq(min(1, 2), 1);
    assert_eq(min(2, 1), 1);
    assert_eq(max(1, 1), 1);
    assert_eq(min(1, 1), 1);

    let p1 = new Point(1, 1);
    let p2 = new Point(2, 2);

    assert_eq(max(p1, p2), p2);
    assert_eq(max(p2, p1), p2);
    assert_eq(min(p1, p2), p1);
    assert_eq(min(p2, p1), p1);
    assert_eq(max(p1, p1), p1);
    assert_eq(min(p1, p1), p1);
  });

  test("ord_min_max_by", () => {
    let f = (x: number, y: number) => cmp(abs(x), abs(y));
    assert_eq(min_by(1, -1, f), 1);
    assert_eq(min_by(1, -2, f), 1);
    assert_eq(min_by(2, -1, f), -1);
    assert_eq(max_by(1, -1, f), -1);
    assert_eq(max_by(1, -2, f), -2);
    assert_eq(max_by(2, -1, f), 2);

    let g = (x: Point, y: Point) => cmp(x.abs(), y.abs());
    let p1 = new Point(1, 1);
    let p2 = new Point(2, 2);

    assert_eq(min_by(p1, p1.neg(), g), p1);
    assert_eq(min_by(p1, p2.neg(), g), p1);
    assert_eq(min_by(p2, p1.neg(), g), p1.neg());
    assert_eq(max_by(p1, p1.neg(), g), p1.neg());
    assert_eq(max_by(p1, p2.neg(), g), p2.neg());
    assert_eq(max_by(p2, p1.neg(), g), p2);
  });

  test("ord_min_max_by_key", () => {
    let f = (x: number) => abs(x);
    assert_eq(min_by_key(1, -1, f), 1);
    assert_eq(min_by_key(1, -2, f), 1);
    assert_eq(min_by_key(2, -1, f), -1);
    assert_eq(max_by_key(1, -1, f), -1);
    assert_eq(max_by_key(1, -2, f), -2);
    assert_eq(max_by_key(2, -1, f), 2);

    let g = (x: Point) => x.abs();
    let p1 = new Point(1, 1);
    let p2 = new Point(2, 2);

    assert_eq(min_by_key(p1, p1.neg(), g), p1);
    assert_eq(min_by_key(p1, p2.neg(), g), p1);
    assert_eq(min_by_key(p2, p1.neg(), g), p1.neg());
    assert_eq(max_by_key(p1, p1.neg(), g), p1.neg());
    assert_eq(max_by_key(p1, p2.neg(), g), p2.neg());
    assert_eq(max_by_key(p2, p1.neg(), g), p2);
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
    {
      let x = Some(0);
      let y = Some(5);
      assert_ne(x, y);
      x.replace(5);
      assert_eq(x, y);
    }
    {
      let x = Some(Less);
      let y = Some(Greater);
      assert_ne(x, y);
      x.replace(Greater);
      assert_eq(x, y);
    }
    {
      let pts1: [Point, Point] = [new Point(1, 1), new Point(2, 2)];
      let pts2: [Point, Point] = [new Point(2, 2), new Point(2, 2)];
      assert_ne(pts1, pts2);
      pts2[0] = new Point(1, 1);
      assert_eq(pts1, pts2);
    }
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
    assert_eq(x.ok_or("error"), Ok(1));

    let y: Option<number> = None();
    assert_eq(y.ok_or("error"), Err("error"));
  });

  test("ok_or_else", () => {
    let x = Some(1);
    assert_eq(x.ok_or_else(() => "error"), Ok(1));

    let y: Option<number> = None();
    assert_eq(y.ok_or_else(() => "error"), Err("error"));
  });

  test("iter", () => {
    let val = 5;

    let some = Some(val);
    let it = some.iter();

    assert_eq(it.size_hint(), [1, Some(1)]);
    assert_eq(it.next(), Some(val));
    assert_eq(it.size_hint(), [0, Some(0)]);
    assert(it.next().is_none());

    let into_it = some.into_iter();
    assert_eq(into_it.next(), Some(val));
    for (let x of some) {
      assert_eq(x, val);
    }
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
    let x1: Option<Result<number, string>> = Some(Ok(1));
    assert_eq(x1.transpose(), Ok(Some(1)));
    let x2: Option<Result<number, string>> = Some(Err("error"));
    assert_eq(x2.transpose(), Err("error"));

    let y: Option<Result<number, string>> = None();
    assert_eq(y.transpose(), Ok(None()));
  });
});

function op1(): Result<number, string> {
  return Ok(666);
}
function op2(): Result<number, string> {
  return Err("sadface");
}

describe("Result", () => {
  test("eq", () => {
    let ok1: Result<number, string> = Ok(1);
    let ok2: Result<number, string> = Ok(2);
    let err1: Result<number, string> = Err("1");
    let err2: Result<number, string> = Err("2");

    assert_ne(ok1, ok2);
    assert_ne(err1, err2);
    assert_ne(ok1, err1);
    assert_ne(err2, ok2);

    let ok1_2: Result<number, string> = Ok(1);
    let err1_2: Result<number, string> = Err("1");

    assert_eq(ok1, ok1_2);
    assert_eq(err1, err1_2);
  });

  test("cmp", () => {
    let ok1: Result<number, number> = Ok(0);
    let ok2: Result<number, number> = Ok(5);
    assert_eq(ok1.cmp(ok1), Equal);
    assert_eq(ok1.cmp(ok2), Less);
    assert_eq(ok2.cmp(ok1), Greater);

    let err1: Result<number, number> = Err(0);
    let err2: Result<number, number> = Err(5);
    assert_eq(err1.cmp(err1), Equal);
    assert_eq(err1.cmp(err2), Less);
    assert_eq(err2.cmp(err1), Greater);

    assert_eq(ok1.cmp(err2), Greater);
    assert_eq(err2.cmp(ok1), Less);
  });

  test("clone", () => {
    let x: Result<number, string> = Ok(1);
    let y: Result<number, string> = x.clone();
    // Compare by reference
    assert(x !== y);
    // Compare by value
    assert_eq(x, y);

    x = Err("error");
    y = x.clone();
    // Compare by reference
    assert(x !== y);
    // Compare by value
    assert_eq(x, y);
  });

  test("fmt_debug", () => {
    let x = Ok(1);
    assert_eq(x.fmt_debug(), "Ok(1)");

    let y = Err("error");
    assert_eq(y.fmt_debug(), 'Err("error")');
  });

  test("match", () => {
    let x = Ok(1);
    assert_eq(x.match(), OkVariant(1));

    let y = Err("error");
    assert_eq(y.match(), ErrVariant("error"));
  });

  test("is_ok_or_err", () => {
    let x = Ok(1);
    assert(x.is_ok());
    assert(!x.is_err());

    let y = Err("error");
    assert(!y.is_ok());
    assert(y.is_err());
  });

  test("ok_or_err", () => {
    let x = Ok(1);
    assert_eq(x.ok(), Some(1));
    assert_eq(x.err(), None());

    let y = Err("error");
    assert_eq(y.ok(), None());
    assert_eq(y.err(), Some("error"));
  });

  test("and", () => {
    assert_eq(
      op1()
        .and(Ok(667))
        .unwrap(),
      667
    );
    assert_eq(
      op1()
        .and(Err<number, string>("bad"))
        .unwrap_err(),
      "bad"
    );

    assert_eq(
      op2()
        .and(Ok(667))
        .unwrap_err(),
      "sadface"
    );
    assert_eq(
      op2()
        .and(Err<number, string>("bad"))
        .unwrap_err(),
      "sadface"
    );
  });

  test("and_then", () => {
    assert_eq(
      op1()
        .and_then((i: number) => Ok<number, string>(i + 1))
        .unwrap(),
      667
    );
    assert_eq(
      op1()
        .and_then((i: number) => Err<number, string>("bad"))
        .unwrap_err(),
      "bad"
    );

    assert_eq(
      op2()
        .and_then((i: number) => Ok<number, string>(i + 1))
        .unwrap_err(),
      "sadface"
    );
    assert_eq(
      op2()
        .and_then((i: number) => Err<number, string>("bad"))
        .unwrap_err(),
      "sadface"
    );
  });

  test("or", () => {
    assert_eq(
      op1()
        .or(Ok<any, string>(667))
        .unwrap(),
      666
    );
    assert_eq(
      op1()
        .or(Err("bad"))
        .unwrap(),
      666
    );

    assert_eq(
      op2()
        .or(Ok<any, string>(667))
        .unwrap(),
      667
    );
    assert_eq(
      op2()
        .or(Err("bad"))
        .unwrap_err(),
      "bad"
    );
  });

  test("or_else", () => {
    assert_eq(
      op1()
        .or_else(() => Ok<number, string>(667))
        .unwrap(),
      666
    );
    assert_eq(
      op1()
        .or_else((e: string) => Err<number, string>(e))
        .unwrap(),
      666
    );

    assert_eq(
      op2()
        .or_else(() => Ok<number, string>(667))
        .unwrap(),
      667
    );
    assert_eq(
      op2()
        .or_else((e: string) => Err<number, string>(e))
        .unwrap_err(),
      "sadface"
    );
  });

  test("map", () => {
    assert_eq(Ok<number, number>(1).map(x => x + 1), Ok(2));
    assert_eq(Err<number, number>(1).map(x => x + 1), Err(1));
  });

  test("map_or_else", () => {
    assert_eq(Ok<number, number>(1).map_or_else(x => x - 1, x => x + 1), 2);
    assert_eq(Err<number, number>(1).map_or_else(x => x - 1, x => x + 1), 0);
  });

  test("map_err", () => {
    let ok = Ok<string, number>("hello");
    let err = ok.map_err(x => x + 1);
    assert_eq(Ok<number, number>(1).map_err(x => x + 1), Ok(1));
    assert_eq(Err<number, number>(1).map_err(x => x + 1), Err(2));
  });

  test("unwrap", () => {
    let ok = Ok<number, string>(100);
    assert_eq(ok.unwrap(), 100);
  });

  test("unwrap_panic", () => {
    let err = Err<number, string>("error");
    should_panic(() => {
      err.unwrap();
    });
  });

  test("unwrap_err", () => {
    let err = Err<number, string>("error");
    assert_eq(err.unwrap_err(), "error");
  });

  test("unwrap_err_panic", () => {
    let ok = Ok<number, string>(100);
    should_panic(() => {
      ok.unwrap_err();
    });
  });

  test("unwrap_or", () => {
    let ok = Ok<number, string>(100);
    let ok_err = Err<number, string>("Err");

    assert_eq(ok.unwrap_or(50), 100);
    assert_eq(ok_err.unwrap_or(50), 50);
  });

  test("unwrap_or_else", () => {
    let handler = (msg: string): number => {
      if (msg === "I got this.") {
        return 50;
      } else {
        throw new Error("BadBad");
      }
    };

    let ok = Ok<number, string>(100);
    let ok_err = Err<number, string>("I got this.");

    assert_eq(ok.unwrap_or_else(handler), 100);
    assert_eq(ok_err.unwrap_or_else(handler), 50);
  });

  test("unwrap_or_else_panic", () => {
    let handler = (msg: string): number => {
      if (msg === "I got this.") {
        return 50;
      } else {
        throw new Error("BadBad");
      }
    };

    let bad_err = Err<number, string>("Unrecoverable mess.");

    should_panic(() => {
      bad_err.unwrap_or_else(handler);
    });
  });

  test("expect_ok", () => {
    let ok: Result<number, string> = Ok(100);
    assert_eq(ok.expect("Unexpected error"), 100);
  });

  test("expect_err", () => {
    let err: Result<number, string> = Err("All good");
    should_panic(() => {
      err.expect("Got expected error");
    }, new Error("Got expected error: All good"));
  });

  test("expect_err_err", () => {
    let ok: Result<string, number> = Err(100);
    assert_eq(ok.expect_err("Unexpected error"), 100);
  });

  test("expect_err_ok", () => {
    let err: Result<string, number> = Ok("All good");
    should_panic(() => {
      err.expect_err("Got expected ok");
    }, new Error("Got expected ok: All good"));
  });

  test("iter", () => {
    let ok: Result<number, string> = Ok(100);
    let it = ok.iter();
    assert_eq(it.size_hint(), [1, Some(1)]);
    assert_eq(it.next(), Some(100));
    assert_eq(it.size_hint(), [0, Some(0)]);
    assert(it.next().is_none());
    for (let x of ok) {
      assert_eq(x, 100);
    }

    let err: Result<number, string> = Err("error");
    assert_eq(err.iter().next(), None());
    for (let x of err) {
      // Unreachable code
      assert(false);
    }
  });

  test("transpose", () => {
    let x1: Result<Option<number>, string> = Ok(Some(1));
    assert_eq(x1.transpose(), Some(Ok(1)));
    let x2: Result<Option<number>, string> = Ok(None());
    assert_eq(x2.transpose(), None());
    let x3: Result<Option<number>, string> = Err("error");
    assert_eq(x3.transpose(), Some(Err("error")));
  });
});
