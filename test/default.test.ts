import { assert, assert_eq } from "../src/macros.test";
import { Default, get_default } from "../src/default";

class One {
  static default(): number {
    return 1;
  }
}

test("Default", () => {
  assert_eq(get_default(One), 1);
});
