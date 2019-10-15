import {
  // mixin.ts
  AnyConstructor,
  Mixin,
  // ops/try.ts
  Try,
  TryConstructor,
  // iter.ts
  IteratorBase,
  IteratorCommon,
  from_fn,
  ExactSizeIterator,
  DoubleEndedIterator,
  DoubleEndedIteratorCommon,
  ExactSizeAndDoubleEndedIterator,
  // FusedIterator,
  LoopState,
  LoopStateType,
  Continue,
  Break,
  Extend,
  // clone.ts
  Clone,
  clone,
  // default.ts
  DefaultConstructor,
  // fmt.ts
  Debug,
  format,
  // option.ts
  Option,
  OptionType,
  Some,
  None,
  // result.ts
  Result,
  ResultType,
  Ok,
  Err,
  // cmp.ts
  Ordering,
  cmp,
  // macros.ts
  assert,
  // intrinsics.ts
  u64,
  u64_saturating_add,
  u64_saturating_sub,
  u64_saturating_mul,
  minnum,
  // checked.ts
  u64_checked_add,
  u64_checked_mul,
  U64_MAX
} from "./internal";

export class Rev<I extends DoubleEndedIterator> extends DoubleEndedIterator
  implements Clone, Debug {
  public Self!: Rev<I>;

  public iter: I;

  constructor(iter: I) {
    super();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.next_back();
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public nth(n: number): Option<this["Item"]> {
    return this.iter.nth_back(n);
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, f);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, f);
  }

  public find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    return this.iter.rfind(predicate);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next();
  }

  public nth_back(n: number): Option<this["Item"]> {
    return this.iter.nth(n);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, f);
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, f);
  }

  public rfind(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    return this.iter.find(predicate);
  }

  // Clone
  public clone(): this["Self"] {
    return new Rev(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Rev({:?})", this.iter);
  }
}

class RevExactSizeIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: RevExactSizeIterator<I>;

  public iter: I;

  constructor(iter: I) {
    super();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.next_back();
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public nth(n: number): Option<this["Item"]> {
    return this.iter.nth_back(n);
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, f);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, f);
  }

  public find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    return this.iter.rfind(predicate);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next();
  }

  public nth_back(n: number): Option<this["Item"]> {
    return this.iter.nth(n);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, f);
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, f);
  }

  public rfind(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    return this.iter.find(predicate);
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new RevExactSizeIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Rev({:?})", this.iter);
  }
}

function clone_try_fold<T, Acc, R extends Try>(
  r: TryConstructor<R>,
  f: (acc: Acc, elt: T) => R
): (acc: Acc, elt: T) => R {
  return (acc: Acc, elt: T) => f(acc, clone(elt));
}

export class Cloned<I extends IteratorBase> extends IteratorBase implements Clone, Debug {
  public Self!: Cloned<I>;

  public iter: I;

  constructor(iter: I) {
    super();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.next().cloned();
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, clone_try_fold<this["Item"], Acc, R>(r, f));
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.map(clone).fold(init, f);
  }

  // Clone
  public clone(): this["Self"] {
    return new Cloned(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Cloned({:?})", this.iter);
  }
}

export class ClonedExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: ClonedExactSizeIterator<I>;

  public iter: I;

  constructor(iter: I) {
    super();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.next().cloned();
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, clone_try_fold<this["Item"], Acc, R>(r, f));
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.map(clone).fold(init, f);
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new ClonedExactSizeIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Cloned({:?})", this.iter);
  }
}

export class ClonedDoubleEndedIterator<I extends DoubleEndedIterator> extends DoubleEndedIterator
  implements Clone, Debug {
  public Self!: ClonedDoubleEndedIterator<I>;

  public iter: I;

  constructor(iter: I) {
    super();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.next().cloned();
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, clone_try_fold<this["Item"], Acc, R>(r, f));
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.map(clone).fold(init, f);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().cloned();
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, clone_try_fold<this["Item"], Acc, R>(r, f));
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.map(clone).rfold(init, f);
  }

  // Clone
  public clone(): this["Self"] {
    return new ClonedDoubleEndedIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Cloned({:?})", this.iter);
  }
}

export class ClonedExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: ClonedExactSizeAndDoubleEndedIterator<I>;

  public iter: I;

  constructor(iter: I) {
    super();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.next().cloned();
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, clone_try_fold<this["Item"], Acc, R>(r, f));
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.map(clone).fold(init, f);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().cloned();
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, clone_try_fold<this["Item"], Acc, R>(r, f));
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.map(clone).rfold(init, f);
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new ClonedExactSizeAndDoubleEndedIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Cloned({:?})", this.iter);
  }
}

export class Cycle<I extends IteratorCommon & Clone> extends IteratorBase implements Clone, Debug {
  public Self!: Cycle<I>;

  public orig: I;
  public iter: I;

  constructor(iter: I) {
    super();
    this.orig = iter.clone();
    this.iter = iter;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let next = this.iter.next();
    let match = next.match();
    switch (match.type) {
      case OptionType.None:
        this.iter = this.orig.clone();
        return this.iter.next();
      default:
        return next;
    }
  }

  public size_hint(): [number, Option<number>] {
    // the cycle iterator is either empty or infinite
    let [lower, upper] = this.orig.size_hint();
    if (lower === 0) {
      upper = upper.and_then(
        (x: number): Option<number> => {
          if (x === 0) {
            return Some(0);
          }
          return None();
        }
      );
      return [lower, upper];
    } else {
      return [U64_MAX, None()];
    }
  }

  public try_fold<Acc, R extends Try>(
    acc: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    // fully iterate the current iterator. this is necessary because
    // `self.iter` may be epty even when `self.orig` isn't
    let try_acc = this.iter.try_fold(acc, r, f);
    if (try_acc.is_error()) {
      return try_acc;
    }
    acc = try_acc.unwrap();
    this.iter = this.orig.clone();

    // complete the full cycle, keeping track of whether the cycled
    // iterator is empty or not. we need to return early in case
    // of an empty iterator to prevent an infinite loop
    let is_empty = true;
    try_acc = this.iter.try_fold(acc, r, (acc: Acc, x: this["Item"]) => {
      is_empty = false;
      return f(acc, x);
    });
    if (try_acc.is_error()) {
      return try_acc;
    }
    acc = try_acc.unwrap();

    if (is_empty) {
      return r.from_okay(acc);
    }

    do {
      this.iter = this.orig.clone();
      try_acc = this.iter.try_fold(acc, r, f);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    } while (true);
  }

  // Clone
  public clone(): this["Self"] {
    return new Cycle(this.orig.clone());
  }

  // Debug
  public fmt_debug(): string {
    return format("Cycle({:?})", this.iter);
  }
}

export class StepBy<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: StepBy<I>;

  public iter: I;
  public step: number;
  public first_take: boolean;

  constructor(iter: I, step: number) {
    super();
    assert(step > 0);
    this.iter = iter;
    this.step = u64(step) - 1;
    this.first_take = true;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.first_take) {
      this.first_take = false;
      return this.iter.next();
    } else {
      return this.iter.nth(this.step);
    }
  }

  public size_hint(): [number, Option<number>] {
    let inner_hint = this.iter.size_hint();

    let step = this.step;
    if (this.first_take) {
      let f = (n: number) => (n === 0 ? 0 : 1 + u64((n - 1) / (step + 1)));
      return [f(inner_hint[0]), inner_hint[1].map(f)];
    } else {
      let f = (n: number) => u64(n / (step + 1));
      return [f(inner_hint[0]), inner_hint[1].map(f)];
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.first_take) {
      this.first_take = false;
      let first = this.iter.next();
      if (n === 0) {
        return first;
      }
      n -= 1;
    }
    // n and this.step are indices, we need to add 1 to get the amount of elements.
    // When calling `.nth`, we need to subtract 1 again to convert back to an index
    // step + 1 can't overflow because `.step_by` sets `this.step` to `step - 1`
    let step = this.step + 1;
    // n + 1 could overflow
    // thus, if n is U64_MAX instead of adding one, we call .nth(step)
    if (n === U64_MAX) {
      this.iter.nth(step - 1);
    } else {
      n += 1;
    }

    // overflow handling
    do {
      let mul = u64_checked_mul(n, step);
      if (mul.is_some()) {
        return this.iter.nth(mul.unwrap() - 1);
      }
      let div_n = u64(U64_MAX / n);
      let div_step = u64(U64_MAX / step);
      let nth_n = div_n * n;
      let nth_step = div_step * step;
      let nth: number;
      if (nth_n > nth_step) {
        step -= div_n;
        nth = nth_n;
      } else {
        n -= div_step;
        nth = nth_step;
      }
      this.iter.nth(nth - 1);
    } while (true);
  }

  public try_fold<Acc, R extends Try>(
    acc: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    const nth = () => this.iter.nth(this.step);

    if (this.first_take) {
      this.first_take = false;
      let match = this.iter.next().match();
      switch (match.type) {
        case OptionType.None:
          return r.from_okay(acc);
        case OptionType.Some: {
          let try_acc = f(acc, match.value);
          if (try_acc.is_error()) {
            return try_acc;
          }
          acc = try_acc.unwrap();
        }
      }
    }
    return from_fn(nth).try_fold(acc, r, f);
  }

  // Clone
  public clone(): this["Self"] {
    // Need to add one to `this.step` because constructor sets `this.step` to
    // `step - 1`
    let step = this.step + 1;
    return new StepBy(clone(this.iter), step);
  }

  // Debug
  public fmt_debug(): string {
    // Need to add one to `this.step` because constructor sets `this.step` to
    // `step - 1`
    return format("StepBy({:?},{:?})", this.step + 1, this.iter);
  }
}

