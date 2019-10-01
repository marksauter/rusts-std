import {
  // ops/try.ts
  Try,
  TryConstructor,
  // iter.ts
  IteratorBase,
  IteratorCommon,
  DoubleEndedIterator,
  DoubleEndedIteratorCommon,
  ExactSizeIterator,
  ExactSizeAndDoubleEndedIterator,
  IntoIterator,
  // clone.ts
  Clone,
  clone,
  // option.ts
  Option,
  OptionType,
  Some,
  None,
  // checked.ts
  u64_checked_add,
  u64_saturating_add,
  // fmt.ts
  Debug,
  format
} from "./internal";

export enum ChainState {
  // both front and back iterator are remaining
  Both,
  // only front is remaining
  Front,
  // only back is remaining
  Back
}

/**
 * An iterator that strings two iterators together.
 */
export class Chain<T, A extends IteratorCommon<T>, B extends IteratorCommon<A["Item"]>>
  extends IteratorBase<A["Item"]>
  implements Clone, Debug {
  public Self!: Chain<T, A, B>;

  public a: A;
  public b: B;
  public state: ChainState;

  constructor(a: A, b: B) {
    super();
    this.a = a;
    this.b = b;
    this.state = ChainState.Both;
  }

  // Iterator
  public Item!: A["Item"];

  public next(): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        let next = this.a.next();
        let match = next.match();
        switch (match.type) {
          case OptionType.Some:
            return next;
          case OptionType.None: {
            this.state = ChainState.Back;
            return this.b.next();
          }
        }
      }
      case ChainState.Front:
        return this.a.next();
      case ChainState.Back:
        return this.b.next();
    }
  }

  public count(): number {
    switch (this.state) {
      case ChainState.Both:
        return this.a.count() + this.b.count();
      case ChainState.Front:
        return this.a.count();
      case ChainState.Back:
        return this.b.count();
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        let try_acc = this.a.try_fold(acc, r, f);
        if (try_acc.is_error()) {
          return try_acc;
        }
        acc = try_acc.unwrap();
        if (this.state === ChainState.Both) {
          this.state = ChainState.Back;
        }
        break;
      }
      default:
        break;
    }
    if (this.state === ChainState.Back) {
      let try_acc = this.b.try_fold(acc, r, f);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }
    return r.from_okay(acc);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc = init;
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        acc = this.a.fold(acc, f);
        break;
      }
      default:
        break;
    }
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Back: {
        acc = this.b.fold(acc, f);
        break;
      }
      default:
        break;
    }
    return acc;
  }

  public nth(n: number): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        for (let x of this.a) {
          if (n === 0) {
            return Some(x);
          }
          n -= 1;
        }
        if (this.state === ChainState.Both) {
          this.state = ChainState.Back;
        }
        break;
      }
      case ChainState.Back:
        break;
    }
    if (this.state === ChainState.Back) {
      return this.b.nth(n);
    } else {
      return None();
    }
  }

  public find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        let find = this.a.find(predicate);
        let match = find.match();
        switch (match.type) {
          case OptionType.None: {
            this.state = ChainState.Back;
            return this.b.find(predicate);
          }
          default:
            return find;
        }
      }
      case ChainState.Front:
        return this.a.find(predicate);
      case ChainState.Back:
        return this.b.find(predicate);
    }
  }

  public last(): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        // Must exhaust a before b.
        let a_last = this.a.last();
        let b_last = this.b.last();
        return b_last.or(a_last);
      }
      case ChainState.Front:
        return this.a.last();
      case ChainState.Back:
        return this.b.last();
    }
  }

  public size_hint(): [number, Option<number>] {
    switch (this.state) {
      case ChainState.Both: {
        let [a_lower, a_upper] = this.a.size_hint();
        let [b_lower, b_upper] = this.b.size_hint();

        let lower = u64_saturating_add(a_lower, b_lower);

        let upper = a_upper.and_then((a: number) =>
          b_upper.and_then((b: number) => u64_checked_add(a, b))
        );
        return [lower, upper];
      }
      case ChainState.Front:
        return this.a.size_hint();
      case ChainState.Back:
        return this.b.size_hint();
    }
  }

  // Clone
  readonly isClone = true;

  public clone(): this["Self"] {
    return new Chain(clone(this.a), clone(this.b));
  }

  // Debug
  public fmt_debug(): string {
    return format("Chain({:?},{:?})", this.a, this.b);
  }
}

