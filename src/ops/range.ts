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
      let n = this.start + 1;
      if (n < this.end) {
        return {
          done: false,
          value: Option.Some(n)
        };
      } else {
        return {
          done: true,
          value: Option.None()
        };
      }
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

export class RangeFrom {
  public start: number;

  constructor(start: number) {
    this.start = start;
  }

  public next(): IteratorResult<Option<number>> {
    if (this.start < Number.MAX_SAFE_INTEGER) {
      let n = this.start + 1;
      if (n < Number.MAX_SAFE_INTEGER) {
        return {
          done: false,
          value: Option.Some(n)
        };
      } else {
        return {
          done: true,
          value: Option.None()
        };
      }
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

  public clone(): RangeFrom {
    return new RangeFrom(this.start);
  }

  public contains(item: number): boolean {
    return item >= this.start;
  }
}

export class RangeTo {
  public end: number;

  constructor(end: number) {
    this.end = end;
  }

  public clone(): RangeTo {
    return new RangeTo(this.end);
  }

  public contains(item: number): boolean {
    return item < this.end;
  }
}

export class RangeInclusive {
  public start: number;
  public end: number;
  public empty: Option<boolean>;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
    this.empty = Option.None();
  }

  public next(): IteratorResult<Option<number>> {
    this.compute_is_empty();
    if (this.empty.unwrap_or(false)) {
      return {
        done: true,
        value: Option.None()
      };
    }
    let is_iterating = this.start < this.end;
    this.empty = Option.Some(!is_iterating);
    return {
      done: false,
      value: Option.Some(is_iterating ? ++this.start : this.start)
    };
  }

  public [Symbol.iterator](): Iterator<Option<number>> {
    return this;
  }

  public clone(): RangeInclusive {
    return new RangeInclusive(this.start, this.end);
  }

  public contains(item: number): boolean {
    return item >= this.start && item <= this.end;
  }

  public is_empty(): boolean {
    return this.empty.unwrap_or_else(() => !(this.start <= this.end));
  }

  private compute_is_empty() {
    if (this.empty.is_none()) {
      this.empty = Option.Some(!(this.start <= this.end));
    }
  }

  public into_inner(): [number, number] {
    return [this.start, this.end];
  }
}

export class RangeToInclusive {
  public end: number;

  constructor(end: number) {
    this.end = end;
  }

  public clone(): RangeTo {
    return new RangeTo(this.end);
  }

  public contains(item: number): boolean {
    return item <= this.end;
  }
}
