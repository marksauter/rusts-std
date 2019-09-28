import { AnyConstructor, Mixin, Self, abstract_panic } from "./internal";
const clonedeep = require("lodash.clonedeep");

export const ImplClone = <T extends AnyConstructor<Self>>(Base: T) =>
  class Clone extends Base {
    readonly isClone = true;

    // Returns a copy of the value.
    //
    // Abstract
    public clone(): this["Self"] {
      abstract_panic("Clone", "clone");
      // Unreachable code
      return (undefined as unknown) as this["Self"];
    }

    // Performs copy-assignment from `source`.
    //
    // Abstract
    public clone_from(source: this["Self"]) {
      abstract_panic("Clone", "clone_from");
    }
  };

export type Clone = Mixin<typeof ImplClone>;

export function isClone(t: any): t is Clone {
  return typeof t === "object" && t !== null && (t as Clone).isClone;
}

export function clone<T extends Clone>(t: T): T;
export function clone<T>(t: T): T;
export function clone(t: any): any {
  if (isClone(t)) {
    return t.clone();
  }
  return clonedeep(t);
}
