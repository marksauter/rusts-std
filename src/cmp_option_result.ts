import {
  isNil,
  isObjectLike,
  is_nan,
  // mixin.ts
  AnyConstructor,
  Mixin,
  // self.ts
  Self,
  // clone.ts
  Clone,
  clone,
  // fmt.ts
  Debug,
  format,
  // ops/try.ts
  ImplTry,
  // intrinsics.ts
  maxnum,
  minnum,
  // macros.ts
  assert,
  abstract_panic
} from "./internal";
const is_equal = require("lodash.isequal");

/**
 * Trait for equality comparisons which are [partial equivalence
 * relations](http://en.wikipedia.org/wiki/Partial_equivalence_relation).
 */
export const ImplPartialEq = <T extends AnyConstructor<Self>>(Base: T) =>
  class PartialEq extends Base {
    public isPartialEq = true;

    public Rhs!: this["Self"];

    /**
     * This method tests for `self` and `other` values to be equal
     */
    public eq(this: this["Self"], other: this["Rhs"]): boolean {
      abstract_panic("PartialEq", "eq");
      // Unreachable
      return false;
    }

    /**
     * This method tests for `self` and `other` values to be not equal
     */
    public ne(this: this["Self"], other: this["Rhs"]): boolean {
      return !this.eq(other);
    }
  };

export type PartialEq = Mixin<typeof ImplPartialEq>;

export function isPartialEq(t: any): t is PartialEq {
  return !isNil(t) && (t as PartialEq).isPartialEq === true;
}

export const ImplEq = <T extends AnyConstructor<PartialEq>>(Base: T) =>
  class Eq extends Base {
    public isEq = true;

    public Rhs!: this["Self"];
  };

export type Eq = Mixin<typeof ImplEq>;

export function isEq(t: any): t is Eq {
  return !isNil(t) && (t as Eq).isEq === true;
}

/**
 * Trait for values that can be compared for a sort-order.
 */
export const ImplPartialOrd = <T extends AnyConstructor<PartialEq>>(Base: T) =>
  class PartialOrd extends Base {
    public isPartialOrd = true;

    public Rhs!: this["Self"];

    /**
     * This method returns an ordering between `self` and `other` values if one
     * exists.
     */
    public partial_cmp(this: this["Self"], other: this["Rhs"]): Option<Ordering> {
      abstract_panic("PartialOrd", "partial_cmp");
      // Unreachable
      return None();
    }

    /**
     * This method tests less than (for `self` and `other`).
     */
    public lt(this: this["Self"], other: this["Rhs"]): boolean {
      let match = this.partial_cmp(other).match();
      switch (match.type) {
        case OptionType.Some:
          if (match.value.eq(Less)) {
            return true;
          }
        default:
          return false;
      }
    }

    /**
     * This method tests less than or equal to (for `self` and `other`).
     */
    public le(this: this["Self"], other: this["Rhs"]): boolean {
      let match = this.partial_cmp(other).match();
      switch (match.type) {
        case OptionType.Some:
          if (match.value.eq(Less) || match.value.eq(Equal)) {
            return true;
          }
        default:
          return false;
      }
    }

    /**
     * This method tests greater than (for `self` and `other`).
     */
    public gt(this: this["Self"], other: this["Rhs"]): boolean {
      let match = this.partial_cmp(other).match();
      switch (match.type) {
        case OptionType.Some:
          if (match.value.eq(Greater)) {
            return true;
          }
        default:
          return false;
      }
    }

    /**
     * This method tests greater than or equal to (for `self` and `other`).
     */
    public ge(this: this["Self"], other: this["Rhs"]): boolean {
      let match = this.partial_cmp(other).match();
      switch (match.type) {
        case OptionType.Some:
          if (match.value.eq(Greater) || match.value.eq(Equal)) {
            return true;
          }
        default:
          return false;
      }
    }
  };

export type PartialOrd = Mixin<typeof ImplPartialOrd>;

export function isPartialOrd(t: any): t is PartialOrd {
  return !isNil(t) && (t as PartialOrd).isPartialOrd === true;
}

/**
 * Trait for values that can be compared for a sort-order.
 */
