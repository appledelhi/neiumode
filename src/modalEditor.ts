import * as vscode from 'vscode';

export class ModalEditor {
    private _modal: boolean;
    private _editor: vscode.TextEditor;
    private _statusBar: vscode.Disposable;
    private _currentCommand: (any) => void;
    private _lastCommands: Array<any>;
    private _lastPos: vscode.Position;
    private _replaying: boolean;

    constructor(editor: vscode.TextEditor) {
        this._editor = editor;
        this._modal = true;
        this._currentCommand = this.handleCommands;
        this._lastCommands = [];
        this._lastPos = editor.selection.active;
        this._replaying = false;
        this.setCursor()
    }

    handleType(args) {
        if (!this._modal) {
            vscode.commands.executeCommand('default:type', args).then(_ => {
                this._lastPos = this._editor.selection.active;
            });
            this.recordCommand(false, args.text);
            return;
        }
        this._currentCommand(args);
    }

    handleBackspace(args) {
        if (!this._modal) {
            vscode.commands.executeCommand('deleteLeft', args)
            return;
        }
        this._currentCommand({text: '^H'});
    }

    handleCommands(args: any) {
        switch (args.text) {
            case '^H':
                vscode.commands.executeCommand('deleteLeft', args);
                break;
            case ' ':
                this.gotoHandleSpaceCommands();
                break;
            case ',':
                this.gotoHandleCommaCommands();
                break;
            case '~':
                this.toggleCase();
                break;
            case '^':
                vscode.commands.executeCommand('cursorUp');
                vscode.commands.executeCommand('editor.action.joinLines');
                break;
            case 'a':
                vscode.commands.executeCommand('editor.action.commentLine');
                vscode.commands.executeCommand('cursorDown');
                break;
            case 'b':
                vscode.commands.executeCommand('expandLineSelection');
                break;
            case 'c':
                vscode.commands.executeCommand('editor.action.clipboardCopyAction');
                vscode.commands.executeCommand('cancelSelection');
                break;
            case 'd':
                this.gotoHandleSelectCommands();
                break;
            case 'e':
                vscode.commands.executeCommand('cursorDown');
                break;
            case 'f':
                vscode.commands.executeCommand('deleteWordLeft').then(_ => {
                    this._lastPos = this._editor.selection.active
                });
                this.recordCommand(true, 't');
                break;
            case 'g':
                vscode.commands.executeCommand('deleteAllRight');
                this.recordCommand(true, args.text);
                break;
            case 'h':
                vscode.commands.executeCommand('cursorHome');
                break;
            case 'i':
                vscode.commands.executeCommand('cursorRight');
                break;
            case 'j':
                vscode.commands.executeCommand('cursorPageUp');
                break;
            case 'J':
                vscode.commands.executeCommand('cursorTop');
                break;
            case 'k':
                vscode.commands.executeCommand('cursorPageDown');
                break;
            case 'K':
                vscode.commands.executeCommand('cursorBottom');
                break;
            case 'l':
                vscode.commands.executeCommand('cursorWordStartLeft');
                break;
            case 'n':
                vscode.commands.executeCommand('cursorLeft');
                break;
            case 'o':
                vscode.commands.executeCommand('cursorEnd');
                break;
            case 'r':
                this.repeatCommands();
                break;
            case 's':
                vscode.commands.executeCommand('deleteRight');
                this.recordCommand(true, args.text);
                break;
            case 't':
                vscode.commands.executeCommand('deleteWordRight');
                this.recordCommand(true, args.text);
                break;
            case 'u':
                vscode.commands.executeCommand('cursorUp');
                break;
            case 'v':
                vscode.commands.executeCommand('editor.action.clipboardPasteAction');
                break;
            case 'x':
                vscode.commands.executeCommand('editor.action.clipboardCutAction');
                break;
            case 'y':
                vscode.commands.executeCommand('cursorWordEndRight');
                break;
            case 'z':
                vscode.commands.executeCommand('undo');
                break;
            case 'Z':
                vscode.commands.executeCommand('redo');
                break;
            case '/':
                vscode.commands.executeCommand('actions.find');
                break;
            case '*':
                vscode.commands.executeCommand('actions.findWithSelection');
                break;
            default:
                vscode.commands.executeCommand('default:type', args);
        }
    }

