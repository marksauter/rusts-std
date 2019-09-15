import { assert, assert_eq } from "../src/macros.test";
import { Range } from "../src/ops";

describe("Range", () => {
  test("range", () => {
    let r = new Range(2, 10);
    let count = 0;
    for (let i of r) {
      let n = i.unwrap();
      assert(n >= 2 && n < 10);
      count += 1;
    }
    assert_eq(count, 8);
  });

  // test("range_from", () => {
  //   let r = new RangeFrom(2);
  //   let count = 0;
  //   for (let i of r) {
  //     let n = i.unwrap();
  //     assert(n >= 2 && n < 12);
  //     count += 1;
  //     if (count === 10) break;
  //   }
  //   assert_eq(count, 10);
  // });
});
