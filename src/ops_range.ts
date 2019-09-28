import {
  Debug,
  format,
  IteratorBase,
  ImplExactSizeIterator,
  ImplDoubleEndedIterator,
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
  ImplClone,
  u64,
  u64_saturating_add,
  u64_checked_add,
  i64_checked_add,
  i64_checked_sub,
  U64_MAX,
  swap
} from "./internal";

export class Range
  extends ImplDoubleEndedIterator(ImplExactSizeIterator(ImplPartialEq(ImplClone(IteratorBase))))
  implements Debug {
  public Self!: Range;

  public Item!: number;

  public start: number;
  public end: number;

  constructor(start: number, end: number) {
    super();
    this.start = start;
    this.end = end;
  }

  public next(): Option<number> {
    if (this.start < this.end) {
      let n = add_u64(this.start, 1).match();
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
    let match = steps_between(this.start, this.end).match();
    switch (match.type) {
      case OptionType.Some:
        return [match.value, Some(match.value)];
      case OptionType.None:
        return [U64_MAX, None()];
    }
  }

  public nth(n: number): Option<number> {
    let plus_n = add_u64(this.start, n).match();
    switch (plus_n.type) {
      case OptionType.Some:
        if (plus_n.value < this.end) {
          this.start = plus_n.value + 1;
          return Some(plus_n.value);
        }
      case OptionType.None:
        this.start = this.end;
        return None();
    }
  }

  public last(): Option<number> {
    return this.next_back();
  }

  public min(): Option<number> {
    return this.next();
  }

  public max(): Option<number> {
    return this.next_back();
  }

  public next_back(): Option<number> {
    if (this.start < this.end) {
      this.end = this.end - 1;
      return Some(this.end);
    } else {
      return None();
    }
  }

  public nth_back(n: number): Option<number> {
    let minus_n = sub_u64(this.end, n).match();
    switch (minus_n.type) {
      case OptionType.Some:
        if (minus_n.value > this.start) {
          this.end = minus_n.value - 1;
          return Some(this.end);
        }
      case OptionType.None:
        this.end = this.start;
        return None();
    }
  }

  public fmt_debug(): string {
    return format("{:?}..{:?}", this.start, this.end);
  }

  public clone(): Range {
    return new Range(this.start, this.end);
  }

  public contains(item: number): boolean {
    return item >= this.start && item < this.end;
  }

  public is_empty(): boolean {
    return !(this.start < this.end);
  }

  public eq(other: Range): boolean {
    return this.start === other.start && this.end === other.end;
  }
}

export class RangeFrom extends ImplPartialEq(ImplClone(IteratorBase)) implements Debug {
  public Self!: RangeFrom;

  public Item!: number;

  public start: number;

  constructor(start: number) {
    super();
    this.start = start;
  }

  public next(): Option<number> {
    let n = this.start;
    this.start += 1;
    return Some(n);
  }

  public size_hint(): [number, Option<number>] {
    return [U64_MAX, None()];
  }

  public nth(n: number): Option<number> {
    let plus_n = add_u64(this.start, n).expect("overflow in RangeFrom.nth");
    this.start = plus_n + 1;
    return Some(plus_n);
  }

  public fmt_debug(): string {
    return format("{:?}..", this.start);
  }

  public clone(): RangeFrom {
    return new RangeFrom(this.start);
  }

  public contains(item: number): boolean {
    return item >= this.start;
  }

  public eq(other: RangeFrom): boolean {
    return this.start === other.start;
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

export class RangeInclusive
  extends ImplDoubleEndedIterator(ImplExactSizeIterator(ImplPartialEq(ImplClone(IteratorBase))))
  implements Debug {
  public Self!: RangeInclusive;

  public Item!: number;

  private _start: number;
  private _end: number;
  private _is_empty: Option<boolean>;

  constructor(start: number, end: number) {
    super();
    this._start = start;
    this._end = end;
    this._is_empty = None();
  }

  public start(): number {
    return this._start;
  }

  public end(): number {
    return this._end;
  }

  public next(): Option<number> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }
    let is_iterating = this._start < this._end;
    this._is_empty = Some(!is_iterating);
    if (is_iterating) {
      let n = this._start;
      this._start += 1;
      return Some(n);
    } else {
      return Some(this._start);
    }
  }

  public size_hint(): [number, Option<number>] {
    if (this.is_empty()) {
      return [0, Some(0)];
    }

    let match = steps_between(this._start, this._end).match();
    switch (match.type) {
      case OptionType.Some:
        return [u64_saturating_add(match.value, 1), u64_checked_add(match.value, 1)];
      case OptionType.None:
        return [U64_MAX, None()];
    }
  }

  public nth(n: number): Option<number> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }

    let plus_n = add_u64(this._start, n).match();
    switch (plus_n.type) {
      case OptionType.Some:
        let value = plus_n.value;
        if (value < this._end) {
          this._is_empty = Some(false);
          this._start = value + 1;
          return Some(value);
        } else if (value === this._end) {
          this._is_empty = Some(true);
          return Some(value);
        }
      case OptionType.None:
        this._is_empty = Some(true);
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

    while (this._start < this._end) {
      let n = this._start;
      this._start += 1;
      let try_acc = f(acc, n);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    this._is_empty = Some(true);

    if (this._start === this._end) {
      let try_acc = f(acc, this._start);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    return r.from_okay(acc);
  }

  public clone(): RangeInclusive {
    return new RangeInclusive(this._start, this._end);
  }

  public contains(item: number): boolean {
    return item >= this._start && item <= this._end;
  }

  public is_empty(): boolean {
    return this._is_empty.unwrap_or_else(() => !(this._start <= this._end));
  }

  private compute_is_empty() {
    if (this._is_empty.is_none()) {
      this._is_empty = Some(!(this._start <= this._end));
    }
  }

  public into_inner(): [number, number] {
    return [this._start, this._end];
  }

  public last(): Option<number> {
    return this.next_back();
  }

  public min(): Option<number> {
    return this.next();
  }

  public max(): Option<number> {
    return this.next_back();
  }

  public next_back(): Option<number> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }
    let is_iterating = this._start < this._end;
    this._is_empty = Some(!is_iterating);
    let n = this._end;
    if (is_iterating) {
      this._end -= 1;
    }
    return Some(n);
  }

  public nth_back(n: number): Option<number> {
    this.compute_is_empty();
    if (this._is_empty.unwrap_or(false)) {
      return None();
    }

    let minus_n = sub_u64(this._end, n).match();
    switch (minus_n.type) {
      case OptionType.Some:
        let value = minus_n.value;
        if (value > this._start) {
          this._is_empty = Some(false);
          this._end = value - 1;
          return Some(value);
        } else if (value === this._start) {
          this._is_empty = Some(true);
          return Some(value);
        }
      default:
        break;
    }
    this._is_empty = Some(true);
    return None();
  }

  // Debug
  public fmt_debug(): string {
    return format("{:?}..={:?}", this.start, this.end);
  }

  // PartialEq
  public eq(other: RangeInclusive): boolean {
    return (
      this._start === other._start &&
      this._end === other._end &&
      this.is_empty() === other.is_empty()
    );
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

export function range(start: number, end: number): Range {
  return new Range(start, end);
}

export function range_inclusive(start: number, end: number): RangeInclusive {
  return new RangeInclusive(start, end);
}

export function range_from(start: number): RangeFrom {
  return new RangeFrom(start);
}

function steps_between(start: number, end: number): Option<number> {
  if (start < end) {
    if (end - start < 0) {
      return None();
    }
    return Some(end - start);
  } else {
    return Some(0);
  }
}

function add_u64(left: number, right: number): Option<number> {
  // `right` is meant to be a u64
  right = u64(right);
  return i64_checked_add(left, right);
}

function sub_u64(left: number, right: number): Option<number> {
  // `right` is meant to be a u64
  right = u64(right);
  return i64_checked_sub(left, right);
}
