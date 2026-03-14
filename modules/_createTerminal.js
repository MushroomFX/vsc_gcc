const vscode = require('vscode');

async function createTerminal(terminalName, kill = false) {
    let terminal = vscode.window.terminals.find(t => t.name === terminalName);

    if (terminal && kill) {
    // Attempt to kill the running process
    terminal.sendText("\x03", true); // Sends Ctrl+C to stop the running program

    await new Promise(resolve => {
        const disposable = vscode.window.onDidCloseTerminal(closedTerminal => {
            if (closedTerminal === terminal) {
                disposable.dispose();
                resolve();
            }
        });
        terminal.dispose();
    });

    terminal = undefined;
}

    if (!terminal) {
        terminal = vscode.window.createTerminal({
            name: terminalName,
            shellPath: "C:\\Windows\\System32\\cmd.exe"
        });
    }

    return terminal;
}

module.exports = createTerminal