export class StepByExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: StepByExactSizeIterator<I>;

  public iter: I;
  public step: number;
  public first_take: boolean;

  constructor(iter: I, step: number) {
    super();
    assert(step > 0);
    this.iter = iter;
    this.step = u64(step) - 1;
    this.first_take = true;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.first_take) {
      this.first_take = false;
      return this.iter.next();
    } else {
      return this.iter.nth(this.step);
    }
  }

  public size_hint(): [number, Option<number>] {
    let inner_hint = this.iter.size_hint();

    let step = this.step;
    if (this.first_take) {
      let f = (n: number) => (n === 0 ? 0 : 1 + u64((n - 1) / (step + 1)));
      return [f(inner_hint[0]), inner_hint[1].map(f)];
    } else {
      let f = (n: number) => u64(n / (step + 1));
      return [f(inner_hint[0]), inner_hint[1].map(f)];
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.first_take) {
      this.first_take = false;
      let first = this.iter.next();
      if (n === 0) {
        return first;
      }
      n -= 1;
    }
    // n and this.step are indices, we need to add 1 to get the amount of elements.
    // When calling `.nth`, we need to subtract 1 again to convert back to an index
    // step + 1 can't overflow because `.step_by` sets `this.step` to `step - 1`
    let step = this.step + 1;
    // n + 1 could overflow
    // thus, if n is U64_MAX instead of adding one, we call .nth(step)
    if (n === U64_MAX) {
      this.iter.nth(step - 1);
    } else {
      n += 1;
    }

    // overflow handling
    do {
      let mul = u64_checked_mul(n, step);
      if (mul.is_some()) {
        return this.iter.nth(mul.unwrap() - 1);
      }
      let div_n = u64(U64_MAX / n);
      let div_step = u64(U64_MAX / step);
      let nth_n = div_n * n;
      let nth_step = div_step * step;
      let nth: number;
      if (nth_n > nth_step) {
        step -= div_n;
        nth = nth_n;
      } else {
        n -= div_step;
        nth = nth_step;
      }
      this.iter.nth(nth - 1);
    } while (true);
  }

  public try_fold<Acc, R extends Try>(
    acc: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    const nth = () => this.iter.nth(this.step);

    if (this.first_take) {
      this.first_take = false;
      let match = this.iter.next().match();
      switch (match.type) {
        case OptionType.None:
          return r.from_okay(acc);
        case OptionType.Some: {
          let try_acc = f(acc, match.value);
          if (try_acc.is_error()) {
            return try_acc;
          }
          acc = try_acc.unwrap();
        }
      }
    }
    return from_fn(nth).try_fold(acc, r, f);
  }

  // ExactSizeIterator
  //
  // The zero-based index starting from the end of the iterator of the
  // last element. Used in the `DoubleEndedIterator` implmentation
  public next_back_index(): number {
    let rem = this.iter.len() % (this.step + 1);
    if (this.first_take) {
      return rem === 0 ? this.step : rem - 1;
    } else {
      return rem;
    }
  }

  // Clone
  public clone(): this["Self"] {
    // Need to add one to `this.step` because constructor sets `this.step` to
    // `step - 1`
    let step = this.step + 1;
    return new StepByExactSizeIterator(clone(this.iter), step);
  }

  // Debug
  public fmt_debug(): string {
    // Need to add one to `this.step` because constructor sets `this.step` to
    // `step - 1`
    return format("StepBy({:?},{:?})", this.step + 1, this.iter);
  }
}

export class StepByExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: StepByExactSizeAndDoubleEndedIterator<I>;

  public iter: I;
  public step: number;
  public first_take: boolean;

  constructor(iter: I, step: number) {
    super();
    assert(step > 0);
    this.iter = iter;
    this.step = u64(step) - 1;
    this.first_take = true;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.first_take) {
      this.first_take = false;
      return this.iter.next();
    } else {
      return this.iter.nth(this.step);
    }
  }

  public size_hint(): [number, Option<number>] {
    let inner_hint = this.iter.size_hint();

    let step = this.step;
    if (this.first_take) {
      let f = (n: number) => (n === 0 ? 0 : 1 + u64((n - 1) / (step + 1)));
      return [f(inner_hint[0]), inner_hint[1].map(f)];
    } else {
      let f = (n: number) => u64(n / (step + 1));
      return [f(inner_hint[0]), inner_hint[1].map(f)];
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.first_take) {
      this.first_take = false;
      let first = this.iter.next();
      if (n === 0) {
        return first;
      }
      n -= 1;
    }
    // n and this.step are indices, we need to add 1 to get the amount of elements.
    // When calling `.nth`, we need to subtract 1 again to convert back to an index
    // step + 1 can't overflow because `.step_by` sets `this.step` to `step - 1`
    let step = this.step + 1;
    // n + 1 could overflow
    // thus, if n is U64_MAX instead of adding one, we call .nth(step)
    if (n === U64_MAX) {
      this.iter.nth(step - 1);
    } else {
      n += 1;
    }

    // overflow handling
    do {
      let mul = u64_checked_mul(n, step);
      if (mul.is_some()) {
        return this.iter.nth(mul.unwrap() - 1);
      }
      let div_n = u64(U64_MAX / n);
      let div_step = u64(U64_MAX / step);
      let nth_n = div_n * n;
      let nth_step = div_step * step;
      let nth: number;
      if (nth_n > nth_step) {
        step -= div_n;
        nth = nth_n;
      } else {
        n -= div_step;
        nth = nth_step;
      }
      this.iter.nth(nth - 1);
    } while (true);
  }

  public try_fold<Acc, R extends Try>(
    acc: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    const nth = () => this.iter.nth(this.step);

    if (this.first_take) {
      this.first_take = false;
      let match = this.iter.next().match();
      switch (match.type) {
        case OptionType.None:
          return r.from_okay(acc);
        case OptionType.Some: {
          let try_acc = f(acc, match.value);
          if (try_acc.is_error()) {
            return try_acc;
          }
          acc = try_acc.unwrap();
        }
      }
    }
    return from_fn(nth).try_fold(acc, r, f);
  }

  // ExactSizeIterator
  //
  // The zero-based index starting from the end of the iterator of the
  // last element. Used in the `DoubleEndedIterator` implmentation
  public next_back_index(): number {
    let rem = this.iter.len() % (this.step + 1);
    if (this.first_take) {
      return rem === 0 ? this.step : rem - 1;
    } else {
      return rem;
    }
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.nth_back(this.next_back_index());
  }

  public nth_back(n: number): Option<this["Item"]> {
    // `this.iter.nth_back(U64_MAX)` does the right thing here when `n`
    // is out of bounds because the length of `this.iter` does not exceed
    // `U64_MAX` (because `Iter extends ExactSizeIterator`) and `nth_back`
    // is zero-indexed
    n = u64_saturating_add(u64_saturating_mul(n, this.step + 1), this.next_back_index());
    return this.iter.nth_back(n);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    const nth_back = () => this.iter.nth_back(this.step);

    let match = this.next_back().match();
    switch (match.type) {
      case OptionType.None:
        return r.from_okay(init);
      case OptionType.Some: {
        let try_acc = f(init, match.value);
        if (try_acc.is_error()) {
          return try_acc;
        }
        let acc = try_acc.unwrap();
        return from_fn(nth_back).try_fold(acc, r, f);
      }
    }
  }

  // Clone
  public clone(): this["Self"] {
    // Need to add one to `this.step` because constructor sets `this.step` to
    // `step - 1`
    let step = this.step + 1;
    return new StepByExactSizeAndDoubleEndedIterator(clone(this.iter), step);
  }

  // Debug
  public fmt_debug(): string {
    // Need to add one to `this.step` because constructor sets `this.step` to
    // `step - 1`
    return format("StepBy({:?},{:?})", this.step + 1, this.iter);
  }
}

function map_fold<T, U, Acc>(f: (t: T) => U, g: (acc: Acc, u: U) => Acc): (acc: Acc, t: T) => Acc {
  return (acc: Acc, elt: T) => g(acc, f(elt));
}

function map_try_fold<T, B, Acc, R>(
  f: (t: T) => B,
  g: (acc: Acc, b: B) => R
): (acc: Acc, t: T) => R {
  return (acc: Acc, elt: T) => g(acc, f(elt));
}

export class Map<I extends IteratorCommon, B> extends IteratorBase<B> implements Clone, Debug {
  public Self!: Map<I, B>;

  public iter: I;
  public f: (x: I["Item"]) => B;

  constructor(iter: I, f: (x: I["Item"]) => B) {
    super();
    this.iter = iter;
    this.f = f;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    return this.iter.next().map(this.f);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    g: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, g));
  }

  public fold<Acc>(init: Acc, g: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, map_fold<I["Item"], this["Item"], Acc>(this.f, g));
  }

  // Clone
  public clone(): this["Self"] {
    return new Map(clone(this.iter), this.f);
  }

  public fmt_debug(): string {
    return format("Map({:?},{:?})", this.f, this.iter);
  }
}

export class MapExactSizeIterator<I extends ExactSizeIterator, B> extends ExactSizeIterator<B>
  implements Clone, Debug {
  public Self!: MapExactSizeIterator<I, B>;

  public iter: I;
  public f: (x: I["Item"]) => B;

  constructor(iter: I, f: (x: I["Item"]) => B) {
    super();
    this.iter = iter;
    this.f = f;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    return this.iter.next().map(this.f);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    g: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, g));
  }

  public fold<Acc>(init: Acc, g: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, map_fold<I["Item"], this["Item"], Acc>(this.f, g));
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new MapExactSizeIterator(clone(this.iter), this.f);
  }

  public fmt_debug(): string {
    return format("Map({:?},{:?})", this.f, this.iter);
  }
}

export class MapDoubleEndedIterator<I extends DoubleEndedIteratorCommon, B>
  extends DoubleEndedIterator<B>
  implements Clone, Debug {
  public Self!: MapDoubleEndedIterator<I, B>;

  public iter: I;
  public f: (x: I["Item"]) => B;

  constructor(iter: I, f: (x: I["Item"]) => B) {
    super();
    this.iter = iter;
    this.f = f;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    return this.iter.next().map(this.f);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    g: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, g));
  }

  public fold<Acc>(init: Acc, g: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, map_fold<I["Item"], this["Item"], Acc>(this.f, g));
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().map(this.f);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    g: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, g));
  }

  public rfold<Acc>(init: Acc, g: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, map_fold<I["Item"], this["Item"], Acc>(this.f, g));
  }

  // Clone
  public clone(): this["Self"] {
    return new MapDoubleEndedIterator(clone(this.iter), this.f);
  }

  public fmt_debug(): string {
    return format("Map({:?},{:?})", this.f, this.iter);
  }
}

export class MapExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator, B>
  extends ExactSizeAndDoubleEndedIterator<B>
  implements Clone, Debug {
  public Self!: MapExactSizeAndDoubleEndedIterator<I, B>;

  public iter: I;
  public f: (x: I["Item"]) => B;

  constructor(iter: I, f: (x: I["Item"]) => B) {
    super();
    this.iter = iter;
    this.f = f;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    return this.iter.next().map(this.f);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    g: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, g));
  }

  public fold<Acc>(init: Acc, g: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, map_fold<I["Item"], this["Item"], Acc>(this.f, g));
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().map(this.f);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    g: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, g));
  }

  public rfold<Acc>(init: Acc, g: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, map_fold<I["Item"], this["Item"], Acc>(this.f, g));
  }

  // Clone
  public clone(): this["Self"] {
    return new MapExactSizeAndDoubleEndedIterator(clone(this.iter), this.f);
  }

  public fmt_debug(): string {
    return format("Map({:?},{:?})", this.f, this.iter);
  }
}

function filter_fold<T, Acc>(
  predicate: (t: T) => boolean,
  fold: (acc: Acc, t: T) => Acc
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T) => (predicate(item) ? fold(acc, item) : acc);
}

function filter_try_fold<T, Acc, R extends Try>(
  predicate: (t: T) => boolean,
  r: TryConstructor<R>,
  fold: (acc: Acc, t: T) => R
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => (predicate(item) ? fold(acc, item) : r.from_okay(acc));
}

export class Filter<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: Filter<I>;

  public iter: I;
  public predicate: (item: I["Item"]) => boolean;

  constructor(iter: I, predicate: (item: I["Item"]) => boolean) {
    super();
    this.iter = iter;
    this.predicate = predicate;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.find(this.predicate);
  }

  public size_hint(): [number, Option<number>] {
    let [_, upper] = this.iter.size_hint();
    return [0, upper]; // can't know a lower bound, due to the predicate
  }

  // public count(): number {
  //   const to_number<T>(predicate: (t: T) => boolean): (t: T): number {
  //     return (t: T) => +predicate(x)
  //   }
  //   return this.iter.map(this.predicate)).sum()
  // }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(
      init,
      r,
      filter_try_fold<this["Item"], Acc, R>(this.predicate, r, fold)
    );
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, filter_fold<this["Item"], Acc>(this.predicate, fold));
  }

  // Clone
  public clone(): this["Self"] {
    return new Filter(clone(this.iter), this.predicate);
  }

  // Debug
  public fmt_debug(): string {
    return format("Filter({:?},{:?})", this.predicate, this.iter);
  }
}

