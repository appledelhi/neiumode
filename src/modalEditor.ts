import {
  Selection,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  TextEditorRevealType,
  TextEditorCursorStyle,
  Position,
  Range,
  Disposable,
  ViewColumn,
  workspace,
  commands,
  window
} from "vscode";
// from https://github.com/ow--/vscode-subword-navigation/tree/master/src
import { nextBoundaryLeft, nextBoundaryRight } from "./boundaries";

type BoundaryFunc = (doc: TextDocument, pos: Position) => Position;
type SelectionFunc = (selection: Selection, boundary: Position) => Selection;
// end of copied code

export class ModalEditor {
  private _modal: boolean;
  private _editor: TextEditor;
  private _statusBar: Disposable;
  private _currentCommand: (any) => void;
  private _lastCommands: Array<any>;
  private _lastPos: Position;
  private _replaying: boolean;
  private _formatAfterPaste: boolean;
  private _eol: string;
  private _lastCommand: string;
  static _copyBuffer: string = "";

  constructor(editor: TextEditor) {
    this._editor = editor;
    this._modal = true;
    this._currentCommand = this.handleCommands;
    this._lastCommands = [];
    this._lastPos = editor.selection.active;
    this._replaying = false;
    let config = workspace.getConfiguration("editor", editor.document.uri);
    this._formatAfterPaste = config.get("formatOnPaste", false);
    config = workspace.getConfiguration("files", editor.document.uri);
    this._eol = config.get("eol", "\n");
    this.setCursor();
  }

  handleType(args) {
    if (!this._modal) {
      commands.executeCommand("default:type", args).then(_ => {
        this._lastPos = this._editor.selection.active;
      });
      this.recordCommand(false, args.text);
      return;
    }
    this._currentCommand(args);
  }

  handleBackspace(args) {
    if (!this._modal) {
      commands.executeCommand("deleteLeft", args);
      return;
    }
    this._currentCommand({ text: "^H" });
  }

  handleCommands(args: any) {
    switch (args.text) {
      case "^H":
        commands.executeCommand("deleteLeft", args);
        break;
      case " ":
        this.gotoHandleSpaceCommands();
        break;
      case ",":
        this.gotoHandleCommaCommands();
        break;
      case "~":
        this.toggleCase();
        break;
      case "^":
        commands.executeCommand("cursorUp");
        commands.executeCommand("editor.action.joinLines");
        break;
      case "a":
        commands.executeCommand("editor.action.commentLine");
        commands.executeCommand("cursorDown");
        break;
      case "b":
        commands.executeCommand("expandLineSelection");
        this.gotoHandleSelectCommands();
        break;
      case "c":
        this.copyCommand();
        break;
      case "d":
        this.gotoHandleSelectCommands();
        break;
      case "e":
        commands.executeCommand("cursorDown");
        break;
      case "f":
        commands.executeCommand("deleteWordLeft").then(_ => {
          this._lastPos = this._editor.selection.active;
        });
        this.recordCommand(true, "t");
        break;
      case "g":
        commands.executeCommand("deleteAllRight");
        this.recordCommand(true, args.text);
        break;
      case "h":
        commands.executeCommand("cursorHome");
        break;
      case "i":
        commands.executeCommand("cursorRight");
        break;
      case "j":
        commands.executeCommand("cursorPageUp");
        break;
      case "J":
        commands.executeCommand("cursorTop");
        break;
      case "k":
        commands.executeCommand("cursorPageDown");
        break;
      case "K":
        commands.executeCommand("cursorBottom");
        break;
      case "l":
        this.cursorSubword(this._editor, nextBoundaryLeft, this.move);
        break;
      case "n":
        commands.executeCommand("cursorLeft");
        break;
      case "o":
        commands.executeCommand("cursorEnd");
        break;
      case "r":
        this.repeatCommands();
        break;
      case "s":
        commands.executeCommand("deleteRight");
        this.recordCommand(true, args.text);
        break;
      case "t":
        this.deleteCommand();
        this.recordCommand(true, args.text);
        break;
      case "u":
        commands.executeCommand("cursorUp");
        break;
      case "v":
        this.pasteCommand();
        break;
      case "x":
        this.cutCommand();
        break;
      case "y":
        this.cursorSubword(this._editor, nextBoundaryRight, this.move);
        break;
      case "z":
        commands.executeCommand("undo");
        break;
      case "Z":
        commands.executeCommand("redo");
        break;
      case "/":
        commands.executeCommand("actions.find");
        break;
      case "*":
        commands.executeCommand("actions.findWithSelection");
        break;
      default:
        commands.executeCommand("default:type", args);
    }
    this._lastCommand = args.text;
  }

