import {
  // iter.ts
  IteratorBase,
  IteratorCommon,
  DoubleEndedIterator,
  DoubleEndedIteratorCommon,
  ExactSizeIterator,
  ExactSizeAndDoubleEndedIterator,
  // clone.ts
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

export class Zip<A extends IteratorCommon, B extends IteratorCommon>
  extends IteratorBase<[A["Item"], B["Item"]]>
  implements Clone, Debug {
  public Self!: Zip<A, B>;

  public a: A;
  public b: B;
  public index: number;
  public length: number;

  constructor(a: A, b: B) {
    super();
    this.a = a;
    this.b = b;
    this.index = 0;
    this.length = 0;
  }

  // Iterator
  public Item!: [A["Item"], B["Item"]];

  public next(): Option<this["Item"]> {
    return this.a
      .next()
      .and_then((x: A["Item"]) => this.b.next().and_then((y: B["Item"]) => Some([x, y])));
  }

  public nth(n: number): Option<this["Item"]> {
    n = u64(n);
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
    return new Zip(clone(this.a), clone(this.b));
  }

  // Debug
  public fmt_debug(): string {
    return format("Zip({:?},{:?})", this.a, this.b);
  }
}

export class ZipExactSizeIterator<A extends ExactSizeIterator, B extends ExactSizeIterator>
  extends ExactSizeIterator<[A["Item"], B["Item"]]>
  implements Clone, Debug {
  public Self!: ZipExactSizeIterator<A, B>;

  public a: A;
  public b: B;
  public index: number;
  public length: number;

  constructor(a: A, b: B) {
    super();
    this.a = a;
    this.b = b;
    this.index = 0;
    this.length = 0;
  }

  // Iterator
  public Item!: [A["Item"], B["Item"]];

  public next(): Option<this["Item"]> {
    return this.a
      .next()
      .and_then((x: A["Item"]) => this.b.next().and_then((y: B["Item"]) => Some([x, y])));
  }

  public nth(n: number): Option<this["Item"]> {
    n = u64(n);
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
    return new ZipExactSizeIterator(clone(this.a), clone(this.b));
  }

  // Debug
  public fmt_debug(): string {
    return format("Zip({:?},{:?})", this.a, this.b);
  }
}

export class ZipExactSizeAndDoubleEndedIterator<
  A extends ExactSizeAndDoubleEndedIterator,
  B extends ExactSizeAndDoubleEndedIterator
> extends ExactSizeAndDoubleEndedIterator<[A["Item"], B["Item"]]> implements Clone, Debug {
  public Self!: ZipExactSizeAndDoubleEndedIterator<A, B>;

  public a: A;
  public b: B;
  public index: number;
  public length: number;

  constructor(a: A, b: B) {
    super();
    this.a = a;
    this.b = b;
    this.index = 0;
    this.length = 0;
  }

  // Iterator
  public Item!: [A["Item"], B["Item"]];

  public next(): Option<this["Item"]> {
    return this.a
      .next()
      .and_then((x: A["Item"]) => this.b.next().and_then((y: B["Item"]) => Some([x, y])));
  }

  public nth(n: number): Option<this["Item"]> {
    n = u64(n);
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

  // DoubleEndedIterator
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

  // Clone
  public clone(): this["Self"] {
    return new ZipExactSizeAndDoubleEndedIterator(clone(this.a), clone(this.b));
  }

  // Debug
  public fmt_debug(): string {
    return format("Zip({:?},{:?})", this.a, this.b);
  }
}

declare module "./iter" {
  // These `zip` functions differ from Rust's in that they don't accept
  // IntoIterator types, due to problems with typescripts type inference.
  interface ExactSizeAndDoubleEndedIterator<T> {
    zip<U extends ExactSizeAndDoubleEndedIterator>(
      other: U
    ): ZipExactSizeAndDoubleEndedIterator<this["Self"], U["IntoIter"]>;
    // FIXME
    // zip<U extends IntoIterator<any, ExactSizeIterator<any>>>(other: U): ZipExactSizeIterator<this["Self"], U["IntoIter"]>;
    // zip<U extends IntoIterator<any, IteratorCommon<any>>>(other: U): Zip<this["Self"], U["IntoIter"]>;
  }

  interface DoubleEndedIterator<T> {
    zip<U extends IteratorCommon>(other: U): Zip<this["Self"], U["IntoIter"]>;
  }

  interface ExactSizeIterator<T> {
    zip<U extends ExactSizeIterator>(other: U): ZipExactSizeIterator<this["Self"], U["IntoIter"]>;
    // FIXME
    // zip<U extends IntoIterator<any, ExactSizeAndDoubleEndedIterator<any>>>(other: U): ZipExactSizeIterator<this["Self"], U["IntoIter"]>;
    // zip<U extends IntoIterator<any, IteratorCommon<any>>>(other: U): Zip<this["Self"], U["IntoIter"]>;
  }

  interface IteratorBase<T> {
    zip<U extends IteratorCommon>(other: U): Zip<this["Self"], U["IntoIter"]>;
  }
}

ExactSizeAndDoubleEndedIterator.prototype.zip = function(other) {
  return new ZipExactSizeAndDoubleEndedIterator(this, other);
};
DoubleEndedIterator.prototype.zip = function(other) {
  return new Zip(this, other);
};
ExactSizeIterator.prototype.zip = function(other) {
  return new ZipExactSizeIterator(this, other);
};
IteratorBase.prototype.zip = function(other) {
  return new Zip(this, other);
};
