const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const pkg = require('./package.json');

const info = {
    author:{
        full:"MushroomFX",
        short:"MFX"
    },
    debugName: "mfx gcc-runner",
    version: pkg.version
}

const supportedFormats = [
    // C
    ".c",

    // C++
    ".cpp", ".cc", ".cxx", ".C", ".CPP",

    // Objective-C
    ".m",

    // Objective-C++
    ".mm",

    // Fortran
    ".f", ".for", ".f77", ".f90", ".f95", ".f03", ".f08",

    // Ada
    ".adb", ".ads",

    // Go
    ".go",

    // D
    ".d",

    // Java (GCC supports compiling Java via GCJ, though it's deprecated)
    ".java",

    // Pascal (via GCC-Pascal frontends, less common)
    ".pas", ".pp",

    // OpenMP-specific source files (generally same as C/C++ but can include .omp)
    ".omp",

    // Common assembler files GCC handles
    ".s", ".S", ".asm",

    // Linker scripts (not code but sometimes compiled by GCC)
    ".ld"
];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.runFileCmd', (uri) => {
        if (!uri) {
            vscode.window.showErrorMessage('No file selected.');
            return;
        }

        const filePath = uri.fsPath;
        const folderPath = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const extension = path.extname(fileName);

        // Error handling for only gcc supported files
        if (!supportedFormats.includes(extension)) {
            vscode.window.showErrorMessage(`Not a supported file format (${extension})`);
            return;
        }

        const exeFile = fileName.replace(extension, ".exe");

        const safeExeFile = fileName.replace(/\.[^/.]+$/, "") // remove extension
                            .replace(/[^\x00-\x7F]/g, "_") // remove non-ASCII
                            + ".exe";

        // Check for an existing terminal or create one using cmd.exe
        let terminal = vscode.window.terminals.find(t => t.name === "Run GCC Cmd");
        if (!terminal) {
            terminal = vscode.window.createTerminal({
                name: "Run GCC Cmd",
                shellPath: "C:\\Windows\\System32\\cmd.exe"
            });
        }

        // create banner
        const cols = terminal?.dimensions?.columns || 80;  // fallback if undefined
        const splitRow = "=".repeat(cols);
        const banner = bannerRow(splitRow, ` ${info.debugName} v${info.version} `);

        let parameterArray = [""]

        const rawC = fs.readFileSync(filePath)
        
        if(rawC.includes("WinMain")){
            parameterArray.push("mwindows")
        } else {
            parameterArray.push("mconsole")
        }

        const parameters = parameterArray.join(" -").trim("")

        // vscode.window.showInformationMessage(`Compiler settings: ${parameters}`);
        
        



        // Construct the commands
        const commands = [
            "@echo off",
            "chcp 65001 >nul",
            "cls",
            
            `echo ${banner}`,
            
            `echo Compiling\: ^"${fileName}^" ==^> ^"${safeExeFile}^"...`,
            `pushd ${folderPath}`,
            `gcc -finput-charset=UTF-8 "${fileName}" -o "${safeExeFile}" ${parameters}`,
            
            `echo Running ^"${safeExeFile}^"...`,
            `@echo on`,
            `"${safeExeFile}"`
        ]

        terminal.show(false);
        
        const cmd = commands.join(" && ")

        vscode.window.showInformationMessage(cmd);

        terminal.sendText(cmd, true)


    });
    context.subscriptions.push(disposable);
}

function deactivate() {}


function bannerRow(bannerString,textString){
    if(bannerString.length < textString.length){
        return bannerString
    }
    const bannerCenter = Math.floor(bannerString.length / 2)
    const textCenter = Math.floor(textString.length / 2)
    const cursorPos = bannerCenter - textCenter

    const before = bannerString.slice(0, cursorPos);            // everything before the insertion
    const after = bannerString.slice(cursorPos + textString.length); // everything after the inserted part
    return before + textString + after;

}

module.exports = { activate, deactivate };