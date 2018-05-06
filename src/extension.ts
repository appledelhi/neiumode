'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ModalEditor } from './modalEditor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let manager = new ModalEditorManager();

    let editor = vscode.window.activeTextEditor;
    if (editor) {
        let modalEditor = manager.getModalEditorFor(editor);
        console.log(modalEditor);
        context.subscriptions.push(modalEditor);
    }
    let changeCallback = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            let modalEditor = manager.getModalEditorFor(editor);
            modalEditor.handleActiveEditorChange();
        }
    });
    let typeCommand = vscode.commands.registerCommand('type', args => {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let modalEditor = manager.getModalEditorFor(editor);
            modalEditor.handleType(args);
        }
    });
    let toggleCommand = vscode.commands.registerCommand('extension.toggleNeiu', args => {
        let editor = vscode.window.activeTextEditor;
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

    getModalEditorFor(editor: vscode.TextEditor): ModalEditor {
        if (!editor) {
            return null;
        }
        let key = editor.document.fileName + (editor.viewColumn || vscode.ViewColumn.One);
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