    handleSelectCommands(args: any) {
        switch (args.text) {
            case 'd':
                if (this._editor.selection.isEmpty) {
                    this.gotoHandleCommands();
                } else {
                    vscode.commands.executeCommand('cancelSelection');
                }
                break;
            case 'e':
                vscode.commands.executeCommand('cursorDownSelect');
                break;
            case 'h':
                vscode.commands.executeCommand('cursorHomeSelect');
                break;
            case 'i':
                vscode.commands.executeCommand('cursorRightSelect');
                break;
            case 'j':
                vscode.commands.executeCommand('cursorPageUpSelect');
                break;
            case 'J':
                vscode.commands.executeCommand('cursorTopSelect');
                break;
            case 'k':
                vscode.commands.executeCommand('cursorPageDownSelect');
                break;
            case 'K':
                vscode.commands.executeCommand('cursorBottomSelect');
                break;
            case 'l':
                vscode.commands.executeCommand('cursorWordStartLeftSelect');
                break;
            case 'n':
                vscode.commands.executeCommand('cursorLeftSelect');
                break;
            case 'o':
                vscode.commands.executeCommand('cursorEndSelect');
                break;
            case 'u':
                vscode.commands.executeCommand('cursorUpSelect');
                break;
            case 'y':
                vscode.commands.executeCommand('cursorWordEndRightSelect');
                break;
            default:
                this.gotoHandleCommands();
                this.handleCommands(args);
        }
    }

    handleSpaceCommands(args: any) {
        switch (args.text) {
            case '^H':
                vscode.commands.executeCommand('workbench.action.navigateBack');
                this.gotoHandleCommands();
                break;
            case 'b':
                this.gotoHandleSpaceBCommands();
                break;
            case 'd':
                this.duplicateBuffer();
                break;
            case '/':
                vscode.commands.executeCommand('workbench.action.findInFiles');
                this.gotoHandleCommands();
                break;
            case '*':
                this.searchCurrentWord();
                break;
            default:
                this.gotoHandleCommands();
        }
    }

    handleSpaceBCommands(args: any) {
        switch (args.text) {
            case 'n':
                vscode.commands.executeCommand('workbench.action.previousEditor');
                break;
            case 'i':
                vscode.commands.executeCommand('workbench.action.nextEditor');
                break;
            case 'u':
                vscode.commands.executeCommand('workbench.action.navigateBack');
                break;
            case 'e':
                vscode.commands.executeCommand('workbench.action.navigateForward');
                break;
        }
        this.gotoHandleCommands();
    }

    handleCommaCommands(args: any) {
        switch (args.text) {
            case 'd':
                vscode.commands.executeCommand('')
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
        this.showStatusBar("b: buffer     d: duplicate    /: search    *: search current    backspace: navigate back")
    }

    gotoHandleSpaceBCommands() {
        this._currentCommand = this.handleSpaceBCommands;
        this.showStatusBar("n: previous buffer   i: next buffer   u: navigate back  e: navigate forward")
    }

    gotoHandleCommaCommands() {
        this._currentCommand = this.handleCommaCommands;
        this.showStatusBar("d: goto definition");
    }

    showStatusBar(msg: string) {
        if (this._statusBar) {
            this._statusBar.dispose();
        }
        this._statusBar = vscode.window.setStatusBarMessage(msg);
    }

    recordCommand(isCommand: boolean, text: string) {
        if (this._replaying) {
            return;
        }
        if (this._editor.selection.active != this._lastPos) {
            this._lastCommands = [];
        }
        this._lastCommands.push({command: isCommand, text: text});
        this._lastPos = this._editor.selection.active;
    }

    repeatCommands() {
        this._replaying = true;
        this._lastCommands.forEach(arg => {
            if (arg.command) {
                this.handleCommands(arg);
            } else {
                vscode.commands.executeCommand('default:type', arg);
            }
        });
        this._replaying = false;
    }

    toggleCase() {
        var testRange = this._editor.selection.with(this._editor.selection.start, this._editor.selection.start.translate(0, 1));
        if (this._editor.selection.isEmpty) {
            this._editor.selection = new vscode.Selection(this._editor.selection.start, testRange.end);
        }
        var str = this._editor.document.getText(testRange);
        if (str.toLocaleLowerCase() == str) {
            vscode.commands.executeCommand('editor.action.transformToUppercase')
        } else {
            vscode.commands.executeCommand('editor.action.transformToLowercase')
        }
        this._editor.selection = new vscode.Selection(this._editor.selection.end, this._editor.selection.end);
    }

    duplicateBuffer() {
        var viewColumn = this.nextViewColumn(this._editor.viewColumn);
        vscode.window.showTextDocument(this._editor.document, viewColumn);
        this.gotoHandleCommands();
    }

    nextViewColumn(column: vscode.ViewColumn) {
        if (column == undefined) {
            return vscode.ViewColumn.One;
        } else {
            return column % 2 + 1;
        }
    }

    searchCurrentWord() {
        if (this._editor.selection.isEmpty) {
            var range = this._editor.document.getWordRangeAtPosition(this._editor.selection.active);
            this._editor.selection = new vscode.Selection(range.start, range.end);
        }
        vscode.commands.executeCommand('workbench.action.findInFiles');
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

    setEditor(editor: vscode.TextEditor) {
        this._editor = editor;
    }

    setCursor() {
        if (this._modal) {
            this._editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
        } else {
            this._editor.options.cursorStyle = vscode.TextEditorCursorStyle.Line;
        }
    }
    
    dispose() {
        this._statusBar.dispose();
    }
}
