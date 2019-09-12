import { Option, Some, None } from "../src/option";
import { Result } from "../src/std";

describe("Option", () => {
  test("option_dance", () => {
    let x = Some(undefined);
    let y = Some(5);
    let y2 = 0;
    for (let _x of x) {
      y2 = y.take().unwrap();
    }
    expect(y2).toEqual(5);
    expect(y.is_none());
  });

  test("option_too_much_dance", () => {
    let A = {};
    let y = Some(A);
    let _y2 = y.take().unwrap();
    expect(() => {
      y.take().unwrap();
    }).toThrow();
  });

  test("eq", () => {
    let x = Some(0);
    let y = Some(5);
    expect(x.eq(y)).toBe(false);
    x.replace(5);
    expect(x.eq(y)).toBe(true);
  });

  test("and", () => {
    let x = Some(1);
    expect(x.and(Some(2)).eq(Option.Some(2))).toBe(true);
    expect(x.and(None<number>()).eq(None())).toBe(true);

    let y: Option<number> = None();
    expect(y.and(Some(2)).eq(None())).toBe(true);
    expect(y.and(None<number>()).eq(None())).toBe(true);
  });

  test("and_then", () => {
    let x = Some(1);
    expect(x.and_then((a: number) => Some(a + 1)).eq(Option.Some(2))).toBe(true);
    expect(x.and_then(() => None<number>()).eq(None())).toBe(true);

    let y: Option<number> = None();
    expect(y.and_then((a: number) => Some(a + 1)).eq(None())).toBe(true);
    expect(y.and_then(() => None<number>()).eq(None())).toBe(true);
  });

  test("or", () => {
    let x = Some(1);
    expect(x.or(Some(2)).eq(Option.Some(1))).toBe(true);
    expect(x.or(None()).eq(Some(1))).toBe(true);

    let y: Option<number> = None();
    expect(y.or(Some(2)).eq(Some(2))).toBe(true);
    expect(y.or(None()).eq(None())).toBe(true);
  });

  test("or_else", () => {
    let x = Some(1);
    expect(x.or_else(() => Some(2)).eq(Option.Some(1))).toBe(true);
    expect(x.or_else(() => None()).eq(Some(1))).toBe(true);

    let y: Option<number> = None();
    expect(y.or_else(() => Some(2)).eq(Some(2))).toBe(true);
    expect(y.or_else(() => None()).eq(None())).toBe(true);
  });

  test("unwrap", () => {
    expect(Some(1).unwrap()).toEqual(1);
    let s = Some("hello").unwrap();
    expect(s).toEqual("hello");
  });

  test("unwrap_panic1", () => {
    let x: Option<number> = None();
    expect(() => {
      x.unwrap();
    }).toThrow();
  });

  test("unwrap_panic2", () => {
    let x: Option<string> = None();
    expect(() => {
      x.unwrap();
    }).toThrow();
  });

  test("unwrap_or", () => {
    let x = Some(1);
    expect(x.unwrap_or(2)).toEqual(1);

    let y: Option<number> = None();
    expect(y.unwrap_or(2)).toEqual(2);
  });

  test("unwrap_or_else", () => {
    let x = Some(1);
    expect(x.unwrap_or_else(() => 2)).toEqual(1);

    let y: Option<number> = None();
    expect(y.unwrap_or_else(() => 2)).toEqual(2);
  });

  test("iter", () => {
    let val = 5;

    let x = Some(val);
    let it = x.iter();

    expect(it.next().value.eq(Some(val))).toBe(true);
    expect(it.next().value.is_none()).toBe(true);
  });

  test("replace", () => {
    let x = Some(2);
    let old = x.replace(5);

    expect(x.eq(Some(5))).toBe(true);
    expect(old.eq(Some(2))).toBe(true);

    x = None();
    old = x.replace(3);

    expect(x.eq(Some(3))).toBe(true);
    expect(old.eq(None())).toBe(true);
  });
});