  handleSelectCommands(args: any) {
    switch (args.text) {
      case "d":
        if (this._editor.selection.isEmpty) {
          this.gotoHandleCommands();
        } else {
          commands.executeCommand("cancelSelection");
        }
        break;
      case "e":
        commands.executeCommand("cursorDownSelect");
        break;
      case "h":
        commands.executeCommand("cursorHomeSelect");
        break;
      case "i":
        commands.executeCommand("cursorRightSelect");
        break;
      case "j":
        commands.executeCommand("cursorPageUpSelect");
        break;
      case "J":
        commands.executeCommand("cursorTopSelect");
        break;
      case "k":
        commands.executeCommand("cursorPageDownSelect");
        break;
      case "K":
        commands.executeCommand("cursorBottomSelect");
        break;
      case "l":
        this.cursorSubword(this._editor, nextBoundaryLeft, this.select);
        break;
      case "n":
        commands.executeCommand("cursorLeftSelect");
        break;
      case "o":
        commands.executeCommand("cursorEndSelect");
        break;
      case "u":
        commands.executeCommand("cursorUpSelect");
        break;
      case "y":
        this.cursorSubword(this._editor, nextBoundaryRight, this.select);
        break;
      default:
        this.gotoHandleCommands();
        this.handleCommands(args);
    }
  }

  handleSpaceCommands(args: any) {
    switch (args.text) {
      case "^H":
        commands.executeCommand("workbench.action.navigateBack");
        this.gotoHandleCommands();
        break;
      case "b":
        this.gotoHandleSpaceBCommands();
        break;
      case "d":
        this.duplicateBuffer();
        break;
      case "/":
        commands.executeCommand("workbench.action.findInFiles");
        this.gotoHandleCommands();
        break;
      case "*":
        this.searchCurrentWord();
        break;
      default:
        this.gotoHandleCommands();
    }
  }

  handleSpaceBCommands(args: any) {
    switch (args.text) {
      case "n":
        commands.executeCommand("workbench.action.previousEditor");
        break;
      case "i":
        commands.executeCommand("workbench.action.nextEditor");
        break;
      case "u":
        commands.executeCommand("workbench.action.navigateBack");
        break;
      case "e":
        commands.executeCommand("workbench.action.navigateForward");
        break;
    }
    this.gotoHandleCommands();
  }

  handleCommaCommands(args: any) {
    switch (args.text) {
      case "d":
        commands.executeCommand("");
    }
  }

  gotoHandleCommands() {
    this._currentCommand = this.handleCommands;
    this.showStatusBar("");
  }

  gotoHandleSelectCommands() {
    this._currentCommand = this.handleSelectCommands;
    this.showStatusBar("Select");
  }

  gotoHandleSpaceCommands() {
    this._currentCommand = this.handleSpaceCommands;
    this.showStatusBar(
      "b: buffer     d: duplicate    /: search    *: search current    backspace: navigate back"
    );
  }

  gotoHandleSpaceBCommands() {
    this._currentCommand = this.handleSpaceBCommands;
    this.showStatusBar(
      "n: previous buffer   i: next buffer   u: navigate back  e: navigate forward"
    );
  }

  gotoHandleCommaCommands() {
    this._currentCommand = this.handleCommaCommands;
    this.showStatusBar("d: goto definition");
  }

  showStatusBar(msg: string) {
    if (this._statusBar) {
      this._statusBar.dispose();
    }
    this._statusBar = window.setStatusBarMessage(msg);
  }

  copyCommand() {
    if (this._editor.selection.isEmpty) {
      let merge = this._lastCommand == "c" ? true : false;
      this.newCopyBuf(merge);
      commands.executeCommand("cursorDown");
    } else {
      this.newCopyBuf();
      commands.executeCommand("editor.action.clipboardCopyAction");
      commands.executeCommand("cancelSelection");
    }
  }

  cutCommand() {
    let merge = false;
    if (this._editor.selection.isEmpty && this._lastCommand == "x") {
      merge = true;
    }
    this.newCopyBuf(merge);
    commands.executeCommand("editor.action.clipboardCutAction");
  }

  pasteCommand() {
    this.doPaste(ModalEditor._copyBuffer);
  }

  deleteCommand() {
    let document = this._editor.document;
    let position = this._editor.selection.active;
    let nextPos = nextBoundaryRight(document, position);
    let range = new Range(this._editor.selection.active, nextPos);

    this._editor.edit(builder => {
      builder.delete(range);
    });
  }

  recordCommand(isCommand: boolean, text: string) {
    if (this._replaying) {
      return;
    }
    if (this._editor.selection.active != this._lastPos) {
      this._lastCommands = [];
    }
    this._lastCommands.push({ command: isCommand, text: text });
    this._lastPos = this._editor.selection.active;
  }

