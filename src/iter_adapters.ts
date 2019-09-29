// import {
//   // mixin.ts
//   AnyConstructor,
//   Mixin,
//   // ops/try.ts
//   Try,
//   TryConstructor,
//   // iter.ts
//   IteratorBase,
//   IteratorFace,
//   from_fn,
//   ImplExactSizeIterator,
//   ExactSizeIterator,
//   isExactSizeIterator,
//   ImplDoubleEndedIterator,
//   DoubleEndedIterator,
//   isDoubleEndedIterator,
//   // ImplFusedIterator,
//   // FusedIterator,
//   // isFusedIterator,
//   LoopState,
//   LoopStateType,
//   Continue,
//   Break,
//   Extend,
//   // clone.ts
//   ImplClone,
//   Clone,
//   clone,
//   // default.ts
//   DefaultConstructor,
//   // fmt.ts
//   Debug,
//   format,
//   // option.ts
//   Option,
//   OptionType,
//   Some,
//   None,
//   // result.ts
//   Result,
//   ResultType,
//   Ok,
//   Err,
//   // macros.ts
//   assert,
//   // intrinsics.ts
//   u64,
//   u64_saturating_add,
//   u64_saturating_sub,
//   u64_saturating_mul,
//   // checked.ts
//   u64_checked_add,
//   u64_checked_mul,
//   U64_MAX
// } from "./internal";
//
// export class Rev extends ImplDoubleEndedIterator(IteratorBase) {
//   public Self!: Rev;
//
//   public Iter!: DoubleEndedIterator;
//
//   public iter: this["Iter"];
//
//   constructor(iter: DoubleEndedIterator) {
//     super();
//     this.iter = iter;
//   }
//
//   // Iterator
//   public Item!: this["Iter"]["Item"];
//
//   public next(): Option<this["Item"]> {
//     return this.iter.next_back();
//   }
//
//   public size_hint(): [number, Option<number>] {
//     return this.iter.size_hint();
//   }
//
//   public nth(n: number): Option<this["Item"]> {
//     return this.iter.nth_back(n);
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     f: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     return this.iter.try_rfold(init, r, f);
//   }
//
//   public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     return this.iter.rfold(init, f);
//   }
//
//   public find(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
//     return this.iter.rfind(predicate);
//   }
//
//   // DoubleEndedIterator
//   public next_back(): Option<this["Item"]> {
//     return this.iter.next();
//   }
//
//   public nth_back(n: number): Option<this["Item"]> {
//     return this.iter.nth(n);
//   }
//
//   public try_rfold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     f: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     return this.iter.try_fold(init, r, f);
//   }
//
//   public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     return this.iter.fold(init, f);
//   }
//
//   public rfind(predicate: (item: this["Item"]) => boolean): Option<this["Item"]> {
//     return this.iter.find(predicate);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter)) {
//       return new RevForExactSizeIterator(clone(this.iter));
//     } else {
//       return new Rev(clone(this.iter));
//     }
//   }
//
//   // Debug
//   public fmt_debug(): string {
//     return format("Rev({:?})", this.iter);
//   }
// }
//
// export const ImplRevForExactSizeIterator = <T extends AnyConstructor<Rev & ExactSizeIterator>>(
//   Base: T
// ) =>
//   class RevForExactSizeIterator extends Base {
//     public Self!: RevForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator & DoubleEndedIterator;
//
//     // ExactSizeIterator
//     public len(): number {
//       return this.iter.len();
//     }
//
//     public is_empty(): boolean {
//       return this.iter.is_empty();
//     }
//   };
//
// export class RevForExactSizeIterator extends ImplRevForExactSizeIterator(
//   ImplExactSizeIterator(Rev)
// ) {}
//
// function clone_try_fold<T, Acc, R extends Try>(
//   r: TryConstructor<R>,
//   f: (acc: Acc, elt: T) => R
// ): (acc: Acc, elt: T) => R {
//   return (acc: Acc, elt: T) => f(acc, clone(elt));
// }
//
// export class Cloned extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Cloned;
//
//   public Iter!: IteratorBase;
//
//   public iter: this["Iter"];
//
//   constructor(iter: IteratorBase) {
//     super();
//     this.iter = iter;
//   }
//
//   // Iterator
//   public next(): Option<this["Item"]> {
//     return this.iter.next().cloned();
//   }
//
//   public size_hint(): [number, Option<number>] {
//     return this.iter.size_hint();
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     f: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     return this.iter.try_fold(init, r, clone_try_fold(r, f));
//   }
//
//   public fold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     return this.iter.map(clone).fold(init, f);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new ClonedForExactSizeAndDoubleEndedIterator(clone(this.iter));
//     } else if (isExactSizeIterator(this.iter)) {
//       return new ClonedForExactSizeIterator(clone(this.iter));
//     } else if (isDoubleEndedIterator(this.iter)) {
//       return new ClonedForDoubleEndedIterator(clone(this.iter));
//     } else {
//       return new Cloned(clone(this.iter));
//     }
//   }
//
//   // Debug
//   public fmt_debug(): string {
//     return format("Cloned({:?})", this.iter);
//   }
// }
//
// export const ImplClonedForExactSizeIterator = <
//   T extends AnyConstructor<Cloned & ExactSizeIterator>
// >(
//   Base: T
// ) =>
//   class ClonedForExactSizeIterator extends Base {
//     public Self!: ClonedForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//
//     public len(): number {
//       return this.iter.len();
//     }
//
//     public is_empty(): boolean {
//       return this.iter.is_empty();
//     }
//   };
//
// export class ClonedForExactSizeIterator extends ImplClonedForExactSizeIterator(
//   ImplExactSizeIterator(Cloned)
// ) {}
//
// export const ImplClonedForDoubleEndedIterator = <
//   T extends AnyConstructor<Cloned & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class ClonedForDoubleEndedIterator extends Base {
//     public Self!: ClonedForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator;
//
//     public next_back(): Option<this["Item"]> {
//       return this.iter.next_back().cloned();
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       f: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       return this.iter.try_rfold(init, r, clone_try_fold(r, f));
//     }
//
//     public rfold<Acc>(init: Acc, f: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       return this.iter.map(clone).rfold(init, f);
//     }
//   };
//
// export class ClonedForDoubleEndedIterator extends ImplClonedForDoubleEndedIterator(
//   ImplDoubleEndedIterator(Cloned)
// ) {}
// export class ClonedForExactSizeAndDoubleEndedIterator extends ImplClonedForDoubleEndedIterator(
//   ImplClonedForExactSizeIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Cloned)))
// ) {}
//
// export class Cycle extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Cycle;
//
//   public Iter!: IteratorBase & Clone;
//
//   public orig: this["Iter"];
//   public iter: this["Iter"];
//
//   constructor(iter: IteratorBase & Clone) {
//     super();
//     this.orig = iter.clone();
//     this.iter = iter;
//   }
//
//   // Iterator
//   public next(): Option<this["Item"]> {
//     let next = this.iter.next();
//     let match = next.match();
//     switch (match.type) {
//       case OptionType.None:
//         this.iter = this.orig.clone();
//         return this.iter.next();
//       default:
//         return next;
//     }
//   }
//
//   public size_hint(): [number, Option<number>] {
//     // the cycle iterator is either empty or infinite
//     let [lower, upper] = this.orig.size_hint();
//     if (lower === 0) {
//       upper = upper.and_then(
//         (x: number): Option<number> => {
//           if (x === 0) {
//             return Some(0);
//           }
//           return None();
//         }
//       );
//       return [lower, upper];
//     } else {
//       return [U64_MAX, None()];
//     }
//   }
//
//   public try_fold<Acc, R extends Try>(
//     acc: Acc,
//     r: TryConstructor<R>,
//     f: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     // fully iterate the current iterator. this is necessary because
//     // `self.iter` may be epty even when `self.orig` isn't
//     let try_acc = this.iter.try_fold(acc, r, f);
//     if (try_acc.is_error()) {
//       return try_acc;
//     }
//     acc = try_acc.unwrap();
//     this.iter = this.orig.clone();
//
//     // complete the full cycle, keeping track of whether the cycled
//     // iterator is empty or not. we need to return early in case
//     // of an empty iterator to prevent an infinite loop
//     let is_empty = true;
//     try_acc = this.iter.try_fold(acc, r, (acc: Acc, x: this["Item"]) => {
//       is_empty = false;
//       return f(acc, x);
//     });
//     if (try_acc.is_error()) {
//       return try_acc;
//     }
//     acc = try_acc.unwrap();
//
//     if (is_empty) {
//       return r.from_okay(acc);
//     }
//
//     do {
//       this.iter = this.orig.clone();
//       try_acc = this.iter.try_fold(acc, r, f);
//       if (try_acc.is_error()) {
//         return try_acc;
//       }
//       acc = try_acc.unwrap();
//     } while (true);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     return new Cycle(this.orig.clone());
//   }
//
//   // Debug
//   public fmt_debug(): string {
//     return format("Cycle({:?})", this.iter);
//   }
// }
//
// export class StepBy extends ImplClone(IteratorBase) implements Debug {
//   public Self!: StepBy;
//
//   public Iter!: IteratorBase;
//
//   public iter: this["Iter"];
//   public step: number;
//   public first_take: boolean;
//
//   constructor(iter: IteratorBase, step: number) {
//     super();
//     assert(step > 0);
//     this.iter = iter;
//     this.step = u64(step) - 1;
//     this.first_take = true;
//   }
//
//   // Iterator
//   public next(): Option<this["Item"]> {
//     if (this.first_take) {
//       this.first_take = false;
//       return this.iter.next();
//     } else {
//       return this.iter.nth(this.step);
//     }
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let inner_hint = this.iter.size_hint();
//
//     let step = this.step;
//     if (this.first_take) {
//       let f = (n: number) => (n === 0 ? 0 : 1 + u64((n - 1) / (step + 1)));
//       return [f(inner_hint[0]), inner_hint[1].map(f)];
//     } else {
//       let f = (n: number) => u64(n / (step + 1));
//       return [f(inner_hint[0]), inner_hint[1].map(f)];
//     }
//   }
//
//   public nth(n: number): Option<this["Item"]> {
//     if (this.first_take) {
//       this.first_take = false;
//       let first = this.iter.next();
//       if (n === 0) {
//         return first;
//       }
//       n -= 1;
//     }
//     // n and this.step are indices, we need to add 1 to get the amount of elements.
//     // When calling `.nth`, we need to subtract 1 again to convert back to an index
//     // step + 1 can't overflow because `.step_by` sets `this.step` to `step - 1`
//     let step = this.step + 1;
//     // n + 1 could overflow
//     // thus, if n is U64_MAX instead of adding one, we call .nth(step)
//     if (n === U64_MAX) {
//       this.iter.nth(step - 1);
//     } else {
//       n += 1;
//     }
//
//     // overflow handling
//     do {
//       let mul = u64_checked_mul(n, step);
//       if (mul.is_some()) {
//         return this.iter.nth(mul.unwrap() - 1);
//       }
//       let div_n = u64(U64_MAX / n);
//       let div_step = u64(U64_MAX / step);
//       let nth_n = div_n * n;
//       let nth_step = div_step * step;
//       let nth: number;
//       if (nth_n > nth_step) {
//         step -= div_n;
//         nth = nth_n;
//       } else {
//         n -= div_step;
//         nth = nth_step;
//       }
//       this.iter.nth(nth - 1);
//     } while (true);
//   }
//
//   public try_fold<Acc, R extends Try>(
//     acc: Acc,
//     r: TryConstructor<R>,
//     f: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     const nth = <I extends IteratorBase>(iter: I, step: number): (() => Option<this["Item"]>) => {
//       return () => iter.nth(step);
//     };
//
//     if (this.first_take) {
//       this.first_take = false;
//       let match = this.iter.next().match();
//       switch (match.type) {
//         case OptionType.None:
//           return r.from_okay(acc);
//         case OptionType.Some: {
//           let try_acc = f(acc, match.value);
//           if (try_acc.is_error()) {
//             return try_acc;
//           }
//           acc = try_acc.unwrap();
//         }
//       }
//     }
//     return from_fn(nth(this.iter, this.step)).try_fold(acc, r, f);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     // Need to add one to `this.step` because constructor sets `this.step` to
//     // `step - 1`
//     let step = this.step + 1;
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new StepByForDoubleEndedIterator(clone(this.iter), step);
//     } else if (isExactSizeIterator(this.iter)) {
//       return new StepByForExactSizeIterator(clone(this.iter), step);
//     } else {
//       return new StepBy(clone(this.iter), step);
//     }
//   }
//
//   // Debug
//   public fmt_debug(): string {
//     // Need to add one to `this.step` because constructor sets `this.step` to
//     // `step - 1`
//     return format("StepBy({:?},{:?})", this.step + 1, this.iter);
//   }
// }
//
// export const ImplStepByForExactSizeIterator = <
//   T extends AnyConstructor<StepBy & ExactSizeIterator>
// >(
//   Base: T
// ) =>
//   class StepByForExactSizeIterator extends Base {
//     public Self!: StepByForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//
//     // The zero-based index starting from the end of the iterator of the
//     // last element. Used in the `DoubleEndedIterator` implmentation
//     public next_back_index(): number {
//       let rem = this.iter.len() % (this.step + 1);
//       if (this.first_take) {
//         return rem === 0 ? this.step : rem - 1;
//       } else {
//         return rem;
//       }
//     }
//   };
//
// export class StepByForExactSizeIterator extends ImplStepByForExactSizeIterator(
//   ImplExactSizeIterator(StepBy)
// ) {}
//
// export const ImplStepByForDoubleEndedIterator = <
//   T extends AnyConstructor<StepBy & StepByForExactSizeIterator & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class StepByForDoubleEndedIterator extends Base {
//     public Self!: StepByForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator & ExactSizeIterator;
//
//     public next_back(): Option<this["Item"]> {
//       return this.iter.nth_back(this.next_back_index());
//     }
//
//     public nth_back(n: number): Option<this["Item"]> {
//       // `this.iter.nth_back(U64_MAX)` does the right thing here when `n`
//       // is out of bounds because the length of `this.iter` does not exceed
//       // `U64_MAX` (because `Iter extends ExactSizeIterator`) and `nth_back`
//       // is zero-indexed
//       n = u64_saturating_add(u64_saturating_mul(n, this.step + 1), this.next_back_index());
//       return this.iter.nth_back(n);
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       f: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       const nth_back = <I extends DoubleEndedIterator>(
//         iter: I,
//         step: number
//       ): (() => Option<this["Item"]>) => {
//         return () => iter.nth_back(step);
//       };
//
//       let match = this.next_back().match();
//       switch (match.type) {
//         case OptionType.None:
//           return r.from_okay(init);
//         case OptionType.Some: {
//           let try_acc = f(init, match.value);
//           if (try_acc.is_error()) {
//             return try_acc;
//           }
//           let acc = try_acc.unwrap();
//           return from_fn(nth_back(this.iter, this.step)).try_fold(acc, r, f);
//         }
//       }
//     }
//   };
//
// export class StepByForDoubleEndedIterator extends ImplStepByForDoubleEndedIterator(
//   ImplDoubleEndedIterator(StepByForExactSizeIterator)
// ) {}
//
// function map_fold<T, U, Acc>(f: (t: T) => U, g: (acc: Acc, u: U) => Acc): (acc: Acc, t: T) => Acc {
//   return (acc: Acc, elt: T) => g(acc, f(elt));
// }
//
// function map_try_fold<T, B, Acc, R>(
//   f: (t: T) => B,
//   g: (acc: Acc, b: B) => R
// ): (acc: Acc, t: T) => R {
//   return (acc: Acc, elt: T) => g(acc, f(elt));
// }
//
// export interface MapFace<I extends IteratorFace, B = any> extends IteratorFace<B> {
//   iter: I;
//   f: (x: I["Item"]) => B;
// }
//
// export class Map extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Map;
//
//   public Iter!: IteratorBase;
//   public IntoItem!: ReturnType<this["f"]>;
//
//   public iter: this["Iter"];
//   public f: (x: this["Iter"]["Item"]) => any;
//
//   constructor(iter: IteratorBase, f: (x: any) => any) {
//     super();
//     this.iter = iter;
//     this.f = f;
//   }
//
//   public fmt_debug(): string {
//     return format("Map({:?},{:?})", this.f, this.iter);
//   }
//
//   public next(): Option<this["Item"]> {
//     return this.iter.next().map(this.f);
//   }
//
//   public size_hint(): [number, Option<number>] {
//     return this.iter.size_hint();
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     g: (acc: Acc, x: this["Item"]) => R
//   ): R {
//     return this.iter.try_fold(init, r, map_try_fold(this.f, g));
//   }
//
//   public fold<Acc>(init: Acc, g: (acc: Acc, x: this["Item"]) => Acc): Acc {
//     return this.iter.fold(init, map_fold(this.f, g));
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new MapForExactSizeAndDoubleEndedIterator(clone(this.iter), this.f);
//     } else if (isExactSizeIterator(this.iter)) {
//       return new MapForExactSizeIterator(clone(this.iter), this.f);
//     } else if (isDoubleEndedIterator(this.iter)) {
//       return new MapForDoubleEndedIterator(clone(this.iter), this.f);
//     } else {
//       return new Map(clone(this.iter), this.f);
//     }
//   }
// }
//
// export const ImplMapForExactSizeIterator = <T extends AnyConstructor<Map & ExactSizeIterator>>(
//   Base: T
// ) =>
//   class MapForExactSizeIterator extends Base {
//     public Self!: MapForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//
//     public len(): number {
//       return this.iter.len();
//     }
//
//     public is_empty(): boolean {
//       return this.iter.is_empty();
//     }
//   };
//
// export class MapForExactSizeIterator extends ImplMapForExactSizeIterator(
//   ImplExactSizeIterator(Map)
// ) {}
//
// export const ImplMapForDoubleEndedIterator = <T extends AnyConstructor<Map & DoubleEndedIterator>>(
//   Base: T
// ) =>
//   class MapForDoubleEndedIterator extends Base {
//     public Self!: MapForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator;
//
//     public next_back(): Option<this["Item"]> {
//       return this.iter.next_back().map(this.f);
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       g: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       return this.iter.try_rfold(init, r, map_try_fold(this.f, g));
//     }
//
//     public rfold<Acc>(init: Acc, g: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       return this.iter.rfold(init, map_fold(this.f, g));
//     }
//   };
//
// export class MapForDoubleEndedIterator extends ImplMapForDoubleEndedIterator(
//   ImplDoubleEndedIterator(Map)
// ) {}
// export class MapForExactSizeAndDoubleEndedIterator extends ImplMapForDoubleEndedIterator(
//   ImplMapForExactSizeIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Map)))
// ) {}
//
// function filter_fold<T, Acc>(
//   predicate: (t: T) => boolean,
//   fold: (acc: Acc, t: T) => Acc
// ): (acc: Acc, t: T) => Acc {
//   return (acc: Acc, item: T) => (predicate(item) ? fold(acc, item) : acc);
// }
//
// function filter_try_fold<T, Acc, R extends Try>(
//   predicate: (t: T) => boolean,
//   r: TryConstructor<R>,
//   fold: (acc: Acc, t: T) => R
// ): (acc: Acc, t: T) => R {
//   return (acc: Acc, item: T) => (predicate(item) ? fold(acc, item) : r.from_okay(acc));
// }
//
// export class Filter extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Filter;
//
//   public Iter!: IteratorBase;
//
//   public iter: this["Iter"];
//   public predicate: (item: this["Iter"]["Item"]) => boolean;
//
//   constructor(iter: IteratorBase, predicate: (item: any) => boolean) {
//     super();
//     this.iter = iter;
//     this.predicate = predicate;
//   }
//
//   public fmt_debug(): string {
//     return format("Filter({:?},{:?})", this.predicate, this.iter);
//   }
//
//   public next(): Option<this["Item"]> {
//     return this.iter.find(this.predicate);
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let [_, upper] = this.iter.size_hint();
//     return [0, upper]; // can't know a lower bound, due to the predicate
//   }
//
//   // public count(): number {
//   //   const to_number<T>(predicate: (t: T) => boolean): (t: T): number {
//   //     return (t: T) => +predicate(x)
//   //   }
//   //   return this.iter.map(this.predicate)).sum()
//   // }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, x: this["Item"]) => R
//   ): R {
//     return this.iter.try_fold(init, r, filter_try_fold(this.predicate, r, fold));
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
//     return this.iter.fold(init, filter_fold(this.predicate, fold));
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isDoubleEndedIterator(this.iter)) {
//       return new FilterForDoubleEndedIterator(clone(this.iter), this.predicate);
//     } else {
//       return new Filter(clone(this.iter), this.predicate);
//     }
//   }
// }
//
// export const ImplFilterForDoubleEndedIterator = <
//   T extends AnyConstructor<Filter & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class FilterForDoubleEndedIterator extends Base {
//     public Self!: FilterForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator;
//
//     public next_back(): Option<this["Item"]> {
//       return this.iter.rfind(this.predicate);
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       return this.iter.try_rfold(init, r, filter_try_fold(this.predicate, r, fold));
//     }
//
//     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       return this.iter.rfold(init, filter_fold(this.predicate, fold));
//     }
//   };
//
// export class FilterForDoubleEndedIterator extends ImplFilterForDoubleEndedIterator(
//   ImplDoubleEndedIterator(Filter)
// ) {}
//
// function filter_map_fold<T, B, Acc>(
//   f: (t: T) => Option<B>,
//   fold: (acc: Acc, b: B) => Acc
// ): (acc: Acc, t: T) => Acc {
//   return (acc: Acc, item: T): Acc => {
//     let match = f(item).match();
//     switch (match.type) {
//       case OptionType.Some:
//         return fold(acc, match.value);
//       case OptionType.None:
//         return acc;
//     }
//   };
// }
//
// function filter_map_try_fold<T, B, Acc, R extends Try>(
//   f: (t: T) => Option<B>,
//   r: TryConstructor<R>,
//   fold: (acc: Acc, b: B) => R
// ): (acc: Acc, t: T) => R {
//   return (acc: Acc, item: T) => {
//     let match = f(item).match();
//     switch (match.type) {
//       case OptionType.Some:
//         return fold(acc, match.value);
//       case OptionType.None:
//         return r.from_okay(acc);
//     }
//   };
// }
//
// export class FilterMap extends ImplClone(IteratorBase) implements Debug {
//   public Self!: FilterMap;
//
//   public Iter!: IteratorBase;
//   public IntoItem!: ReturnType<this["f"]>["Item"];
//
//   public iter: this["Iter"];
//   public f: (item: this["Iter"]["Item"]) => Option<any>;
//
//   constructor(iter: IteratorBase, f: (item: any) => Option<any>) {
//     super();
//     this.iter = iter;
//     this.f = f;
//   }
//
//   public fmt_debug(): string {
//     return format("FilterMap({:?},{:?})", this.f, this.iter);
//   }
//
//   public next(): Option<this["Item"]> {
//     return this.iter.find_map(this.f);
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let [_, upper] = this.iter.size_hint();
//     return [0, upper]; // can't know a lower bound, due to the predicate
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, x: this["Item"]) => R
//   ): R {
//     return this.iter.try_fold(init, r, filter_map_try_fold(this.f, r, fold));
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
//     return this.iter.fold(init, filter_map_fold(this.f, fold));
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isDoubleEndedIterator(this.iter)) {
//       return new FilterMapForDoubleEndedIterator(clone(this.iter), this.f);
//     } else {
//       return new FilterMap(clone(this.iter), this.f);
//     }
//   }
// }
//
// export const ImplFilterMapForDoubleEndedIterator = <
//   T extends AnyConstructor<FilterMap & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class FilterMapForDoubleEndedIterator extends Base {
//     public Self!: FilterMapForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator;
//
//     public next_back(): Option<this["IntoItem"]> {
//       const find = <T, B>(
//         f: (t: T) => Option<B>
//       ): ((_: undefined, t: T) => LoopState<undefined, B>) => {
//         return (_: undefined, t: T) => {
//           let match = f(t).match();
//           switch (match.type) {
//             case OptionType.Some:
//               return Break(match.value);
//             case OptionType.None:
//               return Continue(undefined);
//           }
//         };
//       };
//       return this.iter
//         .try_rfold<undefined, LoopState<undefined, this["IntoItem"]>>(
//           undefined,
//           LoopState,
//           find(this.f)
//         )
//         .break_value();
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       return this.iter.try_rfold(init, r, filter_map_try_fold(this.f, r, fold));
//     }
//
//     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       return this.iter.rfold(init, filter_map_fold(this.f, fold));
//     }
//   };
//
// export class FilterMapForDoubleEndedIterator extends ImplFilterMapForDoubleEndedIterator(
//   ImplDoubleEndedIterator(FilterMap)
// ) {}
//
// export class Enumerate extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Enumerate;
//
//   public Iter!: IteratorBase;
//   public Item!: [number, this["Iter"]["Item"]];
//
//   public iter: this["Iter"];
//   public _count: number;
//
//   constructor(iter: IteratorBase) {
//     super();
//     this.iter = iter;
//     this._count = 0;
//   }
//
//   public next(): Option<this["Item"]> {
//     return this.iter.next().map((a: this["Iter"]["Item"]) => {
//       let i = this._count;
//       this._count += 1;
//       return [i, a];
//     });
//   }
//
//   public size_hint(): [number, Option<number>] {
//     return this.iter.size_hint();
//   }
//
//   public nth(n: number): Option<this["Item"]> {
//     return this.iter.nth(n).map((a: this["Iter"]["Item"]): [number, this["Iter"]["Item"]] => {
//       let i = this._count + n;
//       this._count = i + 1;
//       return [i, a];
//     });
//   }
//
//   public count(): number {
//     return this.iter.count();
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     const enumerate = <T, Acc, R>(
//       fold: (acc: Acc, item: [number, T]) => R
//     ): ((acc: Acc, t: T) => R) => {
//       return (acc: Acc, item: T) => {
//         let res = fold(acc, [this._count, item]);
//         this._count += 1;
//         return res;
//       };
//     };
//
//     return this.iter.try_fold(init, r, enumerate(fold));
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     const enumerate = <T, Acc>(
//       count: number,
//       fold: (acc: Acc, item: [number, T]) => Acc
//     ): ((acc: Acc, t: T) => Acc) => {
//       return (acc: Acc, item: T) => {
//         acc = fold(acc, [count, item]);
//         count += 1;
//         return acc;
//       };
//     };
//
//     return this.iter.fold(init, enumerate(this._count, fold));
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new EnumerateForDoubleEndedIterator(clone(this.iter));
//     } else if (isExactSizeIterator(this.iter)) {
//       return new EnumerateForExactSizeIterator(clone(this.iter));
//     } else {
//       return new Enumerate(clone(this.iter));
//     }
//   }
//
//   public fmt_debug(): string {
//     return format("Enumerate({:?},{:?})", this._count, this.iter);
//   }
// }
//
// export const ImplEnumerateForExactSizeIterator = <
//   T extends AnyConstructor<Enumerate & ExactSizeIterator>
// >(
//   Base: T
// ) =>
//   class EnumerateForExactSizeIterator extends Base {
//     public Self!: EnumerateForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//
//     public len(): number {
//       return this.iter.len();
//     }
//
//     public is_empty(): boolean {
//       return this.iter.is_empty();
//     }
//   };
//
// export class EnumerateForExactSizeIterator extends ImplEnumerateForExactSizeIterator(
//   ImplExactSizeIterator(Enumerate)
// ) {}
//
// export const ImplEnumerateForDoubleEndedIterator = <
//   T extends AnyConstructor<EnumerateForExactSizeIterator & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class EnumerateForDoubleEndedIterator extends Base {
//     public Self!: EnumerateForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator & ExactSizeIterator;
//
//     public next_back(): Option<this["Item"]> {
//       return this.iter.next_back().map((a: this["Iter"]["Item"]) => {
//         let len = this.iter.len();
//         return [this._count + len, a];
//       });
//     }
//
//     public nth_back(n: number): Option<this["Item"]> {
//       return this.iter.nth_back(n).map((a: this["Iter"]["Item"]) => {
//         let len = this.iter.len();
//         return [this._count + len, a];
//       });
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       const enumerate = <T, Acc, R>(
//         count: number,
//         fold: (acc: Acc, item: [number, T]) => R
//       ): ((acc: Acc, item: T) => R) => {
//         return (acc: Acc, item: T) => {
//           count -= 1;
//           return fold(acc, [count, item]);
//         };
//       };
//
//       let count = this._count + this.iter.len();
//       return this.iter.try_rfold(init, r, enumerate(count, fold));
//     }
//
//     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       const enumerate = <T, Acc>(
//         count: number,
//         fold: (acc: Acc, item: [number, T]) => Acc
//       ): ((acc: Acc, item: T) => Acc) => {
//         return (acc: Acc, item: T) => {
//           count -= 1;
//           return fold(acc, [count, item]);
//         };
//       };
//
//       let count = this._count + this.iter.len();
//       return this.iter.rfold(init, enumerate(count, fold));
//     }
//   };
//
// export class EnumerateForDoubleEndedIterator extends ImplEnumerateForDoubleEndedIterator(
//   ImplDoubleEndedIterator(EnumerateForExactSizeIterator)
// ) {}
//
// export class Peekable extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Peekable;
//
//   public Iter!: IteratorBase;
//   // FIXME
//   // public Item!: this["Iter"]["Item"]
//
//   public iter: this["Iter"];
//   public peeked: Option<Option<this["Item"]>>;
//
//   constructor(iter: IteratorBase) {
//     super();
//     this.iter = iter;
//     this.peeked = None();
//   }
//
//   public peek(): Option<this["Item"]> {
//     return this.peeked.get_or_insert_with(() => this.iter.next());
//   }
//
//   // Iterator
//   public next(): Option<this["Item"]> {
//     let match = this.peeked.take().match();
//     switch (match.type) {
//       case OptionType.Some:
//         return match.value;
//       case OptionType.None:
//         return this.iter.next();
//     }
//   }
//
//   public count(): number {
//     let match = this.peeked.take().match();
//     switch (match.type) {
//       case OptionType.Some: {
//         let inner_match = match.value.match();
//         switch (inner_match.type) {
//           case OptionType.None:
//             return 0;
//           case OptionType.Some:
//             return 1 + this.iter.count();
//         }
//       }
//       case OptionType.None:
//         return this.iter.count();
//     }
//   }
//
//   public nth(n: number): Option<this["Item"]> {
//     let match = this.peeked.take().match();
//     switch (match.type) {
//       case OptionType.Some: {
//         let inner_match = match.value.match();
//         switch (inner_match.type) {
//           case OptionType.None:
//             return None();
//           case OptionType.Some:
//             return n === 0 ? match.value : this.iter.nth(n - 1);
//         }
//       }
//       case OptionType.None:
//         return this.iter.nth(n);
//     }
//   }
//
//   public last(): Option<this["Item"]> {
//     let peek_opt: Option<this["Item"]> = None();
//     let match = this.peeked.take().match();
//     switch (match.type) {
//       case OptionType.Some: {
//         if (match.value.is_none()) {
//           return None();
//         }
//         peek_opt = match.value;
//         break;
//       }
//     }
//     return this.iter.last().or(peek_opt);
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let peek_len: number = 0;
//     let match = this.peeked.match();
//     switch (match.type) {
//       case OptionType.Some: {
//         let inner_match = match.value.match();
//         switch (inner_match.type) {
//           case OptionType.None:
//             return [0, Some(0)];
//           case OptionType.Some:
//             peek_len = 1;
//         }
//       }
//     }
//     let [lo, hi] = this.iter.size_hint();
//     lo = u64_saturating_add(lo, peek_len);
//     let match_hi = hi.match();
//     switch (match_hi.type) {
//       case OptionType.Some:
//         hi = u64_checked_add(match_hi.value, peek_len);
//         break;
//       case OptionType.None:
//         hi = None();
//     }
//     return [lo, hi];
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     f: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     let acc: Acc = init;
//     let match = this.peeked.take().match();
//     switch (match.type) {
//       case OptionType.Some: {
//         let inner_match = match.value.match();
//         switch (inner_match.type) {
//           case OptionType.None:
//             return r.from_okay(init);
//           case OptionType.Some: {
//             let try_acc = f(init, inner_match.value);
//             if (try_acc.is_error()) {
//               return try_acc;
//             }
//             acc = try_acc.unwrap();
//           }
//         }
//       }
//     }
//     return this.iter.try_fold(acc, r, f);
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     let acc: Acc = init;
//     let match = this.peeked.match();
//     switch (match.type) {
//       case OptionType.Some: {
//         let inner_match = match.value.match();
//         switch (inner_match.type) {
//           case OptionType.None:
//             return init;
//           case OptionType.Some:
//             acc = fold(init, inner_match.value);
//         }
//       }
//     }
//
//     return this.iter.fold(acc, fold);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new PeekableForDoubleEndedIterator(clone(this.iter));
//     } else if (isExactSizeIterator(this.iter)) {
//       return new PeekableForExactSizeIterator(clone(this.iter));
//     } else if (isDoubleEndedIterator(this.iter)) {
//       return new PeekableForDoubleEndedIterator(clone(this.iter));
//     } else {
//       return new Peekable(clone(this.iter));
//     }
//   }
//
//   public fmt_debug(): string {
//     return format("Peekable({:?},{:?})", this.peeked, this.iter);
//   }
// }
//
// export const ImplPeekableForExactSizeIterator = <
//   T extends AnyConstructor<Peekable & ExactSizeIterator>
// >(
//   Base: T
// ) =>
//   class PeekableForExactSizeIterator extends Base {
//     public Self!: PeekableForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//   };
//
// export class PeekableForExactSizeIterator extends ImplPeekableForExactSizeIterator(
//   ImplExactSizeIterator(Peekable)
// ) {}
//
// export const ImplPeekableForDoubleEndedIterator = <
//   T extends AnyConstructor<Peekable & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class PeekableForDoubleEndedIterator extends Base {
//     public Self!: PeekableForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator;
//
//     public next_back(): Option<this["Item"]> {
//       return this.iter
//         .next_back()
//         .or_else(() => this.peeked.take().and_then((x: this["Item"]) => x));
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       f: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       let match = this.peeked.take().match();
//       switch (match.type) {
//         case OptionType.Some: {
//           let inner_match = match.value.match();
//           switch (inner_match.type) {
//             case OptionType.None:
//               return r.from_okay(init);
//             case OptionType.Some: {
//               let res_match = this.iter
//                 .try_rfold(init, r, f)
//                 .into_result()
//                 .match();
//               switch (res_match.type) {
//                 case ResultType.Ok:
//                   return f(res_match.value, inner_match.value);
//                 case ResultType.Err: {
//                   this.peeked = Some(Some(inner_match.value));
//                   return r.from_error(res_match.value);
//                 }
//               }
//             }
//           }
//         }
//       }
//       return this.iter.try_rfold(init, r, f);
//     }
//
//     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       let match = this.peeked.match();
//       switch (match.type) {
//         case OptionType.Some: {
//           let inner_match = match.value.match();
//           switch (inner_match.type) {
//             case OptionType.None:
//               return init;
//             case OptionType.Some: {
//               let acc = this.iter.rfold(init, fold);
//               return fold(acc, inner_match.value);
//             }
//           }
//         }
//       }
//       return this.iter.rfold(init, fold);
//     }
//   };
//
// export class PeekableForDoubleEndedIterator extends ImplPeekableForDoubleEndedIterator(
//   ImplDoubleEndedIterator(PeekableForExactSizeIterator)
// ) {}
// export class PeekableForExactSizeAndDoubleEndedIterator extends ImplPeekableForDoubleEndedIterator(
//   ImplPeekableForExactSizeIterator(
//     ImplDoubleEndedIterator(ImplExactSizeIterator(PeekableForExactSizeIterator))
//   )
// ) {}
//
// // An iterator that rejects elements while `predicate` returns `true`.
// export class SkipWhile extends ImplClone(IteratorBase) implements Debug {
//   public Self!: SkipWhile;
//
//   public Iter!: IteratorBase;
//   public Item!: this["iter"]["Item"];
//
//   public iter: this["Iter"];
//   public flag: boolean;
//   public predicate: (item: this["Item"]) => boolean;
//
//   constructor(iter: IteratorBase, predicate: (item: any) => boolean) {
//     super();
//     this.iter = iter;
//     this.flag = false;
//     this.predicate = predicate;
//   }
//
//   public fmt_debug(): string {
//     return format("SkipWhile({:?},{:?})", this.predicate, this.iter);
//   }
//
//   // Iterator
//   public next(): Option<this["Item"]> {
//     const check = <T>(pred: (t: T) => boolean): ((t: T) => boolean) => {
//       return (x: T) => {
//         if (this.flag || !pred(x)) {
//           this.flag = true;
//           return true;
//         } else {
//           return false;
//         }
//       };
//     };
//     return this.iter.find(check(this.predicate));
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let [_, upper] = this.iter.size_hint();
//     return [0, upper]; // can't know a lower bound, due to the predicate
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, x: this["Item"]) => R
//   ): R {
//     let acc = init;
//     if (!this.flag) {
//       let match = this.next().match();
//       switch (match.type) {
//         case OptionType.Some: {
//           let try_acc = fold(init, match.value);
//           if (try_acc.is_error()) {
//             return r.from_okay(init);
//           }
//           acc = try_acc.unwrap();
//           break;
//         }
//         case OptionType.None:
//           return r.from_okay(init);
//       }
//     }
//     return this.iter.try_fold(acc, r, fold);
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, x: this["Item"]) => Acc): Acc {
//     if (!this.flag) {
//       let match = this.next().match();
//       switch (match.type) {
//         case OptionType.Some: {
//           init = fold(init, match.value);
//           break;
//         }
//         case OptionType.None:
//           return init;
//       }
//     }
//     return this.iter.fold(init, fold);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     return new SkipWhile(clone(this.iter), this.predicate);
//   }
// }
//
// /**
//  * An iterator that only accepts elements while `predicate` returns `true`.
//  */
// export class TakeWhile extends ImplClone(IteratorBase) implements Debug {
//   public Self!: TakeWhile;
//
//   public Iter!: IteratorBase;
//   public Item!: this["iter"]["Item"];
//
//   public iter: this["Iter"];
//   public flag: boolean;
//   public predicate: (item: this["Item"]) => boolean;
//
//   constructor(iter: IteratorBase, predicate: (item: any) => boolean) {
//     super();
//     this.iter = iter;
//     this.flag = false;
//     this.predicate = predicate;
//   }
//
//   public next(): Option<this["Item"]> {
//     if (this.flag) {
//       return None();
//     } else {
//       return this.iter.next().and_then(x => {
//         if (this.predicate(x)) {
//           return Some(x);
//         } else {
//           this.flag = true;
//           return None();
//         }
//       });
//     }
//   }
//
//   public size_hint(): [number, Option<number>] {
//     if (this.flag) {
//       return [0, Some(0)];
//     } else {
//       let [_, upper] = this.iter.size_hint();
//       return [0, upper]; // can't know a lower bound, due to the predicate
//     }
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     const check = <T, Acc, R extends Try>(
//       p: (t: T) => boolean,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, t: T) => R
//     ): ((acc: Acc, t: T) => LoopState<Acc, R>) => {
//       return (acc: Acc, t: T) => {
//         if (p(t)) {
//           return LoopState.from_try(fold(acc, t));
//         } else {
//           this.flag = true;
//           return Break(r.from_okay(acc));
//         }
//       };
//     };
//
//     if (this.flag) {
//       return r.from_okay(init);
//     } else {
//       return this.iter
//         .try_fold<Acc, LoopState<Acc, R>>(init, LoopState, check(this.predicate, r, fold))
//         .into_try(r);
//     }
//   }
//
//   public clone(): this["Self"] {
//     return new TakeWhile(clone(this.iter), this.predicate);
//   }
//
//   public fmt_debug(): string {
//     return format("TakeWhile({:?},{:?})", this.predicate, this.iter);
//   }
// }
//
// /**
//  * An iterator that skips over `n` elements of `iter`.
//  */
// export class Skip extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Skip;
//
//   public Iter!: IteratorBase;
//   // FIXME
//   // public Item!: this["iter"]["Item"]
//
//   public iter: this["Iter"];
//   public n: number;
//
//   constructor(iter: IteratorBase, n: number) {
//     super();
//     this.iter = iter;
//     this.n = u64(n);
//   }
//
//   public next(): Option<this["Item"]> {
//     if (this.n === 0) {
//       return this.iter.next();
//     } else {
//       let old_n = this.n;
//       this.n = 0;
//       return this.iter.nth(old_n);
//     }
//   }
//
//   public nth(n: number): Option<this["Item"]> {
//     if (this.n === 0) {
//       return this.iter.nth(n);
//     } else {
//       let to_skip = this.n;
//       this.n = 0;
//       // nth(n) skips n+1
//       if (this.iter.nth(to_skip - 1).is_none()) {
//         return None();
//       }
//       return this.iter.nth(n);
//     }
//   }
//
//   public count(): number {
//     return u64_saturating_sub(this.iter.count(), this.n);
//   }
//
//   public last(): Option<this["Item"]> {
//     if (this.n === 0) {
//       return this.iter.last();
//     } else {
//       let next = this.next();
//       if (next.is_some()) {
//         // recurse. n should be 0.
//         return this.last().or(next);
//       } else {
//         return None();
//       }
//     }
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let [lower, upper] = this.iter.size_hint();
//
//     lower = u64_saturating_sub(lower, this.n);
//     let upper_match = upper.match();
//     switch (upper_match.type) {
//       case OptionType.Some:
//         upper = Some(u64_saturating_sub(upper_match.value, this.n));
//         break;
//       case OptionType.None:
//         upper = None();
//         break;
//     }
//
//     return [lower, upper];
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     let n = this.n;
//     this.n = 0;
//     if (n > 0) {
//       // nth(n) skips n+1
//       if (this.iter.nth(n - 1).is_none()) {
//         return r.from_okay(init);
//       }
//     }
//     return this.iter.try_fold(init, r, fold);
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     let n = this.n;
//     this.n = 0;
//     if (n > 0) {
//       // nth(n) skips n+1
//       if (this.iter.nth(n - 1).is_none()) {
//         return init;
//       }
//     }
//     return this.iter.fold(init, fold);
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new SkipForDoubleEndedIterator(clone(this.iter), this.n);
//     } else if (isExactSizeIterator(this)) {
//       return new SkipForExactSizeIterator(clone(this.iter), this.n);
//     } else {
//       return new Skip(clone(this.iter), this.n);
//     }
//   }
//
//   public fmt_debug(): string {
//     return format("Skip({:?},{:?})", this.n, this.iter);
//   }
// }
//
// export const ImplSkipForExactSizeIterator = <T extends AnyConstructor<Skip & ExactSizeIterator>>(
//   Base: T
// ) =>
//   class SkipForExactSizeIterator extends Base {
//     public Self!: SkipForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//   };
//
// export class SkipForExactSizeIterator extends ImplSkipForExactSizeIterator(
//   ImplExactSizeIterator(Skip)
// ) {}
//
// export const ImplSkipForDoubleEndedIterator = <
//   T extends AnyConstructor<Skip & ExactSizeIterator & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class SkipForDoubleEndedIterator extends Base {
//     public Self!: SkipForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator & ExactSizeIterator;
//
//     public next_back(): Option<this["Item"]> {
//       if (this.len() > 0) {
//         return this.iter.next_back();
//       } else {
//         return None();
//       }
//     }
//
//     public nth_back(n: number): Option<this["Item"]> {
//       let len = this.len();
//       if (n < len) {
//         return this.iter.nth_back(n);
//       } else {
//         if (len > 0) {
//           // consume the original iterator
//           this.iter.nth_back(len - 1);
//         }
//         return None();
//       }
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       const check = <T, Acc, R extends Try>(
//         n: number,
//         r: TryConstructor<R>,
//         fold: (acc: Acc, t: T) => R
//       ): ((acc: Acc, t: T) => LoopState<Acc, R>) => {
//         return (acc: Acc, t: T) => {
//           n -= 1;
//           let res = fold(acc, t);
//           if (n === 0) {
//             return Break(res);
//           } else {
//             return LoopState.from_try(res);
//           }
//         };
//       };
//
//       let n = this.len();
//       if (n === 0) {
//         return r.from_okay(init);
//       } else {
//         return this.iter
//           .try_rfold<Acc, LoopState<Acc, R>>(init, LoopState, check(n, r, fold))
//           .into_try(r);
//       }
//     }
//   };
//
// export class SkipForDoubleEndedIterator extends ImplSkipForDoubleEndedIterator(
//   ImplSkipForExactSizeIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Skip)))
// ) {}
//
// export class Take extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Take;
//
//   public Iter!: IteratorBase;
//   // FIXME
//   // public Item!: this["Iter"]["Item"]
//
//   public iter: this["Iter"];
//   public n: number;
//
//   constructor(iter: IteratorBase, n: number) {
//     super();
//     assert(n >= 0);
//     this.iter = iter;
//     this.n = u64(n);
//   }
//
//   public next(): Option<this["Item"]> {
//     if (this.n !== 0) {
//       this.n -= 1;
//       return this.iter.next();
//     } else {
//       return None();
//     }
//   }
//
//   public nth(n: number): Option<this["Item"]> {
//     if (this.n > n) {
//       this.n -= n + 1;
//       return this.iter.nth(n);
//     } else {
//       if (this.n > 0) {
//         this.iter.nth(this.n - 1);
//         this.n = 0;
//       }
//       return None();
//     }
//   }
//
//   public size_hint(): [number, Option<number>] {
//     if (this.n === 0) {
//       return [0, Some(0)];
//     }
//
//     let [lower, upper] = this.iter.size_hint();
//
//     lower = Math.min(lower, this.n);
//
//     let match_upper = upper.match();
//     switch (match_upper.type) {
//       case OptionType.Some:
//         let x = match_upper.value;
//         if (x < this.n) {
//           upper = Some(x);
//           break;
//         }
//       default:
//         upper = Some(this.n);
//         break;
//     }
//
//     return [lower, upper];
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     const check = <T, Acc, R extends Try>(
//       fold: (acc: Acc, t: T) => R
//     ): ((acc: Acc, t: T) => LoopState<Acc, R>) => {
//       return (acc: Acc, t: T) => {
//         this.n -= 1;
//         let res = fold(acc, t);
//         if (this.n === 0) {
//           return Break(res);
//         } else {
//           return LoopState.from_try(res);
//         }
//       };
//     };
//
//     if (this.n === 0) {
//       return r.from_okay(init);
//     } else {
//       return this.iter.try_fold<Acc, LoopState<Acc, R>>(init, LoopState, check(fold)).into_try(r);
//     }
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new TakeForDoubleEndedIterator(clone(this.iter), this.n);
//     } else if (isExactSizeIterator(this)) {
//       return new TakeForExactSizeIterator(clone(this.iter), this.n);
//     } else {
//       return new Take(clone(this.iter), this.n);
//     }
//   }
//
//   public fmt_debug(): string {
//     return format("Take({:?},{:?})", this.n, this.iter);
//   }
// }
//
// export const ImplTakeForExactSizeIterator = <T extends AnyConstructor<Take & ExactSizeIterator>>(
//   Base: T
// ) =>
//   class TakeForExactSizeIterator extends Base {
//     public Self!: TakeForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//   };
//
// export class TakeForExactSizeIterator extends ImplTakeForExactSizeIterator(
//   ImplExactSizeIterator(Take)
// ) {}
//
// export const ImplTakeForDoubleEndedIterator = <
//   T extends AnyConstructor<Take & ExactSizeIterator & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class TakeForDoubleEndedIterator extends Base {
//     public Self!: TakeForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator & ExactSizeIterator;
//
//     public next_back(): Option<this["Item"]> {
//       if (this.n === 0) {
//         return None();
//       } else {
//         let n = this.n;
//         this.n -= 1;
//         return this.iter.nth_back(u64_saturating_sub(this.iter.len(), n));
//       }
//     }
//
//     public nth_back(n: number): Option<this["Item"]> {
//       let len = this.iter.len();
//       if (this.n > n) {
//         let m = u64_saturating_sub(len, this.n) + n;
//         this.n -= n + 1;
//         return this.iter.nth_back(m);
//       } else {
//         if (len > 0) {
//           return this.iter.nth_back(len - 1);
//         }
//         return None();
//       }
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       if (this.n === 0) {
//         return r.from_okay(init);
//       } else {
//         let len = this.iter.len();
//         if (len > this.n && this.iter.nth_back(len - this.n - 1).is_none()) {
//           return r.from_okay(init);
//         } else {
//           return this.iter.try_rfold(init, r, fold);
//         }
//       }
//     }
//   };
//
// export class TakeForDoubleEndedIterator extends ImplTakeForDoubleEndedIterator(
//   ImplTakeForExactSizeIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Take)))
// ) {}
//
// export class Scan extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Scan;
//
//   public Iter!: IteratorBase;
//   public Item!: ReturnType<this["f"]>["Item"];
//   public State!: this["state"];
//
//   public iter: this["Iter"];
//   public f: (state: this["State"], item: this["iter"]["Item"]) => Option<any>;
//   public state: any;
//
//   constructor(iter: IteratorBase, state: any, f: (state: any, item: any) => Option<any>) {
//     super();
//     this.iter = iter;
//     this.f = f;
//     this.state = state;
//   }
//
//   public next(): Option<this["Item"]> {
//     let opt_a = this.iter.next();
//     if (opt_a.is_none()) {
//       return None();
//     }
//     let a = opt_a.unwrap();
//     return this.f(this.state, a);
//   }
//
//   public size_hint(): [number, Option<number>] {
//     let [_, upper] = this.iter.size_hint();
//     return [0, upper]; // can't know a lower bound, due to the scan function
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     const scan = <T, St, B, Acc, R extends Try>(
//       f: (st: St, t: T) => Option<B>,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, b: B) => R
//     ): ((acc: Acc, t: T) => LoopState<Acc, R>) => {
//       return (acc: Acc, t: T) => {
//         let match = f(this.state, t).match();
//         switch (match.type) {
//           case OptionType.None:
//             return Break(r.from_okay(acc));
//           case OptionType.Some:
//             return LoopState.from_try(fold(acc, match.value));
//         }
//       };
//     };
//
//     return this.iter
//       .try_fold<Acc, LoopState<Acc, R>>(this.state, LoopState, scan(this.f, r, fold))
//       .into_try(r);
//   }
//
//   public clone(): this["Self"] {
//     return new Scan(clone(this.iter), clone(this.state), this.f);
//   }
//
//   public fmt_debug(): string {
//     return format("Scan({:?},{:?},{:?})", this.state, this.f, this.iter);
//   }
// }
//
// // export class Fuse extends ImplClone(IteratorBase) implements Debug {
// //   public Self!: Fuse;
// //
// //   public Iter!: IteratorBase;
// //
// //   public iter: this["Iter"];
// //   public done: boolean;
// //
// //   constructor(iter: IteratorBase) {
// //     super();
// //     this.iter = iter;
// //     this.done = false;
// //   }
// //
// //   public clone(): this["Self"] {
// //     if (
// //       isFusedIterator(this.iter) &&
// //       isExactSizeIterator(this.iter) &&
// //       isDoubleEndedIterator(this.iter)
// //     ) {
// //       return new FuseForFusedAndExactSizeAndDoubleEndedIterator(clone(this.iter));
// //     } else if (isFusedIterator(this.iter) && isExactSizeIterator(this.iter)) {
// //       return new FuseForFusedAndExactSizeIterator(clone(this.iter));
// //     } else if (isFusedIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
// //       return new FuseForFusedAndDoubleEndedIterator(clone(this.iter));
// //     } else if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
// //       return new FuseForExactSizeAndDoubleEndedIterator(clone(this.iter));
// //     } else if (isExactSizeIterator(this.iter)) {
// //       return new FuseForExactSizeIterator(clone(this.iter));
// //     } else if (isDoubleEndedIterator(this.iter)) {
// //       return new FuseForDoubleEndedIterator(clone(this.iter));
// //     } else if (isFusedIterator(this.iter)) {
// //       return new FuseForFusedIterator(clone(this.iter));
// //     } else {
// //       return new FuseForIterator(clone(this.iter));
// //     }
// //   }
// //
// //   public fmt_debug(): string {
// //     return format("Fuse({:?},{:?})", this.done, this.iter);
// //   }
// // }
// //
// // export const ImplFuseForIterator = <T extends AnyConstructor<Fuse>>(Base: T) =>
// //   class FuseForIterator extends Base {
// //     public Self!: FuseForIterator;
// //
// //     public next(): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let next = this.iter.next();
// //         this.done = next.is_none();
// //         return next;
// //       }
// //     }
// //
// //     public nth(n: number): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let nth = this.iter.nth(n);
// //         this.done = nth.is_none();
// //         return nth;
// //       }
// //     }
// //
// //     public last(): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         return this.iter.last();
// //       }
// //     }
// //
// //     public count(): number {
// //       if (this.done) {
// //         return 0;
// //       } else {
// //         return this.iter.count();
// //       }
// //     }
// //
// //     public size_hint(): [number, Option<number>] {
// //       if (this.done) {
// //         return [0, Some(0)];
// //       } else {
// //         return this.iter.size_hint();
// //       }
// //     }
// //
// //     public try_fold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       if (this.done) {
// //         return r.from_okay(init);
// //       } else {
// //         let try_acc = this.iter.try_fold(init, r, fold);
// //         if (try_acc.is_error()) {
// //           return try_acc;
// //         }
// //         let acc = try_acc.unwrap();
// //         this.done = true;
// //         return r.from_okay(acc);
// //       }
// //     }
// //
// //     public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       if (this.done) {
// //         return init;
// //       } else {
// //         return this.iter.fold(init, fold);
// //       }
// //     }
// //   };
// //
// // export class FuseForIterator extends ImplFuseForIterator(Fuse) {}
// //
// // export const ImplFuseForDoubleEndedIterator = <
// //   T extends AnyConstructor<FuseForIterator & DoubleEndedIterator>
// // >(
// //   Base: T
// // ) =>
// //   class FuseForDoubleEndedIterator extends Base {
// //     public Self!: FuseForDoubleEndedIterator;
// //
// //     public Iter!: DoubleEndedIterator;
// //
// //     public next_back(): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let next = this.iter.next_back();
// //         this.done = next.is_none();
// //         return next;
// //       }
// //     }
// //
// //     public nth_back(n: number): Option<this["Item"]> {
// //       if (this.done) {
// //         return None();
// //       } else {
// //         let nth = this.iter.nth_back(n);
// //         this.done = nth.is_none();
// //         return nth;
// //       }
// //     }
// //
// //     public try_rfold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       if (this.done) {
// //         return r.from_okay(init);
// //       } else {
// //         let try_acc = this.iter.try_rfold(init, r, fold);
// //         if (try_acc.is_error()) {
// //           return try_acc;
// //         }
// //         let acc = try_acc.unwrap();
// //         this.done = true;
// //         return r.from_okay(acc);
// //       }
// //     }
// //
// //     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       if (this.done) {
// //         return init;
// //       } else {
// //         return this.iter.rfold(init, fold);
// //       }
// //     }
// //   };
// //
// // export class FuseForDoubleEndedIterator extends ImplFuseForDoubleEndedIterator(
// //   ImplDoubleEndedIterator(ImplFuseForIterator(Fuse))
// // ) {}
// //
// // export const ImplFuseForFusedIterator = <T extends AnyConstructor<Fuse & FusedIterator>>(Base: T) =>
// //   class FuseForFusedIterator extends Base {
// //     public Self!: FuseForFusedIterator;
// //
// //     public Iter!: FusedIterator;
// //
// //     public next(): Option<this["Item"]> {
// //       return this.iter.next();
// //     }
// //
// //     public nth(n: number): Option<this["Item"]> {
// //       return this.iter.nth(n);
// //     }
// //
// //     public last(): Option<this["Item"]> {
// //       return this.iter.last();
// //     }
// //
// //     public count(): number {
// //       return this.iter.count();
// //     }
// //
// //     public size_hint(): [number, Option<number>] {
// //       return this.iter.size_hint();
// //     }
// //
// //     public try_fold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       return this.iter.try_fold(init, r, fold);
// //     }
// //
// //     public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       return this.iter.fold(init, fold);
// //     }
// //   };
// //
// // export class FuseForFusedIterator extends ImplFuseForFusedIterator(ImplFusedIterator(Fuse)) {}
// //
// // export const ImplFuseForFusedAndDoubleEndedIterator = <
// //   T extends AnyConstructor<Fuse & DoubleEndedIterator>
// // >(
// //   Base: T
// // ) =>
// //   class FuseForFusedAndDoubleEndedIterator extends Base {
// //     public Self!: FuseForFusedAndDoubleEndedIterator;
// //
// //     public Iter!: FusedIterator & DoubleEndedIterator;
// //
// //     public next_back(): Option<this["Item"]> {
// //       return this.iter.next_back();
// //     }
// //
// //     public nth_back(n: number): Option<this["Item"]> {
// //       return this.iter.nth_back(n);
// //     }
// //
// //     public try_rfold<Acc, R extends Try>(
// //       init: Acc,
// //       r: TryConstructor<R>,
// //       fold: (acc: Acc, item: this["Item"]) => R
// //     ): R {
// //       return this.iter.try_rfold(init, r, fold);
// //     }
// //
// //     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
// //       return this.iter.rfold(init, fold);
// //     }
// //   };
// //
// // export class FuseForFusedAndDoubleEndedIterator extends ImplFuseForFusedAndDoubleEndedIterator(
// //   ImplFuseForFusedIterator(ImplDoubleEndedIterator(ImplFusedIterator(Fuse)))
// // ) {}
// //
// // export const ImplFuseForExactSizeIterator = <T extends AnyConstructor<Fuse & ExactSizeIterator>>(
// //   Base: T
// // ) =>
// //   class FuseForExactSizeIterator extends Base {
// //     public Self!: FuseForExactSizeIterator;
// //
// //     public Iter!: ExactSizeIterator;
// //
// //     public len(): number {
// //       return this.iter.len();
// //     }
// //
// //     public is_empty(): boolean {
// //       return this.iter.is_empty();
// //     }
// //   };
// //
// // export class FuseForExactSizeIterator extends ImplFuseForExactSizeIterator(
// //   ImplFuseForIterator(ImplExactSizeIterator(Fuse))
// // ) {}
// // export class FuseForExactSizeAndDoubleEndedIterator extends ImplFuseForExactSizeIterator(
// //   ImplFuseForIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Fuse)))
// // ) {}
// // export class FuseForFusedAndExactSizeIterator extends ImplFuseForExactSizeIterator(
// //   ImplFuseForFusedIterator(ImplExactSizeIterator(ImplFusedIterator(Fuse)))
// // ) {}
// // export class FuseForFusedAndExactSizeAndDoubleEndedIterator extends ImplFuseForFusedAndDoubleEndedIterator(
// //   ImplFuseForExactSizeIterator(
// //     ImplFuseForFusedIterator(
// //       ImplDoubleEndedIterator(ImplExactSizeIterator(ImplFusedIterator(Fuse)))
// //     )
// //   )
// // ) {}
//
// function inspect_fold<T, Acc>(
//   f: (t: T) => void,
//   fold: (acc: Acc, t: T) => Acc
// ): (acc: Acc, t: T) => Acc {
//   return (acc: Acc, item: T) => {
//     f(item);
//     return fold(acc, item);
//   };
// }
//
// function inspect_try_fold<T, Acc, R>(
//   f: (t: T) => void,
//   fold: (acc: Acc, t: T) => R
// ): (acc: Acc, t: T) => R {
//   return (acc: Acc, item: T) => {
//     f(item);
//     return fold(acc, item);
//   };
// }
//
// export class Inspect extends ImplClone(IteratorBase) implements Debug {
//   public Self!: Inspect;
//
//   public Iter!: IteratorBase;
//
//   public iter: this["Iter"];
//   public f: (item: this["Item"]) => void;
//
//   constructor(iter: IteratorBase, f: (item: any) => void) {
//     super();
//     this.iter = iter;
//     this.f = f;
//   }
//
//   public do_inspect(elt: Option<this["Item"]>): Option<this["Item"]> {
//     if (elt.is_some()) {
//       this.f(elt.unwrap());
//     }
//
//     return elt;
//   }
//
//   // Iterator
//   public next(): Option<this["Item"]> {
//     let next = this.iter.next();
//     return this.do_inspect(next);
//   }
//
//   public size_hint(): [number, Option<number>] {
//     return this.iter.size_hint();
//   }
//
//   public try_fold<Acc, R extends Try>(
//     init: Acc,
//     r: TryConstructor<R>,
//     fold: (acc: Acc, item: this["Item"]) => R
//   ): R {
//     return this.iter.try_fold(init, r, inspect_try_fold(this.f, fold));
//   }
//
//   public fold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//     return this.iter.fold(init, inspect_fold(this.f, fold));
//   }
//
//   // Clone
//   public clone(): this["Self"] {
//     if (isExactSizeIterator(this.iter) && isDoubleEndedIterator(this.iter)) {
//       return new InspectForExactSizeAndDoubleEndedIterator(clone(this.iter), this.f);
//     } else if (isExactSizeIterator(this.iter)) {
//       return new InspectForExactSizeIterator(clone(this.iter), this.f);
//     } else if (isDoubleEndedIterator(this.iter)) {
//       return new InspectForDoubleEndedIterator(clone(this.iter), this.f);
//     } else {
//       return new Inspect(clone(this.iter), this.f);
//     }
//   }
//
//   // Debug
//   public fmt_debug(): string {
//     return format("Inspect({:?},{:?})", this.f, this.iter);
//   }
// }
//
// export const ImplInspectForExactSizeIterator = <
//   T extends AnyConstructor<Inspect & ExactSizeIterator>
// >(
//   Base: T
// ) =>
//   class InspectForExactSizeIterator extends Base {
//     public Self!: InspectForExactSizeIterator;
//
//     public Iter!: ExactSizeIterator;
//
//     public len(): number {
//       return this.iter.len();
//     }
//
//     public is_empty(): boolean {
//       return this.iter.is_empty();
//     }
//   };
//
// export class InspectForExactSizeIterator extends ImplInspectForExactSizeIterator(
//   ImplExactSizeIterator(Inspect)
// ) {}
//
// export const ImplInspectForDoubleEndedIterator = <
//   T extends AnyConstructor<Inspect & DoubleEndedIterator>
// >(
//   Base: T
// ) =>
//   class InspectForDoubleEndedIterator extends Base {
//     public Self!: InspectForDoubleEndedIterator;
//
//     public Iter!: DoubleEndedIterator;
//
//     public next_back(): Option<this["Item"]> {
//       let next = this.iter.next_back();
//       return this.do_inspect(next);
//     }
//
//     public try_rfold<Acc, R extends Try>(
//       init: Acc,
//       r: TryConstructor<R>,
//       fold: (acc: Acc, item: this["Item"]) => R
//     ): R {
//       return this.iter.try_rfold(init, r, inspect_try_fold(this.f, fold));
//     }
//
//     public rfold<Acc>(init: Acc, fold: (acc: Acc, item: this["Item"]) => Acc): Acc {
//       return this.iter.rfold(init, inspect_fold(this.f, fold));
//     }
//   };
//
// export class InspectForDoubleEndedIterator extends ImplInspectForDoubleEndedIterator(
//   ImplDoubleEndedIterator(Inspect)
// ) {}
// export class InspectForExactSizeAndDoubleEndedIterator extends ImplInspectForDoubleEndedIterator(
//   ImplInspectForExactSizeIterator(ImplDoubleEndedIterator(ImplExactSizeIterator(Inspect)))
// ) {}
//
// declare module "./iter" {
//   interface IteratorFace {
//     /**
//      * Creates an iterator starting at the same point, but stepping by the given amount at each
//      * iteration.
//      */
//     step_by<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       n: number
//     ): StepByForDoubleEndedIterator;
//     step_by<Self extends ExactSizeIterator>(this: Self, n: number): StepByForExactSizeIterator;
//     step_by(n: number): StepBy;
//
//     /**
//      * Takes two iterators and creates a new iterator over both in sequence.
//      */
//     // chain<Self extends IteratorBase, U extends IntoIterator<Self["Item"]>>(this: Self, other: U): Chain
//
//     /**
//      * 'Zips up' two iterators into a single iterator of pairs.
//      */
//     // zip<Self extends IteratorBase, U extends IntoIterator>(this: Self, other: U): Zip
//
//     /**
//      * Takes a closure anc creates an iterator which calls that closure on each
//      * element.
//      */
//     map<Self extends ExactSizeIterator & DoubleEndedIterator, B>(
//       this: Self,
//       f: (x: Self["Item"]) => B
//     ): MapForExactSizeAndDoubleEndedIterator;
//     map<Self extends ExactSizeIterator, B>(
//       this: Self,
//       f: (x: Self["Item"]) => B
//     ): MapForExactSizeIterator;
//     map<Self extends DoubleEndedIterator, B>(
//       this: Self,
//       f: (x: Self["Item"]) => B
//     ): MapForDoubleEndedIterator;
//     map<Self extends IteratorBase, B>(this: Self, f: (x: Self["Item"]) => B): Map;
//
//     /**
//      * Creates an iterator which uses a closure to determine if an element
//      * should be yielded.
//      */
//     filter<Self extends DoubleEndedIterator>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): FilterForDoubleEndedIterator;
//     filter<Self extends IteratorBase>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): Filter;
//
//     /**
//      * Creates an iterator that both filters and maps.
//      */
//     filter_map<Self extends DoubleEndedIterator, B>(
//       this: Self,
//       f: (item: Self["Item"]) => Option<B>
//     ): FilterMapForDoubleEndedIterator;
//     filter_map<Self extends IteratorBase, B>(
//       this: Self,
//       f: (item: Self["Item"]) => Option<B>
//     ): FilterMap;
//
//     /**
//      * Creates an iterator which gives the current iteration count as well as
//      * the next value.
//      */
//     enumerate<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self
//     ): EnumerateForDoubleEndedIterator;
//     enumerate<Self extends ExactSizeIterator>(this: Self): EnumerateForExactSizeIterator;
//     enumerate(): Enumerate;
//
//     /**
//      * Creates an iteraotr which can use `peek` to look at the next element of
//      * the iterator without cosuming it.
//      */
//     peekable<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self
//     ): PeekableForExactSizeAndDoubleEndedIterator;
//     peekable<Self extends ExactSizeIterator>(this: Self): PeekableForExactSizeIterator;
//     peekable<Self extends DoubleEndedIterator>(this: Self): PeekableForDoubleEndedIterator;
//     peekable(): Peekable;
//
//     /**
//      * Creates an iterator that [`skip`]s elemeents based on a predicate.
//      */
//     skip_while<Self extends IteratorBase>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): SkipWhile;
//
//     /**
//      * Creates an iterator that yields elements based on a predicate.
//      */
//     take_while<Self extends IteratorBase>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): TakeWhile;
//
//     /**
//      * Creates an iterator that skips the first `n` elements.
//      */
//     skip<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       n: number
//     ): SkipForDoubleEndedIterator;
//     skip<Self extends ExactSizeIterator>(this: Self, n: number): SkipForExactSizeIterator;
//     skip(n: number): Skip;
//
//     /**
//      * Creates an iterator that yields its first `n` elements.
//      */
//     take<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       n: number
//     ): TakeForDoubleEndedIterator;
//     take<Self extends ExactSizeIterator>(this: Self, n: number): TakeForExactSizeIterator;
//     take(n: number): Take;
//
//     /**
//      * An iterator adaptor similar to [`fold`] that holds internal state and
//      * produces a new iterator.
//      */
//     scan<Self extends IteratorBase, St, B>(
//       this: Self,
//       initial_state: St,
//       f: (st: St, item: Self["Item"]) => Option<B>
//     ): Scan;
//
//     /**
//      * Creates an iterator which ends after the first [`None`].
//      */
//     // fuse<Self extends FusedIterator & ExactSizeIterator & DoubleEndedIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends FusedIterator & ExactSizeIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends FusedIterator & DoubleEndedIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends ExactSizeIterator & DoubleEndedIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends ExactSizeIterator>(this: Self): FuseForExactSizeIterator;
//     // fuse<Self extends DoubleEndedIterator>(this: Self): FuseForDoubleEndedIterator;
//     // fuse<Self extends FusedIterator>(this: Self): FuseForFusedIterator;
//     // fuse(): FuseForIterator;
//
//     /**
//      * Do something with each element of an iterator, passing the value on.
//      */
//     inspect<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       f: (x: Self["Item"]) => void
//     ): InspectForExactSizeAndDoubleEndedIterator;
//     inspect<Self extends ExactSizeIterator>(
//       this: Self,
//       f: (x: Self["Item"]) => void
//     ): InspectForExactSizeIterator;
//     inspect<Self extends DoubleEndedIterator>(
//       this: Self,
//       f: (x: Self["Item"]) => void
//     ): InspectForDoubleEndedIterator;
//     inspect<Self extends IteratorBase>(this: Self, f: (x: Self["Item"]) => void): Inspect;
//
//     /**
//      * Reverses an iterator's direction.
//      */
//     rev<Self extends ExactSizeIterator & DoubleEndedIterator>(this: Self): RevForExactSizeIterator;
//     rev<Self extends DoubleEndedIterator>(this: Self): Rev;
//
//     /**
//      * Converts an iterator of pairs into a pair of containers.
//      */
//     unzip<
//       A,
//       B,
//       FromA extends Extend<A>,
//       FromB extends Extend<B>,
//       Self extends IteratorFace<[A, B]>
//     >(
//       this: Self,
//       a: DefaultConstructor<FromA>,
//       b: DefaultConstructor<FromB>
//     ): [FromA, FromB];
//
//     /**
//      * Creates an iterator which [`clone`]s all of its elements.
//      */
//     cloned<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self
//     ): ClonedForExactSizeAndDoubleEndedIterator;
//     cloned<Self extends ExactSizeIterator>(this: Self): ClonedForExactSizeIterator;
//     cloned<Self extends DoubleEndedIterator>(this: Self): ClonedForDoubleEndedIterator;
//     cloned(): Cloned;
//
//     /**
//      * Repeats an iterator endlessly.
//      */
//     cycle<Self extends IteratorBase & Clone>(this: Self): Cycle;
//
//     /**
//      * Sums the elements of an iterator.
//      */
//     // sum(): Sum
//
//     /**
//      * Iterates over the entire iterator, multiplying all the elements.
//      */
//     // product(): Product
//   }
//
//   interface IteratorBase {
//     step_by<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       n: number
//     ): StepByForDoubleEndedIterator;
//     step_by<Self extends ExactSizeIterator>(this: Self, n: number): StepByForExactSizeIterator;
//     step_by(n: number): StepBy;
//
//     // chain<Self extends IteratorBase, U extends IntoIterator<Self["Item"]>>(this: Self, other: U): Chain
//
//     // zip<Self extends IteratorBase, U extends IntoIterator>(this: Self, other: U): Zip
//
//     map<Self extends ExactSizeIterator & DoubleEndedIterator, B>(
//       this: Self,
//       f: (x: Self["Item"]) => B
//     ): MapForExactSizeAndDoubleEndedIterator;
//     map<Self extends ExactSizeIterator, B>(
//       this: Self,
//       f: (x: Self["Item"]) => B
//     ): MapForExactSizeIterator;
//     map<Self extends DoubleEndedIterator, B>(
//       this: Self,
//       f: (x: Self["Item"]) => B
//     ): MapForDoubleEndedIterator;
//     map<Self extends IteratorBase, B>(this: Self, f: (x: Self["Item"]) => B): Map;
//
//     filter<Self extends DoubleEndedIterator>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): FilterForDoubleEndedIterator;
//     filter<Self extends IteratorBase>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): Filter;
//
//     filter_map<Self extends DoubleEndedIterator, B>(
//       this: Self,
//       f: (item: Self["Item"]) => Option<B>
//     ): FilterMapForDoubleEndedIterator;
//     filter_map<Self extends IteratorBase, B>(
//       this: Self,
//       f: (item: Self["Item"]) => Option<B>
//     ): FilterMap;
//
//     enumerate<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self
//     ): EnumerateForDoubleEndedIterator;
//     enumerate<Self extends ExactSizeIterator>(this: Self): EnumerateForExactSizeIterator;
//     enumerate(): Enumerate;
//
//     peekable<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self
//     ): PeekableForExactSizeAndDoubleEndedIterator;
//     peekable<Self extends ExactSizeIterator>(this: Self): PeekableForExactSizeIterator;
//     peekable<Self extends DoubleEndedIterator>(this: Self): PeekableForDoubleEndedIterator;
//     peekable(): Peekable;
//
//     skip_while<Self extends IteratorBase>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): SkipWhile;
//
//     take_while<Self extends IteratorBase>(
//       this: Self,
//       predicate: (item: Self["Item"]) => boolean
//     ): TakeWhile;
//
//     skip<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       n: number
//     ): SkipForDoubleEndedIterator;
//     skip<Self extends ExactSizeIterator>(this: Self, n: number): SkipForExactSizeIterator;
//     skip(n: number): Skip;
//
//     take<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       n: number
//     ): TakeForDoubleEndedIterator;
//     take<Self extends ExactSizeIterator>(this: Self, n: number): TakeForExactSizeIterator;
//     take(n: number): Take;
//
//     scan<Self extends IteratorBase, St, B>(
//       this: Self,
//       initial_state: St,
//       f: (st: St, item: Self["Item"]) => Option<B>
//     ): Scan;
//
//     // fuse<Self extends FusedIterator & ExactSizeIterator & DoubleEndedIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends FusedIterator & ExactSizeIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends FusedIterator & DoubleEndedIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends ExactSizeIterator & DoubleEndedIterator>(
//     //   this: Self
//     // ): FuseForExactSizeAndDoubleEndedIterator;
//     // fuse<Self extends ExactSizeIterator>(this: Self): FuseForExactSizeIterator;
//     // fuse<Self extends DoubleEndedIterator>(this: Self): FuseForDoubleEndedIterator;
//     // fuse<Self extends FusedIterator>(this: Self): FuseForFusedIterator;
//     // fuse(): FuseForIterator;
//
//     inspect<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self,
//       f: (x: Self["Item"]) => void
//     ): InspectForExactSizeAndDoubleEndedIterator;
//     inspect<Self extends ExactSizeIterator>(
//       this: Self,
//       f: (x: Self["Item"]) => void
//     ): InspectForExactSizeIterator;
//     inspect<Self extends DoubleEndedIterator>(
//       this: Self,
//       f: (x: Self["Item"]) => void
//     ): InspectForDoubleEndedIterator;
//     inspect<Self extends IteratorBase>(this: Self, f: (x: Self["Item"]) => void): Inspect;
//
//     rev<Self extends ExactSizeIterator & DoubleEndedIterator>(this: Self): RevForExactSizeIterator;
//     rev<Self extends DoubleEndedIterator>(this: Self): Rev;
//
//     unzip<
//       A,
//       B,
//       FromA extends Extend<A>,
//       FromB extends Extend<B>,
//       Self extends IteratorFace<[A, B]>
//     >(
//       this: Self,
//       a: DefaultConstructor<FromA>,
//       b: DefaultConstructor<FromB>
//     ): [FromA, FromB];
//
//     cloned<Self extends ExactSizeIterator & DoubleEndedIterator>(
//       this: Self
//     ): ClonedForExactSizeAndDoubleEndedIterator;
//     cloned<Self extends ExactSizeIterator>(this: Self): ClonedForExactSizeIterator;
//     cloned<Self extends DoubleEndedIterator>(this: Self): ClonedForDoubleEndedIterator;
//     cloned(): Cloned;
//
//     cycle<Self extends IteratorBase & Clone>(this: Self): Cycle;
//
//     // sum(): Sum
//     //
//     // product(): Product
//   }
// }
//
// function step_by<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self,
//   n: number
// ): StepByForDoubleEndedIterator;
// function step_by<Self extends ExactSizeIterator>(this: Self, n: number): StepByForExactSizeIterator;
// function step_by(n: number): StepBy;
// function step_by(this: any, n: number): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new StepByForDoubleEndedIterator(this, n);
//   } else if (isExactSizeIterator(this)) {
//     return new StepByForExactSizeIterator(this, n);
//   } else {
//     return new StepBy(this, n);
//   }
// }
// IteratorBase.prototype.step_by = step_by;
//
// function map<Self extends ExactSizeIterator & DoubleEndedIterator, B>(
//   this: Self,
//   f: (x: Self["Item"]) => B
// ): MapForExactSizeAndDoubleEndedIterator;
// function map<Self extends ExactSizeIterator, B>(
//   this: Self,
//   f: (x: Self["Item"]) => B
// ): MapForExactSizeIterator;
// function map<Self extends DoubleEndedIterator, B>(
//   this: Self,
//   f: (x: Self["Item"]) => B
// ): MapForDoubleEndedIterator;
// function map<Self extends IteratorBase, B>(this: Self, f: (x: Self["Item"]) => B): Map;
// function map(this: any, f: any): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new MapForDoubleEndedIterator(this, f);
//   } else if (isExactSizeIterator(this)) {
//     return new MapForExactSizeIterator(this, f);
//   } else if (isDoubleEndedIterator(this)) {
//     return new MapForDoubleEndedIterator(this, f);
//   } else {
//     return new Map(this, f);
//   }
// }
// IteratorBase.prototype.map = map;
//
// function filter<Self extends DoubleEndedIterator>(
//   this: Self,
//   predicate: (x: Self["Item"]) => boolean
// ): FilterForDoubleEndedIterator;
// function filter<Self extends IteratorBase>(
//   this: Self,
//   predicate: (x: Self["Item"]) => boolean
// ): Filter;
// function filter(this: any, predicate: any): any {
//   if (isDoubleEndedIterator(this)) {
//     return new FilterForDoubleEndedIterator(this, predicate);
//   } else {
//     return new Filter(this, predicate);
//   }
// }
// IteratorBase.prototype.filter = filter;
//
// function filter_map<Self extends DoubleEndedIterator, B>(
//   this: Self,
//   f: (x: Self["Item"]) => Option<B>
// ): FilterMapForDoubleEndedIterator;
// function filter_map<Self extends IteratorBase, B>(
//   this: Self,
//   f: (x: Self["Item"]) => Option<B>
// ): FilterMap;
// function filter_map(this: any, f: any): any {
//   if (isDoubleEndedIterator(this)) {
//     return new FilterMapForDoubleEndedIterator(this, f);
//   } else {
//     return new FilterMap(this, f);
//   }
// }
// IteratorBase.prototype.filter_map = filter_map;
//
// IteratorBase.prototype.skip_while = function<Self extends IteratorBase>(
//   this: Self,
//   predicate: (item: Self["Item"]) => boolean
// ): SkipWhile {
//   return new SkipWhile(this, predicate);
// };
//
// IteratorBase.prototype.take_while = function<Self extends IteratorBase>(
//   this: Self,
//   predicate: (item: Self["Item"]) => boolean
// ): TakeWhile {
//   return new TakeWhile(this, predicate);
// };
//
// function skip<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self,
//   n: number
// ): SkipForDoubleEndedIterator;
// function skip<Self extends ExactSizeIterator>(this: Self, n: number): SkipForExactSizeIterator;
// function skip(n: number): Skip;
// function skip(this: any, n: number): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new SkipForDoubleEndedIterator(this, n);
//   } else if (isExactSizeIterator(this)) {
//     return new SkipForExactSizeIterator(this, n);
//   } else {
//     return new Skip(this, n);
//   }
// }
// IteratorBase.prototype.skip = skip;
//
// function take<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self,
//   n: number
// ): TakeForDoubleEndedIterator;
// function take<Self extends ExactSizeIterator>(this: Self, n: number): TakeForExactSizeIterator;
// function take(n: number): Take;
// function take(this: any, n: number): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new TakeForDoubleEndedIterator(this, n);
//   } else if (isExactSizeIterator(this)) {
//     return new TakeForExactSizeIterator(this, n);
//   } else {
//     return new Take(this, n);
//   }
// }
// IteratorBase.prototype.take = take;
//
// function enumerate<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self
// ): EnumerateForDoubleEndedIterator;
// function enumerate<Self extends ExactSizeIterator>(this: Self): EnumerateForExactSizeIterator;
// function enumerate(): Enumerate;
// function enumerate(this: any): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new EnumerateForDoubleEndedIterator(this);
//   } else if (isExactSizeIterator(this)) {
//     return new EnumerateForExactSizeIterator(this);
//   } else {
//     return new Enumerate(this);
//   }
// }
// IteratorBase.prototype.enumerate = enumerate;
//
// function peekable<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self
// ): PeekableForDoubleEndedIterator;
// function peekable<Self extends ExactSizeIterator>(this: Self): PeekableForExactSizeIterator;
// function peekable<Self extends DoubleEndedIterator>(this: Self): PeekableForDoubleEndedIterator;
// function peekable(): Peekable;
// function peekable(this: any): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new PeekableForExactSizeAndDoubleEndedIterator(this);
//   } else if (isExactSizeIterator(this)) {
//     return new PeekableForExactSizeIterator(this);
//   } else if (isDoubleEndedIterator(this)) {
//     return new PeekableForDoubleEndedIterator(this);
//   } else {
//     return new Peekable(this);
//   }
// }
// IteratorBase.prototype.peekable = peekable;
//
// IteratorBase.prototype.scan = function<Self extends IteratorBase, St, B>(
//   this: Self,
//   initial_state: St,
//   f: (st: St, item: Self["Item"]) => Option<B>
// ): Scan {
//   return new Scan(this, initial_state, f);
// };
//
// // function fuse<Self extends FusedIterator & ExactSizeIterator & DoubleEndedIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends FusedIterator & ExactSizeIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends FusedIterator & DoubleEndedIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends ExactSizeIterator & DoubleEndedIterator>(
// //   this: Self
// // ): FuseForExactSizeAndDoubleEndedIterator;
// // function fuse<Self extends ExactSizeIterator>(this: Self): FuseForExactSizeIterator;
// // function fuse<Self extends DoubleEndedIterator>(this: Self): FuseForDoubleEndedIterator;
// // function fuse<Self extends FusedIterator>(this: Self): FuseForFusedIterator;
// // function fuse<Self extends IteratorBase>(this: Self): FuseForIterator;
// // function fuse(this: any): any {
// //   if (isFusedIterator(this) && isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
// //     return new FuseForFusedAndExactSizeAndDoubleEndedIterator(this);
// //   } else if (isFusedIterator(this) && isExactSizeIterator(this)) {
// //     return new FuseForFusedAndExactSizeIterator(this);
// //   } else if (isFusedIterator(this) && isDoubleEndedIterator(this)) {
// //     return new FuseForFusedAndDoubleEndedIterator(this);
// //   } else if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
// //     return new FuseForExactSizeAndDoubleEndedIterator(this);
// //   } else if (isExactSizeIterator(this)) {
// //     return new FuseForExactSizeIterator(this);
// //   } else if (isDoubleEndedIterator(this)) {
// //     return new FuseForDoubleEndedIterator(this);
// //   } else if (isFusedIterator(this)) {
// //     return new FuseForFusedIterator(this);
// //   } else {
// //     return new FuseForIterator(this);
// //   }
// // }
// // IteratorBase.prototype.fuse = fuse;
//
// function inspect<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self,
//   f: (x: Self["Item"]) => void
// ): InspectForExactSizeAndDoubleEndedIterator;
// function inspect<Self extends ExactSizeIterator>(
//   this: Self,
//   f: (x: Self["Item"]) => void
// ): InspectForExactSizeIterator;
// function inspect<Self extends DoubleEndedIterator>(
//   this: Self,
//   f: (x: Self["Item"]) => void
// ): InspectForDoubleEndedIterator;
// function inspect<Self extends IteratorBase>(this: Self, f: (x: Self["Item"]) => void): Inspect;
// function inspect(this: any, f: any): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new InspectForDoubleEndedIterator(this, f);
//   } else if (isExactSizeIterator(this)) {
//     return new InspectForExactSizeIterator(this, f);
//   } else if (isDoubleEndedIterator(this)) {
//     return new InspectForDoubleEndedIterator(this, f);
//   } else {
//     return new Inspect(this, f);
//   }
// }
// IteratorBase.prototype.inspect = inspect;
//
// function rev<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self
// ): RevForExactSizeIterator;
// function rev<Self extends DoubleEndedIterator>(this: Self): Rev;
// function rev(this: any): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new RevForExactSizeIterator(this);
//   } else if (isDoubleEndedIterator(this)) {
//     return new Rev(this);
//   } else {
//     panic_iter("Rev", this, "DoubleEndedIterator");
//     return (undefined as unknown) as Rev;
//   }
// }
// IteratorBase.prototype.rev = rev;
//
// function unzip<
//   A,
//   B,
//   FromA extends Extend<A>,
//   FromB extends Extend<B>,
//   Self extends IteratorFace<[A, B]>
// >(this: Self, a: DefaultConstructor<FromA>, b: DefaultConstructor<FromB>): [FromA, FromB] {
//   let ts = a.default();
//   let us = b.default();
//
//   this.for_each(([t, u]: Self["Item"]) => {
//     ts.extend(Some(t));
//     us.extend(Some(u));
//   });
//
//   return [ts, us];
// }
// IteratorBase.prototype.unzip = unzip;
//
// function cloned<Self extends ExactSizeIterator & DoubleEndedIterator>(
//   this: Self
// ): ClonedForExactSizeAndDoubleEndedIterator;
// function cloned<Self extends ExactSizeIterator>(this: Self): ClonedForExactSizeIterator;
// function cloned<Self extends DoubleEndedIterator>(this: Self): ClonedForDoubleEndedIterator;
// function cloned<Self extends IteratorBase>(this: Self): Cloned;
// function cloned(this: any): any {
//   if (isExactSizeIterator(this) && isDoubleEndedIterator(this)) {
//     return new ClonedForExactSizeAndDoubleEndedIterator(this);
//   } else if (isExactSizeIterator(this)) {
//     return new ClonedForExactSizeIterator(this);
//   } else if (isDoubleEndedIterator(this)) {
//     return new ClonedForDoubleEndedIterator(this);
//   } else {
//     return new Cloned(this);
//   }
// }
// IteratorBase.prototype.cloned = cloned;
//
// IteratorBase.prototype.cycle = function<Self extends IteratorBase & Clone>(this: Self) {
//   return new Cycle(this);
// };
//
// function panic_iter<I extends IteratorBase>(adapter: string, iter: I, trait: string) {
//   throw new Error(`${adapter}.iter ${iter} does not impl trait ${trait}`);
// }