export const ImplOrd = <T extends AnyConstructor<Eq & PartialOrd>>(Base: T) =>
  class Ord extends Base {
    public isOrd = true;

    /**
     * This method returns an `Ordering` between `self` and `other`.
     */
    public cmp(this: this["Self"], other: this["Self"]): Ordering {
      abstract_panic("Ord", "cmp");
      // Unreachable
      return (undefined as unknown) as Ordering;
    }

    /**
     * Compares and returns the maximum of two values.
     */
    public max(this: this["Self"], other: this["Self"]): this["Self"] {
      return other.ge(this) ? other : this;
    }

    /**
     * Compares and returns the minimum of two values.
     */
    public min(this: this["Self"], other: this["Self"]): this["Self"] {
      return this.le(other) ? this : other;
    }

    /**
     * Restricts a value to a certain interval.
     */
    public clamp(this: this["Self"], min: this["Self"], max: this["Self"]): this["Self"] {
      assert(min.le(max));
      if (this.lt(min)) {
        return min;
      } else if (this.gt(max)) {
        return max;
      } else {
        return this;
      }
    }
  };

export type Ord = Mixin<typeof ImplOrd>;

export function isOrd(t: any): t is Ord {
  return !isNil(t) && (t as Ord).isOrd === true;
}

/**
 * An `Ordering` is the result of a comparison between two values.
 */
enum OrderingType {
  /**
   * An ordering where a compared value is less than another.
   */
  Less = -1,
  /**
   * An ordering where a compared value is equal than another.
   */
  Equal = 0,
  /**
   * An ordering where a compared value is greater than another.
   */
  Greater = 1
}

export class Ordering extends ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(Self))))
  implements Debug {
  public Self!: Ordering;

  private type: OrderingType;

  public constructor(type: OrderingType) {
    super();
    this.type = type;
  }

  public get(): number {
    return this.type as number;
  }

  // Not part of Rust::std::cmp::Ordering
  // This is an attempt to mimic Rust's `match` keyword
  public match(): OrderingType {
    return this.type;
  }

  public static less(): Ordering {
    return new Ordering(OrderingType.Less);
  }

  public static equal(): Ordering {
    return new Ordering(OrderingType.Equal);
  }

  public static greater(): Ordering {
    return new Ordering(OrderingType.Greater);
  }

  /**
   * Reverses the `Ordering`.
   *
   * *`Less` becomes `Greater`.
   * *`Greater` becomes `Less`.
   * *`Equal` becomes `Equal`.
   */
  public reverse(): Ordering {
    switch (this.type) {
      case OrderingType.Less:
        return Greater;
      case OrderingType.Equal:
        return Equal;
      case OrderingType.Greater:
        return Less;
    }
  }

  /**
   * Chains two orderings.
   */
  public then(other: Ordering): Ordering {
    switch (this.type) {
      case OrderingType.Equal:
        return other;
      default:
        return this;
    }
  }

  /**
   * Chains the ordering with the given function.
   */
  public then_with(f: () => Ordering): Ordering {
    switch (this.type) {
      case OrderingType.Equal:
        return f();
      default:
        return this;
    }
  }

  // PartialEq
  public eq(other: Ordering): boolean {
    return this.type === other.type;
  }

  // Ord
  public cmp(other: Ordering): Ordering {
    return cmp(this.type, other.type);
  }

  // PartialOrd
  public partial_cmp(other: Ordering): Option<Ordering> {
    return partial_cmp(this.type, other.type);
  }

  // Debug
  public fmt_debug(): string {
    switch (this.type) {
      case OrderingType.Less:
        return "Less";
      case OrderingType.Equal:
        return "Equal";
      case OrderingType.Greater:
        return "Greater";
    }
  }
}

export const Less = Ordering.less();
export const Equal = Ordering.equal();
export const Greater = Ordering.greater();

declare global {
  interface Array<T> {
    first(): Option<T>;
    last(): Option<T>;
    get(index: number): Option<T>;
    isPartialEq: true;
    eq(other: T[]): boolean;
    ne(other: T[]): boolean;

    isPartialOrd: true;
    partial_cmp(other: T[]): Option<Ordering>;
    lt(other: T[]): boolean;
    le(other: T[]): boolean;
    gt(other: T[]): boolean;
    ge(other: T[]): boolean;

    isOrd: true;
    cmp(other: T[]): Ordering;
    max(other: T[]): T[];
    min(other: T[]): T[];
    clamp(min: T[], max: T[]): T[];
  }
  interface Number {
    isPartialEq: true;
    eq(other: number): boolean;
    ne(other: number): boolean;

    isPartialOrd: true;
    partial_cmp(other: number): Option<Ordering>;
    lt(other: number): boolean;
    le(other: number): boolean;
    gt(other: number): boolean;
    ge(other: number): boolean;

    isOrd: true;
    cmp(other: number): Ordering;
    max(other: number): number;
    min(other: number): number;
    clamp(min: number, max: number): number;
  }
}

