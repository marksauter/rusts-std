import { Range } from "../src/ops";

describe("Range", () => {
  test("range", () => {
    let r = new Range(2, 10);
    let count = 0;
    for (let i of r) {
      let n = i.unwrap();
      expect(n >= 2 && n < 10).toBe(true);
      count += 1;
    }
    expect(count).toEqual(8);
  });
});