export class FilterDoubleEndedIterator<I extends DoubleEndedIteratorCommon>
  extends DoubleEndedIterator
  implements Clone, Debug {
  public Self!: FilterDoubleEndedIterator<I>;

  public iter: I;
  public predicate: (item: I["Item"]) => boolean;

  constructor(iter: I, predicate: (item: I["Item"]) => boolean) {
    super();
    this.iter = iter;
    this.predicate = predicate;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    return this.iter.find(this.predicate);
  }

  public size_hint(): [number, Option<number>] {
    let [_, upper] = this.iter.size_hint();
    return [0, upper]; // can't know a lower bound, due to the predicate
  }

  // public count(): number {
  //   const to_number<T>(predicate: (t: T) => boolean): (t: T): number {
  //     return (t: T) => +predicate(x)
  //   }
  //   return this.iter.map(this.predicate)).sum()
  // }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(
      init,
      r,
      filter_try_fold<this["Item"], Acc, R>(this.predicate, r, fold)
    );
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, filter_fold<this["Item"], Acc>(this.predicate, fold));
  }

  // DoubleEndedIterator

  public next_back(): Option<this["Item"]> {
    return this.iter.rfind(this.predicate);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(
      init,
      r,
      filter_try_fold<this["Item"], Acc, R>(this.predicate, r, fold)
    );
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, filter_fold<this["Item"], Acc>(this.predicate, fold));
  }

  // Clone
  public clone(): this["Self"] {
    return new FilterDoubleEndedIterator(clone(this.iter), this.predicate);
  }

  // Debug
  public fmt_debug(): string {
    return format("Filter({:?},{:?})", this.predicate, this.iter);
  }
}

function filter_map_fold<T, B, Acc>(
  f: (t: T) => Option<B>,
  fold: (acc: Acc, b: B) => Acc
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T): Acc => {
    let match = f(item).match();
    switch (match.type) {
      case OptionType.Some:
        return fold(acc, match.value);
      case OptionType.None:
        return acc;
    }
  };
}

function filter_map_try_fold<T, B, Acc, R extends Try>(
  f: (t: T) => Option<B>,
  r: TryConstructor<R>,
  fold: (acc: Acc, b: B) => R
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => {
    let match = f(item).match();
    switch (match.type) {
      case OptionType.Some:
        return fold(acc, match.value);
      case OptionType.None:
        return r.from_okay(acc);
    }
  };
}

export class FilterMap<I extends IteratorCommon, B> extends IteratorBase<B>
  implements Clone, Debug {
  public Self!: FilterMap<I, B>;

  public iter: I;
  public f: (item: I["Item"]) => Option<B>;

  constructor(iter: I, f: (item: I["Item"]) => Option<B>) {
    super();
    this.iter = iter;
    this.f = f;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    return this.iter.find_map(this.f);
  }

  public size_hint(): [number, Option<number>] {
    let [_, upper] = this.iter.size_hint();
    return [0, upper]; // can't know a lower bound, due to the predicate
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(
      init,
      r,
      filter_map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, r, fold)
    );
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, filter_map_fold<I["Item"], this["Item"], Acc>(this.f, fold));
  }

  // Clone
  public clone(): this["Self"] {
    return new FilterMap(clone(this.iter), this.f);
  }

  // Debug
  public fmt_debug(): string {
    return format("FilterMap({:?},{:?})", this.f, this.iter);
  }
}

export class FilterMapDoubleEndedIterator<I extends DoubleEndedIteratorCommon, B>
  extends DoubleEndedIterator<B>
  implements Clone, Debug {
  public Self!: FilterMapDoubleEndedIterator<I, B>;

  public iter: I;
  public f: (item: I["Item"]) => Option<B>;

  constructor(iter: I, f: (item: I["Item"]) => Option<B>) {
    super();
    this.iter = iter;
    this.f = f;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    return this.iter.find_map(this.f);
  }

  public size_hint(): [number, Option<number>] {
    let [_, upper] = this.iter.size_hint();
    return [0, upper]; // can't know a lower bound, due to the predicate
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, x: this["Item"]) => R
  ): R {
    return this.iter.try_fold(
      init,
      r,
      filter_map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, r, fold)
    );
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, filter_map_fold<I["Item"], this["Item"], Acc>(this.f, fold));
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    const find = (_: undefined, t: I["Item"]): LoopState<undefined, B> => {
      let match = this.f(t).match();
      switch (match.type) {
        case OptionType.Some:
          return Break(match.value);
        case OptionType.None:
          return Continue(undefined);
      }
    };
    return this.iter
      .try_rfold<undefined, LoopState<undefined, B>>(undefined, LoopState, find)
      .break_value();
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(
      init,
      r,
      filter_map_try_fold<I["Item"], this["Item"], Acc, R>(this.f, r, fold)
    );
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, filter_map_fold<I["Item"], this["Item"], Acc>(this.f, fold));
  }

  // Clone
  public clone(): this["Self"] {
    return new FilterMapDoubleEndedIterator(clone(this.iter), this.f);
  }

  // Debug
  public fmt_debug(): string {
    return format("FilterMap({:?},{:?})", this.f, this.iter);
  }
}

export class Enumerate<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: Enumerate<I>;

  public iter: I;
  public _count: number;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this._count = 0;
  }

  // Iterator
  public Item!: [number, I["Item"]];

  public next(): Option<this["Item"]> {
    return this.iter.next().map((a: I["Item"]) => {
      let i = this._count;
      this._count += 1;
      return [i, a];
    });
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public nth(n: number): Option<this["Item"]> {
    return this.iter.nth(n).map((a: I["Item"]): [number, I["Item"]] => {
      let i = this._count + n;
      this._count = i + 1;
      return [i, a];
    });
  }

  public count(): number {
    return this.iter.count();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const enumerate = (acc: Acc, item: I["Item"]) => {
      let res = fold(acc, [this._count, item]);
      this._count += 1;
      return res;
    };

    return this.iter.try_fold(init, r, enumerate);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    const enumerate = (acc: Acc, item: I["Item"]) => {
      acc = fold(acc, [this._count, item]);
      this._count += 1;
      return acc;
    };

    return this.iter.fold(init, enumerate);
  }

  // Clone
  public clone(): this["Self"] {
    return new Enumerate(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Enumerate({:?},{:?})", this._count, this.iter);
  }
}

export class EnumerateExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: EnumerateExactSizeIterator<I>;

  public iter: I;
  public _count: number;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this._count = 0;
  }

  // Iterator
  public Item!: [number, I["Item"]];

  public next(): Option<this["Item"]> {
    return this.iter.next().map((a: I["Item"]) => {
      let i = this._count;
      this._count += 1;
      return [i, a];
    });
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public nth(n: number): Option<this["Item"]> {
    return this.iter.nth(n).map((a: I["Item"]): [number, I["Item"]] => {
      let i = this._count + n;
      this._count = i + 1;
      return [i, a];
    });
  }

  public count(): number {
    return this.iter.count();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const enumerate = (acc: Acc, item: I["Item"]) => {
      let res = fold(acc, [this._count, item]);
      this._count += 1;
      return res;
    };

    return this.iter.try_fold(init, r, enumerate);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    const enumerate = (acc: Acc, item: I["Item"]) => {
      acc = fold(acc, [this._count, item]);
      this._count += 1;
      return acc;
    };

    return this.iter.fold(init, enumerate);
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new EnumerateExactSizeIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Enumerate({:?},{:?})", this._count, this.iter);
  }
}

export class EnumerateExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: EnumerateExactSizeAndDoubleEndedIterator<I>;

  public iter: I;
  public _count: number;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this._count = 0;
  }

  // Iterator
  public Item!: [number, I["Item"]];

  public next(): Option<this["Item"]> {
    return this.iter.next().map((a: I["Item"]) => {
      let i = this._count;
      this._count += 1;
      return [i, a];
    });
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public nth(n: number): Option<this["Item"]> {
    return this.iter.nth(n).map((a: I["Item"]): [number, I["Item"]] => {
      let i = this._count + n;
      this._count = i + 1;
      return [i, a];
    });
  }

  public count(): number {
    return this.iter.count();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const enumerate = (acc: Acc, item: I["Item"]) => {
      let res = fold(acc, [this._count, item]);
      this._count += 1;
      return res;
    };

    return this.iter.try_fold(init, r, enumerate);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    const enumerate = (acc: Acc, item: I["Item"]) => {
      acc = fold(acc, [this._count, item]);
      this._count += 1;
      return acc;
    };

    return this.iter.fold(init, enumerate);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().map((a: I["Item"]) => {
      let len = this.iter.len();
      return [this._count + len, a];
    });
  }

  public nth_back(n: number): Option<this["Item"]> {
    return this.iter.nth_back(n).map((a: I["Item"]) => {
      let len = this.iter.len();
      return [this._count + len, a];
    });
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    let count = this._count + this.iter.len();
    const enumerate = (acc: Acc, item: this["Item"]) => {
      count -= 1;
      return fold(acc, [count, item]);
    };

    return this.iter.try_rfold(init, r, enumerate);
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let count = this._count + this.iter.len();
    const enumerate = (acc: Acc, item: this["Item"]) => {
      count -= 1;
      return fold(acc, [count, item]);
    };

    return this.iter.rfold(init, enumerate);
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new EnumerateExactSizeAndDoubleEndedIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Enumerate({:?},{:?})", this._count, this.iter);
  }
}

export class Peekable<I extends IteratorBase> extends IteratorBase implements Clone, Debug {
  public Self!: Peekable<I>;

  public iter: I;
  public peeked: Option<Option<I["Item"]>>;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this.peeked = None();
  }

  public peek(): Option<this["Item"]> {
    return this.peeked.get_or_insert_with(() => this.iter.next());
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some:
        return match.value;
      case OptionType.None:
        return this.iter.next();
    }
  }

  public count(): number {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return 0;
          case OptionType.Some:
            return 1 + this.iter.count();
        }
      }
      case OptionType.None:
        return this.iter.count();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return None();
          case OptionType.Some:
            return n === 0 ? match.value : this.iter.nth(n - 1);
        }
      }
      case OptionType.None:
        return this.iter.nth(n);
    }
  }

  public last(): Option<this["Item"]> {
    let peek_opt: Option<this["Item"]> = None();
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        if (match.value.is_none()) {
          return None();
        }
        peek_opt = match.value;
        break;
      }
    }
    return this.iter.last().or(peek_opt);
  }

  public size_hint(): [number, Option<number>] {
    let peek_len: number = 0;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return [0, Some(0)];
          case OptionType.Some:
            peek_len = 1;
        }
      }
    }
    let [lo, hi] = this.iter.size_hint();
    lo = u64_saturating_add(lo, peek_len);
    let match_hi = hi.match();
    switch (match_hi.type) {
      case OptionType.Some:
        hi = u64_checked_add(match_hi.value, peek_len);
        break;
      case OptionType.None:
        hi = None();
    }
    return [lo, hi];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc: Acc = init;
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return r.from_okay(init);
          case OptionType.Some: {
            let try_acc = f(init, inner_match.value);
            if (try_acc.is_error()) {
              return try_acc;
            }
            acc = try_acc.unwrap();
          }
        }
      }
    }
    return this.iter.try_fold(acc, r, f);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc: Acc = init;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return init;
          case OptionType.Some:
            acc = fold(init, inner_match.value);
        }
      }
    }

    return this.iter.fold(acc, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new Peekable(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Peekable({:?},{:?})", this.peeked, this.iter);
  }
}

