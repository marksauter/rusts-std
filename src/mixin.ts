export type AnyFunction<A = any> = (...input: any[]) => A;
export type AnyConstructor<A = object> = new (...args: any[]) => A;

export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;
