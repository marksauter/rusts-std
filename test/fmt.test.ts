import { assert_eq, should_panic } from "../src/macros.test";
import { format } from "../src/fmt";

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  fmt_debug(): string {
    return `Point { x: ${this.x}, y: ${this.y} }`;
  }
  fmt_display(): string {
    return `[${this.x},${this.y}]`;
  }
}

describe("fmt", () => {
  test("format", () => {
    assert_eq(format("{}", undefined), "()");
    assert_eq(format("{}", null), "null");
    assert_eq(format("{}", 1), "1");
    assert_eq(format("{}", BigInt(1)), "1");
    assert_eq(format("{}", "foo"), '"foo"');
    assert_eq(format("{}", function() {}), "function () { }");
    assert_eq(format("{}", () => {}), "function () { }");
    assert_eq(format("{}", Symbol.iterator), "Symbol(Symbol.iterator)");
    assert_eq(format("{}", [1, 2]), "1,2");
    assert_eq(format("{}", { foo: "bar" }), "[object Object]");

    assert_eq(format("{:?}", undefined), "()");
    assert_eq(format("{:?}", null), "null");
    assert_eq(format("{:?}", 1), "1");
    assert_eq(format("{:?}", BigInt(1)), "1");
    assert_eq(format("{:?}", "foo"), '"foo"');
    assert_eq(format("{:?}", function() {}), "function () { }");
    assert_eq(format("{:?}", () => {}), "function () { }");
    assert_eq(format("{:?}", Symbol.iterator), "Symbol(Symbol.iterator)");
    assert_eq(format("{:?}", [1, 2]), "[1,2]");
    assert_eq(format("{:?}", { foo: "bar" }), '{"foo":"bar"}');

    assert_eq(format("{}", new Point(1, 2)), "[1,2]");
    assert_eq(format("{:?}", new Point(1, 2)), "Point { x: 1, y: 2 }");

    assert_eq(
      format("New Point {} with x = {} and y = {}", new Point(1, 2), 1, 2),
      "New Point [1,2] with x = 1 and y = 2"
    );
  });
});
