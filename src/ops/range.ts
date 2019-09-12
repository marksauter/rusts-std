import { Option } from "../internal";

export class Range {
  public start: number;
  public end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  public next(): IteratorResult<Option<number>> {
    if (this.start < this.end) {
      return {
        done: false,
        value: Option.Some(this.start++)
      };
    } else {
      return {
        done: true,
        value: Option.None()
      };
    }
  }

  public [Symbol.iterator](): Iterator<Option<number>> {
    return this;
  }

  public clone(): Range {
    return new Range(this.start, this.end);
  }

  public contains(item: number): boolean {
    return item >= this.start && item < this.end;
  }

  public is_empty(): boolean {
    return !(this.start < this.end);
  }
}

// export class RangeFrom {
//   public start: number
//
//   constructor(start: number) {
//     this.start = start
//   }
//
//   public next(): IteratorResult<Option<number>> {
//     if (this.start < Number.MAX_SAFE_INTEGER) {
//       ++this.start
//       if (this.start < Number.MAX_SAFE_INTEGER) {
//         return {
//           done: false,
//           value: Option.Some(this.start)
//         }
//       } else {
//         return {
//           done: true,
//           value: Option.None()
//         };
//       }
//     } else {
//       return {
//         done: true,
//         value: Option.None()
//       };
//     }
//   }
//
//   public [Symbol.iterator](): Iterator<Option<number>> {
//     return this;
//   }
//
//   public clone(): RangeFrom {
//     return new RangeFrom(this.start)
//   }
//
//   public contains(item: number): boolean {
//     return item >= this.start
//   }
// }
//
// export class RangeTo {
//   public end: number
//
//   constructor(end: number) {
//     this.end = end
//   }
//
//   public clone(): RangeTo {
//     return new RangeTo(this.end)
//   }
//
//   public contains(item: number): boolean {
//     return item < this.end
//   }
// }
//
// export class RangeInclusive {
//   private _start: number
//   private _end: number
//   private _is_empty: Option<boolean>
//
//   constructor(start: number, end: number) {
//     this._start = start
//     this._end = end
//     this._is_empty = Option.None()
//   }
//
//   public start(): number {
//     return this._start
//   }
//
//   public end(): number {
//     return this._end
//   }
//
//   public next(): IteratorResult<Option<number>> {
//     this.compute_is_empty();
//     if (this._is_empty.unwrap_or(false)) {
//       return {
//         done: true,
//         value: Option.None(),
//       };
//     }
//     let is_iterating = this._start < this._end;
//     this._is_empty = Option.Some(!is_iterating);
//     return {
//       done: false,
//       value: Option.Some(is_iterating ? ++this._start : this._start),
//     }
//   }
//
//   public [Symbol.iterator](): Iterator<Option<number>> {
//     return this;
//   }
//
//   public clone(): RangeInclusive {
//     return new RangeInclusive(this._start, this._end)
//   }
//
//   public contains(item: number): boolean {
//     return item >= this._start && item <= this._end
//   }
//
//   public is_empty(): boolean {
//     return this._is_empty.unwrap_or_else(() => !(this._start <= this._end))
//   }
//
//   private compute_is_empty() {
//     if (this._is_empty.is_none()) {
//       this._is_empty = Option.Some(!(this._start <= this._end))
//     }
//   }
//
//   public into_inner(): [number, number] {
//     return [this._start, this._end]
//   }
// }
//
// export class RangeToInclusive {
//   public end: number
//
//   constructor(end: number) {
//     this.end = end
//   }
//
//   public clone(): RangeTo {
//     return new RangeToInclusive(this.end)
//   }
//
//   public contains(item: number): boolean {
//     return item <= this.end
//   }
// }
