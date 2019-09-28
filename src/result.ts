// import {
//   // self.ts
//   Self,
//   // option.ts
//   Option, Some, None,
//   // cmp.ts
//   ImplPartialEq, ImplEq, eq, ImplPartialOrd, ImplOrd,
//   Ordering, Equal, Greater, Less, cmp,
//   // clone.ts
//   ImplClone, clone,
//   // fmt.ts
//   Debug, format,
//   // ops/try.ts
//   ImplTry,
// } from "./internal";
//
// export enum ResultType {
//   Ok = "Ok",
//   Err = "Err"
// }
//
// export type Ok<T> = { type: ResultType.Ok; value: T };
// export type Err<E> = { type: ResultType.Err; value: E };
//
// export function OkVariant<T>(value: T): Ok<T> {
//   return {
//     type: ResultType.Ok,
//     value
//   };
// }
//
// export function ErrVariant<E>(value: E): Err<E> {
//   return {
//     type: ResultType.Err,
//     value
//   };
// }
//
// export type ResultVariant<T, E> = Ok<T> | Err<E>;
//
// export class Result<T, E> extends ImplTry(ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(ImplClone(Self)))))) implements Debug {
//   public Self!: Result<T, E>
//
//   protected payload: ResultVariant<T, E>;
//
//   public constructor(payload: ResultVariant<T, E>) {
//     super();
//     this.payload = payload;
//   }
//
//   public static ok<T = any, E = void>(payload: T): Result<T, E> {
//     return new Result(OkVariant(payload));
//   }
//
//   public static err<T = void, E = any>(payload: E): Result<T, E> {
//     return new Result(ErrVariant(payload));
//   }
//
//   public eq(other: Result<T, E>): boolean {
//     let value = this.payload.value;
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return other.map_or_else(() => false, (t: T) => eq(t, value));
//       case ResultType.Err:
//         return other.map_or_else((e: E) => eq(e, value), () => false);
//     }
//   }
//
//   public cmp(other: Result<T, E>): Ordering {
//     let value = this.payload.value;
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return other.map_or_else(() => Greater, (t: T) => cmp(value, t));
//       case ResultType.Err:
//         return other.map_or_else((e: E) => cmp(value, e), () => Less);
//     }
//   }
//
//   public partial_cmp(other: Result<T, E>): Option<Ordering> {
//     return Some(this.cmp(other));
//   }
//
//   public fmt_debug(): string {
//     return `${this.payload.type}(${format("{:?}", this.payload.value)})`;
//   }
//
//   // Not part of Rust::std::result::Result
//   // This is an attempt to mimic Rust's `match` keyword
//   public match(): ResultVariant<T, E> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return OkVariant(this.payload.value);
//       case ResultType.Err:
//         return ErrVariant(this.payload.value);
//     }
//   }
//
//   public is_ok(): boolean {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return true;
//       case ResultType.Err:
//         return false;
//     }
//   }
//
//   public is_err(): boolean {
//     return !this.is_ok();
//   }
//
//   public ok(): Option<T> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return Some(this.payload.value);
//       case ResultType.Err:
//         return None();
//     }
//   }
//
//   public err(): Option<E> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return None();
//       case ResultType.Err:
//         return Some(this.payload.value);
//     }
//   }
//
//   public map<U>(op: (v: T) => U): Result<U, E> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return Ok(op(this.payload.value));
//       case ResultType.Err:
//         return Err(this.payload.value);
//     }
//   }
//
//   public map_or_else<U>(fallback: (v: E) => U, map: (v: T) => U): U {
//     return this.map<U>(map).unwrap_or_else(fallback);
//   }
//
//   public map_err<F>(op: (e: E) => F): Result<T, F> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return Ok(this.payload.value);
//       case ResultType.Err:
//         return Err(op(this.payload.value));
//     }
//   }
//
//   public and<U>(res: Result<U, E>): Result<U, E> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return res;
//       case ResultType.Err:
//         return Err(this.payload.value);
//     }
//   }
//
//   public and_then<U>(op: (t: T) => Result<U, E>): Result<U, E> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return op(this.payload.value);
//       case ResultType.Err:
//         return Err(this.payload.value);
//     }
//   }
//
//   public or<F>(res: Result<T, F>): Result<T, F> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return Ok(this.payload.value);
//       case ResultType.Err:
//         return res;
//     }
//   }
//
//   public or_else<F>(op: (e: E) => Result<T, F>): Result<T, F> {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return Ok(this.payload.value);
//       case ResultType.Err:
//         return op(this.payload.value);
//     }
//   }
//
//   public unwrap_or(optb: T): T {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return this.payload.value;
//       case ResultType.Err:
//         return optb;
//     }
//   }
//
//   public unwrap_or_else(op: (e: E) => T): T {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return this.payload.value;
//       case ResultType.Err:
//         return op(this.payload.value);
//     }
//   }
//
//   public unwrap(): T {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return this.payload.value;
//       case ResultType.Err:
//         throw new Error(`called 'Result.unwrap()' on an 'Err' value: ${this.payload.value}`);
//     }
//   }
//
//   public expect(msg: string): T {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return this.payload.value;
//       case ResultType.Err:
//         throw new Error(`${msg}: ${this.payload.value}`);
//     }
//   }
//
//   public unwrap_err(): E {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         throw new Error(`called 'Result.unwrap_err()' on an 'Ok' value: ${this.payload.value}`);
//       case ResultType.Err:
//         return this.payload.value;
//     }
//   }
//
//   public expect_err(msg: string): E {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         throw new Error(`${msg}: ${this.payload.value}`);
//       case ResultType.Err:
//         return this.payload.value;
//     }
//   }
//
//   public transpose<B>(this: Result<Option<B>, E>): Option<Result<B, E>> {
//     switch (this.payload.type) {
//       case ResultType.Ok: {
//         let opt = this.payload.value;
//         if (opt instanceof Option) {
//           return opt.map((b: B) => Ok(b));
//         } else {
//           return Some(Ok(opt));
//         }
//       }
//       case ResultType.Err:
//         return Some(Err(this.payload.value));
//     }
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     switch (this.payload.type) {
//       case ResultType.Ok:
//         return Ok(clone(this.payload.value));
//       case ResultType.Err:
//         return Err(clone(this.payload.value));
//     }
//   }
//
//   public clone_from(source: this["Self"]) {
//     let match = source.match();
//     switch (match.type) {
//       case ResultType.Ok:
//         this.payload = OkVariant(match.value);
//         break;
//       case ResultType.Err:
//         this.payload = ErrVariant(match.value);
//         break;
//     }
//   }
//
//   // ops::Try
//   public Okay!: T;
//   public Error!: E;
//
//   public is_error(): boolean {
//     return this.is_err();
//   }
//
//   public into_result(): this {
//     return this
//   }
//
//   public static from_okay<T = any, E = void>(v: T): Result<T, E> {
//     return Ok(v)
//   }
//
//   public static from_error<T = void, E = any>(v: E): Result<T, E> {
//     return Err(v)
//   }
// }
//
// export function Ok<T = any, E = void>(payload: T): Result<T, E> {
//   return Result.ok<T, E>(payload);
// }
//
// export function Err<T = void, E = any>(payload: E): Result<T, E> {
//   return Result.err<T, E>(payload);
// }
