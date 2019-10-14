import { isNil, isFunction } from "./internal";

export interface Debug {
  fmt_debug(): string;
}

export function isDebug(t: any): t is Debug {
  return !isNil(t) && isFunction((t as Debug).fmt_debug);
}

export interface Display {
  fmt_display(): string;
}

export function isDisplay(t: any): t is Display {
  return !isNil(t) && isFunction((t as Display).fmt_display);
}

function fmt_debug(t: any): string {
  if (isDebug(t)) {
    return t.fmt_debug();
  }
  switch (typeof t) {
    case "object": {
      if (t === null) {
        return "null";
      }
      let fmt = "{";
      for (let p in t) {
        if (t.hasOwnProperty(p)) {
          fmt += fmt_debug(p);
          fmt += ":";
          fmt += fmt_debug(t[p]);
          fmt += ",";
        }
      }
      if (fmt.length > 1) {
        fmt = fmt.substr(0, fmt.length - 1);
      }
      fmt += "}";
      return fmt;
    }
    case "string":
      return `"${t}"`;
    case "symbol":
      return t.toString();
    case "undefined":
      return "()";
    default:
      return `${t}`;
  }
}

function fmt_display(t: any): string {
  if (isDisplay(t)) {
    return t.fmt_display();
  }
  switch (typeof t) {
    case "string":
      return `"${t}"`;
    case "symbol":
      return t.toString();
    case "undefined":
      return "()";
    default:
      return `${t}`;
  }
}

declare global {
  interface Array<T> {
    fmt_debug(): string;
  }
}

Array.prototype.fmt_debug = function() {
  let fmt = "[";
  for (let i = 0; i < this.length; ++i) {
    fmt += fmt_debug(this[i]);
    if (i !== this.length - 1) {
      fmt += ",";
    }
  }
  fmt += "]";
  return fmt;
};

enum FormatTrait {
  Display = "",
  Debug = ":?"
}

export function format(template: string, ...args: any[]): string {
  let ret = "";
  let last_index = 0;
  let i = 0;
  let match: ReturnType<typeof RegExp.prototype.exec>;
  let arg_replace = new RegExp(/{([:?]*)}/g);
  while ((match = arg_replace.exec(template)) !== null) {
    let arg = args[i];
    let placeholder_index = match.index;
    let placeholder_length = match[0].length;
    let trait = match[1];
    let fmt = "";
    switch (trait) {
      case FormatTrait.Display: {
        fmt = fmt_display(arg);
        break;
      }
      case FormatTrait.Debug: {
        fmt = fmt_debug(arg);
        break;
      }
    }
    ret += template.slice(last_index, placeholder_index) + fmt;
    last_index = placeholder_index + placeholder_length;
    i++;
  }

  ret += template.slice(last_index);

  return ret;
}