Array.prototype.first = function() {
  if (0 in this) {
    return Some(this[0]);
  }
  return None();
};
Array.prototype.last = function() {
  let index = this.length - 1;
  if (index in this) {
    return Some(this[index]);
  }
  return None();
};
Array.prototype.get = function(index) {
  if (index in this) {
    return Some(this[index]);
  }
  return None();
};
Array.prototype.isPartialEq = true;
Array.prototype.eq = function(other) {
  if (this.length !== other.length) {
    return false;
  }

  return this.iter()
    .zip(other.iter())
    .all(([x, y]) => eq(x, y));
};
Array.prototype.ne = function(other) {
  return !this.eq(other);
};
Array.prototype.isPartialOrd = true;
Array.prototype.partial_cmp = function(other) {
  let l = min(this.length, other.length);

  for (let i = 0; i < l; ++i) {
    let ord = partial_cmp(this[i], other[i]);
    if (!ord.eq(Some(Equal))) {
      return ord;
    }
  }

  return partial_cmp(this.length, other.length);
};
Array.prototype.lt = function(other) {
  let match = this.partial_cmp(other).match();
  switch (match.type) {
    case OptionType.Some:
      if (match.value.eq(Less)) {
        return true;
      }
    default:
      return false;
  }
};
Array.prototype.le = function(other) {
  let match = this.partial_cmp(other).match();
  switch (match.type) {
    case OptionType.Some:
      if (match.value.eq(Less) || match.value.eq(Equal)) {
        return true;
      }
    default:
      return false;
  }
};
Array.prototype.gt = function(other) {
  let match = this.partial_cmp(other).match();
  switch (match.type) {
    case OptionType.Some:
      if (match.value.eq(Greater)) {
        return true;
      }
    default:
      return false;
  }
};
Array.prototype.ge = function(other) {
  let match = this.partial_cmp(other).match();
  switch (match.type) {
    case OptionType.Some:
      if (match.value.eq(Greater) || match.value.eq(Equal)) {
        return true;
      }
    default:
      return false;
  }
};
Array.prototype.isOrd = true;
Array.prototype.cmp = function(other) {
  let l = min(this.length, other.length);

  for (let i = 0; i < l; ++i) {
    let ord = cmp(this[i], other[i]);
    if (!ord.eq(Equal)) {
      return ord;
    }
  }

  return cmp(this.length, other.length);
};
Array.prototype.max = function(other) {
  return other.ge(this) ? other : this;
};
Array.prototype.min = function(other) {
  return this.le(other) ? this : other;
};
Array.prototype.clamp = function(min, max) {
  assert(min.le(max));
  if (this.lt(min)) {
    return min;
  } else if (this.gt(max)) {
    return max;
  } else {
    return this;
  }
};

Number.prototype.isPartialEq = true;
Number.prototype.eq = function(other) {
  return this.valueOf() === other;
};
Number.prototype.ne = function(other) {
  return !this.eq(other);
};
Number.prototype.isPartialOrd = true;
Number.prototype.partial_cmp = function(other) {
  let n = this.valueOf();
  let le = n <= other;
  let ge = n >= other;
  if (!le && !ge) {
    return None();
  } else if (!le && ge) {
    return Some(Greater);
  } else if (le && !ge) {
    return Some(Less);
  } else {
    return Some(Equal);
  }
};
Number.prototype.lt = function(other) {
  return this.valueOf() < other;
};
Number.prototype.le = function(other) {
  return this.valueOf() <= other;
};
Number.prototype.gt = function(other) {
  return this.valueOf() > other;
};
Number.prototype.ge = function(other) {
  return this.valueOf() >= other;
};
Number.prototype.isOrd = true;
Number.prototype.cmp = function(other) {
  let n = this.valueOf();
  if (n < other) {
    return Less;
  } else if (n === other) {
    return Equal;
  } else {
    return Greater;
  }
};
Number.prototype.max = function(other) {
  return maxnum(this.valueOf(), other);
};
Number.prototype.min = function(other) {
  return minnum(this.valueOf(), other);
};
Number.prototype.clamp = function(min, max) {
  assert(min <= max);
  let n = this.valueOf();
  if (n < min) {
    return min;
  } else if (n > max) {
    return max;
  } else {
    return n;
  }
};

