import {
  // mixin.ts
  AnyConstructor,
  Mixin,
  // ops/try.ts
  Try,
  TryConstructor,
  // iter.ts
  IteratorBase,
  IteratorFace,
  IntoIterator,
  ImplDoubleEndedIterator,
  DoubleEndedIterator,
  DoubledEndedIteratorFace,
  isDoubleEndedIterator,
  ImplFusedIterator,
  FusedIterator,
  isFusedIterator,
  // iter_adapters.ts
  Map,
  MapForDoubleEndedIterator,
  MapFace,
  // clone.ts
  ImplClone,
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
export interface FlatMapFace<I extends IteratorFace, U extends IntoIterator>
  extends IteratorFace<U["Item"]> {
  iter: MapFace<I, U>;
  frontiter: Option<U["IntoIter"]>;
  backiter: Option<U["IntoIter"]>;
}

export class FlatMap extends ImplClone(IteratorBase) implements Debug {
  public Self!: FlatMap;

  public InnerIter!: Map;
  public Iter!: IteratorFace<IntoIterator<this["InnerIter"]["Item"], this["InnerIter"]>>;
  public Item!: this["InnerIter"]["Item"];

  public iter!: this["Iter"];
  public frontiter: Option<this["InnerIter"]>;
  public backiter: Option<this["InnerIter"]>;

  constructor(iter: IteratorBase, f: (item: any) => IntoIterator) {
    super();
    this.iter = iter.map(f);
    this.frontiter = None();
    this.backiter = None();
  }

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
    let [flo, fhi] = this.frontiter.map_or([0, Some(0)], (iter: this["InnerIter"]) =>
      iter.size_hint()
    );
    let [blo, bhi] = this.backiter.map_or([0, Some(0)], (iter: this["InnerIter"]) =>
      iter.size_hint()
    );
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
    const flatten = (acc: Acc, x: this["Iter"]["Item"]): R => {
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
    const flatten = (acc: Acc, iter: this["InnerIter"]): Acc => iter.fold(acc, f);

    return this.frontiter
      .into_iter()
      .chain(this.iter.map((x: this["Iter"]["Item"]) => x.into_iter()))
      .chain(this.backiter)
      .fold(init, flatten);
  }

  public fmt_debug(): string {
    return format("FlatMap({:?},{:?},{:?})", this.frontiter, this.backiter, this.iter);
  }
}

export const ImplFlatMapForDoubleEndedIterator = <
  T extends AnyConstructor<FlatMap & DoubleEndedIterator>
>(
  Base: T
) =>
  class FlatMapForDoubleEndedIterator extends Base {
    public Self!: FlatMapForDoubleEndedIterator;

    public InnerIter!: MapForDoubleEndedIterator;
    public Iter!: DoubledEndedIteratorFace<
      IntoIterator<this["InnerIter"]["Item"], this["InnerIter"]>
    >;

    public next_back(): Option<this["InnerIter"]["Item"]> {
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
            this.backiter = next.map((x: this["Iter"]["Item"]) => x.into_iter());
        }
      } while (true);
    }

    public try_rfold<Acc, R extends Try>(
      init: Acc,
      r: TryConstructor<R>,
      fold: (acc: Acc, item: this["Item"]) => R
    ): R {
      const flatten = (acc: Acc, x: this["Iter"]["Item"]) => {
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
      const flatten = (acc: Acc, iter: this["InnerIter"]): Acc => {
        return iter.rfold(acc, f);
      };

      return this.frontiter
        .into_iter()
        .chain(this.iter.map((x: this["Iter"]["Item"]) => x.into_iter()))
        .chain(this.backiter)
        .rfold(init, flatten);
    }
  };

export class FlatMapForDoubleEndedIterator extends ImplFlatMapForDoubleEndedIterator(
  ImplDoubleEndedIterator(FlatMap)
) {}

/**
 * An iterator that flattens one level of nesting in an iterator of things that
 * can be turned into iterators.
 */
export interface FlattenFace<U extends IntoIterator, I extends IteratorFace<U>>
  extends IteratorFace<U["Item"]> {
  iter: I;
  frontiter: Option<U["IntoIter"]>;
  backiter: Option<U["IntoIter"]>;
}

export class Flatten extends ImplClone(IteratorBase) implements Debug {
  public Self!: Flatten;

  public InnerIter!: IteratorBase;
  public Iter!: IteratorFace<IntoIterator<this["InnerIter"]["Item"], this["InnerIter"]>>;
  public Item!: this["InnerIter"]["Item"];

