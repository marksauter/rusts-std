import {
  // ops/try.ts
  Try,
  TryConstructor,
  // iter.ts
  IteratorBase,
  IteratorCommon,
  IntoIterator,
  isIntoIterator,
  ExactSizeIterator,
  DoubleEndedIterator,
  DoubleEndedIteratorCommon,
  ExactSizeAndDoubleEndedIterator,
  // iter_adapters.ts
  Map,
  MapDoubleEndedIterator,
  // clone.ts
  Clone,
  clone,
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
  eq,
  // checked.ts
  u64_checked_add,
  // intrinsics.ts
  u64_saturating_add
} from "./internal";

/**
 * An iterator that maps each element to an iterator, and yields the elements
 * of the produced iterators.
 */
export class FlatMap<I extends IteratorCommon, U extends IntoIterator>
  extends IteratorBase<U["Item"]>
  implements Clone, Debug {
  public Self!: FlatMap<I, U>;

  private inner: FlattenCompat<U["IntoIter"], Map<I, IntoIterator<U["Item"], U["IntoIter"]>>>;

  public constructor(
    inner: FlattenCompat<U["IntoIter"], Map<I, IntoIterator<U["Item"], U["IntoIter"]>>>
  ) {
    super();
    this.inner = inner;
  }

  public static new<I extends IteratorCommon, U extends IntoIterator>(
    iter: I,
    f: (item: I["Item"]) => U
  ): FlatMap<I, U> {
    return new FlatMap(new FlattenCompat(iter.map(f)));
  }

  // Iterator
  public Item!: U["Item"];

  public next(): Option<this["Item"]> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.inner.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.inner.fold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new FlatMap(clone(this.inner));
  }

  // Debug
  public fmt_debug(): string {
    return format("FlatMap({:?})", this.inner);
  }
}

export class FlatMapDoubleEndedIterator<
  I extends DoubleEndedIteratorCommon,
  U extends IntoIterator<any, DoubleEndedIteratorCommon<any>>
> extends DoubleEndedIterator<U["Item"]> implements Clone, Debug {
  public Self!: FlatMapDoubleEndedIterator<I, U>;

  private inner: FlattenCompatDoubleEndedIterator<
    U["IntoIter"],
    MapDoubleEndedIterator<I, IntoIterator<U["Item"], U["IntoIter"]>>
  >;

  public constructor(
    inner: FlattenCompatDoubleEndedIterator<
      U["IntoIter"],
      MapDoubleEndedIterator<I, IntoIterator<U["Item"], U["IntoIter"]>>
    >
  ) {
    super();
    this.inner = inner;
  }

  public static new<
    I extends DoubleEndedIteratorCommon,
    U extends IntoIterator<any, DoubleEndedIteratorCommon<any>>
  >(iter: I, f: (item: I["Item"]) => U): FlatMapDoubleEndedIterator<I, U> {
    return new FlatMapDoubleEndedIterator(new FlattenCompatDoubleEndedIterator(iter.map(f)));
  }

  // Iterator
  public Item!: U["Item"];

  public next(): Option<this["Item"]> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.inner.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.inner.fold(init, fold);
  }

  // DoubleEndedIterator
  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.inner.try_rfold(init, r, fold);
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.inner.rfold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new FlatMapDoubleEndedIterator(clone(this.inner));
  }

  // Debug
  public fmt_debug(): string {
    return format("FlatMap({:?})", this.inner);
  }

  public next_back(): Option<U["Item"]> {
    return this.inner.next_back();
  }
}

/**
 * An iterator that flattens one level of nesting in an iterator of things that
 * can be turned into iterators.
 *
 * NOTE: this is not typed correctly due to issue with type inference in typescript.
 * `I` should be of type IteratorCommon<IntoIterator<U["Item"], U>>
 */
export class Flatten<U extends IteratorCommon, I extends IteratorCommon>
  extends IteratorBase<U["Item"]>
  implements Clone, Debug {
  public Self!: Flatten<U, I>;

  private inner: FlattenCompat<U, I>;

  public constructor(inner: FlattenCompat<U, I>) {
    super();
    this.inner = inner;
  }

  public static new<
    U extends IteratorCommon,
    I extends IteratorCommon,
    Into extends IteratorCommon<IntoIterator<U["Item"], U>>
  >(iter: I): Flatten<U, Into> {
    // FIXME: Hacky workaround to fix typing issues with iterator `flatten` method
    let peek = clone(iter)
      .peekable()
      .peek();
    if (peek.is_some()) {
      let item = peek.unwrap();
      if (!isIntoIterator(item)) {
        panic_into_iter("Flatten", "new", item);
      }
    }

    return new Flatten(new FlattenCompat((iter as unknown) as Into));
  }

  // Iterator
  public Item!: U["Item"];

  public next(): Option<this["Item"]> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.inner.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.inner.fold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new Flatten<U, I>(clone(this.inner));
  }

  // Debug
  public fmt_debug(): string {
    return format("Flatten({:?})", this.inner);
  }
}

