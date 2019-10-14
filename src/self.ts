export class Self {
  public Self!: any;
}

declare global {
  interface Number {
    Self: number;
  }
  interface Array<T> {
    Self: Array<T>;
  }
}
