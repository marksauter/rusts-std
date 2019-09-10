import copy from "copy-anything";
import { Option, Some, None } from "../internal";

export enum ResultType {
  Ok = "Ok",
  Err = "Err"
}

export type Ok<T> = { type: ResultType.Ok; payload: T };
export type Err<E> = { type: ResultType.Err; payload: E };

function OkVariant<T>(payload: T): Ok<T> {
  return {
    type: ResultType.Ok,
    payload
  };
}

function ErrVariant<E>(payload: E): Err<E> {
  return {
    type: ResultType.Err,
    payload
  };
}

export type ResultVariant<T, E> = Ok<T> | Err<E>;

export class Result<T, E> {
  private payload: ResultVariant<T, E>;

  private constructor(payload: ResultVariant<T, E>) {
    this.payload = payload;
  }

  public static from<T, E>(payload: ResultVariant<T, E>): Result<T, E> {
    switch (payload.type) {
      case ResultType.Ok:
        return Result.Ok(payload.payload);
      case ResultType.Err:
        return Result.Err(payload.payload);
    }
  }

  public static Ok<T>(payload: T): Result<T, any> {
    return new Result(OkVariant(payload));
  }

  public static Err<E>(payload: E): Result<any, E> {
    return new Result(ErrVariant(payload));
  }

  // Convenience property for accesing ResultType.Ok
  public static OkT = ResultType.Ok;

  // Convenience property for accesing OptionType.Err
  public static ErrE = ResultType.Err;

  // Not part of Rust::std::result::Result
  // This is an attempt to mimic Rust's `match` keyword
  // NOTE: this returns a copy of Result's payload
  public match(): ResultVariant<T, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return OkVariant(copy(this.payload.payload));
      case ResultType.Err:
        return ErrVariant(copy(this.payload.payload));
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
        return Option.Some(this.payload.payload);
      case ResultType.Err:
        return Option.None();
    }
  }

  public err(): Option<E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Option.None();
      case ResultType.Err:
        return Option.Some(this.payload.payload);
    }
  }

  public map<U, F extends (v: T) => U>(op: F): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(op(this.payload.payload));
      case ResultType.Err:
        return Result.Err(this.payload.payload);
    }
  }

  public map_or_else<U, M extends (v: T) => U, F extends (v: E) => U>(fallback: F, map: M): U {
    return this.map<U, M>(map).unwrap_or_else(fallback);
  }

  public map_err<F, O extends (e: E) => F>(op: O): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(this.payload.payload);
      case ResultType.Err:
        return Result.Err(op(this.payload.payload));
    }
  }

  public iter(): Iterator<Option<T>> {
    let self = this;
    return {
      next(): IteratorResult<Option<T>> {
        return {
          done: true,
          value: self.ok()
        };
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
        return Result.Err(this.payload.payload);
    }
  }

  public and_then<U, F extends (t: T) => Result<U, E>>(op: F): Result<U, E> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return op(this.payload.payload);
      case ResultType.Err:
        return Result.Err(this.payload.payload);
    }
  }

  public or<F>(res: Result<T, F>): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(this.payload.payload);
      case ResultType.Err:
        return res;
    }
  }

  public or_else<F, O extends (e: E) => Result<T, F>>(op: O): Result<T, F> {
    switch (this.payload.type) {
      case ResultType.Ok:
        return Result.Ok(this.payload.payload);
      case ResultType.Err:
        return op(this.payload.payload);
    }
  }

  public unwrap_or(optb: T): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.payload;
      case ResultType.Err:
        return optb;
    }
  }

  public unwrap_or_else<F extends (e: E) => T>(op: F): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.payload;
      case ResultType.Err:
        return op(this.payload.payload);
    }
  }

  public unwrap(): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.payload;
      case ResultType.Err:
        throw new Error(`called 'Result.unwrap()' on an 'Err' value: ${this.payload.payload}`);
    }
  }

  public expect(msg: string): T {
    switch (this.payload.type) {
      case ResultType.Ok:
        return this.payload.payload;
      case ResultType.Err:
        throw new Error(`${msg}: ${this.payload.payload}`);
    }
  }

  public unwrap_err(): E {
    switch (this.payload.type) {
      case ResultType.Ok:
        throw new Error(`called 'Result.unwrap_err()' on an 'Ok' value: ${this.payload.payload}`);
      case ResultType.Err:
        return this.payload.payload;
    }
  }

  public expect_err(msg: string): E {
    switch (this.payload.type) {
      case ResultType.Ok:
        throw new Error(`${msg}: ${this.payload.payload}`);
      case ResultType.Err:
        return this.payload.payload;
    }
  }

  public transpose(): Option<Result<any, any>> {
    switch (this.payload.type) {
      case ResultType.Ok: {
        let opt = this.payload.payload;
        if (opt instanceof Option) {
          return opt.map((t: any) => Result.Ok(t));
        } else {
          return Option.Some(Result.Ok(opt));
        }
      }
      case ResultType.Err:
        return Option.Some(Result.Err(this.payload.payload));
    }
  }
}

export const Ok = Result.Ok;
export const OkT = Result.OkT;
export const Err = Result.Err;
export const ErrE = Result.ErrE;
