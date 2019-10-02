import { PartialEq, isPartialEq, format } from "./internal";
const nodeAssert = require("assert");

export function assert(expr: any, fmt_str?: string, ...fmt_args: any[]) {
  let message = fmt_str ? format(fmt_str, ...fmt_args) : "assertion failed";
  if (message) {
    nodeAssert(expr, message);
  }
}

export function assert_eq<T extends PartialEq>(left: T, right: T): void;
export function assert_eq<T>(left: T, right: T): void;
export function assert_eq(left: any, right: any) {
  let message = format(
    `assertion failed: \`(left == right)\`
 left: \`{:?}\`,
right: \`{:?}\``,
    left,
    right
  );
  if (isPartialEq(left) && isPartialEq(right)) {
    nodeAssert(left.eq(right), message);
  }
  nodeAssert.deepStrictEqual(left, right, message);
}

export function assert_ne<T extends PartialEq>(left: T, right: T): void;
export function assert_ne<T>(left: T, right: T): void;
export function assert_ne(left: any, right: any) {
  let message = format(
    `assertion failed: \`(left != right)\`
 left: \`{:?}\`,
right: \`{:?}\``,
    left,
    right
  );
  if (isPartialEq(left) && isPartialEq(right)) {
    nodeAssert(left.ne(right), message);
  }
  nodeAssert.notDeepStrictEqual(left, right, message);
}

export function debug_assert(expr: any, fmt_str?: string, ...fmt_args: any[]) {
  if (process.env.DEBUG) {
    assert(expr, fmt_str, ...fmt_args);
  }
}

export function debug_assert_eq(left: any, right: any) {
  if (process.env.DEBUG) {
    assert_eq(left, right);
  }
}

export function debug_assert_ne(left: any, right: any) {
  if (process.env.DEBUG) {
    assert_ne(left, right);
  }
}

export function abstract_panic(class_name: string, method_name: string) {
  throw new Error(`abstract ${class_name}.${method_name} called, this method must be defined`);
}
