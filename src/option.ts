// import {
//   // self.ts
//   Self,
//   // cmp.ts
//   ImplPartialEq, ImplEq, eq, ImplPartialOrd, ImplOrd,
//   Ordering, Equal, Greater, Less, cmp,
//   // result.ts
//   Result, ResultType, Ok, Err,
//   // clone.ts
//   ImplClone, clone,
//   // fmt.ts
//   Debug, format,
//   // ops/try.ts
//   ImplTry,
// } from "./internal";
//
// export enum OptionType {
//   Some = "Some",
//   None = "None"
// }
//
// export type Some<T> = { type: OptionType.Some; value: T };
// export type None = { type: OptionType.None };
//
// export type NoneError = void;
//
// export function SomeVariant<T>(value: T): Some<T> {
//   return {
//     type: OptionType.Some,
//     value
//   };
// }
//
// export function NoneVariant(): None {
//   return {
//     type: OptionType.None
//   };
// }
//
// export type OptionVariant<T> = Some<T> | None;
//
// export class Option<T> extends ImplTry(ImplOrd(ImplPartialOrd(ImplEq(ImplPartialEq(ImplClone(Self)))))) implements Debug {
//   public Self!: Option<T>;
//
//   protected payload: OptionVariant<T>;
//
//   public constructor(payload: OptionVariant<T>) {
//     super();
//     this.payload = payload;
//   }
//
//   public static some<T>(payload: T): Option<T> {
//     return new Option(SomeVariant(payload));
//   }
//
//   public static none<T = void>(): Option<T> {
//     return new Option(NoneVariant());
//   }
//
//   public eq(other: Option<T>): boolean {
//     switch (this.payload.type) {
//       case OptionType.Some: {
//         let value = this.payload.value;
//         return other.map_or(false, (t: T) => eq(t, value));
//       }
//       case OptionType.None:
//         return other.is_none();
//     }
//   }
//
//   public cmp(other: Option<T>): Ordering {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         let value = this.payload.value;
//         return other.map_or(Greater, (t: T) => cmp(value, t));
//       case OptionType.None:
//         return other.map_or(Equal, () => Less);
//     }
//   }
//
//   public partial_cmp(other: Option<T>): Option<Ordering> {
//     return Some(this.cmp(other));
//   }
//
//   public fmt_debug(): string {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return `${this.payload.type}(${format("{:?}", this.payload.value)})`;
//       case OptionType.None:
//         return `${this.payload.type}`;
//     }
//   }
//
//   // Not part of Rust::std::option::Option
//   // This is an attempt to mimic Rust's `match` keyword
//   public match(): OptionVariant<T> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return SomeVariant(this.payload.value);
//       case OptionType.None:
//         return NoneVariant();
//     }
//   }
//
//   public is_some(): boolean {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return true;
//       case OptionType.None:
//         return false;
//     }
//   }
//
//   public is_none(): this is None {
//     return !this.is_some();
//   }
//
//   public expect(msg: string): T {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return this.payload.value;
//       case OptionType.None:
//         throw new Error(msg);
//     }
//   }
//
//   public unwrap(): T {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return this.payload.value;
//       case OptionType.None:
//         throw new Error("called `Option.unwrap()` on a `None` value");
//     }
//   }
//
//   public unwrap_or(def: T): T {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return this.payload.value;
//       case OptionType.None:
//         return def;
//     }
//   }
//
//   public unwrap_or_else(f: () => T): T {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return this.payload.value;
//       case OptionType.None:
//         return f();
//     }
//   }
//
//   public map<U>(f: (t: T) => U): Option<U> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return Some(f(this.payload.value));
//       case OptionType.None:
//         return None();
//     }
//   }
//
//   public map_or<U>(def: U, f: (t: T) => U): U {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return f(this.payload.value);
//       case OptionType.None:
//         return def;
//     }
//   }
//
//   public map_or_else<U>(def: () => U, f: (t: T) => U): U {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return f(this.payload.value);
//       case OptionType.None:
//         return def();
//     }
//   }
//
//   public ok_or<E>(err: E): Result<T, E> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return Ok(this.payload.value);
//       case OptionType.None:
//         return Err(err);
//     }
//   }
//
//   public ok_or_else<E>(err: () => E): Result<T, E> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return Ok(this.payload.value);
//       case OptionType.None:
//         return Err(err());
//     }
//   }
//
//   public and<U>(optb: Option<U>): Option<U> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return optb;
//       case OptionType.None:
//         return None();
//     }
//   }
//
//   public and_then<U>(f: (t: T) => Option<U>): Option<U> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return f(this.payload.value);
//       case OptionType.None:
//         return None();
//     }
//   }
//
//   public filter(predicate: (t: T) => boolean): Option<T> {
//     switch (this.payload.type) {
//       case OptionType.Some: {
//         if (predicate(this.payload.value)) {
//           return Some(this.payload.value);
//         }
//       }
//       default:
//         return None();
//     }
//   }
//
//   public or(optb: Option<T>): Option<T> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return Some(this.payload.value);
//       case OptionType.None:
//         return optb;
//     }
//   }
//
//   public or_else(f: () => Option<T>): Option<T> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return Some(this.payload.value);
//       case OptionType.None:
//         return f();
//     }
//   }
//
//   public xor(optb: Option<T>): Option<T> {
//     switch (this.payload.type) {
//       case OptionType.Some: {
//         if (optb.is_none()) {
//           return Some(this.payload.value);
//         }
//         break;
//       }
//       case OptionType.None: {
//         return optb;
//       }
//     }
//     return None();
//   }
//
//   public get_or_insert(v: T): T {
//     return this.get_or_insert_with(() => v);
//   }
//
//   public get_or_insert_with(f: () => T): T {
//     switch (this.payload.type) {
//       case OptionType.None:
//         this.replace(f());
//       default:
//         break;
//     }
//
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return this.payload.value;
//       // This should never happen
//       case OptionType.None:
//         throw new Error(`Option.get_or_insert_with: unreachable_unchecked ${self}`);
//     }
//   }
//
//   public take(): Option<T> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         let ret = Some(this.payload.value);
//         this.payload = NoneVariant();
//         return ret;
//       case OptionType.None:
//         return None();
//     }
//   }
//
//   public replace(payload: T): Option<T> {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         let ret = Some(this.payload.value);
//         this.payload = SomeVariant(payload);
//         return ret;
//       case OptionType.None:
//         this.payload = SomeVariant(payload);
//         return None();
//     }
//   }
//
//   // Maps an `Option<&T>` to and `Option<T>` by cloning the contents of the
//   // option.
//   public cloned(): Option<T> {
//     return this.map((t: T) => clone(t));
//   }
//
//   // Transposes an `Option` of a `Result` into a `Result` of an `Option`.
//   public transpose<T, E>(this: Option<Result<T, E>>): Result<Option<T>, E> {
//     switch (this.payload.type) {
//       case OptionType.Some: {
//         let match = this.payload.value.match()
//         switch (match.type) {
//           case ResultType.Ok: return Ok(Some(match.value));
//           case ResultType.Err: return Err(match.value);
//         }
//       }
//       case OptionType.None:
//         return Ok(None());
//     }
//   }
//
//   // Default
//   public static default<T>(): Option<T> {
//     return None();
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     switch (this.payload.type) {
//       case OptionType.Some:
//         return Some(clone(this.payload.value));
//       case OptionType.None:
//         return None();
//     }
//   }
//
//   public clone_from(source: this["Self"]) {
//     let match = source.match();
//     switch (match.type) {
//       case OptionType.Some:
//         this.payload = SomeVariant(clone(match.value));
//         break;
//       case OptionType.None:
//         this.payload = NoneVariant();
//         break;
//     }
//   }
//
//   // ops::Try
//   public Okay!: T;
//   public Error!: NoneError;
//
//   public is_error(): boolean {
//     return this.is_none();
//   }
//
//   public into_result(): Result<T, NoneError> {
//     return this.ok_or<NoneError>(undefined);
//   }
//
//   public static from_okay<T>(v: T): Option<T> {
//     return Some(v);
//   }
//
//   public static from_error<T = void>(_: NoneError): Option<T> {
//     return None();
//   }
//
//   // Converts from `Option<Option<T>>` to `Option<T>`
//   public flatten<B, Self extends Option<Option<B>>>(this: Self): Option<B> {
//     switch (this.payload.type) {
//       case OptionType.Some: {
//         return this.payload.value
//       }
//       default: return None();
//     }
//   }
// }
//
// export function Some<T>(payload: T): Option<T> {
//   return Option.some<T>(payload);
// }
//
// export function None<T = void>(): Option<T> {
//   return Option.none<T>();
// }
