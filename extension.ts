import * as vscode from 'vscode';

let isAutoCenterEnabled = false;

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.toggleAutoCenter', () => {
        isAutoCenterEnabled = !isAutoCenterEnabled;
        vscode.window.showInformationMessage(`Auto code centering feature is now ${isAutoCenterEnabled ? 'enabled' : 'disabled'}.`);
    });
    context.subscriptions.push(disposable);

    let centerDisposable = vscode.commands.registerCommand('extension.centerText', () => {
        centerText();
    });
    context.subscriptions.push(centerDisposable);

    vscode.workspace.onDidSaveTextDocument((_) => {
        if (isAutoCenterEnabled) {
            centerText();
        }
    });
}

export function deactivate() {}

function centerText() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return vscode.window.showErrorMessage('No active text editor.');
    }

    const document = editor.document;
    const maxLength = findLongestLineLength(document);
    if (maxLength <= 0) {
        return vscode.window.showInformationMessage('No text found to center.');
    }

    editor.edit((editBuilder) => {
        for (let i = 0; i < document.lineCount; i++) {
            const currentLine = document.lineAt(i);
            if (currentLine.isEmptyOrWhitespace) {
                continue;
            }

            const line = currentLine.text.trim();
            let padding = Math.max(0, Math.round((maxLength - line.length) / 2));
            const leadingSpaces = currentLine.firstNonWhitespaceCharacterIndex;
            if (leadingSpaces + padding > 0) {
                padding = Math.max(0, padding - leadingSpaces);
            }
            const padText = ' '.repeat(padding);

            editBuilder.insert(currentLine.range.start, padText);
        }
    });
}

function findLongestLineLength(document: vscode.TextDocument): number {
    let maxLength = 0;
    for (let i = 0; i < document.lineCount; i++) {
        const trimmedLine = document.lineAt(i).text.trim();
        maxLength = Math.max(maxLength, trimmedLine.length);
    }
    return maxLength;
}
