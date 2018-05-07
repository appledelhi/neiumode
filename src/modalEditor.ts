import * as vscode from 'vscode';

export class ModalEditor {
    private _modal: boolean;
    private _editor: vscode.TextEditor;
    private _statusBar: vscode.Disposable;
    private _currentCommand: (any) => void;

    constructor(editor: vscode.TextEditor) {
        this._editor = editor;
        this._modal = true;
        this._currentCommand = this.handleCommands;
        this.setCursor();
    }

    handleType(args) {
        if (!this._modal) {
            vscode.commands.executeCommand('default:type', args);
            return;
        }
        this._currentCommand(args);
    }

    handleCommands(args: any) {
        switch (args.text) {
            case ' ':
                this.gotoHandleSpaceCommands();
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
                vscode.commands.executeCommand('deleteWordLeft');
                break;
            case 'g':
                vscode.commands.executeCommand('deleteAllRight');
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
            case 'k':
                vscode.commands.executeCommand('cursorPageDown');
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
            case 's':
                vscode.commands.executeCommand('deleteRight');
                break;
            case 't':
                vscode.commands.executeCommand('deleteWordRight');
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
            case 'b':
                this.gotoHandleSpaceBCommands();
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
        this.showStatusBar("b: buffer")
    }

    gotoHandleSpaceBCommands() {
        this._currentCommand = this.handleSpaceBCommands;
        this.showStatusBar("n: previous buffer   i: next buffer   u: navigate back  e: navigate forward")
    }

    showStatusBar(msg: string) {
        if (this._statusBar) {
            this._statusBar.dispose();
        }
        this._statusBar = vscode.window.setStatusBarMessage(msg);
    }

    handleToggle() {
        this._modal = !this._modal;
        this.setCursor();
    }

    handleActiveEditorChange() {
        this.setCursor();
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
