import {
  isNil,
  isFunction,
  // self.ts
  Self,
  // mixin.ts
  AnyConstructor,
  Mixin,
  // default.ts
  Default,
  // clone.ts
  Clone,
  clone,
  // debug.ts
  Debug,
  format,
  // num.ts
  NumberStatic,
  NumberConstructor,
  // try.ts
  ImplTry,
  Try,
  TryFace,
  TryConstructor,
  // option.ts
  Option,
  OptionType,
  OptionStatic,
  OptionConstructor,
  Some,
  None,
  // result.ts
  Result,
  ResultType,
  ResultStatic,
  ResultConstructor,
  Ok,
  Err,
  // cmpt.ts
  ImplPartialEq,
  Ord,
  Ordering,
  Less,
  Equal,
  Greater,
  cmp,
  partial_cmp,
  eq,
  ne,
  le,
  gt,
  max,
  max_by,
  min,
  min_by,
  // macros.ts
  abstract_panic,
  assert_eq,
  U64_MAX,
  u64,
  add,
  mul
} from "./internal";

export abstract class IteratorCommon<T = any> extends Self {
  public Item!: T;

  public abstract next(): Option<this["Item"]>;

  public [Symbol.iterator](): Iterator<this["Item"]> {
    let self = this;
    return {
      next: (): IteratorResult<this["Item"]> => {
        let match = self.next().match();
        switch (match.type) {
          case OptionType.Some:
            return {
              done: false,
              value: match.value
            };
          case OptionType.None:
            return {
              done: true,
              value: (undefined as unknown) as this["Item"]
            };
        }
      }
    };
  }

  public size_hint(): [number, Option<number>] {
    return [0, None()];
  }

  public count(): number {
    return this.fold(0, (cnt: number, _: any) => cnt + 1);
  }

  public last(): Option<this["Item"]> {
    let last: Option<this["Item"]> = None();
    for (let x of this) {
      last = Some(x);
    }
    return last;
  }

  public nth(n: number): Option<this["Item"]> {
    n = u64(n);
    for (let x of this) {
      if (n === 0) {
        return Some(x);
      }
      n -= 1;
    }
    return None();
  }

  public for_each(f: (item: this["Item"]) => void) {
    this.fold(undefined as void, (_: void, item: this["Item"]) => f(item));
  }

  public collect<B extends FromIterator<this["Item"]>>(b: B): B;
  public collect(): this["Item"][];
  public collect(b?: any): any {
    if (b && isFromIterator(b)) {
      return b.from_iter(this);
    } else {
      let array: this["Item"][] = [];
      for (let item of this) {
        array.push(item);
      }
      return array;
    }
  }

  public partition<B extends Extend<this["Item"]>>(
    f: (item: this["Item"]) => boolean,
    t: Default<B>
  ): [B, B];
  public partition(f: (item: this["Item"]) => boolean): [this["Item"][], this["Item"][]];
  public partition<B extends Extend<this["Item"]>>(
    f: (item: this["Item"]) => boolean,
    t?: Default<B>
  ): any {
    const partition = <B extends Extend<this["Item"]>>(left: B, right: B): [B, B] => {
      this.for_each((item: this["Item"]) => {
        if (f(item)) {
          left.extend(Some(item));
        } else {
          right.extend(Some(item));
        }
      });
      return [left, right];
    };

    if (t) {
      let left = t.default();
      let right = t.default();
      return partition(left, right);
    } else {
      let left: this["Item"][] = [];
      let right: this["Item"][] = [];
      return partition(left, right);
    }
  }

  // FIXME: this function doesn't actually do anything in javascript, because we
  // can't swap memory. Is there a way to make something like this work?
  // public partition_in_place<Self extends DoubleEndedIterator>(predicate: (item: this["Item"]) => boolean): number {
  //   let true_count = 0;
  //   const is_false = (x: this["Item"]) => {
  //     let p = predicate(x);
  //     true_count += p;
  //     return !p;
  //   }
  //
  //   const is_true = (x: this["Item"]) => predicate(x);
  //
  //   let find = this.find(is_false)
  //   while (find.is_some()) {
  //     let head = find.unwrap();
  //     let rfind = this.rfind(is_true)
  //     if (rfind.is_some()) {
  //       let tail = rfind.unwrap();
  //       swap(head, tail);
  //       true_count += 1
  //     } else {
  //       break;
  //     }
  //     let find = this.find(is_false)
  //   }
  //   return true_count;
  // }

  public is_partitioned(predicate: (x: this["Item"]) => boolean): boolean {
    // Either all items test `true` or the first clause stops at `false`
    // and we check that there are no more `true` items after that.
    return this.all(predicate) || !this.any(predicate);
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;

    let next = this.next();
    while (next.is_some()) {
      let try_acc = f(acc, next.unwrap());
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
      next = this.next();
    }
    return r.from_okay(acc);
  }