// Get `Option`al value at `obj[key]`.
function get(obj: { [index: string]: any }, key: string): Option<any> {
  if (key in obj) {
    return Some(obj[key]);
  }
  return None();
}

export function eq<T extends PartialEq>(left: T, right: T): boolean;
export function eq<T>(left: T, right: T): boolean;
export function eq(left: any, right: any): boolean {
  if (left === right) {
    return true;
  }
  if (left == null || right == null || (!isObjectLike(left) && !isObjectLike(right))) {
    if (is_nan(left) || is_nan(right)) {
      return false;
    }
    return left !== left && right !== right;
  }
  if (isPartialEq(left) && isPartialEq(right)) {
    return left.eq(right);
  }
  if (isObjectLike(left) && isObjectLike(right)) {
    let entries = Object.entries(left);
    let other_len = Object.keys(right).length;
    if (entries.length !== other_len) {
      return false;
    }
    return entries
      .iter()
      .all(([key, value]: [string, any]) =>
        get(right, key).map_or(false, (v: any) => eq(value, v))
      );
  }
  return is_equal(left, right);
}

export function ne<T extends PartialEq>(left: T, right: T): boolean;
export function ne<T>(left: T, right: T): boolean;
export function ne(left: any, right: any): boolean {
  if (left === right) {
    return false;
  }
  if (left == null || right == null || (!isObjectLike(left) && !isObjectLike(right))) {
    if (is_nan(left) || is_nan(right)) {
      return true;
    }
    return !(left !== left && right !== right);
  }
  if (isPartialEq(left) && isPartialEq(right)) {
    return left.ne(right);
  }
  if (isObjectLike(left) && isObjectLike(right)) {
    let entries = Object.entries(left);
    let other_len = Object.keys(right).length;
    if (entries.length !== other_len) {
      return true;
    }
    return entries
      .iter()
      .any(([key, value]: [string, any]) =>
        get(right, key).map_or(false, (v: any) => ne(value, v))
      );
  }
  return !is_equal(left, right);
}

export function partial_cmp<T extends PartialOrd>(left: T, right: T): Option<Ordering>;
export function partial_cmp<T>(left: T, right: T): Option<Ordering>;
export function partial_cmp(left: any, right: any): Option<Ordering> {
  if (isPartialOrd(left) && isPartialOrd(right)) {
    return left.partial_cmp(right);
  }
  let less_equal = le(left, right);
  let greater_equal = ge(left, right);
  if (!less_equal && !greater_equal) {
    return None();
  } else if (!less_equal && greater_equal) {
    return Some(Greater);
  } else if (less_equal && !greater_equal) {
    return Some(Less);
  } else {
    return Some(Equal);
  }
}

export function lt<T extends PartialOrd>(left: T, right: T): boolean;
export function lt<T>(left: T, right: T): boolean;
export function lt(left: any, right: any): boolean {
  if (isPartialOrd(left) && isPartialOrd(right)) {
    return left.lt(right);
  }
  return left < right;
}

export function le<T extends PartialOrd>(left: T, right: T): boolean;
export function le<T>(left: T, right: T): boolean;
export function le(left: any, right: any): boolean {
  if (isPartialOrd(left) && isPartialOrd(right)) {
    return left.le(right);
  }
  return left <= right;
}

export function gt<T extends PartialOrd>(left: T, right: T): boolean;
export function gt<T>(left: T, right: T): boolean;
export function gt(left: any, right: any): boolean {
  if (isPartialOrd(left) && isPartialOrd(right)) {
    return left.gt(right);
  }
  return left > right;
}

export function ge<T extends PartialOrd>(left: T, right: T): boolean;
export function ge<T>(left: T, right: T): boolean;
export function ge(left: any, right: any): boolean {
  if (isPartialOrd(left) && isPartialOrd(right)) {
    return left.ge(right);
  }
  return left >= right;
}

export function cmp<T extends Ord>(left: T, right: T): Ordering;
export function cmp<T>(left: T, right: T): Ordering;
export function cmp(left: any, right: any): Ordering {
  if (isOrd(left) && isOrd(right)) {
    return left.cmp(right);
  }
  if (lt(left, right)) {
    return Less;
  } else if (gt(left, right)) {
    return Greater;
  } else {
    return Equal;
  }
}