  repeatCommands() {
    this._replaying = true;
    this._lastCommands.forEach(arg => {
      if (arg.command) {
        this.handleCommands(arg);
      } else {
        commands.executeCommand("default:type", arg);
      }
    });
    this._replaying = false;
  }

  toggleCase() {
    var testRange = this._editor.selection.with(
      this._editor.selection.start,
      this._editor.selection.start.translate(0, 1)
    );
    if (this._editor.selection.isEmpty) {
      this._editor.selection = new Selection(this._editor.selection.start, testRange.end);
    }
    var str = this._editor.document.getText(testRange);
    if (str.toLocaleLowerCase() == str) {
      commands.executeCommand("editor.action.transformToUppercase");
    } else {
      commands.executeCommand("editor.action.transformToLowercase");
    }
    this._editor.selection = new Selection(this._editor.selection.end, this._editor.selection.end);
  }

  duplicateBuffer() {
    var viewColumn = this.nextViewColumn(this._editor.viewColumn);
    window.showTextDocument(this._editor.document, viewColumn);
    this.gotoHandleCommands();
  }

  nextViewColumn(column: ViewColumn) {
    if (column == undefined) {
      return ViewColumn.One;
    } else {
      return (column % 2) + 1;
    }
  }

  searchCurrentWord() {
    if (this._editor.selection.isEmpty) {
      var range = this._editor.document.getWordRangeAtPosition(this._editor.selection.active);
      this._editor.selection = new Selection(range.start, range.end);
    }
    commands.executeCommand("workbench.action.findInFiles");
    this.gotoHandleCommands();
  }

  handleToggle() {
    this._modal = !this._modal;
    this.setCursor();
    this.gotoHandleCommands();
  }

  handleActiveEditorChange() {
    this.setCursor();
  }

  setEditor(editor: TextEditor) {
    this._editor = editor;
  }

  setCursor() {
    if (this._modal) {
      this._editor.options.cursorStyle = TextEditorCursorStyle.Block;
    } else {
      this._editor.options.cursorStyle = TextEditorCursorStyle.Line;
    }
  }
  // from
  // https://github.com/stef-levesque/vscode-multiclip/blob/master/src/extension.ts
  newCopyBuf(merge: boolean = false): string {
    let d = this._editor.document;
    let sel = this._editor.selection;
    let txt: string = d.getText(new Range(sel.start, sel.end));

    // A copy of a zero length line means copy the whole line.
    if (txt.length === 0) {
      txt = d.lineAt(sel.start.line).text + this._eol;
    }

    if (merge) {
      ModalEditor._copyBuffer += txt;
    } else {
      ModalEditor._copyBuffer = txt;
    }
    return txt;
  }

  doPaste(txt: string) {
    const e = this._editor;
    const d = e ? e.document : null;
    if (!e || !d) {
      return;
    }

    e.edit(function(edit: TextEditorEdit) {
      e.selections.forEach(sel => {
        edit.replace(sel, txt);
      });
    }).then(() => {
      commands.executeCommand("cancelSelection");
    });
    // .then(() => {
    //   setTimeout(() => {
    //     // Grab a copy of the current selection array
    //     const tmpSelections = e.selections;

    //     // Grab the current primary selection
    //     const sel = tmpSelections[0];

    //     // Change the current selection array to contain a single item
    //     // that encompasses the entire pasted block.
    //     e.selections = [sel];

    //     // Send the pasted value to the system clipboard.
    //     commands.executeCommand("editor.action.clipboardCopyAction").then(() => {
    //       setTimeout(() => {
    //         // Restore the previous selection(s)
    //         e.selections = tmpSelections;

    //         // Format the selection, if enabled
    //         if (this._formatAfterPaste) {
    //           commands.executeCommand("editor.action.formatSelection").then(() => {
    //             setTimeout(function() {
    //               lastRange = new Range(e.selection.start, e.selection.end);
    //             }, 100);
    //           });
    //         } else {
    //           lastRange = new Range(e.selection.start, e.selection.end);
    //         }
    //       }, 100);
    //     });
    //   }, 100);
    // });
  }

  // from: https://github.com/ow--/vscode-subword-navigation/blob/master/src/commands.ts
  cursorSubword(editor: TextEditor, next: BoundaryFunc, sel: SelectionFunc) {
    editor.selections = editor.selections.map(s => sel(s, next(editor.document, s.active)));
    this.reveal(editor);
  }

  reveal(editor: TextEditor) {
    if (editor.selections.length === 1) {
      editor.revealRange(editor.selection, TextEditorRevealType.InCenterIfOutsideViewport);
    }
  }

  move(selection: Selection, boundary: Position) {
    return new Selection(boundary, boundary);
  }

  select(selection: Selection, boundary: Position) {
    return new Selection(selection.anchor, boundary);
  }

  dispose() {
    this._statusBar.dispose();
  }
}
