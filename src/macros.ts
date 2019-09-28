import { PartialEq, isPartialEq } from "./internal";
const nodeAssert = require("assert");

export function assert(expr: any, message?: string | Error) {
  message = message || "assertion failed: expr is falsey";
  if (message) {
    nodeAssert(expr, message);
  }
}

export function assert_eq<T extends PartialEq>(left: T, right: T, message?: string | Error): void;
export function assert_eq<T>(left: T, right: T, message?: string | Error): void;
export function assert_eq(left: any, right: any, message?: string | Error) {
  message = message || "assertion failed: left == right";
  if (isPartialEq(left) && isPartialEq(right)) {
    nodeAssert(left.eq(right), message);
  }
  nodeAssert.deepStrictEqual(left, right, message);
}

export function assert_ne<T extends PartialEq>(left: T, right: T, message?: string | Error): void;
export function assert_ne<T>(left: T, right: T, message?: string | Error): void;
export function assert_ne(left: any, right: any, message?: string | Error) {
  message = message || "assertion failed: left != right";
  if (isPartialEq(left) && isPartialEq(right)) {
    nodeAssert(left.ne(right), message);
  }
  nodeAssert.notDeepStrictEqual(left, right, message);
}

export function debug_assert(expr: any, message?: string | Error) {
  if (process.env.DEBUG) {
    assert(expr, message);
  }
}

export function debug_assert_eq(left: any, right: any, message?: string | Error) {
  if (process.env.DEBUG) {
    assert_eq(left, right, message);
  }
}

export function debug_assert_ne(left: any, right: any, message?: string | Error) {
  if (process.env.DEBUG) {
    assert_ne(left, right, message);
  }
}

export function abstract_panic(class_name: string, method_name: string) {
  throw new Error(`abstract ${class_name}.${method_name} called, this method must be defined`);
}