export class FlattenDoubleEndedIterator<
  U extends DoubleEndedIteratorCommon,
  I extends DoubleEndedIteratorCommon
> extends DoubleEndedIterator<U["Item"]> implements Clone, Debug {
  public Self!: FlattenDoubleEndedIterator<U, I>;

  private inner: FlattenCompatDoubleEndedIterator<U, I>;

  public constructor(inner: FlattenCompatDoubleEndedIterator<U, I>) {
    super();
    this.inner = inner;
  }

  public static new<
    U extends DoubleEndedIteratorCommon,
    I extends DoubleEndedIteratorCommon,
    Into extends DoubleEndedIteratorCommon<IntoIterator<U["Item"], U>>
  >(iter: I): FlattenDoubleEndedIterator<U, Into> {
    // FIXME: Hacky workaround to fix typing issues with iterator `flatten` method
    let peek = clone(iter)
      .peekable()
      .peek();
    if (peek.is_some()) {
      let item = peek.unwrap();
      if (!isIntoIterator(item)) {
        panic_into_iter("FlattenDoubleEndedIterator", "new", item);
      }
    }

    return new FlattenDoubleEndedIterator(
      new FlattenCompatDoubleEndedIterator((iter as unknown) as Into)
    );
  }

  // Iterator
  public Item!: U["Item"];

  public next(): Option<this["Item"]> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.inner.try_fold(init, r, fold);
  }

  public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.inner.fold(init, fold);
  }

  // DoubleEndedIterator
  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.inner.try_rfold(init, r, fold);
  }

  public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.inner.rfold(init, fold);
  }

  // Clone
  public clone(): this["Self"] {
    return new FlattenDoubleEndedIterator<U, I>(clone(this.inner));
  }

  // Debug
  public fmt_debug(): string {
    return format("Flatten({:?})", this.inner);
  }

  public next_back(): Option<U["Item"]> {
    return this.inner.next_back();
  }
}

export class FlattenCompat<
  U extends IteratorCommon,
  I extends IteratorCommon<IntoIterator<U["Item"], U>>
