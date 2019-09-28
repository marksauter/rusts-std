import { assert, assert_eq } from "../src/macros.test";
import { Default } from "../src/default";

class One {
  static default(): number {
    return 1;
  }
}

test("Default", () => {
  assert_eq(One.default(), 1);
});
