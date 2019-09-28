import {
  // self.ts
  Self,
  // mixin.ts
  AnyConstructor,
  Mixin,
  // default.ts
  Default,
  // clone.ts
  ImplClone,
  Clone,
  clone,
  // debug.ts
  Debug,
  format,
  // try.ts
  ImplTry,
  Try,
  TryFace,
  TryConstructor,
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
  // macros.ts
  abstract_panic,
  assert_eq,
  U64_MAX,
  Add,
  isAdd,
  add,
  Mul,
  isMul,
  mul
} from "./internal";

export interface IteratorFace<T = any> extends Self {
  Item: T;

  /**
   * Advances the iterator and returns the next value.
   */
  next(): Option<this["Item"]>;

  [Symbol.iterator](): Iterator<this["Item"]>;

  /**
   * Returns the bounds on the remaining length of the iterator.
   */
  size_hint(): [number, Option<number>];

  /**
   * Consumes the iterator, counting the number of iterations and returning it.
   */
  count(): number;

  /**
   * Consumes the iterator, returning the last element.
   */
  last(): Option<this["Item"]>;

  /**
   * Returns the `n`th element of the iterator.
   */
  nth(n: number): Option<this["Item"]>;

  /**
   * Calls a closure on each element of an iterator.
   */
  for_each(f: (item: this["Item"]) => void): void;

  /**
   * Transforms an iterator into a colleciton.
   */
  collect<B extends FromIterator<this["Item"]>>(b: B): B;
  collect(): this["Item"][];

  /**
   * Consumes an iterator, creating two collections from it.
   */
  partition<B extends Extend<this["Item"]>>(
    f: (item: this["Item"]) => boolean,
    t: Default<B>
  ): [B, B];
  partition(f: (item: this["Item"]) => boolean): [this["Item"][], this["Item"][]];

  /**
   * Reorder the elements of this iterator *in-place* according to the given
   * predicate such that all those return `ture` precede all those that return
   * `false`.
   * Returns the number of `true` elements found.
   */
  // partition_in_place<Self extends DoubleEndedIterator>(predicate: (item: this["Item"]) => boolean): number {

  /**
   * Checks if the elements of this iterator are partitioned according to the
   * given predicate, such that all those that return `true` precede all those
   * that return `false`.
   */
  is_partitioned(predicate: (x: this["Item"]) => boolean): boolean;

  /**
   * An iterator method that applies a function as long as it returns
   * successfully, producing a single, final value.
   */
  try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R;

  /**
   * An iterator method that applies a fallible function to each item in the
   * iterator, stopping at the first error and returning that error.
   */
  try_for_each<R extends Try>(r: TryConstructor<R>, f: (x: this["Item"]) => R): R;

  /**
   * An iterator method that applies a function, producing a single, final value.
   */
  fold<Acc>(init: Acc, f: (acc: Acc, x: this["Item"]) => Acc): Acc;

  /**
   * Test if every element of the iterator matches a predicate.
   */
  all(f: (x: this["Item"]) => boolean): boolean;

  /**
   * Test ifany element of the iterator matches a predicate.
   */
  any(f: (x: this["Item"]) => boolean): boolean;

