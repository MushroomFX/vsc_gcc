const vscode = require('vscode');
const path = require('path');
const main = require('./main')

const supportedFormats = require('./modules/_supportedFormats')

/**
 * Extension activation
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const runCommand = vscode.commands.registerCommand(
        'extension.runFileCmd',
        (uri) => main(uri)
    );

    context.subscriptions.push(runCommand);

    const runButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        -1000
    );

    runButton.text = "$(play) GCC Run";
    runButton.tooltip = "Compile and run current file with GCC";
    runButton.command = "extension.runFileCmd";
    runButton.show();
    
    context.subscriptions.push(runButton);


    const updateButton = (editor)=>{
        if (!editor) {
            runButton.hide();
            return;
        }

        const ext = path.extname(editor.document.fileName).toLowerCase();

        if (supportedFormats.includes(ext)) {
            runButton.show();
        } else {
            runButton.hide();
        }
    }
    
    // inital
    updateButton(vscode.window.activeTextEditor);
    context.subscriptions.push(updateButton(vscode.window.activeTextEditor));


    // active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor)=>{
            updateButton(editor)
        })
    );
    
    // when open text editor
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
            updateButton(editor);
        })
    );

    // when save document
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(doc => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
            updateButton(editor);
        })
    );
}

function deactivate(){}

module.exports = {
    activate,
    deactivate
};