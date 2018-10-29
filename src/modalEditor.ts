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
import { Clipboard } from "./clipboard";
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
  private _replaying: boolean;
  private _formatAfterPaste: boolean;
  private _eol: string;
  private _lastCommand: string;
  private _searchWord: string;

  constructor(editor: TextEditor) {
    this._editor = editor;
    this._modal = true;
    this._currentCommand = this.handleCommands;
    this._lastCommands = [];
    this._replaying = false;
    this._searchWord = "";
    this._lastCommand = "";
    let config = workspace.getConfiguration("editor", editor.document.uri);
    this._formatAfterPaste = config.get("formatOnPaste", false);
    config = workspace.getConfiguration("files", editor.document.uri);
    this._eol = config.get("eol", "\n");
    this.setCursor();
  }

  handleType(args) {
    if (!this._modal) {
      commands.executeCommand("default:type", args);
      this.recordCommand(false, args.text);
      // It was text insert.
      this._lastCommand = "";
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

  async handleCommands(args: any) {
    switch (args.text) {
      case "^H":
        await this.deleteCommand(args.text);
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
        this.moveCommand("cursorDown");
        break;
      case "f":
        await this.deleteCommand(args.text);
        break;
      case "g":
        await this.deleteCommand(args.text);
        break;
      case "h":
        this.moveCommand("cursorHome");
        break;
      case "i":
        this.moveCommand("cursorRight");
        break;
      case "j":
        this.moveCommand("cursorPageUp");
        break;
      case "J":
        this.moveCommand("cursorTop");
        break;
      case "k":
        this.moveCommand("cursorPageDown");
        break;
      case "K":
        this.moveCommand("cursorBottom");
        break;
      case "l":
        this.cursorSubword(this._editor, nextBoundaryLeft, this.move);
        break;
      case "n":
        this.moveCommand("cursorLeft");
        break;
      case "o":
        this.moveCommand("cursorEnd");
        break;
      case "r":
        this.repeatCommands();
        break;
      case "s":
        await this.deleteCommand(args.text);
        break;
      case "t":
        await this.deleteCommand(args.text);
        break;
      case "u":
        this.moveCommand("cursorUp");
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
      case ".":
        this.findNext();
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
        commands.executeCommand("editor.action.goToImplementation");
    }
    this.gotoHandleCommands();
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

  moveCommand(command) {
    commands.executeCommand(command);
  }

  copyCommand() {
    if (this._editor.selection.isEmpty) {
      let merge = this._lastCommand == "c" ? true : false;
      this.copyBuf(false, merge);
      commands.executeCommand("cursorDown");
    } else {
      this.copyBuf(false, false);
      commands.executeCommand("cancelSelection");
    }
  }

  cutCommand() {
    let merge = false;
    if (this._editor.selection.isEmpty && this._lastCommand == "x") {
      merge = true;
    }
    this.copyBuf(true, merge);
  }

  pasteCommand() {
    commands.executeCommand("editor.action.clipboardPasteAction");
    commands.executeCommand("cancelSelection");
  }

  async deleteCommand(command: string) {
    let recordingCommand = command == "f" ? "t" : command;
    let isNew = this.recordCommand(true, recordingCommand);

    let document = this._editor.document;
    let position = this._editor.selection.active;
    let nextPos;
    let prepend = false;
    switch (command) {
      case "^H":
        nextPos = position.translate(0, -1);
        prepend = true;
        break;
      case "f":
        nextPos = nextBoundaryLeft(document, position);
        prepend = true;
        break;
      case "s":
        nextPos = position.translate(0, 1);
        break;
      case "t":
        nextPos = nextBoundaryRight(document, position);
        break;
      case "g":
        nextPos = position.translate(0, 10000);
        break;
    }
    let range = new Range(position, nextPos);
    let text = document.getText(range);
    this._searchWord += text;
    Clipboard.write(text, !isNew, prepend);

    await this._editor.edit(builder => {
      builder.delete(range);
    });
  }

  recordCommand(isCommand: boolean, command: string): boolean {
    if (this._replaying) {
      return;
    }
    let wasNew = false;
    const deleteCommands = ["^H", "f", "s", "t"];
    if (
      !this.isDeleteCommand(true, this._lastCommand) &&
      this.isDeleteCommand(isCommand, command)
    ) {
      this._lastCommands = [];
      this._searchWord = "";
      wasNew = true;
    }
    this._lastCommands.push({ command: isCommand, text: command });
    return wasNew;
  }

  isDeleteCommand(isCommand: boolean, command: string) {
    const deleteCommands = ["^H", "f", "s", "t"];
    return isCommand && deleteCommands.includes(command);
  }

  async repeatCommands() {
    this._replaying = true;
    this.showStatusBar("length " + this._lastCommands.length);
    for (let command of this._lastCommands) {
      if (command.command) {
        await this.handleCommands(command);
      } else {
        commands.executeCommand("default:type", command);
      }
    }
    this._replaying = false;
  }

  findNext() {
    if (this._searchWord == "") {
      return;
    }
    let text = this._editor.document.getText();
    let index = this._editor.document.offsetAt(this._editor.selection.active);
    let nextIndex = text.indexOf(this._searchWord, index + 1);
    if (nextIndex < 0) {
      nextIndex = text.indexOf(this._searchWord, 0);
      if (nextIndex < 0) {
        this.showStatusBar("No results");
        return;
      }
    }
    let nextPos = this._editor.document.positionAt(nextIndex);
    this._editor.selection = new Selection(nextPos, nextPos);
    this.reveal(this._editor);
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

  copyBuf(cut: boolean, merge: boolean) {
    let d = this._editor.document;
    let sel = this._editor.selection;

    if (sel.isEmpty) {
      let start = new Position(sel.start.line, 0);
      let end = start.translate(1, 0);
      sel = new Selection(start, end);
    }
    let range = new Range(sel.start, sel.end);
    let txt: string = d.getText(range);

    Clipboard.write(txt, merge);
    if (cut) {
      this._editor.edit(builder => {
        builder.delete(range);
      });
    }
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
  // end of copied code

  dispose() {
    this._statusBar.dispose();
  }
}