/**
 * Compares and returns the minimum of two values.
 */
export function min<T extends Ord>(v1: T, v2: T): T;
export function min<T>(v1: T, v2: T): T;
export function min(v1: any, v2: any): any {
  if (isOrd(v1) && isOrd(v2)) {
    return v1.min(v2);
  }
  return le(v1, v2) ? v1 : v2;
}

/**
 * Compares the minumum of two values with respect to the specified comparison
 * function.
 *
 * Returns the first argument if the comparison determines them to be equal.
 */
export function min_by<T>(v1: T, v2: T, compare: (v1: T, v2: T) => Ordering): T {
  switch (compare(v1, v2).match()) {
    case OrderingType.Less:
    case OrderingType.Equal:
      return v1;
    case OrderingType.Greater:
      return v2;
  }
}

/**
 * Returns the element that gives the minimum value from the specified function.
 *
 * Returns the first argument if the comparison determines them to be equal.
 */
export function min_by_key<T, K>(v1: T, v2: T, f: (x: T) => K): T {
  return min_by(v1, v2, (v1: T, v2: T) => cmp(f(v1), f(v2)));
}

/**
 * Compares and returns the maximum of two values.
 *
 * Returns the second argument if the comparison determines them to be equal.
 */
export function max<T extends Ord>(v1: T, v2: T): T;
export function max<T>(v1: T, v2: T): T;
export function max(v1: any, v2: any): any {
  if (isOrd(v1) && isOrd(v2)) {
    return v1.max(v2);
  }
  return le(v1, v2) ? v2 : v1;
}

/**
 * Compares the maxumum of two values with respect to the specified comparison
 * function.
 *
 * Returns the second argument if the comparison determaxes them to be equal.
 */
export function max_by<T>(v1: T, v2: T, compare: (v1: T, v2: T) => Ordering): T {
  switch (compare(v1, v2).match()) {
    case OrderingType.Less:
    case OrderingType.Equal:
      return v2;
    case OrderingType.Greater:
      return v1;
  }
}

/**
 * Returns the element that gives the maximum value from the specified function.
 *
 * Returns the second argument if the comparison determaxes them to be equal.
 */
export function max_by_key<T, K>(v1: T, v2: T, f: (x: T) => K): T {
  return max_by(v1, v2, (v1: T, v2: T) => cmp(f(v1), f(v2)));
}

export function clamp<T extends Ord>(that: T, min: T, max: T): T;
export function clamp<T>(that: T, min: T, max: T): T;
export function clamp(that: any, min: any, max: any): any {
  if (isOrd(that) && isOrd(min) && isOrd(max)) {
    assert(min.le(max));
    return that.clamp(min, max);
  }
  assert(le(min, max));
  if (lt(that, min)) {
    return min;
  } else if (gt(that, max)) {
    return max;
  } else {
    return that;
  }
}

/**
 * A helper class for reverse ordering.
 */
export class Reverse<T> extends ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(Self)))) {
  public Self!: Reverse<T>;

  public 0: T;

  public constructor(t: T) {
    super();
    this[0] = t;
  }

  // PartialOrd
  public partial_cmp(other: Reverse<T>): Option<Ordering> {
    return partial_cmp(other[0], this[0]);
  }

  public lt(other: this["Self"]): boolean {
    return lt(other[0], this[0]);
  }
  public le(other: this["Self"]): boolean {
    return le(other[0], this[0]);
  }
  public ge(other: this["Self"]): boolean {
    return ge(other[0], this[0]);
  }
  public gt(other: this["Self"]): boolean {
    return gt(other[0], this[0]);
  }

  // Ord
  public cmp(other: Reverse<T>): Ordering {
    return cmp(other[0], this[0]);
  }
}

export enum OptionType {
  Some = "Some",
  None = "None"
}

export type Some<T> = { type: OptionType.Some; value: T };
export type None = { type: OptionType.None };

export type NoneError = undefined;

export function SomeVariant<T>(value: T): Some<T> {
  return {
    type: OptionType.Some,
    value
  };
}

export function NoneVariant(): None {
  return {
    type: OptionType.None
  };
}

export type OptionVariant<T> = Some<T> | None;

