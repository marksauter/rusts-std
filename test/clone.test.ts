import { assert, assert_eq } from "../src/macros.test";
import { Clone, clone } from "../src/clone";
import { ImplPartialEq, Self, format } from "../src/std";

class NestedProp extends ImplPartialEq(Self) implements Clone {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
  clone(): NestedProp {
    return new NestedProp(this.x, this.y);
  }
  eq(other: NestedProp): boolean {
    return this.x === other.x && this.y === other.y;
  }
  fmt_debug(): string {
    return format("NestProp({:?},{:?})", this.x, this.y);
  }
}

class Nested {
  a: { b: { c: { d: number } } };
  constructor(d: number) {
    this.a = { b: { c: { d } } };
  }
  clone(): Nested {
    return new Nested(this.a.b.c.d);
  }
}

test("Clone", () => {
  let n1 = new Nested(1);
  let n2 = clone(n1);

  // Compare by reference
  assert(n1 !== n2);
  // Compare by value
  assert_eq(n1, n2);

  let o1 = { a: { b: 1 } };
  let o2 = clone(o1);

  // This will compare by reference, so they should NOT be equal
  assert(o1 !== o2);
  // This will compare by value, so they should be 'equal'
  assert_eq(o1, o2);

  let a1: [NestedProp, NestedProp] = [new NestedProp(1, 1), new NestedProp(2, 2)];
  let a2: [NestedProp, NestedProp] = clone(a1);

  // This will compare by reference, so they should NOT be equal
  assert(a1 !== a2);
  // This will compare by value, so they should be 'equal'
  assert_eq(a1, a2);
});
