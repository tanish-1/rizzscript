// extension.js — RizzScript VS Code Extension
// Registers the "Run RizzScript File" command and adds it to the editor toolbar.

const vscode = require('vscode');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Register the "Run RizzScript File" command
    const runCommand = vscode.commands.registerCommand('rizzscript.runFile', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active file to run!');
            return;
        }

        const filePath = editor.document.fileName;

        if (!filePath.endsWith('.rizz')) {
            vscode.window.showErrorMessage('This is not a .rizz file!');
            return;
        }

        // Save the file before running
        editor.document.save().then(() => {
            // Get or create the RizzScript terminal
            let terminal = vscode.window.terminals.find(t => t.name === 'RizzScript');
            if (!terminal) {
                terminal = vscode.window.createTerminal('RizzScript');
            }

            terminal.show(true);
            // Run the file using the rizz CLI
            terminal.sendText(`rizz "${filePath}"`);
        });
    });

    context.subscriptions.push(runCommand);

    // Show a welcome message when a .rizz file is opened
    const onOpenRizz = vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.fileName.endsWith('.rizz')) {
            vscode.window.setStatusBarMessage('🔥 RizzScript loaded — click ▶ to run!', 3000);
        }
    });

    context.subscriptions.push(onOpenRizz);
}

function deactivate() { }

module.exports = { activate, deactivate };