export class PeekableExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: PeekableExactSizeIterator<I>;

  public iter: I;
  public peeked: Option<Option<I["Item"]>>;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this.peeked = None();
  }

  public peek(): Option<this["Item"]> {
    return this.peeked.get_or_insert_with(() => this.iter.next());
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some:
        return match.value;
      case OptionType.None:
        return this.iter.next();
    }
  }

  public count(): number {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return 0;
          case OptionType.Some:
            return 1 + this.iter.count();
        }
      }
      case OptionType.None:
        return this.iter.count();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return None();
          case OptionType.Some:
            return n === 0 ? match.value : this.iter.nth(n - 1);
        }
      }
      case OptionType.None:
        return this.iter.nth(n);
    }
  }

  public last(): Option<this["Item"]> {
    let peek_opt: Option<this["Item"]> = None();
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        if (match.value.is_none()) {
          return None();
        }
        peek_opt = match.value;
        break;
      }
    }
    return this.iter.last().or(peek_opt);
  }

  public size_hint(): [number, Option<number>] {
    let peek_len: number = 0;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return [0, Some(0)];
          case OptionType.Some:
            peek_len = 1;
        }
      }
    }
    let [lo, hi] = this.iter.size_hint();
    lo = u64_saturating_add(lo, peek_len);
    let match_hi = hi.match();
    switch (match_hi.type) {
      case OptionType.Some:
        hi = u64_checked_add(match_hi.value, peek_len);
        break;
      case OptionType.None:
        hi = None();
    }
    return [lo, hi];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc: Acc = init;
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return r.from_okay(init);
          case OptionType.Some: {
            let try_acc = f(init, inner_match.value);
            if (try_acc.is_error()) {
              return try_acc;
            }
            acc = try_acc.unwrap();
          }
        }
      }
    }
    return this.iter.try_fold(acc, r, f);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc: Acc = init;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return init;
          case OptionType.Some:
            acc = fold(init, inner_match.value);
        }
      }
    }

    return this.iter.fold(acc, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new PeekableExactSizeIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Peekable({:?},{:?})", this.peeked, this.iter);
  }
}

export class PeekableDoubleEndedIterator<I extends DoubleEndedIterator> extends DoubleEndedIterator
  implements Clone, Debug {
  public Self!: PeekableDoubleEndedIterator<I>;

  public iter: I;
  public peeked: Option<Option<I["Item"]>>;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this.peeked = None();
  }

  public peek(): Option<this["Item"]> {
    return this.peeked.get_or_insert_with(() => this.iter.next());
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some:
        return match.value;
      case OptionType.None:
        return this.iter.next();
    }
  }

  public count(): number {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return 0;
          case OptionType.Some:
            return 1 + this.iter.count();
        }
      }
      case OptionType.None:
        return this.iter.count();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return None();
          case OptionType.Some:
            return n === 0 ? match.value : this.iter.nth(n - 1);
        }
      }
      case OptionType.None:
        return this.iter.nth(n);
    }
  }

  public last(): Option<this["Item"]> {
    let peek_opt: Option<this["Item"]> = None();
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        if (match.value.is_none()) {
          return None();
        }
        peek_opt = match.value;
        break;
      }
    }
    return this.iter.last().or(peek_opt);
  }

  public size_hint(): [number, Option<number>] {
    let peek_len: number = 0;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return [0, Some(0)];
          case OptionType.Some:
            peek_len = 1;
        }
      }
    }
    let [lo, hi] = this.iter.size_hint();
    lo = u64_saturating_add(lo, peek_len);
    let match_hi = hi.match();
    switch (match_hi.type) {
      case OptionType.Some:
        hi = u64_checked_add(match_hi.value, peek_len);
        break;
      case OptionType.None:
        hi = None();
    }
    return [lo, hi];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc: Acc = init;
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return r.from_okay(init);
          case OptionType.Some: {
            let try_acc = f(init, inner_match.value);
            if (try_acc.is_error()) {
              return try_acc;
            }
            acc = try_acc.unwrap();
          }
        }
      }
    }
    return this.iter.try_fold(acc, r, f);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc: Acc = init;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return init;
          case OptionType.Some:
            acc = fold(init, inner_match.value);
        }
      }
    }

    return this.iter.fold(acc, fold);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().or_else(() => this.peeked.take().and_then(x => x));
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return r.from_okay(init);
          case OptionType.Some: {
            let res_match = this.iter
              .try_rfold(init, r, f)
              .into_result()
              .match();
            switch (res_match.type) {
              case ResultType.Ok:
                return f(res_match.value, inner_match.value);
              case ResultType.Err: {
                this.peeked = Some(Some(inner_match.value));
                return r.from_error(res_match.value);
              }
            }
          }
        }
      }
    }
    return this.iter.try_rfold(init, r, f);
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return init;
          case OptionType.Some: {
            let acc = this.iter.rfold(init, fold);
            return fold(acc, inner_match.value);
          }
        }
      }
    }
    return this.iter.rfold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new PeekableDoubleEndedIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Peekable({:?},{:?})", this.peeked, this.iter);
  }
}

export class PeekableExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: PeekableExactSizeAndDoubleEndedIterator<I>;

  public iter: I;
  public peeked: Option<Option<I["Item"]>>;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this.peeked = None();
  }

  public peek(): Option<this["Item"]> {
    return this.peeked.get_or_insert_with(() => this.iter.next());
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some:
        return match.value;
      case OptionType.None:
        return this.iter.next();
    }
  }

  public count(): number {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return 0;
          case OptionType.Some:
            return 1 + this.iter.count();
        }
      }
      case OptionType.None:
        return this.iter.count();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return None();
          case OptionType.Some:
            return n === 0 ? match.value : this.iter.nth(n - 1);
        }
      }
      case OptionType.None:
        return this.iter.nth(n);
    }
  }

  public last(): Option<this["Item"]> {
    let peek_opt: Option<this["Item"]> = None();
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        if (match.value.is_none()) {
          return None();
        }
        peek_opt = match.value;
        break;
      }
    }
    return this.iter.last().or(peek_opt);
  }

  public size_hint(): [number, Option<number>] {
    let peek_len: number = 0;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return [0, Some(0)];
          case OptionType.Some:
            peek_len = 1;
        }
      }
    }
    let [lo, hi] = this.iter.size_hint();
    lo = u64_saturating_add(lo, peek_len);
    let match_hi = hi.match();
    switch (match_hi.type) {
      case OptionType.Some:
        hi = u64_checked_add(match_hi.value, peek_len);
        break;
      case OptionType.None:
        hi = None();
    }
    return [lo, hi];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc: Acc = init;
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return r.from_okay(init);
          case OptionType.Some: {
            let try_acc = f(init, inner_match.value);
            if (try_acc.is_error()) {
              return try_acc;
            }
            acc = try_acc.unwrap();
          }
        }
      }
    }
    return this.iter.try_fold(acc, r, f);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc: Acc = init;
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return init;
          case OptionType.Some:
            acc = fold(init, inner_match.value);
        }
      }
    }

    return this.iter.fold(acc, fold);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    return this.iter.next_back().or_else(() => this.peeked.take().and_then(x => x));
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let match = this.peeked.take().match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return r.from_okay(init);
          case OptionType.Some: {
            let res_match = this.iter
              .try_rfold(init, r, f)
              .into_result()
              .match();
            switch (res_match.type) {
              case ResultType.Ok:
                return f(res_match.value, inner_match.value);
              case ResultType.Err: {
                this.peeked = Some(Some(inner_match.value));
                return r.from_error(res_match.value);
              }
            }
          }
        }
      }
    }
    return this.iter.try_rfold(init, r, f);
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let match = this.peeked.match();
    switch (match.type) {
      case OptionType.Some: {
        let inner_match = match.value.match();
        switch (inner_match.type) {
          case OptionType.None:
            return init;
          case OptionType.Some: {
            let acc = this.iter.rfold(init, fold);
            return fold(acc, inner_match.value);
          }
        }
      }
    }
    return this.iter.rfold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new PeekableExactSizeAndDoubleEndedIterator(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("Peekable({:?},{:?})", this.peeked, this.iter);
  }
}

/**
 * An iterator that rejects elements while `predicate` returns `true`.
 */
export class SkipWhile<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: SkipWhile<I>;

  public iter: I;
  public flag: boolean;
  public predicate: (item: I["Item"]) => boolean;

  constructor(iter: I, predicate: (item: I["Item"]) => boolean) {
    super();
    this.iter = iter;
    this.flag = false;
    this.predicate = predicate;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    const check = (pred: (t: this["Item"]) => boolean): ((t: this["Item"]) => boolean) => {
      return (x: this["Item"]) => {
        if (this.flag || !pred(x)) {
          this.flag = true;
          return true;
        } else {
          return false;
        }
      };
    };
    return this.iter.find(check(this.predicate));
  }

  public size_hint(): [number, Option<number>] {
    let [_, upper] = this.iter.size_hint();
    return [0, upper]; // can't know a lower bound, due to the predicate
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, x: this["Item"]) => R
  ): R {
    let acc = init;
    if (!this.flag) {
      let match = this.next().match();
      switch (match.type) {
        case OptionType.Some: {
          let try_acc = fold(init, match.value);
          if (try_acc.is_error()) {
            return r.from_okay(init);
          }
          acc = try_acc.unwrap();
          break;
        }
        case OptionType.None:
          return r.from_okay(init);
      }
    }
    return this.iter.try_fold(acc, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
    if (!this.flag) {
      let match = this.next().match();
      switch (match.type) {
        case OptionType.Some: {
          init = fold(init, match.value);
          break;
        }
        case OptionType.None:
          return init;
      }
    }
    return this.iter.fold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new SkipWhile(clone(this.iter), this.predicate);
  }

  // Debug
  public fmt_debug(): string {
    return format("SkipWhile({:?},{:?})", this.predicate, this.iter);
  }
}

/**
 * An iterator that only accepts elements while `predicate` returns `true`.
 */
