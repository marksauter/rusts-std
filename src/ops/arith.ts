import {
  // self.ts
  Self,
  // macros.ts
  abstract_panic
} from "../internal";

export interface Add extends Self {
  // The right-hand-side of the addition, left + `right`.
  Rhs: this["Self"];

  // The resulting type after addition.
  Output: this["Self"];

  add(rhs: this["Rhs"]): this["Output"];
}

export interface Sub extends Self {
  // The right-hand-side of the subtraction, left - `right`.
  Rhs: this["Self"];

  // The resulting type after subtraction.
  Output: this["Self"];

  sub(rhs: this["Rhs"]): this["Output"];
}

export interface Mul extends Self {
  // The right-hand-side of the multiplication, left * `right`.
  Rhs: this["Self"];

  // The resulting type after multiplication.
  Output: this["Self"];

  mul(rhs: this["Rhs"]): this["Output"];
}

export interface Div extends Self {
  // The right-hand-side of the division, left / `right`.
  Rhs: this["Self"];

  // The resulting type after division.
  Output: this["Self"];

  div(rhs: this["Rhs"]): this["Output"];
}

export interface Rem extends Self {
  // The right-hand-side of the remainder, left % `right`.
  Rhs: this["Self"];

  // The resulting type after the `%` operator.
  Output: this["Self"];

  rem(rhs: this["Rhs"]): this["Output"];
}

export interface Neg extends Self {
  // The resulting type after the `-` operator.
  Output: this["Self"];

  neg(): this["Output"];
}

export interface AddAssign extends Self {
  // The right-hand-side of the addition, left + `right`.
  Rhs: this["Self"];

  add_assign(rhs: this["Rhs"]): void;
}

export interface SubAssign extends Self {
  // The right-hand-side of the subtraction, left - `right`.
  Rhs: this["Self"];

  sub_assign(rhs: this["Rhs"]): void;
}

export interface MulAssign extends Self {
  // The right-hand-side of the multiplication, left * `right`.
  Rhs: this["Self"];

  mul_assign(rhs: this["Rhs"]): void;
}

export interface DivAssign extends Self {
  // The right-hand-side of the division, left / `right`.
  Rhs: this["Self"];

  div_assign(rhs: this["Rhs"]): void;
}

export interface RemAssign extends Self {
  // The right-hand-side of the remainder, left % `right`.
  Rhs: this["Self"];

  rem_assign(rhs: this["Rhs"]): void;
}

declare global {
  interface Number {
    Rhs: number;
    Output: number;
    add(rhs: number): number;
    sub(rhs: number): number;
    mul(rhs: number): number;
    div(rhs: number): number;
    rem(rhs: number): number;
    neg(): number;
  }
}

Number.prototype.add = function(rhs) {
  return this.valueOf() + rhs;
};

Number.prototype.sub = function(rhs) {
  return this.valueOf() - rhs;
};

Number.prototype.mul = function(rhs) {
  return this.valueOf() * rhs;
};

Number.prototype.div = function(rhs) {
  return this.valueOf() / rhs;
};

Number.prototype.rem = function(rhs) {
  return this.valueOf() % rhs;
};

Number.prototype.neg = function() {
  return -this.valueOf();
};

export function add<T extends Add>(left: T, right: T): T["Output"] {
  return left.add(right);
}

export function sub<T extends Sub>(left: T, right: T): T["Output"] {
  return left.sub(right);
}

export function mul<T extends Mul>(left: T, right: T): T["Output"] {
  return left.mul(right);
}

export function div<T extends Div>(left: T, right: T): T["Output"] {
  return left.div(right);
}

export function rem<T extends Rem>(left: T, right: T): T["Output"] {
  return left.rem(right);
}

export function neg<T extends Neg>(right: T): T["Output"] {
  return right.neg();
}