export class Option<T> extends ImplTry(ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(Self)))))
  implements Clone, Debug {
  public Self!: Option<T>;

  protected payload: OptionVariant<T>;

  public constructor(payload: OptionVariant<T>) {
    super();
    this.payload = payload;
  }

  public eq(other: Option<T>): boolean {
    switch (this.payload.type) {
      case OptionType.Some: {
        let value = this.payload.value;
        return other.map_or(false, (t: T) => eq(t, value));
      }
      case OptionType.None:
        return other.is_none();
    }
  }

  public cmp(other: Option<T>): Ordering {
    switch (this.payload.type) {
      case OptionType.Some:
        let value = this.payload.value;
        return other.map_or(Greater, (t: T) => cmp(value, t));
      case OptionType.None:
        return other.map_or(Equal, () => Less);
    }
  }

  public partial_cmp(other: Option<T>): Option<Ordering> {
    return Some(this.cmp(other));
  }

  public fmt_debug(): string {
    switch (this.payload.type) {
      case OptionType.Some:
        return `${this.payload.type}(${format("{:?}", this.payload.value)})`;
      case OptionType.None:
        return `${this.payload.type}`;
    }
  }

  // Not part of Rust::std::option::Option
  // This is an attempt to mimic Rust's `match` keyword
  public match(): OptionVariant<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return SomeVariant(this.payload.value);
      case OptionType.None:
        return NoneVariant();
    }
  }

  public is_some(): boolean {
    switch (this.payload.type) {
      case OptionType.Some:
        return true;
      case OptionType.None:
        return false;
    }
  }

  public is_none(): this is None {
    return !this.is_some();
  }

  public expect(msg: string): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        throw new Error(msg);
    }
  }

  public unwrap(): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        throw new Error("called `Option.unwrap()` on a `None` value");
    }
  }

  public unwrap_or(def: T): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        return def;
    }
  }

  public unwrap_or_else(f: () => T): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        return f();
    }
  }

  public map<U>(f: (t: T) => U): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Some(f(this.payload.value));
      case OptionType.None:
        return None();
    }
  }

  public map_or<U>(def: U, f: (t: T) => U): U {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.value);
      case OptionType.None:
        return def;
    }
  }

  public map_or_else<U>(def: () => U, f: (t: T) => U): U {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.value);
      case OptionType.None:
        return def();
    }
  }

  public ok_or<E>(err: E): Result<T, E> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Ok(this.payload.value);
      case OptionType.None:
        return Err(err);
    }
  }

  public ok_or_else<E>(err: () => E): Result<T, E> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Ok(this.payload.value);
      case OptionType.None:
        return Err(err());
    }
  }

  public and<U>(optb: Option<U>): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return optb;
      case OptionType.None:
        return None();
    }
  }

  public and_then<U>(f: (t: T) => Option<U>): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.value);
      case OptionType.None:
        return None();
    }
  }

  public filter(predicate: (t: T) => boolean): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some: {
        if (predicate(this.payload.value)) {
          return Some(this.payload.value);
        }
      }
      default:
        return None();
    }
  }

  public or(optb: Option<T>): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Some(this.payload.value);
      case OptionType.None:
        return optb;
    }
  }

  public or_else(f: () => Option<T>): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Some(this.payload.value);
      case OptionType.None:
        return f();
    }
  }

  public xor(optb: Option<T>): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some: {
        if (optb.is_none()) {
          return Some(this.payload.value);
        }
        break;
      }
      case OptionType.None: {
        return optb;
      }
    }
    return None();
  }

  public get_or_insert(v: T): T {
    return this.get_or_insert_with(() => v);
  }

  public get_or_insert_with(f: () => T): T {
    switch (this.payload.type) {
      case OptionType.None:
        this.replace(f());
      default:
        break;
    }

    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      // This should never happen
      case OptionType.None:
        throw new Error(`Option.get_or_insert_with: unreachable_unchecked ${self}`);
    }
  }

  public take(): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        let ret = Some(this.payload.value);
        this.payload = NoneVariant();
        return ret;
      case OptionType.None:
        return None();
    }
  }

  public replace(payload: T): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        let ret = Some(this.payload.value);
        this.payload = SomeVariant(payload);
        return ret;
      case OptionType.None:
        this.payload = SomeVariant(payload);
        return None();
    }
  }

  // Maps an `Option<&T>` to and `Option<T>` by cloning the contents of the
  // option.
  public cloned(): Option<T> {
    return this.map((t: T) => clone(t));
  }

  // Transposes an `Option` of a `Result` into a `Result` of an `Option`.
  public transpose<T, E>(this: Option<Result<T, E>>): Result<Option<T>, E> {
    switch (this.payload.type) {
      case OptionType.Some: {
        let match = this.payload.value.match();
        switch (match.type) {
          case ResultType.Ok:
            return Ok(Some(match.value));
          case ResultType.Err:
            return Err(match.value);
        }
      }
      case OptionType.None:
        return Ok(None());
    }
  }

  // Default
  public static default<T>(): Option<T> {
    return None();
  }

  // Clone
  public clone(): this["Self"] {
    switch (this.payload.type) {
      case OptionType.Some:
        return Some(clone(this.payload.value));
      case OptionType.None:
        return None();
    }
  }

  public clone_from(source: this["Self"]) {
    let match = source.match();
    switch (match.type) {
      case OptionType.Some:
        this.payload = SomeVariant(clone(match.value));
        break;
      case OptionType.None:
        this.payload = NoneVariant();
        break;
    }
  }

  // ops::Try
  public Okay!: T;
  public Error!: NoneError;

  public is_error(): boolean {
    return this.is_none();
  }

  public into_result(): Result<T, NoneError> {
    return this.ok_or<NoneError>(undefined);
  }

  public static from_okay<T>(v: T): Option<T> {
    return Some(v);
  }

  public static from_error<T = undefined>(_: NoneError): Option<T> {
    return None();
  }

  // Converts from `Option<Option<T>>` to `Option<T>`
  public flatten<B, Self extends Option<Option<B>>>(this: Self): Option<B> {
    switch (this.payload.type) {
      case OptionType.Some: {
        return this.payload.value;
      }
      default:
        return None();
    }
  }
}

