import {
  // option.ts
  Option,
  Some,
  None,
  // cmp.ts
  eq
} from "./internal";

export enum ResultType {
  Ok = "Ok",
  Err = "Err"
}

export type Ok<T> = { type: ResultType.Ok; value: T };
export type Err<E> = { type: ResultType.Err; value: E };

export function OkVariant<T>(value: T): Ok<T> {
  return {
    type: ResultType.Ok,
    value
  };
}

export function ErrVariant<E>(value: E): Err<E> {
  return {
    type: ResultType.Err,
    value
  };
}

export type ResultVariant<T, E> = Ok<T> | Err<E>;

export class Result<T, E> {
  private payload: ResultVariant<T, E>;

  private constructor(payload: ResultVariant<T, E>) {
    this.payload = payload;
  }

  public static Ok<T = any, E = void>(payload: T): Result<T, E> {
    return new Result(OkVariant(payload));
  }

  public static Err<T = void, E = any>(payload: E): Result<T, E> {
    return new Result(ErrVariant(payload));
  }

  // Convenience property for accesing ResultType.Ok
  public static OkT = ResultType.Ok;

  // Convenience property for accesing ResultType.Err
  public static ErrE = ResultType.Err;

  public eq(other: Result<T, E>): boolean {
    let value = this.payload.value;
    switch (this.payload.type) {
      case ResultType.Ok:
        return other.map_or_else(() => false, (t: T) => eq(t, value));
      case ResultType.Err:
        return other.map_or_else((e: E) => eq(e, value), () => false);
    }
  }

  // Not part of Rust::std::result::Result
  // This is an attempt to mimic Rust's `match` keyword
  public match(): ResultVariant<T, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return OkVariant(this.payload.value);
      case ResultType.Err:
        return ErrVariant(this.payload.value);
    }
  }

  public is_ok(): boolean {
    switch (this.payload.type) {
      case ResultType.Ok:
        return true;
      case ResultType.Err:
        return false;
    }
  }

  public is_err(): boolean {
    return !this.is_ok();
  }

  public ok(): Option<T> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Option.Some(this.payload.value);
      case ResultType.Err:
        return Option.None();
    }
  }

  public err(): Option<E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Option.None();
      case ResultType.Err:
        return Option.Some(this.payload.value);
    }
  }

  public map<U>(op: (v: T) => U): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(op(this.payload.value));
      case ResultType.Err:
        return Result.Err(this.payload.value);
    }
  }

  public map_or_else<U>(fallback: (v: E) => U, map: (v: T) => U): U {
    return this.map<U>(map).unwrap_or_else(fallback);
  }

  public map_err<F>(op: (e: E) => F): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(this.payload.value);
      case ResultType.Err:
        return Result.Err(op(this.payload.value));
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
        return { done: self.is_err(), value: self.ok() };
      }
    };
  }

  public [Symbol.iterator](): Iterator<Option<T>> {
    return this.iter();
  }

  public and<U>(res: Result<U, E>): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return res;
      case ResultType.Err:
        return Result.Err(this.payload.value);
    }
  }

  public and_then<U>(op: (t: T) => Result<U, E>): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return op(this.payload.value);
      case ResultType.Err:
        return Result.Err(this.payload.value);
    }
  }

  public or<F>(res: Result<T, F>): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(this.payload.value);
      case ResultType.Err:
        return res;
    }
  }

  public or_else<F>(op: (e: E) => Result<T, F>): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(this.payload.value);
      case ResultType.Err:
        return op(this.payload.value);
    }
  }

  public unwrap_or(optb: T): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        return optb;
    }
  }

  public unwrap_or_else(op: (e: E) => T): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        return op(this.payload.value);
    }
  }

  public unwrap(): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        throw new Error(`called 'Result.unwrap()' on an 'Err' value: ${this.payload.value}`);
    }
  }

  public expect(msg: string): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.value;
      case ResultType.Err:
        throw new Error(`${msg}: ${this.payload.value}`);
    }
  }

  public unwrap_err(): E {
    switch (this.payload.type) {
      case ResultType.Ok:
        throw new Error(`called 'Result.unwrap_err()' on an 'Ok' value: ${this.payload.value}`);
      case ResultType.Err:
        return this.payload.value;
    }
  }

  public expect_err(msg: string): E {
    switch (this.payload.type) {
      case ResultType.Ok:
        throw new Error(`${msg}: ${this.payload.value}`);
      case ResultType.Err:
        return this.payload.value;
    }
  }

  public transpose(): Option<Result<any, any>> {
    switch (this.payload.type) {
      case ResultType.Ok: {
        let opt = this.payload.value;
        if (opt instanceof Option) {
          return opt.map((t: any) => Result.Ok(t));
        } else {
          return Option.Some(Result.Ok(opt));
        }
      }
      case ResultType.Err:
        return Option.Some(Result.Err(this.payload.value));
    }
  }
}

export function Ok<T = any, E = void>(payload: T): Result<T, E> {
  return Result.Ok<T, E>(payload);
}

export function Err<T = void, E = any>(payload: E): Result<T, E> {
  return Result.Err<T, E>(payload);
}

export const OkT = Result.OkT;
export const ErrE = Result.ErrE;
