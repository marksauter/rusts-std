import { Self } from "./internal";

/**
 * Interface for NumberConstructor
 */
export interface NumberStatic extends Self {
  Self: number;
}

/**
 * This class should be used anywhere a Number constructor is expected.
 */
export var NumberConstructor: NumberStatic = {} as NumberStatic;
