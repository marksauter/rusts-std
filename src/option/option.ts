import copy from "copy-anything";
import { Result, ResultType, Ok, Err } from "../internal";

export enum OptionType {
  Some = "Some",
  None = "None"
}

export type Some<T> = { type: OptionType.Some; payload: T };
export type None = { type: OptionType.None };

function SomeVariant<T>(payload: T): Some<T> {
  return {
    type: OptionType.Some,
    payload
  };
}

function NoneVariant(): None {
  return {
    type: OptionType.None
  };
}

export type OptionVariant<T> = Some<T> | None;

export class Option<T = any> {
  private payload: OptionVariant<T>;

  private constructor(payload: OptionVariant<T>) {
    this.payload = payload;
  }

  public static from<T>(payload: OptionVariant<T>): Option<T> {
    switch (payload.type) {
      case OptionType.Some:
        return Option.Some(payload.payload);
      case OptionType.None:
        return Option.None();
    }
  }

  public static Some<T>(payload: T): Option<T> {
    return new Option(SomeVariant(payload));
  }

  public static None(): Option {
    return new Option(NoneVariant());
  }

  // Convenience property for accesing OptionType.Some
  public static SomeT = OptionType.Some;

  // Convenience property for accesing OptionType.None
  public static NoneT = OptionType.None;

  // Not part of Rust::std::option::Option
  // This is an attempt to mimic Rust's `match` keyword
  // NOTE: this returns a copy of Option's payload
  public match(): OptionVariant<T> {
    switch (this.payload.type) {
      case OptionType.Some:
        return SomeVariant(copy(this.payload.payload));
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
        return this.payload.payload;
      case OptionType.None:
        throw new Error(msg);
    }
  }

  public unwrap(): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.payload;
      case OptionType.None:
        throw new Error("called `Option.unwrap()` on a `None` value");
    }
  }

  public unwrap_or(def: T): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.payload;
      case OptionType.None:
        return def;
    }
  }

  public unwrap_or_else<F extends () => T>(f: F): T {
    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.payload;
      case OptionType.None:
        return f();
    }
  }

  public map<U, F extends (t: T) => U>(f: F): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Option.Some(f(this.payload.payload));
      case OptionType.None:
        return Option.None();
    }
  }

  public map_or<U, F extends (t: T) => U>(def: U, f: F): U {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.payload);
      case OptionType.None:
        return def;
    }
  }

  public map_or_else<U, D extends () => U, F extends (t: T) => U>(def: D, f: F): U {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.payload);
      case OptionType.None:
        return def();
    }
  }

  public ok_or<E>(err: E): Result<T, E> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Result.Ok(this.payload.payload);
      case OptionType.None:
        return Result.Err(err);
    }
  }

  public ok_or_else<E, F extends () => E>(err: F): Result<T, E> {
    switch (this.payload.type) {
      case OptionType.Some:
        return Result.Ok(this.payload.payload);
      case OptionType.None:
        return Result.Err(err());
    }
  }

  public iter(): Iterator<Option<T>> {
    let self = this;
    return {
      next(): IteratorResult<Option<T>> {
        return {
          done: true,
          value: self
        };
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

  public and_then<U, F extends (t: T) => Option<U>>(f: F): Option<U> {
    switch (this.payload.type) {
      case OptionType.Some:
        return f(this.payload.payload);
      case OptionType.None:
        return Option.None();
    }
  }

  public filter<P extends (t: T) => boolean>(predicate: P): Option<T> {
    switch (this.payload.type) {
      case OptionType.Some: {
        if (predicate(this.payload.payload)) {
          return Option.Some(this.payload.payload);
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

  public or_else<F extends () => Option<T>>(f: F): Option<T> {
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
          return Option.Some(this.payload.payload);
        }
        break;
      }
      case OptionType.None: {
        if (optb.is_some()) {
          return Option.Some((optb.payload as Some<T>).payload);
        }
        break;
      }
    }
    return Option.None();
  }

  public get_or_insert(v: T): T {
    return this.get_or_insert_with(() => v);
  }

  public get_or_insert_with<F extends () => T>(f: F): T {
    switch (this.payload.type) {
      case OptionType.None:
        this.replace(f());
      default:
        break;
    }

    switch (this.payload.type) {
      case OptionType.Some:
        return this.payload.payload;
      // This should never happen
      case OptionType.None:
        throw new Error(`Option.get_or_insert_with: unreachable_unchecked ${self}`);
    }
  }

  public take(): Option<T> {
    let ret = Option.from(this.payload);
    this.payload = NoneVariant();
    return ret;
  }

  public replace(payload: T): Option<T> {
    this.payload = SomeVariant(payload);
    return this;
  }

  public transpose(): Result<Option<any>, any> {
    switch (this.payload.type) {
      case OptionType.Some: {
        let res = this.payload.payload;
        if (res instanceof Result) {
          return res.map((t: any) => Option.Some(t));
        } else {
          return Result.Ok(Option.Some(res));
        }
      }
      case OptionType.None:
        return Result.Ok(Option.None());
    }
  }
}

export const Some = Option.Some;
export const SomeT = Option.SomeT;
export const None = Option.None;
export const NoneT = Option.NoneT;
