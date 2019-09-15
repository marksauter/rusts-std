const clonedeep = require("lodash.clonedeep");

export interface Clone<T> {
  clone(this: T): T;
}

export function isClone(t: any): t is Clone<typeof t> {
  return typeof t === "object" && t !== null && (t as Clone<typeof t>).clone !== undefined;
}

export function clone<T>(t: T & Clone<T>): T;
export function clone<T>(t: T): T;
export function clone<T>(t: T): T {
  if (isClone(t)) {
    return t.clone();
  }
  return clonedeep(t);
}