export class TakeWhile<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: TakeWhile<I>;

  public iter: I;
  public flag: boolean;
  public predicate: (item: I["Item"]) => boolean;

  constructor(iter: I, predicate: (item: I["Item"]) => boolean) {
    super();
    this.iter = iter;
    this.flag = false;
    this.predicate = predicate;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.flag) {
      return None();
    } else {
      return this.iter.next().and_then(x => {
        if (this.predicate(x)) {
          return Some(x);
        } else {
          this.flag = true;
          return None();
        }
      });
    }
  }

  public size_hint(): [number, Option<number>] {
    if (this.flag) {
      return [0, Some(0)];
    } else {
      let [_, upper] = this.iter.size_hint();
      return [0, upper]; // can't know a lower bound, due to the predicate
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const check = (acc: Acc, t: this["Item"]): LoopState<Acc, R> => {
      if (this.predicate(t)) {
        return LoopState.from_try(fold(acc, t));
      } else {
        this.flag = true;
        return Break(r.from_okay(acc));
      }
    };

    if (this.flag) {
      return r.from_okay(init);
    } else {
      return this.iter.try_fold<Acc, LoopState<Acc, R>>(init, LoopState, check).into_try(r);
    }
  }

  // Clone
  public clone(): this["Self"] {
    return new TakeWhile(clone(this.iter), this.predicate);
  }

  // Debug
  public fmt_debug(): string {
    return format("TakeWhile({:?},{:?})", this.predicate, this.iter);
  }
}

/**
 * An iterator that skips over `n` elements of `iter`.
 */
export class Skip<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: Skip<I>;

  public iter: I;
  public n: number;

  constructor(iter: I, n: number) {
    super();
    this.iter = iter;
    this.n = u64(n);
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.next();
    } else {
      let old_n = this.n;
      this.n = 0;
      return this.iter.nth(old_n);
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.nth(n);
    } else {
      let to_skip = this.n;
      this.n = 0;
      // nth(n) skips n+1
      if (this.iter.nth(to_skip - 1).is_none()) {
        return None();
      }
      return this.iter.nth(n);
    }
  }

  public count(): number {
    return u64_saturating_sub(this.iter.count(), this.n);
  }

  public last(): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.last();
    } else {
      let next = this.next();
      if (next.is_some()) {
        // recurse. n should be 0.
        return this.last().or(next);
      } else {
        return None();
      }
    }
  }

  public size_hint(): [number, Option<number>] {
    let [lower, upper] = this.iter.size_hint();

    lower = u64_saturating_sub(lower, this.n);
    let upper_match = upper.match();
    switch (upper_match.type) {
      case OptionType.Some:
        upper = Some(u64_saturating_sub(upper_match.value, this.n));
        break;
      case OptionType.None:
        upper = None();
        break;
    }

    return [lower, upper];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    let n = this.n;
    this.n = 0;
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).is_none()) {
        return r.from_okay(init);
      }
    }
    return this.iter.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let n = this.n;
    this.n = 0;
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).is_none()) {
        return init;
      }
    }
    return this.iter.fold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new Skip(clone(this.iter), this.n);
  }

  // Debug
  public fmt_debug(): string {
    return format("Skip({:?},{:?})", this.n, this.iter);
  }
}

export class SkipExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: SkipExactSizeIterator<I>;

  public iter: I;
  public n: number;

  constructor(iter: I, n: number) {
    super();
    this.iter = iter;
    this.n = u64(n);
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.next();
    } else {
      let old_n = this.n;
      this.n = 0;
      return this.iter.nth(old_n);
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.nth(n);
    } else {
      let to_skip = this.n;
      this.n = 0;
      // nth(n) skips n+1
      if (this.iter.nth(to_skip - 1).is_none()) {
        return None();
      }
      return this.iter.nth(n);
    }
  }

  public count(): number {
    return u64_saturating_sub(this.iter.count(), this.n);
  }

  public last(): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.last();
    } else {
      let next = this.next();
      if (next.is_some()) {
        // recurse. n should be 0.
        return this.last().or(next);
      } else {
        return None();
      }
    }
  }

  public size_hint(): [number, Option<number>] {
    let [lower, upper] = this.iter.size_hint();

    lower = u64_saturating_sub(lower, this.n);
    let upper_match = upper.match();
    switch (upper_match.type) {
      case OptionType.Some:
        upper = Some(u64_saturating_sub(upper_match.value, this.n));
        break;
      case OptionType.None:
        upper = None();
        break;
    }

    return [lower, upper];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    let n = this.n;
    this.n = 0;
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).is_none()) {
        return r.from_okay(init);
      }
    }
    return this.iter.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let n = this.n;
    this.n = 0;
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).is_none()) {
        return init;
      }
    }
    return this.iter.fold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new SkipExactSizeIterator(clone(this.iter), this.n);
  }

  // Debug
  public fmt_debug(): string {
    return format("Skip({:?},{:?})", this.n, this.iter);
  }
}

export class SkipExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: SkipExactSizeAndDoubleEndedIterator<I>;

  public iter: I;
  public n: number;

  constructor(iter: I, n: number) {
    super();
    this.iter = iter;
    this.n = u64(n);
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.next();
    } else {
      let old_n = this.n;
      this.n = 0;
      return this.iter.nth(old_n);
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.nth(n);
    } else {
      let to_skip = this.n;
      this.n = 0;
      // nth(n) skips n+1
      if (this.iter.nth(to_skip - 1).is_none()) {
        return None();
      }
      return this.iter.nth(n);
    }
  }

  public count(): number {
    return u64_saturating_sub(this.iter.count(), this.n);
  }

  public last(): Option<this["Item"]> {
    if (this.n === 0) {
      return this.iter.last();
    } else {
      let next = this.next();
      if (next.is_some()) {
        // recurse. n should be 0.
        return this.last().or(next);
      } else {
        return None();
      }
    }
  }

  public size_hint(): [number, Option<number>] {
    let [lower, upper] = this.iter.size_hint();

    lower = u64_saturating_sub(lower, this.n);
    let upper_match = upper.match();
    switch (upper_match.type) {
      case OptionType.Some:
        upper = Some(u64_saturating_sub(upper_match.value, this.n));
        break;
      case OptionType.None:
        upper = None();
        break;
    }

    return [lower, upper];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    let n = this.n;
    this.n = 0;
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).is_none()) {
        return r.from_okay(init);
      }
    }
    return this.iter.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let n = this.n;
    this.n = 0;
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).is_none()) {
        return init;
      }
    }
    return this.iter.fold(init, fold);
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    if (this.len() > 0) {
      return this.iter.next_back();
    } else {
      return None();
    }
  }

  public nth_back(n: number): Option<this["Item"]> {
    let len = this.len();
    if (n < len) {
      return this.iter.nth_back(n);
    } else {
      if (len > 0) {
        // consume the original iterator
        this.iter.nth_back(len - 1);
      }
      return None();
    }
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    let n = this.len();
    const check = (acc: Acc, t: this["Item"]): LoopState<Acc, R> => {
      n -= 1;
      let res = fold(acc, t);
      if (n === 0) {
        return Break(res);
      } else {
        return LoopState.from_try(res);
      }
    };

    if (n === 0) {
      return r.from_okay(init);
    } else {
      return this.iter.try_rfold<Acc, LoopState<Acc, R>>(init, LoopState, check).into_try(r);
    }
  }

  // Clone
  public clone(): this["Self"] {
    return new SkipExactSizeAndDoubleEndedIterator(clone(this.iter), this.n);
  }

  // Debug
  public fmt_debug(): string {
    return format("Skip({:?},{:?})", this.n, this.iter);
  }
}

export class Take<I extends IteratorCommon> extends IteratorBase implements Clone, Debug {
  public Self!: Take<I>;

  public iter: I;
  public n: number;

  constructor(iter: I, n: number) {
    super();
    assert(n >= 0);
    this.iter = iter;
    this.n = u64(n);
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.n !== 0) {
      this.n -= 1;
      return this.iter.next();
    } else {
      return None();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.n > n) {
      this.n -= n + 1;
      return this.iter.nth(n);
    } else {
      if (this.n > 0) {
        this.iter.nth(this.n - 1);
        this.n = 0;
      }
      return None();
    }
  }

  public size_hint(): [number, Option<number>] {
    if (this.n === 0) {
      return [0, Some(0)];
    }

    let [lower, upper] = this.iter.size_hint();

    lower = minnum(lower, this.n);

    let match_upper = upper.match();
    switch (match_upper.type) {
      case OptionType.Some:
        let x = match_upper.value;
        if (x < this.n) {
          upper = Some(x);
          break;
        }
      default:
        upper = Some(this.n);
        break;
    }

    return [lower, upper];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const check = (acc: Acc, t: this["Item"]): LoopState<Acc, R> => {
      this.n -= 1;
      let res = fold(acc, t);
      if (this.n === 0) {
        return Break(res);
      } else {
        return LoopState.from_try(res);
      }
    };

    if (this.n === 0) {
      return r.from_okay(init);
    } else {
      return this.iter.try_fold<Acc, LoopState<Acc, R>>(init, LoopState, check).into_try(r);
    }
  }

  // Clone
  public clone(): this["Self"] {
    return new Take(clone(this.iter), this.n);
  }

  public fmt_debug(): string {
    return format("Take({:?},{:?})", this.n, this.iter);
  }
}

export class TakeExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: TakeExactSizeIterator<I>;

  public iter: I;
  public n: number;

  constructor(iter: I, n: number) {
    super();
    assert(n >= 0);
    this.iter = iter;
    this.n = u64(n);
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.n !== 0) {
      this.n -= 1;
      return this.iter.next();
    } else {
      return None();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.n > n) {
      this.n -= n + 1;
      return this.iter.nth(n);
    } else {
      if (this.n > 0) {
        this.iter.nth(this.n - 1);
        this.n = 0;
      }
      return None();
    }
  }

  public size_hint(): [number, Option<number>] {
    if (this.n === 0) {
      return [0, Some(0)];
    }

    let [lower, upper] = this.iter.size_hint();

    lower = minnum(lower, this.n);

    let match_upper = upper.match();
    switch (match_upper.type) {
      case OptionType.Some:
        let x = match_upper.value;
        if (x < this.n) {
          upper = Some(x);
          break;
        }
      default:
        upper = Some(this.n);
        break;
    }

    return [lower, upper];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const check = (acc: Acc, t: this["Item"]): LoopState<Acc, R> => {
      this.n -= 1;
      let res = fold(acc, t);
      if (this.n === 0) {
        return Break(res);
      } else {
        return LoopState.from_try(res);
      }
    };

    if (this.n === 0) {
      return r.from_okay(init);
    } else {
      return this.iter.try_fold<Acc, LoopState<Acc, R>>(init, LoopState, check).into_try(r);
    }
  }

  // Clone
  public clone(): this["Self"] {
    return new TakeExactSizeIterator(clone(this.iter), this.n);
  }

  public fmt_debug(): string {
    return format("Take({:?},{:?})", this.n, this.iter);
  }
}