  public try_for_each<R extends Try>(r: TryConstructor<R>, f: (x: this["Item"]) => R): R {
    return this.try_fold(undefined, r, (_: undefined, x: this["Item"]) => f(x));
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, x: this["Item"]) => Acc): Acc {
    return this.try_fold<Acc, Result<Acc, void>>(init, Result, (acc: Acc, x: this["Item"]) =>
      Ok(f(acc, x))
    ).unwrap();
  }

  public all(f: (x: this["Item"]) => boolean): boolean {
    return this.try_for_each<LoopState<undefined, undefined>>(LoopState, (x: this["Item"]) => {
      if (f(x)) {
        return Continue(undefined);
      } else {
        return Break(undefined);
      }
    }).eq(Continue(undefined));
  }

  public any(f: (x: this["Item"]) => boolean): boolean {
    return this.try_for_each<LoopState<undefined, undefined>>(LoopState, (x: this["Item"]) => {
      if (f(x)) {
        return Break(undefined);
      } else {
        return Continue(undefined);
      }
    }).eq(Break(undefined));
  }

  public find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    return this.try_for_each<LoopState<undefined, this["Item"]>>(LoopState, (x: this["Item"]) => {
      if (predicate(x)) {
        return Break(x);
      } else {
        return Continue(undefined);
      }
    }).break_value();
  }

  public find_map<B>(f: (x: this["Item"]) => Option<B>): Option<B> {
    return this.try_for_each<LoopState<undefined, B>>(LoopState, (x: this["Item"]) => {
      let match = f(x).match();
      switch (match.type) {
        case OptionType.Some:
          return Break(match.value);
        case OptionType.None:
          return Continue(undefined);
      }
    }).break_value();
  }

  public position(predicate: (x: this["Item"]) => boolean): Option<number> {
    return this.try_fold<number, LoopState<number, number>>(
      0,
      LoopState,
      (i: number, x: this["Item"]) => {
        if (predicate(x)) {
          return Break(i);
        } else {
          return Continue(i + 1);
        }
      }
    ).break_value();
  }

  public max(): Option<this["Item"]> {
    return this.max_by(cmp);
  }

  public min(): Option<this["Item"]> {
    return this.min_by(cmp);
  }

  public max_by(compare: (x: this["Item"], y: this["Item"]) => Ordering): Option<this["Item"]> {
    const fold = (x: T, y: T) => max_by<T>(x, y, compare);
    return fold1<T, this>(this, fold);
  }

  public min_by(compare: (x: this["Item"], y: this["Item"]) => Ordering): Option<this["Item"]> {
    const fold = (x: T, y: T) => min_by<T>(x, y, compare);
    return fold1<T, this>(this, fold);
  }

  public abstract step_by(n: number): any;

  public abstract chain<U extends IntoIterator<T>>(other: U): any;

  public abstract zip(other: any): any;

  public abstract map<B>(f: (x: T) => B): any;

  public abstract filter(predicate: (item: T) => boolean): any;

  public abstract filter_map<B>(f: (item: T) => Option<B>): any;

  public abstract enumerate(): any;

  public abstract peekable(): any;

  public abstract skip_while(predicate: (item: T) => boolean): any;

  public abstract take_while(predicate: (item: T) => boolean): any;

  public abstract skip(n: number): any;

  public abstract take(n: number): any;

  public abstract scan<St, B>(initial_state: St, f: (st: St, item: T) => Option<B>): any;

  // fuse<Self extends FusedIterator & ExactSizeIterator & DoubleEndedIterator>(
  //   this: Self
  // ): FuseForExactSizeAndDoubleEndedIterator;
  // fuse<Self extends FusedIterator & ExactSizeIterator>(
  //   this: Self
  // ): FuseForExactSizeAndDoubleEndedIterator;
  // fuse<Self extends FusedIterator & DoubleEndedIterator>(
  //   this: Self
  // ): FuseForExactSizeAndDoubleEndedIterator;
  // fuse<Self extends ExactSizeIterator & DoubleEndedIterator>(
  //   this: Self
  // ): FuseForExactSizeAndDoubleEndedIterator;
  // fuse<Self extends ExactSizeIterator>(this: Self): FuseForExactSizeIterator;
  // fuse<Self extends DoubleEndedIterator>(this: Self): FuseForDoubleEndedIterator;
  // fuse<Self extends FusedIterator>(this: Self): FuseForFusedIterator;
  // fuse(): FuseForIterator;

  public abstract inspect(f: (x: T) => void): any;

  public abstract cloned(): any;

  public abstract cycle<Self extends IteratorCommon<T> & Clone>(this: Self): any;

  public unzip<
    A,
    B,
    FromA extends Extend<A>,
    FromB extends Extend<B>,
    Self extends IteratorCommon<[A, B]>
  >(this: Self, a: Default<FromA>, b: Default<FromB>): [FromA, FromB] {
    let ts = a.default();
    let us = b.default();

    this.for_each(([t, u]) => {
      ts.extend(Some(t));
      us.extend(Some(u));
    });

    return [ts, us];
  }

  public sum(r: Sum<this["Item"]>, ...inner_rs: Sum<any>[]): this["Item"] {
    return r.sum(this, ...inner_rs);
  }

  public product(r: Product<this["Item"]>, ...inner_rs: Product<any>[]): this["Item"] {
    return r.product(this, ...inner_rs);
  }

  public cmp<I extends IntoIterator<this["Item"]>>(other: I): Ordering {
    let iter = other.into_iter();

    do {
      let x: this["Item"];
      let match_x = this.next().match();
      switch (match_x.type) {
        case OptionType.None: {
          if (iter.next().is_none()) {
            return Equal;
          } else {
            return Less;
          }
        }
        case OptionType.Some:
          x = match_x.value;
      }

      let y: this["Item"];
      let match_y = iter.next().match();
      switch (match_y.type) {
        case OptionType.None:
          return Greater;
        case OptionType.Some:
          y = match_y.value;
      }

      // NOTE: ignoring `Variable '_' is used before being assigned.`
      // @ts-ignore
      let ord = cmp(x, y);
      if (ord.ne(Equal)) {
        return ord;
      }
    } while (true);
  }

  public partial_cmp<I extends IntoIterator>(other: I): Option<Ordering> {
    let iter = other.into_iter();

    do {
      let x: this["Item"];
      let match_x = this.next().match();
      switch (match_x.type) {
        case OptionType.None: {
          if (iter.next().is_none()) {
            return Some(Equal);
          } else {
            return Some(Less);
          }
        }
        case OptionType.Some:
          x = match_x.value;
      }

      let y: this["Item"];
      let match_y = iter.next().match();
      switch (match_y.type) {
        case OptionType.None:
          return Some(Greater);
        case OptionType.Some:
          y = match_y.value;
      }

      // NOTE: ignoring `Variable '_' is used before being assigned.`
      // @ts-ignore
      let ord = partial_cmp(x, y);
      if (ord.ne(Some(Equal))) {
        return ord;
      }
    } while (true);
  }

  public eq<I extends IntoIterator<this["Item"]>>(other: I): boolean;
  public eq(other: this["Self"]): boolean;
  public eq(other: any): boolean {
    let iter: IteratorCommon<this["Item"]>;
    if (isIntoIterator<this["Item"]>(other)) {
      iter = other.into_iter();
    } else {
      iter = other;
    }

    do {
      let x: this["Item"];
      let match_x = this.next().match();
      switch (match_x.type) {
        case OptionType.None: {
          return iter.next().is_none();
        }
        case OptionType.Some:
          x = match_x.value;
      }

      let y: this["Item"];
      let match_y = iter.next().match();
      switch (match_y.type) {
        case OptionType.None:
          return false;
        case OptionType.Some:
          y = match_y.value;
      }

      // NOTE: ignoring `Variable '_' is used before being assigned.`
      // @ts-ignore
      if (ne(x, y)) {
        return false;
      }
    } while (true);
  }

  public ne<I extends IntoIterator<this["Item"]>>(other: I): boolean {
    return !this.eq(other);
  }

  public lt<I extends IntoIterator<this["Item"]>>(other: I): boolean {
    return this.partial_cmp(other).eq(Some(Less));
  }

  public le<I extends IntoIterator<this["Item"]>>(other: I): boolean {
    let comp = this.partial_cmp(other);
    return comp.eq(Some(Less)) || comp.eq(Some(Equal));
  }

  public gt<I extends IntoIterator<this["Item"]>>(other: I): boolean {
    return this.partial_cmp(other).eq(Some(Greater));
  }

  public ge<I extends IntoIterator<this["Item"]>>(other: I): boolean {
    let comp = this.partial_cmp(other);
    return comp.eq(Some(Greater)) || comp.eq(Some(Equal));
  }

  public is_sorted(): boolean {
    return this.is_sorted_by((a: this["Item"], b: this["Item"]) => partial_cmp(a, b));
  }

  public is_sorted_by(compare: (x: this["Item"], y: this["Item"]) => Option<Ordering>): boolean {
    let opt_last = this.next();
    if (opt_last.is_none()) {
      return true;
    }
    let last = opt_last.unwrap();

    let next = this.next();
    while (next.is_some()) {
      let curr = next.unwrap();
      if (
        compare(last, curr)
          .map((o: Ordering) => o.eq(Greater))
          .unwrap_or(true)
      ) {
        return false;
      }
      last = curr;
      next = this.next();
    }

    return true;
  }

  public is_sorted_by_key<K>(f: (x: this["Item"]) => K): boolean {
    return this.is_sorted_by((a: this["Item"], b: this["Item"]) => partial_cmp(f(a), f(b)));
  }

  // IntoIterator
  public IntoIter!: this["Self"];

  public into_iter(): this["IntoIter"] {
    return this;
  }
}