  /**
   * Searches for an element of an iterator that satisfies a predicate.
   */
  find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]>;

  /**
   * Applies a function to the elements of iterator and returns the first
   * non-none result.
   */
  find_map<B>(f: (x: this["Item"]) => Option<B>): Option<B>;

  /**
   * Searches for an element in an iterator, returing its index.
   */
  position(predicate: (x: this["Item"]) => boolean): Option<number>;

  /**
   * Searches for an element in an iterator from the right, returning its index.
   */
  rposition<Self extends ExactSizeIterator & DoubleEndedIterator>(
    this: Self,
    predicate: (x: this["Item"]) => boolean
  ): Option<number>;

  /**
   * Returns the maximum element of an iterator.
   */
  max(): Option<this["Item"]>;

  /**
   * Returns the minimum element of an iterator.
   */
  min(): Option<this["Item"]>;

  /**
   * Returns the element that gives the maximum value from the specified
   * function.
   */
  max_by_key<B extends Ord>(f: (item: this["Item"]) => B): Option<this["Item"]>;

  /**
   * Returns the element that gives the maximum value with respect to the
   * specified comparison function.
   */
  max_by(compare: (x: this["Item"], y: this["Item"]) => Ordering): Option<this["Item"]>;

  /**
   * Returns the element that gives the minimum value from the specified
   * function.
   */
  min_by_key<B extends Ord>(f: (item: this["Item"]) => B): Option<this["Item"]>;

  /**
   * Returns the element that gives the minimum value with respect to the
   * specified comparison function.
   */
  min_by(compare: (x: this["Item"], y: this["Item"]) => Ordering): Option<this["Item"]>;

  // FIXME
  // try_sum<T extends number, E, R extends TryFace<T, E>, Self extends IteratorFace<R>>(this: Self, r: TryConstructor<R>): R
  // try_sum<A extends Add, E, R extends TryFace<A, E>, Self extends IteratorFace<R>>(this: Self, r: TryConstructor<R>): R

  sum<A extends Add, Self extends IteratorFace<A>>(): A;
  sum<Self extends IteratorFace<number>>(): number;

  // try_product<A extends Mul | number, E, R extends TryFace<A, E>, Self extends IteratorFace<R>>(this: Self, r: TryConstructor<R>): R

  product<M extends Mul, Self extends IteratorFace<M>>(): M;
  product<Self extends IteratorFace<number>>(): number;

  /**
   * Lexicographically compares the elements of this `Iterator` with those
   * of another
   */
  cmp<I extends IntoIterator<this["Item"]>>(other: I): Ordering;

  /**
   * Lexicographically compares the elements of this `Iterator` with those
   * of another
   */
  partial_cmp<I extends IntoIterator>(other: I): Option<Ordering>;

  /**
   * Determines if the elements of this `Iterator` are equal to those of
   * another
   */
  eq<I extends IntoIterator<this["Item"]>>(other: I): boolean;
  eq(other: this["Self"]): boolean;

  /**
   * Determines if the elements of this `Iterator` are unequal to those of
   * another
   */
  ne<I extends IntoIterator<this["Item"]>>(other: I): boolean;

  /**
   * Determines if the elements of this `Iterator` are lexicographically
   * less than those of another.
   */
  lt<I extends IntoIterator<this["Item"]>>(other: I): boolean;

  /**
   * Determines if the elements of this `Iterator` are lexicographically
   * less or equal to those of another.
   */
  le<I extends IntoIterator<this["Item"]>>(other: I): boolean;

  /**
   * Determines if the elements of this `Iterator` are lexicographically
   * greater than those of another.
   */
  gt<I extends IntoIterator<this["Item"]>>(other: I): boolean;

  /**
   * Determines if the elements of this `Iterator` are lexicographically
   * greater or equal to those of another.
   */
  ge<I extends IntoIterator<this["Item"]>>(other: I): boolean;

  /**
   * Checks if the elements of this iterator are sorted.
   */
  is_sorted(): boolean;

  /**
   * Checks if the elements of this iterator are sorted using the given
   * comparator function.
   */
  is_sorted_by(compare: (x: this["Item"], y: this["Item"]) => Option<Ordering>): boolean;

  /**
   * Checks if the elements of this iterator are sorted using the given key
   * extraction function.
   */
  is_sorted_by_key<k>(compare: (x: this["Item"]) => k): boolean;

  // IntoIterator
  IntoIter: this["Self"];
  into_iter(): this["IntoIter"];
}

export class IteratorBase extends Self implements IteratorFace {
  public Self!: IteratorBase;

  public Item: any;

  public next(): Option<this["Item"]> {
    abstract_panic("IteratorBase", "next");
    // Unreachable code
    return None();
  }

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

