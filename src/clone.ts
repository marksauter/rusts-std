import { Self } from "./internal";
const clonedeep = require("lodash.clonedeep");

export interface Clone extends Self {
  readonly isClone: true;

  // Returns a copy of the value.
  clone(): this["Self"];

  // Performs copy-assignment from `source`.
  clone_from?(source: this["Self"]): void;
}

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