export class IteratorBase<T = any> extends IteratorCommon<T> {
  public isIteratorBase = true;

  public Item!: any;

  public next(): Option<this["Item"]> {
    abstract_panic("IteratorBase", "next");
    return (undefined as unknown) as Option<this["Item"]>;
  }
}

export function isIteratorBase(t: any): t is IteratorBase {
  return !isNil(t) && (t as IteratorBase).isIteratorBase === true;
}

export abstract class DoubleEndedIteratorCommon<T = any> extends IteratorCommon<T> {
  public abstract next_back(): Option<this["Item"]>;

  public abstract nth_back(n: number): Option<this["Item"]>;

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;
    let next = this.next_back();
    while (next.is_some()) {
      let try_acc = f(acc, next.unwrap());
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
      next = this.next_back();
    }
    return r.from_okay(acc);
  }

  public rfold<Acc>(acc: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    return this.try_rfold<Acc, Result<Acc, void>>(acc, Result, (acc: Acc, x: this["Item"]) =>
      Ok(f(acc, x))
    ).unwrap();
  }

  public rfind(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    return this.try_rfold<undefined, LoopState<undefined, this["Item"]>>(
      undefined,
      LoopState,
      (_: undefined, x: this["Item"]) => {
        if (predicate(x)) {
          return Break(x);
        } else {
          return Continue(undefined);
        }
      }
    ).break_value();
  }

  public abstract rev(): any;
}

export class DoubleEndedIterator<T = any> extends DoubleEndedIteratorCommon<T> {
  public isDoubleEndedIterator = true;

  // Iterator
  public Item!: any;

  public next(): Option<this["Item"]> {
    abstract_panic("DoubleEndedIterator", "next");
    return (undefined as unknown) as Option<this["Item"]>;
  }

  public next_back(): Option<this["Item"]> {
    abstract_panic("DoubleEndedIterator", "next_back");
    return (undefined as unknown) as Option<this["Item"]>;
  }

  // DoubleEndedIteratorCommon
  public nth_back(n: number): Option<this["Item"]> {
    n = u64(n);
    for (let x of this.rev()) {
      if (n === 0) {
        return Some(x);
      }
      n -= 1;
    }
    return None();
  }
}

export function isDoubleEndedIterator(t: any): t is DoubleEndedIterator {
  return !isNil(t) && (t as DoubleEndedIterator).isDoubleEndedIterator === true;
}

