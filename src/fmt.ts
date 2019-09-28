export interface Debug {
  fmt_debug(): string;
}

export function isDebug(t: any): t is Debug {
  return typeof t === "object" && t !== null && (t as Debug).fmt_debug !== undefined;
}

export interface Display {
  fmt_display(): string;
}

export function isDisplay(t: any): t is Display {
  return typeof t === "object" && t !== null && (t as Display).fmt_display !== undefined;
}

function fmt_builtin(t: any): string {
  switch (typeof t) {
    case "object": {
      if (t === null) {
        return "null";
      } else if (t instanceof Array) {
        let fmt = "[";
        for (let i = 0; i < t.length; ++i) {
          fmt += fmt_display(t[i]);
          if (i !== t.length - 1) {
            fmt += ",";
          }
        }
        fmt += "]";
        return fmt;
      } else {
        let fmt = "{";
        for (let p in t) {
          if (t.hasOwnProperty(p)) {
            fmt += fmt_display(p);
            fmt += ":";
            fmt += fmt_display(t[p]);
            fmt += ",";
          }
        }
        fmt = fmt.substr(0, fmt.length - 1);
        fmt += "}";
        return fmt;
      }
    }
    case "string":
      return `"${t}"`;
    case "symbol":
      return t.toString();
    default:
      return `${t}`;
  }
}

function fmt_debug(t: any): string {
  if (isDebug(t)) {
    return t.fmt_debug();
  }
  return fmt_builtin(t);
}

function fmt_display(t: any): string {
  if (isDisplay(t)) {
    return t.fmt_display();
  }
  return fmt_builtin(t);
}

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
