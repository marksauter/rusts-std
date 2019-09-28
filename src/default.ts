export interface Default<T> {
  new (...args: any[]): T;
  default(): T;
}
export interface DefaultConstructor<T> {
  new (...args: any[]): T;
  default(): T;
}