export class ExactSizeIterator<T = any> extends IteratorCommon<T> {
  public isExactSizeIterator = true;

  // Iterator
  public Item!: any;

  public next(): Option<this["Item"]> {
    abstract_panic("ExactSizeIterator", "next");
    return (undefined as unknown) as Option<this["Item"]>;
  }

  public len(): number {
    let [lower, upper] = this.size_hint();
    assert_eq(upper, Some(lower));
    return lower;
  }

  public is_empty(): boolean {
    return this.len() === 0;
  }
}

export function isExactSizeIterator(t: any): t is ExactSizeIterator {
  return !isNil(t) && (t as ExactSizeIterator).isExactSizeIterator === true;
}

export class ExactSizeAndDoubleEndedIterator<T = any> extends DoubleEndedIteratorCommon<T> {
  public isExactSizeAndDoubleEndedIterator = true;

  // Iterator
  public Item!: any;

  public next(): Option<this["Item"]> {
    abstract_panic("ExactSizeAndDoubleEndedIterator", "next");
    return (undefined as unknown) as Option<this["Item"]>;
  }

  public next_back(): Option<this["Item"]> {
    abstract_panic("ExactSizeAndDoubleEndedIterator", "next_back");
    return (undefined as unknown) as Option<this["Item"]>;
  }

  public rposition(predicate: (x: this["Item"]) => boolean): Option<number> {
    let n = this.len();
    return this.try_rfold<number, LoopState<number, number>>(
      n,
      LoopState,
      (i: number, x: this["Item"]) => {
        i = i - 1;
        if (predicate(x)) {
          return Break(i);
        } else {
          return Continue(i);
        }
      }
    ).break_value();
  }

  // DoubleEndedIteratorCommon
  public nth_back(n: number): Option<this["Item"]> {
    n = u64(n);
    for (let x of this.rev()) {
      if (n === 0) {
        return Some(x);
      }
      n -= 1;
    }
    return None();
  }

  // ExactSizeIterator
  public len(): number {
    let [lower, upper] = this.size_hint();
    assert_eq(upper, Some(lower));
    return lower;
  }

  public is_empty(): boolean {
    return this.len() === 0;
  }
}

export function isExactSizeAndDoubleEndedIterator(t: any): t is ExactSizeAndDoubleEndedIterator {
  return (
    !isNil(t) && (t as ExactSizeAndDoubleEndedIterator).isExactSizeAndDoubleEndedIterator === true
  );
}

export interface FromIterator<Item> extends Self {
  // Creates a value from an iterator.
  from_iter<T extends IntoIterator<Item>>(iter: T): this["Self"];
}

export function isFromIterator<Item>(t: any): t is FromIterator<Item> {
  return !isNil(t) && isFunction((t as FromIterator<Item>).from_iter);
}

export interface IntoIterator<
  Item = any,
  IntoIter extends IteratorCommon<Item> = IteratorCommon<Item>
> {
  // The type of the elements being iterated over.
  Item: Item;

  // Which kind of iterator are we turning this into?
  IntoIter: IntoIter;

  // Creates an iterator from a value.
  into_iter(): this["IntoIter"];
}

export function isIntoIterator<Item, IntoIter extends IteratorCommon<Item> = IteratorCommon<Item>>(
  t: any
): t is IntoIterator<Item, IntoIter> {
  return !isNil(t) && isFunction((t as IntoIterator<Item, IntoIter>).into_iter);
}

/**
 * Trait to represent types that can be created by summing up an iterator.
 */
export interface Sum<R> extends Self {
  sum<I extends IteratorCommon<R>>(iter: I, r?: Sum<any>, ...inner_rs: Sum<any>[]): this["Self"];
}

/**
 * Trait to represent types that can be created by multiplying elements of an
 * iterator.
 */
export interface Product<R> extends Self {
  product<I extends IteratorCommon<R>>(
    iter: I,
    r?: Product<any>,
    ...inner_rs: Product<any>[]
  ): this["Self"];
}

declare module "./number" {
  interface NumberStatic {
    sum<I extends IteratorCommon<number>>(iter: I, ...inner_rs: Sum<any>[]): number;
    product<I extends IteratorCommon<number>>(iter: I, ...inner_rs: Product<any>[]): number;
  }
}

NumberConstructor.sum = function<I extends IteratorCommon<number>>(
  iter: I,
  ..._inner_rs: Sum<any>[]
): number {
  return iter.fold(0, add);
};

NumberConstructor.product = function<I extends IteratorCommon<number>>(
  iter: I,
  ..._inner_rs: Product<any>[]
): number {
  return iter.fold(1, mul);
};

export interface Extend<Item> {
  // Extends a collection with the contents of an iterator.
  extend<I extends IntoIterator<Item>>(iter: I): void;
}

/**
 * An iterator that always continues to yield `None` when exhausted.
 */
// export const ImplFusedIterator = <T extends AnyConstructor<IteratorCommon>>(Base: T) =>
//   class FusedIterator extends Base {
//     public isFusedIterator = true;
//   };
//
// export type FusedIterator = Mixin<typeof ImplFusedIterator>;
//
// export function isFusedIterator(i: any): i is FusedIterator {
//   return typeof i === "object" && i !== null && (i as FusedIterator).isFusedIterator;
// }

/**
 * An iterator that reports an accurate length using size_hint.
 *
 * This trait must only be implements when the contract is upheld.
 * Consumers of this trait must inspect [`.size_hint`]'s upper bound.
 */
// export const ImplTrustedLen = <T extends AnyConstructor<IteratorCommon>>(Base: T) =>
//   class TrustedLen extends Base {};
//
// export type TrustedLen = Mixin<typeof ImplTrustedLen>;

/**
 * An iterator whose items are random accessible efficiently
 */