  public iter!: this["Iter"];
  public frontiter: Option<this["InnerIter"]>;
  public backiter: Option<this["InnerIter"]>;

  public constructor(iter: IteratorBase) {
    super();
    this.iter = iter;
    this.frontiter = None();
    this.backiter = None();
  }

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
    let [flo, fhi] = this.frontiter.map_or([0, Some(0)], (iter: this["InnerIter"]) =>
      iter.size_hint()
    );
    let [blo, bhi] = this.backiter.map_or([0, Some(0)], (iter: this["InnerIter"]) =>
      iter.size_hint()
    );
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
    const flatten = (acc: Acc, x: this["Iter"]["Item"]): R => {
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
    const flatten = (acc: Acc, iter: this["InnerIter"]): Acc => iter.fold(acc, f);

    return this.frontiter
      .into_iter()
      .chain(this.iter.map((x: this["Iter"]["Item"]) => x.into_iter()))
      .chain(this.backiter)
      .fold(init, flatten);
  }

  public fmt_debug(): string {
    return format("Flatten({:?},{:?},{:?})", this.frontiter, this.backiter, this.iter);
  }
}

export const ImplFlattenForDoubleEndedIterator = <
  T extends AnyConstructor<Flatten & DoubleEndedIterator>
>(
  Base: T
) =>
  class FlattenForDoubleEndedIterator extends Base {
    public Self!: FlattenForDoubleEndedIterator;

    public InnerIter!: DoubleEndedIterator;
    public Iter!: DoubledEndedIteratorFace<
      IntoIterator<this["InnerIter"]["Item"], this["InnerIter"]>
    >;

    public next_back(): Option<this["InnerIter"]["Item"]> {
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
            this.backiter = next.map((x: this["Iter"]["Item"]) => x.into_iter());
        }
      } while (true);
    }

    public try_rfold<Acc, R extends Try>(
      init: Acc,
      r: TryConstructor<R>,
      fold: (acc: Acc, item: this["Item"]) => R
    ): R {
      const flatten = (acc: Acc, x: this["Iter"]["Item"]) => {
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
      const flatten = (acc: Acc, iter: this["InnerIter"]): Acc => {
        return iter.rfold(acc, f);
      };

      return this.frontiter
        .into_iter()
        .chain(this.iter.map((x: this["Iter"]["Item"]) => x.into_iter()))
        .chain(this.backiter)
        .rfold(init, flatten);
    }
  };

export class FlattenForDoubleEndedIterator extends ImplFlattenForDoubleEndedIterator(
  ImplDoubleEndedIterator(Flatten)
) {}

declare module "./iter" {
  interface IteratorFace {
    /**
     * Creates an iterator that works like map, but flattens nested structure.
     */
    flat_map<Self extends DoubleEndedIterator, U>(
      this: Self,
      f: (x: Self["Item"]) => U
    ): FlatMapForDoubleEndedIterator;
    flat_map<Self extends IteratorBase, U>(this: Self, f: (x: Self["Item"]) => U): FlatMap;
    /**
     * Creates an iterator that flattens nested structure.
     */
    flatten<Self extends DoubleEndedIterator>(this: Self): FlattenForDoubleEndedIterator;
    flatten(): Flatten;
  }

  interface IteratorBase {
    flat_map<Self extends DoubleEndedIterator, U>(
      this: Self,
      f: (x: Self["Item"]) => U
    ): FlatMapForDoubleEndedIterator;
    flat_map<Self extends IteratorBase, U>(this: Self, f: (x: Self["Item"]) => U): FlatMap;

    flatten<Self extends DoubleEndedIterator>(this: Self): FlattenForDoubleEndedIterator;
    flatten(): Flatten;
  }
}

function flat_map<Self extends DoubleEndedIterator, U>(
  this: Self,
  f: (x: Self["Item"]) => U
): FlatMapForDoubleEndedIterator;
function flat_map<Self extends IteratorBase, U>(this: Self, f: (x: Self["Item"]) => U): FlatMap;
function flat_map(this: any, f: any): any {
  if (isDoubleEndedIterator(this)) {
    return new FlatMapForDoubleEndedIterator(this, f);
  } else {
    return new FlatMap(this, f);
  }
}
IteratorBase.prototype.flat_map = flat_map;

function flatten<Self extends DoubleEndedIterator>(this: Self): FlattenForDoubleEndedIterator;
function flatten(): Flatten;
function flatten(this: any): any {
  if (isDoubleEndedIterator(this)) {
    return new FlattenForDoubleEndedIterator(this);
  } else {
    return new Flatten(this);
  }
}
IteratorBase.prototype.flatten = flatten;
