import {
  // mixin.ts
  AnyConstructor,
  Mixin,
  // self.ts
  Self,
  // result.ts
  Result,
  // macros.ts
  abstract_panic
} from "./internal";

export interface TryFace<O = any, E = any> {
  // The type of this value when viewed as successful.
  Okay: O;
  // The type of this value when viewed as failed.
  Error: E;

  is_error(): boolean;

  unwrap(): this["Okay"];

  into_result(): Result<this["Okay"], this["Error"]>;
}

export const ImplTry = <T extends AnyConstructor<Self>>(Base: T) =>
  class Try extends Base {
    readonly isTry = true;

    public Okay!: any;
    public Error!: any;

    public is_error(): boolean {
      abstract_panic("Try", "is_error");
      // Unreachable code
      return false;
    }

    public unwrap(): this["Okay"] {
      abstract_panic("Try", "unwrap");
      // Unreachable code
      return (undefined as unknown) as this["Okay"];
    }

    public into_result(): Result<this["Okay"], this["Error"]> {
      abstract_panic("Try", "into_result");
      // Unreachable code
      return (undefined as unknown) as Result<this["Okay"], this["Error"]>;
    }

    public static from_error(v: any): Try {
      abstract_panic("Try", "from_error");
      // Unreachable code
      return (undefined as unknown) as Try;
    }

    public static from_okay(v: any): Try {
      abstract_panic("Try", "from_okay");
      // Unreachable code
      return (undefined as unknown) as Try;
    }
  };

export type Try = Mixin<typeof ImplTry>;
export interface TryConstructor<R> {
  new (...args: any[]): R;
  from_error(v: any): R;
  from_okay(v: any): R;
}

export function isTry(t: any): t is Try {
  return typeof t === "object" && t !== null && (t as Try).isTry;
}