export class TakeExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: TakeExactSizeAndDoubleEndedIterator<I>;

  public iter: I;
  public n: number;

  constructor(iter: I, n: number) {
    super();
    assert(n >= 0);
    this.iter = iter;
    this.n = u64(n);
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    if (this.n !== 0) {
      this.n -= 1;
      return this.iter.next();
    } else {
      return None();
    }
  }

  public nth(n: number): Option<this["Item"]> {
    if (this.n > n) {
      this.n -= n + 1;
      return this.iter.nth(n);
    } else {
      if (this.n > 0) {
        this.iter.nth(this.n - 1);
        this.n = 0;
      }
      return None();
    }
  }

  public size_hint(): [number, Option<number>] {
    if (this.n === 0) {
      return [0, Some(0)];
    }

    let [lower, upper] = this.iter.size_hint();

    lower = minnum(lower, this.n);

    let match_upper = upper.match();
    switch (match_upper.type) {
      case OptionType.Some:
        let x = match_upper.value;
        if (x < this.n) {
          upper = Some(x);
          break;
        }
      default:
        upper = Some(this.n);
        break;
    }

    return [lower, upper];
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const check = (acc: Acc, t: this["Item"]): LoopState<Acc, R> => {
      this.n -= 1;
      let res = fold(acc, t);
      if (this.n === 0) {
        return Break(res);
      } else {
        return LoopState.from_try(res);
      }
    };

    if (this.n === 0) {
      return r.from_okay(init);
    } else {
      return this.iter.try_fold<Acc, LoopState<Acc, R>>(init, LoopState, check).into_try(r);
    }
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    if (this.n === 0) {
      return None();
    } else {
      let n = this.n;
      this.n -= 1;
      return this.iter.nth_back(u64_saturating_sub(this.iter.len(), n));
    }
  }

  public nth_back(n: number): Option<this["Item"]> {
    let len = this.iter.len();
    if (this.n > n) {
      let m = u64_saturating_sub(len, this.n) + n;
      this.n -= n + 1;
      return this.iter.nth_back(m);
    } else {
      if (len > 0) {
        return this.iter.nth_back(len - 1);
      }
      return None();
    }
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    if (this.n === 0) {
      return r.from_okay(init);
    } else {
      let len = this.iter.len();
      if (len > this.n && this.iter.nth_back(len - this.n - 1).is_none()) {
        return r.from_okay(init);
      } else {
        return this.iter.try_rfold(init, r, fold);
      }
    }
  }

  // Clone
  public clone(): this["Self"] {
    return new TakeExactSizeAndDoubleEndedIterator(clone(this.iter), this.n);
  }

  public fmt_debug(): string {
    return format("Take({:?},{:?})", this.n, this.iter);
  }
}

export class Scan<I extends IteratorCommon, St, B> extends IteratorBase<B> implements Clone, Debug {
  public Self!: Scan<I, St, B>;

  public iter: I;
  public f: (state: St, item: I["Item"]) => Option<B>;
  public state: St;

  constructor(iter: I, state: St, f: (state: St, item: I["Item"]) => Option<B>) {
    super();
    this.iter = iter;
    this.f = f;
    this.state = state;
  }

  // Iterator
  public Item!: B;

  public next(): Option<this["Item"]> {
    let opt_a = this.iter.next();
    if (opt_a.is_none()) {
      return None();
    }
    let a = opt_a.unwrap();
    return this.f(this.state, a);
  }

  public size_hint(): [number, Option<number>] {
    let [_, upper] = this.iter.size_hint();
    return [0, upper]; // can't know a lower bound, due to the scan function
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const scan = (acc: Acc, t: this["Item"]): LoopState<R["Okay"], R> => {
      let match = this.f(this.state, t).match();
      switch (match.type) {
        case OptionType.None:
          return Break(r.from_okay(acc));
        case OptionType.Some:
          return LoopState.from_try(fold(acc, match.value));
      }
    };

    return this.iter.try_fold<Acc, LoopState<Acc, R>>(init, LoopState, scan).into_try(r);
  }

  // Clone
  public clone(): this["Self"] {
    return new Scan(clone(this.iter), clone(this.state), this.f);
  }

  public fmt_debug(): string {
    return format("Scan({:?},{:?},{:?})", this.state, this.f, this.iter);
  }
}

// // export class Fuse extends ImplClone(IteratorBase) implements Debug {
// //   public Self!: Fuse;
// //
// //   public Iter!: IteratorBase;
// //
// //   public iter: I;
// //   public done: boolean;
// //
// //   constructor(iter: IteratorBase) {
// //     super();
// //     this.iter = iter;
// //     this.done = false;
// //   }
// //
// //   public clone(): this["Self"] {
// //     if (
// //       isFusedIterator(this.iter) &&
// //       isExactSizeIterator(this.iter) &&
// //       isDoubleEndedIterator(this.iter)
// //     ) {
// //       return new FuseForFusedAndExactSizeAndDoubleEndedIterator(clone(this.iter));
// //     } else if (isFusedIterator(this.iter) && isExactSizeIterator(this.iter)) {
// //       return new FuseForFusedAndExactSizeIterator(clone(this.iter));
// //     } else if (isFusedIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
// //       return new FuseForFusedAndDoubleEndedIterator(clone(this.iter));
// //     } else if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
// //       return new FuseForExactSizeAndDoubleEndedIterator(clone(this.iter));
// //     } else if (isExactSizeIterator(this.iter)) {
// //       return new FuseForExactSizeIterator(clone(this.iter));
// //     } else if (isDoubleEndedIterator(this.iter)) {
// //       return new FuseForDoubleEndedIterator(clone(this.iter));
// //     } else if (isFusedIterator(this.iter)) {
// //       return new FuseForFusedIterator(clone(this.iter));
// //     } else {
// //       return new FuseForIterator(clone(this.iter));
// //     }
// //   }
// //
// //   public fmt_debug(): string {
// //     return format("Fuse({:?},{:?})", this.done, this.iter);
// //   }
// // }
// //
// // export const ImplFuseForIterator = <T extends AnyConstructor<Fuse>>(Base: T) =>
// //   class FuseForIterator extends Base {
// //     public Self!: FuseForIterator;
// //
// //     public next(): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let next = this.iter.next();
// //         this.done = next.is_none();
// //         return next;
// //       }
// //     }
// //
// //     public nth(n: number): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let nth = this.iter.nth(n);
// //         this.done = nth.is_none();
// //         return nth;
// //       }
// //     }
// //
// //     public last(): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         return this.iter.last();
// //       }
// //     }
// //
// //     public count(): number {
// //       if (this.done) {
// //         return 0;
// //       } else {
// //         return this.iter.count();
// //       }
// //     }
// //
// //     public size_hint(): [number, Option<number>] {
// //       if (this.done) {
// //         return [0, Some(0)];
// //       } else {
// //         return this.iter.size_hint();
// //       }
// //     }
// //
// //     public try_fold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       if (this.done) {
// //         return r.from_okay(init);
// //       } else {
// //         let try_acc = this.iter.try_fold(init, r, fold);
// //         if (try_acc.is_error()) {
// //           return try_acc;
// //         }
// //         let acc = try_acc.unwrap();
// //         this.done = true;
// //         return r.from_okay(acc);
// //       }
// //     }
// //
// //     public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       if (this.done) {
// //         return init;
// //       } else {
// //         return this.iter.fold(init, fold);
// //       }
// //     }
// //   };
// //
// // export class FuseForIterator extends ImplFuseForIterator(Fuse) {}
// //
// // export const ImplFuseForDoubleEndedIterator = <
// //   T extends AnyConstructor<FuseForIterator & DoubleEndedIterator>
// // >(
// //   Base: T
// // ) =>
// //   class FuseForDoubleEndedIterator extends Base {
// //     public Self!: FuseForDoubleEndedIterator;
// //
// //     public Iter!: DoubleEndedIterator;
// //
// //     public next_back(): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let next = this.iter.next_back();
// //         this.done = next.is_none();
// //         return next;
// //       }
// //     }
// //
// //     public nth_back(n: number): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let nth = this.iter.nth_back(n);
// //         this.done = nth.is_none();
// //         return nth;
// //       }
// //     }
// //
// //     public try_rfold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       if (this.done) {
// //         return r.from_okay(init);
// //       } else {
// //         let try_acc = this.iter.try_rfold(init, r, fold);
// //         if (try_acc.is_error()) {
// //           return try_acc;
// //         }
// //         let acc = try_acc.unwrap();
// //         this.done = true;
// //         return r.from_okay(acc);
// //       }
// //     }
// //
// //     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       if (this.done) {
// //         return init;
// //       } else {
// //         return this.iter.rfold(init, fold);
// //       }
// //     }
// //   };
// //
// // export class FuseForDoubleEndedIterator extends ImplFuseForDoubleEndedIterator(
// //   ImplDoubleEndedIterator(ImplFuseForIterator(Fuse))
// // ) {}
// //
// // export const ImplFuseForFusedIterator = <T extends AnyConstructor<Fuse & FusedIterator>>(Base: T) =>
// //   class FuseForFusedIterator extends Base {
// //     public Self!: FuseForFusedIterator;
// //
// //     public Iter!: FusedIterator;
// //
// //     public next(): Option<this["Item"]> {
// //       return this.iter.next();
// //     }
// //
// //     public nth(n: number): Option<this["Item"]> {
// //       return this.iter.nth(n);
// //     }
// //
// //     public last(): Option<this["Item"]> {
// //       return this.iter.last();
// //     }
// //
// //     public count(): number {
// //       return this.iter.count();
// //     }
// //
// //     public size_hint(): [number, Option<number>] {
// //       return this.iter.size_hint();
// //     }
// //
// //     public try_fold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       return this.iter.try_fold(init, r, fold);
// //     }
// //
// //     public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       return this.iter.fold(init, fold);
// //     }
// //   };
// //
// // export class FuseForFusedIterator extends ImplFuseForFusedIterator(ImplFusedIterator(Fuse)) {}
// //
// // export const ImplFuseForFusedAndDoubleEndedIterator = <
// //   T extends AnyConstructor<Fuse & DoubleEndedIterator>
// // >(
// //   Base: T
// // ) =>
// //   class FuseForFusedAndDoubleEndedIterator extends Base {
// //     public Self!: FuseForFusedAndDoubleEndedIterator;
// //
// //     public Iter!: FusedIterator & DoubleEndedIterator;
// //
// //     public next_back(): Option<this["Item"]> {
// //       return this.iter.next_back();
// //     }
// //
// //     public nth_back(n: number): Option<this["Item"]> {
// //       return this.iter.nth_back(n);
// //     }
// //
// //     public try_rfold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       return this.iter.try_rfold(init, r, fold);
// //     }
// //
// //     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       return this.iter.rfold(init, fold);
// //     }
// //   };
// //
// // export class FuseForFusedAndDoubleEndedIterator extends ImplFuseForFusedAndDoubleEndedIterator(
// //   ImplFuseForFusedIterator(ImplDoubleEndedIterator(ImplFusedIterator(Fuse)))
// // ) {}
// //
// // export const ImplFuseForExactSizeIterator = <T extends AnyConstructor<Fuse & ExactSizeIterator>>(
// //   Base: T
// // ) =>
// //   class FuseForExactSizeIterator extends Base {
// //     public Self!: FuseForExactSizeIterator;
// //
// //     public Iter!: ExactSizeIterator;
// //
// //     public len(): number {
// //       return this.iter.len();
// //     }
// //
// //     public is_empty(): boolean {
// //       return this.iter.is_empty();
// //     }
// //   };
// //
// // export class FuseForExactSizeIterator extends ImplFuseForExactSizeIterator(
// //   ImplFuseForIterator(ImplExactSizeIterator(Fuse))
// // ) {}
// // export class FuseForExactSizeAndDoubleEndedIterator extends ImplFuseForExactSizeIterator(
// //   ImplFuseForIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Fuse)))
// // ) {}
// // export class FuseForFusedAndExactSizeIterator extends ImplFuseForExactSizeIterator(
// //   ImplFuseForFusedIterator(ImplExactSizeIterator(ImplFusedIterator(Fuse)))
// // ) {}
// // export class FuseForFusedAndExactSizeAndDoubleEndedIterator extends ImplFuseForFusedAndDoubleEndedIterator(
// //   ImplFuseForExactSizeIterator(
// //     ImplFuseForFusedIterator(
// //       ImplDoubleEndedIterator(ImplExactSizeIterator(ImplFusedIterator(Fuse)))
// //     )
// //   )
// // ) {}

