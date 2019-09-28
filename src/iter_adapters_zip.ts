import {
  // mixin.ts
  AnyConstructor,
  Mixin,
  // iter.ts
  IteratorBase,
  IteratorFace,
  ImplDoubleEndedIterator,
  DoubleEndedIterator,
  isDoubleEndedIterator,
  ImplExactSizeIterator,
  ExactSizeIterator,
  isExactSizeIterator,
  IntoIterator,
  // clone.ts
  ImplClone,
  Clone,
  clone,
  // option.ts
  Option,
  OptionType,
  Some,
  None,
  // fmt.ts
  Debug,
  format,
  // range.ts
  range,
  // cmp.ts
  min
} from "./internal";

export class Zip extends ImplClone(IteratorBase) implements Debug {
  public Self!: Zip;

  public A!: IteratorBase;
  public B!: IteratorBase;

  public Item!: [any, any];

  public a: this["A"];
  public b: this["B"];
  public index: number;
  public len: number;

  constructor(a: IteratorBase, b: IteratorBase) {
    super();
    this.a = a;
    this.b = b;
    this.index = 0;
    this.len = 0;
  }

  // Iterator
  public next(): Option<this["Item"]> {
    return this.a
      .next()
      .and_then((x: this["A"]["Item"]) =>
        this.b.next().and_then((y: this["B"]["Item"]) => Some([x, y]))
      );
  }

  public nth(n: number): Option<this["Item"]> {
    let next = this.next();
    while (next.is_some()) {
      if (n === 0) {
        return next;
      }
      n -= 1;
      next = this.next();
    }
    return None();
  }

  public size_hint(): [number, Option<number>] {
    let [a_lower, a_upper] = this.a.size_hint();
    let [b_lower, b_upper] = this.b.size_hint();

    let lower = min(a_lower, b_lower);

    let upper = a_upper.map_or_else(
      () => b_upper.map_or(None<number>(), (y: number) => Some(y)),
      (x: number) => b_upper.map_or(Some(x), (y: number) => Some(min(x, y)))
    );
    return [lower, upper];
  }

  // Clone
  public clone(): this["Self"] {
    if (
      isExactSizeIterator(this.a) &&
      isDoubleEndedIterator(this.a) &&
      isExactSizeIterator(this.b) &&
      isDoubleEndedIterator(this.b)
    ) {
      return new ZipForDoubleEndedIterator(clone(this.a), clone(this.b));
    } else if (isExactSizeIterator(this.a) && isExactSizeIterator(this.b)) {
      return new ZipForExactSizeIterator(clone(this.a), clone(this.b));
    } else {
      return new Zip(clone(this.a), clone(this.b));
    }
  }

  // Debug
  public fmt_debug(): string {
    return format("Zip({:?},{:?})", this.a, this.b);
  }
}

export const ImplZipForExactSizeIterator = <T extends AnyConstructor<Zip & ExactSizeIterator>>(
  Base: T
) =>
  class ZipForExactSizeIterator extends Base {
    public Self!: ZipForExactSizeIterator;

    public A!: ExactSizeIterator;
    public B!: ExactSizeIterator;
  };

export class ZipForExactSizeIterator extends ImplZipForExactSizeIterator(
  ImplExactSizeIterator(Zip)
) {}

export const ImplZipForDoubleEndedIterator = <
  T extends AnyConstructor<Zip & DoubleEndedIterator & ExactSizeIterator>
>(
  Base: T
) =>
  class ZipForDoubleEndedIterator extends Base {
    public Self!: ZipForDoubleEndedIterator;

    public A!: DoubleEndedIterator & ExactSizeIterator;
    public B!: DoubleEndedIterator & ExactSizeIterator;

    public next_back(): Option<this["Item"]> {
      let a_sz = this.a.len();
      let b_sz = this.b.len();
      if (a_sz !== b_sz) {
        // Adjust a, b to equal length
        // TODO: this should probably be optimized.
        if (a_sz > b_sz) {
          for (let _ of range(0, a_sz - b_sz)) {
            this.a.next_back();
          }
        } else {
          for (let _ of range(0, b_sz - a_sz)) {
            this.b.next_back();
          }
        }
      }
      let a_next = this.a.next_back();
      let b_next = this.b.next_back();
      if (a_next.is_some() && b_next.is_some()) {
        return Some([a_next.unwrap(), b_next.unwrap()]);
      } else {
        return None();
      }
    }
  };

export class ZipForDoubleEndedIterator extends ImplZipForDoubleEndedIterator(
  ImplZipForExactSizeIterator(ImplExactSizeIterator(ImplDoubleEndedIterator(Zip)))
) {}

declare module "./iter" {
  interface IteratorFace {
    /**
     * Takes two iterators and creates a new iterator over both in sequence.
     */
    zip<Self extends ExactSizeIterator & DoubleEndedIterator, U extends IntoIterator<Self["Item"]>>(
      this: Self,
      other: U
    ): ZipForDoubleEndedIterator;
    zip<Self extends ExactSizeIterator, U extends IntoIterator<Self["Item"]>>(
      this: Self,
      other: U
    ): ZipForExactSizeIterator;
    zip<Self extends IteratorBase, U extends IntoIterator<Self["Item"]>>(this: Self, other: U): Zip;
  }

  interface IteratorBase {
    zip<Self extends ExactSizeIterator & DoubleEndedIterator, U extends IntoIterator<Self["Item"]>>(
      this: Self,
      other: U
    ): ZipForDoubleEndedIterator;
    zip<Self extends ExactSizeIterator, U extends IntoIterator<Self["Item"]>>(
      this: Self,
      other: U
    ): ZipForExactSizeIterator;
    zip<Self extends IteratorBase, U extends IntoIterator<Self["Item"]>>(this: Self, other: U): Zip;
  }
}

function zip<
  Self extends ExactSizeIterator & DoubleEndedIterator,
  U extends IntoIterator<Self["Item"]>
>(this: Self, other: U): ZipForDoubleEndedIterator;
function zip<Self extends ExactSizeIterator, U extends IntoIterator<Self["Item"]>>(
  this: Self,
  other: U
): ZipForExactSizeIterator;
function zip<Self extends IteratorBase, U extends IntoIterator<Self["Item"]>>(
  this: Self,
  other: U
): Zip;
function zip(this: any, other: any): any {
  let other_iter = other.into_iter();
  if (
    isExactSizeIterator(this) &&
    isDoubleEndedIterator(this) &&
    isExactSizeIterator(other_iter) &&
    isDoubleEndedIterator(other_iter)
  ) {
    return new ZipForDoubleEndedIterator(this, other_iter);
  } else if (isExactSizeIterator(this) && isExactSizeIterator(other_iter)) {
    return new ZipForExactSizeIterator(this, other_iter);
  } else {
    return new Zip(this, other_iter);
  }
}
IteratorBase.prototype.zip = zip;
