import * as vscode from 'vscode';

export class ModalEditor {
    private _modal: boolean;
    private _editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this._editor = editor;
        this._modal = true;
        this.setCursor();
    }

    handleType(args) {
        if (!this._modal) {
            vscode.commands.executeCommand('default:type', args);
            return;
        }
        switch (args.text) {
            case 'a':
                vscode.commands.executeCommand('editor.action.commentLine');
                vscode.commands.executeCommand('cursorDown');
                break;
            case 'b':
                vscode.commands.executeCommand('expandLineSelection');
                break;
            case 'c':
                vscode.commands.executeCommand('editor.action.clipboardCopyAction');
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
    }
}
