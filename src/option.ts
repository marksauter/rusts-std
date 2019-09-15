import {
  // result.ts
  Result,
  ResultType,
  Ok,
  Err,
  // cmp.ts
  Eq,
  eq,
  Ord,
  Ordering,
  Equal,
  Greater,
  Less,
  cmp,
  // clone.ts
  Clone,
  clone,
  // fmt.ts
  Debug,
  format
} from "./internal";

export enum OptionType {
  Some = "Some",
  None = "None"
}

export type Some<T> = { type: OptionType.Some; value: T };
export type None = { type: OptionType.None };

export function SomeVariant<T>(value: T): Some<T> {
  return {
    type: OptionType.Some,
    value
  };
}

export function NoneVariant(): None {
  return {
    type: OptionType.None
  };
}

export type OptionVariant<T> = Some<T> | None;

export class Option<T> implements Eq<Option<T>>, Ord<Option<T>>, Clone<Option<T>>, Debug {
  private payload: OptionVariant<T>;

  private constructor(payload: OptionVariant<T>) {
    this.payload = payload;
  }

  public static Some<T>(payload: T): Option<T> {
    return new Option(SomeVariant(payload));
  }

  public static None<T = void>(): Option<T> {
    return new Option(NoneVariant());
  }

  // Convenience property for accesing OptionType.Some
  public static SomeT = OptionType.Some;

  // Convenience property for accesing OptionType.None
  public static NoneT = OptionType.None;

  public static default<T>(): Option<T> {
    return Option.None();
  }

  public eq(other: Option<T>): boolean {
    switch (this.payload.type) {
      case OptionType.Some: {
        let value = this.payload.value;
        return other.map_or(false, (t: T) => eq(t, value));
      }
      case OptionType.None:
        return other.is_none();
    }
  }

  public cmp(other: Option<T>): Ordering {
    switch (this.payload.type) {
      case OptionType.Some:
        let value = this.payload.value;
        return other.map_or(Greater, (t: T) => cmp(value, t));
      case OptionType.None:
        return other.map_or(Equal, () => Less);
    }
  }

  public partial_cmp(other: Option<T>): Option<Ordering> {
    return Some(this.cmp(other));
  }

  public clone(): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Option.Some(clone(this.payload.value));
      case OptionType.None:
        return Option.None();
    }
  }

  public fmt_debug(): string {
    switch (this.payload.type) {
      case OptionType.Some:
        return `${this.payload.type}(${format("{:?}", this.payload.value)})`;
      case OptionType.None:
        return `${this.payload.type}`;
    }
  }

  // Not part of Rust::std::option::Option
  // This is an attempt to mimic Rust's `match` keyword
  public match(): OptionVariant<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return SomeVariant(this.payload.value);
      case OptionType.None:
        return NoneVariant();
    }
  }

  public is_some(): boolean {
    switch (this.payload.type) {
      case OptionType.Some:
        return true;
      case OptionType.None:
        return false;
    }
  }

  public is_none(): this is None {
    return !this.is_some();
  }

  public expect(msg: string): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        throw new Error(msg);
    }
  }

  public unwrap(): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        throw new Error("called `Option.unwrap()` on a `None` value");
    }
  }

  public unwrap_or(def: T): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        return def;
    }
  }

  public unwrap_or_else(f: () => T): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      case OptionType.None:
        return f();
    }
  }

  public map<U>(f: (t: T) => U): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Option.Some(f(this.payload.value));
      case OptionType.None:
        return Option.None();
    }
  }

  public map_or<U>(def: U, f: (t: T) => U): U {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.value);
      case OptionType.None:
        return def;
    }
  }

  public map_or_else<U>(def: () => U, f: (t: T) => U): U {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.value);
      case OptionType.None:
        return def();
    }
  }

  public ok_or<E>(err: E): Result<T, E> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Result.Ok(this.payload.value);
      case OptionType.None:
        return Result.Err(err);
    }
  }

  public ok_or_else<E>(err: () => E): Result<T, E> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Result.Ok(this.payload.value);
      case OptionType.None:
        return Result.Err(err());
    }
  }

  public iter(): Iterator<Option<T>> {
    let self = this;
    let done = false;
    return {
      next(): IteratorResult<Option<T>> {
        if (done) {
          return { done: true, value: Option.None() };
        }
        done = true;
        return { done: false, value: self };
      }
    };
  }

  public [Symbol.iterator](): Iterator<Option<T>> {
    return this.iter();
  }

  public and<U>(optb: Option<U>): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return optb;
      case OptionType.None:
        return Option.None();
    }
  }

  public and_then<U>(f: (t: T) => Option<U>): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.value);
      case OptionType.None:
        return Option.None();
    }
  }

  public filter(predicate: (t: T) => boolean): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some: {
        if (predicate(this.payload.value)) {
          return this;
        }
      }
      default:
        return Option.None();
    }
  }

  public or(optb: Option<T>): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return this;
      case OptionType.None:
        return optb;
    }
  }

  public or_else(f: () => Option<T>): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return this;
      case OptionType.None:
        return f();
    }
  }

  public xor(optb: Option<T>): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some: {
        if (optb.is_none()) {
          return this;
        }
        break;
      }
      case OptionType.None: {
        return optb;
      }
    }
    return Option.None();
  }

  public get_or_insert(v: T): T {
    return this.get_or_insert_with(() => v);
  }

  public get_or_insert_with(f: () => T): T {
    switch (this.payload.type) {
      case OptionType.None:
        this.replace(f());
      default:
        break;
    }

    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.value;
      // This should never happen
      case OptionType.None:
        throw new Error(`Option.get_or_insert_with: unreachable_unchecked ${self}`);
    }
  }

  public take(): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        let ret = Option.Some(this.payload.value);
        this.payload = NoneVariant();
        return ret;
      case OptionType.None:
        return Option.None();
    }
  }

  public replace(payload: T): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        let ret = Option.Some(this.payload.value);
        this.payload = SomeVariant(payload);
        return ret;
      case OptionType.None:
        this.payload = SomeVariant(payload);
        return Option.None();
    }
  }

  public transpose(): Result<Option<any>, any> {
    switch (this.payload.type) {
      case OptionType.Some: {
        let res = this.payload.value;
        if (res instanceof Result) {
          return res.map_or_else(
            (e: any) => Result.Err(Option.Some(e)),
            (t: any) => Result.Ok(Option.Some(t))
          );
        } else {
          return Result.Ok(Option.Some(res));
        }
      }
      case OptionType.None:
        return Result.Ok(Option.None());
    }
  }
}

export function Some<T>(payload: T): Option<T> {
  return Option.Some<T>(payload);
}

export function None<T = void>(): Option<T> {
  return Option.None<T>();
}

export const SomeT = Option.SomeT;
export const NoneT = Option.NoneT;
