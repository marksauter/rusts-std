import { isNil, isFunction, Self } from "./internal";
const clonedeep = require("lodash.clonedeep");

export interface Clone extends Self {
  // Returns a copy of the value.
  clone(): this["Self"];

  // Performs copy-assignment from `source`.
  clone_from?(source: this["Self"]): void;
}

export function isClone(t: any): t is Clone {
  return !isNil(t) && isFunction((t as Clone).clone);
}

export function clone<T extends Clone>(t: T): T;
export function clone(t: any): any;
export function clone(t: any): any {
  if (isClone(t)) {
    return t.clone();
  }

  if (typeof t === "object") {
    let ret: typeof t = {};
    for (let p in t) {
      if (t.hasOwnProperty(p)) {
        ret[p] = clone(t[p]);
      }
    }
    return ret;
  }

  return clonedeep(t);
}

declare global {
  interface Number {
    clone(): number;
  }
  interface Array<T> {
    clone(): Array<T>;
  }
}

Number.prototype.clone = function() {
  return this.valueOf();
};

Array.prototype.clone = function() {
  let ret = [];
  for (let i = 0; i < this.length; ++i) {
    ret[i] = clone(this[i]);
  }
  return ret;
};