export class ChainDoubleEndedIterator<
  T,
  A extends DoubleEndedIteratorCommon<T>,
  B extends DoubleEndedIteratorCommon<A["Item"]>
> extends DoubleEndedIterator<A["Item"]> implements Clone, Debug {
  public Self!: ChainDoubleEndedIterator<T, A, B>;

  public a: A;
  public b: B;
  public state: ChainState;

  constructor(a: A, b: B) {
    super();
    this.a = a;
    this.b = b;
    this.state = ChainState.Both;
  }

  // Iterator
  public Item!: A["Item"];

  public next(): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        let next = this.a.next();
        let match = next.match();
        switch (match.type) {
          case OptionType.Some:
            return next;
          case OptionType.None: {
            this.state = ChainState.Back;
            return this.b.next();
          }
        }
      }
      case ChainState.Front:
        return this.a.next();
      case ChainState.Back:
        return this.b.next();
    }
  }

  public count(): number {
    switch (this.state) {
      case ChainState.Both:
        return this.a.count() + this.b.count();
      case ChainState.Front:
        return this.a.count();
      case ChainState.Back:
        return this.b.count();
    }
  }

  public try_fold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        let try_acc = this.a.try_fold(acc, r, f);
        if (try_acc.is_error()) {
          return try_acc;
        }
        acc = try_acc.unwrap();
        if (this.state === ChainState.Both) {
          this.state = ChainState.Back;
        }
        break;
      }
      default:
        break;
    }
    if (this.state === ChainState.Back) {
      let try_acc = this.b.try_fold(acc, r, f);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }
    return r.from_okay(acc);
  }

  public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc = init;
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        acc = this.a.fold(acc, f);
        break;
      }
      default:
        break;
    }
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Back: {
        acc = this.b.fold(acc, f);
        break;
      }
      default:
        break;
    }
    return acc;
  }

  public nth(n: number): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        for (let x of this.a) {
          if (n === 0) {
            return Some(x);
          }
          n -= 1;
        }
        if (this.state === ChainState.Both) {
          this.state = ChainState.Back;
        }
        break;
      }
      case ChainState.Back:
        break;
    }
    if (this.state === ChainState.Back) {
      return this.b.nth(n);
    } else {
      return None();
    }
  }

  public find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        let find = this.a.find(predicate);
        let match = find.match();
        switch (match.type) {
          case OptionType.None: {
            this.state = ChainState.Back;
            return this.b.find(predicate);
          }
          default:
            return find;
        }
      }
      case ChainState.Front:
        return this.a.find(predicate);
      case ChainState.Back:
        return this.b.find(predicate);
    }
  }

  public last(): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        // Must exhaust a before b.
        let a_last = this.a.last();
        let b_last = this.b.last();
        return b_last.or(a_last);
      }
      case ChainState.Front:
        return this.a.last();
      case ChainState.Back:
        return this.b.last();
    }
  }

  public size_hint(): [number, Option<number>] {
    switch (this.state) {
      case ChainState.Both: {
        let [a_lower, a_upper] = this.a.size_hint();
        let [b_lower, b_upper] = this.b.size_hint();

        let lower = u64_saturating_add(a_lower, b_lower);

        let upper = a_upper.and_then((a: number) =>
          b_upper.and_then((b: number) => u64_checked_add(a, b))
        );
        return [lower, upper];
      }
      case ChainState.Front:
        return this.a.size_hint();
      case ChainState.Back:
        return this.b.size_hint();
    }
  }

  // DoubleEndedIterator
  public next_back(): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both: {
        let next = this.b.next_back();
        let match = next.match();
        switch (match.type) {
          case OptionType.Some:
            return next;
          case OptionType.None: {
            this.state = ChainState.Front;
            return this.a.next_back();
          }
        }
      }
      case ChainState.Front:
        return this.a.next_back();
      case ChainState.Back:
        return this.b.next_back();
    }
  }

  public nth_back(n: number): Option<this["Item"]> {
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Back: {
        for (let x of this.b.rev()) {
          if (n === 0) {
            return Some(x);
          }
          n -= 1;
        }
        if (this.state === ChainState.Both) {
          this.state = ChainState.Front;
        }
      }
      default:
        break;
    }
    if (this.state === ChainState.Front) {
      return this.a.nth_back(n);
    } else {
      return None();
    }
  }

  public try_rfold<Acc, R extends Try>(
    init: Acc,
    r: TryConstructor<R>,
    f: (acc: Acc, item: this["Item"]) => R
  ): R {
    let acc = init;
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Back: {
        let try_acc = this.b.try_rfold(acc, r, f);
        if (try_acc.is_error()) {
          return try_acc;
        }
        acc = try_acc.unwrap();
        if (this.state === ChainState.Both) {
          this.state = ChainState.Front;
        }
        break;
      }
      default:
        break;
    }
    if (this.state === ChainState.Front) {
      let try_acc = this.a.try_rfold(acc, r, f);
      if (try_acc.is_error()) {
        return try_acc;
      }
      acc = try_acc.unwrap();
    }
    return r.from_okay(acc);
  }

  public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
    let acc = init;
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Back: {
        acc = this.b.rfold(acc, f);
        break;
      }
      default:
        break;
    }
    switch (this.state) {
      case ChainState.Both:
      case ChainState.Front: {
        acc = this.a.rfold(acc, f);
        break;
      }
      default:
        break;
    }
    return acc;
  }

  // Clone
  readonly isClone = true;

  public clone(): this["Self"] {
    return new ChainDoubleEndedIterator(clone(this.a), clone(this.b));
  }

  // Debug
  public fmt_debug(): string {
    return format("Chain({:?},{:?})", this.a, this.b);
  }
}