function inspect_fold<T, Acc>(
  f: (t: T) => void,
  fold: (acc: Acc, t: T) => Acc
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T) => {
    f(item);
    return fold(acc, item);
  };
}

function inspect_try_fold<T, Acc, R>(
  f: (t: T) => void,
  fold: (acc: Acc, t: T) => R
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => {
    f(item);
    return fold(acc, item);
  };
}

export class Inspect<I extends IteratorBase> extends IteratorBase implements Clone, Debug {
  public Self!: Inspect<I>;

  public iter: I;
  public f: (item: I["Item"]) => void;

  constructor(iter: I, f: (item: I["Item"]) => void) {
    super();
    this.iter = iter;
    this.f = f;
  }

  public do_inspect(elt: Option<I["Item"]>): Option<I["Item"]> {
    if (elt.is_some()) {
      this.f(elt.unwrap());
    }

    return elt;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let next = this.iter.next();
    return this.do_inspect(next);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, inspect_try_fold<this["Item"], Acc, R>(this.f, fold));
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, inspect_fold<this["Item"], Acc>(this.f, fold));
  }

  // Clone
  public clone(): this["Self"] {
    return new Inspect(clone(this.iter), this.f);
  }

  // Debug
  public fmt_debug(): string {
    return format("Inspect({:?},{:?})", this.f, this.iter);
  }
}

export class InspectExactSizeIterator<I extends ExactSizeIterator> extends ExactSizeIterator
  implements Clone, Debug {
  public Self!: InspectExactSizeIterator<I>;

  public iter: I;
  public f: (item: I["Item"]) => void;

  constructor(iter: I, f: (item: I["Item"]) => void) {
    super();
    this.iter = iter;
    this.f = f;
  }

  public do_inspect(elt: Option<I["Item"]>): Option<I["Item"]> {
    if (elt.is_some()) {
      this.f(elt.unwrap());
    }

    return elt;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let next = this.iter.next();
    return this.do_inspect(next);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, inspect_try_fold<this["Item"], Acc, R>(this.f, fold));
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, inspect_fold<this["Item"], Acc>(this.f, fold));
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new InspectExactSizeIterator(clone(this.iter), this.f);
  }

  // Debug
  public fmt_debug(): string {
    return format("Inspect({:?},{:?})", this.f, this.iter);
  }
}

export class InspectDoubleEndedIterator<I extends DoubleEndedIterator> extends DoubleEndedIterator
  implements Clone, Debug {
  public Self!: InspectDoubleEndedIterator<I>;

  public iter: I;
  public f: (item: I["Item"]) => void;

  constructor(iter: I, f: (item: I["Item"]) => void) {
    super();
    this.iter = iter;
    this.f = f;
  }

  public do_inspect(elt: Option<I["Item"]>): Option<I["Item"]> {
    if (elt.is_some()) {
      this.f(elt.unwrap());
    }

    return elt;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let next = this.iter.next();
    return this.do_inspect(next);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, inspect_try_fold<this["Item"], Acc, R>(this.f, fold));
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, inspect_fold<this["Item"], Acc>(this.f, fold));
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    let next = this.iter.next_back();
    return this.do_inspect(next);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, inspect_try_fold<this["Item"], Acc, R>(this.f, fold));
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, inspect_fold<this["Item"], Acc>(this.f, fold));
  }

  // Clone
  public clone(): this["Self"] {
    return new InspectDoubleEndedIterator(clone(this.iter), this.f);
  }

  // Debug
  public fmt_debug(): string {
    return format("Inspect({:?},{:?})", this.f, this.iter);
  }
}

export class InspectExactSizeAndDoubleEndedIterator<I extends ExactSizeAndDoubleEndedIterator>
  extends ExactSizeAndDoubleEndedIterator
  implements Clone, Debug {
  public Self!: InspectExactSizeAndDoubleEndedIterator<I>;

  public iter: I;
  public f: (item: I["Item"]) => void;

  constructor(iter: I, f: (item: I["Item"]) => void) {
    super();
    this.iter = iter;
    this.f = f;
  }

  public do_inspect(elt: Option<I["Item"]>): Option<I["Item"]> {
    if (elt.is_some()) {
      this.f(elt.unwrap());
    }

    return elt;
  }

  // Iterator
  public Item!: I["Item"];

  public next(): Option<this["Item"]> {
    let next = this.iter.next();
    return this.do_inspect(next);
  }

  public size_hint(): [number, Option<number>] {
    return this.iter.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_fold(init, r, inspect_try_fold<this["Item"], Acc, R>(this.f, fold));
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.fold(init, inspect_fold<this["Item"], Acc>(this.f, fold));
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    let next = this.iter.next_back();
    return this.do_inspect(next);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter.try_rfold(init, r, inspect_try_fold<this["Item"], Acc, R>(this.f, fold));
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.iter.rfold(init, inspect_fold<this["Item"], Acc>(this.f, fold));
  }

  // ExactSizeIterator
  public len(): number {
    return this.iter.len();
  }

  public is_empty(): boolean {
    return this.iter.is_empty();
  }

  // Clone
  public clone(): this["Self"] {
    return new InspectExactSizeAndDoubleEndedIterator(clone(this.iter), this.f);
  }

  // Debug
  public fmt_debug(): string {
    return format("Inspect({:?},{:?})", this.f, this.iter);
  }
}

declare module "./iter" {
  interface IteratorBase<T> {
    max_by_key<B>(f: (item: T) => B): Option<T>;

    min_by_key<B>(f: (item: T) => B): Option<T>;

    step_by(n: number): StepBy<this["Self"]>;

    map<B>(f: (x: T) => B): Map<this["Self"], B>;

    filter(predicate: (item: T) => boolean): Filter<this["Self"]>;

    filter_map<B>(f: (item: T) => Option<B>): FilterMap<this["Self"], B>;

    enumerate(): Enumerate<this["Self"]>;

    peekable(): Peekable<this["Self"]>;

    skip_while(predicate: (item: T) => boolean): SkipWhile<this["Self"]>;

    take_while(predicate: (item: T) => boolean): TakeWhile<this["Self"]>;

    skip(n: number): Skip<this["Self"]>;

    take(n: number): Take<this["Self"]>;

    scan<St, B>(initial_state: St, f: (st: St, item: T) => Option<B>): Scan<this["Self"], St, B>;

    //     // fuse<Self extends FusedIterator & ExactSizeIterator & DoubleEndedIterator>(
    //     //   this: Self
    //     // ): FuseForExactSizeAndDoubleEndedIterator;
    //     // fuse<Self extends FusedIterator & ExactSizeIterator>(
    //     //   this: Self
    //     // ): FuseForExactSizeAndDoubleEndedIterator;
    //     // fuse<Self extends FusedIterator & DoubleEndedIterator>(
    //     //   this: Self
    //     // ): FuseForExactSizeAndDoubleEndedIterator;
    //     // fuse<Self extends ExactSizeIterator & DoubleEndedIterator>(
    //     //   this: Self
    //     // ): FuseForExactSizeAndDoubleEndedIterator;
    //     // fuse<Self extends ExactSizeIterator>(this: Self): FuseForExactSizeIterator;
    //     // fuse<Self extends DoubleEndedIterator>(this: Self): FuseForDoubleEndedIterator;
    //     // fuse<Self extends FusedIterator>(this: Self): FuseForFusedIterator;
    //     // fuse(): FuseForIterator;

    inspect(f: (x: T) => void): Inspect<this["Self"]>;

    cloned(): Cloned<this["Self"]>;

    cycle<Self extends IteratorCommon<T> & Clone>(this: Self): Cycle<Self>;
  }

  interface DoubleEndedIterator<T> {
    max_by_key<B>(f: (item: T) => B): Option<T>;

    min_by_key<B>(f: (item: T) => B): Option<T>;

    step_by(n: number): StepBy<this["Self"]>;

    map<B>(f: (x: T) => B): MapDoubleEndedIterator<this["Self"], B>;

    filter(predicate: (item: T) => boolean): FilterDoubleEndedIterator<this["Self"]>;

    filter_map<B>(f: (item: T) => Option<B>): FilterMapDoubleEndedIterator<this["Self"], B>;

    enumerate(): Enumerate<this["Self"]>;

    peekable(): PeekableDoubleEndedIterator<this["Self"]>;

    skip_while(predicate: (item: T) => boolean): SkipWhile<this["Self"]>;

    take_while(predicate: (item: T) => boolean): TakeWhile<this["Self"]>;

    skip(n: number): Skip<this["Self"]>;

    take(n: number): Take<this["Self"]>;

    scan<St, B>(initial_state: St, f: (st: St, item: T) => Option<B>): Scan<this["Self"], St, B>;

    inspect(f: (x: T) => void): InspectDoubleEndedIterator<this["Self"]>;

    /**
     * Reverses an iterator's direction.
     */
    rev(): Rev<this["Self"]>;

    cloned(): ClonedDoubleEndedIterator<this["Self"]>;

    cycle<Self extends IteratorCommon<T> & Clone>(this: Self): Cycle<Self>;
  }

  interface ExactSizeIterator<T> {
    max_by_key<B>(f: (item: T) => B): Option<T>;

    min_by_key<B>(f: (item: T) => B): Option<T>;

    step_by(n: number): StepByExactSizeIterator<this["Self"]>;

    map<B>(f: (x: T) => B): MapExactSizeIterator<this["Self"], B>;

    filter(predicate: (item: T) => boolean): Filter<this["Self"]>;

    filter_map<B>(f: (item: T) => Option<B>): FilterMap<this["Self"], B>;

    enumerate(): EnumerateExactSizeIterator<this["Self"]>;

    peekable(): PeekableExactSizeIterator<this["Self"]>;

    skip_while(predicate: (item: T) => boolean): SkipWhile<this["Self"]>;

    take_while(predicate: (item: T) => boolean): TakeWhile<this["Self"]>;

    skip(n: number): SkipExactSizeIterator<this["Self"]>;

    take(n: number): TakeExactSizeIterator<this["Self"]>;

    scan<St, B>(initial_state: St, f: (st: St, item: T) => Option<B>): Scan<this["Self"], St, B>;

    inspect(f: (x: T) => void): InspectExactSizeIterator<this["Self"]>;

    cloned(): ClonedExactSizeIterator<this["Self"]>;

    cycle<Self extends IteratorCommon<T> & Clone>(this: Self): Cycle<Self>;
  }

  interface ExactSizeAndDoubleEndedIterator<T> {
    max_by_key<B>(f: (item: T) => B): Option<T>;

    min_by_key<B>(f: (item: T) => B): Option<T>;

    step_by(n: number): StepByExactSizeAndDoubleEndedIterator<this["Self"]>;

    map<B>(f: (x: T) => B): MapExactSizeAndDoubleEndedIterator<this["Self"], B>;

    filter(predicate: (item: T) => boolean): FilterDoubleEndedIterator<this["Self"]>;

