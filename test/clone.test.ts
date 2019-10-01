import { assert, assert_eq } from "../src/macros.test";
import { Clone, clone } from "../src/clone";

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
});