> extends IteratorBase<U["Item"]> implements Clone, Debug {
  public Self!: FlattenCompat<U, I>;

  public iter!: I;
  public frontiter: Option<U>;
  public backiter: Option<U>;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this.frontiter = None();
    this.backiter = None();
  }

  // Iterator
  public Item!: U["Item"];

  public next(): Option<this["Item"]> {
    do {
      if (this.frontiter.is_some()) {
        let next = this.frontiter.unwrap().next();
        if (next.is_some()) {
          return next;
        }
      }
      let match = this.iter.next().match();
      switch (match.type) {
        case OptionType.None: {
          if (this.backiter.is_none()) {
            return None();
          }
          return this.backiter.unwrap().next();
        }
        case OptionType.Some:
          this.frontiter = Some(match.value.into_iter());
          break;
      }
    } while (true);
  }

  public size_hint(): [number, Option<number>] {
    let [flo, fhi] = this.frontiter.map_or([0, Some(0)], (iter: U) => iter.size_hint());
    let [blo, bhi] = this.backiter.map_or([0, Some(0)], (iter: U) => iter.size_hint());
    let lo = u64_saturating_add(flo, blo);
    let hint = this.iter.size_hint();
    if (eq(hint, [0, Some(0)]) && fhi.is_some() && bhi.is_some()) {
      return [lo, u64_checked_add(fhi.unwrap(), bhi.unwrap())];
    } else {
      return [lo, None()];
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const flatten = (acc: Acc, x: I["Item"]): R => {
      let mid = x.into_iter();
      let res = mid.try_fold(acc, r, fold);
      this.frontiter.replace(mid);
      return res;
    };

    if (this.frontiter.is_some()) {
      let front = this.frontiter.unwrap();
      let try_acc = front.try_fold(init, r, fold);
      if (try_acc.is_error()) {
        return try_acc;
      }
      init = try_acc.unwrap();
    }
    this.frontiter = None();

    let try_acc = this.iter.try_fold(init, r, flatten);
    if (try_acc.is_error()) {
      return try_acc;
    }
    init = try_acc.unwrap();
    this.frontiter = None();

    if (this.backiter.is_some()) {
      let back = this.backiter.unwrap();
      let try_acc = back.try_fold(init, r, fold);
      if (try_acc.is_error()) {
        return try_acc;
      }
      init = try_acc.unwrap();
    }
    this.backiter = None();

    return r.from_okay(init);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    const flatten = (acc: Acc, iter: U): Acc => iter.fold(acc, f);

    return this.frontiter
      .into_iter()
      .chain(this.iter.map((x: I["Item"]) => x.into_iter()))
      .chain(this.backiter)
      .fold(init, flatten);
  }

  // Clone
  public clone(): this["Self"] {
    return new FlattenCompat<U, I>(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("FlattenCompat({:?},{:?},{:?})", this.frontiter, this.backiter, this.iter);
  }
}

export class FlattenCompatDoubleEndedIterator<
  U extends DoubleEndedIteratorCommon,
  I extends DoubleEndedIteratorCommon<IntoIterator<U["Item"], U>>
> extends DoubleEndedIterator<U["Item"]> implements Clone, Debug {
  public Self!: FlattenCompatDoubleEndedIterator<U, I>;

  public iter!: I;
  public frontiter: Option<U>;
  public backiter: Option<U>;

  constructor(iter: I) {
    super();
    this.iter = iter;
    this.frontiter = None();
    this.backiter = None();
  }

  // Iterator
  public Item!: U["Item"];

  public next(): Option<this["Item"]> {
    do {
      if (this.frontiter.is_some()) {
        let next = this.frontiter.unwrap().next();
        if (next.is_some()) {
          return next;
        }
      }
      let match = this.iter.next().match();
      switch (match.type) {
        case OptionType.None: {
          if (this.backiter.is_none()) {
            return None();
          }
          return this.backiter.unwrap().next();
        }
        case OptionType.Some:
          this.frontiter = Some(match.value.into_iter());
          break;
      }
    } while (true);
  }

  public size_hint(): [number, Option<number>] {
    let [flo, fhi] = this.frontiter.map_or([0, Some(0)], (iter: U) => iter.size_hint());
    let [blo, bhi] = this.backiter.map_or([0, Some(0)], (iter: U) => iter.size_hint());
    let lo = u64_saturating_add(flo, blo);
    let hint = this.iter.size_hint();
    if (eq(hint, [0, Some(0)]) && fhi.is_some() && bhi.is_some()) {
      return [lo, u64_checked_add(fhi.unwrap(), bhi.unwrap())];
    } else {
      return [lo, None()];
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const flatten = (acc: Acc, x: I["Item"]): R => {
      let mid = x.into_iter();
      let res = mid.try_fold(acc, r, fold);
      this.frontiter.replace(mid);
      return res;
    };

    if (this.frontiter.is_some()) {
      let front = this.frontiter.unwrap();
      let try_acc = front.try_fold(init, r, fold);
      if (try_acc.is_error()) {
        return try_acc;
      }
      init = try_acc.unwrap();
    }
    this.frontiter = None();

    let try_acc = this.iter.try_fold(init, r, flatten);
    if (try_acc.is_error()) {
      return try_acc;
    }
    init = try_acc.unwrap();
    this.frontiter = None();

    if (this.backiter.is_some()) {
      let back = this.backiter.unwrap();
      let try_acc = back.try_fold(init, r, fold);
      if (try_acc.is_error()) {
        return try_acc;
      }
      init = try_acc.unwrap();
    }
    this.backiter = None();

    return r.from_okay(init);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    const flatten = (acc: Acc, iter: U): Acc => iter.fold(acc, f);

    return this.frontiter
      .into_iter()
      .chain(this.iter.map((x: I["Item"]) => x.into_iter()))
      .chain(this.backiter)
      .fold(init, flatten);
  }

  // DoubleEndedIterator
  public next_back(): Option<U["Item"]> {
    do {
      if (this.backiter.is_some()) {
        let elt = this.backiter.unwrap().next_back();
        if (elt.is_some()) {
          return elt;
        }
      }
      let next = this.iter.next_back();
      let match = next.match();
      switch (match.type) {
        case OptionType.None:
          if (this.frontiter.is_none()) {
            return None();
          }
          return this.frontiter.unwrap().next_back();
        default:
          this.backiter = next.map((x: I["Item"]) => x.into_iter());
      }
    } while (true);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    fold: (acc: Acc, item: this["Item"]) => R
  ): R {
    const flatten = (acc: Acc, x: I["Item"]) => {
      let mid = x.into_iter();
      let res = mid.try_rfold(acc, r, fold);
      this.backiter.replace(mid);
      return res;
    };

    if (this.backiter.is_some()) {
      let back = this.backiter.unwrap();
      let try_acc = back.try_rfold(init, r, fold);
      if (try_acc.is_error()) {
        return try_acc;
      }
      init = try_acc.unwrap();
    }
    this.backiter = None();

    let try_acc = this.iter.try_rfold(init, r, flatten);
    if (try_acc.is_error()) {
      return try_acc;
    }
    init = try_acc.unwrap();
    this.backiter = None();

    if (this.frontiter.is_some()) {
      let front = this.frontiter.unwrap();
      let try_acc = front.try_rfold(init, r, fold);
      if (try_acc.is_error()) {
        return try_acc;
      }
      init = try_acc.unwrap();
    }
    this.frontiter = None();

    return r.from_okay(init);
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    const flatten = (acc: Acc, iter: U): Acc => {
      return iter.rfold(acc, f);
    };

    return this.frontiter
      .into_iter()
      .chain(this.iter.map((x: I["Item"]) => x.into_iter()))
      .chain(this.backiter)
      .rfold(init, flatten);
  }

  // Clone
  public clone(): this["Self"] {
    return new FlattenCompatDoubleEndedIterator<U, I>(clone(this.iter));
  }

  // Debug
  public fmt_debug(): string {
    return format("FlattenCompat({:?},{:?},{:?})", this.frontiter, this.backiter, this.iter);
  }
}

declare module "./iter" {
  interface IteratorBase<T> {
    flat_map<U extends IntoIterator>(f: (x: T) => U): FlatMap<this, U>;

    flatten<U extends IteratorCommon>(): Flatten<U, this>;
  }

  interface ExactSizeIterator<T> {
    flat_map<U extends IntoIterator>(f: (x: T) => U): FlatMap<this, U>;

    flatten<U extends IteratorCommon>(): Flatten<U, this>;
  }

  interface DoubleEndedIterator<T> {
    // Separating DoubleEnded variant from Base variant to avoid uneccesary type confusion.
    flat_map<U extends IntoIterator<any, DoubleEndedIteratorCommon<any>>>(
      f: (x: T) => U
    ): FlatMapDoubleEndedIterator<this, U>;
    // Downcast DoubleEndedIteratorCommon to IteratorCommon
    flat_map_down<U extends IntoIterator>(f: (x: T) => U): FlatMap<this, U>;

    // Separating DoubleEnded variant from Base variant to avoid uneccesary type confusion.
    flatten<U extends DoubleEndedIteratorCommon>(): FlattenDoubleEndedIterator<U, this>;
    // Downcast DoubleEndedIteratorCommon to IteratorCommon
    flatten_down<U extends IteratorCommon>(): Flatten<U, this>;
  }

  interface ExactSizeAndDoubleEndedIterator<T> {
    // Separating DoubleEnded variant from Base variant to avoid uneccesary type confusion.
    flat_map<U extends IntoIterator<any, DoubleEndedIteratorCommon<any>>>(
      f: (x: T) => U
    ): FlatMapDoubleEndedIterator<this, U>;
    // Downcast DoubleEndedIteratorCommon to IteratorCommon
    flat_map_down<U extends IntoIterator>(f: (x: T) => U): FlatMap<this, U>;

    // Separating DoubleEnded variant from Base variant to avoid uneccesary type confusion.
    flatten<U extends DoubleEndedIteratorCommon>(): FlattenDoubleEndedIterator<U, this>;
    // Downcast DoubleEndedIteratorCommon to IteratorCommon
    flatten_down<U extends IteratorCommon>(): Flatten<U, this>;
  }
}

ExactSizeAndDoubleEndedIterator.prototype.flat_map = function(f) {
  return FlatMapDoubleEndedIterator.new(this, f);
};
ExactSizeAndDoubleEndedIterator.prototype.flat_map_down = function(f) {
  return FlatMap.new(this, f);
};
DoubleEndedIterator.prototype.flat_map = function(f) {
  return FlatMapDoubleEndedIterator.new(this, f);
};
DoubleEndedIterator.prototype.flat_map_down = function(f) {
  return FlatMap.new(this, f);
};
ExactSizeIterator.prototype.flat_map = function(f) {
  return FlatMap.new(this, f);
};
IteratorBase.prototype.flat_map = function(f) {
  return FlatMap.new(this, f);
};

ExactSizeAndDoubleEndedIterator.prototype.flatten = function() {
  return FlattenDoubleEndedIterator.new(this);
};
ExactSizeAndDoubleEndedIterator.prototype.flatten_down = function() {
  return Flatten.new(this);
};
DoubleEndedIterator.prototype.flatten = function() {
  return FlattenDoubleEndedIterator.new(this);
};
DoubleEndedIterator.prototype.flatten_down = function() {
  return Flatten.new(this);
};
ExactSizeIterator.prototype.flatten = function() {
  return Flatten.new(this);
};
IteratorBase.prototype.flatten = function() {
  return Flatten.new(this);
};

function panic_into_iter(class_name: string, method_name: string, item: any) {
  throw new Error(
    format(`${class_name}.${method_name}: item {:?} does not implement IntoIterator`)
  );
}