    filter_map<B>(f: (item: T) => Option<B>): FilterMapDoubleEndedIterator<this["Self"], B>;

    enumerate(): EnumerateExactSizeAndDoubleEndedIterator<this["Self"]>;

    peekable(): PeekableExactSizeAndDoubleEndedIterator<this["Self"]>;

    skip_while(predicate: (item: T) => boolean): SkipWhile<this["Self"]>;

    take_while(predicate: (item: T) => boolean): TakeWhile<this["Self"]>;

    skip(n: number): SkipExactSizeAndDoubleEndedIterator<this["Self"]>;

    take(n: number): TakeExactSizeAndDoubleEndedIterator<this["Self"]>;

    scan<St, B>(initial_state: St, f: (st: St, item: T) => Option<B>): Scan<this["Self"], St, B>;

    inspect(f: (x: T) => void): InspectExactSizeAndDoubleEndedIterator<this["Self"]>;

    /**
     * Reverses an iterator's direction.
     */
    rev(): RevExactSizeIterator<this["Self"]>;

    cloned(): ClonedExactSizeAndDoubleEndedIterator<this["Self"]>;

    cycle<Self extends IteratorCommon<T> & Clone>(this: Self): Cycle<Self>;
  }
}

ExactSizeAndDoubleEndedIterator.prototype.max_by_key = function<
  T,
  Self extends ExactSizeAndDoubleEndedIterator<T>,
  B
>(this: Self, f: (item: T) => B): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).max_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};
ExactSizeIterator.prototype.max_by_key = function<T, Self extends ExactSizeIterator<T>, B>(
  this: Self,
  f: (item: T) => B
): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).max_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};
DoubleEndedIterator.prototype.max_by_key = function<T, Self extends DoubleEndedIterator<T>, B>(
  this: Self,
  f: (item: T) => B
): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).max_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};
IteratorBase.prototype.max_by_key = function<T, Self extends IteratorBase<T>, B>(
  this: Self,
  f: (item: T) => B
): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).max_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};

ExactSizeAndDoubleEndedIterator.prototype.min_by_key = function<
  T,
  Self extends ExactSizeAndDoubleEndedIterator<T>,
  B
>(this: Self, f: (item: T) => B): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).min_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};
ExactSizeIterator.prototype.min_by_key = function<T, Self extends ExactSizeIterator<T>, B>(
  this: Self,
  f: (item: T) => B
): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).min_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};
DoubleEndedIterator.prototype.min_by_key = function<T, Self extends DoubleEndedIterator<T>, B>(
  this: Self,
  f: (item: T) => B
): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).min_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};
IteratorBase.prototype.min_by_key = function<T, Self extends IteratorBase<T>, B>(
  this: Self,
  f: (item: T) => B
): Option<T> {
  const key = (x: T): [B, T] => [f(x), x];
  const compare = ([x_p, _x]: [B, T], [y_p, _y]: [B, T]): Ordering => cmp(x_p, y_p);

  let cmp_opt = this.map<[B, T]>(key).min_by(compare);
  if (cmp_opt.is_none()) {
    return None();
  }
  let [_, x]: [B, T] = cmp_opt.unwrap();
  return Some(x);
};

ExactSizeAndDoubleEndedIterator.prototype.step_by = function(n: number) {
  return new StepByExactSizeAndDoubleEndedIterator(this, n);
};
ExactSizeIterator.prototype.step_by = function(n: number) {
  return new StepByExactSizeIterator(this, n);
};
DoubleEndedIterator.prototype.step_by = function(n: number) {
  return new StepBy(this, n);
};
IteratorBase.prototype.step_by = function(n: number) {
  return new StepBy(this, n);
};

ExactSizeAndDoubleEndedIterator.prototype.map = function(f) {
  return new MapExactSizeAndDoubleEndedIterator(this, f);
};
ExactSizeIterator.prototype.map = function(f) {
  return new MapExactSizeIterator(this, f);
};
DoubleEndedIterator.prototype.map = function(f) {
  return new MapDoubleEndedIterator(this, f);
};
IteratorBase.prototype.map = function(f) {
  return new Map(this, f);
};

ExactSizeAndDoubleEndedIterator.prototype.filter = function(predicate) {
  return new FilterDoubleEndedIterator(this, predicate);
};
ExactSizeIterator.prototype.filter = function(predicate) {
  return new Filter(this, predicate);
};
DoubleEndedIterator.prototype.filter = function(predicate) {
  return new FilterDoubleEndedIterator(this, predicate);
};
IteratorBase.prototype.filter = function(predicate) {
  return new Filter(this, predicate);
};

ExactSizeAndDoubleEndedIterator.prototype.filter_map = function(f) {
  return new FilterMapDoubleEndedIterator(this, f);
};
ExactSizeIterator.prototype.filter_map = function(f) {
  return new FilterMap(this, f);
};
DoubleEndedIterator.prototype.filter_map = function(f) {
  return new FilterMapDoubleEndedIterator(this, f);
};
IteratorBase.prototype.filter_map = function(f) {
  return new FilterMap(this, f);
};

ExactSizeAndDoubleEndedIterator.prototype.skip_while = function(predicate) {
  return new SkipWhile(this, predicate);
};
ExactSizeIterator.prototype.skip_while = function(predicate) {
  return new SkipWhile(this, predicate);
};
DoubleEndedIterator.prototype.skip_while = function(predicate) {
  return new SkipWhile(this, predicate);
};
IteratorBase.prototype.skip_while = function(predicate) {
  return new SkipWhile(this, predicate);
};

ExactSizeAndDoubleEndedIterator.prototype.take_while = function(predicate) {
  return new TakeWhile(this, predicate);
};
ExactSizeIterator.prototype.take_while = function(predicate) {
  return new TakeWhile(this, predicate);
};
DoubleEndedIterator.prototype.take_while = function(predicate) {
  return new TakeWhile(this, predicate);
};
IteratorBase.prototype.take_while = function(predicate) {
  return new TakeWhile(this, predicate);
};

ExactSizeAndDoubleEndedIterator.prototype.skip = function(n: number) {
  return new SkipExactSizeAndDoubleEndedIterator(this, n);
};
ExactSizeIterator.prototype.skip = function(n: number) {
  return new SkipExactSizeIterator(this, n);
};
DoubleEndedIterator.prototype.skip = function(n: number) {
  return new Skip(this, n);
};
IteratorBase.prototype.skip = function(n: number) {
  return new Skip(this, n);
};

ExactSizeAndDoubleEndedIterator.prototype.take = function(n: number) {
  return new TakeExactSizeAndDoubleEndedIterator(this, n);
};
ExactSizeIterator.prototype.take = function(n: number) {
  return new TakeExactSizeIterator(this, n);
};
DoubleEndedIterator.prototype.take = function(n: number) {
  return new Take(this, n);
};
IteratorBase.prototype.take = function(n: number) {
  return new Take(this, n);
};

ExactSizeAndDoubleEndedIterator.prototype.enumerate = function() {
  return new EnumerateExactSizeAndDoubleEndedIterator(this);
};
ExactSizeIterator.prototype.enumerate = function() {
  return new EnumerateExactSizeIterator(this);
};
DoubleEndedIterator.prototype.enumerate = function() {
  return new Enumerate(this);
};
IteratorBase.prototype.enumerate = function() {
  return new Enumerate(this);
};

ExactSizeAndDoubleEndedIterator.prototype.peekable = function() {
  return new PeekableExactSizeAndDoubleEndedIterator(this);
};
ExactSizeIterator.prototype.peekable = function() {
  return new PeekableExactSizeIterator(this);
};
DoubleEndedIterator.prototype.peekable = function() {
  return new PeekableDoubleEndedIterator(this);
};
IteratorBase.prototype.peekable = function() {
  return new Peekable(this);
};

ExactSizeAndDoubleEndedIterator.prototype.scan = function(initial_state, f) {
  return new Scan(this, initial_state, f);
};
ExactSizeIterator.prototype.scan = function(initial_state, f) {
  return new Scan(this, initial_state, f);
};
DoubleEndedIterator.prototype.scan = function(initial_state, f) {
  return new Scan(this, initial_state, f);
};
IteratorBase.prototype.scan = function(initial_state, f) {
  return new Scan(this, initial_state, f);
};

// // function fuse<Self extends FusedIterator & ExactSizeIterator & DoubleEndedIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends FusedIterator & ExactSizeIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends FusedIterator & DoubleEndedIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends ExactSizeIterator & DoubleEndedIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends ExactSizeIterator>(this: Self): FuseForExactSizeIterator;
// // function fuse<Self extends DoubleEndedIterator>(this: Self): FuseForDoubleEndedIterator;
// // function fuse<Self extends FusedIterator>(this: Self): FuseForFusedIterator;
// // function fuse<Self extends Iterator>(this: Self): FuseForIterator;
// // function fuse(this: any): any {
// //   if (isFusedIterator(this) && isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
// //     return new FuseForFusedAndExactSizeAndDoubleEndedIterator(this);
// //   } else if (isFusedIterator(this) && isExactSizeIterator(this)) {
// //     return new FuseForFusedAndExactSizeIterator(this);
// //   } else if (isFusedIterator(this) && isDoubleEndedIterator(this)) {
// //     return new FuseForFusedAndDoubleEndedIterator(this);
// //   } else if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
// //     return new FuseForExactSizeAndDoubleEndedIterator(this);
// //   } else if (isExactSizeIterator(this)) {
// //     return new FuseForExactSizeIterator(this);
// //   } else if (isDoubleEndedIterator(this)) {
// //     return new FuseForDoubleEndedIterator(this);
// //   } else if (isFusedIterator(this)) {
// //     return new FuseForFusedIterator(this);
// //   } else {
// //     return new FuseForIterator(this);
// //   }
// // }
// // IteratorBase.prototype.fuse = fuse;

ExactSizeAndDoubleEndedIterator.prototype.inspect = function(f) {
  return new InspectExactSizeAndDoubleEndedIterator(this, f);
};
ExactSizeIterator.prototype.inspect = function(f) {
  return new InspectExactSizeIterator(this, f);
};
DoubleEndedIterator.prototype.inspect = function(f) {
  return new InspectDoubleEndedIterator(this, f);
};
IteratorBase.prototype.inspect = function(f) {
  return new Inspect(this, f);
};

ExactSizeAndDoubleEndedIterator.prototype.rev = function() {
  return new RevExactSizeIterator(this);
};
DoubleEndedIterator.prototype.rev = function() {
  return new Rev(this);
};

ExactSizeAndDoubleEndedIterator.prototype.cloned = function() {
  return new ClonedExactSizeAndDoubleEndedIterator(this);
};
ExactSizeIterator.prototype.cloned = function() {
  return new ClonedExactSizeIterator(this);
};
DoubleEndedIterator.prototype.cloned = function() {
  return new ClonedDoubleEndedIterator(this);
};
IteratorBase.prototype.cloned = function() {
  return new Cloned(this);
};

ExactSizeAndDoubleEndedIterator.prototype.cycle = function() {
  return new Cycle(this);
};
ExactSizeIterator.prototype.cycle = function() {
  return new Cycle(this);
};
DoubleEndedIterator.prototype.cycle = function() {
  return new Cycle(this);
};
IteratorBase.prototype.cycle = function() {
  return new Cycle(this);
};
