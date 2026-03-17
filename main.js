const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const createTerminal = require('./modules/_createTerminal')
const bannerRow = require('./modules/_bannerRow')
const supportedFormats = require('./modules/_supportedFormats')
const info = require('./modules/_info')

async function main(uri){
    const editor = vscode.window.activeTextEditor;
    if (!uri) {
        if (!editor) {
            vscode.window.showErrorMessage('No file selected.');
            return;
        }
        uri = editor.document.uri;
    }

    // save the current file
    if (editor && editor.document.isDirty) {
        const ok = await editor.document.save();

        if (!ok) {
            vscode.window.showErrorMessage("Failed to save file.");
            return;
        }
    }

    const filePath = uri.fsPath;
    const folderPath = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(fileName);

    if (!supportedFormats.includes(extension)) {
        vscode.window.showErrorMessage(`Not a supported file format (${extension})`);
        return;
    }

    const safeExeFile =
        fileName
            .replace(/\.[^/.]+$/, "")
            .replace(/[^\x00-\x7F]/g, "_")
        + ".exe";

    const terminal = await createTerminal("Run GCC Cmd",true)

    const cols = terminal?.dimensions?.columns || 80;
    const splitRow = "=".repeat(cols);
    const banner = bannerRow(splitRow, ` ${info.debugName} v${info.version} `);

    let parameterArray = [""];

    const rawC = fs.readFileSync(filePath);

    if (rawC.includes("WinMain")) {
        parameterArray.push("mwindows");
    } else {
        parameterArray.push("mconsole");
    }

    const parameters = parameterArray.join(" -").trim("");

    const outputFolderName = "build"
    const outputPath = path.join(folderPath,outputFolderName)
    const outputFile = path.join(outputPath,safeExeFile)

    fs.mkdirSync(outputPath,{recursive:true})

    const commands = [
        "@echo off",
        "chcp 65001 >nul",
        "cls",

        `echo ${banner}`,
        `pushd "${folderPath}"`,
        
        `echo Compiling\: ^"${fileName}^" ==^> ^"${safeExeFile}^"...`,
        `gcc -finput-charset=UTF-8 "${fileName}" -o "${outputFile}" ${parameters}`,

        `echo Running ^"${safeExeFile}^"...`,
        `@echo on`,

        `"${outputFile}"`
    ];

    terminal.show(false);

    const cmd = commands.join(" && ");

    vscode.window.showInformationMessage(cmd,);
    terminal.sendText(cmd, true);
}

module.exports = main;