// export const ImplTrustedRandomAccess = <T extends AnyConstructor<ExactSizeIterator>>(Base: T) =>
//   class TrustedRandomAccess extends Base {
//     public get_unchecked(i: number): this["Item"] {
//       abstract_panic("TrustedRandomAccess", "get_unchecked");
//       // Unreachable code
//       return (undefined as unknown) as this["Item"];
//     }
//
//     public may_have_side_effect(): boolean {
//       abstract_panic("TrustedRandomAccess", "may_have_side_effect");
//       // Unreachable code
//       return false;
//     }
//   };
//
// export type TrustedRandomAccess = Mixin<typeof ImplTrustedRandomAccess>;

export class ProcessResults<T, E, I extends IteratorCommon<Result<T, E>>> extends IteratorBase<T>
  implements Debug {
  public Self!: ProcessResults<T, E, I>;

  public iter: I;
  public error: Result<undefined, E>;

  public constructor(iter: I, error: Result<undefined, E>) {
    super();
    this.iter = iter;
    this.error = error;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    let opt_match = this.iter.next().match();
    switch (opt_match.type) {
      case OptionType.Some: {
        let res_match = opt_match.value.match();
        switch (res_match.type) {
          case ResultType.Ok:
            return Some(res_match.value);
          case ResultType.Err: {
            this.error.clone_from(Err(res_match.value));
            return None();
          }
        }
      }
      case OptionType.None:
        return None();
    }
  }

  public size_hint(): [number, Option<number>] {
    let [_, hi] = this.iter.size_hint();
    return [0, hi];
  }

  public fmt_debug(): string {
    return format("ProcessResults({:?},{:?})", this.error, this.iter);
  }
}

export function process_results<T, E, I extends IntoIterator<Result<T, E>>, R>(
  iterable: I,
  processor: (result: ProcessResults<T, E, I["IntoIter"]>) => R
): Result<R, E> {
  let iter = iterable.into_iter();
  let error: Result<undefined, E> = Ok(undefined);

  let result = processor(new ProcessResults<T, E, I["IntoIter"]>(iter, error));

  return error.map(() => result);
}

/**
 * Creates an iterator that endlessly repeats a single element.
 */
export function repeat<T>(element: T): Repeat<T> {
  return new Repeat(element);
}

/**
 * An interator that repeats an element endlessly.
 */
export class Repeat<T> extends DoubleEndedIterator<T> implements Debug {
  public Self!: Repeat<T>;

  public element: T;

  public constructor(element: T) {
    super();
    this.element = element;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return Some(clone(this.element));
  }

  public size_hint(): [number, Option<number>] {
    return [U64_MAX, None()];
  }

  public next_back(): Option<this["Item"]> {
    return Some(clone(this.element));
  }

  public fmt_debug(): string {
    return format("Repeat({:?})", this.element);
  }
}

/**
 * Creates an iterator that repeats elements of type `T` endlessly by
 * applying the provided closure, the repeater, `() => T`.
 */
export function repeat_with<T>(repeater: () => T): RepeatWith<T> {
  return new RepeatWith(repeater);
}

/**
 * An interator that repeats an element of type `T` endlessly by
 * applying the provided closure `() => T`.
 */
export class RepeatWith<T> extends IteratorBase<T> implements Debug {
  public Self!: RepeatWith<T>;

  public repeater: () => T;

  public constructor(repeater: () => T) {
    super();
    this.repeater = repeater;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return Some(this.repeater());
  }

  public size_hint(): [number, Option<number>] {
    return [U64_MAX, None()];
  }

  public fmt_debug(): string {
    return format("RepeatWith({:?})", this.repeater);
  }
}

/**
 * Creates an iterator that yields nothing.
 */
export function empty<T>(): Empty<T> {
  return new Empty();
}

/**
 * An interator that yields nothing.
 */
export class Empty<T> extends ExactSizeAndDoubleEndedIterator<T> implements Debug {
  public Self!: Empty<T>;

  public constructor() {
    super();
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return None();
  }

  public size_hint(): [number, Option<number>] {
    return [0, Some(0)];
  }

  public next_back(): Option<this["Item"]> {
    return None();
  }

  public len(): number {
    return 0;
  }

  // Default
  public static default() {
    return new Empty();
  }

  // Clone
  public clone(): Empty<T> {
    return new Empty();
  }

  public fmt_debug(): string {
    return format("Empty");
  }
}

/**
 * Creates an iterator that yields an elements exactly once.
 */
export function once<T>(value: T): Once<T> {
  return new Once(Some(value).into_iter());
}

/**
 * An interator that yields an element exactly once.
 */
export class Once<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone, Debug {
  public Self!: Once<T>;

  private inner: OptionIntoIter<T>;

  public constructor(inner: OptionIntoIter<T>) {
    super();
    this.inner = inner;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  public next_back(): Option<this["Item"]> {
    return this.inner.next_back();
  }

  public len(): number {
    return this.inner.len();
  }

  // Clone
  public clone(): Once<T> {
    return new Once(this.inner.clone());
  }

  public fmt_debug(): string {
    return format("Once({:?})", this.inner);
  }
}

/**
 * Creates an iterator that yields a single element of type `T` by applying the
 * provided closure `() => T`.
 */
export function once_with<T>(gen: () => T): OnceWith<T> {
  return new OnceWith(Some(gen));
}

/**
 * An iterator that yields a single element of type `T` by applying the provided
 * closure `() => T`.
 */
export class OnceWith<T> extends ExactSizeAndDoubleEndedIterator<T> implements Debug {
  public Self!: OnceWith<T>;

  private gen: Option<() => T>;

