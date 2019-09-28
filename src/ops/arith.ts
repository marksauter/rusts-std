import {
  // mixin.ts
  AnyConstructor,
  Mixin,
  // self.ts
  Self,
  // macros.ts
  abstract_panic
} from "../internal";

export const ImplAdd = <T extends AnyConstructor<Self>>(Base: T) =>
  class Add extends Base {
    readonly isAdd = true;

    // The right-hand-side of the addition, left + `right`.
    public Rhs!: this["Self"];

    // The resulting type after addition.
    public Output!: this["Self"];

    public add(rhs: this["Rhs"]): this["Output"] {
      abstract_panic("Add", "add");
      // Unreachable code
      return (undefined as unknown) as this["Output"];
    }
  };

export type Add = Mixin<typeof ImplAdd>;

export function isAdd(t: any): t is Add {
  return typeof t === "object" && t !== null && (t as Add).isAdd;
}

export function add<T extends Add>(left: T, right: T): T;
export function add(left: number, right: number): number;
export function add(left: any, right: any): any {
  if (isAdd(left) && isAdd(right)) {
    return left.add(right);
  }
  return left + right;
}

export const ImplSub = <T extends AnyConstructor<Self>>(Base: T) =>
  class Sub extends Base {
    readonly isSub = true;

    // The right-hand-side of the subtraction, left + `right`.
    public Rhs!: this["Self"];

    // The resulting type after subtraction.
    public Output!: this["Self"];

    public sub(rhs: this["Rhs"]): this["Output"] {
      abstract_panic("Sub", "sub");
      // Unreachable code
      return (undefined as unknown) as this["Output"];
    }
  };

export type Sub = Mixin<typeof ImplSub>;

export function isSub(t: any): t is Sub {
  return typeof t === "object" && t !== null && (t as Sub).isSub;
}

export function sub<T extends Sub>(left: T, right: T): T;
export function sub(left: number, right: number): number;
export function sub(left: any, right: any): any {
  if (isSub(left) && isSub(right)) {
    return left.sub(right);
  }
  return left - right;
}

export const ImplMul = <T extends AnyConstructor<Self>>(Base: T) =>
  class Mul extends Base {
    readonly isMul = true;

    // The right-hand-side of the multiplication, left + `right`.
    public Rhs!: this["Self"];

    // The resulting type after multiplication.
    public Output!: this["Self"];

    public mul(rhs: this["Rhs"]): this["Output"] {
      abstract_panic("Mul", "mul");
      // Unreachable code
      return (undefined as unknown) as this["Output"];
    }
  };

export type Mul = Mixin<typeof ImplMul>;

export function isMul(t: any): t is Mul {
  return typeof t === "object" && t !== null && (t as Mul).isMul;
}

export function mul<T extends Mul>(left: T, right: T): T;
export function mul(left: number, right: number): number;
export function mul(left: any, right: any): any {
  if (isMul(left) && isMul(right)) {
    return left.mul(right);
  }
  return left * right;
}

export const ImplDiv = <T extends AnyConstructor<Self>>(Base: T) =>
  class Div extends Base {
    readonly isDiv = true;

    // The right-hand-side of the division, left + `right`.
    public Rhs!: this["Self"];

    // The resulting type after division.
    public Output!: this["Self"];

    public div(rhs: this["Rhs"]): this["Output"] {
      abstract_panic("Div", "div");
      // Unreachable code
      return (undefined as unknown) as this["Output"];
    }
  };

export type Div = Mixin<typeof ImplDiv>;

export function isDiv(t: any): t is Div {
  return typeof t === "object" && t !== null && (t as Div).isDiv;
}

export function div<T extends Div>(left: T, right: T): T;
export function div(left: number, right: number): number;
export function div(left: any, right: any): any {
  if (isDiv(left) && isDiv(right)) {
    return left.div(right);
  }
  return left / right;
}
