export function isNil(t: any): boolean {
  return t === undefined || t === null;
}

export function isFunction(t: any): boolean {
  return typeof t === "function";
}

export function isObject(t: any): boolean {
  let type = typeof t;
  return t != null && (type === "object" || type === "function");
}

export function isObjectLike(t: any): boolean {
  return t != null && typeof t === "object";
}