  // TODO: this function doesn't actually do anything in javascript, because we
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
    return this.try_for_each<LoopState<undefined, this["Item"]>>(LoopState, (x: this["Item"]) => {
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

  public rposition<Self extends ExactSizeIterator & DoubleEndedIterator>(
    this: Self,
    predicate: (x: this["Item"]) => boolean
  ): Option<number> {
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

  public max(): Option<this["Item"]> {
    return this.max_by(cmp);
  }

  public min(): Option<this["Item"]> {
    return this.min_by(cmp);
  }

  public max_by_key<B extends Ord>(f: (item: this["Item"]) => B): Option<this["Item"]>;
  public max_by_key(f: (item: this["Item"]) => this["Item"]): Option<this["Item"]>;
  public max_by_key(f: any): Option<this["Item"]> {
    return select_fold1(this.map((x: this["Item"]) => [f(x), x]), ([x_p, _x], [y_p, _y]) =>
      le(x_p, y_p)
    ).map(([_, x]) => x);
  }

  public max_by(compare: (x: this["Item"], y: this["Item"]) => Ordering): Option<this["Item"]> {
    return select_fold1(this, (x: this["Item"], y: this["Item"]) => compare(x, y).ne(Greater));
  }

  public min_by_key<B extends Ord>(f: (item: this["Item"]) => B): Option<this["Item"]>;
  public min_by_key(f: (item: this["Item"]) => this["Item"]): Option<this["Item"]>;
  public min_by_key(f: any): Option<this["Item"]> {
    return select_fold1(this.map((x: this["Item"]) => [f(x), x]), ([x_p, _x], [y_p, _y]) =>
      gt(x_p, y_p)
    ).map(([_, x]) => x);
  }

  public min_by(compare: (x: this["Item"], y: this["Item"]) => Ordering): Option<this["Item"]> {
    return select_fold1(this, (x: this["Item"], y: this["Item"]) => compare(x, y).eq(Greater));
  }

  // FIXME
  // public try_sum<T extends number, E, R extends TryFace<T, E>, Self extends IteratorFace<R>>(this: Self, r: TryConstructor<R>): R
  // public try_sum<T extends Add, E, R extends TryFace<T, E>, Self extends IteratorFace<R>>(this: Self, r: TryConstructor<R>): R
  // public try_sum<T, E, R extends TryFace<T, E>, Self extends IteratorFace<R>>(this: Self, r: TryConstructor<R>): R {
  //   let map: IteratorFace<Result<T, E>> = this.map((x: R) => x.into_result())
  //   let res: Result<T extends Add ? T["Output"] : number, E> = process_results<T, E, typeof map, T extends Add ? T["Output"] : number>(
  //     map,
  //     (i: ResultShunt<T, E, typeof map>) => (i as IteratorFace<T>).sum() as T extends Add ? T["Output"] : number,
  //   );
  //   let res_match = res.match();
  //   switch (res_match) {
  //     case ResultType.Ok: return r.from_okay(res_match.value);
  //     case ResultType.Err: return r.from_error(res_match.value);
  //   }
  // }

  // NOTE: The overload order matters here, need to check for primitive
  // types first.
  public sum<Self extends IteratorFace<number>>(this: Self): number;
  public sum<A extends Add, Self extends IteratorFace<A>>(this: Self): A["Output"];
  public sum(): any {
    return this.fold(0, add);
  }

  // public try_product<R extends Try & Add, Self extends IteratorFace<R>>(r: TryConstructor<R>): R {
  //   return process_results(iter.map((x: R) => x.into_result()), (i: ResultShunt) => i.product());
  // }

  // NOTE: The overload order matters here, need to check for primitive
  // types first.
  public product<Self extends IteratorFace<number>>(this: Self): number;
  public product<M extends Mul, Self extends IteratorFace<M>>(this: Self): M["Output"];
  public product(): any {
    return this.fold(1, mul);
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

      let ord = partial_cmp(x, y);
      if (ord.ne(Some(Equal))) {
        return ord;
      }
    } while (true);
  }

  public eq<I extends IntoIterator<this["Item"]>>(other: I): boolean;
  public eq(other: this["Self"]): boolean;
  public eq(other: any): boolean {
    let iter: IteratorBase;
    if (isIntoIterator(other)) {
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

export interface DoubledEndedIteratorFace<T = any> extends IteratorFace<T> {
  next_back(): Option<this["Item"]>;

  nth_back(n: number): Option<this["Item"]>;

  try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R;

  rfold<Acc>(acc: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc;

  rfind(predicate: (item: this["Item"]) => boolean): Option<this["Item"]>;
}

export const ImplDoubleEndedIterator = <T extends AnyConstructor<IteratorBase>>(Base: T) =>
  class DoubleEndedIterator extends Base {
    public Self!: DoubleEndedIterator;

    readonly isDoubleEndedIterator = true;

    // Abstract
    public next_back(): Option<this["Item"]> {
      abstract_panic("DoubleEndedIterator", "next_back");
      // Unreachable code
      return None();
    }

    public nth_back(n: number): Option<this["Item"]> {
      for (let x of this.rev()) {
        if (n === 0) {
          return Some(x);
        }
        n -= 1;
      }
      return None();
    }

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
      return this.try_rfold<undefined, LoopState<undefined, Option<this["Item"]>>>(
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
  };

export interface DoubleEndedIterator extends Mixin<typeof ImplDoubleEndedIterator> {}

export function isDoubleEndedIterator(i: any): i is DoubleEndedIterator {
  return typeof i === "object" && i !== null && (i as DoubleEndedIterator).isDoubleEndedIterator;
}

export interface ExactSizeIteratorFace<T = any> extends IteratorFace<T> {
  len(): number;

  is_empty(): boolean;
}

export const ImplExactSizeIterator = <T extends AnyConstructor<IteratorBase>>(Base: T) =>
  class ExactSizeIterator extends Base {
    public Self!: ExactSizeIterator;

    readonly isExactSizeIterator = true;

    public len(): number {
      let [lower, upper] = this.size_hint();
      assert_eq(upper, Some(lower));
      return lower;
    }

    public is_empty(): boolean {
      return this.len() === 0;
    }
  };

export interface ExactSizeIterator extends Mixin<typeof ImplExactSizeIterator> {}

export function isExactSizeIterator(i: any): i is ExactSizeIterator {
  return typeof i === "object" && i !== null && (i as ExactSizeIterator).isExactSizeIterator;
}

export interface FromIterator<Item> extends Self {
  // Creates a value from an iterator.
  from_iter<T extends IntoIterator<Item>>(iter: T): this["Self"];
}

export function isFromIterator<Item>(t: any): t is FromIterator<Item> {
  return typeof t === "object" && t !== null && (t as FromIterator<Item>).from_iter !== undefined;
}

export interface IntoIterator<Item = any, IntoIter extends IteratorBase = IteratorBase> {
  // The type of the elements being iterated over.
  Item: Item;

  // Which kind of iterator are we turning this into?
  IntoIter: IntoIter;

  // Creates an iterator from a value.
  into_iter(): this["IntoIter"];
}

export function isIntoIterator<Item, IntoIter extends IteratorBase = IteratorBase>(
  t: any
): t is IntoIterator<Item, IntoIter> {
  return (
    typeof t === "object" &&
    t !== null &&
    (t as IntoIterator<Item, IntoIter>).into_iter !== undefined
  );
}

export interface Extend<Item> {
  // Extends a collection with the contents of an iterator.
  extend<I extends IntoIterator<Item>>(iter: I): void;
}

// An iterator that always continues to yield `None` when exhausted.
export const ImplFusedIterator = <T extends AnyConstructor<IteratorBase>>(Base: T) =>
  class FusedIterator extends Base {
    readonly isFusedIterator = true;
  };

export type FusedIterator = Mixin<typeof ImplFusedIterator>;

export function isFusedIterator(i: any): i is FusedIterator {
  return typeof i === "object" && i !== null && (i as FusedIterator).isFusedIterator;
}

// An iterator that reports an accurate length using size_hint.
//
// This trait must only be implements when the contract is upheld.
// Consumers of this trait must inspect [`.size_hint`]'s upper bound.
export const ImplTrustedLen = <T extends AnyConstructor<IteratorBase>>(Base: T) =>
  class TrustedLen extends Base {};

export type TrustedLen = Mixin<typeof ImplTrustedLen>;

// An iterator whose items are random accessible efficiently
export const ImplTrustedRandomAccess = <T extends AnyConstructor<ExactSizeIterator>>(Base: T) =>
  class TrustedRandomAccess extends Base {
    public get_unchecked(i: number): this["Item"] {
      abstract_panic("TrustedRandomAccess", "get_unchecked");
      // Unreachable code
      return (undefined as unknown) as this["Item"];
    }

    public may_have_side_effect(): boolean {
      abstract_panic("TrustedRandomAccess", "may_have_side_effect");
      // Unreachable code
      return false;
    }
  };

export type TrustedRandomAccess = Mixin<typeof ImplTrustedRandomAccess>;

export function process_results<T, E, I extends IteratorFace<Result<T, E>>, U>(
  iter: I,
  f: (shunt: ResultShunt<T, E, I>) => U
): Result<U, E> {
  let error: Result<undefined, E> = Ok(undefined);
  let shunt = new ResultShunt<T, E, I>(iter, error);
  let value = f(shunt);
  return error.map(() => value);
}

export class ResultShunt<T, E, I extends IteratorFace<Result<T, E>>> extends IteratorBase {
  public Self!: ResultShunt<T, E, I>;

  public Iter!: I;
  public Item!: T;

  public iter: this["Iter"];
  public error: Result<undefined, E>;

  public constructor(iter: I, error: Result<undefined, E>) {
    super();
    this.iter = iter;
    this.error = error;
  }

  public next(): Option<this["Item"]> {
    return this.find(_ => true);
  }

  public size_hint(): [number, Option<number>] {
    if (this.error.is_err()) {
      return [0, Some(0)];
    } else {
      let [_, upper] = this.iter.size_hint();
      return [0, upper];
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    return this.iter
      .try_fold<Acc, LoopState<Acc, R>>(init, LoopState, (acc: Acc, x: this["Iter"]["Item"]) => {
        let match = x.match();
        switch (match.type) {
          case ResultType.Ok:
            return LoopState.from_try(f(acc, match.value));
          case ResultType.Err: {
            this.error = Err(match.value);
            return Break(r.from_okay(acc));
          }
        }
      })
      .into_try(r);
  }
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
export class Repeat<T> extends ImplDoubleEndedIterator(IteratorBase) implements Debug {
  public Item!: T;

  public element: T;

  public constructor(element: T) {
    super();
    this.element = element;
  }

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
export class RepeatWith<T> extends IteratorBase implements Debug {
  public Item!: T;

  public repeater: () => T;

  public constructor(repeater: () => T) {
    super();
    this.repeater = repeater;
  }

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
export class Empty<T>
  extends ImplExactSizeIterator(ImplDoubleEndedIterator(ImplClone(IteratorBase)))
  implements Debug {
  public Item!: T;

  public constructor() {
    super();
  }

  public static default() {
    return new Empty();
  }

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
export class Once<T> extends ImplExactSizeIterator(ImplDoubleEndedIterator(ImplClone(IteratorBase)))
  implements Debug {
  public Item!: T;

  private inner: OptionIntoIter<T>;

  public constructor(inner: OptionIntoIter<T>) {
    super();
    this.inner = inner;
  }

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
export class OnceWith<T> extends ImplExactSizeIterator(ImplDoubleEndedIterator(IteratorBase))
  implements Debug {
  public Item!: T;

  private gen: Option<() => T>;

  public constructor(gen: Option<() => T>) {
    super();
    this.gen = gen;
  }

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
export class FromFn<T> extends IteratorBase implements Debug {
  public Item!: T;

  public f: () => Option<T>;

  public constructor(f: () => Option<T>) {
    super();
    this.f = f;
  }

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
export class Successors<T> extends ImplDoubleEndedIterator(IteratorBase) implements Debug {
  public Item!: T;

  private first: Option<T>;
  private succ: (t: T) => Option<T>;

  public constructor(first: Option<T>, succ: (t: T) => Option<T>) {
    super();
    this.first = first;
    this.succ = succ;
  }

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

  public static continue<C = any, B = void>(v: C): LoopState<C, B> {
    return new LoopState(ContinueVariant(v));
  }

  public static break<C = void, B = any>(v: B): LoopState<C, B> {
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

  public static from_okay<C = any, B = void>(v: C): LoopState<C, B> {
    return new LoopState(ContinueVariant(v));
  }

  public static from_error<C = void, B = any>(v: B): LoopState<C, B> {
    return new LoopState(BreakVariant(v));
  }

  // PartialEq
  public eq(other: LoopState<C, B>): boolean {
    // TODO optimize this
    return this.into_result().eq(other.into_result());
  }
}

export function Continue<C = any, B = void>(payload: C): LoopState<C, B> {
  return LoopState.continue<C, B>(payload);
}

export function Break<C = void, B = any>(payload: B): LoopState<C, B> {
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

    // FromIterator
    // public static from_iter<I extends IntoIterator<Option<T>>>(iter: I): Option<T> {
    //
    // }
  }

  interface Result<T, E> {
    iter(): ResultIter<T>;
    [Symbol.iterator](): Iterator<T>;

    // IntoIterator
    Item: T;
    IntoIter: ResultIntoIter<T>;

    into_iter(): ResultIntoIter<T>;

    // FromIterator
    // public static from_iter<I extends IntoIterator<Option<T>>>(iter: I): Option<T> {
    //
    // }
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

class OptionItem<T> extends ImplExactSizeIterator(
  ImplDoubleEndedIterator(ImplClone(IteratorBase))
) {
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

class OptionIter<T> extends ImplExactSizeIterator(
  ImplDoubleEndedIterator(ImplClone(IteratorBase))
) {
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

class OptionIntoIter<T> extends ImplExactSizeIterator(
  ImplDoubleEndedIterator(ImplClone(IteratorBase))
) {
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

class ResultIter<T> extends ImplExactSizeIterator(
  ImplDoubleEndedIterator(ImplClone(IteratorBase))
) {
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

class ResultIntoIter<T> extends ImplExactSizeIterator(
  ImplDoubleEndedIterator(ImplClone(IteratorBase))
) {
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

export class ArrayIntoIter<T>
  extends ImplExactSizeIterator(ImplDoubleEndedIterator(ImplClone(IteratorBase)))
  implements Debug {
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

  // public partition_in_place<T extends Eq, Self extends IteratorFace<T>>(
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
  }

  interface Array<T> {
    // Alias for .length
    len(): number;
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

Array.prototype.len = function() {
  return this.length;
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

// Selects an element from an iterator based on the given "comparison" function.
function select_fold1<I extends IteratorBase>(
  it: I,
  f: (i1: I["Item"], i2: I["Item"]) => boolean
): Option<I["Item"]> {
  // start with the first element as our selection. This avioids
  // having to use `Option`s inside the loop, translating to a
  // sizeable performance gain.
  return it
    .next()
    .map((first: I["Item"]) =>
      it.fold(first, (sel: I["Item"], x: I["Item"]) => (f(sel, x) ? x : sel))
    );
}
