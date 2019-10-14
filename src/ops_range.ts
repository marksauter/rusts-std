import {
  Self,
  Debug,
  format,
  IteratorBase,
  ExactSizeAndDoubleEndedIterator,
  Try,
  TryConstructor,
  Option,
  OptionType,
  Some,
  None,
  Result,
  Ok,
  Err,
  ImplPartialEq,
  PartialOrd,
  partial_cmp,
  Less,
  Greater,
  Equal,
  Clone,
  u64,
  u64_saturating_add,
  u64_checked_add,
  i64_checked_add,
  i64_checked_sub,
  U64_MAX,
  swap
} from "./internal";

/**
 * Objects that can be stepped over in both directions.
 *
 * The steps_between` function provides a way to efficiently compare
 * two `Step` objects.
 */
export interface Step extends Self, Clone, PartialOrd {
  /**
   * Returns the number of steps between two step objects. The count is
   * inclusive of `this` and exclusive of `end`.
   *
   * Returns `None` if it is not possible to calculate `steps_between`
   * without overflow.
   */
  steps_between(end: this["Self"]): Option<number>;

  /**
   * Replaces this step with `1`, returning itself.
   */
  replace_one(): this["Self"];

  /**
   * Replaces this step with `0`, returning itself.
   */
  replace_zero(): this["Self"];

  /**
   * Adds one to this step, returning the result.
   */
  add_one(): this["Self"];

  /**
   * Subtracts one to this step, returning the result.
   */
  sub_one(): this["Self"];

  /**
   * Adds a `usize`, returning `None` on overflow.
   */
  add_usize(n: number): Option<this["Self"]>;

  /**
   * Subtracts a `usize`, returning `None` on underflow.
   */
  sub_usize(n: number): Option<this["Self"]>;
}

declare global {
  interface Number {
    steps_between(end: number): Option<number>;
    replace_one(): number;
    replace_zero(): number;
    add_one(): number;
    sub_one(): number;
    add_usize(n: number): Option<number>;
    sub_usize(n: number): Option<number>;
  }
}

Number.prototype.steps_between = function(end) {
  if (this.valueOf() < end) {
    if (end - this.valueOf() < 0) {
      return None();
    }
    return Some(end - this.valueOf());
  } else {
    return Some(0);
  }
};

Number.prototype.replace_one = function() {
  return 1;
};

Number.prototype.replace_zero = function() {
  return 0;
};

Number.prototype.add_one = function() {
  return this.valueOf() + 1;
};

Number.prototype.sub_one = function() {
  return this.valueOf() - 1;
};

Number.prototype.add_usize = function(n) {
  // `n` is meant to be a u64
  n = u64(n);
  return i64_checked_add(this.valueOf(), n);
};

Number.prototype.sub_usize = function(n) {
  // `n` is meant to be a u64
  n = u64(n);
  return i64_checked_sub(this.valueOf(), n);
};

