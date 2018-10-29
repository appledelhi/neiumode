import * as clipboardy from "clipboardy";

export class Clipboard {
  static _buffer: string = "";

  static write(text: string, merge: boolean, prepend: boolean = false) {
    if (merge) {
      if (prepend) {
        Clipboard._buffer = text + Clipboard._buffer;
      } else {
        Clipboard._buffer += text;
      }
    } else {
      Clipboard._buffer = text;
    }
    clipboardy.writeSync(Clipboard._buffer);
  }
}
