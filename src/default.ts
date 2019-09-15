export interface Default<T> {
  new (): T;
  default(): T;
}

export function get_default<T>(t: Default<T>): T {
  return t.default();
}