export class Range<A extends Step> extends ImplPartialEq(ExactSizeAndDoubleEndedIterator)
  implements Clone, Debug {
  public Self!: Range<A>;

  public start: A;
  public end: A;

  constructor(start: A, end: A) {
    super();
    this.start = start;
    this.end = end;
  }

  // Iterator
  public Item!: A;

  public next(): Option<A> {
    if (this.start.lt(this.end)) {
      let n = this.start.add_usize(1).match();
      switch (n.type) {
        case OptionType.Some:
          [n.value, this.start] = swap(n.value, this.start);
          return Some(n.value);
        case OptionType.None:
          return None();
      }
    }

    return None();
  }

  public size_hint(): [number, Option<number>] {
    let match = this.start.steps_between(this.end).match();
    switch (match.type) {
      case OptionType.Some:
        return [match.value, Some(match.value)];
      case OptionType.None:
        return [U64_MAX, None()];
    }
  }

  public nth(n: number): Option<A> {
    let match = this.start.add_usize(n).match();
    switch (match.type) {
      case OptionType.Some:
        let plus_n = match.value;
        if (plus_n.lt(this.end)) {
          this.start = plus_n.add_one();
          return Some(plus_n);
        }
      case OptionType.None:
        this.start = this.end;
        return None();
    }
  }

  public last(): Option<A> {
    return this.next_back();
  }

  public min(): Option<A> {
    return this.next();
  }

  public max(): Option<A> {
    return this.next_back();
  }

  public next_back(): Option<A> {
    if (this.start.lt(this.end)) {
      this.end = this.end.sub_one();
      return Some(this.end);
    } else {
      return None();
    }
  }

  public nth_back(n: number): Option<A> {
    let match = this.end.sub_usize(n).match();
    switch (match.type) {
      case OptionType.Some:
        let minus_n = match.value;
        if (minus_n.gt(this.start)) {
          this.end = minus_n.sub_one();
          return Some(this.end);
        }
      case OptionType.None:
        this.end = this.start;
        return None();
    }
  }

  public contains(item: A): boolean {
    return item.ge(this.start) && item.lt(this.end);
  }

  public is_empty(): boolean {
    return !this.start.lt(this.end);
  }

  // PartialEq
  public eq(other: this["Self"]): boolean {
    return this.start.eq(other.start) && this.end.eq(other.end);
  }

  // Clone
  public clone(): this["Self"] {
    return new Range(this.start, this.end);
  }

  // Debug
  public fmt_debug(): string {
    return format("{:?}..{:?}", this.start, this.end);
  }
}

export class RangeFrom<A extends Step> extends ImplPartialEq(IteratorBase) {
  public Self!: RangeFrom<A>;

  public start: A;

  constructor(start: A) {
    super();
    this.start = start;
  }

  // Iterator
  public Item!: A;

  public next(): Option<A> {
    let n = this.start;
    this.start = this.start.add_one();
    return Some(n);
  }

  public size_hint(): [number, Option<number>] {
    return [U64_MAX, None()];
  }

  public nth(n: number): Option<A> {
    let plus_n = this.start.add_usize(n).expect("overflow in RangeFrom.nth");
    this.start = plus_n.add_one();
    return Some(plus_n);
  }

  public contains(item: A): boolean {
    return item.ge(this.start);
  }
  // PartialEq
  public eq(other: this["Self"]): boolean {
    return this.start.eq(other.start);
  }

  // Clone
  public clone(): this["Self"] {
    return new RangeFrom(this.start);
  }

  // Debug
  public fmt_debug(): string {
    return format("{:?}..", this.start);
  }
}

// export class RangeTo {
//   public end: number
//
//   constructor(end: number) {
//     this.end = end
//   }
//
//   public clone(): RangeTo {
//     return new RangeTo(this.end)
//   }
//
//   public contains(item: number): boolean {
//     return item < this.end
//   }
// }

