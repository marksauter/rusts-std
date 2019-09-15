import { assert, assert_eq, assert_ne, should_panic } from "../src/macros.test";
import { Result, Ok, OkVariant, Err, ErrVariant } from "../src/result";
import { Option, None, Some } from "../src/std";

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
    assert_eq(it.next().value.unwrap(), 100);
    assert(it.next().value.is_none());
    for (let x of ok) {
      assert_eq(x.unwrap(), 100);
    }

    let err: Result<number, string> = Err("error");
    assert(it.next().value.is_none());
    for (let x of err) {
      // Unreachable code
      assert(false);
    }
  });

  test("transpose", () => {
    let x1: Result<Option<number>, string> = Result.Ok(Some(1));
    assert_eq(x1.transpose(), Some(Result.Ok(1)));
    let x2: Result<Option<number>, string> = Result.Ok(None());
    assert_eq(x2.transpose(), None());
    let x3: Result<Option<number>, string> = Result.Err("error");
    assert_eq(x3.transpose(), Some(Result.Err("error")));
    let x4: Result<number, string> = Result.Ok(1);
    assert_eq(x4.transpose(), Some(Result.Ok(1)));
    let x5: Result<number, string> = Result.Err("error");
    assert_eq(x5.transpose(), Some(Result.Err("error")));
  });
});