  public constructor(gen: Option<() => T>) {
    super();
    this.gen = gen;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return this.gen.take().map((f: () => T) => f());
  }

  public size_hint(): [number, Option<number>] {
    return this.gen.iter().size_hint();
  }

  public next_back(): Option<this["Item"]> {
    return this.next();
  }

  public len(): number {
    return this.gen.iter().len();
  }

  public fmt_debug(): string {
    return format("OnceWith({:?})", this.gen);
  }
}

/**
 * Creates an iterator where each iteration calls the provided closure
 * `() => Option<T>`
 */
export function from_fn<T>(f: () => Option<T>): FromFn<T> {
  return new FromFn(f);
}

/**
 * An iterator where each iteration calls the provided closure `() => Option<T>`
 */
export class FromFn<T> extends IteratorBase<T> implements Debug {
  public Self!: FromFn<T>;

  public f: () => Option<T>;

  public constructor(f: () => Option<T>) {
    super();
    this.f = f;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return this.f();
  }

  public fmt_debug(): string {
    return format("FromFn({:?})", this.f);
  }
}

/**
 * Creates an iterator where each successive item is computed based on the
 * preceding one.
 */
export function successors<T>(first: Option<T>, succ: (t: T) => Option<T>): Successors<T> {
  return new Successors(first, succ);
}

/**
 * An iterator where each successive item is computed based on the preceding one.
 */
export class Successors<T> extends IteratorBase<T> implements Debug {
  public Self!: Successors<T>;

  private first: Option<T>;
  private succ: (t: T) => Option<T>;

  public constructor(first: Option<T>, succ: (t: T) => Option<T>) {
    super();
    this.first = first;
    this.succ = succ;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    return this.first.take().map((item: this["Item"]) => {
      this.first = this.succ(item);
      return item;
    });
  }

  public size_hint(): [number, Option<number>] {
    if (this.first.is_some()) {
      return [1, None()];
    } else {
      return [0, Some(0)];
    }
  }

  public fmt_debug(): string {
    return format("Successors({:?})", this.first);
  }
}

export enum LoopStateType {
  Continue = "Continue",
  Break = "Break"
}

export type Continue<C> = { type: LoopStateType.Continue; value: C };
export type Break<B> = { type: LoopStateType.Break; value: B };

export function ContinueVariant<C>(value: C): Continue<C> {
  return {
    type: LoopStateType.Continue,
    value
  };
}

export function BreakVariant<B>(value: B): Break<B> {
  return {
    type: LoopStateType.Break,
    value
  };
}

export type LoopStateVariant<C, B> = Continue<C> | Break<B>;

export class LoopState<C, B> extends ImplTry(ImplPartialEq(Self)) {
  public Self!: LoopState<C, B>;

  public payload: LoopStateVariant<C, B>;

  public constructor(payload: LoopStateVariant<C, B>) {
    super();
    this.payload = payload;
  }

  public static continue<C = any, B = undefined>(v: C): LoopState<C, B> {
    return new LoopState(ContinueVariant(v));
  }

  public static break<C = undefined, B = any>(v: B): LoopState<C, B> {
    return new LoopState(BreakVariant(v));
  }

  public break_value(): Option<B> {
    switch (this.payload.type) {
      case LoopStateType.Continue:
        return None();
      case LoopStateType.Break:
        return Some(this.payload.value);
    }
  }

  public static from_try<R extends Try>(r: R): LoopState<R["Okay"], R> {
    let res_match = r.into_result().match();
    switch (res_match.type) {
      case ResultType.Ok:
        return Continue(res_match.value);
      case ResultType.Err:
        return Break(r);
    }
  }

  public into_try<R extends Try, Self extends LoopState<R["Okay"], R>>(
    this: Self,
    r: TryConstructor<R>
  ): R {
    switch (this.payload.type) {
      case LoopStateType.Continue:
        return r.from_okay(this.payload.value);
      case LoopStateType.Break:
        return this.payload.value;
    }
  }

  // Try
  public Okay!: C;
  public Error!: B;

  public is_error(): boolean {
    switch (this.payload.type) {
      case LoopStateType.Continue:
        return false;
      case LoopStateType.Break:
        return true;
    }
  }

  public unwrap(): this["Okay"] {
    switch (this.payload.type) {
      case LoopStateType.Continue:
        return this.payload.value;
      case LoopStateType.Break:
        throw new Error("called `LoopState.unwrap()` on a `Break` value");
    }
  }

  public into_result(): Result<this["Okay"], this["Error"]> {
    switch (this.payload.type) {
      case LoopStateType.Continue:
        return Ok(this.payload.value);
      case LoopStateType.Break:
        return Err(this.payload.value);
    }
  }

  public static from_okay<C = any, B = undefined>(v: C): LoopState<C, B> {
    return new LoopState(ContinueVariant(v));
  }

  public static from_error<C = undefined, B = any>(v: B): LoopState<C, B> {
    return new LoopState(BreakVariant(v));
  }

  // PartialEq
  public eq(other: LoopState<C, B>): boolean {
    // TODO optimize this
    return this.into_result().eq(other.into_result());
  }
}

export function Continue<C = any, B = undefined>(payload: C): LoopState<C, B> {
  return LoopState.continue<C, B>(payload);
}

export function Break<C = undefined, B = any>(payload: B): LoopState<C, B> {
  return LoopState.break<C, B>(payload);
}

declare module "./cmp_option_result" {
  interface Option<T> {
    iter(): OptionIter<T>;
    [Symbol.iterator](): Iterator<T>;

    // IntoIterator
    Item: T;
    IntoIter: OptionIntoIter<T>;

    into_iter(): OptionIntoIter<T>;
  }