export interface OptionStatic {
  Self: Option<any>;
  Some<T>(payload: T): Option<T>;
  None<T = undefined>(): Option<T>;
}

export var OptionConstructor: OptionStatic = {} as OptionStatic;

OptionConstructor.Some = function<T>(payload: T): Option<T> {
  return new Option(SomeVariant(payload));
};
OptionConstructor.None = function<T = undefined>(): Option<T> {
  return new Option(NoneVariant());
};

export function Some<T>(payload: T): Option<T> {
  return OptionConstructor.Some<T>(payload);
}

export function None<T = undefined>(): Option<T> {
  return OptionConstructor.None<T>();
}

export enum ResultType {
  Ok = "Ok",
  Err = "Err"
}

export type Ok<T> = { type: ResultType.Ok; value: T };
export type Err<E> = { type: ResultType.Err; value: E };

export function OkVariant<T>(value: T): Ok<T> {
  return {
    type: ResultType.Ok,
    value
  };
}

export function ErrVariant<E>(value: E): Err<E> {
  return {
    type: ResultType.Err,
    value
  };
}

export type ResultVariant<T, E> = Ok<T> | Err<E>;

export class Result<T, E> extends ImplTry(ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(Self)))))
  implements Clone, Debug {
  public Self!: Result<T, E>;

  protected payload: ResultVariant<T, E>;

  public constructor(payload: ResultVariant<T, E>) {
    super();
    this.payload = payload;
  }

  public eq(other: Result<T, E>): boolean {
    switch (this.payload.type) {
      case ResultType.Ok:
        return other.map_or_else(() => false, (t: T) => eq(t, this.payload.value));
      case ResultType.Err:
        return other.map_or_else((e: E) => eq(e, this.payload.value), () => false);
    }
  }

  public cmp(other: Result<T, E>): Ordering {
    switch (this.payload.type) {
      case ResultType.Ok:
        return other.map_or_else(() => Greater, (t: T) => cmp(this.payload.value, t));
      case ResultType.Err:
        return other.map_or_else((e: E) => cmp(this.payload.value, e), () => Less);
    }
  }

  public partial_cmp(other: Result<T, E>): Option<Ordering> {
    return Some(this.cmp(other));
  }

  public fmt_debug(): string {
    return `${this.payload.type}(${format("{:?}", this.payload.value)})`;
  }

  // Not part of Rust::std::result::Result
  // This is an attempt to mimic Rust's `match` keyword
  public match(): ResultVariant<T, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return OkVariant(this.payload.value);
      case ResultType.Err:
        return ErrVariant(this.payload.value);
    }
  }

  public is_ok(): boolean {
    switch (this.payload.type) {
      case ResultType.Ok:
        return true;
      case ResultType.Err:
        return false;
    }
  }

  public is_err(): boolean {
    return !this.is_ok();
  }

  public ok(): Option<T> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Some(this.payload.value);
      case ResultType.Err:
        return None();
    }
  }

  public err(): Option<E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return None();
      case ResultType.Err:
        return Some(this.payload.value);
    }
  }

  public map<U>(op: (v: T) => U): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Ok(op(this.payload.value));
      case ResultType.Err:
        return Err(this.payload.value);
    }
  }

  public map_or_else<U>(fallback: (v: E) => U, map: (v: T) => U): U {
    return this.map<U>(map).unwrap_or_else(fallback);
  }

  public map_err<F>(op: (e: E) => F): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Ok(this.payload.value);
      case ResultType.Err:
        return Err(op(this.payload.value));
    }
  }

  public and<U>(res: Result<U, E>): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return res;
      case ResultType.Err:
        return Err(this.payload.value);
    }
  }

  public and_then<U>(op: (t: T) => Result<U, E>): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return op(this.payload.value);
      case ResultType.Err:
        return Err(this.payload.value);
    }
  }

  public or<F>(res: Result<T, F>): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Ok(this.payload.value);
      case ResultType.Err:
        return res;
    }
  }

  public or_else<F>(op: (e: E) => Result<T, F>): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Ok(this.payload.value);
      case ResultType.Err:
        return op(this.payload.value);
    }
  }

  public unwrap_or(optb: T): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        return optb;
    }
  }

  public unwrap_or_else(op: (e: E) => T): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        return op(this.payload.value);
    }
  }

  public unwrap(): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        throw new Error(`called 'Result.unwrap()' on an 'Err' value: ${this.payload.value}`);
    }
  }

  public expect(msg: string): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        throw new Error(`${msg}: ${this.payload.value}`);
    }
  }

  public unwrap_err(): E {
    switch (this.payload.type) {
      case ResultType.Ok:
        throw new Error(`called 'Result.unwrap_err()' on an 'Ok' value: ${this.payload.value}`);
      case ResultType.Err:
        return this.payload.value;
    }
  }

  public expect_err(msg: string): E {
    switch (this.payload.type) {
      case ResultType.Ok:
        throw new Error(`${msg}: ${this.payload.value}`);
      case ResultType.Err:
        return this.payload.value;
    }
  }

  public transpose<B>(this: Result<Option<B>, E>): Option<Result<B, E>> {
    switch (this.payload.type) {
      case ResultType.Ok: {
        let opt = this.payload.value;
        if (opt instanceof Option) {
          return opt.map((b: B) => Ok(b));
        } else {
          return Some(Ok<B, E>(opt));
        }
      }
      case ResultType.Err:
        return Some(Err(this.payload.value));
    }
  }

  // Clone
  public clone(): this["Self"] {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Ok(clone(this.payload.value));
      case ResultType.Err:
        return Err(clone(this.payload.value));
    }
  }

  public clone_from(source: this["Self"]) {
    let match = source.match();
    switch (match.type) {
      case ResultType.Ok:
        this.payload = OkVariant(match.value);
        break;
      case ResultType.Err:
        this.payload = ErrVariant(match.value);
        break;
    }
  }

  // ops::Try
  public Okay!: T;
  public Error!: E;

  public is_error(): boolean {
    return this.is_err();
  }

  public into_result(): this {
    return this;
  }

  public static from_okay<T = any, E = undefined>(v: T): Result<T, E> {
    return Ok(v);
  }

  public static from_error<T = undefined, E = any>(v: E): Result<T, E> {
    return Err(v);
  }
}

export interface ResultStatic {
  Self: Result<any, any>;
  Ok<T = any, E = undefined>(payload: T): Result<T, E>;
  Err<T = undefined, E = any>(payload: E): Result<T, E>;
}

export var ResultConstructor: ResultStatic = {} as ResultStatic;

ResultConstructor.Ok = function<T = any, E = undefined>(payload: T): Result<T, E> {
  return new Result(OkVariant(payload));
};
ResultConstructor.Err = function<T = undefined, E = any>(payload: E): Result<T, E> {
  return new Result(ErrVariant(payload));
};

export function Ok<T = any, E = undefined>(payload: T): Result<T, E> {
  return ResultConstructor.Ok<T, E>(payload);
}

export function Err<T = undefined, E = any>(payload: E): Result<T, E> {
  return ResultConstructor.Err<T, E>(payload);
}
