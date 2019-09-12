import { Result, Ok, Err } from "../src/result";
import { Option } from "../src/std";

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

    expect(ok1.eq(ok2)).toBe(false);
    expect(err1.eq(err2)).toBe(false);
    expect(ok1.eq(err1)).toBe(false);
    expect(err2.eq(ok2)).toBe(false);

    let ok1_2: Result<number, string> = Ok(1);
    let err1_2: Result<number, string> = Err("1");

    expect(ok1.eq(ok1_2)).toBe(true);
    expect(err1.eq(err1_2)).toBe(true);
  });

  test("and", () => {
    expect(
      op1()
        .and(Ok(667))
        .unwrap()
    ).toEqual(667);
    expect(
      op1()
        .and(Err<number, string>("bad"))
        .unwrap_err()
    ).toEqual("bad");

    expect(
      op2()
        .and(Ok(667))
        .unwrap_err()
    ).toEqual("sadface");
    expect(
      op2()
        .and(Err<number, string>("bad"))
        .unwrap_err()
    ).toEqual("sadface");
  });

  test("and_then", () => {
    expect(
      op1()
        .and_then((i: number) => Ok<number, string>(i + 1))
        .unwrap()
    ).toEqual(667);
    expect(
      op1()
        .and_then((i: number) => Err<number, string>("bad"))
        .unwrap_err()
    ).toEqual("bad");

    expect(
      op2()
        .and_then((i: number) => Ok<number, string>(i + 1))
        .unwrap_err()
    ).toEqual("sadface");
    expect(
      op2()
        .and_then((i: number) => Err<number, string>("bad"))
        .unwrap_err()
    ).toEqual("sadface");
  });

  test("or", () => {
    expect(
      op1()
        .or(Ok<any, string>(667))
        .unwrap()
    ).toEqual(666);
    expect(
      op1()
        .or(Err("bad"))
        .unwrap()
    ).toEqual(666);

    expect(
      op2()
        .or(Ok<any, string>(667))
        .unwrap()
    ).toEqual(667);
    expect(
      op2()
        .or(Err("bad"))
        .unwrap_err()
    ).toEqual("bad");
  });

  test("or_else", () => {
    expect(
      op1()
        .or_else(() => Ok<number, string>(667))
        .unwrap()
    ).toEqual(666);
    expect(
      op1()
        .or_else((e: string) => Err<number, string>(e))
        .unwrap()
    ).toEqual(666);

    expect(
      op2()
        .or_else(() => Ok<number, string>(667))
        .unwrap()
    ).toEqual(667);
    expect(
      op2()
        .or_else((e: string) => Err<number, string>(e))
        .unwrap_err()
    ).toEqual("sadface");
  });

  test("map", () => {
    expect(
      Ok<number, number>(1)
        .map(x => x + 1)
        .eq(Ok(2))
    ).toBe(true);
    expect(
      Err<number, number>(1)
        .map(x => x + 1)
        .eq(Err(1))
    ).toBe(true);
  });

  test("map_or_else", () => {
    expect(Ok<number, number>(1).map_or_else(x => x - 1, x => x + 1)).toEqual(2);
    expect(Err<number, number>(1).map_or_else(x => x - 1, x => x + 1)).toEqual(0);
  });

  test("map_err", () => {
    let ok = Ok<string, number>("hello");
    let err = ok.map_err(x => x + 1);
    expect(
      Ok<number, number>(1)
        .map_err(x => x + 1)
        .eq(Ok(1))
    ).toBe(true);
    expect(
      Err<number, number>(1)
        .map_err(x => x + 1)
        .eq(Err(2))
    ).toBe(true);
  });

  test("unwrap_or", () => {
    let ok = Ok<number, string>(100);
    let ok_err = Err<number, string>("Err");

    expect(ok.unwrap_or(50)).toEqual(100);
    expect(ok_err.unwrap_or(50)).toEqual(50);
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

    expect(ok.unwrap_or_else(handler)).toEqual(100);
    expect(ok_err.unwrap_or_else(handler)).toEqual(50);
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

    expect(() => {
      bad_err.unwrap_or_else(handler);
    }).toThrow();
  });

  test("expect_ok", () => {
    let ok: Result<number, string> = Ok(100);
    expect(ok.expect("Unexpected error")).toEqual(100);
  });

  test("expect_err", () => {
    let err: Result<number, string> = Err("All good");
    expect(() => {
      err.expect("Got expected error");
    }).toThrowError(new Error("Got expected error: All good"));
  });

  test("expect_err_err", () => {
    let ok: Result<string, number> = Err(100);
    expect(ok.expect_err("Unexpected error")).toEqual(100);
  });

  test("expect_err_ok", () => {
    let err: Result<string, number> = Ok("All good");
    expect(() => {
      err.expect_err("Got expected ok");
    }).toThrowError(new Error("Got expected ok: All good"));
  });

  test("iter", () => {
    let ok: Result<number, string> = Ok(100);
    let it = ok.iter();
    expect(it.next().value.unwrap()).toEqual(100);
    expect(it.next().value.is_none()).toBe(true);

    let err: Result<number, string> = Err("error");
    expect(it.next().value.is_none()).toBe(true);
  });
});