export class RangeInclusive<A extends Step> extends ImplPartialEq(ExactSizeAndDoubleEndedIterator)
  implements Clone, Debug {
  public Self!: RangeInclusive<A>;

  protected _start: A;
  protected _end: A;
  protected _is_empty: Option<boolean>;

  constructor(start: A, end: A) {
    super();
    this._start = start;
    this._end = end;
    this._is_empty = None();
  }

  public start(): A {
    return this._start;
  }

  public end(): A {
    return this._end;
  }

  // Iterator
  public Item!: A;

  public next(): Option<A> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }
    let is_iterating = this._start.lt(this._end);
    this._is_empty = Some(!is_iterating);
    if (is_iterating) {
      let n = this._start;
      this._start = this._start.add_one();
      return Some(n);
    } else {
      return Some(this._start);
    }
  }

  public size_hint(): [number, Option<number>] {
    if (this.is_empty()) {
      return [0, Some(0)];
    }

    let match = this._start.steps_between(this._end).match();
    switch (match.type) {
      case OptionType.Some:
        return [u64_saturating_add(match.value, 1), u64_checked_add(match.value, 1)];
      case OptionType.None:
        return [U64_MAX, None()];
    }
  }

  public nth(n: number): Option<A> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }

    let add_match = this._start.add_usize(n).match();
    switch (add_match.type) {
      case OptionType.Some:
        let plus_n = add_match.value;
        let cmp_match = partial_cmp(plus_n, this._end).match();
        switch (cmp_match.type) {
          case OptionType.Some: {
            let ord = cmp_match.value;
            if (ord.eq(Less)) {
              this._is_empty.replace(false);
              this._start = plus_n.add_one();
              return Some(plus_n);
            } else if (ord.eq(Equal)) {
              this._is_empty.replace(true);
              return Some(plus_n);
            }
          }
        }
      case OptionType.None:
        this._is_empty.replace(true);
        return None();
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    this.compute_is_empty();

    if (this.is_empty()) {
      return r.from_okay(init);
    }

    let acc = init;

    while (this._start.lt(this._end)) {
      let n = this._start;
      this._start = this._start.add_one();
      let try_acc = f(acc, n);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    this._is_empty.replace(true);

    if (this._start.eq(this._end)) {
      let try_acc = f(acc, this._start);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    return r.from_okay(acc);
  }

  public contains(item: A): boolean {
    return item.ge(this._start) && item.le(this._end);
  }

  public is_empty(): boolean {
    return this._is_empty.unwrap_or_else(() => !this._start.le(this._end));
  }

  private compute_is_empty() {
    if (this._is_empty.is_none()) {
      this._is_empty = Some(!this._start.le(this._end));
    }
  }

  public into_inner(): [A, A] {
    return [this._start, this._end];
  }

  public last(): Option<A> {
    return this.next_back();
  }

  public min(): Option<A> {
    return this.next();
  }

  public max(): Option<A> {
    return this.next_back();
  }

  public next_back(): Option<A> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }
    let is_iterating = this._start.lt(this._end);
    this._is_empty = Some(!is_iterating);
    let n = this._end;
    if (is_iterating) {
      this._end = this._end.sub_one();
    }
    return Some(n);
  }

  public nth_back(n: number): Option<A> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }

    let minus_match = this._end.sub_usize(n).match();
    switch (minus_match.type) {
      case OptionType.Some: {
        let minus_n = minus_match.value;
        let cmp_match = partial_cmp(minus_n, this._start).match();
        switch (cmp_match.type) {
          case OptionType.Some: {
            let ord = cmp_match.value;
            if (ord.eq(Greater)) {
              this._is_empty.replace(false);
              this._end = minus_n.sub_one();
              return Some(minus_n);
            } else if (ord.eq(Equal)) {
              this._is_empty.replace(true);
              return Some(minus_n);
            }
          }
        }
      }
      default:
        break;
    }
    this._is_empty.replace(true);
    return None();
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    this.compute_is_empty();

    if (this.is_empty()) {
      return r.from_okay(init);
    }

    let acc = init;

    while (this._start.lt(this._end)) {
      let n = this._end;
      this._end = this._end.sub_one();
      let try_acc = f(acc, n);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    this._is_empty.replace(true);

    if (this._start.eq(this._end)) {
      let try_acc = f(acc, this._start);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    return r.from_okay(acc);
  }
  // PartialEq
  public eq(other: this["Self"]): boolean {
    return (
      this._start.eq(other._start) &&
      this._end.eq(other._end) &&
      this.is_empty() === other.is_empty()
    );
  }

  // Clone
  public clone(): this["Self"] {
    return new RangeInclusive(this._start, this._end);
  }

  // Debug
  public fmt_debug(): string {
    return format("{:?}..={:?}", this.start, this.end);
  }
}

// export class RangeToInclusive {
//   public end: number
//
//   constructor(end: number) {
//     this.end = end
//   }
//
//   public clone(): RangeTo {
//     return new RangeToInclusive(this.end)
//   }
//
//   public contains(item: number): boolean {
//     return item <= this.end
//   }
// }

export function range<A extends Step>(start: A, end: A): Range<A> {
  return new Range(start, end);
}

export function range_inclusive<A extends Step>(start: A, end: A): RangeInclusive<A> {
  return new RangeInclusive(start, end);
}

export function range_from<A extends Step>(start: A): RangeFrom<A> {
  return new RangeFrom(start);
}