  interface OptionStatic {
    sum<I extends IteratorCommon<Option<any>>>(
      iter: I,
      r: Sum<any>,
      ...inner_rs: Sum<any>[]
    ): this["Self"];
    product<I extends IteratorCommon<Option<any>>>(
      iter: I,
      r: Product<any>,
      ...inner_rs: Product<any>[]
    ): this["Self"];
  }

  interface Result<T, E> {
    iter(): ResultIter<T>;
    [Symbol.iterator](): Iterator<T>;

    // IntoIterator
    Item: T;
    IntoIter: ResultIntoIter<T>;

    into_iter(): ResultIntoIter<T>;
  }

  interface ResultStatic {
    sum<I extends IteratorCommon<Result<any, any>>>(
      iter: I,
      r: Sum<any>,
      ...inner_rs: Sum<any>[]
    ): this["Self"];
    product<I extends IteratorCommon<Result<any, any>>>(
      iter: I,
      r: Product<any>,
      ...inner_rs: Product<any>[]
    ): this["Self"];
  }
}

Option.prototype.iter = function() {
  return new OptionIter(new OptionItem(this));
};
Option.prototype.into_iter = function() {
  return new OptionIntoIter(new OptionItem(this));
};
Option.prototype[Symbol.iterator] = function() {
  return this.iter()[Symbol.iterator]();
};

OptionConstructor.sum = function(iter, r, ...inner_rs) {
  // FIXME
  // @ts-ignore
  return iter
    .map(x => x.ok_or(undefined))
    .sum(ResultConstructor, r, ...inner_rs)
    .ok();
};

OptionConstructor.product = function(iter, r, ...inner_rs) {
  // FIXME
  // @ts-ignore
  return iter
    .map(x => x.ok_or(undefined))
    .product(ResultConstructor, r, ...inner_rs)
    .ok();
};

class OptionItem<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone {
  public Self!: OptionItem<T>;

  private opt: Option<T>;

  constructor(opt: Option<T>) {
    super();
    this.opt = opt.clone();
  }

  // Iterator
  public Item!: T;

  public next(): Option<T> {
    return this.opt.take();
  }

  public size_hint(): [number, Option<number>] {
    let match = this.opt.match();
    switch (match.type) {
      case OptionType.Some:
        return [1, Some(1)];
      case OptionType.None:
        return [0, Some(0)];
    }
  }

  // DoubleEndedIterator
  public next_back(): Option<T> {
    return this.opt.take();
  }

  // Clone
  public clone(): this["Self"] {
    return new OptionItem(this.opt.clone());
  }
}

class OptionIter<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone {
  public Self!: OptionIter<T>;

  private inner: OptionItem<T>;

  constructor(inner: OptionItem<T>) {
    super();
    this.inner = inner;
  }

  // Iterator
  public Item!: T;

  public next(): Option<T> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  // DoubleEndedIterator
  public next_back(): Option<T> {
    return this.inner.next_back();
  }

  // Clone
  public clone(): this["Self"] {
    return new OptionIter(this.inner.clone());
  }
}

class OptionIntoIter<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone {
  public Self!: OptionIntoIter<T>;

  private inner: OptionItem<T>;

  constructor(inner: OptionItem<T>) {
    super();
    this.inner = inner;
  }

  // Iterator
  public Item!: T;

  public next(): Option<T> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  // DoubleEndedIterator
  public next_back(): Option<T> {
    return this.inner.next_back();
  }

  // Clone
  public clone(): this["Self"] {
    return new OptionIntoIter(this.inner.clone());
  }
}

Result.prototype.iter = function() {
  return new ResultIter(new OptionItem(this.ok()));
};
Result.prototype.into_iter = function() {
  return new ResultIntoIter(new OptionItem(this.ok()));
};
Result.prototype[Symbol.iterator] = function() {
  return this.iter()[Symbol.iterator]();
};

ResultConstructor.sum = function(iter, r, ...inner_rs) {
  // FIXME
  // @ts-ignore
  return process_results(iter, i => i.sum(r, ...inner_rs.slice(1)));
};
ResultConstructor.product = function(iter, r, ...inner_rs) {
  // FIXME
  // @ts-ignore
  return process_results(iter, i => i.product(r, ...inner_rs.slice(1)));
};

class ResultIter<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone {
  public Self!: ResultIter<T>;

  private inner: OptionItem<T>;

  constructor(inner: OptionItem<T>) {
    super();
    this.inner = inner;
  }

  // Iterator
  public Item!: T;

  public next(): Option<T> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  // DoubleEndedIterator
  public next_back(): Option<T> {
    return this.inner.next_back();
  }

  // Clone
  public clone(): this["Self"] {
    return new ResultIter(this.inner.clone());
  }
}

class ResultIntoIter<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone {
  public Self!: ResultIntoIter<T>;

  private inner: OptionItem<T>;

  constructor(inner: OptionItem<T>) {
    super();
    this.inner = inner;
  }

  // Iterator
  public Item!: T;

  public next(): Option<T> {
    return this.inner.next();
  }

  public size_hint(): [number, Option<number>] {
    return this.inner.size_hint();
  }

  // DoubleEndedIterator
  public next_back(): Option<T> {
    return this.inner.next_back();
  }

  // Clone
  public clone(): this["Self"] {
    return new ResultIntoIter(this.inner.clone());
  }
}

export class ArrayIntoIter<T> extends ExactSizeAndDoubleEndedIterator<T> implements Clone, Debug {
  public Self!: ArrayIntoIter<T>;

  private buf: Array<T>;
  private pos: number;
  private end: number;

  constructor(buf: Array<T>) {
    super();
    this.buf = buf;
    this.pos = 0;
    this.end = buf.length;
  }

  // Debug
  public fmt_debug(): string {
    return format("ArrayIntoIter({:?})", this.buf);
  }

