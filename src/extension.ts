'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument,
        TextEditorCursorStyle, TextEditor, ViewColumn} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    let manager = new ModalEditorManager();

    let editor = window.activeTextEditor;
    if (editor) {
        let modalEditor = manager.getModalEditorFor(editor);
        console.log(modalEditor);
        context.subscriptions.push(modalEditor);
    }
    let changeCallback = window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            let modalEditor = manager.getModalEditorFor(editor);
            modalEditor.handleActiveEditorChange();
        }
    });
    let typeCommand = commands.registerCommand('type', args => {
        let editor = window.activeTextEditor;
        if (editor) {
            let modalEditor = manager.getModalEditorFor(editor);
            modalEditor.handleType(args);
        }
    });
    let toggleCommand = commands.registerCommand('extension.toggleNeiu', args => {
        let editor = window.activeTextEditor;
        if (editor) {
            let modalEditor = manager.getModalEditorFor(editor);
            modalEditor.handleToggle();
        }
    });
    context.subscriptions.push(changeCallback);
    context.subscriptions.push(typeCommand);
    context.subscriptions.push(toggleCommand);
    context.subscriptions.push(manager);
}

class ModalEditorManager {
    private _modalEditors: {[key: string]: ModalEditor};

    constructor() {
        this._modalEditors = {};
    }

    getModalEditorFor(editor: TextEditor): ModalEditor {
        if (!editor) {
            return null;
        }
        let key = editor.document.fileName + (editor.viewColumn || ViewColumn.One);
        console.log(key);
        let modalEditor = this._modalEditors[key];
        if (!modalEditor) {
            modalEditor = new ModalEditor(editor);
            console.log("modalEditor " + modalEditor);
            this._modalEditors[key] = modalEditor;
        }
        return modalEditor;
    }

    dispose() {
    }
}

class ModalEditor {
    private _modal: boolean;
    private _editor: TextEditor;

    constructor(editor: TextEditor) {
        this._editor = editor;
        this._modal = true;
        this.setCursor();
    }

    handleType(args) {
        if (!this._modal) {
            commands.executeCommand('default:type', args);
            return;
        }
        switch (args.text) {
            case 'a':
                commands.executeCommand('editor.action.commentLine');
                commands.executeCommand('cursorDown');
                break;
            case 'b':
                commands.executeCommand('expandLineSelection');
                break;
            case 'c':
                commands.executeCommand('editor.action.clipboardCopyAction');
                break;
            case 'e':
                commands.executeCommand('cursorDown');
                break;
            case 'f':
                commands.executeCommand('deleteWordLeft');
                break;
            case 'g':
                commands.executeCommand('deleteAllRight');
                break;
            case 'h':
                commands.executeCommand('cursorHome');
                break;
            case 'i':
                commands.executeCommand('cursorRight');
                break;
            case 'j':
                commands.executeCommand('cursorPageUp');
                break;
            case 'k':
                commands.executeCommand('cursorPageDown');
                break;
            case 'l':
                commands.executeCommand('cursorWordStartLeft');
                break;
            case 'n':
                commands.executeCommand('cursorLeft');
                break;
            case 'o':
                commands.executeCommand('cursorEnd');
                break;
            case 's':
                commands.executeCommand('deleteRight');
                break;
            case 't':
                commands.executeCommand('deleteWordRight');
                break;
            case 'u':
                commands.executeCommand('cursorUp');
                break;
            case 'v':
                commands.executeCommand('editor.action.clipboardPasteAction');
                break;
            case 'x':
                commands.executeCommand('editor.action.clipboardCutAction');
                break;
            case 'y':
                commands.executeCommand('cursorWordEndRight');
                break;
            case 'z':
                commands.executeCommand('undo');
                break;
            case '/':
                commands.executeCommand('actions.find');
                break;
            case '*':
                commands.executeCommand('actions.findWithSelection');
                break;
            default:
                commands.executeCommand('default:type', args);
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
            this._editor.options.cursorStyle = TextEditorCursorStyle.Block;
        } else {
            this._editor.options.cursorStyle = TextEditorCursorStyle.Line;
        }
    }
    
    dispose() {
    }
}
