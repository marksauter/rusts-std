import { assert } from "./macros";
import { Option } from "./internal";
const is_equal = require("lodash.isequal");

export interface PartialEq<T> {
  eq(this: T, other: T): boolean;
}

export interface Eq<T> extends PartialEq<T> {}

export function isPartialEq(t: any): t is PartialEq<typeof t> {
  return typeof t === "object" && t !== null && (t as PartialEq<typeof t>).eq !== undefined;
}

export const isEq = isPartialEq;

export function eq<T>(left: T & PartialEq<T>, right: T & PartialEq<T>): boolean;
export function eq(left: any, right: any): boolean;
export function eq(left: any, right: any): boolean {
  if (isPartialEq(left)) {
    return left.eq(right);
  }
  return is_equal(left, right);
}

export function ne<T>(left: T & PartialEq<T>, right: T & PartialEq<T>): boolean;
export function ne(left: any, right: any): boolean;
export function ne(left: any, right: any): boolean {
  if (isPartialEq(left)) {
    return !left.eq(right);
  }
  return !is_equal(left, right);
}

enum OrderingType {
  Less = -1,
  Equal = 0,
  Greater = 1
}

class OrderingClass {
  private type: OrderingType;

  constructor(type: OrderingType) {
    this.type = type;
  }

  get(): number {
    return this.type as number;
  }

  public static less(): OrderingClass {
    return new OrderingClass(OrderingType.Less);
  }

  public static equal(): OrderingClass {
    return new OrderingClass(OrderingType.Equal);
  }

  public static greater(): OrderingClass {
    return new OrderingClass(OrderingType.Greater);
  }

  public reverse(): OrderingClass {
    switch (this.type) {
      case OrderingType.Less:
        return Greater;
      case OrderingType.Equal:
        return Equal;
      case OrderingType.Greater:
        return Less;
    }
  }

  public then(other: OrderingClass): OrderingClass {
    switch (this.type) {
      case OrderingType.Equal:
        return other;
      default:
        return this;
    }
  }

  public then_with(f: () => OrderingClass): OrderingClass {
    switch (this.type) {
      case OrderingType.Equal:
        return f();
      default:
        return this;
    }
  }
}

export const Less = OrderingClass.less();
export const Equal = OrderingClass.equal();
export const Greater = OrderingClass.greater();

export type Ordering = InstanceType<typeof OrderingClass>;

export interface PartialOrd<T> extends Eq<T> {
  partial_cmp(this: T, other: T): Option<Ordering>;
}

export function isPartialOrd(t: any): t is PartialOrd<typeof t> {
  return (
    typeof t === "object" && t !== null && (t as PartialOrd<typeof t>).partial_cmp !== undefined
  );
}

export function lt<T>(left: T & PartialOrd<T>, right: T & PartialOrd<T>): boolean;
export function lt<T>(left: T, right: T): boolean;
export function lt<T>(left: T, right: T): boolean {
  if (isPartialOrd(left)) {
    return left.partial_cmp(right).map_or(false, (t: Ordering) => t.get() < 0);
  }
  return left < right;
}

export function le<T>(left: T & PartialOrd<T>, right: T & PartialOrd<T>): boolean;
export function le<T>(left: T, right: T): boolean;
export function le<T>(left: T, right: T): boolean {
  if (isPartialOrd(left)) {
    return left.partial_cmp(right).map_or(false, (t: Ordering) => t.get() <= 0);
  }
  return left <= right;
}

export function ge<T>(left: T & PartialOrd<T>, right: T & PartialOrd<T>): boolean;
export function ge<T>(left: T, right: T): boolean;
export function ge<T>(left: T, right: T): boolean {
  if (isPartialOrd(left)) {
    return left.partial_cmp(right).map_or(false, (t: Ordering) => t.get() >= 0);
  }
  return left >= right;
}

export function gt<T>(left: T & PartialOrd<T>, right: T & PartialOrd<T>): boolean;
export function gt<T>(left: T, right: T): boolean;
export function gt<T>(left: T, right: T): boolean {
  if (isPartialOrd(left)) {
    return left.partial_cmp(right).map_or(false, (t: Ordering) => t.get() > 0);
  }
  return left > right;
}

export interface Ord<T> extends PartialOrd<T> {
  cmp(this: T, other: T): Ordering;
}

export function isOrd(t: any): t is Ord<typeof t> {
  return typeof t === "object" && t !== null && (t as Ord<typeof t>).cmp !== undefined;
}

export function cmp<T>(left: T & Ord<T>, right: T & Ord<T>): Ordering;
export function cmp<T>(left: T, right: T): Ordering;
export function cmp<T>(left: T, right: T): Ordering {
  if (isOrd(left)) {
    return left.cmp(right);
  }
  if (left < right) {
    return Less;
  } else if (left > right) {
    return Greater;
  } else {
    return Equal;
  }
}

export function max<T>(left: T & Ord<T>, right: T & Ord<T>): T;
export function max<T>(left: T, right: T): T;
export function max<T>(left: T, right: T): T {
  if (isOrd(right)) {
    return right.cmp(left).get() >= 0 ? right : left;
  }
  return right >= left ? right : left;
}

export function min<T>(left: T & Ord<T>, right: T & Ord<T>): T;
export function min<T>(left: T, right: T): T;
export function min<T>(left: T, right: T): T {
  if (isOrd(left)) {
    return left.cmp(right).get() <= 0 ? left : right;
  }
  return left <= right ? left : right;
}

export function clamp<T>(that: T & Ord<T>, min: T & Ord<T>, max: T & Ord<T>): T;
export function clamp<T>(that: T, min: T, max: T): T;
export function clamp<T>(that: T, min: T, max: T): T {
  assert(min <= max);
  if (isOrd(that)) {
    if (that.cmp(min).get() <= 0) {
      return min;
    } else if (that.cmp(max).get() > 0) {
      return max;
    } else {
      return that;
    }
  }

  if (that < min) {
    return min;
  } else if (that > max) {
    return max;
  } else {
    return that;
  }
}

export class Reverse<T extends Ord<any>> {
  0: T;

  constructor(t: T) {
    this[0] = t;
  }

  partial_cmp(other: Reverse<T>): Option<Ordering> {
    return other[0].partial_cmp(this[0]);
  }

  cmp(other: Reverse<T>): Ordering {
    return other[0].cmp(this[0]);
  }
}