  public as_array(): Array<T> {
    return this.buf.slice(this.pos, this.len());
  }

  private post_inc_start(offset: number): number {
    let old = this.pos;
    this.pos += offset;
    return old;
  }

  private pre_dec_end(offset: number): number {
    this.end -= offset;
    return this.end;
  }

  // Iterator
  public Item!: T;

  public next(): Option<this["Item"]> {
    if (this.pos === this.end) {
      return None();
    } else {
      return Some(this.buf[this.post_inc_start(1)]);
    }
  }

  public size_hint(): [number, Option<number>] {
    let exact = this.end - this.pos;
    return [exact, Some(exact)];
  }

  public count(): number {
    return this.end - this.pos;
  }

  public nth(n: number): Option<this["Item"]> {
    n = u64(n);
    if (n >= this.end - this.pos) {
      // This iterator is now empty.
      this.pos = this.end;
      return None();
    }
    // We are in bounds.
    this.post_inc_start(n);
    return Some(this.buf[this.post_inc_start(1)]);
  }

  public last(): Option<T> {
    return this.next_back();
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;

    while (this.end - this.pos >= 4) {
      let try_acc = f(acc, this.buf[this.post_inc_start(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();

      try_acc = f(acc, this.buf[this.post_inc_start(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();

      try_acc = f(acc, this.buf[this.post_inc_start(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();

      try_acc = f(acc, this.buf[this.post_inc_start(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    while (this.end !== this.pos) {
      let try_acc = f(acc, this.buf[this.post_inc_start(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }
    return r.from_okay(acc);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc = init;
    let next = this.next();
    while (next.is_some()) {
      acc = f(acc, next.unwrap());
      next = this.next();
    }
    return acc;
  }

  public position(predicate: (x: this["Item"]) => boolean): Option<number> {
    return this.try_fold<number, LoopState<number, number>>(
      0,
      LoopState,
      (i: number, x: this["Item"]) => {
        if (predicate(x)) {
          return Break(i);
        } else {
          return Continue(i + 1);
        }
      }
    ).break_value();
  }

  public rposition(predicate: (x: this["Item"]) => boolean): Option<number> {
    let n = this.end - this.pos;
    return this.try_rfold<number, LoopState<number, number>>(
      n,
      LoopState,
      (i: number, x: this["Item"]) => {
        i = i - 1;
        if (predicate(x)) {
          return Break(i);
        } else {
          return Continue(i);
        }
      }
    ).break_value();
  }

  // public partition_in_place<T extends Eq, Self extends IteratorCommon<T>>(
  //   predicate: ()
  // ): this["Self"] {
  //   let compare = (): (left: this["Item"], right: this["Item"]) => number {
  //     return cmp()
  //   }
  //   this.buf.sort()
  // }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    if (this.end === this.pos) {
      return None();
    } else {
      return Some(this.buf[this.pre_dec_end(1)]);
    }
  }

  public nth_back(n: number): Option<this["Item"]> {
    n = u64(n);
    if (n >= this.end - this.pos) {
      // This iterator is now empty.
      this.end = this.pos;
      return None();
    }
    // We are in bounds.
    this.pre_dec_end(n);
    return Some(this.buf[this.pre_dec_end(1)]);
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;

    while (this.end - this.pos >= 4) {
      let try_acc = f(acc, this.buf[this.pre_dec_end(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();

      try_acc = f(acc, this.buf[this.pre_dec_end(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();

      try_acc = f(acc, this.buf[this.pre_dec_end(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();

      try_acc = f(acc, this.buf[this.pre_dec_end(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }

    while (this.end !== this.pos) {
      let try_acc = f(acc, this.buf[this.pre_dec_end(1)]);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }
    return r.from_okay(acc);
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc = init;
    let next = this.next_back();
    while (next.is_some()) {
      acc = f(acc, next.unwrap());
      next = this.next_back();
    }
    return acc;
  }

  // ExactSizeIterator
  public len(): number {
    return this.end - this.pos;
  }

  public is_empty(): boolean {
    return this.pos === this.end;
  }

  // Clone
  public clone(): this["Self"] {
    return new ArrayIntoIter(this.as_array());
  }
}

declare global {
  interface String {
    // Alias for .length
    len(): number;
    // Returns true if the string has a length of 0.
    is_empty(): boolean;
  }

  interface Array<T> {
    // Alias for .length
    len(): number;
    // Returns true if the array has a length of 0.
    is_empty(): boolean;
    // IntoIterator
    Item: T;
    IntoIter: ArrayIntoIter<T>;
    iter(): ArrayIntoIter<T>;
    into_iter(): ArrayIntoIter<T>;
    // Extend
    extend<I extends IntoIterator<T>>(iter: I): void;
  }
}

String.prototype.len = function() {
  return this.length;
};
String.prototype.is_empty = function() {
  return this.length === 0;
};

Array.prototype.len = function() {
  return this.length;
};
Array.prototype.is_empty = function() {
  return this.length === 0;
};
Array.prototype.iter = function() {
  return this.into_iter();
};
Array.prototype.into_iter = function() {
  return new ArrayIntoIter(this);
};
Array.prototype.extend = function(iter) {
  for (let x of iter.into_iter()) {
    this.push(x);
  }
};

/**
 * Fold an iterator without having to provide an initial value.
 */
function fold1<T, I extends IteratorCommon<T>>(
  it: I,
  f: (i1: I["Item"], i2: I["Item"]) => I["Item"]
): Option<I["Item"]> {
  // start with the first element as our selection. This avioids
  // having to use `Option`s inside the loop, translating to a
  // sizeable performance gain.
  return it.next().map((first: I["Item"]) => it.fold(first, f));
}