declare module "./iter" {
  interface IteratorBase<T> {
    /**
     * Takes two iterators and creates a new iterator over both in sequence.
     */
    chain<U extends IntoIterator<T, IteratorCommon<T>>>(other: U): Chain<T, this, U["IntoIter"]>;
  }

  interface ExactSizeIterator<T> {
    /**
     * Takes two iterators and creates a new iterator over both in sequence.
     */
    chain<U extends IntoIterator<T, IteratorCommon<T>>>(other: U): Chain<T, this, U["IntoIter"]>;
  }

  interface DoubleEndedIterator<T> {
    /**
     * Takes two iterators and creates a new iterator over both in sequence.
     */
    chain<U extends IntoIterator<T, DoubleEndedIteratorCommon<T>>>(
      other: U
    ): ChainDoubleEndedIterator<T, this, U["IntoIter"]>;
    chain<U extends IntoIterator<T, IteratorCommon<T>>>(other: U): Chain<T, this, U["IntoIter"]>;
  }

  interface ExactSizeAndDoubleEndedIterator<T> {
    /**
     * Takes two iterators and creates a new iterator over both in sequence.
     */
    chain<U extends IntoIterator<T, DoubleEndedIteratorCommon<T>>>(
      other: U
    ): ChainDoubleEndedIterator<T, this, U["IntoIter"]>;
    chain<U extends IntoIterator<T, IteratorCommon<T>>>(other: U): Chain<T, this, U["IntoIter"]>;
  }
}

function chain<
  T,
  U extends IntoIterator<T, DoubleEndedIteratorCommon<T>>,
  Self extends DoubleEndedIteratorCommon<T>
>(this: Self, other: U): ChainDoubleEndedIterator<T, Self, U["IntoIter"]>;
function chain<T, U extends IntoIterator<T, IteratorCommon<T>>, Self extends IteratorCommon<T>>(
  this: Self,
  other: U
): Chain<T, Self, U["IntoIter"]>;
function chain(this: any, other: any): any {
  let iter = other.into_iter();
  if (iter instanceof DoubleEndedIteratorCommon) {
    return new ChainDoubleEndedIterator(this, other.into_iter());
  } else {
    return new Chain(this, other.into_iter());
  }
}

ExactSizeAndDoubleEndedIterator.prototype.chain = chain;
DoubleEndedIterator.prototype.chain = chain;
ExactSizeIterator.prototype.chain = chain;
IteratorBase.prototype.chain = chain;
